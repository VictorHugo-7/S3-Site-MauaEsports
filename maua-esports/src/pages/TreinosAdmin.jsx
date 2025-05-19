import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  MdChevronRight,
  MdChevronLeft,
  MdClear,
  MdEdit,
  MdSave,
  MdClose,
  MdAdd,
} from "react-icons/md";
import Rodape from "../components/Rodape";
import PageBanner from "../components/PageBanner";
import { useNavigate, Link } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import AlertaErro from "../components/AlertaErro";
import AlertaOk from "../components/AlertaOk";
import DeletarBtn from "../components/DeletarBtn";

const Agendamento = ({
  inicio,
  fim,
  diaSemana,
  time,
  status,
  onEditar,
  onExcluir,
  userRole, // Nova prop adicionada
}) => {
  const diasDaSemana = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:mx-4 my-0 min-h-[80px] border-b border-borda">
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-8 w-full sm:w-auto">
        <div className="flex flex-col items-center w-full sm:w-40">
          <span className="text-branco font-bold">
            {inicio} - {fim}
          </span>
          <span className="text-azul-claro text-sm">
            Duração: {calcularDuracao(inicio, fim)}
          </span>
        </div>

        <div className="w-32 text-center">
          <span className="text-branco">{diasDaSemana[diaSemana]}</span>
        </div>

        <div className="ml-3 text-sm w-full sm:w-48 text-center sm:text-left">
          <p className="font-semibold text-white font-blinker">{time}</p>
        </div>
      </div>

      {userRole !== "Jogador" && ( // Usa a prop userRole diretamente
        <div className="flex flex-row justify-center items-center sm:w-1/4 mt-2 sm:mt-0">
          <button
            onClick={onEditar}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="text-azul-claro text-2xl cursor-pointer mx-2"
          >
            <MdEdit
              className="w-6 h-6"
              style={{
                animation: isHovered ? "shake 0.7s ease-in-out" : "none",
                transformOrigin: "center center",
              }}
            />
          </button>
          <DeletarBtn
            onDelete={onExcluir}
            className="text-vermelho-claro text-2xl cursor-pointer mx-2 hover:text-red-500"
          />
        </div>
      )}
    </div>
  );
};

function calcularDuracao(inicio, fim) {
  const [horaInicio, minutoInicio] = inicio.split(":").map(Number);
  const [horaFim, minutoFim] = fim.split(":").map(Number);

  const totalMinutosInicio = horaInicio * 60 + minutoInicio;
  const totalMinutosFim = horaFim * 60 + minutoFim;

  const diferencaMinutos = totalMinutosFim - totalMinutosInicio;

  const horas = Math.floor(diferencaMinutos / 60);
  const minutos = diferencaMinutos % 60;

  return `${horas}h${minutos.toString().padStart(2, "0")}min`;
}

const TreinosAdmin = () => {
  const { instance } = useMsal();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [discordId, setDiscordId] = useState("");
  const [isCaptain, setIsCaptain] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [modalidades, setModalidades] = useState({});
  const [modalidadeSelecionada, setModalidadeSelecionada] = useState("");
  const [agendamentosOriginais, setAgendamentosOriginais] = useState([]);
  const [agendamentosFiltrados, setAgendamentosFiltrados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroDataAtivo, setFiltroDataAtivo] = useState(false);
  const [editandoTreino, setEditandoTreino] = useState(null);
  const [criandoTreino, setCriandoTreino] = useState(false);
  const [formEdicao, setFormEdicao] = useState({
    inicio: "",
    fim: "",
    diaSemana: 0,
  });
  const [formCriacao, setFormCriacao] = useState({
    inicio: "",
    fim: "",
    diaSemana: 1,
    modalidadeId: "",
  });
  const [alertaErro, setAlertaErro] = useState("");
  const [alertaOk, setAlertaOk] = useState("");
  const [userModality, setUserModality] = useState(null);

  const diasDaSemana = [
    { value: 0, label: "Domingo" },
    { value: 1, label: "Segunda" },
    { value: 2, label: "Terça" },
    { value: 3, label: "Quarta" },
    { value: 4, label: "Quinta" },
    { value: 5, label: "Sexta" },
    { value: 6, label: "Sábado" },
  ];

  // Verifica autenticação e carrega dados do usuário
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const account = instance.getActiveAccount();
        if (!account) {
          navigate("/");
          return;
        }

        const response = await axios.get(
          `http://localhost:3000/usuarios/por-email?email=${encodeURIComponent(
            account.username
          )}`
        );
        const userData = response.data.usuario;

        setUserData(userData);
        setUserRole(userData.tipoUsuario);
        setDiscordId(userData.discordID || "");
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        navigate("/nao-autorizado");
      }
    };

    loadUserData();
  }, [instance, navigate]);

  const parseCron = (cron) => {
    const parts = cron.split(" ");
    const [minuto, hora] = parts.slice(1, 3);
    const diaSemana = parts[5] || 0;

    return {
      hora: hora.padStart(2, "0"),
      minuto: minuto.padStart(2, "0"),
      diaSemana: parseInt(diaSemana),
    };
  };

  // Função para determinar a modalidade do usuário
  const determineUserModality = (mods, trainsData) => {
    if (userRole === "Administrador" || userRole === "Administrador Geral") {
      return null; // Admins podem ver tudo
    }

    let userModalityId = null;
    let captainModalityId = null;

    Object.keys(mods).forEach((modId) => {
      const modalityTrains = trainsData.filter((t) => t.ModalityId === modId);

      // Verifica se é capitão (pelo nome no título da modalidade)
      if (userData?.nome && mods[modId].Name.includes(userData.nome)) {
        captainModalityId = modId;
      }

      // Verifica se participou de algum treino
      for (const train of modalityTrains) {
        if (train.AttendedPlayers?.some((p) => p.PlayerId === discordId)) {
          userModalityId = modId;
          break;
        }
      }
    });

    setIsCaptain(!!captainModalityId);
    return captainModalityId || userModalityId;
  };

  useEffect(() => {
    if (!userRole) return; // Espera até ter os dados do usuário

    const fetchData = async () => {
      try {
        const [trainsResponse, modResponse] = await Promise.all([
          axios.get("/api/trains/all", {
            headers: { Authorization: "Bearer frontendmauaesports" },
          }),
          axios.get("/api/modality/all", {
            headers: { Authorization: "Bearer frontendmauaesports" },
          }),
        ]);

        const mods = modResponse.data;
        const userModalityId = determineUserModality(mods, trainsResponse.data);

        // Se não for admin e não tiver modalidade, não mostra nada
        if (
          !(
            userRole === "Administrador" || userRole === "Administrador Geral"
          ) &&
          !userModalityId
        ) {
          setModalidades({});
          setCarregando(false);
          return;
        }

        setModalidades(mods);
        setUserModality(userModalityId);

        const todosAgendamentos = [];

        for (const modId in mods) {
          // Se não for admin, filtra apenas a modalidade do usuário
          if (
            !(
              userRole === "Administrador" || userRole === "Administrador Geral"
            ) &&
            modId !== userModalityId
          ) {
            continue;
          }

          const mod = mods[modId];
          if (mod.ScheduledTrainings && mod.ScheduledTrainings.length > 0) {
            mod.ScheduledTrainings.forEach((treino) => {
              const inicio = parseCron(treino.Start);
              const fim = parseCron(treino.End);

              todosAgendamentos.push({
                id: `${modId}-${treino.Start}`,
                inicio: `${inicio.hora}:${inicio.minuto}`,
                fim: `${fim.hora}:${fim.minuto}`,
                diaSemana: inicio.diaSemana,
                ModalityId: modId,
                NomeModalidade: mod.Name || "Desconhecido",
                cronInicio: treino.Start,
                cronFim: treino.End,
              });
            });
          }
        }

        setAgendamentosOriginais(todosAgendamentos);
        setAgendamentosFiltrados(todosAgendamentos);

        // Define a modalidade inicial
        if (
          userRole === "Administrador" ||
          userRole === "Administrador Geral"
        ) {
          setModalidadeSelecionada(Object.keys(mods)[0] || "");
          setFormCriacao((prev) => ({
            ...prev,
            modalidadeId: Object.keys(mods)[0] || "",
          }));
        } else if (userModalityId) {
          setModalidadeSelecionada(userModalityId);
          setFormCriacao((prev) => ({
            ...prev,
            modalidadeId: userModalityId,
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setAlertaErro("Erro ao carregar dados dos treinos");
      } finally {
        setCarregando(false);
      }
    };

    fetchData();
  }, [userRole, discordId, userData]);

  useEffect(() => {
    let treinosFiltrados = [...agendamentosOriginais];

    if (modalidadeSelecionada) {
      treinosFiltrados = treinosFiltrados.filter(
        (treino) => treino.ModalityId === modalidadeSelecionada
      );
    }

    if (filtroDataAtivo) {
      treinosFiltrados = treinosFiltrados.filter(
        (treino) => treino.diaSemana === dataSelecionada.getDay()
      );
    }

    setAgendamentosFiltrados(treinosFiltrados);
  }, [
    modalidadeSelecionada,
    dataSelecionada,
    filtroDataAtivo,
    agendamentosOriginais,
  ]);

  const limparFiltros = () => {
    setModalidadeSelecionada("");
    setFiltroDataAtivo(false);
    setDataSelecionada(new Date());
  };

  const iniciarEdicao = (treino) => {
    // Verifica se o usuário pode editar este treino
    if (
      userRole !== "Administrador" &&
      userRole !== "Administrador Geral" &&
      treino.ModalityId !== userModality
    ) {
      setAlertaErro("Você não tem permissão para editar este treino");
      return;
    }

    setEditandoTreino(treino);
    setFormEdicao({
      inicio: treino.inicio,
      fim: treino.fim,
      diaSemana: treino.diaSemana,
    });
  };

  const cancelarEdicao = () => {
    setEditandoTreino(null);
    setFormEdicao({ inicio: "", fim: "", diaSemana: 0 });
  };

  const iniciarCriacao = () => {
    setCriandoTreino(true);
  };

  const cancelarCriacao = () => {
    setCriandoTreino(false);
    setFormCriacao({
      inicio: "",
      fim: "",
      diaSemana: 0,
      modalidadeId: userModality || "",
    });
  };

  const handleFormChange = (e, isCriacao = false) => {
    const { name, value } = e.target;
    if (isCriacao) {
      setFormCriacao((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormEdicao((prev) => ({ ...prev, [name]: value }));
    }
  };

  const gerarCron = (horaMinuto, diaSemana) => {
    const [hora, minuto] = horaMinuto.split(":");
    return `0 ${minuto} ${hora} * * ${diaSemana}`;
  };

  const salvarEdicao = async () => {
    if (!editandoTreino || !formEdicao.inicio || !formEdicao.fim) {
      setAlertaErro("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const novaCronInicio = gerarCron(formEdicao.inicio, formEdicao.diaSemana);
      const novaCronFim = gerarCron(formEdicao.fim, formEdicao.diaSemana);

      const modalidade = modalidades[editandoTreino.ModalityId];
      if (!modalidade) {
        setAlertaErro("Modalidade não encontrada");
        throw new Error("Modalidade não encontrada");
      }

      const updatedTrainings = modalidade.ScheduledTrainings.map((t) =>
        t.Start === editandoTreino.cronInicio
          ? { ...t, Start: novaCronInicio, End: novaCronFim }
          : t
      );

      await axios.patch(
        "/api/modality",
        {
          _id: editandoTreino.ModalityId,
          ScheduledTrainings: updatedTrainings,
        },
        {
          headers: {
            Authorization: "Bearer frontendmauaesports",
            "Content-Type": "application/json",
          },
        }
      );

      const updatedAgendamentos = agendamentosOriginais.map((a) =>
        a.id === editandoTreino.id
          ? {
              ...a,
              inicio: formEdicao.inicio,
              fim: formEdicao.fim,
              diaSemana: parseInt(formEdicao.diaSemana),
              cronInicio: novaCronInicio,
              cronFim: novaCronFim,
            }
          : a
      );

      setAgendamentosOriginais(updatedAgendamentos);
      setEditandoTreino(null);
      setFormEdicao({ inicio: "", fim: "", diaSemana: 0 });

      setAlertaOk("Treino atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar treino:", error);
      setAlertaErro("Erro ao atualizar treino");
    }
  };

  const criarTreino = async () => {
    if (!formCriacao.inicio || !formCriacao.fim || !formCriacao.modalidadeId) {
      setAlertaErro("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const novaCronInicio = gerarCron(
        formCriacao.inicio,
        formCriacao.diaSemana
      );
      const novaCronFim = gerarCron(formCriacao.fim, formCriacao.diaSemana);

      const modalidade = modalidades[formCriacao.modalidadeId];
      if (!modalidade) {
        setAlertaErro("Modalidade não encontrada");
        throw new Error("Modalidade não encontrada");
      }

      const novoTreino = {
        Start: novaCronInicio,
        End: novaCronFim,
      };

      const updatedTrainings = [
        ...(modalidade.ScheduledTrainings || []),
        novoTreino,
      ];

      await axios.patch(
        "/api/modality",
        {
          _id: formCriacao.modalidadeId,
          ScheduledTrainings: updatedTrainings,
        },
        {
          headers: {
            Authorization: "Bearer frontendmauaesports",
            "Content-Type": "application/json",
          },
        }
      );

      const novoAgendamento = {
        id: `${formCriacao.modalidadeId}-${novaCronInicio}`,
        inicio: formCriacao.inicio,
        fim: formCriacao.fim,
        diaSemana: parseInt(formCriacao.diaSemana),
        ModalityId: formCriacao.modalidadeId,
        NomeModalidade: modalidade.Name || "Desconhecido",
        cronInicio: novaCronInicio,
        cronFim: novaCronFim,
      };

      setAgendamentosOriginais([...agendamentosOriginais, novoAgendamento]);
      setCriandoTreino(false);
      setFormCriacao({
        inicio: "",
        fim: "",
        diaSemana: 0,
        modalidadeId: userModality || "",
      });

      setAlertaOk("Treino criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar treino:", error);
      setAlertaErro("Erro ao criar treino");
    }
  };

  const excluirTreino = async (treino) => {
    // Verifica se o usuário pode excluir este treino
    if (
      userRole !== "Administrador" &&
      userRole !== "Administrador Geral" &&
      treino.ModalityId !== userModality
    ) {
      setAlertaErro("Você não tem permissão para excluir este treino");
      return;
    }

    const confirmacao = window.confirm(
      `Deseja realmente excluir o treino do time ${treino.NomeModalidade} das ${treino.inicio} às ${treino.fim}?`
    );

    if (!confirmacao) {
      return;
    }

    try {
      const modalidade = modalidades[treino.ModalityId];
      if (!modalidade) {
        setAlertaErro("Modalidade não encontrada");
        throw new Error("Modalidade não encontrada");
      }

      const updatedTrainings = modalidade.ScheduledTrainings.filter(
        (t) => t.Start !== treino.cronInicio
      );

      await axios.patch(
        "/api/modality",
        {
          _id: treino.ModalityId,
          ScheduledTrainings: updatedTrainings,
        },
        {
          headers: {
            Authorization: "Bearer frontendmauaesports",
            "Content-Type": "application/json",
          },
        }
      );

      const updatedAgendamentos = agendamentosOriginais.filter(
        (a) => a.id !== treino.id
      );

      setAgendamentosOriginais(updatedAgendamentos);
      setAlertaOk("Treino excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir treino:", error);
      setAlertaErro("Erro ao excluir treino");
    }
  };

  const Calendario = () => {
    const [mesAtual, setMesAtual] = useState(new Date());

    const obterDiasNoMes = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const primeiroDia = new Date(year, month, 1);
      const ultimoDia = new Date(year, month + 1, 0);

      return {
        diasNoMes: ultimoDia.getDate(),
        diaInicial: primeiroDia.getDay(),
      };
    };

    const mudarMes = (incremento) => {
      setMesAtual(
        new Date(mesAtual.getFullYear(), mesAtual.getMonth() + incremento, 1)
      );
    };

    const { diasNoMes, diaInicial } = obterDiasNoMes(mesAtual);

    return (
      <div className="w-full h-full">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => mudarMes(-1)}
            className="text-azul-claro hover:text-azul-escuro text-2xl"
          >
            <MdChevronLeft />
          </button>
          <h3 className="text-lg sm:text-xl font-bold text-white text-center">
            {mesAtual.toLocaleString("pt-BR", {
              month: "long",
              year: "numeric",
            })}
          </h3>
          <button
            onClick={() => mudarMes(1)}
            className="text-azul-claro hover:text-azul-escuro text-2xl"
          >
            <MdChevronRight />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
            <div
              key={dia}
              className="text-center text-xs sm:text-sm text-white font-semibold py-1 sm:py-2"
            >
              {dia}
            </div>
          ))}

          {Array.from({ length: diaInicial }).map((_, index) => (
            <div key={`empty-${index}`} className="h-6 sm:h-8" />
          ))}

          {Array.from({ length: diasNoMes }, (_, i) => i + 1).map((dia) => {
            const diaAtual = new Date(
              mesAtual.getFullYear(),
              mesAtual.getMonth(),
              dia
            );
            const isSelecionado =
              filtroDataAtivo &&
              dataSelecionada.toDateString() === diaAtual.toDateString();
            const isHoje =
              new Date().toDateString() === diaAtual.toDateString();

            return (
              <button
                key={dia}
                onClick={() => {
                  setDataSelecionada(diaAtual);
                  setFiltroDataAtivo(true);
                }}
                className={`h-6 sm:h-8 text-xs sm:text-sm rounded-full flex items-center justify-center
                  ${
                    isSelecionado
                      ? "bg-azul-claro text-white"
                      : isHoje
                      ? "border-2 border-azul-claro text-white"
                      : "hover:bg-fundo/70 text-white"
                  }`}
              >
                {dia}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const contadores = {
    total: agendamentosFiltrados.length,
  };

  if (carregando) {
    return (
      <div className="text-white text-center py-8">Carregando dados...</div>
    );
  }

  if (
    Object.keys(modalidades).length === 0 &&
    !(userRole === "Administrador" || userRole === "Administrador Geral")
  ) {
    return (
      <div className="min-h-screen bg-[#0D1117] text-white flex items-center justify-center">
        <div className="text-center p-6 max-w-md bg-gray-800 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Nenhum time encontrado</h2>
          <p className="mb-6">
            Você não está registrado em nenhum time ou não tem treinos
            agendados.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-azul-claro rounded-lg hover:bg-azul-escuro transition-colors"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-fundo flex flex-col items-center">
      {/* Alertas de sucesso/erro */}
      <AlertaErro mensagem={alertaErro} />
      <AlertaOk mensagem={alertaOk} />

      {/* Container unificado para NavBar e PageBanner */}
      <div className="w-full bg-navbar mb-10">
        <div className="h-[104px]"></div>
        <PageBanner pageName="Treinos" className="bg-navbar" />
      </div>

      {/* Resumo centralizado */}
      <div className="bg-navbar p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 w-[95%] sm:w-4/5 lg:w-3/4 text-center mx-auto">
        <div className="flex flex-col items-center gap-1 sm:gap-2">
          <h3 className="text-white font-bold text-sm sm:text-base text-center">
            {filtroDataAtivo
              ? `Treinos na ${
                  diasDaSemana.find((d) => d.value === dataSelecionada.getDay())
                    ?.label
                }`
              : "Todos os treinos"}
            {modalidadeSelecionada &&
              ` - ${modalidades[modalidadeSelecionada]?.Name}`}
          </h3>

          <div className="text-azul-claro font-bold text-lg sm:text-xl">
            {contadores.total} {contadores.total === 1 ? "treino" : "treinos"}
          </div>
        </div>
      </div>

      {/* Barra de Controles centralizada */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4 w-[95%] sm:w-4/5 lg:w-3/4">
        <div className="w-full sm:flex-1">
          <label className="text-white font-bold text-sm sm:text-lg mr-2">
            Time:
          </label>
          <select
            value={modalidadeSelecionada}
            onChange={(e) => {
              setModalidadeSelecionada(e.target.value);
              setFormCriacao((prev) => ({
                ...prev,
                modalidadeId: e.target.value,
              }));
            }}
            className="p-2 rounded-md bg-preto text-white w-full sm:w-[30%]"
          >
            <option value="">Todos os times</option>
            {Object.entries(modalidades).map(([id, mod]) => {
              // Se não for admin, mostra apenas o time do usuário
              if (
                !(
                  userRole === "Administrador" ||
                  userRole === "Administrador Geral"
                ) &&
                id !== userModality
              ) {
                return null;
              }
              return (
                <option key={id} value={id}>
                  {mod.Name} ({mod.Tag})
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="flex items-center w-full sm:w-auto">
            <label className="text-white text-sm sm:text-base mr-2 ">
              Filtrar por dia:
            </label>
            <button
              onClick={() => setFiltroDataAtivo(!filtroDataAtivo)}
              className={`px-3 py-1 rounded ${
                filtroDataAtivo
                  ? "bg-azul-claro text-white"
                  : "bg-fundo text-white border border-borda"
              }`}
            >
              {filtroDataAtivo ? "Ativo" : "Inativo"}
            </button>
          </div>

          {(modalidadeSelecionada || filtroDataAtivo) && (
            <button
              onClick={limparFiltros}
              className="text-vermelho-claro hover:text-vermelho-escuro flex items-center text-sm sm:text-base hover:cursor-pointer"
            >
              <MdClear className="mr-1" /> Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Botões de Criar */}
      {userRole && userRole !== "Jogador" && (
        <div className="flex justify-end mb-4 w-[95%] sm:w-4/5 lg:w-3/4">
          <button
            type="button"
            onClick={iniciarCriacao}
            className="bg-verde-claro text-white px-4 py-2 rounded flex items-center text-sm sm:text-base hover:bg-green-700 mr-2 hover:cursor-pointer"
            aria-label="Criar novo treino"
          >
            <MdAdd className="mr-1" /> Criar Treino
          </button>
        </div>
      )}

      {/* Container principal centralizado */}
      <div className="flex flex-col lg:flex-row w-[95%] sm:w-4/5 lg:w-3/4 h-auto lg:h-[calc(100vh-180px)] gap-4 sm:gap-6 md:gap-8 mb-10">
        {/* Lista de Treinos */}
        <div className="w-full lg:w-[65%] h-auto lg:h-full bg-navbar border border-borda rounded-xl overflow-y-auto order-2 lg:order-1">
          <div className="border-b border-borda p-3 sm:p-4 sticky top-0 bg-navbar z-10">
            <div className="font-blinker text-sm sm:text-base md:text-lg lg:text-xl text-branco hidden sm:flex justify-between">
              <span className="w-1/4">Horário</span>
              <span className="w-1/4">Dia da Semana</span>
              <span className="w-2/4">Time</span>
              {userRole !== "Jogador" && (
                <span className="w-1/4 text-center">Ações</span>
              )}
            </div>
            <div className="sm:hidden font-blinker text-base text-branco text-center">
              Lista de Treinos
            </div>
          </div>

          <div className="pb-4 sm:pb-6">
            {criandoTreino && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 gap-3 sm:gap-4 border-b border-borda">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full">
                  <div className="flex flex-col w-full sm:w-auto">
                    <label className="text-cinza-claro text-xs sm:text-sm mb-1">
                      Início
                    </label>
                    <input
                      type="time"
                      name="inicio"
                      value={formCriacao.inicio}
                      onChange={(e) => handleFormChange(e, true)}
                      className="p-1 sm:p-2 rounded bg-fundo text-white w-full sm:w-32"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-cinza-claro text-sm mb-1">Fim</label>
                    <input
                      type="time"
                      name="fim"
                      value={formCriacao.fim}
                      onChange={(e) => handleFormChange(e, true)}
                      className="p-1 sm:p-2 rounded bg-fundo text-white w-full sm:w-32"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-cinza-claro text-sm mb-1">Dia</label>
                    <select
                      name="diaSemana"
                      value={formCriacao.diaSemana}
                      onChange={(e) => handleFormChange(e, true)}
                      className="p-1 sm:p-2 rounded bg-fundo text-white w-full sm:w-40"
                    >
                      {diasDaSemana.map((dia) => (
                        <option key={dia.value} value={dia.value}>
                          {dia.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-cinza-claro text-sm mb-1">
                      Time
                    </label>
                    <select
                      name="modalidadeId"
                      value={formCriacao.modalidadeId}
                      onChange={(e) => handleFormChange(e, true)}
                      className="p-1 sm:p-2 rounded bg-fundo text-white w-full sm:w-48"
                      disabled={
                        !(
                          userRole === "Administrador" ||
                          userRole === "Administrador Geral"
                        )
                      }
                    >
                      {Object.entries(modalidades).map(([id, mod]) => (
                        <option key={id} value={id}>
                          {mod.Name} ({mod.Tag})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={criarTreino}
                    className="bg-verde-claro text-white px-2 sm:px-3 py-1 rounded flex items-center text-xs sm:text-sm hover:bg-green-700 hover:cursor-pointer"
                  >
                    <MdSave className="mr-1" /> Salvar
                  </button>
                  <button
                    onClick={cancelarCriacao}
                    className="bg-vermelho-claro text-white px-2 sm:px-3 py-1 rounded flex items-center text-xs sm:text-sm hover:bg-red-500 hover:cursor-pointer"
                  >
                    <MdClose className="mr-1" /> Cancelar
                  </button>
                </div>
              </div>
            )}

            {agendamentosFiltrados.length > 0 ? (
              agendamentosFiltrados.map((agendamento) => (
                <div key={agendamento.id} className="border-b border-borda">
                  {editandoTreino?.id === agendamento.id ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 gap-3 sm:gap-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full">
                        <div className="flex flex-col w-full sm:w-auto">
                          <label className="text-cinza-claro text-xs sm:text-sm mb-1">
                            Início
                          </label>
                          <input
                            type="time"
                            name="inicio"
                            value={formEdicao.inicio}
                            onChange={handleFormChange}
                            className="p-1 sm:p-2 rounded bg-fundo text-white w-full sm:w-32"
                          />
                        </div>

                        <div className="flex flex-col">
                          <label className="text-cinza-claro text-sm mb-1">
                            Fim
                          </label>
                          <input
                            type="time"
                            name="fim"
                            value={formEdicao.fim}
                            onChange={handleFormChange}
                            className="p-1 sm:p-2 rounded bg-fundo text-white w-full sm:w-32"
                          />
                        </div>

                        <div className="flex flex-col">
                          <label className="text-cinza-claro text-sm mb-1">
                            Dia
                          </label>
                          <select
                            name="diaSemana"
                            value={formEdicao.diaSemana}
                            onChange={handleFormChange}
                            className="p-1 sm:p-2 rounded bg-fundo text-white w-full sm:w-40"
                          >
                            {diasDaSemana.map((dia) => (
                              <option key={dia.value} value={dia.value}>
                                {dia.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <span className="text-white ml-4">
                          {agendamento.NomeModalidade}
                        </span>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={salvarEdicao}
                          className="bg-verde-claro text-white px-2 sm:px-3 py-1 rounded flex items-center text-xs sm:text-sm hover:bg-green-700 hover:cursor-pointer"
                        >
                          <MdSave className="mr-1" /> Salvar
                        </button>
                        <button
                          onClick={cancelarEdicao}
                          className="bg-vermelho-claro text-white px-2 sm:px-3 py-1 rounded flex items-center text-xs sm:text-sm hover:bg-red-500 hover:cursor-pointer"
                        >
                          <MdClose className="mr-1" /> Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Agendamento
                      inicio={agendamento.inicio}
                      fim={agendamento.fim}
                      diaSemana={agendamento.diaSemana}
                      status={agendamento.status}
                      time={agendamento.NomeModalidade}
                      onEditar={() => iniciarEdicao(agendamento)}
                      onExcluir={() => excluirTreino(agendamento)}
                      userRole={userRole} // Passa userRole como prop
                    />
                  )}
                </div>
              ))
            ) : (
              <div className="text-white text-center py-6 sm:py-8 text-sm sm:text-base">
                Nenhum treino agendado encontrado com os filtros atuais
              </div>
            )}
          </div>
        </div>

        {/* Calendário */}
        <div className="w-full lg:w-[30%] h-auto sm:h-[400px] lg:h-[90%] bg-navbar border border-borda rounded-xl p-4 sm:p-6 order-1 lg:order-2">
          <Calendario />
        </div>
      </div>

      <Rodape />
    </div>
  );
};

export default TreinosAdmin;
