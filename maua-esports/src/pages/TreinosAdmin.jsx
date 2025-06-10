/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import axios from "axios";
import {
  MdChevronRight,
  MdChevronLeft,
  MdClear,
  MdSave,
  MdClose,
  MdAdd,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import PageBanner from "../components/PageBanner";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import AlertaErro from "../components/AlertaErro";
import AlertaOk from "../components/AlertaOk";
import DeletarBtn from "../components/DeletarBtn";
import EditarBtn from "../components/EditarBtn";
import ModalConfirmarExclusao from "../components/modalConfirmarExclusao";

// Componente Agendamento
const Agendamento = ({
  inicio,
  fim,
  diaSemana,
  time,
  onEditar,
  onExcluir,
  userRole,
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

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_120px] gap-4 p-4 sm:p-6 my-0 min-h-[80px] bg-gray-800 border border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 relative"
    >
      {/* Horário */}
      <div className="flex flex-col items-center sm:items-start justify-center">
        <div className="sm:hidden text-xs text-gray-400 mb-1">Horário</div>
        <div className="flex flex-col items-center sm:items-start">
          <span className="text-white font-semibold text-base">
            {inicio} - {fim}
          </span>
          <span className="text-blue-400 text-sm">
            Duração: {calcularDuracao(inicio, fim)}
          </span>
        </div>
      </div>

      {/* Dia da Semana */}
      <div className="flex flex-col items-center sm:items-start justify-center">
        <div className="sm:hidden text-xs text-gray-400 mb-1">
          Dia da Semana
        </div>
        <span className="text-white font-medium text-base">
          {diasDaSemana[diaSemana]}
        </span>
      </div>

      {/* Time */}
      <div className="flex flex-col items-center sm:items-start justify-center">
        <div className="sm:hidden text-xs text-gray-400 mb-1">Time</div>
        <p className="font-semibold text-white font-blinker text-base">
          {time}
        </p>
      </div>

      {/* Ações */}
      {userRole !== "Jogador" && (
        <div className="flex justify-center sm:justify-end items-center mt-4 sm:mt-0  sm:right-0 sm:bg-gray-800 sm:h-full">
          <div className="sm:hidden text-xs text-gray-400 mr-2">Ações:</div>
          <div className="flex gap-2">
            <EditarBtn onClick={onEditar} isEditing={false} />
            <DeletarBtn
              onDelete={onExcluir}
              className="text-red-400 hover:text-red-500 text-2xl transition-colors duration-200"
              aria-label="Excluir treino"
            />
          </div>
        </div>
      )}
    </motion.div>
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

// Função auxiliar para validar horários
function isHorarioValido(inicio, fim) {
  const [horaInicio, minutoInicio] = inicio.split(":").map(Number);
  const [horaFim, minutoFim] = fim.split(":").map(Number);

  const totalMinutosInicio = horaInicio * 60 + minutoInicio;
  const totalMinutosFim = horaFim * 60 + minutoFim;

  return totalMinutosFim > totalMinutosInicio;
}

const TreinosAdmin = () => {
  const [loading, setLoading] = useState(true);
  const { instance } = useMsal();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [discordId, setDiscordId] = useState("");
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [modalidades, setModalidades] = useState({});
  const [modalidadeSelecionada, setModalidadeSelecionada] = useState("");
  const [agendamentosOriginais, setAgendamentosOriginais] = useState([]);
  const [agendamentosFiltrados, setAgendamentosFiltrados] = useState([]);
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
  const [modalExclusao, setModalExclusao] = useState({
    isOpen: false,
    treino: null,
  });

  const diasDaSemana = [
    { value: 0, label: "Domingo" },
    { value: 1, label: "Segunda" },
    { value: 2, label: "Terça" },
    { value: 3, label: "Quarta" },
    { value: 4, label: "Quinta" },
    { value: 5, label: "Sexta" },
    { value: 6, label: "Sábado" },
  ];

  // Função para resetar alertas após 5 segundos
  useEffect(() => {
    if (alertaErro) {
      console.log("Exibindo alertaErro:", alertaErro);
      const timer = setTimeout(() => {
        console.log("Resetando alertaErro");
        setAlertaErro("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertaErro]);

  useEffect(() => {
    if (alertaOk) {
      console.log("Exibindo alertaOk:", alertaOk);
      const timer = setTimeout(() => {
        console.log("Resetando alertaOk");
        setAlertaOk("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertaOk]);

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

  const determineUserModality = (mods, trainsData) => {
    if (userRole === "Administrador" || userRole === "Administrador Geral") {
      return null;
    }

    const modalityHours = {};

    trainsData.forEach((train) => {
      if (train.Status !== "ENDED" || !train.AttendedPlayers) return;

      const modalityId = train.ModalityId;
      if (!mods[modalityId]) return;

      if (!modalityHours[modalityId]) {
        modalityHours[modalityId] = 0;
      }

      const playerAttendance = train.AttendedPlayers.find(
        (p) => p.PlayerId === discordId
      );

      if (
        playerAttendance &&
        playerAttendance.EntranceTimestamp &&
        playerAttendance.ExitTimestamp
      ) {
        const durationHours =
          (playerAttendance.ExitTimestamp -
            playerAttendance.EntranceTimestamp) /
          (1000 * 60 * 60);
        modalityHours[modalityId] += durationHours;
      }
    });

    let maxHours = 0;
    let userModalityId = null;

    Object.entries(modalityHours).forEach(([modalityId, hours]) => {
      if (hours > maxHours) {
        maxHours = hours;
        userModalityId = modalityId;
      }
    });

    return userModalityId;
  };

  useEffect(() => {
    if (!userRole) return;

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

        if (
          !(
            userRole === "Administrador" || userRole === "Administrador Geral"
          ) &&
          !userModalityId
        ) {
          setModalidades({});
          setLoading(false);
          return;
        }

        setModalidades(mods);
        setUserModality(userModalityId);

        const todosAgendamentos = [];

        for (const modId in mods) {
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
        setLoading(false);
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
      modalidadeId: userModality || modalidadeSelecionada || "",
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

    if (!isHorarioValido(formEdicao.inicio, formEdicao.fim)) {
      setAlertaErro("O horário de término deve ser posterior ao de início");
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
      setModalidades((prev) => ({
        ...prev,
        [editandoTreino.ModalityId]: {
          ...prev[editandoTreino.ModalityId],
          ScheduledTrainings: updatedTrainings,
        },
      }));
      setEditandoTreino(null);
      setFormEdicao({ inicio: "", fim: "", diaSemana: 0 });

      console.log("Setando alertaOk: Treino atualizado com sucesso!");
      setAlertaOk("Treino atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar treino:", error);
      console.log(
        "Setando alertaErro:",
        error.response?.data?.message || "Erro ao atualizar treino"
      );
      setAlertaErro(
        error.response?.data?.message || "Erro ao atualizar treino"
      );
    }
  };

  const criarTreino = async () => {
    if (!formCriacao.inicio || !formCriacao.fim || !formCriacao.modalidadeId) {
      console.log("Setando alertaErro: Preencha todos os campos obrigatórios");
      setAlertaErro("Preencha todos os campos obrigatórios");
      return;
    }

    if (!isHorarioValido(formCriacao.inicio, formCriacao.fim)) {
      console.log(
        "Setando alertaErro: O horário de término deve ser posterior ao de início"
      );
      setAlertaErro("O horário de término deve ser posterior ao de início");
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
        console.log("Setando alertaErro: Modalidade não encontrada");
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

      const response = await axios.patch(
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

      console.log("Resposta do servidor ao criar treino:", response.data);

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
      setModalidades((prev) => ({
        ...prev,
        [formCriacao.modalidadeId]: {
          ...prev[formCriacao.modalidadeId],
          ScheduledTrainings: updatedTrainings,
        },
      }));
      setCriandoTreino(false);
      setFormCriacao({
        inicio: "",
        fim: "",
        diaSemana: 0,
        modalidadeId: userModality || modalidadeSelecionada || "",
      });

      console.log("Setando alertaOk: Treino criado com sucesso!");
      setAlertaOk("Treino criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar treino:", error);
      console.log(
        "Setando alertaErro:",
        error.response?.data?.message || "Erro ao criar treino"
      );
      setAlertaErro(error.response?.data?.message || "Erro ao criar treino");
    }
  };

  const excluirTreino = async (treino) => {
    if (
      userRole !== "Administrador" &&
      userRole !== "Administrador Geral" &&
      treino.ModalityId !== userModality
    ) {
      console.log(
        "Setando alertaErro: Você não tem permissão para excluir este treino"
      );
      setAlertaErro("Você não tem permissão para excluir este treino");
      return;
    }

    setModalExclusao({ isOpen: true, treino });
  };

  const confirmarExclusao = async () => {
    const treino = modalExclusao.treino;
    if (!treino) return;

    try {
      const modalidade = modalidades[treino.ModalityId];
      if (!modalidade) {
        console.log("Setando alertaErro: Modalidade não encontrada");
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
      setModalidades((prev) => ({
        ...prev,
        [treino.ModalityId]: {
          ...prev[treino.ModalityId],
          ScheduledTrainings: updatedTrainings,
        },
      }));
      console.log("Setando alertaOk: Treino excluído com sucesso!");
      setAlertaOk("Treino excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir treino:", error);
      console.log(
        "Setando alertaErro:",
        error.response?.data?.message || "Erro ao excluir treino"
      );
      setAlertaErro(error.response?.data?.message || "Erro ao excluir treino");
    } finally {
      setModalExclusao({ isOpen: false, treino: null });
    }
  };

  const cancelarExclusao = () => {
    setModalExclusao({ isOpen: false, treino: null });
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
      <div className="w-full">
        <div className="flex justify-between items-center mb-3">
          <button
            onClick={() => mudarMes(-1)}
            className="text-blue-400 hover:text-blue-300 text-xl transition-colors duration-200"
            aria-label="Mês anterior"
          >
            <MdChevronLeft />
          </button>
          <h3 className="text-lg font-semibold text-white text-center capitalize">
            {mesAtual.toLocaleString("pt-BR", {
              month: "long",
              year: "numeric",
            })}
          </h3>
          <button
            onClick={() => mudarMes(1)}
            className="text-blue-400 hover:text-blue-300 text-xl transition-colors duration-200"
            aria-label="Próximo mês"
          >
            <MdChevronRight />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
            <div key={dia} className="text-sm font-medium text-gray-300 py-1">
              {dia}
            </div>
          ))}

          {Array.from({ length: diaInicial }).map((_, index) => (
            <div key={`empty-${index}`} className="h-8" />
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
                className={`h-8 w-8 text-sm rounded-full flex items-center justify-center transition-colors duration-200
                  ${
                    isSelecionado
                      ? "bg-blue-500 text-white"
                      : isHoje
                      ? "border border-blue-400 text-white"
                      : "text-gray-300 hover:bg-gray-700"
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

  if (loading) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full min-h-screen bg-fundo flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-t-2 border-b-2 border-azul-claro"
          ></motion.div>
          <p className="text-branco ml-4">Carregando treinos...</p>
        </motion.div>
      );
    }

  if (
    Object.keys(modalidades).length === 0 &&
    !(userRole === "Administrador" || userRole === "Administrador Geral")
  ) {
    return (
      <div className="min-h-screen bg-[#0D1117] text-white flex items-center justify-center">
        <div className="text-center p-6 max-w-md bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Nenhum time encontrado</h2>
          <p className="mb-6 text-gray-300">
            Você não está registrado em nenhum time ou não tem treinos
            agendados.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#0D1117] flex flex-col items-center">
      {/* Modal de Confirmação de Exclusão */}
      <ModalConfirmarExclusao
        isOpen={modalExclusao.isOpen}
        mensagem={
          <>
            <p className="mb-4">
              Tem certeza que deseja excluir o treino do time{" "}
              {modalExclusao.treino?.NomeModalidade} das{" "}
              {modalExclusao.treino?.inicio} às {modalExclusao.treino?.fim}?
            </p>
            <p className="text-yellow-400 text-sm mb-4">
              Observação: Para treinos recém criados, favor esperar 30 minutos
              após o término do treino para realizar a exclusão.
            </p>
          </>
        }
        onConfirm={confirmarExclusao}
        onCancel={cancelarExclusao}
      />

      {/* Alertas de sucesso/erro */}
      <AlertaErro
        key={`erro-${alertaErro}-${Date.now()}`}
        mensagem={alertaErro}
      />
      <AlertaOk key={`ok-${alertaOk}-${Date.now()}`} mensagem={alertaOk} />

      {/* Container unificado para NavBar e PageBanner */}
      <div className="w-full mb-10 bg-navbar">
        <div className="h-[104px]"></div>
        <PageBanner pageName="Treinos" />
      </div>

      {/* Resumo centralizado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-4 rounded-lg mb-6 w-[90%] sm:w-3/4 lg:w-2/3 text-center mx-auto shadow-lg"
      >
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-white font-semibold text-base sm:text-lg text-center">
            {filtroDataAtivo
              ? `Treinos na ${
                  diasDaSemana.find((d) => d.value === dataSelecionada.getDay())
                    ?.label
                }`
              : "Todos os treinos"}
            {modalidadeSelecionada &&
              ` - ${modalidades[modalidadeSelecionada]?.Name}`}
          </h3>

          <div className="text-blue-400 font-semibold text-lg sm:text-xl">
            {contadores.total} {contadores.total === 1 ? "treino" : "treinos"}
          </div>
        </div>
      </motion.div>

      {/* Barra de Controles centralizada */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 w-[90%] sm:w-3/4 lg:w-2/3"
      >
        <div className="w-full sm:flex-1">
          <label className="text-white font-semibold text-sm sm:text-base mr-2">
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
            className="p-2 rounded-md bg-gray-700 text-white w-full sm:w-[40%] border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os times</option>
            {Object.entries(modalidades).map(([id, mod]) => {
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

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center w-full sm:w-auto">
            <label className="text-white text-sm sm:text-base mr-2">
              Filtrar por dia:
            </label>
            <button
              onClick={() => setFiltroDataAtivo(!filtroDataAtivo)}
              className={`px-4 py-1 rounded text-sm sm:text-base transition-colors duration-200 ${
                filtroDataAtivo
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-white border border-gray-600 hover:bg-gray-600"
              }`}
            >
              {filtroDataAtivo ? "Ativo" : "Inativo"}
            </button>
          </div>

          {(modalidadeSelecionada || filtroDataAtivo) && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={limparFiltros}
              className="text-red-400 hover:text-red-500 flex items-center text-sm sm:text-base transition-colors duration-200"
            >
              <MdClear className="mr-1" /> Limpar filtros
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Botões de Criar */}
      {userRole && userRole !== "Jogador" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-end mb-4 w-[90%] sm:w-3/4 lg:w-2/3"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={iniciarCriacao}
            className="bg-green-500 text-white px-4 py-2 rounded flex items-center text-sm sm:text-base hover:bg-green-600 transition-colors shadow-md cursor-pointer"
            aria-label="Criar novo treino"
          >
            <MdAdd className="mr-1" /> Criar Treino
          </motion.button>
        </motion.div>
      )}

      {/* Container principal centralizado */}
      <div className="flex flex-col lg:flex-row w-[90%] sm:w-3/4 lg:w-2/3 min-h-[400px] gap-6 mb-10">
        {/* Calendário */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="w-full lg:w-[350px] lg:h-400px] bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-lg overflow-y-auto order-first lg:order-last"
        >
          <Calendario />
        </motion.div>

        {/* Lista de Treinos */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="w-full lg:flex-1 bg-gray-800 border border-gray-700 rounded-xl shadow-lg min-h-[400px] order-last lg:order-first overflow-x-auto"
        >
          <div className="border-b border-gray-700 p-4 sticky top-0 bg-gray-800 z-10">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_120px] gap-4 font-blinker text-sm sm:text-base text-white min-w-[600px] ">
              <span className="text-center sm:text-left ml-8">Horário</span>
              <span className="text-center sm:text-left">Dia da Semana</span>
              <span className="text-center sm:text-left">Time</span>
              {userRole !== "Jogador" && (
                <span className="text-center sticky  bg-gray-800">Ações</span>
              )}
            </div>
            <div className="sm:hidden font-blinker text-base text-white text-center">
              Lista de Treinos
            </div>
          </div>

          <div className="pb-6 space-y-2 px-2 sm:px-4 min-w-[600px]">
            <AnimatePresence>
              {criandoTreino && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col p-4 gap-4 bg-gray-700 border border-gray-600 rounded-lg"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_120px] gap-4 w-full">
                    <div className="flex flex-col">
                      <label className="text-gray-300 text-xs sm:text-sm mb-1">
                        Início
                      </label>
                      <input
                        type="time"
                        name="inicio"
                        value={formCriacao.inicio}
                        onChange={(e) => handleFormChange(e, true)}
                        className="p-2 rounded bg-gray-600 text-white w-full border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-gray-300 text-xs sm:text-sm mb-1">
                        Fim
                      </label>
                      <input
                        type="time"
                        name="fim"
                        value={formCriacao.fim}
                        onChange={(e) => handleFormChange(e, true)}
                        className="p-2 rounded bg-gray-600 text-white w-full border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-gray-300 text-xs sm:text-sm mb-1">
                        Dia
                      </label>
                      <select
                        name="diaSemana"
                        value={formCriacao.diaSemana}
                        onChange={(e) => handleFormChange(e, true)}
                        className="p-2 rounded bg-gray-600 text-white w-full border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {diasDaSemana.map((dia) => (
                          <option key={dia.value} value={dia.value}>
                            {dia.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col">
                      <label className="text-gray-300 text-xs sm:text-sm mb-1">
                        Time
                      </label>
                      <select
                        name="modalidadeId"
                        value={formCriacao.modalidadeId}
                        onChange={(e) => handleFormChange(e, true)}
                        className="p-2 rounded bg-gray-600 text-white w-full border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                  <div className="flex gap-2 justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={criarTreino}
                      className="bg-green-500 text-white px-3 py-1 rounded flex items-center text-sm hover:bg-green-600 transition-colors hover:cursor-pointer"
                    >
                      <MdSave className="mr-1" /> Salvar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={cancelarCriacao}
                      className="bg-red-500 text-white px-3 py-1 rounded flex items-center text-sm hover:bg-red-600 transition-colors hover:cursor-pointer"
                    >
                      <MdClose className="mr-1" /> Cancelar
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {agendamentosFiltrados.length > 0 ? (
                agendamentosFiltrados.map((agendamento, index) => (
                  <motion.div
                    key={agendamento.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {editandoTreino?.id === agendamento.id ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col p-4 gap-4 bg-gray-700 border border-gray-600 rounded-lg"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_120px] gap-4 w-full">
                          <div className="flex flex-col">
                            <label className="text-gray-300 text-xs sm:text-sm mb-1">
                              Início
                            </label>
                            <input
                              type="time"
                              name="inicio"
                              value={formEdicao.inicio}
                              onChange={handleFormChange}
                              className="p-2 rounded bg-gray-600 text-white w-full border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="flex flex-col">
                            <label className="text-gray-300 text-xs sm:text-sm mb-1">
                              Fim
                            </label>
                            <input
                              type="time"
                              name="fim"
                              value={formEdicao.fim}
                              onChange={handleFormChange}
                              className="p-2 rounded bg-gray-600 text-white w-full border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="flex flex-col">
                            <label className="text-gray-300 text-xs sm:text-sm mb-1">
                              Dia
                            </label>
                            <select
                              name="diaSemana"
                              value={formEdicao.diaSemana}
                              onChange={handleFormChange}
                              className="p-2 rounded bg-gray-600 text-white w-full border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {diasDaSemana.map((dia) => (
                                <option key={dia.value} value={dia.value}>
                                  {dia.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={salvarEdicao}
                            className="bg-green-500 text-white px-3 py-1 rounded flex items-center text-sm hover:bg-green-600 transition-colors hover:cursor-pointer"
                          >
                            <MdSave className="mr-1" /> Salvar
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={cancelarEdicao}
                            className="bg-red-500 text-white px-3 py-1 rounded flex items-center text-sm hover:bg-red-600 transition-colors hover:cursor-pointer"
                          >
                            <MdClose className="mr-1" /> Cancelar
                          </motion.button>
                        </div>
                      </motion.div>
                    ) : (
                      <Agendamento
                        inicio={agendamento.inicio}
                        fim={agendamento.fim}
                        diaSemana={agendamento.diaSemana}
                        time={agendamento.NomeModalidade}
                        onEditar={() => iniciarEdicao(agendamento)}
                        onExcluir={() => excluirTreino(agendamento)}
                        userRole={userRole}
                      />
                    )}
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-300 text-center py-8 text-base"
                >
                  Nenhum treino agendado encontrado com os filtros atuais
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TreinosAdmin;
