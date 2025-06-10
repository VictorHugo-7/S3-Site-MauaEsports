import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  RiCloseFill,
  RiImageAddLine,
  RiImageEditLine,
  RiTwitterXFill,
} from "react-icons/ri";
import { IoLogoTwitch } from "react-icons/io";
import { FaInstagram } from "react-icons/fa";
import SalvarBtn from "./SalvarBtn";
import CancelarBtn from "./CancelarBtn";
import ImageCropper from "./ImageCropper";
import { UseImageCrop } from "./UseImageCrop";

const EditarJogador = ({ jogador = {}, onSave, onClose }) => {
  const {
    _id: jogadorId = "",
    nome: nomeInicial = "",
    titulo: tituloInicial = "",
    descricao: descricaoInicial = "",
    fotoUrl: fotoInicial = "",
    insta: instagramInicial = "",
    twitter: twitterInicial = "",
    twitch: twitchInicial = "",
  } = jogador;

  const [formData, setFormData] = useState({
    nome: nomeInicial,
    titulo: tituloInicial,
    descricao: descricaoInicial,
    instagram: instagramInicial || "",
    twitter: twitterInicial || "",
    twitch: twitchInicial || "",
  });

  const [errors, setErrors] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  const {
    image: fotoImage,
    croppedImage: fotoCropped,
    isCropping: isCroppingFoto,
    handleFileChange: handleFotoFileChange,
    handleCropComplete: handleFotoCropComplete,
    handleCancelCrop: handleCancelFotoCrop,
    setCroppedImage: setFotoCropped,
  } = UseImageCrop(fotoInicial || null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRemoveFoto = () => {
    setFotoCropped(null);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nome) {
      newErrors.nome = "Nome é obrigatório";
    }

    if (!formData.titulo) {
      newErrors.titulo = "Título é obrigatório";
    }

    if (!formData.descricao) {
      newErrors.descricao = "Descrição é obrigatória";
    }

    if (!fotoCropped && !fotoInicial) {
      newErrors.foto = "Foto do Jogador é obrigatória";
    }

    if (formData.instagram && !formData.instagram.startsWith("https://")) {
      newErrors.instagram = "O link do Instagram deve começar com https://";
    }

    if (formData.twitter && !formData.twitter.startsWith("https://")) {
      newErrors.twitter = "O link do Twitter deve começar com https://";
    }

    if (formData.twitch && !formData.twitch.startsWith("https://")) {
      newErrors.twitch = "O link do Twitch deve começar com https://";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const jogadorAtualizado = {
          id: jogadorId,
          ...formData,
          foto: fotoCropped || fotoInicial,
          // Converter strings vazias para null
          instagram: formData.instagram || null,
          twitter: formData.twitter || null,
          twitch: formData.twitch || null,
        };

        await onSave(jogadorId, jogadorAtualizado);
        handleClose();
      } catch (error) {
        setErrors({ submit: error.message });
      }
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-fundo/80 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
    >
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
        className={`bg-fundo p-6 rounded-lg max-w-md w-full border shadow-sm shadow-azul-claro max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-branco">Editar Jogador</h2>
          <button
            onClick={handleClose}
            className="text-fonte-escura hover:text-vermelho-claro hover:cursor-pointer"
          >
            <RiCloseFill size={24} />
          </button>
        </div>

        {errors.submit && (
          <div className="mb-4 p-2 bg-vermelho-claro/20 text-vermelho-claro rounded text-sm">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm text-fonte-escura font-semibold mb-1">
                Foto do Jogador <span className="text-vermelho-claro">*</span>
              </label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-azul-claro rounded-lg cursor-pointer hover:bg-cinza-escuro/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {fotoCropped || fotoInicial ? (
                    <RiImageEditLine className="w-8 h-8 text-azul-claro mb-2" />
                  ) : (
                    <RiImageAddLine className="w-8 h-8 text-azul-claro mb-2" />
                  )}
                  <p className="text-sm text-fonte-escura">
                    {fotoCropped || fotoInicial
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
                  onChange={(e) => {
                    handleFotoFileChange(e);
                    setFotoCropped(null);
                  }}
                  className="hidden"
                />
              </label>
              {errors.foto && (
                <p className="text-vermelho-claro text-sm mt-1">
                  {errors.foto}
                </p>
              )}
              {(fotoCropped || fotoInicial) && (
                <div className="mt-4 flex justify-center">
                  <div className="relative w-24 h-24">
                    <img
                      src={fotoCropped || fotoInicial}
                      alt="Preview da foto"
                      className="w-full h-full object-cover border border-cinza-escuro"
                    />
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
                className={`w-full border rounded p-2 text-branco bg-preto focus:outline-none ${errors.nome
                    ? "border-vermelho-claro focus:border-vermelho-claro"
                    : "border-borda focus:border-azul-claro"
                  }`}
              />
              {errors.nome && (
                <p className="text-vermelho-claro text-sm mt-1">
                  {errors.nome}
                </p>
              )}
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
                className={`w-full border rounded p-2 text-branco bg-preto focus:outline-none ${errors.titulo
                    ? "border-vermelho-claro focus:border-vermelho-claro"
                    : "border-borda focus:border-azul-claro"
                  }`}
              />
              {errors.titulo && (
                <p className="text-vermelho-claro text-sm mt-1">
                  {errors.titulo}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-fonte-escura font-semibold mb-1">
                Descrição <span className="text-vermelho-claro">*</span>
              </label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                className={`w-full border rounded p-2 text-branco bg-preto focus:outline-none ${errors.descricao
                    ? "border-vermelho-claro focus:border-vermelho-claro"
                    : "border-borda focus:border-azul-claro"
                  }`}
                rows="3"
              />
              {errors.descricao && (
                <p className="text-vermelho-claro text-sm mt-1">
                  {errors.descricao}
                </p>
              )}
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
                  className={`w-full border border-l-0 rounded-r-md p-2 text-branco bg-preto focus:outline-none ${errors.instagram
                      ? "border-vermelho-claro focus:border-vermelho-claro"
                      : "border-borda focus:border-azul-claro"
                    }`}
                />
              </div>
              {errors.instagram && (
                <p className="text-vermelho-claro text-sm mt-1">
                  {errors.instagram}
                </p>
              )}

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
                  className={`w-full border border-l-0 rounded-r-md p-2 text-branco bg-preto focus:outline-none ${errors.twitter
                      ? "border-vermelho-claro focus:border-vermelho-claro"
                      : "border-borda focus:border-azul-claro"
                    }`}
                />
              </div>
              {errors.twitter && (
                <p className="text-vermelho-claro text-sm mt-1">
                  {errors.twitter}
                </p>
              )}

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
                  className={`w-full border border-l-0 rounded-r-md p-2 text-branco bg-preto focus:outline-none ${errors.twitch
                      ? "border-vermelho-claro focus:border-vermelho-claro"
                      : "border-borda focus:border-azul-claro"
                    }`}
                />
              </div>
              {errors.twitch && (
                <p className="text-vermelho-claro text-sm mt-1">
                  {errors.twitch}
                </p>
              )}
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

EditarJogador.propTypes = {
  jogador: PropTypes.shape({
    _id: PropTypes.string,
    nome: PropTypes.string,
    titulo: PropTypes.string,
    descricao: PropTypes.string,
    fotoUrl: PropTypes.string,
    insta: PropTypes.string,
    twitter: PropTypes.string,
    twitch: PropTypes.string,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditarJogador;
