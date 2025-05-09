import React, { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { FaUserPlus, FaSearch } from "react-icons/fa";
import { HiUserCircle } from "react-icons/hi2";
import EditarBtn from "../components/EditarBtn";
import DeletarBtn from "../components/DeletarBtn";
import ModalUsuario from "../components/ModalUsuario";
import PageBanner from "../components/PageBanner";
import AlertaErro from "../components/AlertaErro";
import AlertaOk from "../components/AlertaOk";

const API_BASE_URL = "http://localhost:3000";

const AdminUsuarios = () => {
  const { instance } = useMsal();
  const [success, setSuccess] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const account = instance.getActiveAccount();
    if (account) {
      setCurrentUser(account);
      fetchUsuarios();
    }
  }, [instance]);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/usuarios`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Erro ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Erro ao carregar usuários");
      }

      setUsuarios(data.data);
      setImageErrors({});
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
      setError(err.message);
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  const podeGerenciarUsuario = (usuarioAlvo) => {
    const usuarioAtual = usuarios.find(
      (u) => u.email === currentUser?.username
    );

    if (!usuarioAtual) return false;

    if (usuarioAlvo.email === currentUser?.username) {
      return true;
    }

    if (usuarioAlvo.tipoUsuario === "Administrador Geral") {
      return false;
    }

    if (usuarioAtual.tipoUsuario === "Administrador Geral") {
      return true;
    }

    if (usuarioAtual.tipoUsuario === "Administrador") {
      return usuarioAlvo.tipoUsuario !== "Administrador Geral";
    }

    if (usuarioAtual.tipoUsuario === "Capitão de time") {
      return ["Capitão de time", "Jogador"].includes(usuarioAlvo.tipoUsuario);
    }

    return false;
  };

  const podeAdicionarTipo = (tipo) => {
    const usuarioAtual = usuarios.find(
      (u) => u.email === currentUser?.username
    );

    if (!usuarioAtual) return false;

    if (usuarioAtual.tipoUsuario === "Administrador Geral") {
      return tipo !== "Administrador Geral";
    }

    if (usuarioAtual.tipoUsuario === "Administrador") {
      return ["Administrador", "Capitão de time", "Jogador"].includes(tipo);
    }

    if (usuarioAtual.tipoUsuario === "Capitão de time") {
      return ["Capitão de time", "Jogador"].includes(tipo);
    }

    return false;
  };

  const handleDelete = async (id) => {
    const usuario = usuarios.find((u) => u._id === id);

    if (!usuario || !podeGerenciarUsuario(usuario)) {
      alert("Você não tem permissão para esta ação!");
      return;
    }

    if (
      !window.confirm(
        `Tem certeza que deseja excluir o usuário ${usuario?.email}?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao excluir usuário");
      }

      setSuccess(`Usuário ${usuario.email} excluído com sucesso!`);
      setError(null);
      setUsuarios(usuarios.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Erro ao excluir usuário:", err);
      setError(err.message);
    }
  };

  const abrirModalEdicao = (usuario) => {
    if (!podeGerenciarUsuario(usuario)) {
      alert("Você não tem permissão para editar este usuário!");
      return;
    }

    setUsuarioSelecionado(usuario);
    setModoEdicao(true);
    setMostrarModal(true);
  };

  const abrirModalCriacao = () => {
    setUsuarioSelecionado(null);
    setModoEdicao(false);
    setMostrarModal(true);
  };

  const fecharModal = () => {
    setMostrarModal(false);
  };

  const handleSubmit = async (formData) => {
    try {
      if (!modoEdicao && !podeAdicionarTipo(formData.tipoUsuario)) {
        alert("Você não tem permissão para adicionar este tipo de usuário!");
        return;
      }

      if (modoEdicao) {
        const usuarioOriginal = usuarios.find(
          (u) => u._id === usuarioSelecionado._id
        );
        if (
          usuarioOriginal &&
          formData.tipoUsuario !== usuarioOriginal.tipoUsuario
        ) {
          if (!podeAdicionarTipo(formData.tipoUsuario)) {
            alert(
              "Você não tem permissão para alterar para este tipo de usuário!"
            );
            return;
          }
        }
      }

      const url = modoEdicao
        ? `${API_BASE_URL}/usuarios/${usuarioSelecionado._id}`
        : `${API_BASE_URL}/usuarios`;

      const method = modoEdicao ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao salvar usuário");
      }

      const result = await response.json();

      if (result.success) {
        fetchUsuarios();
        fecharModal();
        setSuccess(
          modoEdicao
            ? "Usuário atualizado com sucesso!"
            : "Usuário criado com sucesso!"
        );
        setError(null);
      } else {
        throw new Error(result.message || "Operação falhou");
      }
    } catch (err) {
      console.error("Erro ao salvar usuário:", err);
      setError(err.message);
    }
  };

  const handleImageError = (userId) => {
    console.log(`Erro ao carregar imagem para usuário ${userId}`);
    setImageErrors((prev) => ({ ...prev, [userId]: true }));
  };

  const usuariosFiltrados = usuarios.filter(
    (usuario) =>
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (usuario.discordID && usuario.discordID.includes(searchTerm)) ||
      usuario.tipoUsuario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className="w-full min-h-screen bg-fundo flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-azul-claro"></div>
        <p className="text-branco ml-4">Carregando usuários...</p>
      </div>
    );

  if (error)
    return (
      <div className="w-full min-h-screen bg-fundo flex flex-col items-center justify-center p-4">
        <div className="bg-preto p-6 rounded-lg max-w-md text-center border border-vermelho-claro">
          <h2 className="text-xl font-bold text-vermelho-claro mb-2">
            Erro ao carregar
          </h2>
          <p className="text-branco mb-4">{error}</p>
          <div className="flex flex-col space-y-2">
            <button
              onClick={fetchUsuarios}
              className="bg-azul-escuro text-branco px-4 py-2 rounded hover:bg-azul-escuro"
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

  const usuarioAtual = usuarios.find((u) => u.email === currentUser?.username);

  if (!usuarioAtual || usuarioAtual.tipoUsuario === "Jogador") {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Acesso não autorizado</h2>
        <p>Você não tem permissão para acessar esta área.</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-fundo flex flex-col items-center">
      <div className="w-full bg-navbar mb-10">
        <div className="h-[104px]"></div>
        <PageBanner
          pageName="Gerenciamento de Usuários"
          className="bg-navbar"
        />
        <AlertaErro mensagem={error} />
        <AlertaOk mensagem={success} />
      </div>

      <div className="w-[95%] sm:w-4/5 lg:w-3/4 mx-auto mb-10">
        {mostrarModal && (
          <ModalUsuario
            usuario={usuarioSelecionado}
            onSave={handleSubmit}
            onClose={fecharModal}
            modoEdicao={modoEdicao}
            currentUserEmail={currentUser?.username}
            podeAdicionarTipo={podeAdicionarTipo}
          />
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="relative w-full sm:w-1/2">
            <FaSearch className="absolute left-3 top-3 text-white" />
            <input
              type="text"
              placeholder="Buscar usuários por email, Discord ID ou tipo..."
              className="w-full pl-10 pr-4 py-2 border-2 border-borda rounded-lg focus:outline-none focus:border-azul-claro bg-navbar text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {["Administrador Geral", "Administrador", "Capitão de time"].includes(
            usuarioAtual.tipoUsuario
          ) && (
            <button
              onClick={abrirModalCriacao}
              className="bg-azul-claro hover:bg-azul-escuro text-white px-4 py-2 rounded flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
              disabled={
                ![
                  "Administrador Geral",
                  "Administrador",
                  "Capitão de time",
                ].some((tipo) => podeAdicionarTipo(tipo))
              }
            >
              <FaUserPlus /> Adicionar Usuário
            </button>
          )}
        </div>

        <div className="overflow-x-auto bg-navbar rounded-lg border-2 border-borda shadow-lg">
          <table className="min-w-full divide-y divide-borda">
            <thead className="bg-cinza-escuro">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-branco uppercase tracking-wider">
                  Foto
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-branco uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-branco uppercase tracking-wider">
                  Discord ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-branco uppercase tracking-wider">
                  Tipo de Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-branco uppercase tracking-wider">
                  Data de Criação
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-branco uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-navbar divide-y divide-borda">
              {usuariosFiltrados.length > 0 ? (
                usuariosFiltrados.map((usuario) => {
                  const podeGerenciar = podeGerenciarUsuario(usuario);
                  const eUsuarioAtual = usuario.email === currentUser?.username;

                  return (
                    <tr
                      key={usuario._id}
                      className="hover:bg-fundo/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {!imageErrors[usuario._id] ? (
                          <img
                            src={`${API_BASE_URL}/usuarios/${
                              usuario._id
                            }/foto?t=${Date.now()}`}
                            alt={`Foto de ${usuario.email}`}
                            className="w-10 h-10 rounded-full object-cover border-2 border-azul-claro"
                            onError={() => handleImageError(usuario._id)}
                          />
                        ) : (
                          <HiUserCircle className="w-10 h-10 text-white" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {usuario.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {usuario.discordID || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {usuario.tipoUsuario}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {new Date(usuario.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                        {!podeGerenciar ? (
                          <span className="text-branco">Sem permissão</span>
                        ) : (
                          <>
                            <EditarBtn
                              onClick={() => abrirModalEdicao(usuario)}
                              disabled={eUsuarioAtual}
                            />
                            <DeletarBtn
                              onDelete={() => handleDelete(usuario._id)}
                              disabled={eUsuarioAtual}
                            />
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-cinza-escuro"
                  >
                    Nenhum usuário encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsuarios;
