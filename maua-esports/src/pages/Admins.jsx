import React, { useState, useEffect } from "react";
import CardAdmin from "../components/CardAdmin";
import ModalEditarAdmin from "../components/ModalEditarAdmin";
import AdicionarAdmin from "../components/AdicionarAdmin";
import PageBanner from "../components/PageBanner";
import AlertaErro from "../components/AlertaErro";
import AlertaOk from "../components/AlertaOk";

const API_BASE_URL = "http://localhost:3000";

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState(null);
  const [adminEditando, setAdminEditando] = useState(null);
  const [erro, setErro] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const carregarAdmins = async () => {
    try {
      setCarregando(true);
      setErroCarregamento(null);

      if (!API_BASE_URL) {
        throw new Error("URL da API não configurada");
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${API_BASE_URL}/admins`, {
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMsg = `Erro ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) {
          const errorText = await response.text();
          if (errorText) errorMsg = errorText;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Formato de dados inválido do servidor");
      }

      const adminsComUrls = data.map((admin) => ({
        ...admin,
        fotoUrl: admin.foto
          ? `${API_BASE_URL}/admins/${admin._id}/foto?${Date.now()}`
          : null,
      }));

      setAdmins(adminsComUrls);
    } catch (error) {
      console.error("Erro ao carregar admins:", error);

      let mensagemErro = "Erro ao carregar administradores";
      if (error.name === "AbortError") {
        mensagemErro = "Tempo de conexão excedido. Verifique sua internet.";
      } else if (error.message.includes("Failed to fetch")) {
        mensagemErro =
          "Não foi possível conectar ao servidor. Verifique:\n1. Se o servidor está rodando\n2. Se a URL está correta\n3. Se não há problemas de CORS";
      } else {
        mensagemErro = error.message;
      }

      setErroCarregamento(mensagemErro);
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
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Falha ao deletar admin");
      }

      setAdmins((prev) => prev.filter((a) => a._id !== adminId));
      setSuccessMessage("Administrador deletado com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar admin:", error);
      setErro(`Erro ao deletar administrador: ${error.message}`);
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

      if (adminAtualizado.foto instanceof File) {
        formData.append("foto", adminAtualizado.foto);
      } else if (adminAtualizado.foto === null) {
        formData.append("removeFoto", "true");
      }

      const response = await fetch(
        `${API_BASE_URL}/admins/${adminAtualizado._id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Falha ao atualizar admin");
      }

      const data = await response.json();

      setAdmins((prev) =>
        prev.map((admin) =>
          admin._id === adminAtualizado._id
            ? {
              ...admin,
              nome: data.nome,
              titulo: data.titulo,
              descricao: data.descricao,
              insta: data.insta,
              twitter: data.twitter,
              twitch: data.twitch,
              // Força o recarregamento da imagem
              fotoUrl: data.foto
                ? `${API_BASE_URL}/admins/${data._id}/foto?${Date.now()}`
                : null,
            }
            : admin
        )
      );

      setAdminEditando(null);
      carregarAdmins();
      setSuccessMessage("Administrador atualizado com sucesso!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Erro na edição:", error);
      setErro(error.message || "Erro ao atualizar administrador");
      setTimeout(() => setErro(null), 3000);
    }
  };

  const handleCreateAdmin = async (novoAdmin) => {
    try {
      const formData = new FormData();
      formData.append("nome", novoAdmin.nome.trim());
      formData.append("titulo", novoAdmin.titulo.trim());
      formData.append("descricao", novoAdmin.descricao.trim());

      if (novoAdmin.instagram)
        formData.append("insta", novoAdmin.instagram.trim());
      if (novoAdmin.twitter)
        formData.append("twitter", novoAdmin.twitter.trim());
      if (novoAdmin.twitch) formData.append("twitch", novoAdmin.twitch.trim());
      if (novoAdmin.foto instanceof File) {
        formData.append("foto", novoAdmin.foto);
      }

      const response = await fetch(`${API_BASE_URL}/admins`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar administrador");
      }

      const data = await response.json();

      setAdmins((prev) => [
        ...prev,
        {
          ...data.admin,
          fotoUrl: data.admin.foto
            ? `${API_BASE_URL}/admins/${data.admin._id}/foto?${Date.now()}`
            : null,
        },
      ]);

      setSuccessMessage("Administrador criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar admin:", error);
      setErro(error.message || "Erro ao criar administrador");
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
      <div className="w-full min-h-screen bg-fundo flex items-center justify-center">
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
            >
              Tentar novamente
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-cinza-escuro text-branco px-4 py-2 rounded hover:bg-cinza-claro"
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

      <div className="bg-[#010409] h-[104px]">.</div>

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
              />
            ))
          ) : (
            <div className="text-center p-8 text-branco">
              <p className="text-xl mb-4">Nenhum administrador encontrado</p>
            </div>
          )}
          <AdicionarAdmin onAdicionarAdmin={handleCreateAdmin} />
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

export default Admins;
