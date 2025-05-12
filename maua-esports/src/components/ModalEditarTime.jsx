import React, { useState } from "react";
import PropTypes from "prop-types";
import { RiCloseFill, RiImageAddLine, RiImageEditLine } from "react-icons/ri";
import SalvarBtn from "./SalvarBtn";
import CancelarBtn from "./CancelarBtn";
import ImageCropper from "./ImageCropper";
import { UseImageCrop } from "./UseImageCrop";

const ModalEditarTime = ({ time, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    id: time.id,
    nome: time.nome,
    rota: time.rota,
  });
  const [erro, setErro] = useState("");
  const [jogoImage, setJogoImage] = useState(time.jogo || null);
  
  // Controles para a foto do time (com cropper)
  const {
    image: fotoImage,
    croppedImage: fotoCropped,
    isCropping: isCroppingFoto,
    handleFileChange: handleFotoFileChange,
    handleCropComplete: handleFotoCropComplete,
    handleCancelCrop: handleCancelFotoCrop,
    setCroppedImage: setFotoCropped
  } = UseImageCrop(time.foto || null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Manipulador simples para a imagem do jogo (sem cropper)
  const handleJogoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const tiposPermitidos = ["image/jpeg", "image/jpg", "image/png"];
      if (!tiposPermitidos.includes(file.type)) {
        setErro("Formato de imagem inválido. Use apenas JPG, JPEG ou PNG.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErro("A imagem deve ter no máximo 5MB");
        return;
      }

      setErro("");
      const reader = new FileReader();
      reader.onload = () => {
        setJogoImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveJogoImage = () => {
    setJogoImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.nome) {
        throw new Error("Nome é obrigatório!");
      }
      
      const dataToSave = {
        ...formData,
        foto: fotoCropped,
        jogo: jogoImage
      };
      
      await onSave(dataToSave);
    } catch (error) {
      console.error("Erro ao editar time:", error);
      setErro(error.message || "Ocorreu um erro ao editar o time");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-fundo/80">
      {/* Modal de corte de imagem apenas para foto do time */}
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
      
      <div className="bg-fundo p-6 rounded-lg shadow-sm shadow-azul-claro w-96 relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-branco">Editar Time</h2>
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
              ID do Time
            </label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
              disabled
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

          {/* Foto do Time (com cropper) */}
          <div className="mb-4">
            <label className="block text-sm text-fonte-escura font-semibold mb-2">
              Foto do Time
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

          {/* Logo do Jogo (sem cropper) */}
          <div className="mb-4">
            <label className="block text-sm text-fonte-escura font-semibold mb-2">
              Logo do Jogo
            </label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-azul-claro rounded-lg cursor-pointer hover:bg-cinza-escuro/50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {jogoImage ? (
                  <RiImageEditLine className="w-8 h-8 text-azul-claro mb-2" />
                ) : (
                  <RiImageAddLine className="w-8 h-8 text-azul-claro mb-2" />
                )}
                <p className="text-sm text-fonte-escura">
                  {jogoImage ? "Alterar logo" : "Clique para enviar"}
                </p>
                <p className="text-xs text-fonte-escura/50 mt-1">
                  PNG, JPG ou JPEG (Max. 5MB)
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleJogoFileChange}
                className="hidden"
              />
            </label>
            {jogoImage && (
              <div className="mt-4 flex justify-center">
                <div className="relative w-24 h-24">
                  <img
                    src={jogoImage}
                    alt="Preview do logo"
                    className="w-full h-full rounded object-contain border border-cinza-escuro"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveJogoImage}
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

ModalEditarTime.propTypes = {
  time: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    nome: PropTypes.string.isRequired,
    rota: PropTypes.string.isRequired,
    foto: PropTypes.string,
    jogo: PropTypes.string,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ModalEditarTime;