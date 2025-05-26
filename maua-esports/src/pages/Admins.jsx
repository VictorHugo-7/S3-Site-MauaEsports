import React, { useState, useEffect } from "react";
import CardAdmin from "../components/CardAdmin";
import ModalEditarAdmin from "../components/ModalEditarAdmin";
import AdicionarAdmin from "../components/AdicionarAdmin";
import PageBanner from "../components/PageBanner";
import AlertaErro from "../components/AlertaErro";
import AlertaOk from "../components/AlertaOk";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useMsal } from "@azure/msal-react";
import PropTypes from "prop-types";

const API_BASE_URL = "http://localhost:3000";

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState(null);
  const [adminEditando, setAdminEditando] = useState(null);
  const [erro, setErro] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { instance } = useMsal();
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

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
      setCarregando(true);
      setErroCarregamento(null);

      if (!API_BASE_URL) {
        throw new Error("URL da API não configurada");
      }

      const response = await axios.get(`${API_BASE_URL}/admins`, {
        headers: { Accept: "application/json" },
        timeout: 8000, // 8-second timeout
      });

      if (!Array.isArray(response.data)) {
        throw new Error("Formato de dados inválido do servidor");
      }

      const adminsComUrls = response.data.map((admin) => ({
        ...admin,
        fotoUrl: admin.foto
          ? `${API_BASE_URL}/admins/${admin._id}/foto?${Date.now()}`
          : null,
      }));

      setAdmins(adminsComUrls);
    } catch (error) {
      console.error("Erro ao carregar admins:", error);
      setErroCarregamento(
        error.code === "ECONNABORTED"
          ? "Tempo de conexão excedido. Verifique sua internet."
          : error.response
            ? error.response.data.message || "Erro ao carregar administradores"
            : error.message.includes("Network Error")
              ? "Servidor não responde. Verifique sua conexão ou tente novamente."
              : error.message
      );
      setAdmins([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarAdmins();
  }, []);

  const handleDeleteAdmin = async (adminId) => {
    try {
      await axios.delete(`${API_BASE_URL}/admins/${adminId}`);
      setAdmins((prev) => prev.filter((a) => a._id !== adminId));
      setSuccessMessage("Administrador deletado com sucesso!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Erro ao deletar admin:", error);
      setErro(
        error.response?.data?.message || "Erro ao deletar administrador"
      );
      setTimeout(() => setErro(null), 3000);
    }
  };

  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleSaveAdmin = async (adminAtualizado) => {
  try {
    const formData = new FormData();
    formData.append("nome", adminAtualizado.nome);
    formData.append("titulo", adminAtualizado.titulo || "");
    formData.append("descricao", adminAtualizado.descricao || "");
    formData.append("insta", adminAtualizado.insta || "");
    formData.append("twitter", adminAtualizado.twitter || "");
    formData.append("twitch", adminAtualizado.twitch || "");

    // Convert base64 to Blob if necessary
    if (adminAtualizado.foto && adminAtualizado.foto.startsWith("data:image")) {
      const fotoBlob = dataURLtoBlob(adminAtualizado.foto);
      formData.append("foto", fotoBlob, `foto-admin-${Date.now()}.jpg`);
    } else if (adminAtualizado.foto === null) {
      formData.append("removeFoto", "true");
    }

    const response = await axios.put(
      `${API_BASE_URL}/admins/${adminAtualizado._id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setAdmins((prev) =>
      prev.map((admin) =>
        admin._id === adminAtualizado._id
          ? {
              ...admin,
              nome: response.data.nome,
              titulo: response.data.titulo,
              descricao: response.data.descricao,
              insta: response.data.insta,
              twitter: response.data.twitter,
              twitch: response.data.twitch,
              fotoUrl: response.data.foto
                ? `${API_BASE_URL}/admins/${response.data._id}/foto?${Date.now()}`
                : null,
            }
          : admin
      )
    );
    setAdminEditando(null);
    setSuccessMessage("Administrador atualizado com sucesso!");
    setTimeout(() => setSuccessMessage(null), 3000);
    carregarAdmins();
  } catch (error) {
    console.error("Erro na edição:", error);
    setErro(
      error.response?.data?.message || "Erro ao atualizar administrador"
    );
    setTimeout(() => setErro(null), 3000);
  }
};

  const handleCreateAdmin = async (novoAdmin) => {
    try {
      const formData = new FormData();
      formData.append("nome", novoAdmin.nome.trim());
      formData.append("titulo", novoAdmin.titulo.trim());
      formData.append("descricao", novoAdmin.descricao.trim());

      if (novoAdmin.instagram) formData.append("insta", novoAdmin.instagram.trim());
      if (novoAdmin.twitter) formData.append("twitter", novoAdmin.twitter.trim());
      if (novoAdmin.twitch) formData.append("twitch", novoAdmin.twitch.trim());

      // Convert base64 to Blob if necessary
      if (novoAdmin.foto && novoAdmin.foto.startsWith("data:image")) {
        const fotoBlob = dataURLtoBlob(novoAdmin.foto);
        formData.append("foto", fotoBlob, `foto-admin-${Date.now()}.jpg`);
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
            ? `${API_BASE_URL}/admins/${response.data.admin._id}/foto?${Date.now()}`
            : null,
        },
      ]);
      setSuccessMessage("Administrador criado com sucesso!");
      setTimeout(() => setSuccessMessage(null), 3000);
      carregarAdmins();
    } catch (error) {
      console.error("Erro ao criar admin:", error);
      setErro(
        error.response?.data?.message || "Erro ao criar administrador"
      );
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

  if (carregando) {
    return (
      <div
        className="w-full min-h-screen bg-fundo flex items-center justify-center"
        aria-live="polite"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-azul-claro"></div>
        <p className="text-branco ml-4">Carregando administradores...</p>
      </div>
    );
  }

  if (erroCarregamento) {
    return (
      <div className="w-full min-h-screen bg-fundo flex flex-col items-center justify-center p-4">
        <div className="bg-preto p-6 rounded-lg max-w-md text-center border border-vermelho-claro">
          <h2 className="text-xl font-bold text-vermelho-claro mb-2">
            Erro ao carregar
          </h2>
          <p className="text-branco mb-4">{erroCarregamento}</p>
          <div className="flex flex-col space-y-2">
            <button
              onClick={carregarAdmins}
              className="bg-azul-claro text-branco px-4 py-2 rounded hover:bg-azul-escuro"
              aria-label="Tentar carregar administradores novamente"
            >
              Tentar novamente
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-cinza-escuro text-branco px-4 py-2 rounded hover:bg-cinza-claro"
              aria-label="Recarregar a página"
            >
              Recarregar página
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-fundo">
      {erro && <AlertaErro mensagem={erro} />}
      {successMessage && <AlertaOk mensagem={successMessage} />}
      <div className="bg-[#010409] h-[104px]"></div>
      <PageBanner pageName="Administradores" />
      <div className="bg-fundo w-full flex justify-center items-center overflow-auto scrollbar-hidden">
        <div className="w-full flex flex-wrap py-16 justify-center gap-8">
          {admins.length > 0 ? (
            admins.map((admin) => (
              <CardAdmin
                key={admin._id}
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
            ))
          ) : (
            <div className="text-center p-8 text-branco">
              <p className="text-xl mb-4">Nenhum administrador encontrado</p>
            </div>
          )}
          <AdicionarAdmin onAdicionarAdmin={handleCreateAdmin} userRole={userRole} />
        </div>
      </div>
      {adminEditando && (
        <ModalEditarAdmin
          admin={adminEditando}
          onSave={handleSaveAdmin}
          onClose={() => setAdminEditando(null)}
        />
      )}
    </div>
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