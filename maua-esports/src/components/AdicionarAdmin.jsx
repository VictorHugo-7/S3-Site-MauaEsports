import React, { useState } from "react";
import PropTypes from "prop-types";
import { IoMdAddCircleOutline } from "react-icons/io";
import ModalAdicionarAdmin from "./ModalAdicionarAdmin";

const AdicionarAdmin = ({ onAdicionarAdmin, userRole }) => {
  const [modalAberto, setModalAberto] = useState(false);
  const [erro, setErro] = useState("");

  const handleAdicionarClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setModalAberto(true);
  };

  const handleSalvar = async (novoAdmin) => {
    try {
      await onAdicionarAdmin(novoAdmin);
      setModalAberto(false);
    } catch (error) {
      setErro(error.message || "Erro ao adicionar administrador");
    }
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setErro("");
  };
// Only render if user is Administrador or Administrador Geral
if (userRole !== "Administrador" && userRole !== "Administrador Geral") {
  return null;
}
  return (
    <>
      <div
        onClick={handleAdicionarClick}
        className="border-2 border-dotted rounded-tl-2xl rounded-br-2xl border-borda relative w-[300px] h-[450px] bg-fundo shadow-lg flex flex-col items-center 
          hover:scale-110 transition-transform duration-300 cursor-pointer animate-fadeInUp text-center justify-center"
      >
        <IoMdAddCircleOutline className="w-50 h-40 text-fonte-escura" />
        <h1 className="text-fonte-escura text-2xl font-blinker font-bold">
          Adicionar Admin
        </h1>
      </div>

      {modalAberto && (
        <ModalAdicionarAdmin
          onClose={handleFecharModal}
          onSave={handleSalvar}
          erro={erro}
        />
      )}
    </>
  );
};

AdicionarAdmin.propTypes = {
  onAdicionarAdmin: PropTypes.func.isRequired,
  userRole: PropTypes.string,
};

export default AdicionarAdmin;
