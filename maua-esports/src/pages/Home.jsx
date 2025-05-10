import Espaco from '../components/padrao/Espaco';
import Apresentacao from '../components/home/s1Apresentacao/Apresentacao';
import Twitch from '../components/home/s4Twitch/Twitch';
import CardLayout from '../components/home/s3Cards/CardLayout';
import Novidade from '../components/home/Novidade';

const Home = () => {
    return (
        <div className="bg-[#0D1117]">
            <div className="bg-[#010409] h-[104px]">.</div>
            <Espaco tamanho="80px" />
            <Apresentacao />
            <Espaco tamanho="80px" />
            <Twitch />
            <Espaco tamanho="80px" />
            <CardLayout />
            {/* <Espaco tamanho="80px" />
            <Novidade /> */}
            <Espaco tamanho="80px" />
        </div>
    );
};

export default Home;