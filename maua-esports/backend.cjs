const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const multer = require("multer");
const path = require("path");
const axios = require("axios");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const router = express.Router();

require("dotenv").config();
app.use(express.json());
// Configuração EXTENDIDA do CORS
// Configuração EXTENDIDA do CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Adicione PATCH aqui
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Middleware para headers manuais (como fallback)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

async function conectarAoMongoDB() {
  const url = process.env.NODE_ENV === 'test'
    ? process.env.MONGO_TEST_URL
    : process.env.MONGO_URL;

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

// Configuração do Multer
const storage = multer.memoryStorage(); // Armazena na memória (para MongoDB)
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|svg/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Apenas imagens são permitidas (jpeg, jpg, png, svg)"));
  },
});

///////////////////////////////////////////////////////////////////////////////AREA DE JOGADORES ////////////////////////////////////////////////////////////////////

const jogadorSchema = mongoose.Schema({
  nome: { type: String, required: true },
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  foto: {
    data: Buffer,
    contentType: String,
    nomeOriginal: String,
  },

  insta: { type: String },
  twitter: { type: String },
  twitch: { type: String },

  time: {
    type: Number,
    ref: "Time",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Jogador = mongoose.model("Jogador", jogadorSchema);

const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: String,
  gameName: String,
  startDate: Date,
  firstPrize: String,
  secondPrize: String,
  thirdPrize: String,
  registrationLink: String,
  teamPosition: String,
  performanceDescription: String,
  status: {
    type: String,
    enum: ["campeonatos", "inscricoes", "passados"],
    default: "campeonatos",
  },
  // Imagens como buffers
  image: {
    data: Buffer,
    contentType: String,
    nomeOriginal: String,
  },
  gameIcon: {
    data: Buffer,
    contentType: String,
    nomeOriginal: String,
  },
  organizerImage: {
    data: Buffer,
    contentType: String,
    nomeOriginal: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Tournament = mongoose.model("Tournament", tournamentSchema);

const rankingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // Imagens como buffers
  image: {
    data: Buffer,
    contentType: String,
    nomeOriginal: String,
  },
});

const Ranking = mongoose.model("Ranking", rankingSchema);

const usuarioSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        // Regex para o formato específico: XX.XXXXX-Y@maua.br OU esports@maua.br
        const emailRegex = /^([0-9]{2}\.[0-9]{5}-[0-9]{1}|esports)@maua\.br$/;
        return emailRegex.test(v);
      },
      message: props => `${props.value} não é um email válido! O formato deve ser XX.XXXXX-Y@maua.br (ex: 24.00086-8@maua.br)`
    },
  },
  discordID: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    validate: {
      validator: function (v) {
        if (!v) return true;
        return /^\d{18}$/.test(v);
      },
      message: (props) =>
        `${props.value} não é um Discord ID válido! Deve ser exatamente 18 dígitos ou vazio.`,
    },
  },
  fotoPerfil: {
    data: { type: Buffer, required: false },
    contentType: { type: String, required: false },
    nomeOriginal: { type: String, required: false },
  },
  tipoUsuario: {
    type: String,
    required: true,
    enum: [
      "Administrador Geral",
      "Administrador",
      "Capitão de time",
      "Jogador",
    ],
    default: "Jogador",
  },
  time: {
    type: String,
    required: false, // Campo opcional
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

usuarioSchema.plugin(uniqueValidator, {
  message: "O {PATH} {VALUE} já está em uso.",
});
const Usuario = mongoose.model("Usuario", usuarioSchema);

///////////////////////////////////////////////////////////////////////////////AREA DE USUÁRIOS ////////////////////////////////////////////////////////////////////
app.post("/usuarios", upload.single("fotoPerfil"), async (req, res) => {
  try {
    const { email, discordID, tipoUsuario, time } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email é obrigatório",
      });
    }

    const usuarioData = {
      email,
      ...(discordID && { discordID }),
      tipoUsuario: tipoUsuario?.trim() || "Jogador",
      ...(time && { time }), 
      ...(req.file && {
        fotoPerfil: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
          nomeOriginal: req.file.originalname,
        },
      }),
    };

    const novoUsuario = new Usuario(usuarioData);
    await novoUsuario.save();

    res.status(201).json({
      success: true,
      usuario: {
        _id: novoUsuario._id,
        email: novoUsuario.email,
        ...(novoUsuario.discordID && { discordID: novoUsuario.discordID }),
        tipoUsuario: novoUsuario.tipoUsuario,
        ...(novoUsuario.time && { time: novoUsuario.time }), 
        createdAt: novoUsuario.createdAt,
      },
      message: "Usuário criado com sucesso",
    });
  } 
  catch (error) {
    console.error("Erro ao criar usuário:", error);

 
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    // No bloco catch da rota POST /usuarios
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email já está em uso"
      });
    }

    res.status(500).json({ success: false, message: "Erro interno do servidor" });
  }
});

app.get("/usuarios/verificar-email", async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email é obrigatório na query",
      });
    }

    const usuarioExiste = await Usuario.exists({ email });

    if (!usuarioExiste) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    res.status(200).json({
      success: true,
      message: "Usuário encontrado",
      data: { _id: usuarioExiste._id },
    });
  } catch (error) {
    console.error("Erro ao verificar email:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao verificar email",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
app.get('/usuarios/por-discord-ids', async (req, res) => {
  try {
    // Recebe os IDs como query parameter (ex: ?ids=123,456,789)
    const idsString = req.query.ids;
    
    if (!idsString) {
      return res.status(400).json({ 
        success: false, 
        message: "Parâmetro 'ids' é obrigatório" 
      });
    }

    // Converte a string de IDs para array
    const discordIds = idsString.split(',');
    
    // Verifica se há IDs válidos
    if (!discordIds.length || discordIds.some(id => !id.trim())) {
      return res.status(400).json({ 
        success: false, 
        message: "Lista de Discord IDs inválida" 
      });
    }

    const usuarios = await Usuario.find({ 
      discordID: { $in: discordIds } 
    }).select('email discordID');

    res.status(200).json(usuarios);
  } catch (error) {
    console.error("Erro ao buscar usuários por Discord IDs:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erro ao buscar usuários",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
// GET - Buscar usuário por email
app.get("/usuarios/por-email", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email é obrigatório",
      });
    }

    const usuario = await Usuario.findOne({ email }).select(
      "-fotoPerfil.data -__v"
    );

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    res.status(200).json({
      success: true,
      usuario: {
        ...usuario._doc,
        discordID: usuario.discordID || null,
        time: usuario.time || null, // Inclui time ou null
      },
    });
  } catch (error) {
    console.error("Erro ao buscar usuário por email:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar usuário",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
// GET - Buscar usuário por ID
app.get("/usuarios/:id", async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select(
      "-fotoPerfil.data -__v"
    );

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    res.status(200).json({
      success: true,
      data: usuario,
    });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar usuário",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

app.get("/usuarios/:id/foto", async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);

    if (!usuario || !usuario.fotoPerfil || !usuario.fotoPerfil.data) {
      return res.status(404).json({
        success: false,
        message: "Imagem não encontrada"
      });
    }

    res.set('Content-Type', usuario.fotoPerfil.contentType);
    res.send(usuario.fotoPerfil.data);
  } catch (error) {
    console.error("Erro ao buscar foto:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao carregar imagem"
    });
  }
});
// GET - Listar todos os usuários
app.get("/usuarios", async (req, res) => {
  try {
    const usuarios = await Usuario.find()
      .select("-fotoPerfil.data -__v")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: usuarios.length,
      data: usuarios,
    });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar usuários",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

app.put("/usuarios/:id", upload.single("fotoPerfil"), async (req, res) => {
  try {
    const { removeFoto, ...updateData } = req.body;

    // Se foi solicitado para remover a foto
    if (removeFoto === "true") {
      updateData.fotoPerfil = null;
    }
    // Se foi enviada uma nova foto
    else if (req.file) {
      updateData.fotoPerfil = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        nomeOriginal: req.file.originalname,
      };
    }

    const usuario = await Usuario.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-fotoPerfil.data -__v");

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    res.status(200).json({
      success: true,
      data: usuario,
      message: "Usuário atualizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);

    // Captura erros de validação do Mongoose (incluindo unique)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ 
        success: false, 
        message: messages.join(', ') 
      });
    }

    // Trata erros de duplicidade (unique)
    if (error.code === 11000) {
      if (error.keyValue.email) {
        return res.status(400).json({
          success: false,
          message: "Email já está em uso"
        });
      }
      if (error.keyValue.discordID) {
        return res.status(400).json({
          success: false,
          message: "Discord ID já está em uso"
        });
      }
    }

    res.status(500).json({ 
      success: false, 
      message: "Erro ao atualizar usuário",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// DELETE - Remover usuário
app.delete("/usuarios/:id", async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    res.status(200).json({
      success: true,
      data: { _id: usuario._id },
      message: "Usuário removido com sucesso",
    });
  } catch (error) {
    console.error("Erro ao remover usuário:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao remover usuário",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});




///////////////////////////////////////////////AREA DE RAANKING/////////////////////////////////////////////////////////////////
// POST - Criar novo ranking com upload de imagem
app.post("/rankings", upload.single("image"), async (req, res) => {
  try {
    const { name } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "A imagem é obrigatória" });
    }

    const newRanking = new Ranking({
      name,
      image: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        nomeOriginal: req.file.originalname,
      },
    });

    const savedRanking = await newRanking.save();

    // Retorna o ranking sem os dados binários da imagem
    res.status(201).json({
      _id: savedRanking._id,
      name: savedRanking.name,
      imageUrl: `/rankings/${savedRanking._id}/image`,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar ranking", error });
  }
});

app.get("/rankings/:id/image", async (req, res) => {
  try {
    const ranking = await Ranking.findById(req.params.id);
    if (!ranking || !ranking.image || !ranking.image.data) {
      return res.status(404).json({ message: "Imagem não encontrada" });
    }
    res.set("Content-Type", ranking.image.contentType);
    res.set("Cache-Control", "public, max-age=31536000"); // Cache por 1 ano
    res.send(ranking.image.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/rankings", async (req, res) => {
  try {
    const rankings = await Ranking.find();

    const rankingsWithBase64 = rankings.map((ranking) => ({
      ...ranking._doc,
      imageData: ranking.image.data.toString("base64"),
      imageType: ranking.image.contentType,
    }));

    res.status(200).json(rankingsWithBase64);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar rankings", error });
  }
});

/////////////////////////////////////////////////////////////////////////// AREA DE JOGADORES ////////////////////////////////////////////////////////////////////////////////////

app.post("/jogadores", upload.single("foto"), async (req, res) => {
  try {
    const { nome, titulo, descricao, insta, twitter, twitch, time } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "A foto é obrigatória" });
    }

    const novoJogador = new Jogador({
      nome,
      titulo,
      descricao,
      foto: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        nomeOriginal: req.file.originalname,
      },
      insta: insta || null,
      twitter: twitter || null,
      twitch: twitch || null,
      time,
    });

    await novoJogador.save();

    // Retorna todos os campos, incluindo redes sociais
    res.status(201).json({
      _id: novoJogador._id,
      nome: novoJogador.nome,
      titulo: novoJogador.titulo,
      descricao: novoJogador.descricao,
      insta: novoJogador.insta,
      twitter: novoJogador.twitter,
      twitch: novoJogador.twitch,
      time: novoJogador.time,
      createdAt: novoJogador.createdAt,
      message: "Jogador criado com sucesso",
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar jogador", error });
  }
});
app.get("/jogadores/:id/imagem", async (req, res) => {
  try {
    const jogador = await Jogador.findById(req.params.id);

    if (!jogador || !jogador.foto || !jogador.foto.data) {
      return res.status(404).json({ message: "Imagem não encontrada" });
    }

    res.set("Content-Type", jogador.foto.contentType);
    res.send(jogador.foto.data);
  } catch (error) {
    console.error("Erro ao criar jogador:", error);

    // Tratamento de erros específicos (igual ao PUT)
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Erro de validação",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }

    if (error.code === 11000) {
      const campo = Object.keys(error.keyPattern)[0];
      const valor = error.keyValue[campo];
      return res.status(400).json({
        message: `${campo} "${valor}" já está em uso`,
        campo: campo,
      });
    }

    res.status(500).json({ 
      message: "Erro ao criar jogador",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});



app.get("/jogadores", async (req, res) => {
  try {
    const jogadores = await Jogador.find().lean(); // .lean() para objetos JS simples

    // Busca manual dos times
    const times = await Time.find({
      id: { $in: jogadores.map((j) => j.time) },
    });

    const timesMap = times.reduce((acc, time) => {
      acc[time.id] = time;
      return acc;
    }, {});

    const resultado = jogadores.map((jogador) => ({
      ...jogador,
      time: timesMap[jogador.time] || null,
    }));

    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({
      message: "Erro ao buscar jogadores",
      error: error.message,
    });
  }
});

app.delete("/jogadores/:id", async (req, res) => {
  try {
    const jogadorRemovido = await Jogador.findByIdAndDelete(req.params.id);

    if (!jogadorRemovido) {
      return res.status(404).json({ message: "Jogador não encontrado" });
    }

    res.status(200).json({
      message: "Jogador removido com sucesso",
      id: jogadorRemovido._id,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao remover jogador", error });
  }
});



app.put("/jogadores/:id", upload.single("foto"), async (req, res) => {
  try {
    // Extrai os dados do corpo da requisição
    const { nome, titulo, descricao, insta, twitter, twitch } = req.body;

    // Verifica campos obrigatórios
    if (!nome || !titulo || !descricao) {
      return res.status(400).json({
        message: "Nome, título e descrição são obrigatórios",
      });
    }

    // Prepara os dados para atualização
    const updateData = {
      nome,
      titulo,
      descricao,
      insta: insta || undefined,
      twitter: twitter || undefined,
      twitch: twitch || undefined,
    };

    // Se uma nova imagem foi enviada
    if (req.file) {
      updateData.foto = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        nomeOriginal: req.file.originalname,
      };
    }

    // Atualiza no banco de dados
    const jogadorAtualizado = await Jogador.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-foto.data -__v"); // Remove dados binários da imagem e versão

    if (!jogadorAtualizado) {
      return res.status(404).json({
        message: "Jogador não encontrado",
      });
    }

    // Resposta com os dados atualizados
    res.status(200).json({
      message: "Jogador atualizado com sucesso",
      data: jogadorAtualizado,
    });
  } catch (error) {
    console.error("Erro ao atualizar jogador:", error);

    // Tratamento de erros específicos
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Erro de validação",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }

    if (error.code === 11000) {
      const campo = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `Erro: ${campo} já está em uso`,
        campo: campo,
      });
    }

    res.status(500).json({
      message: "Erro interno no servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

///////////////////////////////////////////////////////////////////////////////AREA DE TIMES ////////////////////////////////////////////////////////////////////////////////////

const timeSchema = mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  nome: { type: String, required: true, unique: true },
  foto: {
    data: Buffer,
    contentType: String,
    nomeOriginal: String,
  },
  jogo: {
    data: Buffer,
    contentType: String,
    nomeOriginal: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Time = mongoose.model("Time", timeSchema);

// Rota para buscar time por ID numérico
app.get("/times/:id", async (req, res) => {
  try {
    const timeId = parseInt(req.params.id);
    const time = await Time.findOne({ id: timeId })
      .select("-foto.data -jogo.data -__v")
      .lean();

    if (!time) {
      return res
        .status(404)
        .json({ success: false, message: "Time não encontrado" });
    }

    // Adiciona a URL da logo ao objeto do time
    const timeComLogo = {
      ...time,
      logoUrl: `${req.protocol}://${req.get("host")}/times/${timeId}/logo`,
    };

    res.status(200).json(timeComLogo);
  } catch (error) {
    console.error("Erro ao buscar time:", error);
    res.status(500).json({ success: false, message: "Erro ao buscar time" });
  }
});
// Rota para servir a logo do time
app.get("/times/:id/logo", async (req, res) => {
  try {
    const timeId = parseInt(req.params.id);
    const time = await Time.findOne({ id: timeId });

    if (!time || !time.jogo || !time.jogo.data) {
      return res.status(404).send("Logo não encontrada");
    }

    res.set("Content-Type", time.jogo.contentType);
    res.send(time.jogo.data);
  } catch (error) {
    console.error("Erro ao buscar logo do time:", error);
    res.status(500).send("Erro ao buscar logo");
  }
});
// Rota para buscar jogadores por time ID
app.get("/times/:id/jogadores", async (req, res) => {
  try {
    const timeId = parseInt(req.params.id);

    // DEBUG: Verifique no console do servidor
    console.log(`Buscando jogadores para time ID: ${timeId}`);

    const jogadores = await Jogador.find({ time: timeId })
      .select("-foto.data -__v")
      .lean();

    // Adiciona URL da foto para cada jogador
    const jogadoresComImagens = jogadores.map((jogador) => ({
      ...jogador,
      fotoUrl: `/jogadores/${jogador._id}/imagem`,
    }));

    res.status(200).json(jogadoresComImagens);
  } catch (error) {
    console.error("Erro ao buscar jogadores:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar jogadores do time",
    });
  }
});
// Rota para obter a foto do time
app.get("/times/:id/foto", async (req, res) => {
  try {
    const time = await Time.findOne({ id: req.params.id });

    if (!time || !time.foto || !time.foto.data) {
      return res.status(404).send("Imagem não encontrada");
    }

    res.set("Content-Type", time.foto.contentType);
    res.send(time.foto.data);
  } catch (error) {
    res.status(500).send("Erro ao carregar imagem");
  }
});

// Rota para obter o logo do jogo
app.get("/times/:id/jogo", async (req, res) => {
  try {
    const time = await Time.findOne({ id: req.params.id });

    if (!time || !time.jogo || !time.jogo.data) {
      return res.status(404).send("Imagem não encontrada");
    }

    res.set("Content-Type", time.jogo.contentType);
    res.send(time.jogo.data);
  } catch (error) {
    res.status(500).send("Erro ao carregar imagem");
  }
});

app.post(
  "/times",
  upload.fields([
    { name: "foto", maxCount: 1 },
    { name: "jogo", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id, nome } = req.body;
      const fotoFile = req.files["foto"][0];
      const jogoFile = req.files["jogo"][0];

      // Validações
      if (!id || !nome) {
        return res
          .status(400)
          .json({ message: "ID e nome são obrigatórios" });
      }
      if (!fotoFile || !jogoFile) {
        return res
          .status(400)
          .json({ message: "Foto do time e logo do jogo são obrigatórios" });
      }

      const novoTime = new Time({
        id,
        nome,
        foto: {
          data: fotoFile.buffer,
          contentType: fotoFile.mimetype,
          nomeOriginal: fotoFile.originalname,
        },
        jogo: {
          data: jogoFile.buffer,
          contentType: jogoFile.mimetype,
          nomeOriginal: jogoFile.originalname,
        },
      });

      await novoTime.save();
      res.status(201).json({
        id: novoTime.id,
        nome: novoTime.nome,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          message: "Erro: ID ou nome já existem",
          error: error.keyValue,
        });
      }
      res.status(500).json({ message: "Erro ao criar time", error });
    }
  }
);

app.get("/times", async (req, res) => {
  try {
    const times = await Time.find().select("-foto.data -jogo.data");
    res.status(200).json(times);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar times", error });
  }
});

app.delete("/admins/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validação robusta do ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Formato de ID inválido",
        receivedId: id,
        expectedFormat: "ObjectId (24 caracteres hexadecimais)",
      });
    }

    const result = await Admin.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Nenhum admin encontrado com este ID",
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro no backend:", {
      message: error.message,
      stack: error.stack,
      receivedId: req.params.id,
    });
    res.status(500).json({
      success: false,
      message: "Erro interno no servidor",
    });
  }
});

app.put(
  "/times/:id",
  upload.fields([
    { name: "foto", maxCount: 1 },
    { name: "jogo", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { nome } = req.body;
      const updateData = { nome };
      const fotoFile = req.files?.["foto"]?.[0];
      const jogoFile = req.files?.["jogo"]?.[0];

      if (fotoFile) {
        updateData.foto = {
          data: fotoFile.buffer,
          contentType: fotoFile.mimetype,
          nomeOriginal: fotoFile.originalname,
        };
      }

      if (jogoFile) {
        updateData.jogo = {
          data: jogoFile.buffer,
          contentType: jogoFile.mimetype,
          nomeOriginal: jogoFile.originalname,
        };
      }

      const timeAtualizado = await Time.findOneAndUpdate(
        { id: req.params.id },
        updateData,
        { new: true }
      ).select("-foto.data -jogo.data");

      if (!timeAtualizado) {
        return res.status(404).json({ message: "Time não encontrado" });
      }

      res.status(200).json(timeAtualizado);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          message: "Erro: Nome já existe",
          error: error.keyValue,
        });
      }
      res.status(500).json({ message: "Erro ao atualizar time", error });
    }
  }
);

app.delete("/times/:id", async (req, res) => {
  try {
    // Verifica se existem jogadores associados
    const jogadoresDoTime = await Jogador.countDocuments({
      "time.id": parseInt(req.params.id),
    });

    if (jogadoresDoTime > 0) {
      return res.status(400).json({
        message:
          "Não é possível excluir o time pois existem jogadores associados",
      });
    }

    const timeRemovido = await Time.findOneAndDelete({ id: req.params.id });

    if (!timeRemovido) {
      return res.status(404).json({ message: "Time não encontrado" });
    }

    res.status(200).json({
      message: "Time removido com sucesso",
      id: timeRemovido.id,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao remover time", error });
  }
});

///////////////////////////////////////////////////////////////CAMPEONATOS///////////////////////////////////////////////////////////////////////////////////////

const campUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|svg/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Apenas imagens são permitidas (jpeg, jpg, png, svg)"));
  },
}).fields([
  { name: "image", maxCount: 1 }, // Imagem principal
  { name: "gameIcon", maxCount: 1 }, // Ícone do jogo
  { name: "organizerImage", maxCount: 1 }, // Logo do organizador
]);

// Criar campeonato com upload de imagens
app.post("/campeonatos", (req, res) => {
  campUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const {
        name,
        description,
        price,
        gameName,
        startDate,
        firstPrize,
        secondPrize,
        thirdPrize,
        registrationLink,
        teamPosition,
        performanceDescription,
        status,
      } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ error: "Nome do campeonato é obrigatório" });
      }

      const tournamentData = {
        name,
        description,
        price,
        gameName,
        startDate: startDate ? new Date(startDate) : null,
        firstPrize,
        secondPrize,
        thirdPrize,
        registrationLink,
        teamPosition,
        performanceDescription,
        status: status || "campeonatos",
      };

      // Processar imagens
      if (req.files) {
        if (req.files["image"]) {
          tournamentData.image = {
            data: req.files["image"][0].buffer,
            contentType: req.files["image"][0].mimetype,
            nomeOriginal: req.files["image"][0].originalname,
          };
        }
        if (req.files["gameIcon"]) {
          tournamentData.gameIcon = {
            data: req.files["gameIcon"][0].buffer,
            contentType: req.files["gameIcon"][0].mimetype,
            nomeOriginal: req.files["gameIcon"][0].originalname,
          };
        }
        if (req.files["organizerImage"]) {
          tournamentData.organizerImage = {
            data: req.files["organizerImage"][0].buffer,
            contentType: req.files["organizerImage"][0].mimetype,
            nomeOriginal: req.files["organizerImage"][0].originalname,
          };
        }
      }

      const newTournament = new Tournament(tournamentData);
      await newTournament.save();

      res.status(201).json({
        ...newTournament.toObject(),
        image: undefined,
        gameIcon: undefined,
        organizerImage: undefined,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
});

// Atualizar campeonato com imagens
app.put("/campeonatos/:id", (req, res) => {
  campUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const updateData = { ...req.body };

      // Processar imagens
      if (req.files) {
        if (req.files["image"]) {
          updateData.image = {
            data: req.files["image"][0].buffer,
            contentType: req.files["image"][0].mimetype,
            nomeOriginal: req.files["image"][0].originalname,
          };
        }
        if (req.files["gameIcon"]) {
          updateData.gameIcon = {
            data: req.files["gameIcon"][0].buffer,
            contentType: req.files["gameIcon"][0].mimetype,
            nomeOriginal: req.files["gameIcon"][0].originalname,
          };
        }
        if (req.files["organizerImage"]) {
          updateData.organizerImage = {
            data: req.files["organizerImage"][0].buffer,
            contentType: req.files["organizerImage"][0].mimetype,
            nomeOriginal: req.files["organizerImage"][0].originalname,
          };
        }
      }

      const tournament = await Tournament.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      ).select("-image.data -gameIcon.data -organizerImage.data");

      if (!tournament) {
        return res.status(404).json({ error: "Campeonato não encontrado" });
      }

      res.json(tournament);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
});

// Rotas para servir imagens
app.get("/campeonatos/:id/image", async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament || !tournament.image || !tournament.image.data) {
      return res.status(404).send("Imagem não encontrada");
    }
    res.set("Content-Type", tournament.image.contentType);
    res.send(tournament.image.data);
  } catch (error) {
    res.status(500).send("Erro ao carregar imagem");
  }
});

app.get("/campeonatos/:id/gameIcon", async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament || !tournament.gameIcon || !tournament.gameIcon.data) {
      return res.status(404).send("Ícone do jogo não encontrado");
    }
    res.set("Content-Type", tournament.gameIcon.contentType);
    res.send(tournament.gameIcon.data);
  } catch (error) {
    res.status(500).send("Erro ao carregar ícone do jogo");
  }
});

app.get("/campeonatos/:id/organizerImage", async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (
      !tournament ||
      !tournament.organizerImage ||
      !tournament.organizerImage.data
    ) {
      return res.status(404).send("Imagem do organizador não encontrada");
    }
    res.set("Content-Type", tournament.organizerImage.contentType);
    res.send(tournament.organizerImage.data);
  } catch (error) {
    res.status(500).send("Erro ao carregar imagem do organizador");
  }
});

// Obter campeonato sem dados binários das imagens
app.get("/campeonatos/:id", async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id).select(
      "-image.data -gameIcon.data -organizerImage.data"
    );

    if (!tournament) {
      return res.status(404).json({ error: "Campeonato não encontrado" });
    }

    // Adiciona URLs para as imagens
    const result = tournament.toObject();
    result.imageUrl = `/campeonatos/${tournament._id}/image`;
    result.gameIconUrl = `/campeonatos/${tournament._id}/gameIcon`;
    result.organizerImageUrl = `/campeonatos/${tournament._id}/organizerImage`;

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter todos os campeonatos (sem dados binários)
app.get("/campeonatos", async (req, res) => {
  try {
    const tournaments = await Tournament.find()
      .select("-image.data -gameIcon.data -organizerImage.data")
      .sort({ createdAt: -1 });

    // Adiciona URLs para as imagens
    const tournamentsWithUrls = tournaments.map((tournament) => {
      const result = tournament.toObject();
      result.imageUrl = `/campeonatos/${tournament._id}/image`;
      result.gameIconUrl = `/campeonatos/${tournament._id}/gameIcon`;
      result.organizerImageUrl = `/campeonatos/${tournament._id}/organizerImage`;
      return result;
    });

    // Organiza por status
    const boardData = {
      campeonatos: tournamentsWithUrls.filter(
        (t) => t.status === "campeonatos"
      ),
      inscricoes: tournamentsWithUrls.filter((t) => t.status === "inscricoes"),
      passados: tournamentsWithUrls.filter((t) => t.status === "passados"),
    };

    res.json(boardData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mover campeonato entre colunas (atualizar status)
app.patch("/campeonatos/:id/move", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["campeonatos", "inscricoes", "passados"].includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    const tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!tournament) {
      return res.status(404).json({ error: "Campeonato não encontrado" });
    }

    res.json(tournament);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar campeonato
app.delete("/campeonatos/:id", async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndDelete(req.params.id);

    if (!tournament) {
      return res.status(404).json({ error: "Campeonato não encontrado" });
    }

    // Aqui você pode adicionar lógica para remover imagens associadas se estiver armazenando localmente

    res.json({ message: "Campeonato removido com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

////////////////////////////////////////////////////////////////////////////////AREA DE ADMINISTRADORES ////////////////////////////////////////////////////////////////////
const adminSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  foto: {
    data: Buffer,
    contentType: String,
    nomeOriginal: String,
  },
  insta: { type: String },
  twitter: { type: String },
  twitch: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Admin = mongoose.model("Admin", adminSchema);

// Rota para listar todos os administradores
app.get("/admins", async (req, res) => {
  try {
    const admins = await Admin.find({})
      .select("-foto.data -__v") // Exclui os dados binários da foto e versão
      .sort({ createdAt: -1 }) // Ordena por mais recente primeiro
      .lean();

    // Adiciona a URL para acessar a foto de cada admin
    const adminsComFotoUrl = admins.map((admin) => ({
      ...admin,
      fotoUrl: admin.foto
        ? `${req.protocol}://${req.get("host")}/admins/${admin._id}/foto`
        : null,
    }));

    res.status(200).json(adminsComFotoUrl);
  } catch (error) {
    console.error("Erro ao buscar administradores:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao buscar administradores" });
  }
});

// Rota para servir a foto do admin
app.get("/admins/:id/foto", async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin || !admin.foto || !admin.foto.data) {
      return res.status(404).send("Foto não encontrada");
    }

    res.set("Content-Type", admin.foto.contentType);
    res.send(admin.foto.data);
  } catch (error) {
    console.error("Erro ao buscar foto do admin:", error);
    res.status(500).send("Erro ao buscar foto");
  }
});

// Rota para criar novo admin
app.post("/admins", upload.single("foto"), async (req, res) => {
  try {
    // Verifique se os campos estão vindo no body ou no form-data
    const { nome, titulo, descricao, insta, twitter, twitch } = req.body;
    const fotoFile = req.file; // Agora usando req.file do multer

    // Validação mais robusta
    const camposFaltantes = [];
    if (!nome?.trim()) camposFaltantes.push("nome");
    if (!titulo?.trim()) camposFaltantes.push("título");
    if (!descricao?.trim()) camposFaltantes.push("descrição");

    if (camposFaltantes.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Campos obrigatórios faltando: ${camposFaltantes.join(", ")}`,
        camposFaltantes,
      });
    }

    const adminData = {
      nome: nome.trim(),
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      insta: insta?.trim() || null,
      twitter: twitter?.trim() || null,
      twitch: twitch?.trim() || null,
    };

    // Processar foto se foi enviada
    if (fotoFile) {
      adminData.foto = {
        data: fotoFile.buffer, // Usando buffer do multer
        contentType: fotoFile.mimetype,
        nomeOriginal: fotoFile.originalname,
      };
    }

    const novoAdmin = await Admin.create(adminData);

    res.status(201).json({
      success: true,
      admin: {
        ...novoAdmin.toObject(),
        fotoUrl: `${req.protocol}://${req.get("host")}/admins/${novoAdmin._id
          }/foto`,
        foto: undefined,
      },
    });
  } catch (error) {
    console.error("Erro ao criar admin:", error);

    if (error.code === 11000) {
      const campo = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${campo} já está em uso`,
        campo,
      });
    }

    res.status(500).json({
      success: false,
      message: "Erro interno no servidor",
      error: error.message,
    });
  }
});

// Rota PUT (Edição)
app.put("/admins/:id", upload.single("foto"), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      nome: req.body.nome?.trim(),
      titulo: req.body.titulo?.trim(),
      descricao: req.body.descricao?.trim(),
      // Remova campos vazios em vez de definir como null
      ...(req.body.insta && { insta: req.body.insta.trim() }),
      ...(req.body.twitter && { twitter: req.body.twitter.trim() }),
      ...(req.body.twitch && { twitch: req.body.twitch.trim() }),
    };

    if (req.file) {
      updateData.foto = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    const updated = await Admin.findByIdAndUpdate(
      id,
      { $set: updateData }, // Use $set para atualização parcial
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Admin não encontrado" });
    }

    res.json({
      _id: updated._id,
      nome: updated.nome,
      titulo: updated.titulo,
      descricao: updated.descricao,
      insta: updated.insta || undefined, // Envie undefined em vez de null
      twitter: updated.twitter || undefined,
      twitch: updated.twitch || undefined,
      fotoUrl: `${req.protocol}://${req.get("host")}/admins/${updated._id
        }/foto`,
    });
  } catch (error) {
    console.error("Erro na edição:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/admins/:id/foto", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("ID inválido");
    }

    const admin = await Admin.findById(req.params.id);

    if (!admin || !admin.foto || !admin.foto.data) {
      // Retorna uma imagem padrão se não encontrar
      const defaultImage = path.join(__dirname, "path/para/imagem-padrao.jpg");
      return res.sendFile(defaultImage);
    }

    res.set("Content-Type", admin.foto.contentType);
    res.send(admin.foto.data);
  } catch (error) {
    console.error("Erro ao buscar foto:", error);
    res.status(500).send("Erro ao carregar imagem");
  }
});
/////////////////////////////////////////////////////////////////////    API   ///////////////////////////////////////////////////////////////////////////////////////////////

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== "Bearer frontendmauaesports") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

const PORT = process.env.PORT || 3001;

const trains = []; // Array vazio ou com dados de teste
const modality = [];

app.get('/trains/all', authenticate, (req, res) => {
  res.json(trains); // Retorna array vazio ou dados de teste
});
app.get('/modality/all', authenticate, (req, res) => {
  res.json(modality); // Retorna array vazio ou dados de teste
});

/////////////////////////////////////////////////////////////////////////  RELATORIOS  //////////////////////////////////////////////////////////////////////////////////////////////////

// Função auxiliar para obter o semestre atual
function getCurrentSemester() {
  const now = new Date();
  const year = now.getFullYear();
  return now.getMonth() < 6 ? `${year}.1` : `${year}.2`;
}

// Rota para gerar PDF
router.post("/api/generate-pdf-report", async (req, res) => {
  try {
    const { team } = req.body;

    // Crie o documento PDF
    const doc = new PDFDocument();

    // Configura o cabeçalho da resposta
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=relatorio_pae_${team}.pdf`
    );

    // Pipe do PDF para a resposta
    doc.pipe(res);

    // Adicione conteúdo ao PDF
    doc.fontSize(25).text(`Relatório PAE - ${team}`, { align: "center" });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Semestre: ${getCurrentSemester()}`, { align: "center" });
    doc.moveDown(2);

    // Adicione tabela de jogadores (exemplo)
    doc.fontSize(14).text("Jogadores e Horas:", { underline: true });
    doc.moveDown();

    // Aqui você deve adicionar os dados reais dos jogadores
    doc.fontSize(12).text("Jogador 1 - 45 horas (Experiente - Azul)");
    doc.text("Jogador 2 - 30 horas (Avançado - Ouro)");
    // ...

    // Finalize o PDF
    doc.end();
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    res.status(500).json({ error: "Erro ao gerar relatório PDF" });
  }
});

// Rota para gerar Excel
router.post("/api/generate-excel-report", async (req, res) => {
  try {
    const { team } = req.body;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Relatório PAE");

    // Adicione cabeçalhos
    worksheet.columns = [
      { header: "Jogador", key: "name", width: 30 },
      { header: "Horas", key: "hours", width: 15 },
      { header: "Rank", key: "rank", width: 25 },
    ];

    // Adicione dados (substitua pelos dados reais da sua aplicação)
    worksheet.addRow({
      name: "Jogador 1",
      hours: 45,
      rank: "Experiente (Azul)",
    });
    worksheet.addRow({
      name: "Jogador 2",
      hours: 28,
      rank: "Avançado (Ouro)",
    });

    // Configura o cabeçalho da resposta
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=relatorio_pae_${team}.xlsx`
    );

    // Envie o arquivo
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Erro ao gerar Excel:", error);
    res.status(500).json({ error: "Erro ao gerar relatório Excel" });
  }
});
/////////////////////////////////////////////////////////////////////////DISCORD API //////////////////////////////////////////////////////////////////////////////////////////////////

// Função para obter o discordID
async function getUserId(accessToken) {
  try {
    const response = await axios.get("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.id; // Retorna apenas o ID do usuário
  } catch (error) {
    console.error("Erro ao obter ID do usuário:", error.response?.data);
    throw error;
  }
}

// Endpoint para lidar com o callback do Discord
app.get("/auth/discord/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).send("Código de autorização não fornecido");
  }

  if (!state) {
    return res.status(400).send("State não fornecido");
  }

  let userId, returnUrl;
  try {
    // Decodificar e parsear o state
    const stateObj = JSON.parse(decodeURIComponent(state));
    userId = stateObj.userId;
    returnUrl = stateObj.returnUrl || "/"; // Fallback para a página inicial
  } catch (error) {
    console.error("Erro ao parsear state:", error);
    return res.status(400).send("State inválido");
  }

  if (!userId) {
    return res.status(400).send("UserId não fornecido");
  }

  try {
    // Trocar o code por access_token
    const tokenResponse = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: process.env.VITE_CLIENT_ID_DISCORD,
        client_secret: process.env.CLIENT_SECRET_DISCORD,
        grant_type: "authorization_code",
        code,
        redirect_uri: "http://localhost:3005/auth/discord/callback",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // Obter o discordID
    const discordID = await getUserId(access_token);

    // Atualizar o documento do usuário
    const usuario = await Usuario.findByIdAndUpdate(
      userId,
      { discordID },
      { new: true, runValidators: true }
    );

    if (!usuario) {
      return res.status(404).send("Usuário não encontrado");
    }

    // Redirecionar para a página original com discordLinked=true
    const redirectUrl = `http://localhost:5173${returnUrl}?discordLinked=true`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Erro no callback:", error.response?.data || error.message);
    res.status(500).send("Erro ao vincular conta");
  }
});


// Exporte o que os testes precisam
module.exports = {
  app,
  Usuario,
  Jogador,
  Time,
  Tournament,
  Admin,
  Ranking,
  mongoose
};

// Só inicia os servidores se NÃO estiver em ambiente de teste
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`CORS configurado para: http://localhost:5173`);
  });

  app.listen(3005, () => {
    console.log("Discord API rodando na porta 3005");
  });

  app.listen(3000, () => {
    try {
      conectarAoMongoDB();
      console.log("up and running");
    } catch (e) {
      console.log("Erro", e);
    }
  });
}
