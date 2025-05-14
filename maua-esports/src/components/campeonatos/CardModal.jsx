import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { RiCloseFill } from "react-icons/ri";
import SalvarBtn from '../SalvarBtn';
import CancelarBtn from '../CancelarBtn';

const CardModal = ({ isOpen, onClose, onSave, editingCard }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    gameName: '',
    startDate: '',
    firstPrize: '',
    secondPrize: '',
    thirdPrize: '',
    registrationLink: '',
    teamPosition: '',
    performanceDescription: ''
  });
  const [gameIconFile, setGameIconFile] = useState(null);
  const [gameIconUrl, setGameIconUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [organizerImageFile, setOrganizerImageFile] = useState(null);
  const [organizerImageUrl, setOrganizerImageUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingCard) {
      setFormData({
        name: editingCard.name || '',
        description: editingCard.description || '',
        price: editingCard.price || '',
        gameName: editingCard.gameName || '',
        startDate: editingCard.startDate ? new Date(editingCard.startDate).toISOString().split('T')[0] : '',
        firstPrize: editingCard.firstPrize || '',
        secondPrize: editingCard.secondPrize || '',
        thirdPrize: editingCard.thirdPrize || '',
        registrationLink: editingCard.registrationLink || '',
        teamPosition: editingCard.teamPosition || '',
        performanceDescription: editingCard.performanceDescription || ''
      });
      setGameIconUrl(editingCard.gameIconUrl || '');
      setImageUrl(editingCard.imageUrl || '');
      setOrganizerImageUrl(editingCard.organizerImageUrl || '');
    } else {
      resetForm();
    }
  }, [editingCard]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      gameName: '',
      startDate: '',
      firstPrize: '',
      secondPrize: '',
      thirdPrize: '',
      registrationLink: '',
      teamPosition: '',
      performanceDescription: ''
    });
    setGameIconFile(null);
    setGameIconUrl('');
    setImageFile(null);
    setImageUrl('');
    setOrganizerImageFile(null);
    setOrganizerImageUrl('');
    setErrors({});
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpa o erro quando o usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const tiposPermitidos = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml"];
      if (!tiposPermitidos.includes(file.type)) {
        setErrors({ ...errors, image: "Formato de imagem inválido. Use apenas JPG, JPEG, PNG ou SVG." });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: "A imagem deve ter no máximo 5MB" });
        return;
      }

      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
      setErrors({ ...errors, image: null });
    }
  };

  const handleGameIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const tiposPermitidos = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml"];
      if (!tiposPermitidos.includes(file.type)) {
        setErrors({ ...errors, gameIcon: "Formato de imagem inválido. Use apenas JPG, JPEG, PNG ou SVG." });
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setErrors({ ...errors, gameIcon: "O ícone deve ter no máximo 2MB" });
        return;
      }

      setGameIconFile(file);
      setGameIconUrl(URL.createObjectURL(file));
      setErrors({ ...errors, gameIcon: null });
    }
  };

  const handleOrganizerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const tiposPermitidos = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml"];
      if (!tiposPermitidos.includes(file.type)) {
        setErrors({ ...errors, organizerImage: "Formato de imagem inválido. Use apenas JPG, JPEG, PNG ou SVG." });
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setErrors({ ...errors, organizerImage: "A imagem deve ter no máximo 2MB" });
        return;
      }

      setOrganizerImageFile(file);
      setOrganizerImageUrl(URL.createObjectURL(file));
      setErrors({ ...errors, organizerImage: null });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    // Campos obrigatórios
    if (!imageFile && !imageUrl) {
      newErrors.image = "Imagem do campeonato é obrigatória";
    }
    
    if (!gameIconFile && !gameIconUrl) {
      newErrors.gameIcon = "Ícone do jogo é obrigatório";
    }
    
    if (!formData.gameName.trim()) {
      newErrors.gameName = "Nome do jogo é obrigatório";
    }
    
    if (!formData.name.trim()) {
      newErrors.name = "Nome do campeonato é obrigatório";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    }
    
    if (!organizerImageFile && !organizerImageUrl) {
      newErrors.organizerImage = "Logo do organizador é obrigatório";
    }
    
    // Validações adicionais
    if (formData.registrationLink && !formData.registrationLink.startsWith("https://")) {
      newErrors.registrationLink = "O link deve começar com https://";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('gameName', formData.gameName);
      formDataToSend.append('startDate', formData.startDate);
      formDataToSend.append('firstPrize', formData.firstPrize);
      formDataToSend.append('secondPrize', formData.secondPrize);
      formDataToSend.append('thirdPrize', formData.thirdPrize);
      formDataToSend.append('registrationLink', formData.registrationLink);
      formDataToSend.append('teamPosition', formData.teamPosition);
      formDataToSend.append('performanceDescription', formData.performanceDescription);

      if (imageFile) formDataToSend.append('image', imageFile);
      if (gameIconFile) formDataToSend.append('gameIcon', gameIconFile);
      if (organizerImageFile) formDataToSend.append('organizerImage', organizerImageFile);

      await onSave(formDataToSend);
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar campeonato:", error);
      setErrors({ submit: error.message || "Ocorreu um erro ao salvar o campeonato" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-fundo/80 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`bg-fundo p-6 rounded-lg shadow-sm shadow-azul-claro w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-branco">
            {editingCard ? 'Editar Campeonato' : 'Criar Campeonato'}
          </h2>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Imagem do campeonato */}
          <div>
            <label className="block text-sm text-fonte-escura font-semibold mb-1">
              Imagem do campeonato <span className="text-vermelho-claro">*</span> (Recomendado: 800x300px)
            </label>
            <div className="flex flex-col gap-2">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded mb-2 border border-cinza-escuro"
                />
              )}
              <input
                type="file"
                accept="image/jpeg, image/jpg, image/png, image/svg+xml"
                onChange={handleImageChange}
                className={`w-full text-sm border rounded p-2 text-branco bg-preto focus:outline-none ${
                  errors.image
                    ? "border-vermelho-claro focus:border-vermelho-claro"
                    : "border-borda focus:border-azul-claro"
                }`}
              />
              {errors.image && (
                <p className="text-vermelho-claro text-sm mt-1">{errors.image}</p>
              )}
            </div>
          </div>

          {/* Informações do jogo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-fonte-escura font-semibold mb-1">
                Ícone do jogo <span className="text-vermelho-claro">*</span> (Recomendado: 64x64px)
              </label>
              <div className="flex flex-col gap-2">
                {gameIconUrl && (
                  <img
                    src={gameIconUrl}
                    alt="Game Icon Preview"
                    className="w-16 h-16 object-contain rounded mb-2 border border-cinza-escuro"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleGameIconChange}
                  className={`w-full text-sm border rounded p-2 text-branco bg-preto focus:outline-none ${
                    errors.gameIcon
                      ? "border-vermelho-claro focus:border-vermelho-claro"
                      : "border-borda focus:border-azul-claro"
                  }`}
                />
                {errors.gameIcon && (
                  <p className="text-vermelho-claro text-sm mt-1">{errors.gameIcon}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm text-fonte-escura font-semibold mb-1">
                Nome do jogo <span className="text-vermelho-claro">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: CS:GO"
                name="gameName"
                value={formData.gameName}
                onChange={handleChange}
                className={`w-full border rounded p-2 text-branco bg-preto focus:outline-none ${
                  errors.gameName
                    ? "border-vermelho-claro focus:border-vermelho-claro"
                    : "border-borda focus:border-azul-claro"
                }`}
              />
              {errors.gameName && (
                <p className="text-vermelho-claro text-sm mt-1">{errors.gameName}</p>
              )}
            </div>
          </div>

          {/* Informações básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-fonte-escura font-semibold mb-1">
                Nome do campeonato <span className="text-vermelho-claro">*</span>
              </label>
              <input
                type="text"
                placeholder="Nome do Campeonato"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full border rounded p-2 text-branco bg-preto focus:outline-none ${
                  errors.name
                    ? "border-vermelho-claro focus:border-vermelho-claro"
                    : "border-borda focus:border-azul-claro"
                }`}
              />
              {errors.name && (
                <p className="text-vermelho-claro text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-fonte-escura font-semibold mb-1">
                Data de início
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full border border-borda rounded p-2 text-branco bg-preto focus:outline-none focus:border-azul-claro"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-fonte-escura font-semibold mb-1">
              Preço de inscrição
            </label>
            <input
              type="text"
              placeholder="Ex: R$ 10,00"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full border border-borda rounded p-2 text-branco bg-preto focus:outline-none focus:border-azul-claro"
            />
          </div>

          <div>
            <label className="block text-sm text-fonte-escura font-semibold mb-1">
              Descrição <span className="text-vermelho-claro">*</span>
            </label>
            <textarea
              placeholder="Descrição do campeonato"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`w-full border rounded p-2 text-branco bg-preto focus:outline-none ${
                errors.description
                  ? "border-vermelho-claro focus:border-vermelho-claro"
                  : "border-borda focus:border-azul-claro"
              }`}
              rows="4"
            />
            {errors.description && (
              <p className="text-vermelho-claro text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Premiações */}
          <div>
            <label className="block text-sm text-fonte-escura font-semibold mb-1">
              Premiações
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-fonte-escura mb-1">1º Lugar</label>
                <input
                  type="text"
                  placeholder="Ex: R$ 500"
                  name="firstPrize"
                  value={formData.firstPrize}
                  onChange={handleChange}
                  className="w-full border border-borda rounded p-2 text-branco bg-preto focus:outline-none focus:border-azul-claro"
                />
              </div>
              <div>
                <label className="block text-xs text-fonte-escura mb-1">2º Lugar</label>
                <input
                  type="text"
                  placeholder="Ex: R$ 300"
                  name="secondPrize"
                  value={formData.secondPrize}
                  onChange={handleChange}
                  className="w-full border border-borda rounded p-2 text-branco bg-preto focus:outline-none focus:border-azul-claro"
                />
              </div>
              <div>
                <label className="block text-xs text-fonte-escura mb-1">3º Lugar</label>
                <input
                  type="text"
                  placeholder="Ex: R$ 200"
                  name="thirdPrize"
                  value={formData.thirdPrize}
                  onChange={handleChange}
                  className="w-full border border-borda rounded p-2 text-branco bg-preto focus:outline-none focus:border-azul-claro"
                />
              </div>
            </div>
          </div>

          {/* Desempenho do time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-fonte-escura font-semibold mb-1">
                Posição do time
              </label>
              <input
                type="text"
                placeholder="Ex: 4º Lugar"
                name="teamPosition"
                value={formData.teamPosition}
                onChange={handleChange}
                className="w-full border border-borda rounded p-2 text-branco bg-preto focus:outline-none focus:border-azul-claro"
              />
            </div>

            <div>
              <label className="block text-sm text-fonte-escura font-semibold mb-1">
                Descrição do desempenho
              </label>
              <textarea
                placeholder="Descreva como foi a participação do time"
                name="performanceDescription"
                value={formData.performanceDescription}
                onChange={handleChange}
                className="w-full border border-borda rounded p-2 text-branco bg-preto h-24 focus:outline-none focus:border-azul-claro"
              />
            </div>
          </div>

          {/* Imagem do organizador */}
          <div>
            <label className="block text-sm text-fonte-escura font-semibold mb-1">
              Logo do organizador <span className="text-vermelho-claro">*</span> (Recomendado: 100x100px)
            </label>
            <div className="flex flex-col gap-2">
              {organizerImageUrl && (
                <img
                  src={organizerImageUrl}
                  alt="Organizer Logo Preview"
                  className="max-w-[100px] max-h-[100px] object-contain rounded mb-2 border border-cinza-escuro"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleOrganizerImageChange}
                className={`w-full text-sm border rounded p-2 text-branco bg-preto focus:outline-none ${
                  errors.organizerImage
                    ? "border-vermelho-claro focus:border-vermelho-claro"
                    : "border-borda focus:border-azul-claro"
                }`}
              />
              {errors.organizerImage && (
                <p className="text-vermelho-claro text-sm mt-1">{errors.organizerImage}</p>
              )}
            </div>
          </div>

          {/* Link de inscrição */}
          <div>
            <label className="block text-sm text-fonte-escura font-semibold mb-1">
              Link de inscrição
            </label>
            <input
              type="url"
              placeholder="https://..."
              name="registrationLink"
              value={formData.registrationLink}
              onChange={handleChange}
              className={`w-full border rounded p-2 text-branco bg-preto focus:outline-none ${
                errors.registrationLink
                  ? "border-vermelho-claro focus:border-vermelho-claro"
                  : "border-borda focus:border-azul-claro"
              }`}
            />
            {errors.registrationLink && (
              <p className="text-vermelho-claro text-sm mt-1">{errors.registrationLink}</p>
            )}
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

CardModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  editingCard: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.string,
    gameIconUrl: PropTypes.string,
    gameName: PropTypes.string,
    imageUrl: PropTypes.string,
    startDate: PropTypes.string,
    firstPrize: PropTypes.string,
    secondPrize: PropTypes.string,
    thirdPrize: PropTypes.string,
    organizerImageUrl: PropTypes.string,
    registrationLink: PropTypes.string,
    teamPosition: PropTypes.string,
    performanceDescription: PropTypes.string
  })
};

export default CardModal;