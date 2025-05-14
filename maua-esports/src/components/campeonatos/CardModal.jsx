import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { RiCloseFill } from "react-icons/ri";

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
  const [erro, setErro] = useState("");
  const [isVisible, setIsVisible] = useState(false);

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
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleGameIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGameIconFile(file);
      setGameIconUrl(URL.createObjectURL(file));
    }
  };

  const handleOrganizerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOrganizerImageFile(file);
      setOrganizerImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name) {
        throw new Error("Nome do campeonato é obrigatório!");
      }

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
      setErro(error.message || "Ocorreu um erro ao salvar o campeonato");
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

        {erro && (
          <div className="mb-4 p-2 bg-vermelho-claro/20 text-vermelho-claro rounded text-sm">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Imagem do campeonato */}
          <div>
            <label className="block text-sm text-fonte-escura font-semibold mb-1">
              Imagem do campeonato (Recomendado: 800x300px)
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
                className="w-full text-sm border border-borda text-branco bg-preto rounded p-2 focus:border-azul-claro focus:outline-none"
              />
            </div>
          </div>

          {/* Informações do jogo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-fonte-escura font-semibold mb-1">
                Ícone do jogo (Recomendado: 64x64px)
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
                  className="w-full text-sm border border-borda text-branco bg-preto rounded p-2 focus:border-azul-claro focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-fonte-escura font-semibold mb-1">
                Nome do jogo
              </label>
              <input
                type="text"
                placeholder="Ex: CS:GO"
                name="gameName"
                value={formData.gameName}
                onChange={handleChange}
                className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
              />
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
                className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
                required
              />
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
                className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
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
              className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-fonte-escura font-semibold mb-1">
              Descrição
            </label>
            <textarea
              placeholder="Descrição do campeonato"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-borda text-branco bg-preto p-2 rounded h-24 focus:border-azul-claro focus:outline-none"
            />
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
                  className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
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
                  className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
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
                  className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
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
                className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
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
                className="w-full border border-borda text-branco bg-preto p-2 rounded h-24 focus:border-azul-claro focus:outline-none"
              />
            </div>
          </div>

          {/* Imagem do organizador */}
          <div>
            <label className="block text-sm text-fonte-escura font-semibold mb-1">
              Logo do organizador (Recomendado: 100x100px)
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
                className="w-full text-sm border border-borda text-branco bg-preto rounded p-2 focus:border-azul-claro focus:outline-none"
              />
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
              className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
            />
          </div>

          {/* Botões - Estilo modificado para combinar com ModalUsuario */}
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-borda rounded text-branco hover:bg-cinza-escuro/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-azul-claro text-branco rounded hover:bg-azul-escuro transition-colors"
            >
              {editingCard ? 'Atualizar' : 'Criar'}
            </button>
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