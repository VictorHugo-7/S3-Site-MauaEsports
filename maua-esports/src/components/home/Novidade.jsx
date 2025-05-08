import { useState, useEffect } from "react";
import Margin from "../padrao/Margin";
import NovidadeModal from "./NovidadeModal";

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
    // Carregar dados do localStorage ao iniciar
    const savedData = localStorage.getItem("novidadeData");
    if (savedData) {
      setNovidadeData(JSON.parse(savedData));
    }
  }, []);

  const handleSave = (formData) => {
    setNovidadeData(formData);
  };

  return (
    <>
      <Margin horizontal="60px">
        <div className="flex text-white items-center">
          {/* Left section with champion image - 50% width */}
          <div className="rounded-[10px] w-1/2 flex items-center justify-center">
            <img className="w-100" src={novidadeData.imagem} alt="" />
          </div>

          {/* Right section with about text - 50% width */}
          <div className="w-1/1 pl-8">
            <h4 className="text-3xl font-bold text-gray-300 mb-4">{novidadeData.titulo}</h4>

            <div className="mb-4">
              <p className="text-gray-400 uppercase text-sm font-medium tracking-wider">
                {novidadeData.subtitulo}
              </p>
              <div className="border-b-4 border-gray-700 w-12 inline-block rounded-[12px]"></div>
            </div>

            <div className="text-gray-300 space-y-3">
              <p>{novidadeData.descricao}</p>
            </div>

            <div className="flex justify-between mt-5 text-center">
              <a href={novidadeData.urlBotao} className="text-blue-400 font-bold flex items-center">
                {novidadeData.nomeBotao}
                <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>

              <button 
                className="bg-[#284880] text-white border-0 py-2 px-4 rounded text-sm transition-colors hover:bg-[#162b50] cursor-pointer"
                onClick={() => setModalOpen(true)}
              >
                Editar
              </button>
            </div>
          </div>
        </div>
      </Margin>

      <NovidadeModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={novidadeData}
      />
    </>
  );
};

Novidade.propTypes = {
  // Você pode adicionar as props que desejar aqui
};

export default Novidade;