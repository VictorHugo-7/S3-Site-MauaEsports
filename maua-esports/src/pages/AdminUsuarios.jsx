import React, { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { FaUserPlus, FaSearch, FaUserCog, FaTimes } from "react-icons/fa";
import EditarBtn from "../components/EditarBtn";
import DeletarBtn from "../components/DeletarBtn";
import ModalUsuario from "../components/ModalUsuario";
import PageBanner from "../components/PageBanner";
import AlertaErro from "../components/AlertaErro";
import AlertaOk from "../components/AlertaOk";
import axios from "axios";
import { HiUserCircle } from "react-icons/hi2";

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

  const [times, setTimes] = useState([]);
  const [loadingTimes, setLoadingTimes] = useState(true);
  // Estado para controle da imagem ampliada
  const [imagemAmpliada, setImagemAmpliada] = useState({
    aberto: false,
    src: null,
    alt: "",
  });

  const fetchTimes = async () => {
    try {
      const response = await axios.get("/api/modality/all", {
        headers: { Authorization: "Bearer frontendmauaesports" },
      });

      // A API retorna um objeto onde cada chave é um ID
      setTimes(response.data);
      setLoadingTimes(false);
    } catch (err) {
      console.error("Erro ao carregar times:", err);
      setError("Erro ao carregar lista de times");
      setTimes({}); // Objeto vazio em caso de erro
      setLoadingTimes(false);
    }
  };

  // Função para abrir a imagem ampliada
  const abrirImagemAmpliada = (src, alt) => {
    setImagemAmpliada({
      aberto: true,
      src,
      alt,
    });
  };

  const isCurrentAdminGeral = (usuario) => {
    return (
      usuario.email === currentUser?.username &&
      usuario.tipoUsuario === "Administrador Geral"
    );
  };

  // Função para fechar a imagem ampliada
  const fecharImagemAmpliada = () => {
    setImagemAmpliada({
      aberto: false,
      src: null,
      alt: "",
    });
  };

  useEffect(() => {
    const account = instance.getActiveAccount();
    if (account) {
      setCurrentUser(account);
      fetchUsuarios();
      fetchTimes();
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

    // Administrador Geral não pode gerenciar a si mesmo
    if (isCurrentAdminGeral(usuarioAlvo)) {
      return false;
    }

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

    // Capitão só pode gerenciar jogadores do seu time
    if (usuarioAtual.tipoUsuario === "Capitão de time") {
      return (
        usuarioAlvo.tipoUsuario === "Jogador" &&
        usuarioAlvo.time === usuarioAtual.time
      );
    }

    return false;
  };

  const podeAdicionarTipo = (tipo) => {
    const usuarioAtual = usuarios.find(
      (u) => u.email === currentUser?.username
    );
    if (!usuarioAtual) return false;

    // Administrador Geral pode adicionar todos, exceto outro Administrador Geral
    if (usuarioAtual.tipoUsuario === "Administrador Geral") {
      return tipo !== "Administrador Geral";
    }

    // Administrador pode adicionar Admins, Capitães e Jogadores
    if (usuarioAtual.tipoUsuario === "Administrador") {
      return ["Administrador", "Capitão de time", "Jogador"].includes(tipo);
    }

    // Capitão pode adicionar APENAS Jogadores
    if (usuarioAtual.tipoUsuario === "Capitão de time") {
      return tipo === "Jogador";
    }

    return false;
  };

  // Verifica se o time é válido para o tipo de usuário
  const timeValidoParaTipo = (tipoUsuario, time) => {
    if (
      tipoUsuario === "Administrador Geral" ||
      tipoUsuario === "Administrador"
    ) {
      return true; // Admins não precisam de time
    }
    return !!time; // Capitães e jogadores precisam ter um time
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

      setUsuarios(usuarios.filter((u) => u._id !== id));
      setSuccess(`Usuário ${usuario.email} excluído com sucesso!`);
      setError(null);
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
      const usuarioAtual = usuarios.find(
        (u) => u.email === currentUser?.username
      );

      // Validação específica para capitães
      if (usuarioAtual?.tipoUsuario === "Capitão de time") {
        if (!modoEdicao && formData.tipoUsuario !== "Jogador") {
          alert("Como Capitão, você só pode adicionar jogadores!");

          return;
        }

        if (formData.time !== usuarioAtual.time) {
          alert("Você só pode adicionar jogadores do seu próprio time!");

          return;
        }
      }
      // Verificação se é auto-edição
      const isSelfEdit =
        modoEdicao && usuarioSelecionado?.email === currentUser?.username;

      if (isSelfEdit) {
        // Administrador Geral não pode se editar
        if (usuarioSelecionado.tipoUsuario === "Administrador Geral") {
          alert("Administrador Geral não pode editar seu próprio perfil!");
          return;
        }

        // Capitão não pode mudar seu próprio time
        if (
          usuarioSelecionado.tipoUsuario === "Capitão de time" &&
          formData.time !== usuarioSelecionado.time
        ) {
          alert("Você não pode alterar o time ao qual está vinculado!");
          return;
        }

        // Capitão só pode abaixar seu próprio cargo (não pode se promover)
        if (
          usuarioSelecionado.tipoUsuario === "Capitão de time" &&
          formData.tipoUsuario !== "Capitão de time" &&
          formData.tipoUsuario !== "Jogador"
        ) {
          alert("Como Capitão, você só pode se rebaixar para Jogador!");
          return;
        }
      } else {
        // Validações normais para edição de outros usuários
        if (!modoEdicao && !podeAdicionarTipo(formData.tipoUsuario)) {
          alert("Você não tem permissão para adicionar este tipo de usuário!");
          return;
        }

        if (!timeValidoParaTipo(formData.tipoUsuario, formData.time)) {
          alert("Este tipo de usuário precisa estar vinculado a um time!");
          return;
        }
      }

      // Resto do código de submit permanece o mesmo
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
      usuario.tipoUsuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (usuario.time &&
        usuario.time.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading || loadingTimes) {
    return (
      <div className="w-full min-h-screen bg-fundo flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-azul-claro"></div>
        <p className="text-branco ml-4">Carregando dados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-fundo flex flex-col items-center justify-center p-4">
        <div className="bg-preto p-6 rounded-lg max-w-md text-center border border-vermelho-claro">
          <h2 className="text-xl font-bold text-vermelho-claro mb-2">
            Erro ao carregar
          </h2>
          <p className="text-branco mb-4">{error}</p>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => {
                fetchUsuarios();
                fetchTimes();
              }}
              className="bg-azul-claro text-branco px-4 py-2 rounded hover:bg-azul-escuro hover:cursor-pointer"
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

  const usuarioAtual = usuarios.find((u) => u.email === currentUser?.username);

  // Jogadores não devem ter acesso a esta tela
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
      {/* Modal da imagem ampliada */}
      {imagemAmpliada.aberto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={fecharImagemAmpliada}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              fecharImagemAmpliada();
            }}
            className="absolute top-4 right-4 text-white text-2xl hover:text-azul-claro transition-colors"
          >
            <FaTimes />
          </button>
          <div
            className="max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imagemAmpliada.src}
              alt={imagemAmpliada.alt}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
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
            times={times}
            usuarioAtual={usuarioAtual}
          />
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="relative w-full sm:w-1/2">
            <FaSearch className="absolute left-3 top-3 text-white" />
            <input
              type="text"
              placeholder="Buscar usuários por email, Discord ID, tipo ou time..."
              className="w-full pl-10 pr-4 py-2 border-2 border-borda rounded-lg focus:outline-none focus:border-azul-claro bg-gray-800 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {["Administrador Geral", "Administrador", "Capitão de time"].includes(
            usuarioAtual.tipoUsuario
          ) && (
            <button
              onClick={abrirModalCriacao}
              className="bg-cyan-800 hover:bg-azul-escuro text-white px-4 py-2 rounded flex items-center gap-2 transition-colors w-full sm:w-auto justify-center hover:cursor-pointer"
              disabled={!podeAdicionarTipo("Jogador", usuarioAtual?.time)} // Verifica se pode adicionar jogador do seu time
            >
              <FaUserPlus /> Adicionar Usuário
            </button>
          )}
        </div>

        <div className="overflow-x-auto bg-gray-800 rounded-lg border-2 border-borda shadow-lg">
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
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-branco uppercase tracking-wider">
                  Data de Criação
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-branco uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-borda">
              {usuariosFiltrados.length > 0 ? (
                usuariosFiltrados.map((usuario) => {
                  const podeGerenciar = podeGerenciarUsuario(usuario);
                  const eUsuarioAtual = usuario.email === currentUser?.username;

                  return (
                    <tr
                      key={usuario._id}
                      className="hover:bg-fundo/50 transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-white h-10 w-10">
                        {!imageErrors[usuario._id] ? (
                          <button
                            onClick={() =>
                              abrirImagemAmpliada(
                                `${API_BASE_URL}/usuarios/${
                                  usuario._id
                                }/foto?t=${Date.now()}`,
                                `Foto de ${usuario.email}`
                              )
                            }
                            className=""
                          >
                            <img
                              src={`${API_BASE_URL}/usuarios/${
                                usuario._id
                              }/foto?t=${Date.now()}`}
                              alt={`Foto de ${usuario.email}`}
                              className="w-11 h-11 transform hover:scale-110 transition-transform duration-300 hover:bg-hover hover:border-2 hover:border-borda object-cover rounded-full cursor-pointer"
                              onError={() => handleImageError(usuario._id)}
                            />
                          </button>
                        ) : (
                          <HiUserCircle className="w-11 h-11 text-white" />
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
                        {usuario.time ||
                          (["Administrador Geral", "Administrador"].includes(
                            usuario.tipoUsuario
                          )
                            ? "-"
                            : "Não definido")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {new Date(usuario.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                        {!podeGerenciarUsuario(usuario) ||
                        isCurrentAdminGeral(usuario) ? (
                          <span className="text-branco">
                            {isCurrentAdminGeral(usuario)
                              ? "Ações não permitidas"
                              : "Sem permissão"}
                          </span>
                        ) : (
                          <>
                            <EditarBtn
                              onClick={() => abrirModalEdicao(usuario)}
                            />
                            <DeletarBtn
                              onDelete={() => handleDelete(usuario._id)}
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
