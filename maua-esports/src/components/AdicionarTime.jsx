import { IoMdAddCircleOutline } from "react-icons/io";
import { useState } from "react";
import PropTypes from "prop-types";
import NovoTime from "./ModalNovoTime";

const AdicionarTime = ({ onAdicionarTime, userRole }) => {
  const [modalAberto, setModalAberto] = useState(false);

  // Only render if user is Administrador or Administrador Geral
  if (userRole !== "Administrador" && userRole !== "Administrador Geral") {
    return null;
  }

  const handleAdicionarClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setModalAberto(true);
  };

  const handleSalvar = (novoTime) => {
    onAdicionarTime(novoTime);
    setModalAberto(false);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
  };

  return (
    <>
      <div
        onClick={handleAdicionarClick}
        className="border-2 border-dotted rounded-tl-2xl rounded-br-2xl border-borda relative w-[300px] h-[450px] bg-fundo shadow-lg flex flex-col items-center 
          hover:scale-110 transition-transform duration-300 cursor-pointer animate-fadeInUp text-center justify-center"
      >
        <IoMdAddCircleOutline className="w-50 h-40 text-fonte-escura" />
        <h1 className="text-fonte-escura text-2xl">Adicionar Time</h1>
      </div>

      {modalAberto && (
        <NovoTime
          onClose={handleFecharModal}
          onSave={handleSalvar}
        />
      )}
    </>
  );
};

AdicionarTime.propTypes = {
  onAdicionarTime: PropTypes.func.isRequired,
  userRole: PropTypes.string, // Add userRole to propTypes
};

export default AdicionarTime;