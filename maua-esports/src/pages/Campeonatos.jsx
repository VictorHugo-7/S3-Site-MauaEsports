import { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import Board from "../components/campeonatos/Board";
import CardModal from "../components/campeonatos/CardModal";
import ModalConfirmarExclusao from "../components/modalConfirmarExclusao";
import PageBanner from "../components/PageBanner";
import { useNavigate } from "react-router-dom";
import AlertaOk from "../components/AlertaOk";
import AlertaErro from "../components/AlertaErro";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = "http://localhost:3000";

const Campeonatos = () => {
  const { instance } = useMsal();
  const navigate = useNavigate();
  const columns = ["campeonatos", "inscricoes", "passados"];
  const [currentColumn, setCurrentColumn] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [boardData, setBoardData] = useState({
    campeonatos: [],
    inscricoes: [],
    passados: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState({
    columnId: null,
    cardIndex: null,
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const account = instance.getActiveAccount();

        if (account) {
          const response = await fetch(
            `${API_BASE_URL}/usuarios/por-email?email=${encodeURIComponent(
              account.username
            )}`
          );
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Erro ao carregar dados do usuário");
          }

          setUserRole(data.usuario.tipoUsuario);
        }

        setAuthChecked(true);
        fetchTournaments();
      } catch (err) {
        console.error("Erro ao carregar dados do usuário:", err);
        navigate("/nao-autorizado");
      }
    };

    loadUserData();
  }, [instance, navigate]);

  const fetchTournaments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setErrorMessage(null);

      const response = await fetch(`${API_BASE_URL}/campeonatos`);

      if (!response.ok) {
        throw new Error("Erro ao carregar campeonatos");
      }

      const data = await response.json();

      const processTournaments = (tournaments) => {
        return tournaments.map((t) => ({
          ...t,
          imageUrl: `${API_BASE_URL}/campeonatos/${t._id}/image?${Date.now()}`,
          gameIconUrl: `${API_BASE_URL}/campeonatos/${
            t._id
          }/gameIcon?${Date.now()}`,
          organizerImageUrl: `${API_BASE_URL}/campeonatos/${
            t._id
          }/organizerImage?${Date.now()}`,
        }));
      };

      setBoardData({
        campeonatos: processTournaments(data.campeonatos || []),
        inscricoes: processTournaments(data.inscricoes || []),
        passados: processTournaments(data.passados || []),
      });
    } catch (err) {
      setError(err.message);
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (columnId, card = null) => {
    if (userRole !== "Administrador" && userRole !== "Administrador Geral")
      return;

    setCurrentColumn(columnId);
    setEditingCard(card);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCard(null);
  };

  const handleCardCreate = async (formData) => {
    try {
      let url = `${API_BASE_URL}/campeonatos`;
      let method = "POST";

      if (editingCard && editingCard._id) {
        url = `${API_BASE_URL}/campeonatos/${editingCard._id}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao salvar campeonato");
      }

      setSuccessMessage(
        editingCard
          ? "Campeonato atualizado com sucesso!"
          : "Campeonato criado com sucesso!"
      );
      fetchTournaments();
      closeModal();
    } catch (err) {
      console.error("Erro ao salvar campeonato:", err);
      setErrorMessage(`Erro ao salvar campeonato: ${err.message}`);
    }
  };

  const handleDeleteClick = (columnId, cardIndex) => {
    if (userRole !== "Administrador" && userRole !== "Administrador Geral")
      return;

    setCardToDelete({ columnId, cardIndex });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const { columnId, cardIndex } = cardToDelete;
      const cardId = boardData[columnId][cardIndex]._id;

      if (!cardId) return;

      const response = await fetch(`${API_BASE_URL}/campeonatos/${cardId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      setSuccessMessage("Campeonato excluído com sucesso!");
      fetchTournaments();
    } catch (err) {
      console.error("Erro ao excluir campeonato:", err);
      setErrorMessage(`Erro ao excluir campeonato: ${err.message}`);
    } finally {
      setShowDeleteModal(false);
      setCardToDelete({ columnId: null, cardIndex: null });
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCardToDelete({ columnId: null, cardIndex: null });
  };

  const handleCardMove = async (cardData, sourceColumn, targetColumn) => {
    if (userRole !== "Administrador" && userRole !== "Administrador Geral")
      return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/campeonatos/${cardData._id}/move`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: targetColumn,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      setSuccessMessage("Campeonato movido com sucesso!");
      fetchTournaments();
    } catch (err) {
      console.error("Erro ao mover campeonato:", err);
      setErrorMessage(`Erro ao mover campeonato: ${err.message}`);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0D1117] text-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-t-2 border-b-2 border-azul-claro"
        ></motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-[#0D1117] min-h-screen flex flex-col">
        <div className="bg-[#010409] h-[104px]"></div>
        <PageBanner pageName="Campeonatos" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-5 flex justify-center items-center flex-grow"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-white"
          >
            Carregando campeonatos...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[#0D1117] min-h-screen flex flex-col"
    >
      <div className="bg-[#010409] h-[104px]"></div>

      <PageBanner pageName="Campeonatos" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="p-5 flex flex-col items-center"
      >
        <AnimatePresence mode="wait">
          {successMessage && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AlertaOk mensagem={successMessage} />
            </motion.div>
          )}
          {errorMessage && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AlertaErro mensagem={errorMessage} />
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center flex-grow"
          >
            <div className="text-red-500 mb-4">
              Erro ao carregar campeonatos: {error}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchTournaments}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Tentar novamente
            </motion.button>
          </motion.div>
        )}

        {!error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Board
              columns={columns}
              boardData={boardData}
              onOpenModal={openModal}
              onCardDelete={handleDeleteClick}
              onCardMove={handleCardMove}
              isAdminMode={
                userRole === "Administrador" ||
                userRole === "Administrador Geral"
              }
            />
          </motion.div>
        )}

        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CardModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleCardCreate}
                editingCard={editingCard}
              />
            </motion.div>
          )}

          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <ModalConfirmarExclusao
                isOpen={showDeleteModal}
                mensagem="Tem certeza que deseja excluir este campeonato?"
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default Campeonatos;
