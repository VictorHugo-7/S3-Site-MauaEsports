// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import CardTime from "../components/CardTime";
import EditarTime from "../components/ModalEditarTime";
import AdicionarTime from "../components/AdicionarTime";

const API_BASE_URL = "http://localhost:3000";


const Times = () => {
  const [times, setTimes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState(null);
  const [timeEditando, setTimeEditando] = useState(null);

  const carregarTimes = async () => {
    try {
      setCarregando(true);
      setErroCarregamento(null);

      const response = await fetch(`${API_BASE_URL}/times`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Erro ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Formato de dados inválido do servidor");
      }

      // Adicione um timestamp único para evitar cache
      const timesComUrls = data.map((time) => ({
        ...time,
        fotoUrl: `${API_BASE_URL}/times/${time.id}/foto?${Date.now()}`,
        jogoUrl: `${API_BASE_URL}/times/${time.id}/jogo?${Date.now()}`,
      }));

      setTimes(timesComUrls.sort((a, b) => a.id - b.id));
    } catch (error) {
      console.error("Erro ao carregar times:", error);
      setErroCarregamento(
        error.message.includes("JSON") || error.message.includes("<!DOCTYPE")
          ? "Erro no formato dos dados recebidos do servidor"
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
    const time = times.find((t) => t.id === timeId);
    if (
      !window.confirm(`Tem certeza que deseja excluir o time "${time.nome}"?`)
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/times/${timeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Falha ao excluir time");
      }

      setTimes(times.filter((time) => time.id !== timeId));
    } catch (error) {
      console.error("Erro ao deletar time:", error);
      alert(
        error.message ||
          "Não foi possível excluir o time. Verifique se não há jogadores associados."
      );
    }
  };

  const handleSaveTime = async (timeAtualizado) => {
    try {
      const formData = new FormData();
      formData.append("nome", timeAtualizado.nome);
      formData.append("rota", timeAtualizado.rota);

      if (timeAtualizado.foto && typeof timeAtualizado.foto !== "string") {
        formData.append("foto", timeAtualizado.foto);
      }

      if (timeAtualizado.jogo && typeof timeAtualizado.jogo !== "string") {
        formData.append("jogo", timeAtualizado.jogo);
      }

      const response = await fetch(
        `${API_BASE_URL}/times/${timeAtualizado.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao atualizar time");
      }

      const data = await response.json();
      setTimes(
        times.map((time) => (time.id === timeAtualizado.id ? data : time))
      );
      setTimeEditando(null);
    } catch (error) {
      console.error("Erro ao atualizar time:", error);
      alert(
        error.message || "Erro ao atualizar time. Por favor, tente novamente."
      );
    }
  };

  const handleCreateTime = async (novoTime) => {
    try {
      const idExistente = times.some(
        (time) => time.id === parseInt(novoTime.id)
      );
      if (idExistente) {
        throw new Error(
          "Já existe um time com este ID. Por favor, use um ID diferente."
        );
      }
      const formData = new FormData();
      formData.append("id", novoTime.id);
      formData.append("nome", novoTime.nome);
      formData.append("rota", novoTime.rota);
      formData.append("foto", novoTime.foto);
      formData.append("jogo", novoTime.jogo);
  
      const response = await fetch(`${API_BASE_URL}/times`, {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao criar time");
      }


      const data = await response.json();
      setTimes([...times, data].sort((a, b) => a.id - b.id));
    } catch (error) {
      console.error("Erro ao criar time:", error);
      alert(error.message || "Erro ao criar time. Por favor, tente novamente.");
    }
  };

  const handleEditClick = (timeId) => {
    const time = times.find((t) => t.id === timeId);
    setTimeEditando({
      ...time,
      foto: time.fotoUrl, // Usamos a URL completa para o preview
      jogo: time.jogoUrl,
    });
  };

  if (carregando) {
    return (
      <div className="w-full min-h-screen bg-fundo flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-azul-claro"></div>
        <p className="text-branco ml-4">Carregando times...</p>
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
              onClick={carregarTimes}
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
      <div className="flex w-full bg-preto h-60 justify-center items-center relative">
        <h1 className="font-blinker text-branco font-bold text-3xl">
          Escolha seu time!
        </h1>
      </div>

      <div className="bg-fundo w-full flex justify-center items-center overflow-auto scrollbar-hidden">
        <div className="w-full flex flex-wrap py-16 justify-center gap-8">
          {times.length > 0 ? (
            times.map((time) => (
              <CardTime
                key={time._id}
                timeId={time.id}
                nome={time.nome}
                foto={`${API_BASE_URL}/times/${time.id}/foto`}
                rota={time.rota} 
                jogo={`${API_BASE_URL}/times/${time.id}/jogo`}
                onDelete={handleDeleteTime}
                onEditClick={handleEditClick}
              />
            ))
          ) : (
            <div className="text-center p-8 text-branco">
              <p className="text-xl mb-4">Nenhum time encontrado</p>
            </div>
          )}
          <AdicionarTime onAdicionarTime={handleCreateTime} />
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

export default Times;
