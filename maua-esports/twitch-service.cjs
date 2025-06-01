// twitch-service.js
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const WebSocket = require("ws");

const app = express();

// Configuração do CORS mais segura
app.use(
  cors({
    origin: "*", // Permite todas as origens em desenvolvimento
    methods: ["GET"],
    allowedHeaders: ["Content-Type", "Accept"],
    credentials: false,
  })
);

// Middleware para garantir que todas as respostas tenham o header Content-Type correto
app.use((req, res, next) => {
  res.header("Content-Type", "application/json");
  next();
});

// Verificar se as credenciais existem
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
  console.error(
    "Erro: TWITCH_CLIENT_ID e TWITCH_CLIENT_SECRET são obrigatórios."
  );
  console.error("Por favor, crie um arquivo .env com as seguintes variáveis:");
  console.error("TWITCH_CLIENT_ID=seu_client_id_aqui");
  console.error("TWITCH_CLIENT_SECRET=seu_client_secret_aqui");
  process.exit(1);
}

const CHANNEL_NAME = "apolityyyy";

// Cache dos dados
let cachedData = {
  followers: 0,
  viewers: 0,
  lastUpdated: null,
  isLive: false,
};

let accessToken = null;
let tokenExpiresAt = null;

// Array para armazenar todas as conexões WebSocket ativas
let wsClients = new Set();

// Função para verificar se o token expirou
function isTokenExpired() {
  return !tokenExpiresAt || Date.now() >= tokenExpiresAt;
}

// Função para enviar dados atualizados para todos os clientes WebSocket
function broadcastUpdate(data) {
  const message = JSON.stringify(data);
  wsClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Função para obter o token de acesso
async function getAccessToken() {
  try {
    console.log("Obtendo novo token de acesso...");
    const response = await axios.post(
      `https://id.twitch.tv/oauth2/token`,
      null,
      {
        params: {
          client_id: TWITCH_CLIENT_ID,
          client_secret: TWITCH_CLIENT_SECRET,
          grant_type: "client_credentials",
        },
      }
    );

    accessToken = response.data.access_token;
    tokenExpiresAt =
      Date.now() + response.data.expires_in * 1000 - 24 * 60 * 60 * 1000;
    console.log("Novo token obtido com sucesso!");
    return accessToken;
  } catch (error) {
    console.error(
      "Erro ao obter token:",
      error.response?.data || error.message
    );
    throw new Error("Falha na autenticação com a Twitch");
  }
}

// Função para atualizar os dados do cache
async function updateCache() {
  try {
    if (!accessToken || isTokenExpired()) {
      await getAccessToken();
    }

    const headers = {
      "Client-ID": TWITCH_CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
    };

    console.log("Buscando dados do canal:", CHANNEL_NAME);

    const userResponse = await axios.get(
      `https://api.twitch.tv/helix/users?login=${CHANNEL_NAME}`,
      { headers }
    );

    if (!userResponse.data.data.length) {
      throw new Error("Canal não encontrado");
    }

    const userId = userResponse.data.data[0].id;
    console.log("ID do canal obtido:", userId);

    const [followersResponse, streamResponse] = await Promise.all([
      axios.get(
        `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${userId}`,
        { headers }
      ),
      axios.get(`https://api.twitch.tv/helix/streams?user_id=${userId}`, {
        headers,
      }),
    ]);

    const newData = {
      followers: followersResponse.data.total,
      viewers: streamResponse.data.data[0]?.viewer_count || 0,
      isLive: streamResponse.data.data.length > 0,
      lastUpdated: new Date().toISOString(),
    };

    // Verifica se os dados mudaram antes de fazer broadcast
    if (JSON.stringify(newData) !== JSON.stringify(cachedData)) {
      cachedData = newData;
      console.log("Dados atualizados:", cachedData);
      broadcastUpdate(cachedData);
    }
  } catch (error) {
    console.error(
      "Erro ao atualizar cache:",
      error.response?.data || error.message
    );

    if (error.response?.status === 401) {
      console.log("Token expirado, será renovado na próxima tentativa");
      accessToken = null;
      tokenExpiresAt = null;
    }
  }
}

// Atualizar cache a cada 30 segundos
const CACHE_UPDATE_INTERVAL = 15 * 1000;
setInterval(updateCache, CACHE_UPDATE_INTERVAL);

// Primeira atualização
console.log("Iniciando primeira atualização de dados...");
updateCache().catch(console.error);

// Middleware para verificar se temos dados no cache
const checkCache = (req, res, next) => {
  if (!cachedData.lastUpdated) {
    return res.status(503).json({
      error: "Dados ainda não disponíveis, tente novamente em alguns segundos",
    });
  }
  next();
};

// Endpoint para obter os dados
app.get("/api/twitch/stats/:channel", checkCache, (req, res) => {
  if (req.params.channel.toLowerCase() !== CHANNEL_NAME.toLowerCase()) {
    return res.status(404).json({ error: "Canal não encontrado" });
  }

  res.json({
    ...cachedData,
    channel: CHANNEL_NAME,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Erro não tratado:", err);
  res.status(500).json({ error: "Erro interno do servidor" });
});

const PORT = process.env.PORT || 3009;
const server = app.listen(PORT, () => {
  console.log(`Servidor HTTP rodando na porta ${PORT}`);
});

// Configuração do WebSocket Server
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("Nova conexão WebSocket estabelecida");

  // Adiciona o cliente à lista de conexões
  wsClients.add(ws);

  // Envia os dados atuais imediatamente
  if (cachedData.lastUpdated) {
    ws.send(JSON.stringify(cachedData));
  }

  // Remove o cliente quando a conexão for fechada
  ws.on("close", () => {
    console.log("Conexão WebSocket fechada");
    wsClients.delete(ws);
  });
});

console.log(`WebSocket Server rodando em ws://localhost:${PORT}`);
