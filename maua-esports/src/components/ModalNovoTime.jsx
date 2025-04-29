import React, { useState } from "react";
import { RiCloseFill, RiImageAddLine, RiImageEditLine } from "react-icons/ri";
import PropTypes from "prop-types";
import SalvarBtn from "./SalvarBtn";
import CancelarBtn from "./CancelarBtn";
import ImageCropper from "./ImageCropper";
import { UseImageCrop } from "./UseImageCrop";

const ModalNovoTime = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    id: "",
    nome: "",
    rota: "",
    foto: null,
    jogo: null,
  });
  const [erro, setErro] = useState("");
  
  // Controles para a foto do time
  const {
    image: fotoImage,
    croppedImage: fotoCropped,
    isCropping: isCroppingFoto,
    handleFileChange: handleFotoFileChange,
    handleCropComplete: handleFotoCropComplete,
    handleCancelCrop: handleCancelFotoCrop,
    setCroppedImage: setFotoCropped
  } = UseImageCrop(null);
  
  // Controles para o logo do jogo
  const {
    image: jogoImage,
    croppedImage: jogoCropped,
    isCropping: isCroppingJogo,
    handleFileChange: handleJogoFileChange,
    handleCropComplete: handleJogoCropComplete,
    handleCancelCrop: handleCancelJogoCrop,
    setCroppedImage: setJogoCropped
  } = UseImageCrop(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.id || !formData.nome || !formData.rota) {
        throw new Error("ID, Nome e Rota são obrigatórios!");
      }
      if (!fotoCropped || !jogoCropped) {
        throw new Error("Foto do time e logo do jogo são obrigatórios!");
      }
      
      const dataToSave = {
        ...formData,
        foto: fotoCropped,
        jogo: jogoCropped
      };
      
      const success = await onSave(dataToSave);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error("Erro ao criar time:", error);
      setErro(error.message || "Ocorreu um erro ao criar o time");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-fundo/80">
      {/* Modal de corte de imagem para foto do time */}
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
      
      {/* Modal de corte de imagem para logo do jogo */}
      {isCroppingJogo && (
        <ImageCropper
          initialImage={jogoImage}
          onCropComplete={handleJogoCropComplete}
          onCancel={handleCancelJogoCrop}
          aspect={1}
          cropShape="rect"
          cropSize={{ width: 400, height: 400 }}
        />
      )}
      
      {/* Modal principal */}
      <div className="bg-fundo p-6 rounded-lg shadow-sm shadow-azul-claro w-96 relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-branco">Criar Novo Time</h2>
          <button
            onClick={onClose}
            className="text-fonte-escura hover:text-vermelho-claro hover:cursor-pointer"
          >
            <RiCloseFill size={24} />
          </button>
        </div>

        {erro && (
          <div className="mb-4 p-2 bg-vermelho-claro/20 text-vermelho-claro rounded">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ID do Time */}
          <div className="mb-4">
            <label className="block text-sm text-fonte-escura font-semibold mb-2">
              ID do Time <span className="text-vermelho-claro">*</span>
            </label>
            <input
              type="number"
              name="id"
              value={formData.id}
              onChange={handleChange}
              className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
              required
            />
          </div>

          {/* Nome do Time */}
          <div className="mb-4">
            <label className="block text-sm text-fonte-escura font-semibold mb-2">
              Nome do Time <span className="text-vermelho-claro">*</span>
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
              required
            />
          </div>

          {/* Rota */}
          <div className="mb-4">
            <label className="block text-sm text-fonte-escura font-semibold mb-2">
              Rota <span className="text-vermelho-claro">*</span>
            </label>
            <input
              type="text"
              name="rota"
              value={formData.rota}
              onChange={handleChange}
              className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
              required
            />
          </div>

          {/* Foto do Time */}
          <div className="mb-4">
            <label className="block text-sm text-fonte-escura font-semibold mb-2">
              Foto do Time <span className="text-vermelho-claro">*</span>
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
              />
            </label>
            {fotoCropped && (
              <div className="mt-4 flex justify-center">
                <div className="relative w-24 h-24">
                  <img
                    src={fotoCropped}
                    alt="Preview da foto"
                    className="w-full h-full rounded object-cover border border-cinza-escuro"
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

          {/* Logo do Jogo */}
          <div className="mb-4">
            <label className="block text-sm text-fonte-escura font-semibold mb-2">
              Logo do Jogo <span className="text-vermelho-claro">*</span>
            </label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-azul-claro rounded-lg cursor-pointer hover:bg-cinza-escuro/50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {jogoCropped ? (
                  <RiImageEditLine className="w-8 h-8 text-azul-claro mb-2" />
                ) : (
                  <RiImageAddLine className="w-8 h-8 text-azul-claro mb-2" />
                )}
                <p className="text-sm text-fonte-escura">
                  {jogoCropped ? "Alterar logo" : "Clique para enviar"}
                </p>
                <p className="text-xs text-fonte-escura/50 mt-1">
                  PNG, JPG ou JPEG (Max. 5MB)
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  handleJogoFileChange(e);
                  setJogoCropped(null);
                }}
                className="hidden"
              />
            </label>
            {jogoCropped && (
              <div className="mt-4 flex justify-center">
                <div className="relative w-24 h-24">
                  <img
                    src={jogoCropped}
                    alt="Preview do logo"
                    className="w-full h-full rounded object-cover border border-cinza-escuro"
                  />
                  <button
                    type="button"
                    onClick={() => setJogoCropped(null)}
                    className="absolute -top-2 -right-2 bg-vermelho-claro text-branco rounded-full w-6 h-6 flex items-center justify-center hover:bg-vermelho-escuro transition-colors"
                    title="Remover imagem"
                  >
                    <RiCloseFill className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <SalvarBtn type="submit" />
            <CancelarBtn onClick={onClose} />
          </div>
        </form>
      </div>
    </div>
  );
};

ModalNovoTime.propTypes = {
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ModalNovoTime;