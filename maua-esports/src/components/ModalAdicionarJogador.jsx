import React, { useState, useEffect } from "react";
import { FaInstagram } from "react-icons/fa";
import { RiTwitterXFill } from "react-icons/ri";
import { IoLogoTwitch } from "react-icons/io";
import { RiCloseFill, RiImageAddLine, RiImageEditLine } from "react-icons/ri";
import PropTypes from "prop-types";
import SalvarBtn from "./SalvarBtn";
import CancelarBtn from "./CancelarBtn";
import ImageCropper from "./ImageCropper";
import { UseImageCrop } from "./UseImageCrop";
import AlertaErro from "./AlertaErro";
import AlertaOk from "./AlertaOk";

const ModalAdicionarMembro = ({ onClose, onSave, timeId }) => {
  const [formData, setFormData] = useState({
    nome: "",
    titulo: "",
    descricao: "",
    instagram: "",
    twitter: "",
    twitch: "",
  });

  const {
    image: fotoImage,
    croppedImage: fotoCropped,
    isCropping: isCroppingFoto,
    handleFileChange: handleFotoFileChange,
    handleCropComplete: handleFotoCropComplete,
    handleCancelCrop: handleCancelFotoCrop,
    setCroppedImage: setFotoCropped,
  } = UseImageCrop(null);

  const [erro, setErro] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true); // Ativa a animação de entrada quando o modal é montado
  }, []);

  const handleClose = () => {
    setIsVisible(false); // Inicia a animação de saída
    setTimeout(() => {
      onClose(); // Chama onClose após a animação (300ms)
    }, 300);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validarLinks = () => {
    const { instagram, twitter, twitch } = formData;

    if (instagram && !instagram.startsWith("https://")) {
      setErro("O link do Instagram deve começar com https://");
      return false;
    }
    if (twitter && !twitter.startsWith("https://")) {
      setErro("O link do Twitter deve começar com https://");
      return false;
    }
    if (twitch && !twitch.startsWith("https://")) {
      setErro("O link do Twitch deve começar com https://");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação básica
    if (
      !fotoCropped ||
      !formData.nome ||
      !formData.titulo ||
      !formData.descricao
    ) {
      setErro("Preencha todos os campos obrigatórios!");
      return;
    }

    if (!validarLinks()) return;

    // Prepara os dados garantindo que redes sociais vazias sejam null
    const novoJogador = {
      nome: formData.nome.trim(),
      titulo: formData.titulo.trim(),
      descricao: formData.descricao.trim(),
      foto: fotoCropped,
      insta: formData.instagram?.trim() || null,
      twitter: formData.twitter?.trim() || null,
      twitch: formData.twitch?.trim() || null,
      time: timeId,
    };

    try {
      await onSave(novoJogador);
      setSuccessMessage("Jogador adicionado com sucesso!");
      setTimeout(() => {
        handleClose(); // Fecha o modal após exibir o alerta de sucesso
      }, 2000); // Aguarda 2 segundos para o usuário ver o sucesso
    } catch (error) {
      setErro(error.message || "Erro ao adicionar jogador");
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-fundo/80 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {erro && <AlertaErro mensagem={erro} />}
      {successMessage && <AlertaOk mensagem={successMessage} />}

      {isCroppingFoto && (
        <ImageCropper
          initialImage={fotoImage}
          onCropComplete={handleFotoCropComplete}
          onCancel={handleCancelFotoCrop}
          aspect={1}
          cropShape="rect"
          cropSize={{ width: 400, height: 400 }}
        />
      )}

      <div
        className={`bg-fundo p-6 rounded-lg shadow-sm shadow-azul-claro w-full max-w-md relative max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-branco">Adicionar Jogador</h2>
          <button
            onClick={handleClose}
            className="text-fonte-escura hover:text-vermelho-claro hover:cursor-pointer"
          >
            <RiCloseFill size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm text-fonte-escura font-semibold mb-2">
                Foto do Jogador <span className="text-vermelho-claro">*</span>
              </label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-azul-claro rounded-lg cursor-pointer hover:bg-cinza-escuro/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {fotoCropped ? (
                    <RiImageEditLine className="w-8 h-8 text-azul-claro mb-2" />
                  ) : (
                    <RiImageAddLine className="w-8 h-8 text-azul-claro mb-2" />
                  )}
                  <p className="text-sm text-fonte-escura">
                    {fotoCropped ? "Alterar imagem" : "Clique para enviar"}
                  </p>
                  <p className="text-xs text-fonte-escura/50 mt-1">
                    PNG, JPG ou JPEG (Max. 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    handleFotoFileChange(e);
                    setFotoCropped(null);
                  }}
                  className="hidden"
                  required
                />
              </label>
              {fotoCropped && (
                <div className="mt-4 flex justify-center">
                  <div className="relative w-24 h-24">
                    <img
                      src={fotoCropped}
                      alt="Preview da foto"
                      className="w-full h-full object-cover border border-cinza-escuro"
                    />
                    <button
                      type="button"
                      onClick={() => setFotoCropped(null)}
                      className="absolute -top-2 -right-2 bg-vermelho-claro text-branco rounded-full w-6 h-6 flex items-center justify-center hover:bg-vermelho-escuro transition-colors"
                      title="Remover imagem"
                    >
                      <RiCloseFill className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-fonte-escura font-semibold mb-1">
                Nome <span className="text-vermelho-claro">*</span>
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="w-full border border-borda rounded p-2 text-branco bg-preto focus:border-azul-claro focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-fonte-escura font-semibold mb-1">
                Título <span className="text-vermelho-claro">*</span>
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className="w-full border border-borda rounded p-2 text-branco bg-preto focus:border-azul-claro focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-fonte-escura font-semibold mb-1">
                Descrição <span className="text-vermelho-claro">*</span>
              </label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                className="w-full border border-borda rounded p-2 text-branco bg-preto focus:border-azul-claro focus:outline-none"
                rows="3"
                required
              />
            </div>

            <div>
              <h3 className="text-sm text-fonte-escura font-semibold mb-2">
                Redes Sociais
              </h3>

              <div className="flex items-center mb-2">
                <div className="bg-fonte-escura rounded-l-md px-2 py-2 flex items-center justify-center">
                  <FaInstagram className="text-2xl" />
                </div>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="https://instagram.com/usuario"
                  className="w-full border border-borda border-l-0 rounded-r-md p-2 focus:border-azul-claro text-branco bg-preto focus:outline-none"
                />
              </div>

              <div className="flex items-center mb-2">
                <div className="bg-fonte-escura rounded-l-md px-2 py-2 flex items-center justify-center">
                  <RiTwitterXFill className="text-2xl" />
                </div>
                <input
                  type="text"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="https://twitter.com/usuario"
                  className="w-full border border-borda border-l-0 rounded-r-md p-2 focus:border-azul-claro text-branco bg-preto focus:outline-none"
                />
              </div>

              <div className="flex items-center">
                <div className="bg-fonte-escura rounded-l-md px-2 py-2 flex items-center justify-center">
                  <IoLogoTwitch className="text-2xl" />
                </div>
                <input
                  type="text"
                  name="twitch"
                  value={formData.twitch}
                  onChange={handleChange}
                  placeholder="https://twitch.tv/usuario"
                  className="w-full border border-borda border-l-0 rounded-r-md p-2 focus:border-azul-claro text-branco bg-preto focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <SalvarBtn type="submit" />
            <CancelarBtn onClick={handleClose} />
          </div>
        </form>
      </div>
    </div>
  );
};

ModalAdicionarMembro.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  timeId: PropTypes.string.isRequired,
};

export default ModalAdicionarMembro;
