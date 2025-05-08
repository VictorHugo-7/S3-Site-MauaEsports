import React, { useState, useEffect } from "react";
import axios from "axios";
import { useMsal } from "@azure/msal-react";
import { Link, useNavigate } from "react-router-dom";
import PageBanner from "../components/PageBanner";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";

// Importe as imagens dos ranks
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

  // Dados dos ranks com imagens
  const ranks = [
    { id: 1, name: "Rank 1", image: rank1 },
    { id: 2, name: "Rank 2", image: rank2 },
    { id: 3, name: "Rank 3", image: rank3 },
    { id: 4, name: "Rank 4", image: rank4 },
    { id: 5, name: "Rank 5", image: rank5 },
    { id: 6, name: "Rank 6", image: rank6 },
    { id: 7, name: "Rank 7", image: rank7 },
    { id: 8, name: "Rank 8", image: rank8 },
  ];

  // Função para obter o início do semestre atual
  const getCurrentSemesterStart = () => {
    const now = new Date();
    const year = now.getFullYear();
    const semesterStartMonth = now.getMonth() < 7 ? 1 : 7;
    return new Date(year, semesterStartMonth, 1).getTime();
  };
  // Retorna o formato "YYYY.S" para nomear arquivos
  const getCurrentSemester = () => {
    const now = new Date();
    return `${now.getFullYear()}.${now.getMonth() < 6 ? 1 : 2}`;
  };
  // Função para gerar PDF
  const generatePDF = async () => {
    setGeneratingReport(true);
    try {
      // Verifique se currentModality existe e tem nome
      if (!currentModality || !currentModality.Name) {
        throw new Error("Modalidade não selecionada ou inválida");
      }

      console.log("Enviando dados para o servidor:", {
        team: currentModality.Name,
      });

      const response = await axios.post(
        "http://localhost:5000/api/generate-pdf-report",
        {
          team: currentModality.Name,
        },
        {
          headers: {
            Authorization: "Bearer frontendmauaesports",
            "Content-Type": "application/json",
          },
          responseType: "blob",
        }
      );

      // Check if response is actually a PDF
      const contentType = response.headers["content-type"];
      if (contentType !== "application/pdf") {
        // Try to read the error message if it's JSON
        const errorText = await response.data.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || "Invalid response format");
        } catch (e) {
          throw new Error(errorText || "Unknown error occurred");
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `relatorio_pae_${currentModality.Name}_${getCurrentSemester()}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Detailed error:", error);
      alert(`Error generating PDF: ${error.message}`);
    } finally {
      setGeneratingReport(false);
    }
  };

  const generateExcel = async () => {
    setGeneratingReport(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/generate-excel-report",
        { team: currentModality.Name },
        {
          headers: {
            Authorization: "Bearer frontendmauaesports",
            "Content-Type": "application/json",
          },
          responseType: "blob",
        }
      );

      // Check if response is actually an Excel file
      const contentType = response.headers["content-type"];
      if (!contentType.includes("spreadsheetml")) {
        const errorText = await response.data.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || "Invalid response format");
        } catch (e) {
          throw new Error(errorText || "Unknown error occurred");
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `relatorio_pae_${currentModality.Name}_${getCurrentSemester()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Detailed error:", error);
      alert(`Error generating Excel: ${error.message}`);
    } finally {
      setGeneratingReport(false);
    }
  };

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
        setAuthChecked(true);
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        navigate("/nao-autorizado");
      }
    };

    loadUserData();
  }, [instance, navigate]);

  // Função para processar os dados dos jogadores
  const processPlayerHours = (trainsData, modalities) => {
    const playerHours = {};
    const semesterStart = getCurrentSemesterStart();

    // Primeiro passamos por todos os treinos para calcular os totais
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

        // Acumula horas por modalidade
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

    // Agora processamos para cada modalidade separadamente
    const modalityPlayers = {};

    Object.keys(modalities).forEach((modalityId) => {
      modalityPlayers[modalityId] = [];
    });

    Object.values(playerHours).forEach((player) => {
      // Encontra a modalidade principal (onde tem mais horas)
      let mainModalityId = null;
      let maxHours = 0;

      Object.entries(player.teams).forEach(([modalityId, teamData]) => {
        if (teamData.hours > maxHours) {
          maxHours = teamData.hours;
          mainModalityId = modalityId;
        }
      });

      // Se o jogador tem horas em alguma modalidade, adiciona à modalidade principal
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

    // Ordena os jogadores em cada modalidade por horas totais
    Object.keys(modalityPlayers).forEach((modalityId) => {
      modalityPlayers[modalityId].sort((a, b) => b.totalHours - a.totalHours);
    });

    return modalityPlayers;
  };

  // Busca modalidades e dados dos jogadores
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
        const processedPlayers = processPlayerHours(trainsResponse.data, mods);

        setModalidades(mods);
        setModalityPlayers(processedPlayers);

        // Define a modalidade inicial
        if (
          userRole === "Administrador" ||
          userRole === "Administrador Geral"
        ) {
          setSelectedModalityId(Object.keys(mods)[0]);
        } else {
          // Para jogadores normais, encontra a modalidade padrão
          let userModalityId = null;
          let captainModalityId = null;

          Object.keys(mods).forEach((modId) => {
            // Verifica se é capitão
            if (userData?.nome && mods[modId].Name.includes(userData.nome)) {
              captainModalityId = modId;
            }

            // Verifica se tem jogadores nesta modalidade
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

  // FUNÇÕES PARA CÁLCULO DOS RANKS
  const getCurrentRank = (hours) => {
    if (hours >= 80) return 8; // Diamante (80h)
    if (hours >= 70) return 7; // Vermelho (70-79h)
    if (hours >= 60) return 6; // Roxo (60-69h)
    if (hours >= 50) return 5; // Esmeralda (50-59h)
    if (hours >= 35) return 4; // Azul (35-49h)
    if (hours >= 25) return 3; // Ouro (25-34h)
    if (hours >= 15) return 2; // Prata (15-24h)
    if (hours >= 10) return 1; // Bronze (10-14h)
    if (hours >= 1) return 0; // Branco (1-9h)
    return -1; // Vazio (0h)
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

  // Renderização condicional
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-azul-claro"></div>
      </div>
    );
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0D1117] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-azul-claro"></div>
      </div>
    );
  }

  // Mensagens de feedback
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

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <div className="bg-[#010409] h-[104px]"></div>
      <PageBanner pageName={`Horas PAEs - ${currentModality.Name || ""}`} />
      <div className="flex justify-end gap-4 mb-6">
        <button
          onClick={generateExcel}
          disabled={generatingReport}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaFileExcel /> Exportar Excel
        </button>
        <button
          onClick={generatePDF}
          disabled={generatingReport}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaFilePdf /> Exportar PDF
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-6 md:px-14 md:py-15">
        {/* Seletor de modalidade */}
        <div className="px-6 md:px-0">
          <div className="relative w-full md:w-64 mb-6">
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
        </div>

        {/* Conteúdo principal */}
        <main className="flex-1">
          <div className="bg-gray-800 border-2 border-gray-700 rounded-[30px] shadow-lg p-6">
            {/* Cabeçalho com ranks */}
            <div className="flex mb-4">
              <div className="w-24 md:w-32"></div>
              <div className="flex-1 grid grid-cols-8 gap-1">
                {ranks.map((rank) => (
                  <div key={rank.id} className="flex flex-col items-center">
                    <img
                      src={rank.image}
                      alt={rank.name}
                      className="w-20 h-20 object-contain mb-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Lista de jogadores */}
            {modalityPlayers[selectedModalityId]?.length > 0 ? (
              modalityPlayers[selectedModalityId].map((player, index) => {
                const currentRank = getCurrentRank(player.totalHours);
                const fillPercentage = getFillPercentage(player.totalHours);
                const roundedHours = Math.round(player.totalHours * 10) / 10;

                return (
                  <div key={index} className="flex items-center mb-4">
                    <div className="w-24 md:w-32 font-semibold truncate">
                      {player.name}
                      <div className="text-xs text-gray-400 mt-1">
                        {player.mainTeam?.name || "Sem time principal"}
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-8 gap-1 relative">
                      {/* Linha de 40h */}
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

                      {/* Barras de progresso */}
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
                              className="absolute inset-0 bg-gray-700"
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

            {/* Legenda */}
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
