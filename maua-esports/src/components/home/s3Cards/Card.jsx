import { useState } from 'react';
import PropTypes from 'prop-types';
import EditarBtn from '../../EditarBtn';
import CardModal from './CardModal';

const Card = ({ id, icon, texto, titulo = 'Título', onCardSave, onUpdateCard, ...aosProps }) => {
  const [modalAberto, setModalAberto] = useState(false);

  const abrirModal = () => {
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
  };

  const salvarAlteracoes = (dados) => {
    if (dados.showAlert && onCardSave) {
      onCardSave(); // Trigger alert in Home
    }
    if (onUpdateCard) {
      onUpdateCard(id, dados); // Update card data in CardLayout
    }
  };

  return (
    <div
      className="rounded-[12px] flex flex-col h-80 w-60 border-1 border-borda hover:scale-101 hover:border-azul-claro transition-all duration-300 ease-in-out p-5"
      {...aosProps}
    >
      <div className="pb-5">
        <img className="w-12 h-12 object-contain" src={icon} alt={titulo} />
      </div>

      <h2 className="text-lg font-semibold text-fonte-escura">{titulo}</h2>

      <div className="flex-grow overflow-auto my-4 scrollbar-custom pr-4 text-[13px]">
        <style>{`
          .scrollbar-custom::-webkit-scrollbar {
            width: 2px;
          }
          .scrollbar-custom::-webkit-scrollbar-track {
            background: #000;
            border-radius: 20px;
          }
          .scrollbar-custom::-webkit-scrollbar-thumb {
            background: #3D444D;
            border-radius: 10px;
          }
          .scrollbar-custom::-webkit-scrollbar-thumb:hover {
            background: white;
          }
        `}</style>
        <p className="text-fonte-escura">{texto}</p>
      </div>

      <CardModal
        isOpen={modalAberto}
        onClose={fecharModal}
        textoAtual={texto}
        tituloAtual={titulo}
        iconAtual={icon}
        cardId={id}
        onSave={salvarAlteracoes}
        onCardSave={onCardSave}
      />

      <div className="flex justify-end mt-2">
        <EditarBtn onClick={abrirModal} />
      </div>
    </div>
  );
};

Card.propTypes = {
  id: PropTypes.string.isRequired,
  texto: PropTypes.string,
  icon: PropTypes.string,
  titulo: PropTypes.string,
  onCardSave: PropTypes.func,
  onUpdateCard: PropTypes.func,
  'data-aos': PropTypes.string,
  'data-aos-delay': PropTypes.string,
};

export default Card;    