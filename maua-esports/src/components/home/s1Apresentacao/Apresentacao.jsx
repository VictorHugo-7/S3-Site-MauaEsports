import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ApresentacaoModal from "./ApresentacaoModal";
import Margin from "../../padrao/Margin";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
import { useMsal } from "@azure/msal-react";
import AlertaOk from "../../AlertaOk";
import AlertaErro from "../../AlertaErro";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const API_BASE_URL = "http://localhost:3000";

const Apresentacao = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [erro, setErro] = useState(null);
  const [apresentacaoData, setApresentacaoData] = useState({
    titulo1: "",
    titulo2: "",
    descricao1: "",
    descricao2: "",
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

  const { instance } = useMsal();

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 1500,
      once: true,
    });

    // Fetch user role
    const loadUserData = async () => {
      try {
        const account = instance.getActiveAccount();
        if (!account) {
          setUserRole(null); // User not logged in
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/usuarios/por-email?email=${encodeURIComponent(
            account.username
          )}`,
          { headers: { Accept: "application/json" } }
        );
        const userData = response.data.usuario;
        setUserRole(userData.tipoUsuario);
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        setUserRole(null); // Treat error as user not logged in
      }
    };

    // Fetch presentation data
    const fetchApresentacao = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/apresentacao`);
        setApresentacaoData(response.data);
      } catch (error) {
        console.error("Erro ao buscar apresentação:", error);
        setErro("Erro ao carregar dados da apresentação");
        setTimeout(() => setErro(null), 3000);
      }
    };

    loadUserData();
    fetchApresentacao();
  }, [instance]);

  useEffect(() => {
    if (successMessage || erro) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setErro(null);
      }, 3000); // Clear alerts after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [successMessage, erro]);

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

      const iconesParaEnviar = formData.icones.map(({ id, link }) => ({
        id,
        link,
      }));
      data.append("icones", JSON.stringify(iconesParaEnviar));

      if (formData.imagem instanceof File) {
        data.append("imagem", formData.imagem);
      }

      formData.icones.forEach((icone, index) => {
        if (icone.imagem instanceof File) {
          data.append(`icones[${index}]`, icone.imagem);
        }
      });

      const response = await axios.post(
        `${API_BASE_URL}/api/apresentacao`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setApresentacaoData(response.data);
      setModalOpen(false);
      setSuccessMessage("Apresentação atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar apresentação:", error);
      setErro(error.response?.data?.message || "Erro ao salvar apresentação");
    }
  };

  return (
    <Margin horizontal="60px">
      {erro && <AlertaErro mensagem={erro} />}
      {successMessage && <AlertaOk mensagem={successMessage} />}
      <div className="bg-fundo flex flex-col lg:flex-row items-stretch lg:items-center justify-between">
        <div
          data-aos="fade-up"
          className="w-full lg:w-1/1 space-y-6 text-left lg:pr-8 py-8 lg:py-0"
        >
          <h4 className="text-3xl font-bold mt-2">
            <span className="text-white block md:inline pb-[15px]">
              {apresentacaoData.titulo1}{" "}
            </span>
            <span className="text-azul-escuro block md:inline">
              {apresentacaoData.titulo2}
            </span>
          </h4>
          <p className="text-fonte-escura mb-3">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw]} // Permite HTML no markdown
            >
              {apresentacaoData.descricao1}
            </ReactMarkdown>

          </p>

          <p className="text-fonte-escura mb-3">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw]} 
            >
              {apresentacaoData.descricao2}
            </ReactMarkdown>

          </p>
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
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
            {["Administrador", "Administrador Geral"].includes(userRole) && (
              <button
                onClick={() => setModalOpen(true)}
                className="bg-[#284880] font-bold text-white border-0 py-2 px-4 rounded text-center transition-colors hover:bg-[#162b50] cursor-pointer w-[80px]"
              >
                Editar
              </button>
            )}
          </div>
          <div className="border-t border-gray-700"></div>
          <div className="flex gap-5">
            {apresentacaoData.icones.map((icone) => (
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
        <div
          data-aos="fade-up"
          className="w-full lg:w-1/2 flex justify-center lg:justify-end items-center"
        >
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
        userRole={userRole}
      />
    </Margin>
  );
};

export default Apresentacao;
