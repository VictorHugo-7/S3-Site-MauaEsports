import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CardJogador from "../components/CardJogador";
import AdicionarMembro from "../components/AdicionarMembro";
import PageBanner from "../components/PageBanner";
import AlertaErro from "../components/AlertaErro";
import AlertaOk from "../components/AlertaOk";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import PropTypes from "prop-types";

const API_BASE_URL = "http://localhost:3000";

const Membros = () => {
  const { timeId } = useParams();
  const [jogadores, setJogadores] = useState([]);
  const [time, setTime] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const { instance } = useMsal();

  const carregarDados = async () => {
    try {
      setCarregando(true);
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

      setJogadores(
        responseJogadores.data.map((j) => ({
          ...j,
          fotoUrl: `${API_BASE_URL}/jogadores/${j._id}/imagem?${Date.now()}`,
        }))
      );
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
      setCarregando(false);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const account = instance.getActiveAccount();
        if (!account) {
          setUserRole(null); // Usuário não logado
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
        setUserRole(null); // Tratar erro como usuário não logado
      }
    };

    loadUserData();
  }, [instance]);

  useEffect(() => {
    carregarDados();
  }, [timeId]);

  const handleDeleteJogador = async (jogadorId) => {
    try {
      await axios.delete(`${API_BASE_URL}/jogadores/${jogadorId}`);
      setJogadores((prev) => prev.filter((j) => j._id !== jogadorId));
      setSuccessMessage("Jogador deletado com sucesso!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Erro ao deletar jogador:", error);
      setErro(
        error.response?.data?.message || "Erro ao deletar jogador"
      );
      setTimeout(() => setErro(null), 3000);
    }
  };

  const handleEditJogador = async (jogadorId, updatedData) => {
    try {
      const formData = new FormData();
      formData.append("nome", updatedData.nome);
      formData.append("titulo", updatedData.titulo);
      formData.append("descricao", updatedData.descricao);
      formData.append("insta", updatedData.instagram || "");
      formData.append("twitter", updatedData.twitter || "");
      formData.append("twitch", updatedData.twitch || "");

      if (updatedData.foto instanceof File) {
        formData.append("foto", updatedData.foto);
      } else if (updatedData.foto === null) {
        formData.append("removeFoto", "true");
      }

      const response = await axios.put(
        `${API_BASE_URL}/jogadores/${jogadorId}`,
        formData
      );

      setJogadores((prev) =>
        prev.map((jogador) =>
          jogador._id === jogadorId
            ? {
                ...jogador,
                nome: response.data.nome,
                titulo: response.data.titulo,
                descricao: response.data.descricao,
                insta: response.data.insta,
                twitter: response.data.twitter,
                twitch: response.data.twitch,
                fotoUrl: `${API_BASE_URL}/jogadores/${response.data._id}/imagem?${Date.now()}`,
              }
            : jogador
        )
      );

      setSuccessMessage("Jogador atualizado com sucesso!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Erro ao atualizar jogador:", error);
      setErro(
        error.response?.data?.message || "Erro ao atualizar jogador"
      );
      setTimeout(() => setErro(null), 3000);
    }
  };

  const handleAdicionarMembro = async (novoJogador) => {
    try {
      const formData = new FormData();
      formData.append("nome", novoJogador.nome);
      formData.append("titulo", novoJogador.titulo);
      formData.append("descricao", novoJogador.descricao);
      formData.append("time", novoJogador.time);

      if (novoJogador.insta) formData.append("insta", novoJogador.insta);
      if (novoJogador.twitter) formData.append("twitter", novoJogador.twitter);
      if (novoJogador.twitch) formData.append("twitch", novoJogador.twitch);

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
      setErro(
        error.response?.data?.message || "Erro ao adicionar jogador"
      );
      setTimeout(() => setErro(null), 3000);
    }
  };

  if (carregando) {
    return (
      <div
        className="w-full min-h-screen bg-fundo flex items-center justify-center"
        aria-live="polite"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-azul-claro"></div>
        <p className="text-branco ml-4">Carregando membros...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-fundo">
      {erro && <AlertaErro mensagem={erro} />}
      {successMessage && <AlertaOk mensagem={successMessage} />}
      <div className="bg-[#010409] h-[104px]"></div>
      <PageBanner
        pageName={time?.nome ? `Membros do ${time.nome}` : "Membros do Time"}
      />
      <div className="bg-fundo w-full flex justify-center items-center overflow-auto scrollbar-hidden">
        <div className="w-full flex flex-wrap py-16 justify-center gap-8">
          {jogadores.length > 0 ? (
            jogadores.map((jogador) => (
              <CardJogador
                key={jogador._id}
                jogadorId={jogador._id}
                nome={jogador.nome}
                titulo={jogador.titulo}
                descricao={jogador.descricao}
                foto={jogador.fotoUrl}
                instagram={jogador.insta}
                twitter={jogador.twitter}
                twitch={jogador.twitch}
                onDelete={handleDeleteJogador}
                onEdit={handleEditJogador}
                logoTime={time?.logoUrl}
                userRole={userRole}
              />
            ))
          ) : (
            <div className="text-center p-8 text-branco">
              <p className="text-xl mb-4">Nenhum jogador encontrado</p>
            </div>
          )}
          <AdicionarMembro
            onAdicionarMembro={handleAdicionarMembro}
            timeId={timeId}
            userRole={userRole}
          />
        </div>
      </div>
    </div>
  );
};

Membros.propTypes = {
  userRole: PropTypes.oneOf([
    "Jogador",
    "Administrador",
    "Administrador Geral",
    null,
  ]),
};

export default Membros;