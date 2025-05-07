import Espaco from "../components/padrao/Espaco";
import Apresentacao from "../components/home/Apresentacao";
import Twitch from "../components/home/Twitch";
import Parcerias from "../components/home/Parcerias";

const Home = () => {
  return (
    <div className="bg-[#0D1117]">
      <div className="bg-[#010409] h-[104px]">.</div>
      <Espaco tamanho="70px" />
      <Apresentacao />
      <Espaco tamanho="70px" />
      <Twitch />
      <Espaco tamanho="70px" />

      <Espaco tamanho="70px" />
    </div>
  );
};

export default Home;
