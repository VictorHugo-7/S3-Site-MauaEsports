import React, { useState, useEffect } from "react";
import axios from "axios";
import { useMsal } from "@azure/msal-react";
import { Link, useNavigate } from "react-router-dom";
import PageBanner from "../components/PageBanner";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";

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

  const getRankings = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/rankings`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar rankings:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchRanks = async () => {
      try {
        const ranksData = await getRankings();
        setRanks(ranksData);
      } catch (error) {
        console.error("Erro ao carregar rankings:", error);
        setRanks([]);
      }
    };

    fetchRanks();
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
        payload = { team: [currentModality.Name] }; // Send as array
      } else {
        throw new Error("Modalidade não selecionada ou inválida");
      }

      console.log("Enviando payload para PDF:", payload);

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
        `relatorio_pae_${
          selectedModalityId === "all"
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
        payload = { team: [currentModality.Name] }; // Send as array
      } else {
        throw new Error("Modalidade não selecionada ou inválida");
      }

      console.log("Enviando payload para Excel:", payload);

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
        `relatorio_pae_${
          selectedModalityId === "all"
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
          `http://localhost:3000/usuarios/por-email?email=${encodeURIComponent(
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

  const processPlayerHours = (trainsData, modalities) => {
    const playerHours = {};
    const semesterStart = getCurrentSemesterStart();

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

        if (!playerHours[player.PlayerId]) {
          playerHours[player.PlayerId] = {
            name: player.PlayerId,
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
        console.log("Modalidades recebidas:", mods);

        const processedPlayers = processPlayerHours(trainsResponse.data, mods);

        setModalidades(mods);
        setModalityPlayers(processedPlayers);

        if (
          userRole === "Administrador" ||
          userRole === "Administrador Geral"
        ) {
          if (Object.keys(mods).length > 0) {
            setSelectedModalityId(Object.keys(mods)[0]);
          } else {
            console.warn("Nenhuma modalidade disponível para seleção");
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
          } else {
            console.warn("Nenhuma modalidade associada ao usuário");
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        alert("Erro ao carregar dados. Tente novamente.");
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
    const rankIndex = 4;
    const segmentProgress = (40 - 35) / 15;
    const totalProgress = rankIndex / 8 + segmentProgress / 8;
    return `${totalProgress * 100}%`;
  };

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-[#0D1117] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-azul-claro"></div>
      </div>
    );
  }

  if (userRole === "Jogador" && !discordId) {
    return (
      <div className="min-h-screen bg-[#0D1117] text-white flex items-center justify-center">
        <div className="text-center p-6 max-w-md bg-gray-800 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Ação necessária</h2>
          <p className="mb-6">
            Você precisa cadastrar seu Discord ID para visualizar as horas PAE.
          </p>
          <Link
            to="/perfil"
            className="px-6 py-3 bg-azul-claro rounded-lg hover:bg-azul-escuro transition-colors inline-block"
          >
            Editar Perfil
          </Link>
        </div>
      </div>
    );
  }

  if (
    Object.keys(modalidades).length === 0 &&
    userRole !== "Administrador" &&
    userRole !== "Administrador Geral"
  ) {
    return (
      <div className="min-h-screen bg-[#0D1117] text-white flex items-center justify-center">
        <div className="text-center p-6 max-w-md bg-gray-800 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">
            Nenhuma modalidade encontrada
          </h2>
          <p className="mb-6">
            Você não está registrado em nenhuma modalidade ou não participou de
            treinos neste semestre.
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

  const currentModality = modalidades[selectedModalityId] || {};

  const allPlayers =
    selectedModalityId === "all"
      ? Object.values(modalityPlayers)
          .flat()
          .sort((a, b) => b.totalHours - a.totalHours)
      : modalityPlayers[selectedModalityId] || [];

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <div className="bg-[#010409] h-[104px]"></div>
      <PageBanner
        pageName={`Horas PAEs - ${
          selectedModalityId === "all"
            ? "Todas as Modalidades"
            : currentModality.Name || ""
        }`}
      />

      <div className="flex flex-col gap-6 px-6 pb-8 md:px-14 md:py-15">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="md:w-[30%]">
            <label
              htmlFor="modality-select"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Modalidade:
            </label>
            {userRole === "Administrador" ||
            userRole === "Administrador Geral" ? (
              <select
                id="modality-select"
                className="block w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            ) : (
              <input
                type="text"
                className="block w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white cursor-not-allowed"
                value={currentModality.Name || ""}
                readOnly
              />
            )}
          </div>
          {userRole === "Administrador" ||
          userRole === "Administrador Geral" ||
          userRole === "Capitão de Time" ? (
            <div className="flex gap-4">
              <button
                onClick={generateExcel}
                disabled={generatingReport}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
              >
                <FaFileExcel /> Exportar Excel
              </button>
              <button
                onClick={generatePDF}
                disabled={generatingReport}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-900 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
              >
                <FaFilePdf /> Exportar PDF
              </button>
            </div>
          ) : null}
        </div>

        <main className="xl:col-span-9">
          <div className="w-full bg-gray-800 border-2 border-gray-700 rounded-[30px] shadow-lg p-6 overflow-x-auto">
            <div className="flex mb-4 min-w-[800px]">
              <div className="w-24 md:w-32"></div>
              <div className="flex-1 grid grid-cols-8 gap-1">
                {ranks.map((rank) => (
                  <div key={rank._id} className="flex flex-col items-center">
                    <img
                      src={`data:${rank.imageType};base64,${rank.imageData}`}
                      alt={rank.name}
                      className="w-16 h-16 md:w-20 md:h-20 object-contain mb-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            {allPlayers.length > 0 ? (
              allPlayers.map((player, index) => {
                const currentRank = getCurrentRank(player.totalHours);
                const fillPercentage = getFillPercentage(player.totalHours);
                const roundedHours = Math.round(player.totalHours * 10) / 10;

                return (
                  <div
                    key={`${player.name}-${index}`}
                    className="flex items-center mb-4 min-w-[800px]"
                  >
                    <div className="w-24 md:w-32 font-semibold truncate">
                      {player.name}
                      <div className="text-xs text-gray-400 mt-1">
                        {player.mainTeam?.name || "Sem time principal"}
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-8 gap-1 relative">
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-yellow-300 z-10"
                        style={{
                          left: `calc(${get40hPosition()} + 4px)`,
                          boxShadow: "0 0 5px 1px rgba(255, 255, 0, 0.7)",
                        }}
                      ></div>
                      <div
                        className="absolute -top-6 text-yellow-300 text-xs font-bold whitespace-nowrap"
                        style={{ left: `calc(${get40hPosition()} - 20px)` }}
                      >
                        40h
                      </div>

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
                          <div key={rankIndex} className="relative h-10">
                            <div
                              className="absolute inset-0 bg-gray-700 "
                              style={{
                                clipPath:
                                  "polygon(10% 0, 100% 0, 90% 100%, 0% 100%)",
                              }}
                            >
                              <div
                                className={`absolute inset-0 ${color}`}
                                style={{ width: `${fill}%` }}
                              ></div>
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
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-400">
                {userRole === "Jogador"
                  ? "Você não possui horas registradas neste semestre."
                  : "Nenhum dado de jogadores encontrado para esta modalidade."}
              </div>
            )}

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
                <div key={idx} className="flex items-center">
                  <div
                    className={`w-5 h-5 mr-2 ${item.color}`}
                    style={{
                      clipPath: "polygon(10% 0, 100% 0, 90% 100%, 0% 100%)",
                    }}
                  ></div>
                  <span className="text-sm">
                    {item.range} - {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default HorasPaePage;
