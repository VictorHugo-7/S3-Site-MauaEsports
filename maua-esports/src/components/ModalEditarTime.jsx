import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { RiCloseFill, RiImageAddLine, RiImageEditLine } from "react-icons/ri";
import SalvarBtn from "./SalvarBtn";
import CancelarBtn from "./CancelarBtn";
import ImageCropper from "./ImageCropper";
import { UseImageCrop } from "./UseImageCrop";

const ModalEditarTime = ({ time, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    _id: time._id,
    nome: time.nome,
  });
  const [errors, setErrors] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [jogoPreview, setJogoPreview] = useState(time.jogo || null);

  const {
    image: fotoImage,
    croppedImage: fotoCropped,
    isCropping: isCroppingFoto,
    handleFileChange: handleFotoFileChange,
    handleCropComplete: handleFotoCropComplete,
    handleCancelCrop: handleCancelFotoCrop,
    setCroppedImage: setFotoCropped,
  } = UseImageCrop(time.foto || null);

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

  const handleJogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setJogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.nome) {
      newErrors.nome = "Nome é obrigatório";
    }
    
    if (!fotoCropped && !time.foto) {
      newErrors.foto = "Foto do Time é obrigatória";
    }
    
    if (!jogoPreview && !time.jogo) {
      newErrors.jogo = "Logo do Jogo é obrigatório";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const dataToSave = {
          ...formData,
          foto: fotoCropped || time.foto,
          jogo: jogoPreview || time.jogo,
        };
        
        await onSave(dataToSave);
        handleClose();
      } catch (error) {
        setErrors({ submit: error.message });
      }
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-fundo/80 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
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
        className={`bg-fundo p-6 rounded-lg shadow-sm shadow-azul-claro w-96 relative max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-branco">Editar Time</h2>
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

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-fonte-escura font-semibold mb-1">
              ID do Time
            </label>
            <input
              type="text"
              name="_id"
              value={formData._id}
              className="w-full border border-borda rounded p-2 text-branco bg-preto focus:outline-none"
              disabled
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-fonte-escura font-semibold mb-1">
              Nome do Time <span className="text-vermelho-claro">*</span>
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className={`w-full border rounded p-2 text-branco bg-preto focus:outline-none ${
                errors.nome
                  ? "border-vermelho-claro focus:border-vermelho-claro"
                  : "border-borda focus:border-azul-claro"
              }`}
            />
            {errors.nome && (
              <p className="text-vermelho-claro text-sm mt-1">{errors.nome}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm text-fonte-escura font-semibold mb-1">
              Foto do Time <span className="text-vermelho-claro">*</span>
            </label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-azul-claro rounded-lg cursor-pointer hover:bg-cinza-escuro/50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {fotoCropped || time.foto ? (
                  <RiImageEditLine className="w-8 h-8 text-azul-claro mb-2" />
                ) : (
                  <RiImageAddLine className="w-8 h-8 text-azul-claro mb-2" />
                )}
                <p className="text-sm text-fonte-escura">
                  {fotoCropped || time.foto ? "Alterar imagem" : "Clique para enviar"}
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
              <p className="text-vermelho-claro text-sm mt-1">{errors.foto}</p>
            )}
            {(fotoCropped || time.foto) && (
              <div className="mt-4 flex justify-center">
                <div className="relative w-24 h-24">
                  <img
                    src={fotoCropped || time.foto}
                    alt="Preview da foto"
                    className="w-full h-full rounded object-cover border border-cinza-escuro"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm text-fonte-escura font-semibold mb-1">
              Logo do Jogo <span className="text-vermelho-claro">*</span>
            </label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-azul-claro rounded-lg cursor-pointer hover:bg-cinza-escuro/50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {jogoPreview || time.jogo ? (
                  <RiImageEditLine className="w-8 h-8 text-azul-claro mb-2" />
                ) : (
                  <RiImageAddLine className="w-8 h-8 text-azul-claro mb-2" />
                )}
                <p className="text-sm text-fonte-escura">
                  {jogoPreview || time.jogo ? "Alterar logo" : "Clique para enviar"}
                </p>
                <p className="text-xs text-fonte-escura/50 mt-1">
                  PNG, JPG ou JPEG (Max. 5MB)
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleJogoChange}
                className="hidden"
              />
            </label>
            {errors.jogo && (
              <p className="text-vermelho-claro text-sm mt-1">{errors.jogo}</p>
            )}
            {(jogoPreview || time.jogo) && (
              <div className="mt-4 flex justify-center">
                <div className="relative w-24 h-24">
                  <img
                    src={jogoPreview || time.jogo}
                    alt="Preview do logo"
                    className="w-full h-full rounded object-cover border border-cinza-escuro"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <SalvarBtn type="submit" />
            <CancelarBtn onClick={handleClose} />
          </div>
        </form>
      </div>
    </div>
  );
};

ModalEditarTime.propTypes = {
  time: PropTypes.shape({
    _id: PropTypes.string.isRequired, // Alterado de id para _id
    nome: PropTypes.string.isRequired,
    foto: PropTypes.string.isRequired,
    jogo: PropTypes.string.isRequired,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ModalEditarTime;