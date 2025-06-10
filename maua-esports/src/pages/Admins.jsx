import React, { useState, useEffect } from "react";
import CardAdmin from "../components/CardAdmin";
import ModalEditarAdmin from "../components/ModalEditarAdmin";
import AdicionarAdmin from "../components/AdicionarAdmin";
import PageBanner from "../components/PageBanner";
import AlertaErro from "../components/AlertaErro";
import AlertaOk from "../components/AlertaOk";
import axios from "axios";
import { useMsal } from "@azure/msal-react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import ModalConfirmarExclusao from "../components/modalConfirmarExclusao";

const API_BASE_URL = "http://localhost:3000";

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setloading] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState(null);
  const [adminEditando, setAdminEditando] = useState(null);
  const [erro, setErro] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { instance } = useMsal();
  const [userRole, setUserRole] = useState(null);
  const [modalExclusao, setModalExclusao] = useState({
    isOpen: false,
    admin: null,
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const account = instance.getActiveAccount();
        if (!account) {
          setUserRole(null); // Non-logged-in user
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
        setUserRole(null); // Treat error as non-logged-in user
      }
    };

    loadUserData();
  }, [instance]);

  const carregarAdmins = async () => {
    try {
      setloading(true);
      setErroCarregamento(null);

      const response = await axios.get(`${API_BASE_URL}/admins`, {
        headers: { Accept: "application/json" },
      });

      const adminsComUrls = response.data.map((admin) => ({
        ...admin,
        fotoUrl: admin.foto
          ? `${API_BASE_URL}/admins/${admin._id}/foto?${Date.now()}`
          : null,
        // Garantir que redes sociais vazias sejam null
        insta: admin.insta || null,
        twitter: admin.twitter || null,
        twitch: admin.twitch || null,
      }));

      setAdmins(adminsComUrls);
    } catch (error) {
      console.error("Erro ao carregar admins:", error);
      setErroCarregamento(
        error.response
          ? error.response.data.message || "Erro ao carregar administradores"
          : error.message.includes("Network Error")
            ? "Servidor não responde. Verifique sua conexão ou tente novamente."
            : error.message
      );
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
    carregarAdmins();
  }, []);

  const handleDeleteAdmin = async (adminId) => {
    const adminParaExcluir = admins.find((a) => a._id === adminId);
    setModalExclusao({ isOpen: true, admin: adminParaExcluir });
  };

  const confirmarExclusao = async () => {
    const admin = modalExclusao.admin;
    if (!admin) return;

    try {
      await axios.delete(`${API_BASE_URL}/admins/${admin._id}`);
      setAdmins((prev) => prev.filter((a) => a._id !== admin._id));
      setSuccessMessage("Administrador deletado com sucesso!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Erro ao deletar admin:", error);
      setErro(error.response?.data?.message || "Erro ao deletar administrador");
      setTimeout(() => setErro(null), 3000);
    } finally {
      setModalExclusao({ isOpen: false, admin: null });
    }
  };

  const cancelarExclusao = () => {
    setModalExclusao({ isOpen: false, admin: null });
  };

  const handleCreateAdmin = async (novoAdmin) => {
    try {
      const formData = new FormData();
      formData.append("nome", novoAdmin.nome);
      formData.append("titulo", novoAdmin.titulo);
      formData.append("descricao", novoAdmin.descricao);
      formData.append("insta", novoAdmin.insta || "");
      formData.append("twitter", novoAdmin.twitter || "");
      formData.append("twitch", novoAdmin.twitch || "");

      if (novoAdmin.foto && novoAdmin.foto.startsWith("data:")) {
        const response = await fetch(novoAdmin.foto);
        const blob = await response.blob();
        formData.append("foto", blob, "foto-admin.jpg");
      }

      const response = await axios.post(`${API_BASE_URL}/admins`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setAdmins((prev) => [
        ...prev,
        {
          ...response.data.admin,
          fotoUrl: response.data.admin.foto
            ? `${API_BASE_URL}/admins/${response.data.admin._id
            }/foto?${Date.now()}`
            : null,
        },
      ]);
      setSuccessMessage("Administrador criado com sucesso!");
      setTimeout(() => setSuccessMessage(null), 3000);
      carregarAdmins();
    } catch (error) {
      console.error("Erro ao criar admin:", error);
      setErro(error.response?.data?.message || "Erro ao criar administrador");
      setTimeout(() => setErro(null), 3000);
    }
  };

  const handleEditClick = (adminId) => {
    const adminToEdit = admins.find((a) => a._id === adminId);
    if (!adminToEdit) return;

    setAdminEditando({
      _id: adminToEdit._id,
      nome: adminToEdit.nome,
      titulo: adminToEdit.titulo,
      descricao: adminToEdit.descricao,
      fotoUrl: adminToEdit.fotoUrl,
      insta: adminToEdit.insta || "",
      twitter: adminToEdit.twitter || "",
      twitch: adminToEdit.twitch || "",
    });
  };

  const handleEditAdmin = async (updatedData) => {
    try {
      const formData = new FormData();
      formData.append("nome", updatedData.nome);
      formData.append("titulo", updatedData.titulo);
      formData.append("descricao", updatedData.descricao);
      formData.append("insta", updatedData.insta || "");
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

      // Rest of the function remains the same...
      const response = await axios.put(
        `${API_BASE_URL}/admins/${updatedData._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Atualização do estado local
      setAdmins((prev) =>
        prev.map((admin) =>
          admin._id === updatedData._id
            ? {
              ...admin,
              nome: updatedData.nome,
              titulo: updatedData.titulo,
              descricao: updatedData.descricao,
              insta: updatedData.insta || null,
              twitter: updatedData.twitter || null,
              twitch: updatedData.twitch || null,
              fotoUrl:
                updatedData.foto && updatedData.foto.startsWith("data:image")
                  ? updatedData.foto
                  : updatedData.foto === null
                    ? null
                    : `${API_BASE_URL}/admins/${updatedData._id}/foto?${Date.now()}`,
            }
            : admin
        )
      );

      setSuccessMessage("Administrador atualizado com sucesso!");
      setTimeout(() => setSuccessMessage(null), 3000);
      setAdminEditando(null);
    } catch (error) {
      console.error("Erro ao atualizar admin:", error);
      setErro(error.response?.data?.message || "Erro ao atualizar administrador");
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
        <p className="text-branco ml-4">Carregando administradores...</p>
      </motion.div>
    );
  }

  if (erroCarregamento) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full min-h-screen bg-fundo flex flex-col items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-preto p-6 rounded-lg max-w-md text-center border border-vermelho-claro"
        >
          <h2 className="text-xl font-bold text-vermelho-claro mb-2">
            Erro ao carregar
          </h2>
          <p className="text-branco mb-4">{erroCarregamento}</p>
          <div className="flex flex-col space-y-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={carregarAdmins}
              className="bg-azul-claro text-branco px-4 py-2 rounded hover:bg-azul-escuro"
              aria-label="Tentar carregar administradores novamente"
            >
              Tentar novamente
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="bg-cinza-escuro text-branco px-4 py-2 rounded hover:bg-cinza-claro"
              aria-label="Recarregar a página"
            >
              Recarregar página
            </motion.button>
          </div>
        </motion.div>
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
      <PageBanner pageName="Administradores" />
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-fundo w-full flex justify-center items-center overflow-auto scrollbar-hidden"
      >
        <div className="w-full flex flex-wrap py-16 justify-center gap-8">
          {admins.length > 0 ? (
            admins.map((admin, index) => (
              <motion.div
                key={admin._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CardAdmin
                  adminId={admin._id}
                  nome={admin.nome}
                  titulo={admin.titulo || ""}
                  descricao={admin.descricao || ""}
                  foto={admin.fotoUrl}
                  instagram={admin.insta}
                  twitter={admin.twitter}
                  twitch={admin.twitch}
                  onDelete={handleDeleteAdmin}
                  onEditClick={handleEditClick}
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
              <p className="text-xl mb-4">Nenhum administrador encontrado</p>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AdicionarAdmin
              onAdicionarAdmin={handleCreateAdmin}
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
              mensagem={`Tem certeza que deseja deletar o administrador ${modalExclusao.admin?.nome}?`}
              onConfirm={confirmarExclusao}
              onCancel={cancelarExclusao}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {adminEditando && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModalEditarAdmin
              admin={adminEditando}
              onClose={() => setAdminEditando(null)}
              onSave={handleEditAdmin}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

Admins.propTypes = {
  userRole: PropTypes.oneOf([
    "Jogador",
    "Administrador",
    "Administrador Geral",
    null,
  ]),
};

export default Admins;
