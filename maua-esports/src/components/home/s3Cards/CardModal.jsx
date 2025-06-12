/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { RiImageAddLine, RiCloseFill } from "react-icons/ri";
import SalvarBtn from "../../SalvarBtn";
import CancelarBtn from "../../CancelarBtn";
import { createPortal } from "react-dom";
import axios from "axios";
import AlertaErro from "../../AlertaErro";
import { useMsal } from "@azure/msal-react";

const API_BASE_URL = "http://localhost:3000";

const CardModal = ({
  isOpen,
  onClose,
  textoAtual,
  tituloAtual,
  iconAtual,
  cardId,
  onSave,
  onCardSave,
  onCardError,
  userRole,
}) => {
  const [texto, setTexto] = useState("");
  const [titulo, setTitulo] = useState("");
  const [iconPreview, setIconPreview] = useState(null);
  const [iconFile, setIconFile] = useState(null);
  const [erroLocal, setErroLocal] = useState("");
  const [showAlertaErro, setShowAlertaErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { instance } = useMsal();

  useEffect(() => {
    if (isOpen) {
      setTexto(textoAtual || "");
      setTitulo(tituloAtual || "");
      setIconPreview(iconAtual || null);
      setIconFile(null);
      setErroLocal("");
      setShowAlertaErro("");
      setIsVisible(true);
    }
  }, [isOpen, textoAtual, tituloAtual, iconAtual]);

  useEffect(() => {
    return () => {
      if (iconPreview && iconPreview.startsWith("blob:")) {
        console.log("Revoking blob URL:", iconPreview);
        URL.revokeObjectURL(iconPreview);
      }
    };
  }, [iconPreview]);

  const handleClose = () => {
    console.log("handleClose called, setting isVisible to false");
    setIsVisible(false);
    setTimeout(() => {
      console.log("Calling onClose after 300ms delay");
      onClose();
    }, 300);
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Icon file selected:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });
      const tiposPermitidos = ["image/jpeg", "image/jpg", "image/png"];
      if (!tiposPermitidos.includes(file.type)) {
        console.log("Invalid file type:", file.type);
        setErroLocal(
          "Formato de imagem inválido. Use apenas JPG, JPEG ou PNG."
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        console.log("File too large:", file.size);
        setErroLocal("A imagem deve ter no máximo 5MB");
        return;
      }
      setErroLocal("");
      setIconFile(file);
      const previewURL = URL.createObjectURL(file);
      console.log("New icon preview URL:", previewURL);
      setIconPreview(previewURL);
    } else {
      console.log("No file selected");
      setErroLocal("Nenhuma imagem selecionada.");
    }
  };

  const handleRemoveIcon = () => {
    console.log("Removing icon, current iconPreview:", iconPreview);
    if (iconPreview && iconPreview.startsWith("blob:")) {
      console.log("Revoking blob URL:", iconPreview);
      URL.revokeObjectURL(iconPreview);
    }
    setIconPreview(null);
    setIconFile(null);
  };

  const handleSubmit = async () => {
    console.log("handleSubmit called with state:", {
      titulo,
      texto,
      iconFile: iconFile ? iconFile.name : null,
      userRole,
      cardId,
    });

    if (!["Administrador", "Administrador Geral"].includes(userRole)) {
      console.log("Permission denied: userRole is", userRole);
      setErroLocal("Você não tem permissão para salvar alterações.");
      return;
    }

    if (!titulo || !texto) {
      console.log("Validation failed: missing title or description", {
        titulo,
        texto,
      });
      setErroLocal("Preencha todos os campos obrigatórios!");
      return;
    }

    if (loading) {
      console.log("Submit aborted: already loading");
      return;
    }

    setLoading(true);
    setErroLocal("");
    setShowAlertaErro("");
    console.log("Starting save operation, loading set to true");

    try {
      const account = instance.getActiveAccount();
      console.log("MSAL account:", account ? account.username : "No account");
      if (!account) {
        const errorMessage = "Usuário não autenticado.";
        console.log("Authentication error:", errorMessage);
        setShowAlertaErro(errorMessage);
        if (onCardError) {
          console.log("Calling onCardError with:", errorMessage);
          onCardError(errorMessage);
        }
        setLoading(false);
        return;
      }

      let tokenResponse;
      try {
        console.time("acquireTokenSilent");
        tokenResponse = await instance.acquireTokenSilent({
          scopes: ["User.Read"],
          account,
        });
        console.timeEnd("acquireTokenSilent");
        console.log(
          "Token acquired silently:",
          tokenResponse.accessToken ? "Success" : "No token"
        );
      } catch (silentError) {
        console.log("Silent token acquisition failed:", silentError.message);
        if (silentError.errorCode === "interaction_required") {
          console.log("Falling back to acquireTokenPopup");
          tokenResponse = await instance.acquireTokenPopup({
            scopes: ["User.Read"],
            account,
          });
          console.log(
            "Token acquired via popup:",
            tokenResponse.accessToken ? "Success" : "No token"
          );
        } else {
          throw silentError;
        }
      }

      const formData = new FormData();
      formData.append("titulo", titulo);
      formData.append("descricao", texto);
      if (iconFile) {
        formData.append("icone", iconFile);
      } else if (!iconPreview) {
        formData.append("icone", "");
      }
      console.log("FormData prepared:", {
        titulo,
        descricao: texto,
        icone: iconFile
          ? iconFile.name
          : iconPreview
          ? "Existing icon"
          : "No icon",
      });

      console.time("axiosPut");
      const response = await axios.put(
        `${API_BASE_URL}/cards/${cardId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${tokenResponse.accessToken}`,
          },
          timeout: 10000,
        }
      );
      console.timeEnd("axiosPut");
      console.log("API response:", {
        status: response.status,
        data: response.data,
      });

      if (response.status === 200) {
        const saveData = {
          texto,
          titulo,
          icon: response.data.iconUrl || iconPreview || "",
          showAlert: true,
        };
        console.log("Calling onSave with:", saveData);
        onSave(saveData);
        if (onCardSave) {
          console.log("Calling onCardSave");
          onCardSave();
        }
        console.log("Initiating modal closure and page reload");
        handleClose();
        setTimeout(() => {
          window.location.reload();
        }, 300); // Delay reload to allow modal animation to complete
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Erro ao salvar alterações.";
      console.error("Save error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        error: error.message,
      });
      setShowAlertaErro(errorMessage);
      if (onCardError) {
        console.log("Calling onCardError with:", errorMessage);
        onCardError(errorMessage);
      }
    } finally {
      console.log("Save operation complete, setting loading to false");
      setLoading(false);
    }
  };

  if (!isOpen) {
    console.log("CardModal not rendered: isOpen is false");
    return null;
  }

  console.log("Rendering CardModal with state:", {
    isVisible,
    loading,
    erroLocal,
    showAlertaErro,
    iconPreview,
  });

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-fundo/80 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`bg-fundo p-6 rounded-lg shadow-sm shadow-azul-claro w-96 relative max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {showAlertaErro && <AlertaErro mensagem={showAlertaErro} />}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-branco">Editar Informações</h2>
          <button
            onClick={handleClose}
            className="text-fonte-escura hover:text-vermelho-claro hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
            aria-label="Fechar modal"
          >
            <RiCloseFill size={24} />
          </button>
        </div>

        {erroLocal && (
          <div className="mb-4 p-2 bg-vermelho-claro/20 text-vermelho-claro rounded">
            {erroLocal}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm text-fonte-escura font-semibold mb-2">
            Ícone <span className="text-vermelho-claro">*</span>
          </label>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-azul-claro rounded-lg cursor-pointer hover:bg-cinza-escuro/50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <RiImageAddLine className="w-8 h-8 text-azul-claro mb-2" />
              <p className="text-sm text-fonte-escura">Clique para enviar</p>
              <p className="text-xs text-fonte-escura/50 mt-1">
                PNG, JPG ou JPEG (Max. 5MB)
              </p>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleIconChange}
              className="hidden"
              disabled={loading}
            />
          </label>
          {iconPreview && (
            <div className="mt-4 flex justify-center">
              <div className="relative w-24 h-24">
                <img
                  src={iconPreview}
                  alt="Pré-visualização do ícone"
                  className="w-full h-full rounded object-cover border border-cinza-escuro"
                />
                <button
                  type="button"
                  onClick={handleRemoveIcon}
                  className="absolute -top-2 -right-2 bg-vermelho-claro text-branco rounded-full w-6 h-6 flex items-center justify-center hover:bg-vermelho-escuro transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remover imagem"
                  disabled={loading}
                  aria-label="Remover ícone"
                >
                  <RiCloseFill className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm text-fonte-escura font-semibold mb-2">
            Título <span className="text-vermelho-claro">*</span>
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none disabled:opacity-50"
            required
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-fonte-escura font-semibold mb-2">
            Descrição <span className="text-vermelho-claro">*</span>
          </label>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none disabled:opacity-50"
            rows="3"
            required
            disabled={loading}
          />
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <SalvarBtn
            onClick={handleSubmit}
            disabled={loading}
            loading={loading}
          />
          <CancelarBtn onClick={handleClose} disabled={loading} />
        </div>
      </div>
    </div>,
    document.body
  );
};

CardModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  textoAtual: PropTypes.string,
  tituloAtual: PropTypes.string,
  iconAtual: PropTypes.string,
  cardId: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
  onCardSave: PropTypes.func,
  onCardError: PropTypes.func,
  userRole: PropTypes.oneOf([
    "Jogador",
    "Administrador",
    "Administrador Geral",
    null,
  ]),
};

export default CardModal;
