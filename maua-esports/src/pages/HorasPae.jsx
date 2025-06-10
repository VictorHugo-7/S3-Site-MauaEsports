import React, { useState, useEffect } from "react";
import axios from "axios";
import { useMsal } from "@azure/msal-react";
import { Link, useNavigate } from "react-router-dom";
import PageBanner from "../components/PageBanner";
import {
  FaFileExcel,
  FaFilePdf,
  FaCrown,
  FaUser,
  FaSync,
  FaInfoCircle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { HiUserCircle } from "react-icons/hi2";
import rank1 from "../assets/images/rank1.png";
import rank2 from "../assets/images/rank2.png";
import rank3 from "../assets/images/rank3.png";
import rank4 from "../assets/images/rank4.png";
import rank5 from "../assets/images/rank5.png";
import rank6 from "../assets/images/rank6.png";
import rank7 from "../assets/images/rank7.png";
import rank8 from "../assets/images/rank8.png";

function HorasPaePage() {
  const [generatingReport, setGeneratingReport] = useState(false);
  const { instance } = useMsal();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [discordId, setDiscordId] = useState("");
  const [isCaptain, setIsCaptain] = useState(false);
  const [modalidades, setModalidades] = useState({});
  const [selectedModalityId, setSelectedModalityId] = useState("");
  const [modalityPlayers, setModalityPlayers] = useState({});
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [ranks, setRanks] = useState([]);
  const [hoveredPlayer, setHoveredPlayer] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  const API_BASE_URL = "http://localhost:3000";

  const RANK_STYLES = {
    0: { tailwindClass: "bg-white", hexColor: "#FFFFFF" },
    1: { tailwindClass: "bg-[#5D0F01]", hexColor: "#5D0F01" },
    2: { tailwindClass: "bg-[#7A807D]", hexColor: "#7A807D" },
    3: { tailwindClass: "bg-[#FCA610]", hexColor: "#FCA610" },
    4: { tailwindClass: "bg-[#39A0B1]", hexColor: "#39A0B1" },
    5: { tailwindClass: "bg-[#047C21]", hexColor: "#047C21" },
    6: { tailwindClass: "bg-[#60409E]", hexColor: "#60409E" },
    7: { tailwindClass: "bg-[#C10146]", hexColor: "#C10146" },
    8: { tailwindClass: "bg-[#FFC87F]", hexColor: "#FFC87F" },
    default: { tailwindClass: "bg-gray-700", hexColor: "#374151" },
  };

  const getRankStyleInfo = (rank) => {
    return RANK_STYLES[rank] || RANK_STYLES.default;
  };

  const hexToRgba = (hex, alpha = 1) => {
    if (!hex || typeof hex !== "string" || !hex.startsWith("#")) {
      return `rgba(55, 65, 81, ${alpha})`;
    }
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const extractRAFromEmail = (email) => {
    if (!email) return "";
    const raPart = email.split("@")[0];
    return raPart;
  };

  useEffect(() => {
    const localRanks = [
      { id: 1, name: "Iniciante", image: rank1 },
      { id: 2, name: "Novato", image: rank2 },
      { id: 3, name: "Intermediário", image: rank3 },
      { id: 4, name: "Avançado", image: rank4 },
      { id: 5, name: "Experiente", image: rank5 },
      { id: 6, name: "Veterano", image: rank6 },
      { id: 7, name: "Elite", image: rank7 },
      { id: 8, name: "Lenda", image: rank8 },
    ];
    setRanks(localRanks);
  }, []);

  const getCurrentSemesterStart = () => {
    const now = new Date();
    const year = now.getFullYear();
    const semesterStartMonth = now.getMonth() < 7 ? 1 : 7;
    return new Date(year, semesterStartMonth, 1).getTime();
  };

  const getCurrentSemester = () => {
    const now = new Date();
    return `${now.getFullYear()}.${now.getMonth() < 6 ? 1 : 2}`;
  };

  const generatePDF = async () => {
    setGeneratingReport(true);
    try {
      if (Object.keys(modalidades).length === 0) {
        throw new Error("Nenhuma modalidade disponível para gerar o relatório");
      }

      let payload;
      if (selectedModalityId === "all") {
        const team = Object.values(modalidades).map((mod) => mod.Name);
        if (team.length === 0) {
          throw new Error("Nenhuma modalidade encontrada para a opção 'Todos'");
        }
        payload = { team };
      } else if (currentModality?.Name) {
        payload = { team: [currentModality.Name] };
      } else {
        throw new Error("Modalidade não selecionada ou inválida");
      }

      const response = await axios.post(
        "http://localhost:5000/api/generate-pdf-report",
        payload,
        {
          headers: {
            Authorization: "Bearer frontendmauaesports",
            "Content-Type": "application/json",
          },
          responseType: "blob",
        }
      );

      const contentType = response.headers["content-type"];
      if (contentType !== "application/pdf") {
        const errorText = await response.data.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || "Formato de resposta inválido");
        } catch (e) {
          throw new Error(errorText || "Erro desconhecido ao gerar o PDF");
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `relatorio_pae_${selectedModalityId === "all"
          ? "todas_modalidades"
          : currentModality.Name
        }_${getCurrentSemester()}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert(`Erro ao gerar PDF: ${error.message}`);
    } finally {
      setGeneratingReport(false);
    }
  };

  const generateExcel = async () => {
    setGeneratingReport(true);
    try {
      if (Object.keys(modalidades).length === 0) {
        throw new Error("Nenhuma modalidade disponível para gerar o relatório");
      }

      let payload;
      if (selectedModalityId === "all") {
        const team = Object.values(modalidades).map((mod) => mod.Name);
        if (team.length === 0) {
          throw new Error("Nenhuma modalidade encontrada para a opção 'Todos'");
        }
        payload = { team };
      } else if (currentModality?.Name) {
        payload = { team: [currentModality.Name] };
      } else {
        throw new Error("Modalidade não selecionada ou inválida");
      }

      const response = await axios.post(
        "http://localhost:5000/api/generate-excel-report",
        payload,
        {
          headers: {
            Authorization: "Bearer frontendmauaesports",
            "Content-Type": "application/json",
          },
          responseType: "blob",
        }
      );

      const contentType = response.headers["content-type"];
      if (!contentType.includes("spreadsheetml")) {
        const errorText = await response.data.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || "Formato de resposta inválido");
        } catch (e) {
          throw new Error(errorText || "Erro desconhecido ao gerar o Excel");
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `relatorio_pae_${selectedModalityId === "all"
          ? "todas_modalidades"
          : currentModality.Name
        }_${getCurrentSemester()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao gerar Excel:", error);
      alert(`Erro ao gerar Excel: ${error.message}`);
    } finally {
      setGeneratingReport(false);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const account = instance.getActiveAccount();
        if (!account) {
          navigate("/");
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/usuarios/por-email?email=${encodeURIComponent(
            account.username
          )}`
        );
        const userData = response.data.usuario;

        setUserData(userData);
        setUserRole(userData.tipoUsuario);
        setDiscordId(userData.discordID || "");
        setAuthChecked(true);
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        navigate("/nao-autorizado");
      }
    };

    loadUserData();
  }, [instance, navigate]);

  const processPlayerHours = async (trainsData, modalities) => {
    const playerHours = {};
    const semesterStart = getCurrentSemesterStart();

    const discordIds = new Set();
    trainsData.forEach((train) => {
      if (
        train.Status === "ENDED" &&
        train.AttendedPlayers &&
        train.StartTimestamp >= semesterStart
      ) {
        train.AttendedPlayers.forEach((player) => {
          if (player.PlayerId) {
            discordIds.add(player.PlayerId);
          }
        });
      }
    });

    let discordToEmailMap = {};
    try {
      const discordIdsParam = Array.from(discordIds).join(",");
      const response = await axios.get(
        `${API_BASE_URL}/usuarios/por-discord-ids?ids=${discordIdsParam}`
      );
      discordToEmailMap = response.data.reduce((map, user) => {
        if (user.discordID) {
          map[user.discordID] = user;
        }
        return map;
      }, {});
    } catch (error) {
      console.error("Erro ao buscar emails:", error);
    }

    trainsData.forEach((train) => {
      if (
        train.Status !== "ENDED" ||
        !train.AttendedPlayers ||
        train.StartTimestamp < semesterStart
      )
        return;

      const modality = modalities[train.ModalityId];
      if (!modality) return;

      train.AttendedPlayers.forEach((player) => {
        if (
          !player.PlayerId ||
          !player.EntranceTimestamp ||
          !player.ExitTimestamp
        )
          return;
        if (userRole === "Jogador" && player.PlayerId !== discordId) return;

        const durationHours =
          (player.ExitTimestamp - player.EntranceTimestamp) / (1000 * 60 * 60);
        const userData = discordToEmailMap[player.PlayerId] || {};
        const displayName = userData.email
          ? extractRAFromEmail(userData.email)
          : player.PlayerId;

        if (!playerHours[player.PlayerId]) {
          playerHours[player.PlayerId] = {
            name: player.PlayerId,
            discordId: player.PlayerId,
            email: userData.email,
            displayName: displayName,
            userId: userData._id,
            totalHours: 0,
            teams: {},
          };
        }

        if (!playerHours[player.PlayerId].teams[train.ModalityId]) {
          playerHours[player.PlayerId].teams[train.ModalityId] = {
            hours: 0,
            teamName: modality.Name,
          };
        }

        playerHours[player.PlayerId].teams[train.ModalityId].hours +=
          durationHours;
        playerHours[player.PlayerId].totalHours += durationHours;
      });
    });

    const modalityPlayers = {};

    Object.keys(modalities).forEach((modalityId) => {
      modalityPlayers[modalityId] = [];
    });

    Object.values(playerHours).forEach((player) => {
      let mainModalityId = null;
      let maxHours = 0;

      Object.entries(player.teams).forEach(([modalityId, teamData]) => {
        if (teamData.hours > maxHours) {
          maxHours = teamData.hours;
          mainModalityId = modalityId;
        }
      });

      if (mainModalityId) {
        modalityPlayers[mainModalityId].push({
          ...player,
          mainTeam: {
            modalityId: mainModalityId,
            name: modalities[mainModalityId].Name,
          },
        });
      }
    });

    Object.keys(modalityPlayers).forEach((modalityId) => {
      modalityPlayers[modalityId].sort((a, b) => b.totalHours - a.totalHours);
    });

    return modalityPlayers;
  };

  useEffect(() => {
    if (!authChecked) return;

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
        const processedPlayers = await processPlayerHours(
          trainsResponse.data,
          mods
        );

        setModalidades(mods);
        setModalityPlayers(processedPlayers);

        if (
          userRole === "Administrador" ||
          userRole === "Administrador Geral"
        ) {
          if (Object.keys(mods).length > 0) {
            setSelectedModalityId(Object.keys(mods)[0]);
          } else {
            setSelectedModalityId("all");
          }
        } else {
          let userModalityId = null;
          let captainModalityId = null;

          Object.keys(mods).forEach((modId) => {
            if (userData?.nome && mods[modId].Name.includes(userData.nome)) {
              captainModalityId = modId;
            }

            if (processedPlayers[modId]?.some((p) => p.name === discordId)) {
              userModalityId = modId;
            }
          });

          setIsCaptain(!!captainModalityId);
          const defaultModalityId = captainModalityId || userModalityId;

          if (defaultModalityId) {
            setSelectedModalityId(defaultModalityId);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [authChecked, discordId, userData, userRole]);

  const getCurrentRank = (hours) => {
    if (hours >= 80) return 8;
    if (hours >= 70) return 7;
    if (hours >= 60) return 6;
    if (hours >= 50) return 5;
    if (hours >= 35) return 4;
    if (hours >= 25) return 3;
    if (hours >= 15) return 2;
    if (hours >= 10) return 1;
    if (hours >= 1) return 0;
    return -1;
  };

  const getFillPercentage = (hours) => {
    const rank = getCurrentRank(hours);
    switch (rank) {
      case 0:
        return (hours / 10) * 100;
      case 1:
        return ((hours - 10) / 5) * 100;
      case 2:
        return ((hours - 15) / 10) * 100;
      case 3:
        return ((hours - 25) / 10) * 100;
      case 4:
        return ((hours - 35) / 15) * 100;
      case 5:
        return ((hours - 50) / 10) * 100;
      case 6:
        return ((hours - 60) / 10) * 100;
      case 7:
        return ((hours - 70) / 10) * 100;
      case 8:
        return 100;
      default:
        return 0;
    }
  };

  const getColor = (rank) => {
    switch (rank) {
      case 0:
        return "bg-white";
      case 1:
        return "bg-[#5D0F01]";
      case 2:
        return "bg-[#7A807D]";
      case 3:
        return "bg-[#FCA610]";
      case 4:
        return "bg-[#39A0B1]";
      case 5:
        return "bg-[#047C21]";
      case 6:
        return "bg-[#60409E]";
      case 7:
        return "bg-[#C10146]";
      case 8:
        return "bg-[#FFC87F]";
      default:
        return "bg-gray-700";
    }
  };

  const get40hPosition = () => {
    const rankWidth = 100 / 8;
    const positionInRank = (40 - 35) / 15;
    const totalPosition = 4 * rankWidth + positionInRank * rankWidth;
    return `${totalPosition}%`;
  };

  const getRankImage = (hours) => {
    const rankIndex = getCurrentRank(hours);
    if (rankIndex <= 0) return null;
    if (rankIndex >= ranks.length) return ranks[ranks.length - 1];
    return ranks[rankIndex - 1];
  };

  const handleImageError = (userId) => {
    setImageErrors((prev) => ({ ...prev, [userId]: true }));
  };

  const handleMouseMove = (e) => {
    setHoverPosition({ x: e.clientX, y: e.clientY });
  };

  if (loading || !authChecked) {
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
        <p className="text-branco ml-4">Carregando horas Pae...</p>
      </motion.div>
    );
  }

  if (userRole === "Jogador" && !discordId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0D1117] to-[#161B22] text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 max-w-md bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-2xl"
        >
          <h2 className="text-2xl font-bold mb-4 text-azul-claro">
            Ação necessária
          </h2>
          <p className="mb-6 text-gray-300">
            Você precisa cadastrar seu Discord ID para visualizar as horas PAE.
          </p>
          <Link
            to="/perfil"
            className="px-6 py-3 bg-gradient-to-r from-azul-claro to-azul-escuro rounded-lg hover:opacity-90 transition-all inline-block font-medium shadow-lg"
          >
            Editar Perfil
          </Link>
        </motion.div>
      </div>
    );
  }

  if (
    Object.keys(modalidades).length === 0 &&
    userRole !== "Administrador" &&
    userRole !== "Administrador Geral"
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0D1117] to-[#161B22] text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 max-w-md bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-2xl"
        >
          <h2 className="text-2xl font-bold mb-4 text-azul-claro">
            Nenhuma modalidade encontrada
          </h2>
          <p className="mb-6 text-gray-300">
            Você não está registrado em nenhuma modalidade ou não participou de
            treinos neste semestre.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-azul-claro to-azul-escuro rounded-lg font-medium shadow-lg"
          >
            Recarregar
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const currentModality = modalidades[selectedModalityId] || {};

  const allPlayers =
    selectedModalityId === "all"
      ? Object.values(modalityPlayers)
        .flat()
        .sort((a, b) => b.totalHours - a.totalHours)
      : modalityPlayers[selectedModalityId] || [];

  return (
    <div
      className="bg-[#0D1117] min-h-screen flex flex-col text-white"
      onMouseMove={handleMouseMove}
    >
      <div className="bg-[#010409] h-[104px]"></div>
      <PageBanner
        pageName={`Horas PAEs - ${selectedModalityId === "all"
            ? "Todas as Modalidades"
            : currentModality.Name || ""
          }`}
      />

      <div className="flex flex-col gap-6 px-4 sm:px-6 pb-8 md:px-8 lg:px-14 mt-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="w-full md:w-[30%]">
            <label
              htmlFor="modality-select"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Modalidade:
            </label>
            {userRole === "Administrador" ||
              userRole === "Administrador Geral" ? (
              <motion.div whileHover={{ scale: 1.01 }}>
                <select
                  id="modality-select"
                  className="block w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-azul-claro focus:border-azul-claro transition-all shadow-md"
                  value={selectedModalityId}
                  onChange={(e) => setSelectedModalityId(e.target.value)}
                >
                  <option value="all">Todos</option>
                  {Object.keys(modalidades).map((modId) => (
                    <option key={modId} value={modId}>
                      {modalidades[modId].Name}
                    </option>
                  ))}
                </select>
              </motion.div>
            ) : (
              <input
                type="text"
                className="block w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white cursor-not-allowed shadow-md"
                value={currentModality.Name || ""}
                readOnly
              />
            )}
          </div>
          {(userRole === "Administrador" ||
            userRole === "Administrador Geral" ||
            userRole === "Capitão de Time") && (
              <motion.div
                className="flex gap-2 sm:gap-4 flex-wrap"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 15px rgba(16, 185, 129, 0.5)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={generateExcel}
                  disabled={generatingReport}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-2 px-3 sm:py-3 sm:px-5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer shadow-lg text-sm sm:text-base"
                >
                  {generatingReport ? (
                    <FaSync className="animate-spin" />
                  ) : (
                    <>
                      <FaFileExcel className="text-xl" /> Exportar Excel
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 15px rgba(220, 38, 38, 0.5)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={generatePDF}
                  disabled={generatingReport}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold py-2 px-3 sm:py-3 sm:px-5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer shadow-lg text-sm sm:text-base"
                >
                  {generatingReport ? (
                    <FaSync className="animate-spin" />
                  ) : (
                    <>
                      <FaFilePdf className="text-xl" /> Exportar PDF
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
        </div>

        <main className="w-full overflow-x-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full min-w-[800px] bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-2xl shadow-2xl p-4 sm:p-6"
          >
            <div className="flex mb-4">
              <div className="w-48"></div>
              <div className="flex-1 grid grid-cols-8 gap-1 relative">
                {ranks.map((rank) => (
                  <motion.div
                    key={rank.id}
                    className="flex flex-col items-center"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <img
                      src={rank.image}
                      alt={rank.name}
                      className="w-16 h-16 md:w-20 md:h-20 object-contain mb-1"
                    />
                  </motion.div>
                ))}

                <div
                  className="absolute bottom-0 flex flex-col items-center z-10"
                  style={{ left: get40hPosition() }}
                >
                  <div className="relative">
                    <div className="absolute -bottom-5 w-3 h-3 bg-azul-claro rounded-full shadow-lg animate-pulse"></div>
                    <div className="absolute -bottom-5 w-3 h-3 bg-azul-claro rounded-full opacity-75 animate-ping"></div>
                  </div>
                  <div className="absolute -right-2 -bottom-4 text-azul-claro text-xs font-bold whitespace-nowrap bg-gray-900 px-2 py-1 rounded-md border border-azul-claro/30 shadow-lg">
                    40h
                  </div>
                  <div className="absolute bottom-12 w-0.5 h-full bg-gradient-to-t from-azul-claro/70 via-azul-claro/30 to-transparent"></div>
                </div>
              </div>
            </div>

            {allPlayers.length > 0 ? (
              <motion.div layout className="space-y-4">
                <AnimatePresence>
                  {allPlayers.map((player, index) => {
                    const currentRank = getCurrentRank(player.totalHours);
                    const rankStyleInfo = getRankStyleInfo(currentRank);
                    let opacityLow = 0.05;
                    let opacityHigh = 0.15;

                    if (currentRank === 8) {
                      opacityLow = 0.08;
                      opacityHigh = 0.25;
                    } else if (
                      rankStyleInfo.hexColor === RANK_STYLES[0].hexColor
                    ) {
                      opacityLow = 0.03;
                      opacityHigh = 0.1;
                    }

                    const fillPercentage = getFillPercentage(player.totalHours);
                    const roundedHours =
                      Math.round(player.totalHours * 10) / 10;
                    const isCurrentUser = player.discordId === discordId;

                    return (
                      <motion.div
                        key={`${player.userId || player.discordId}-${index}`}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          backgroundColor: [
                            hexToRgba(rankStyleInfo.hexColor, opacityLow),
                            hexToRgba(rankStyleInfo.hexColor, opacityHigh),
                            hexToRgba(rankStyleInfo.hexColor, opacityLow),
                          ],
                        }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.05,
                          backgroundColor: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                        }}
                        className={`flex items-center mb-4 p-2 rounded-lg ${isCurrentUser
                            ? "bg-gradient-to-r from-blue-900/30 to-blue-800/30 border border-blue-700/50"
                            : "hover:bg-gray-700/50"
                          }`}
                        onMouseEnter={() => setHoveredPlayer(player)}
                        onMouseLeave={() => setHoveredPlayer(null)}
                      >
                        <div className="w-48 flex items-center gap-3">
                          <div className="relative">
                            {player.userId && !imageErrors[player.userId] ? (
                              <img
                                src={`${API_BASE_URL}/usuarios/${player.userId
                                  }/foto?t=${Date.now()}`}
                                alt={`Foto de ${player.displayName}`}
                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
                                onError={() => handleImageError(player.userId)}
                              />
                            ) : (
                              <HiUserCircle className="w-10 h-10 text-gray-400" />
                            )}
                            {index === 0 && (
                              <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1 shadow-lg">
                                <FaCrown className="text-xs text-yellow-900" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold truncate">
                              {player.displayName}
                              {isCurrentUser && (
                                <span className="ml-1 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                                  Você
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 truncate">
                              {player.mainTeam?.name || "Sem time principal"}
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 grid grid-cols-8 gap-1 relative h-12">
                          {ranks.map((_, rankIndex) => {
                            const rankNum = rankIndex + 1;
                            const isActive = rankNum === currentRank + 1;
                            const isCompleted = rankNum <= currentRank;
                            const isEmpty = currentRank === -1;

                            let color = isEmpty
                              ? "bg-gray-700"
                              : isCompleted
                                ? getColor(currentRank)
                                : isActive
                                  ? getColor(currentRank)
                                  : "bg-gray-700";

                            const fill = isActive
                              ? fillPercentage
                              : isCompleted
                                ? 100
                                : 0;

                            return (
                              <div key={rankIndex} className="relative h-full">
                                <div
                                  className="absolute inset-0 bg-gray-700"
                                  style={{
                                    clipPath:
                                      "polygon(10% 0, 100% 0, 90% 100%, 0% 100%)",
                                  }}
                                >
                                  <div
                                    className={`absolute inset-0 ${color}`}
                                    style={{ width: `${fill}%` }}
                                  />
                                </div>
                                {rankNum === 8 && (
                                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                                    {roundedHours}h
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-gray-400"
              >
                <FaInfoCircle className="mx-auto text-4xl mb-4 text-azul-claro" />
                <p className="text-lg">
                  {userRole === "Jogador"
                    ? "Você não possui horas registradas neste semestre."
                    : "Nenhum dado de jogadores encontrado para esta modalidade."}
                </p>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 gap-2 mt-8"
            >
              {[
                { range: "1-9h", color: "bg-white", name: "Iniciante" },
                { range: "10-14h", color: "bg-[#5D0F01]", name: "Novato" },
                {
                  range: "15-24h",
                  color: "bg-[#7A807D]",
                  name: "Intermediário",
                },
                { range: "25-34h", color: "bg-[#FCA610]", name: "Avançado" },
                { range: "35-49h", color: "bg-[#39A0B1]", name: "Experiente" },
                { range: "50-59h", color: "bg-[#047C21]", name: "Veterano" },
                { range: "60-69h", color: "bg-[#60409E]", name: "Elite" },
                { range: "70-79h", color: "bg-[#C10146]", name: "Mestre" },
                { range: "80h+", color: "bg-[#FFC87F]", name: "Lenda" },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-center bg-gray-800/50 p-2 rounded-lg border border-gray-700 hover:bg-gray-700/50 transition-colors"
                  whileHover={{ y: -3 }}
                >
                  <div
                    className={`w-4 h-4 mr-2 ${item.color} rounded-sm`}
                    style={{
                      clipPath: "polygon(10% 0, 100% 0, 90% 100%, 0% 100%)",
                    }}
                  ></div>
                  <div className="flex flex-col">
                    <div className="text-xs font-medium whitespace-nowrap">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-gray-400 whitespace-nowrap">
                      {item.range}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </main>

        {hoveredPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-2xl z-50 max-w-xs pointer-events-none"
            style={{
              left: `${hoverPosition.x + 20}px`,
              top: `${hoverPosition.y + 20}px`,
            }}
          >
            <div className="flex items-start gap-3">
              <div>
                {hoveredPlayer.userId && !imageErrors[hoveredPlayer.userId] ? (
                  <img
                    src={`${API_BASE_URL}/usuarios/${hoveredPlayer.userId
                      }/foto?t=${Date.now()}`}
                    alt={`Foto de ${hoveredPlayer.displayName}`}
                    className="w-12 h-12 rounded-full mr-2 object-cover border-2 border-gray-600"
                    onError={() => handleImageError(hoveredPlayer.userId)}
                  />
                ) : (
                  <HiUserCircle className="w-12 h-12 text-gray-400 mr-2" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <h3 className="font-bold text-lg">
                    {hoveredPlayer.displayName}
                  </h3>
                  {hoveredPlayer.discordId === discordId && (
                    <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      Você
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-300 mb-2">
                  <span className="font-medium">Time principal:</span>{" "}
                  {hoveredPlayer.mainTeam?.name || "Não definido"}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-300">
                      <span className="font-medium">Horas totais:</span>{" "}
                      {Math.round(hoveredPlayer.totalHours * 10) / 10}h
                    </div>
                    <div className="text-sm text-gray-300">
                      <span className="font-medium">Rank atual:</span>{" "}
                      {getCurrentRank(hoveredPlayer.totalHours) === 0 ? (
                        <span className="text-gray-400">Sem rank</span>
                      ) : (
                        `${getCurrentRank(hoveredPlayer.totalHours)}/8`
                      )}
                    </div>
                  </div>

                  {getCurrentRank(hoveredPlayer.totalHours) > 0 &&
                    getRankImage(hoveredPlayer.totalHours) ? (
                    <div className="ml-4">
                      <img
                        src={getRankImage(hoveredPlayer.totalHours).image}
                        alt={`Rank ${getCurrentRank(hoveredPlayer.totalHours)}`}
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="ml-4 w-16 h-16 flex items-center justify-center bg-gray-700 rounded-lg">
                      <span className="text-xs text-gray-400 text-center">
                        Sem rank
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default HorasPaePage;