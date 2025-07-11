import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { RiImageAddLine, RiCloseFill } from "react-icons/ri";
import FotoPadrao from "../../../assets/images/Foto.svg";
import SalvarBtn from "../../SalvarBtn";
import CancelarBtn from "../../CancelarBtn";

const NovidadeModal = ({ isOpen, onClose, onSave, initialData, userRole }) => {
  const [formData, setFormData] = useState({
    imagem: "",
    titulo: "",
    subtitulo: "",
    descricao: "",
    nomeBotao: "",
    urlBotao: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(FotoPadrao);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erroLocal, setErroLocal] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(
        initialData || {
          imagem: "",
          titulo: "",
          subtitulo: "",
          descricao: "",
          nomeBotao: "",
          urlBotao: "",
        }
      );
      setImagePreview(initialData?.imagem || FotoPadrao);
      setImageFile(null);
      setIsVisible(true);
    }
  }, [isOpen, initialData]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const tiposPermitidos = ["image/jpeg", "image/jpg", "image/png"];
      if (!tiposPermitidos.includes(file.type)) {
        setErroLocal(
          "Formato de imagem inválido. Use apenas JPG, JPEG ou PNG."
        );
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErroLocal("A imagem deve ter no máximo 5MB");
        return;
      }

      setErroLocal("");
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(FotoPadrao);
    setImageFile(null);
    setFormData((prev) => ({ ...prev, imagem: "" }));
  };

  const validarUrl = () => {
    const { urlBotao } = formData;
    if (urlBotao && !urlBotao.startsWith("https://")) {
      setErroLocal("O link do botão deve começar com https://");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!["Administrador", "Administrador Geral"].includes(userRole)) {
      setErroLocal("Você não tem permissão para salvar alterações.");
      return;
    }

    setIsSubmitting(true);
    setErroLocal("");

    if (!formData.titulo || !formData.descricao) {
      setErroLocal("Preencha todos os campos obrigatórios!");
      setIsSubmitting(false);
      return;
    }

    if (!validarUrl()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("titulo", formData.titulo);
      formDataToSend.append("subtitulo", formData.subtitulo.trim() || "");
      formDataToSend.append("descricao", formData.descricao);
      formDataToSend.append("nomeBotao", formData.nomeBotao.trim() || "");
      formDataToSend.append("urlBotao", formData.urlBotao.trim() || "");
      if (imageFile) {
        formDataToSend.append("imagem", imageFile);
      }

      await onSave(formDataToSend);
      handleClose();
    } catch (error) {
      setErroLocal(error.message || "Erro ao salvar novidade");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-fundo/80 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
    >
      <div
        className={`bg-fundo p-6 rounded-lg shadow-sm shadow-azul-claro w-[800px] relative max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-branco">Editar Novidade</h2>
          <button
            onClick={handleClose}
            className="text-fonte-escura hover:text-vermelho-claro hover:cursor-pointer"
            disabled={isSubmitting}
          >
            <RiCloseFill size={24} />
          </button>
        </div>

        {erroLocal && (
          <div className="mb-4 p-2 bg-vermelho-claro/20 text-vermelho-claro rounded">
            {erroLocal}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-fonte-escura font-semibold mb-2">
              Imagem <span className="text-vermelho-claro">*</span>
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
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isSubmitting}
              />
            </label>
            {imagePreview !== FotoPadrao && (
              <div className="mt-4 flex justify-center">
                <div className="relative w-24 h-24">
                  <img
                    src={imagePreview}
                    alt="Pré-visualização da imagem"
                    className="w-full h-full rounded object-cover border border-cinza-escuro"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-vermelho-claro text-branco rounded-full w-6 h-6 flex items-center justify-center hover:bg-vermelho-escuro transition-colors"
                    title="Remover imagem"
                    disabled={isSubmitting}
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
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-fonte-escura font-semibold mb-2">
              Subtítulo
            </label>
            <input
              type="text"
              name="subtitulo"
              value={formData.subtitulo}
              onChange={handleChange}
              className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-fonte-escura font-semibold mb-2">
              Descrição <span className="text-vermelho-claro">*</span>
            </label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              className="w-full h-100 border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
              rows="3"
              required
              disabled={isSubmitting}
            ></textarea>
            <p className="text-xs text-fonte-escura/50 mt-1">
              Suporta markdown para formatação (ex.: **negrito**, *itálico*).
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-fonte-escura font-semibold mb-2">
              Nome do Botão
            </label>
            <input
              type="text"
              name="nomeBotao"
              value={formData.nomeBotao}
              onChange={handleChange}
              className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
              placeholder="Ex: VER NOTÍCIA"
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-fonte-escura font-semibold mb-2">
              URL do Botão
            </label>
            <input
              type="text"
              name="urlBotao"
              value={formData.urlBotao}
              onChange={handleChange}
              className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
              placeholder="https://exemplo.com/pagina"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <SalvarBtn type="submit" disabled={isSubmitting} />
            <CancelarBtn onClick={handleClose} disabled={isSubmitting} />
          </div>
        </form>
      </div>
    </div>
  );
};

NovidadeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  userRole: PropTypes.oneOf([
    "Jogador",
    "Administrador",
    "Capitão de time",
    "Administrador Geral",
    null,
  ]),
};

export default NovidadeModal;
