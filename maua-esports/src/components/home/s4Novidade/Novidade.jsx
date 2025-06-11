import { useState, useEffect } from "react";
import Margin from "../../padrao/Margin";
import NovidadeModal from "./NovidadeModal";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
import { useMsal } from "@azure/msal-react";
import AlertaOk from "../../AlertaOk";
import AlertaErro from "../../AlertaErro";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const API_BASE_URL = "http://localhost:3000";

const Novidade = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [erro, setErro] = useState(null);
  const [novidadeData, setNovidadeData] = useState(null); // No default data
  const [loading, setloading] = useState(true); // Loading state
  const { instance } = useMsal();

  useEffect(() => {
    AOS.init({
      duration: 1500,
      once: true,
    });

    // Fetch user role
    const loadUserData = async () => {
      try {
        const account = instance.getActiveAccount();
        if (!account) {
          setUserRole(null);
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
        setUserRole(null);
      }
    };

    // Fetch novidade data
    const fetchNovidade = async () => {
      try {
        setloading(true);
        const response = await axios.get(`${API_BASE_URL}/api/homeNovidade`);
        setNovidadeData(response.data);
      } catch (error) {
        console.error("Erro ao buscar novidade:", error);
        setErro("Erro ao carregar dados da novidade");
        setTimeout(() => setErro(null), 3000);
      } finally {
        setloading(false);
      }
    };

    loadUserData();
    fetchNovidade();
  }, [instance]);

  useEffect(() => {
    if (successMessage || erro) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setErro(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, erro]);

  const handleSave = async (formData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/homeNovidade`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setNovidadeData(response.data);
      setModalOpen(false);
      setSuccessMessage("Novidade atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar novidade:", error);
      setErro(error.response?.data?.message || "Erro ao salvar novidade");
    }
  };

  if (loading) {
    return (
      <div
        className="w-full min-h-screen bg-[#0D1117] flex items-center justify-center"
        aria-live="polite"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-azul-claro"></div>
        <p className="text-branco ml-4">Carregando novidade...</p>
      </div>
    );
  }

  if (!novidadeData) {
    return null; // Render nothing if no data is available
  }

  return (
    <Margin horizontal="60px">
      {erro && <AlertaErro mensagem={erro} />}
      {successMessage && <AlertaOk mensagem={successMessage} />}

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between text-white">
        <div
          data-aos="fade-up"
          className="w-full lg:w-1/2 flex justify-center lg:justify-start items-center order-2 lg:order-1"
        >
          <img
            src={novidadeData.imagem}
            alt={novidadeData.titulo}
            className="w-[300px] lg:w-[470px] rounded-[10px] hover:scale-101 transition-transform duration-300 ease-in-out"
            loading="lazy"
          />
        </div>

        <div
          data-aos="fade-up"
          className="w-full lg:w-1/2 space-y-6 text-left lg:pl-8 py-8 lg:py-0 order-1 lg:order-2"
        >
          <h4 className="text-3xl font-bold text-gray-300 mb-4">
            {novidadeData.titulo}
          </h4>
          <div className="mb-4">
            <p className="text-gray-400 uppercase text-sm font-medium tracking-wider">
              {novidadeData.subtitulo}
            </p>
            <div className="border-b-4 border-gray-700 w-12 inline-block rounded-[12px]"></div>
          </div>

          <div className="text-fonte-escura space-y-3">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {novidadeData.descricao}
            </ReactMarkdown>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-5">
            <a
              href={novidadeData.urlBotao}
              className="custom-button link-button"
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
            {["Administrador", "Administrador Geral"].includes(userRole) && (
              <button
                className="custom-button edit-button"
                onClick={() => setModalOpen(true)}
              >
                Editar
              </button>
            )}
          </div>
        </div>
      </div>
      <NovidadeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={novidadeData}
        userRole={userRole}
      />
    </Margin>
  );
};

export default Novidade;