/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Calendar, ExternalLink, Users, Heart } from "lucide-react";
import Margin from "../../padrao/Margin";

// Componente para exibir as tags do canal
const ChannelTags = ({ tags }) => (
  <div className="flex flex-wrap gap-2 mt-3">
    {tags.map((tag, index) => (
      <span
        key={index}
        className="custom-tag bg-purple-900 text-purple-200 text-xs px-2 py-1 rounded"
      >
        {tag}
      </span>
    ))}
  </div>
);

// Componente para a seção de informações do canal
const ChannelInfo = ({ channel, streamStats, isLoading }) => (
  <div className="w-full md:w-1/3 p-6 bg-gray-800 flex flex-col justify-between">
    <div>
      <div className="flex items-center mb-4">
        <img
          src="../src/assets/images/Logo.svg"
          alt="MauaEsports avatar"
          className="w-16 h-16 rounded-full mr-4"
        />
        <div>
          <h2 className="text-2xl font-bold text-purple-500">Mauá Esports</h2>
          <p className="text-gray-400 text-sm">@mauaesports</p>
        </div>
      </div>

      <p className="text-gray-300 mb-6">
        Aqui tem jogo, entretenimento e muita interação com a comunidade.
        #GoTigers!
      </p>

      <div className="space-y-3">
        <div className="flex items-center text-gray-400 custom-icon-container">
          <Users size={18} className="mr-2 custom-icon" />
          <span>
            {isLoading
              ? "Carregando..."
              : streamStats?.isLive
              ? `${streamStats.viewers} espectadores agora`
              : "Offline"}
          </span>
        </div>

        <div className="flex items-center text-gray-400 custom-icon-container">
          <Heart size={18} className="mr-2 custom-icon" />
          <span>
            {isLoading
              ? "Carregando..."
              : `${streamStats?.followers || 0} seguidores`}
          </span>
        </div>

        <div className="flex items-center text-gray-400 custom-icon-container">
          <Calendar size={18} className="mr-2 custom-icon" />
          <span>Transmite campeonatos frequentemente</span>
        </div>

        <ChannelTags
          tags={["Português", "Entretenimento", "Esports", "Brasil"]}
        />
      </div>
    </div>

    <a
      href="https://www.twitch.tv/mauaesports"
      target="_blank"
      rel="noopener noreferrer"
      className="custom-button twitch-button mt-6 flex items-center justify-center"
    >
      <ExternalLink size={18} className="mr-2 custom-icon" />
      Acessar o Canal na Twitch
    </a>
  </div>
);

// Componente para o embed do Twitch (iframe)
const TwitchEmbed = ({ channel, isLive }) => {
  // Usar uma key única baseada no status da live para forçar recriação do iframe
  const key = `twitch-player-${isLive ? "live" : "offline"}-${Date.now()}`;

  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      {isLive ? (
        <iframe
          key={key}
          src={`https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}&autoplay=true`}
          frameBorder="0"
          allowFullScreen={true}
          scrolling="no"
          className="w-full h-full"
          title={`${channel} live stream`}
        />
      ) : (
        <div className="flex items-center justify-center text-gray-400 h-full">
          Não estamos em live no momento!
        </div>
      )}
    </div>
  );
};

// Componente Twitch
const Twitch = () => {
  const [streamStats, setStreamStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    let ws = null;

    const connectWebSocket = () => {
      ws = new WebSocket("ws://localhost:3009");

      ws.onopen = () => {
        console.log("WebSocket conectado");
        setWsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Dados recebidos via WebSocket:", data);
          setStreamStats(data);
          setIsLoading(false);
        } catch (err) {
          console.error("Erro ao processar mensagem do WebSocket:", err);
        }
      };

      ws.onerror = (error) => {
        console.error("Erro no WebSocket:", error);
        setError("Erro na conexão com o servidor");
        setWsConnected(false);
      };

      ws.onclose = () => {
        console.log(
          "WebSocket desconectado. Tentando reconectar em 5 segundos..."
        );
        setWsConnected(false);
        setTimeout(connectWebSocket, 5000);
      };
    };

    // Inicia a conexão WebSocket
    connectWebSocket();

    // Cleanup quando o componente for desmontado
    return () => {
      if (ws) {
        console.log("Fechando conexão WebSocket...");
        ws.close();
      }
    };
  }, []);

  return (
    <Margin horizontal="60px">
      <h1
        data-aos-delay="100"
        data-aos="fade-up"
        className="text-3xl text-center font-bold mb-15 text-azul-claro"
      >
        Twitch{" "}
      </h1>

      {error ? (
        <div className="text-center text-vermelho-claro">{error}</div>
      ) : (
        <div
          data-aos-delay="200"
          data-aos="fade-up"
          className="flex flex-col md:flex-row bg-fundo rounded-lg overflow-hidden"
        >
          <ChannelInfo
            channel={{
              name: "mauaesports",
              description:
                "Aqui tem jogo, entretenimento e muita interação com a comunidade. #GoTigers!",
              tags: ["Português", "Entretenimento", "Esports", "Brasil"],
            }}
            streamStats={streamStats}
            isLoading={isLoading}
          />

          <div className="w-full md:w-2/3 bg-black h-[500px] md:h-auto">
            <TwitchEmbed
              channel="apolityyyy"
              isLive={streamStats?.isLive || false}
            />
          </div>
        </div>
      )}
    </Margin>
  );
};

export default Twitch;
