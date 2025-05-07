import Margin from "../padrao/Margin";
import LogoHome from "../../assets/images/LogoHome.png";
import BtnApresentacao from "./BtnApresentacao";
import { BsInstagram, BsTwitch, BsDiscord, BsYoutube } from "react-icons/bs";

const Apresentacao = () => {
  return (
    <div className="bg-fundo text-white">
      <Margin horizontal="60px">
        <div className="flex flex-col lg:flex-row items-center gap-40">
          {/* Conteúdo textual - lado esquerdo */}
          <div className="space-y-6 text-left">
            {/* <h2 className="text-4xl font-bold mb-5">Bem Vindo</h2> */}
            <h4 className="text-3xl md:text-4xl font-bold mt-2">
              <span className="text-white">Entidade</span>{" "}
              <span className="text-azul-escuro">Mauá Esports</span>
            </h4>

            <p className="text-fonte-escura mb-3">
              Fundada em 2018, a Mauá Esports é uma entidade universitária
              oficial do Instituto Mauá de Tecnologia dedicada a fomentar a
              cultura gamer e os esportes eletrônicos dentro do ambiente
              acadêmico.
            </p>
            <p className="text-fonte-escura mb-3">
              Nossa missão é unir estudantes através dos jogos eletrônicos,
              proporcionando desenvolvimento pessoal e profissional, além de
              representar a instituição em competições regionais e nacionais.
            </p>
            <p className="text-fonte-escura mb-7">
              Contamos com equipes em diversos jogos e promovemos eventos
              regulares abertos a toda comunidade acadêmica.
            </p>

            <div className="flex gap-10">
              <BtnApresentacao btnName="Membros" />
              <BtnApresentacao btnName="Campeonatos" />
            </div>

            <div className="border-t border-gray-700"></div>

            {/* Botoes jogos */}
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/esportsmaua"
                className="hover:text-azul-escuro transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BsInstagram size={20} />
              </a>
              <a
                href="https://www.twitch.tv/mauaesports"
                className="hover:text-azul-escuro transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BsTwitch size={20} />
              </a>
              <a
                href="https://discord.com/invite/Av5EA6QfdR"
                className="hover:text-azul-escuro transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BsDiscord size={20} />
              </a>
              <a
                href="https://www.youtube.com/mauaesports"
                className="hover:text-azul-escuro transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BsYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Área da imagem - lado direito */}
          <div>
            <img src={LogoHome} alt="Logo Mauá Esports" className="w-140" />
          </div>
        </div>
      </Margin>
    </div>
  );
};

export default Apresentacao;
