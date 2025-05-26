import { useState } from "react";
import PropTypes from "prop-types";
import EditarBtn from "../../EditarBtn";
import CardModal from "./CardModal";
import { motion } from "framer-motion";

const Card = ({
  id,
  icon,
  texto,
  titulo = "Título",
  onCardSave,
  onCardError,
  onUpdateCard,
  userRole,
  ...aosProps
}) => {
  const [modalAberto, setModalAberto] = useState(false);

  const abrirModal = () => {
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
  };

  const salvarAlteracoes = (dados) => {
    if (dados.showAlert && onCardSave) {
      onCardSave();
    }
    if (onUpdateCard) {
      onUpdateCard(id, dados);
    }
  };

  return (
    <motion.div
      className="rounded-[12px] flex flex-col h-80 w-60 border-1 border-borda bg-gradient-to-br from-gray-800 to-gray-900 transition-all duration-300 ease-in-out p-5"
      whileHover={{
        scale: 1.05,
        boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)",
        borderColor: "#3B82F6", // azul-claro
      }}
      {...aosProps}
    >
      <motion.div
        className="pb-5"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <img className="w-12 h-12 object-contain" src={icon} alt={titulo} />
      </motion.div>

      <motion.h2
        className="text-lg font-semibold text-fonte-escura"
        whileHover={{ opacity: 0.8 }}
      >
        {titulo}
      </motion.h2>

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
        <motion.p className="text-fonte-escura" whileHover={{ opacity: 0.8 }}>
          {texto}
        </motion.p>
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
        onCardError={onCardError}
        userRole={userRole}
      />

      <div className="flex justify-end mt-2">
        {["Administrador", "Administrador Geral"].includes(userRole) && (
          <EditarBtn onClick={abrirModal} />
        )}
      </div>
    </motion.div>
  );
};

Card.propTypes = {
  id: PropTypes.string.isRequired,
  texto: PropTypes.string,
  icon: PropTypes.string,
  titulo: PropTypes.string,
  onCardSave: PropTypes.func,
  onCardError: PropTypes.func,
  onUpdateCard: PropTypes.func,
  userRole: PropTypes.oneOf([
    "Jogador",
    "Administrador",
    "Administrador Geral",
    null,
  ]),
  "data-aos": PropTypes.string,
  "data-aos-delay": PropTypes.string,
};

export default Card;
