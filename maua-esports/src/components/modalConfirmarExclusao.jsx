import React from "react";
import PropTypes from "prop-types";

const ModalConfirmarExclusao = ({ isOpen, mensagem, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-fundo/50 bg-opacity-50 flex items-center justify-center z-50
        ${isOpen ? "animate-fade-in" : "animate-fade-out"}`}
    >
      <div className="bg-[#1E252F] p-6 rounded-xl shadow-lg text-white animate-scale-in">
        <p className="mb-4">{mensagem}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 hover:cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-400 text-white px-4 py-2 rounded hover:bg-red-700 hover:cursor-pointer"
          >
            Excluir
          </button>
        </div>
      </div>
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fade-out {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          @keyframes scale-in {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-in-out forwards;
          }
          .animate-fade-out {
            animation: fade-out 0.3s ease-in-out forwards;
          }
          .animate-scale-in {
            animation: scale-in 0.3s ease-in-out forwards;
          }
        `}
      </style>
    </div>
  );
};

ModalConfirmarExclusao.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  mensagem: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ModalConfirmarExclusao;
