import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CardJogador from "../components/CardJogador";
import AdicionarMembro from "../components/AdicionarMembro";
import PageBanner from "../components/PageBanner";
import AlertaErro from "../components/AlertaErro";
import AlertaOk from "../components/AlertaOk";
import ModalConfirmarExclusao from "../components/modalConfirmarExclusao";
import ModalEditarJogador from "../components/ModalEditarJogador";
import axios from "axios";
import { useMsal } from "@azure/msal-react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = "http://localhost:3000";

const Membros = () => {
  const { timeId } = useParams();
  const [jogadores, setJogadores] = useState([]);
  const [time, setTime] = useState(null);
  const [loading, setloading] = useState(true);
  const [erro, setErro] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [modalExclusao, setModalExclusao] = useState({
    isOpen: false,
    jogador: null,
  });
  const [jogadorEditando, setJogadorEditando] = useState(null);
  const { instance } = useMsal();

  const carregarDados = async () => {
    try {
      setloading(true);
      setErro(null);

      const [responseTime, responseJogadores] = await Promise.all([
        axios.get(`${API_BASE_URL}/times/${timeId}`, {
          headers: { Accept: "application/json" },
        }),
        axios.get(`${API_BASE_URL}/times/${timeId}/jogadores`, {
          headers: { Accept: "application/json" },
        }),
      ]);

      setTime(responseTime.data);

      const jogadoresComFallback = responseJogadores.data.map((j) => ({
        ...j,
        fotoUrl: `${API_BASE_URL}/jogadores/${j._id}/imagem?${Date.now()}`,
        descricao: j.descricao || "Sem descrição disponível",
        // Garantir que redes sociais vazias sejam null
        insta: j.insta || null,
        twitter: j.twitter || null,
        twitch: j.twitch || null,
      }));

      console.log("Jogadores carregados:", jogadoresComFallback);
      setJogadores(jogadoresComFallback);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setErro(
        error.response
          ? error.response.data.message || "Erro ao carregar dados"
          : error.message.includes("Network Error")
            ? "Servidor não responde. Verifique sua conexão ou tente novamente."
            : error.message
      );
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
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

    loadUserData();
  }, [instance]);

  useEffect(() => {
    carregarDados();
  }, [timeId]);

  const handleDeleteJogador = (jogadorId) => {
    const jogadorParaExcluir = jogadores.find((j) => j._id === jogadorId);
    setModalExclusao({ isOpen: true, jogador: jogadorParaExcluir });
  };

  const confirmarExclusao = async () => {
    const jogador = modalExclusao.jogador;
    if (!jogador) return;

    try {
      await axios.delete(`${API_BASE_URL}/jogadores/${jogador._id}`);
      setJogadores((prev) => prev.filter((j) => j._id !== jogador._id));
      setSuccessMessage("Jogador deletado com sucesso!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Erro ao deletar jogador:", error);
      setErro(error.response?.data?.message || "Erro ao deletar jogador");
      setTimeout(() => setErro(null), 3000);
    } finally {
      setModalExclusao({ isOpen: false, jogador: null });
    }
  };

  const cancelarExclusao = () => {
    setModalExclusao({ isOpen: false, jogador: null });
  };

  const handleEditClick = (jogadorId) => {
    const jogadorToEdit = jogadores.find((j) => j._id === jogadorId);
    if (!jogadorToEdit) {
      console.error(`Jogador com ID ${jogadorId} não encontrado`);
      setErro("Jogador não encontrado");
      setTimeout(() => setErro(null), 3000);
      return;
    }

    console.log("Jogador selecionado para edição:", jogadorToEdit);
    setJogadorEditando({
      _id: jogadorToEdit._id || "",
      nome: jogadorToEdit.nome || "",
      titulo: jogadorToEdit.titulo || "",
      descricao: jogadorToEdit.descricao || "",
      fotoUrl: jogadorToEdit.fotoUrl || "",
      insta: jogadorToEdit.insta || "",
      twitter: jogadorToEdit.twitter || "",
      twitch: jogadorToEdit.twitch || "",
    });
  };

  const handleEditJogador = async (jogadorId, updatedData) => {
    try {
      const formData = new FormData();
      formData.append("nome", updatedData.nome);
      formData.append("titulo", updatedData.titulo);
      formData.append("descricao", updatedData.descricao);

      // Tratar redes sociais explicitamente
      formData.append("insta", updatedData.instagram || ""); // Envia string vazia se for nulo
      formData.append("twitter", updatedData.twitter || "");
      formData.append("twitch", updatedData.twitch || "");

      // Tratar a foto
      if (updatedData.foto && updatedData.foto.startsWith("data:image")) {
        const response = await fetch(updatedData.foto);
        const fotoBlob = await response.blob();
        formData.append("foto", fotoBlob, `foto-admin-${Date.now()}.jpg`);
      } else if (updatedData.foto === null) {
        formData.append("removeFoto", "true");
      }

      const response = await axios.put(
        `${API_BASE_URL}/jogadores/${jogadorId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Atualização do estado local - garantir que redes sociais vazias sejam null
      setJogadores((prev) =>
        prev.map((jogador) =>
          jogador._id === jogadorId
            ? {
              ...jogador,
              nome: updatedData.nome,
              titulo: updatedData.titulo,
              descricao: updatedData.descricao,
              insta: updatedData.instagram || null,
              twitter: updatedData.twitter || null,
              twitch: updatedData.twitch || null,
              fotoUrl:
                updatedData.foto && updatedData.foto.startsWith("data:image")
                  ? updatedData.foto
                  : updatedData.foto === null
                    ? null
                    : jogador.fotoUrl,
            }
            : jogador
        )
      );

      setSuccessMessage("Jogador atualizado com sucesso!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Erro ao atualizar jogador:", error);
      setErro(error.response?.data?.message || "Erro ao atualizar jogador");
      setTimeout(() => setErro(null), 3000);
    }
  };

  const handleAdicionarMembro = async (novoJogador) => {
    try {
      const formData = new FormData();
      formData.append("nome", novoJogador.nome);
      formData.append("titulo", novoJogador.titulo);
      formData.append("descricao", novoJogador.descricao);
      formData.append("time", timeId);

      // Adicionar redes sociais apenas se forem válidas
      if (novoJogador.insta && novoJogador.insta !== "null") {
        formData.append("insta", novoJogador.insta);
      }
      if (novoJogador.twitter && novoJogador.twitter !== "null") {
        formData.append("twitter", novoJogador.twitter);
      }
      if (novoJogador.twitch && novoJogador.twitch !== "null") {
        formData.append("twitch", novoJogador.twitch);
      }

      if (novoJogador.foto && novoJogador.foto.startsWith("data:")) {
        const response = await fetch(novoJogador.foto);
        const blob = await response.blob();
        formData.append("foto", blob, "foto-jogador.jpg");
      }

      const response = await axios.post(`${API_BASE_URL}/jogadores`, formData);

      setJogadores((prev) => [
        ...prev,
        {
          ...response.data,
          fotoUrl: `${API_BASE_URL}/jogadores/${response.data._id}/imagem?${Date.now()}`,
        },
      ]);

      setSuccessMessage("Jogador adicionado com sucesso!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Erro ao adicionar jogador:", error);
      setErro(error.response?.data?.message || "Erro ao adicionar jogador");
      setTimeout(() => setErro(null), 3000);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full min-h-screen bg-fundo flex items-center justify-center"
        aria-live="polite"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-t-2 border-b-2 border-azul-claro"
        ></motion.div>
        <p className="text-branco ml-4">Carregando membros...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full min-h-screen bg-fundo"
    >
      <AnimatePresence mode="wait">
        {erro && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AlertaErro mensagem={erro} />
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AlertaOk mensagem={successMessage} />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="bg-[#010409] h-[104px]"></div>
      <PageBanner
        pageName={time?.nome ? `Membros do ${time.nome}` : "Membros do Time"}
      />
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-fundo w-full flex justify-center items-center"
      >
        <div className="w-full flex flex-wrap py-16 justify-center gap-8">
          {jogadores.length > 0 ? (
            jogadores.map((jogador, index) => (
              <motion.div
                key={jogador._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative z-0"
              >
                <CardJogador
                  jogadorId={jogador._id}
                  nome={jogador.nome}
                  titulo={jogador.titulo}
                  descricao={jogador.descricao}
                  foto={jogador.fotoUrl}
                  instagram={jogador.insta}
                  twitter={jogador.twitter}
                  twitch={jogador.twitch}
                  onDelete={handleDeleteJogador}
                  onEdit={handleEditClick}
                  logoTime={time?.logoUrl}
                  userRole={userRole}
                />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center p-8 text-branco"
            >
              <p className="text-xl mb-4">Nenhum jogador encontrado</p>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AdicionarMembro
              onAdicionarMembro={handleAdicionarMembro}
              timeId={timeId}
              userRole={userRole}
            />
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {modalExclusao.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModalConfirmarExclusao
              isOpen={modalExclusao.isOpen}
              mensagem={`Tem certeza que deseja deletar o jogador ${modalExclusao.jogador?.nome}?`}
              onConfirm={confirmarExclusao}
              onCancel={cancelarExclusao}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {jogadorEditando && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModalEditarJogador
              jogador={jogadorEditando}
              onSave={handleEditJogador}
              onClose={() => setJogadorEditando(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

Membros.propTypes = {
  userRole: PropTypes.oneOf([
    "Jogador",
    "Capitão de time",
    "Administrador",
    "Administrador Geral",
    null,
  ]),
};

export default Membros;