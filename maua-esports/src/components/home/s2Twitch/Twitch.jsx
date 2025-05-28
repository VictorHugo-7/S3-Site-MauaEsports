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
            {isLoading ? (
              "Carregando..."
            ) : (
              streamStats?.isLive ? (
                `${streamStats.viewers} espectadores agora`
              ) : (
                "Offline"
              )
            )}
          </span>
        </div>

        <div className="flex items-center text-gray-400 custom-icon-container">
          <Heart size={18} className="mr-2 custom-icon" />
          <span>
            {isLoading ? (
              "Carregando..."
            ) : (
              `${streamStats?.followers || 0} seguidores`
            )}
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
const TwitchEmbed = ({ channel }) => (
  <div className="w-full h-full bg-black flex items-center justify-center">
    <iframe
      src={`https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}&autoplay=true`}
      frameBorder="0"
      allowFullScreen={true}
      scrolling="no"
      className="w-full h-full"
      title={`${channel} live stream`}
    />
  </div>
);

// Componente Twitch
const Twitch = () => {
  const [streamStats, setStreamStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStreamStats = async () => {
      try {
        setError(null);
        console.log('Tentando conectar ao backend...');
        const response = await fetch('http://localhost:3009/api/twitch/stats/apolityyyy', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        console.log('Status da resposta:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Falha ao carregar dados da Twitch');
        }
        
        const data = await response.json();
        console.log('Dados recebidos:', data);
        setStreamStats(data);
      } catch (error) {
        console.error('Erro detalhado ao buscar dados da Twitch:', {
          message: error.message,
          stack: error.stack,
        });
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreamStats();
    const interval = setInterval(fetchStreamStats, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Margin horizontal="60px">
      <h1
        data-aos-delay="100"
        data-aos="fade-up"
        className="text-3xl text-center font-bold mb-15 text-azul-claro"
      >
        Twitch
      </h1>
      {error ? (
        <div className="text-center text-vermelho-claro">
          {error}
        </div>
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
            <TwitchEmbed channel="mauaesports" />
          </div>
        </div>
      )}
    </Margin>
  );
};

export default Twitch;
