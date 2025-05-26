import { useState } from "react";
import { Calendar, ExternalLink, Users, Heart } from "lucide-react";
import Margin from "../../padrao/Margin";

// Componente para exibir as tags do canal
const ChannelTags = ({ tags }) => (
  <div className="flex flex-wrap gap-2 mt-3">
    {tags.map((tag, index) => (
      <span
        key={index}
        className="bg-purple-900 text-purple-200 text-xs px-2 py-1 rounded"
      >
        {tag}
      </span>
    ))}
  </div>
);

// Componente para a seção de informações do canal
const ChannelInfo = ({ channel }) => (
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
        <div className="flex items-center text-gray-400">
          <Users size={18} className="mr-2" />
          <span>Seja um de nós, seja um tigre!</span>
        </div>

        <div className="flex items-center text-gray-400">
          <Heart size={18} className="mr-2" />
          <span>A preferida da Mauá</span>
        </div>

        <div className="flex items-center text-gray-400">
          <Calendar size={18} className="mr-2" />
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
      className="mt-6 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
    >
      <ExternalLink size={18} className="mr-2" />
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
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <Margin horizontal="60px">
      <h1
        data-aos-delay="100"
        data-aos="fade-up"
        className="text-3xl text-center font-bold mb-15 text-azul-claro"
      >
        Twitch
      </h1>
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
        />

        <div className="w-full md:w-2/3 bg-black h-[500px] md:h-auto">
          <TwitchEmbed channel="mauaesports" />
        </div>
      </div>
    </Margin>
  );
};

export default Twitch;
