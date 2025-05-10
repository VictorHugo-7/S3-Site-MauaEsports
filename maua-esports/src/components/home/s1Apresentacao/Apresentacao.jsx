import { useState, useEffect } from "react";
import Margin from "../../padrao/Margin";
import { Link } from "react-router-dom";
import ApresentacaoModal from "./ApresentacaoModal";
import AOS from "aos";
import "aos/dist/aos.css";

const Apresentacao = () => {
  useEffect(() => {
    AOS.init({
      duration: 1500,
      once: true,
    });
  }, []);

  // Estado para controlar o modal
  const [modalOpen, setModalOpen] = useState(false);

  // Estados para os dados do componente
  const [titulo1, setTitulo1] = useState("Entidade");
  const [titulo2, setTitulo2] = useState("Mauá Esports");
  const [descricao1, setDescricao1] = useState(
    "Fundada em 2018, a Mauá Esports é a entidade universitária oficial do Instituto Mauá de Tecnologia, dedicada a promover a cultura gamer e os esportes eletrônicos dentro do ambiente acadêmico. Nossa missão é integrar estudantes por meio da paixão pelos jogos, oferecendo oportunidades de desenvolvimento pessoal."
  );
  const [descricao2, setDescricao2] = useState(
    "Além das equipes competitivas em diversos jogos, a Mauá Esports promove eventos regulares, como campeonatos internos, palestras e workshops, aberto a toda a comunidade acadêmica. Essas iniciativas visam não apenas entreter, mas também conectar jogadores, fomentar habilidades estratégicas e criar uma rede de networking entre alunos, ex-alunos e parceiros."
  );
  const [botao1Nome, setBotao1Nome] = useState("Times");
  const [botao1Link, setBotao1Link] = useState("https://localhost:5173/times");
  const [botao2Nome, setBotao2Nome] = useState("Campeonatos");
  const [botao2Link, setBotao2Link] = useState(
    "https://localhost:5173/campeonatos"
  );
  const [imagemUrl, setImagemUrl] = useState(
    "http://localhost:5173/src/assets/images/LogoOficial.png"
  );

  // Estado para os ícones de jogos
  const [icones, setIcones] = useState([
    {
      id: 1,
      imagem: "http://localhost:5173/src/assets/images/home/valorant.png",
      link: "https://playvalorant.com",
    },
  ]);

  // Função para abrir o modal
  const abrirModal = () => {
    setModalOpen(true);
  };

  // Função para fechar o modal
  const fecharModal = () => {
    setModalOpen(false);
  };

  // Função para salvar alterações
  const salvarAlteracoes = (novosDados) => {
    // Atualizar todos os estados com os novos dados
    setTitulo1(novosDados.titulo1);
    setTitulo2(novosDados.titulo2);
    setDescricao1(novosDados.descricao1);
    setDescricao2(novosDados.descricao2);
    setBotao1Nome(novosDados.botao1Nome);
    setBotao1Link(novosDados.botao1Link);
    setBotao2Nome(novosDados.botao2Nome);
    setBotao2Link(novosDados.botao2Link);
    setImagemUrl(novosDados.imagemUrl);
    setIcones(novosDados.icones);

    fecharModal();
    alert("Alterações salvas com sucesso!");
  };

  return (
    <Margin horizontal="60px">
      {/* Divisão Conteúdo e Imagem */}
      <div
        className="bg-fundo flex flex-col lg:flex-row items-stretch lg:items-center justify-between"
      >
        {/* Conteúdo - Esquerda */}
        <div data-aos="fade-up" className="w-full lg:w-1/1 space-y-6 text-left lg:pr-8 py-8 lg:py-0">
          {/* Título */}
          <h4 className="text-3xl font-bold mt-2">
            <span className="text-white block md:inline pb-[15px]">{titulo1} </span>
            <span className="text-azul-escuro block md:inline">{titulo2}</span>
          </h4>

          {/* Descrição */}
          <p className="text-fonte-escura mb-3">{descricao1}</p>
          <p className="text-fonte-escura mb-7">{descricao2}</p>

          {/* Botões */}
          <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-5">
              {/* Botão 1 */}
              <Link to={botao1Link}>
                <button className="bg-azul-escuro hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition duration-300 flex items-center cursor-pointer">
                  {botao1Nome}
                  <svg
                    className="ml-2 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </Link>

              {/* Botão 2 */}
              <Link to={botao2Link}>
                <button className="bg-azul-escuro hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition duration-300 flex items-center cursor-pointer">
                  {botao2Nome}
                  <svg
                    className="ml-2 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </Link>
            </div>

            {/* Adm - Botão Editar */}
            <button
              onClick={abrirModal}
              className="bg-[#284880] font-bold text-white border-0 py-2 px-4 rounded text-center transition-colors hover:bg-[#162b50] cursor-pointer w-[80px]"
            >
              Editar
            </button>
          </div>

          {/* Divisão */}
          <div className="border-t border-gray-700"></div>

          {/* Ícones Jogos */}
          <div className="flex gap-5">
            {icones.map((icone) => (
              <a
                key={icone.id}
                href={icone.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={icone.imagem}
                  className="h-10 hover:scale-105 transition-transform duration-600 ease-in-out"
                  alt="Ícone de jogo"
                />
              </a>
            ))}
          </div>
        </div>

        {/* Imagem - Direita */}
        <div data-aos="fade-up" className="w-full lg:w-1/2 flex justify-center lg:justify-end items-center">
          <img
            src={imagemUrl}
            alt="Logo Mauá Esports"
            className="w-[170px] lg:w-[400px] hover:scale-101 transition-transform duration-300 ease-in-out"
          />
        </div>
      </div>

      {/* Modal de Edição */}
      {modalOpen && (
        <ApresentacaoModal
          isOpen={modalOpen}
          onClose={fecharModal}
          onSave={salvarAlteracoes}
          dadosIniciais={{
            titulo1,
            titulo2,
            descricao1,
            descricao2,
            botao1Nome,
            botao1Link,
            botao2Nome,
            botao2Link,
            imagemUrl,
            icones,
          }}
        />
      )}
    </Margin>
  );
};

export default Apresentacao;
