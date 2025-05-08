import Margin from "../padrao/Margin";
import LogoHome from "../../assets/images/LogoHome.png";
import BtnApresentacao from "./BtnApresentacao";
import ApresentacaoIconesJogos from "./ApresentacaoIconesJogos"

const Apresentacao = () => {
    return (
        <div className="bg-fundo text-white">
            <Margin horizontal="60px">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between">

                    {/* Conteúdo textual - lado esquerdo */}
                    <div className="w-full lg:w-1/1 space-y-6 text-left lg:pr-8 py-8 lg:py-0">
                        <h4 className="text-3xl md:text-4xl font-bold mt-2">
                            <span className="text-white">Entidade</span>{' '}
                            <span className="text-azul-escuro">Mauá Esports</span>
                        </h4>

                        <p className="text-fonte-escura mb-3">
                            Fundada em 2018, a Mauá Esports é a entidade universitária oficial do Instituto Mauá de Tecnologia, dedicada a promover a cultura gamer e os esportes eletrônicos dentro do ambiente acadêmico. Nossa missão é integrar estudantes por meio da paixão pelos jogos, oferecendo oportunidades de desenvolvimento pessoal.
                        </p>
                        <p className="text-fonte-escura mb-7">
                            Além das equipes competitivas em diversos jogos, a Mauá Esports promove eventos regulares, como campeonatos internos, palestras e workshops, aberto a toda a comunidade acadêmica. Essas iniciativas visam não apenas entreter, mas também conectar jogadores, fomentar habilidades estratégicas e criar uma rede de networking entre alunos, ex-alunos e parceiros.
                        </p>

                        <div className="flex gap-5">
                            <BtnApresentacao btnName="Times" to="/times" />
                            <BtnApresentacao btnName="Campeonatos" to="/campeonatos" />
                        </div>

                        <div className="border-t border-gray-700"></div>
                        <ApresentacaoIconesJogos />
                    </div>

                    {/* Área da imagem - lado direito */}
                    <div className="w-full lg:w-1/2 flex justify-center lg:justify-end items-center">
                        <img src={LogoHome} alt="Logo Mauá Esports" className="w-full max-w-md object-contain" />
                    </div>

                </div>
            </Margin>
        </div>
    );
}

export default Apresentacao;