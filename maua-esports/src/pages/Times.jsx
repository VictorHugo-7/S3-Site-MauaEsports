import React, { useState, useEffect } from "react";
import CardTime from "../components/CardTime";
import EditarTime from "../components/ModalEditarTime";
import AdicionarTime from "../components/AdicionarTime";
import PageBanner from "../components/PageBanner";
import AlertaErro from "../components/AlertaErro";
import AlertaOk from "../components/AlertaOk";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import PropTypes from "prop-types";

const API_BASE_URL = "http://localhost:3000";

const Times = () => {
  const [times, setTimes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [timeEditando, setTimeEditando] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const { instance } = useMsal();

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
    if (successMessage || erroCarregamento) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setErroCarregamento(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, erroCarregamento]);

  const carregarTimes = async () => {
    try {
      setCarregando(true);
      setErroCarregamento(null);

      const response = await axios.get(`${API_BASE_URL}/times`, {
        headers: { Accept: "application/json" },
      });

      if (!Array.isArray(response.data)) {
        throw new Error("Formato de dados inválido do servidor");
      }

      const timesComUrls = response.data.map((time) => ({
        ...time,
        fotoUrl: `${API_BASE_URL}/times/${time._id}/foto?${Date.now()}`,
        jogoUrl: `${API_BASE_URL}/times/${time._id}/jogo?${Date.now()}`,
      }));

      setTimes(timesComUrls);
    } catch (error) {
      console.error("Erro ao carregar times:", error);
      setErroCarregamento(
        error.response
          ? error.response.data.message || "Erro ao carregar times"
          : error.message.includes("Network Error")
          ? "Servidor não responde. Verifique sua conexão ou tente novamente."
          : error.message
      );
      setTimes([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarTimes();
  }, []);

  const handleDeleteTime = async (timeId) => {
    if (userRole !== "Administrador" && userRole !== "Administrador Geral") {
      setErroCarregamento("Você não tem permissão para excluir times");
      return;
    }
    try {
      await axios.delete(`${API_BASE_URL}/times/${timeId}`);
      setTimes(times.filter((time) => time._id !== timeId));
      setSuccessMessage("Time excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar time:", error);
      setErroCarregamento(
        error.response?.data?.message ||
          "Não foi possível excluir o time. Verifique se não há jogadores associados."
      );
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

  const handleSaveTime = async (timeAtualizado) => {
    try {
      const formData = new FormData();
      formData.append("nome", timeAtualizado.nome);

      if (timeAtualizado.foto && timeAtualizado.foto.startsWith("data:image")) {
        const fotoBlob = dataURLtoBlob(timeAtualizado.foto);
        formData.append("foto", fotoBlob, `foto-${Date.now()}.jpg`);
      }

      if (timeAtualizado.jogo && timeAtualizado.jogo.startsWith("data:image")) {
        const jogoBlob = dataURLtoBlob(timeAtualizado.jogo);
        formData.append("jogo", jogoBlob, `jogo-${Date.now()}.jpg`);
      }

      const response = await axios.put(
        `${API_BASE_URL}/times/${timeAtualizado._id}`,
        formData
      );

      setTimes(
        times.map((time) =>
          time._id === timeAtualizado._id
            ? {
                ...response.data,
                fotoUrl: `${API_BASE_URL}/times/${
                  response.data._id
                }/foto?${Date.now()}`,
                jogoUrl: `${API_BASE_URL}/times/${
                  response.data._id
                }/jogo?${Date.now()}`,
              }
            : time
        )
      );

      setTimeEditando(null);
      setSuccessMessage("Time atualizado com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao atualizar time:", error);
      setErroCarregamento(
        error.response?.data?.message || "Erro ao atualizar time"
      );
      throw error;
    }
  };

  const handleCreateTime = async (novoTime) => {
    try {
      const formData = new FormData();
      formData.append("nome", novoTime.nome);

      if (novoTime.foto && novoTime.foto.startsWith("data:image")) {
        const fotoBlob = dataURLtoBlob(novoTime.foto);
        formData.append("foto", fotoBlob, `foto-${Date.now()}.jpg`);
      }

      if (novoTime.jogo && novoTime.jogo.startsWith("data:image")) {
        const jogoBlob = dataURLtoBlob(novoTime.jogo);
        formData.append("jogo", jogoBlob, `jogo-${Date.now()}.jpg`);
      }

      const response = await axios.post(`${API_BASE_URL}/times`, formData);

      setTimes([
        ...times,
        {
          ...response.data,
          fotoUrl: `${API_BASE_URL}/times/${
            response.data._id
          }/foto?${Date.now()}`,
          jogoUrl: `${API_BASE_URL}/times/${
            response.data._id
          }/jogo?${Date.now()}`,
        },
      ]);

      setSuccessMessage("Time criado com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao criar time:", error);
      const errorMessage =
        error.response?.data?.message || "Erro ao criar time. Tente novamente.";
      setErroCarregamento(errorMessage);
      throw error;
    }
  };

  const handleEditClick = (timeId) => {
    const time = times.find((t) => t._id === timeId);
    setTimeEditando({
      ...time,
      foto: time.fotoUrl,
      jogo: time.jogoUrl,
    });
  };

  if (carregando) {
    return (
      <div
        className="w-full min-h-screen bg-fundo flex items-center justify-center"
        aria-live="polite"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-azul-claro"></div>
        <p className="text-branco ml-4">Carregando times...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-fundo">
      {successMessage && <AlertaOk mensagem={successMessage} />}
      {erroCarregamento && <AlertaErro mensagem={erroCarregamento} />}
      <div className="bg-[#010409] h-[104px]"></div>
      <PageBanner pageName="Escolha seu time!" />
      <div className="bg-fundo w-full flex justify-center items-center overflow-auto scrollbar-hidden">
        <div className="w-full flex flex-wrap py-16 justify-center gap-8">
          {times.length > 0 ? (
            times.map((time) => (
              <CardTime
                key={time._id}
                timeId={time._id}
                nome={time.nome}
                foto={`${API_BASE_URL}/times/${time._id}/foto?${Date.now()}`}
                jogo={`${API_BASE_URL}/times/${time._id}/jogo?${Date.now()}`}
                onDelete={handleDeleteTime}
                onEditClick={handleEditClick}
                userRole={userRole}
              />
            ))
          ) : (
            <div className="text-center p-8 text-branco">
              <p className="text-xl mb-4">Nenhum time encontrado</p>
            </div>
          )}
          <AdicionarTime
            onAdicionarTime={handleCreateTime}
            userRole={userRole}
          />
        </div>
      </div>
      {timeEditando && (
        <EditarTime
          time={timeEditando}
          onSave={handleSaveTime}
          onClose={() => setTimeEditando(null)}
        />
      )}
    </div>
  );
};

Times.propTypes = {
  userRole: PropTypes.oneOf([
    "Jogador",
    "Administrador",
    "Administrador Geral",
    null,
  ]),
};

export default Times;
