import { useState, useEffect } from "react";
import Margin from "../../padrao/Margin";
import NovidadeModal from "./NovidadeModal";
import AOS from "aos";
import "aos/dist/aos.css";

const Novidade = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [novidadeData, setNovidadeData] = useState({
    imagem: "https://static.tildacdn.net/tild6639-6566-4661-b631-343234376339/matty.jpeg",
    titulo: "Título Teste",
    subtitulo: "LOREM ISPSUM DOLOR SIT AMET CONSECTETUR",
    descricao: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sequi soluta voluptate nostrum provident nulla modi cumque placeat adipisci nobis delectus, amet neque inventore necessitatibus vero voluptatem consequatur quo! Perferendis, dolorum. Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique officiis praesentium labore vitae excepturi sit, libero nostrum culpa molestiae aut veniam aliquid ea qui placeat officia voluptas? Numquam, iure perferendis. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nemo iusto necessitatibus culpa natus amet labore quod praesentium eius excepturi illo. Doloribus minima quod quia eius voluptatum assumenda numquam. Animi, numquam.Doloribus minima quod quia eius voluptatum assumenda numquam. Animi, numquam.Doloribus minima quod quia eius voluptatum assumenda numquam. Animi, numquam.",
    nomeBotao: "VER NOTÍCIA",
    urlBotao: "#",
  });

  useEffect(() => {
    AOS.init({
      duration: 1500,
      once: true,
    });

    // Carregar dados do localStorage ao iniciar
    const savedData = localStorage.getItem("novidadeData");
    if (savedData) {
      setNovidadeData(JSON.parse(savedData));
    }
  }, []);

  const handleSave = (formData) => {
    setNovidadeData(formData);
    localStorage.setItem("novidadeData", JSON.stringify(formData));
  };

  return (
    <Margin horizontal="60px">
      {/* Divisão Conteúdo e Imagem */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between text-white">
        {/* Imagem - Esquerda em telas maiores */}
        <div
          data-aos="fade-up"
          className="w-full lg:w-1/2 flex justify-center lg:justify-start items-center order-2 lg:order-1"
        >
          <img
            src={novidadeData.imagem}
            alt={novidadeData.titulo}
            className="w-[300px] lg:w-[500px] rounded-[10px] hover:scale-101 transition-transform duration-300 ease-in-out"
          />
        </div>

        {/* Conteúdo - Direita em telas maiores */}
        <div
          data-aos="fade-up"
          className="w-full lg:w-1/2 space-y-6 text-left lg:pl-8 py-8 lg:py-0 order-1 lg:order-2"
        >
          {/* Título */}
          <h4 className="text-3xl font-bold text-gray-300 mb-4">{novidadeData.titulo}</h4>

          {/* Subtítulo */}
          <div className="mb-4">
            <p className="text-gray-400 uppercase text-sm font-medium tracking-wider">
              {novidadeData.subtitulo}
            </p>
            <div className="border-b-4 border-gray-700 w-12 inline-block rounded-[12px]"></div>
          </div>

          {/* Descrição */}
          <div className="text-gray-300 space-y-3">
            <p>{novidadeData.descricao}</p>
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-5">
            <a
              href={novidadeData.urlBotao}
              className="text-blue-400 font-bold flex items-center"
            >
              {novidadeData.nomeBotao}
              <svg
                className="w-4 h-4 ml-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M5 12h14M12 5l7 7-7 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>

            <button
              className="bg-[#284880] text-white border-0 py-2 px-4 rounded text-sm transition-colors hover:bg-[#162b50] cursor-pointer w-[80px]"
              onClick={() => setModalOpen(true)}
            >
              Editar
            </button>
          </div>
        </div>
      </div>

      <NovidadeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={novidadeData}
      />
    </Margin>
  );
};

export default Novidade;