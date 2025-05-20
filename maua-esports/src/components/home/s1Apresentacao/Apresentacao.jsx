import { useState, useEffect } from "react";
import Margin from "../../padrao/Margin";
import { Link } from "react-router-dom";
import ApresentacaoModal from "./ApresentacaoModal";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";

const Apresentacao = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [apresentacaoData, setApresentacaoData] = useState({
    titulo1: "",
    titulo2: "",
    descricao1:"",
    descricao2:"",
    botao1Nome: "",
    botao1Link: "",
    botao2Nome: "",
    botao2Link: "",
    imagem: "",
    icones: [
      {
        id: 1,
        imagem: "",
        link: "",
      },
    ],
  });

  useEffect(() => {
    AOS.init({
      duration: 1500,
      once: true,
    });

    // Buscar dados do backend
    const fetchApresentacao = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/apresentacao");
        setApresentacaoData(response.data);
      } catch (error) {
        console.error("Erro ao buscar apresentação:", error);
      }
    };

    fetchApresentacao();
  }, []);

  const handleSave = async (formData) => {
    try {
      const data = new FormData();
      data.append("titulo1", formData.titulo1);
      data.append("titulo2", formData.titulo2);
      data.append("descricao1", formData.descricao1);
      data.append("descricao2", formData.descricao2);
      data.append("botao1Nome", formData.botao1Nome);
      data.append("botao1Link", formData.botao1Link);
      data.append("botao2Nome", formData.botao2Nome);
      data.append("botao2Link", formData.botao2Link);
      data.append("icones", JSON.stringify(formData.icones));

      // Adiciona a imagem principal, se for um arquivo
      if (formData.imagem instanceof File) {
        data.append("imagem", formData.imagem);
      }

      // Adiciona as imagens dos ícones, se forem arquivos
      formData.icones.forEach((icone, index) => {
        if (icone.imagem instanceof File) {
          data.append("icones", icone.imagem);
        }
      });

      const response = await axios.post("http://localhost:3000/api/apresentacao", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setApresentacaoData(response.data);
      setModalOpen(false);
      alert("Alterações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar apresentação:", error);
      alert("Erro ao salvar alterações");
    }
  };

  return (
    <Margin horizontal="60px">
      <div className="bg-fundo flex flex-col lg:flex-row items-stretch lg:items-center justify-between">
        <div data-aos="fade-up" className="w-full lg:w-1/1 space-y-6 text-left lg:pr-8 py-8 lg:py-0">
          <h4 className="text-3xl font-bold mt-2">
            <span className="text-white block md:inline pb-[15px]">{apresentacaoData.titulo1} </span>
            <span className="text-azul-escuro block md:inline">{apresentacaoData.titulo2}</span>
          </h4>
          <p className="text-fonte-escura mb-3">{apresentacaoData.descricao1}</p>
          <p className="text-fonte-escura mb-7">{apresentacaoData.descricao2}</p>
          <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-5">
              <Link to={apresentacaoData.botao1Link}>
                <button className="bg-azul-escuro hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition duration-300 flex items-center cursor-pointer">
                  {apresentacaoData.botao1Nome}
                  <svg
                    className="ml-2 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </Link>
              <Link to={apresentacaoData.botao2Link}>
                <button className="bg-azul-escuro hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition duration-300 flex items-center cursor-pointer">
                  {apresentacaoData.botao2Nome}
                  <svg
                    className="ml-2 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </Link>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-[#284880] font-bold text-white border-0 py-2 px-4 rounded text-center transition-colors hover:bg-[#162b50] cursor-pointer w-[80px]"
            >
              Editar
            </button>
          </div>
          <div className="border-t border-gray-700"></div>
          <div className="flex gap-5">
            {apresentacaoData.icones.map((icone) => (
              <a key={icone.id} href={icone.link} target="_blank" rel="noopener noreferrer">
                <img
                  src={icone.imagem}
                  className="h-10 hover:scale-105 transition-transform duration-600 ease-in-out"
                  alt="Ícone de jogo"
                />
              </a>
            ))}
          </div>
        </div>
        <div data-aos="fade-up" className="w-full lg:w-1/2 flex justify-center lg:justify-end items-center">
          <img
            src={apresentacaoData.imagem}
            alt="Logo Mauá Esports"
            className="w-[170px] lg:w-[400px] hover:scale-101 transition-transform duration-300 ease-in-out"
          />
        </div>
      </div>

      <ApresentacaoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        dadosIniciais={apresentacaoData}
      />
    </Margin>
  );
};

export default Apresentacao;