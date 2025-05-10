import { useState } from 'react';
import { Calendar, ExternalLink, Users, Heart } from 'lucide-react';
import Margin from '../../padrao/Margin';

// Componente para exibir as tags do canal
const ChannelTags = ({ tags }) => (
    <div className="flex flex-wrap gap-2 mt-3">
        {tags.map((tag, index) => (
            <span key={index} className="bg-purple-900 text-purple-200 text-xs px-2 py-1 rounded">
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
                    src="https://static-cdn.jtvnw.net/jtv_user_pictures/ea0fe422-84bd-4aee-9d10-fd4b0b3a7054-profile_image-70x70.png"
                    alt="Gaules avatar"
                    className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                    <h2 className="text-2xl font-bold text-purple-500">Gaules</h2>
                    <p className="text-gray-400 text-sm">@gaules</p>
                </div>
            </div>

            <p className="text-gray-300 mb-6">O maior canal de CS2 da Twitch! Aqui tem jogo, entretenimento e muita interação com a comunidade. #PartiuGaules</p>

            <div className="space-y-3">
                <div className="flex items-center text-gray-400">
                    <Users size={18} className="mr-2" />
                    <span>45.7K espectadores agora</span>
                </div>

                <div className="flex items-center text-gray-400">
                    <Heart size={18} className="mr-2" />
                    <span>6.2M seguidores</span>
                </div>

                <div className="flex items-center text-gray-400">
                    <Calendar size={18} className="mr-2" />
                    <span>Transmite diariamente das 10h às 22h</span>
                </div>

                <ChannelTags tags={["Português", "CS2", "Entretenimento", "Esports", "Brasil"]} />
            </div>
        </div>

        <a
            href="https://www.twitch.tv/gaules"
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
            <h1 data-aos-delay="100" data-aos="fade-up" className='text-3xl text-center font-bold mb-15 text-azul-claro'>Twitch</h1>
            <div data-aos-delay="200" data-aos="fade-up" className="flex flex-col md:flex-row bg-fundo rounded-lg overflow-hidden">
                <ChannelInfo channel={{
                    name: "Gaules",
                    description: "O maior canal de CS2 da Twitch! Aqui tem jogo, entretenimento e muita interação com a comunidade. #PartiuGaules",
                    viewers: "45.7K",
                    followers: "6.2M",
                    schedule: "Transmite diariamente das 10h às 22h",
                    tags: ["Português", "CS2", "Entretenimento", "Esports", "Brasil"]
                }} />

                <div className="w-full md:w-2/3 bg-black h-[500px] md:h-auto">
                    <TwitchEmbed channel="gaules" />
                </div>
            </div>
        </Margin>
    );
};

export default Twitch;