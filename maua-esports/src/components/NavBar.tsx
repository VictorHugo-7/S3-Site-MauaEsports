import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoMdArrowDropdown, IoMdClose } from "react-icons/io";
import { GiHamburgerMenu } from "react-icons/gi";
import { CgLogIn, CgLogOut } from "react-icons/cg";
import { RiTeamFill, RiImageEditLine } from "react-icons/ri";
import { FaUserTie, FaRegClock, FaUserCog, FaDiscord, FaTimes } from "react-icons/fa";
import { HiUserCircle } from "react-icons/hi2";
import { GiSwordsEmblem } from "react-icons/gi";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import Cropper from "react-easy-crop";
import { MdDone, MdCancel } from "react-icons/md";
import logo from "../assets/images/Logo.svg";
import AlertaOk from "./AlertaOk";
import AlertaErro from "./AlertaErro";
import SalvarBtn from "./SalvarBtn";
import CancelarBtn from "./CancelarBtn";

interface CroppedArea {
  width: number;
  height: number;
  x: number;
  y: number;
}

const NavBar = () => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isClockHovered, setClockIsHovered] = useState(false);
  const [isSwordHovered, setSwordHovered] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { instance } = useMsal();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isAdminHovered, setIsAdminHovered] = useState(false);
  const [isEditHovered, setIsEditHovered] = useState(false);
  const [editFormData, setEditFormData] = useState({
    email: "",
    discordID: "",
    fotoPerfil: null as string | null,
    userId: "",
  });
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  const [editError, setEditError] = useState("");
  const [userDataLoaded, setUserDataLoaded] = useState(false);
  const [userType, setUserType] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<CroppedArea | null>(null);
  const [tempCroppedImage, setTempCroppedImage] = useState<string | null>(null);
  // No início do componente, com os outros estados
  const [imagemAmpliada, setImagemAmpliada] = useState({
    aberto: false,
    src: null as string | null,
    alt: "",
  });

  // Funções para verificar rotas ativas
  const isTimesActive = (path: string) => {
    return path === "/times" || path === "/admins";
  };

  const isActive = (path: string) => location.pathname === path;

  // Fechar dropdowns quando a rota muda
  useEffect(() => {
    setIsDropdownOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

  // Efeitos para scroll e autenticação
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (showEditModal) {
      setIsVisible(true);
    }
  }, [showEditModal]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accounts = instance.getAllAccounts();
        if (accounts && accounts.length > 0) {
          instance.setActiveAccount(accounts[0]);
          setIsAuthenticated(true);
          await loadUserData(accounts[0].username);
        } else {
          setIsAuthenticated(false);
        }
      } catch (e) {
        console.error("Erro ao verificar autenticação:", e);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [instance]);

  useEffect(() => {
    const callbackId = instance.addEventCallback((event) => {
      if (event.eventType === "msal:loginSuccess") {
        const account = event.payload.account;
        instance.setActiveAccount(account);
        setIsAuthenticated(true);
        loadUserData(account.username);
      }
    });

    return () => {
      if (callbackId) {
        instance.removeEventCallback(callbackId);
      }
    };
  }, [instance]);

  const loadUserData = async (email: string) => {
    setIsLoadingUserData(true);
    try {
      const response = await fetch(
        `http://localhost:3000/usuarios/por-email?email=${encodeURIComponent(
          email
        )}`
      );
      if (!response.ok) throw new Error("Erro ao buscar usuário");

      const userData = await response.json();

      if (userData.usuario) {
        setEditFormData({
          email: userData.usuario.email,
          discordID: userData.usuario.discordID || "",
          fotoPerfil: userData.usuario.fotoPerfil
            ? `/usuarios/${userData.usuario._id}/foto?${Date.now()}`
            : null,
          userId: userData.usuario._id,
        });

        setUserType(userData.usuario.tipoUsuario);

        if (userData.usuario.fotoPerfil) {
          const imageResponse = await fetch(
            `http://localhost:3000/usuarios/${userData.usuario._id}/foto`
          );
          if (imageResponse.ok) {
            const blob = await imageResponse.blob();
            const imageUrl = URL.createObjectURL(blob);
            setCroppedImage(imageUrl);
          }
        }
      }
      setUserDataLoaded(true);
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      setEditError("Erro ao carregar dados do usuário");
    } finally {
      setIsLoadingUserData(false);
    }
  };

  // Funções de autenticação
  const handleLogin = async () => {
    try {
      const authResult = await instance.loginPopup(loginRequest);
      const account = authResult.account;
      instance.setActiveAccount(account);

      const response = await fetch(
        `http://localhost:3000/usuarios/verificar-email?email=${encodeURIComponent(
          account.username
        )}`
      );

      if (!response.ok) {
        throw new Error("Erro ao verificar email");
      }

      const data = await response.json();

      if (!data.success) {
        if (data.message === "Usuário não encontrado") {
          await instance.logoutPopup();
          setErrorMessage(
            "Seu email não está cadastrado no sistema. Contate um administrador."
          );
        } else {
          setErrorMessage(`Erro: ${data.message}`);
        }
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);
      setSuccessMessage("Bem vindo à Mauá Esports!");
      await loadUserData(account.username);
    } catch (error) {
      console.error("Erro no login:", error);
      await instance
        .logoutPopup()
        .catch((e) => console.error("Erro ao deslogar:", e));
      setIsAuthenticated(false);
      setErrorMessage(
        "Ocorreu um erro durante o login. Por favor, tente novamente."
      );
    }
  };

  const handleLogout = () => {
    instance.logoutRedirect().catch((e) => {
      console.error("Erro no logout:", e);
    });
  };

  // Funções para o cropper de imagem
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const createCircularImage = (src: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;

        ctx?.beginPath();
        ctx?.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx?.closePath();
        ctx?.clip();

        ctx?.drawImage(
          img,
          (img.width - size) / 2,
          (img.height - size) / 2,
          size,
          size,
          0,
          0,
          size,
          size
        );

        resolve(canvas.toDataURL("image/jpeg"));
      };

      img.src = src;
    });
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: CroppedArea) => {
    setCroppedArea(croppedAreaPixels);
  };

  const handleCrop = async () => {
    if (image && croppedArea) {
      try {
        const canvas = document.createElement("canvas");
        const imageObj = new Image();
        imageObj.src = image;

        await new Promise((resolve) => {
          imageObj.onload = resolve;
        });

        canvas.width = croppedArea.width;
        canvas.height = croppedArea.height;
        const ctx = canvas.getContext("2d");

        if (!ctx) throw new Error("Could not get canvas context");

        ctx.drawImage(
          imageObj,
          croppedArea.x,
          croppedArea.y,
          croppedArea.width,
          croppedArea.height,
          0,
          0,
          croppedArea.width,
          croppedArea.height
        );

        const croppedImageUrl = canvas.toDataURL("image/jpeg");
        const circularImage = await createCircularImage(croppedImageUrl);

        setTempCroppedImage(circularImage); // Armazena apenas temporariamente
        setImage(null);
      } catch (error) {
        console.error("Error cropping image:", error);
        setEditError("Erro ao processar a imagem");
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      setEditError("");

      if (!editFormData.userId) {
        throw new Error("ID do usuário não encontrado");
      }

      const formData = new FormData();
      formData.append("discordID", editFormData.discordID || "");

      // Se há uma nova imagem temporária
      if (tempCroppedImage) {
        const blob = await fetch(tempCroppedImage).then((res) => res.blob());
        formData.append("fotoPerfil", blob, "profile.jpg");
      }
      // Se a imagem foi removida (não há imagem temporária E não há imagem atual)
      else if (!tempCroppedImage && !croppedImage) {
        formData.append("removeFoto", "true");
      }

      const response = await fetch(
        `http://localhost:3000/usuarios/${editFormData.userId}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar perfil");
      }

      await loadUserData(editFormData.email);
      setShowEditModal(false);
      setTempCroppedImage(null);
      setSuccessMessage("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      setEditError(error.message || "Erro ao salvar alterações");
    }
  };

  const handleRemoveProfilePicture = () => {
    setTempCroppedImage(null); // Limpa a pré-visualização
    setCroppedImage(null); // Limpa a imagem exibida
    setEditError("");
  };

  // Função para abrir a imagem ampliada
  const abrirImagemAmpliada = (src: string, alt: string) => {
    setImagemAmpliada({
      aberto: true,
      src,
      alt,
    });
  };

  // Função para fechar a imagem ampliada
  const fecharImagemAmpliada = () => {
    setImagemAmpliada({
      aberto: false,
      src: null,
      alt: "",
    });
  };

  //Vincular conta do DISCORD
  const VincularContaDiscord = () => {
    // Criar um objeto com userId e a URL atual
    const state = JSON.stringify({
      userId: editFormData.userId || "",
      returnUrl: location.pathname, // Armazena a página atual
    });

    const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${import.meta.env.VITE_CLIENT_ID_DISCORD
      }&response_type=code&redirect_uri=${encodeURIComponent(
        "http://localhost:3005/auth/discord/callback"
      )}&scope=identify&state=${encodeURIComponent(state)}`;

    window.location.href = discordAuthUrl;
  };

  // Funções auxiliares modificadas
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const toggleProfileDropdown = () =>
    setIsProfileDropdownOpen(!isProfileDropdownOpen);

  const toggleHamburgerMenu = () => setIsHamburgerOpen(!isHamburgerOpen);

  const toggleEditModal = () => {
    if (showEditModal) {
      setIsVisible(false);
      setTimeout(() => {
        setShowEditModal(false);
        setEditError("");
      }, 300);
    } else {
      setShowEditModal(true);
    }
    setIsProfileDropdownOpen(false);
  };

  const activeAccount = instance.getActiveAccount();
  // Adicionar um useEffect para detectar o redirecionamento e recarregar os dados
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const discordLinked = searchParams.get("discordLinked");
    if (discordLinked === "true" && activeAccount?.username) {
      loadUserData(activeAccount.username); // Recarrega os dados do usuário
      setSuccessMessage("Conta do Discord vinculada com sucesso!");
      // Limpar a query string
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location, activeAccount]);

  return (
    <>
      <nav
        className={`z-50 py-5 fixed w-full flex justify-between items-center text-lg text-white font-blinker transition-all duration-300 ease-in-out ${isScrolled
          ? "bg-navbar lg:bg-navbar/97"
          : "bg-transparent lg:bg-transparent"
          } md:bg-navbar`}
      >
        <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-transparent">
          <div
            className={`absolute left-0 h-full bg-borda transition-all duration-500 ${isScrolled ? "w-full" : "w-0"
              }`}
          />
        </div>

        <div className="mx-14">
          <img className="w-16 h-16" src={logo} alt="Logo" />
        </div>

        {successMessage && <AlertaOk mensagem={successMessage} />}
        {errorMessage && <AlertaErro mensagem={errorMessage} />}

        <button
          className={`lg:hidden text-white fixed right-5 cursor-pointer transform transition-all duration-300 ${isHamburgerOpen ? "rotate-90" : "rotate-0"
            }`}
          onClick={toggleHamburgerMenu}
        >
          {isHamburgerOpen ? (
            <IoMdClose className="text-2xl" />
          ) : (
            <GiHamburgerMenu className="text-2xl" />
          )}
        </button>

        <div className="flex items-center">
          <ul
            className={`gap-6 items-center lg:flex ${isHamburgerOpen
              ? "mx-0 bg-navbar flex flex-col w-full absolute top-full left-0 justify-center items-center"
              : "lg:block hidden mx-2"
              }`}
          >
            <li
              className={`px-4 py-2 cursor-pointer transition-transform duration-300 hover:translate-y-[-4px] border-b-3 ${isHamburgerOpen
                ? `border-borda ${isActive("/") ? "text-azul-claro font-bold" : ""}`
                : `border-b-transparent hover:text-azul-claro hover:font-bold ${isActive("/") ? "text-azul-claro font-bold" : ""
                }`
                }`}
            >
              <Link to="/">Home</Link>
            </li>

            <li className="relative px-4 py-2 transition-transform duration-300 hover:translate-y-[-4px] border-b-3 border-b-transparent">
              <button
                onClick={toggleDropdown}
                className={`focus:outline-none flex items-center gap-1 cursor-pointer ${isTimesActive(location.pathname)
                  ? "text-azul-claro font-bold"
                  : "hover:text-azul-claro hover:font-bold"
                  }`}
              >
                Times{" "}
                <IoMdArrowDropdown
                  className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : "rotate-0"
                    }`}
                />
              </button>

              <ul
                className={`absolute bg-fundo border-2 border-borda shadow-lg rounded-lg transition-all duration-300 ease-out text-center ${isDropdownOpen
                  ? "opacity-100 translate-y-0 visible"
                  : "opacity-0 translate-y-[-20px] invisible"
                  } ${isHamburgerOpen && isDropdownOpen
                    ? "w-full border-t-2 rounded-none mt-4 relative right-0"
                    : "mt-12 right-[-60px]"
                  }`}
              >
                <li className="px-4 py-2 border-b-2 border-borda relative">
                  <Link
                    to="/times"
                    onClick={() => setIsDropdownOpen(false)}
                    className={`px-4 border-transparent inline-flex items-center gap-2 transform hover:scale-110 transition-transform duration-300 cursor-pointer ${isActive("/times")
                      ? "text-azul-claro font-bold"
                      : "hover:text-azul-claro hover:font-bold"
                      }`}
                  >
                    <RiTeamFill />
                    Membros
                  </Link>
                </li>

                <li className="px-4 py-2">
                  <Link
                    to="/admins"
                    onClick={() => setIsDropdownOpen(false)}
                    className={`px-4 border-transparent inline-flex items-center gap-2 transform hover:scale-110 transition-transform duration-300 cursor-pointer ${isActive("/admins")
                      ? "text-azul-claro font-bold"
                      : "hover:text-azul-claro hover:font-bold"
                      }`}
                  >
                    <FaUserTie />
                    Administradores
                  </Link>
                </li>
              </ul>
            </li>

            <li
              className={`px-4 py-2 cursor-pointer transition-transform duration-300 hover:translate-y-[-4px] border-b-3 ${isHamburgerOpen
                ? `border-borda ${isActive("/campeonatos") ? "text-azul-claro font-bold" : ""
                }`
                : `border-b-transparent hover:text-azul-claro hover:font-bold ${isActive("/campeonatos") ? "text-azul-claro font-bold" : ""
                }`
                }`}
            >
              <Link to="/campeonatos">Campeonatos</Link>
            </li>

            <li
              className={`px-4 py-2 cursor-pointer transition-transform duration-300 hover:translate-y-[-4px] border-b-3 ${isHamburgerOpen
                ? `border-borda ${isActive("/novidades") ? "text-azul-claro font-bold" : ""
                }`
                : `border-b-transparent hover:text-azul-claro hover:font-bold ${isActive("/novidades") ? "text-azul-claro font-bold" : ""
                }`
                }`}
            >
              <Link to="/novidades">Novidades</Link>
            </li>

            <li className="px-4 py-2 cursor-pointer">
              {!isAuthenticated ? (
                <button
                  onClick={handleLogin}
                  className="relative flex items-center justify-center px-4 py-2 gap-2 border-2 border-borda text-white rounded-md overflow-hidden transition-all duration-300 cursor-pointer before:absolute before:top-0 before:left-0 before:w-0 before:h-full before:bg-azul-claro before:transition-all before:duration-500 hover:before:w-full"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Login <CgLogIn />
                  </span>
                </button>
              ) : null}
            </li>
          </ul>

          {isAuthenticated && (
            <div
              className={`lg:mx-14 ${isHamburgerOpen
                ? "hidden"
                : "lg:inline-block fixed right-16 top-5 lg:static lg:top-auto lg:right-auto"
                }`}
            >
              <div className="px-4 py-2 cursor-pointer transition-transform duration-300 hover:translate-y-[-4px] relative">
                <button
                  onClick={toggleProfileDropdown}
                  className="relative w-10 h-10 group rounded-full overflow-hidden hover:cursor-pointer"
                >
                  {croppedImage ? (
                    <img
                      src={croppedImage}
                      alt="Foto de Perfil"
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <HiUserCircle className="w-full h-full transform hover:scale-110 transition-transform duration-300 hover:bg-hover hover:border-2 hover:border-borda" />
                  )}
                </button>

                <ul
                  className={`transition-all duration-300 ease-out text-center ${isProfileDropdownOpen
                    ? "opacity-100 translate-y-0 visible"
                    : "opacity-0 translate-y-[-20px] invisible"
                    } ${isHamburgerOpen
                      ? "fixed left-1/2 transform -translate-x-1/2 w-[90%] max-w-[300px] mt-4"
                      : "absolute left-0 transform -translate-x-1/2 mt-12"
                    }`}
                >
                  <div className="bg-fundo w-full border-2 border-borda shadow-azul-escuro shadow-sm rounded-lg flex flex-col">
                    <div className="w-full h-full flex border-b-2 border-borda items-center px-3 pt-1 pb-3 gap-3">
                      <div className="w-23 h-23 flex items-center justify-center">
                        <button
                          onClick={() => croppedImage && abrirImagemAmpliada(croppedImage, "Foto de Perfil")}
                          className="relative w-auto h-auto rounded-full overflow-hidden"
                        >
                          {croppedImage ? (
                            <img
                              src={croppedImage}
                              alt="Foto de Perfil"
                              className="w-full h-full transform hover:scale-110 transition-transform duration-300 cursor-pointer"
                            />
                          ) : (
                            <HiUserCircle className="w-14 h-14 transform hover:scale-110 transition-transform duration-300 cursor-pointer hover:bg-hover hover:border-2 hover:border-borda hover:rounded-full" />
                          )}
                        </button>
                      </div>
                      <div className="flex flex-col flex-grow items-center overflow-hidden">
                        <h1 className="font-bold">
                          {activeAccount?.name || "Usuário"}
                        </h1>
                        <p className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                          {activeAccount?.username || "Email não disponível"}
                        </p>
                      </div>
                    </div>

                    <div className="flex-grow pb-10 items-left">

                      <Link
                        to="/treinos-admin"
                        className="w-full"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <div
                          className="w-full p-2 cursor-pointer flex items-center gap-3 hover:bg-hover group pr-10"
                          onMouseEnter={() => setSwordHovered(true)}
                          onMouseLeave={() => setSwordHovered(false)}
                        >
                          <div className="w-10 h-10 flex items-center justify-center">
                            <GiSwordsEmblem
                              className="text-2xl text-azul-claro"
                              style={{
                                animation: isSwordHovered
                                  ? "shake 0.7s ease-in-out"
                                  : "none",
                              }}
                            />
                          </div>
                          <div className="flex flex-col flex-grow items-start overflow-hidden">
                            <h1 className="font-bold">Treinos</h1>
                            <p className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                              Consulte seus treinos
                            </p>
                          </div>
                        </div>
                      </Link>


                      <Link
                        to="/horas-pae"
                        className="w-full"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <div
                          className="w-full p-2 cursor-pointer flex items-center gap-3 hover:bg-hover group pr-10"
                          onMouseEnter={() => setClockIsHovered(true)}
                          onMouseLeave={() => setClockIsHovered(false)}
                        >
                          <div className="w-10 h-10 flex items-center justify-center">
                            <FaRegClock
                              className="text-2xl text-azul-claro"
                              style={{
                                animation: isClockHovered
                                  ? "rodar 0.7s ease-in-out"
                                  : "none",
                              }}
                            />
                          </div>
                          <div className="flex flex-col flex-grow items-start overflow-hidden">
                            <h1 className="font-bold">Horas PAEs</h1>
                            <p className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                              Consulte suas horas PAEs
                            </p>
                          </div>
                        </div>
                      </Link>

                      {userType !== "Jogador" && (
                        <Link
                          to="/admin-usuarios"
                          className="w-full"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <div
                            className="w-full p-2 cursor-pointer flex items-center gap-3 hover:bg-hover group pr-10"
                            onMouseEnter={() => setIsAdminHovered(true)}
                            onMouseLeave={() => setIsAdminHovered(false)}
                          >
                            <div className="w-10 h-10 flex items-center justify-center">
                              <FaUserCog
                                className="text-2xl text-azul-claro"
                                style={{
                                  animation: isAdminHovered
                                    ? "spinGear 0.6s ease-in-out forwards"
                                    : "none",
                                }}
                              />
                            </div>
                            <div className="flex flex-col flex-grow items-start overflow-hidden">
                              <h1 className="font-bold">Área Administrativa</h1>
                              <p className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                Gerenciar usuários
                              </p>
                            </div>
                          </div>
                        </Link>
                      )}

                      <div
                        className="w-full p-2 cursor-pointer flex items-center gap-3 hover:bg-hover group pr-10"
                        onClick={toggleEditModal}
                        onMouseEnter={() => setIsEditHovered(true)}
                        onMouseLeave={() => setIsEditHovered(false)}
                      >
                        <div className="w-10 h-10 flex items-center justify-center">
                          <RiImageEditLine
                            className="text-2xl text-azul-claro"
                            style={{
                              animation: isEditHovered
                                ? "pencilEdit 0.7s ease-in-out"
                                : "none",
                            }}
                          />
                        </div>
                        <div className="flex flex-col flex-grow items-start overflow-hidden">
                          <h1 className="font-bold">Editar Perfil</h1>
                          <p className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                            Alterar foto e informações
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <button
                        className="w-full border-t-2 border-borda p-2 mt-auto text-vermelho-claro flex items-center gap-2 cursor-pointer hover:bg-hover pl-4"
                        onClick={() => {
                          handleLogout();
                          setIsProfileDropdownOpen(false);
                        }}
                      >
                        <CgLogOut className="text-2xl" />
                        <span>Sair da conta</span>
                      </button>
                    </div>
                  </div>
                </ul>
              </div>
            </div>
          )}
        </div>
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
            <div className="max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
              <img
                src={imagemAmpliada.src || ""}
                alt={imagemAmpliada.alt}
                className="max-w-full max-h-[90vh] object-contain"
              />
            </div>
          </div>
        )}
      </nav>

      {/* Modal de Edição de Perfil */}
      {showEditModal && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-fundo/80 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
          <div
            className={`bg-fundo p-6 rounded-lg max-w-md w-full border shadow-sm shadow-azul-claro max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
              }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-branco">Editar Perfil</h2>
              <button
                onClick={toggleEditModal}
                className="text-fonte-escura hover:text-vermelho-claro hover:cursor-pointer"
              >
                <IoMdClose size={24} />
              </button>
            </div>

            {isLoadingUserData ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-azul-claro"></div>
              </div>
            ) : (
              <>
                {editError && (
                  <div className="mb-4 p-2 bg-vermelho-claro/20 text-vermelho-claro rounded text-sm">
                    {editError}
                  </div>
                )}

                {image ? (
                  <div
                    className="relative"
                    style={{ width: "100%", height: "300px" }}
                  >
                    <Cropper
                      image={image}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                      cropShape="round"
                      style={{
                        containerStyle: {
                          width: "100%",
                          height: "300px",
                          position: "relative",
                          background: "#f0f0f0",
                        },
                        cropAreaStyle: {
                          border: "2px solid rgba(0, 172, 255, 0.7)",
                        },
                      }}
                    />
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={handleCrop}
                        className="w-8 h-8 flex items-center justify-center p-1 bg-emerald-300 rounded-full text-branco cursor-pointer hover:bg-green-600 hover:scale-110 transition-transform duration-300 mx-3"
                      >
                        <MdDone />
                      </button>
                      <button
                        onClick={() => setImage(null)}
                        className="w-8 h-8 flex items-center justify-center p-1 bg-vermelho-claro rounded-full text-branco cursor-pointer hover:bg-red-500 hover:scale-110 transition-transform duration-300 mx-4"
                      >
                        <MdCancel />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {/* Email (não editável) */}
                      <div>
                        <label className="block text-sm text-fonte-escura font-semibold mb-1">
                          Email
                        </label>
                        <input
                          type="text"
                          value={editFormData.email}
                          readOnly
                          className="w-full border border-borda rounded p-2 text-fonte-escura bg-cinza-escuro cursor-not-allowed"
                        />
                      </div>

                      {/* Discord ID (editável) */}
                      <div>
                        <label className="block text-sm text-fonte-escura font-semibold mb-1">
                          Discord ID
                        </label>
                        <div className="flex items-center">
                          <div className="bg-fonte-escura rounded-l-md px-2 py-2 flex items-center justify-center">
                            <FaDiscord className="text-2xl" />
                          </div>
                          <input
                            type="text"
                            value={editFormData.discordID}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                discordID: e.target.value,
                              })
                            }
                            placeholder="Exemplo:123456789012345678"
                            className="w-full border border-borda border-l-0 rounded-r-md p-2 focus:border-azul-claro text-branco bg-preto focus:outline-none"
                            pattern="\d{18}|^$"
                          />
                        </div>
                        <p className="text-xs text-fonte-escura mt-1">
                          Deixe vazio para remover o Discord ID (deve ser um
                          número de 18 dígitos)
                        </p>
                        <p
                          className="text-xs text-fonte-escura mt-1 hover:cursor-pointer hover:text-azul-claro transform transition-all duration-200"
                          onClick={VincularContaDiscord}
                        >
                          Deseja vincular sua conta?
                        </p>
                      </div>

                      {/* Foto de perfil */}
                      <div>
                        <div className="flex flex-col items-center justify-center mb-4">
                          {tempCroppedImage ? (
                            <div className="relative w-32 h-32 mb-4">
                              <img
                                src={tempCroppedImage}
                                alt="Pré-visualização da Foto"
                                className="w-full h-full object-cover rounded-full border-2 border-azul-claro"
                              />
                              <button
                                onClick={() => setTempCroppedImage(null)}
                                className="absolute -top-2 -right-2 bg-vermelho-claro text-branco rounded-full w-6 h-6 flex items-center justify-center hover:bg-vermelho-escuro transition-colors"
                                title="Remover pré-visualização"
                              >
                                <IoMdClose className="w-4 h-4" />
                              </button>
                            </div>
                          ) : croppedImage ? (
                            <div className="relative w-32 h-32 mb-4">
                              <img
                                src={croppedImage}
                                alt="Foto de Perfil"
                                className="w-full h-full object-cover rounded-full border-2 border-azul-claro"
                              />
                              <button
                                onClick={handleRemoveProfilePicture}
                                className="absolute -top-2 -right-2 bg-vermelho-claro text-branco rounded-full w-6 h-6 flex items-center justify-center hover:bg-vermelho-escuro transition-colors"
                                title="Remover imagem"
                              >
                                <IoMdClose className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <HiUserCircle className="w-32 h-32 text-white mb-4" />
                          )}
                        </div>

                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-azul-claro rounded-lg cursor-pointer hover:bg-cinza-escuro/50 transition-colors mb-4">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <RiImageEditLine className="w-8 h-8 text-azul-claro mb-2" />
                            <p className="text-sm text-fonte-escura">
                              {croppedImage
                                ? "Alterar imagem"
                                : "Clique para enviar"}
                            </p>
                            <p className="text-xs text-fonte-escura/50 mt-1">
                              PNG, JPG ou JPEG (Max. 5MB)
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-6">
                      <SalvarBtn onClick={handleSaveProfile} />
                      <CancelarBtn onClick={toggleEditModal} />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;