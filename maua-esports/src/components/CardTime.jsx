import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import EditarBtn from "./EditarBtn";
import DeletarBtn from "./DeletarBtn";
import PropTypes from "prop-types";

const CardTime = ({ timeId, nome, foto, jogo, onDelete, onEditClick, userRole }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [jogoError, setJogoError] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const isAdmin = ["Administrador", "Administrador Geral"].includes(userRole);
  const defaultFoto = "/path/to/default-team.jpg"; // Substitua pelo caminho real
  const defaultJogo = "/path/to/default-game.png"; // Substitua pelo caminho real

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isConfirmed = window.confirm(
      `Tem certeza que deseja deletar o time ${nome}?`
    );

    if (isConfirmed && onDelete) {
      onDelete(timeId);
    }
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEditClick(timeId);
  };

  const handleCardClick = () => {
    navigate(`/times/${timeId}/membros`);
  };

  return (
    <>
      <div className="relative group">
        <div
          onClick={handleCardClick}
          className="block hover:scale-105 transition-transform duration-300 cursor-pointer"
        >
          <div className="border-2 border-borda relative w-[300px] h-[450px] bg-fundo shadow-lg flex flex-col items-center rounded-md">
            {error && (
              <div className="absolute top-2 left-2 bg-red-500 text-white p-2 rounded">
                {error}
              </div>
            )}
            <div className="absolute top-2 right-2 bg-black bg-opacity-90 rounded-full w-8 h-8 flex items-center justify-center z-10">
              <span className="text-branco font-bold text-md">{timeId}</span>
            </div>

            <div className="w-full h-[70%] relative overflow-hidden rounded-t-md">
              {imgError ? (
                <div className="w-full h-full bg-cinza-escuro flex items-center justify-center">
                  <span className="text-branco">Imagem não disponível</span>
                </div>
              ) : (
                <img
                  src={foto || defaultFoto}
                  alt={`Imagem do time ${nome}`}
                  className="w-full h-full object-cover absolute top-0 left-0 transition-transform duration-800 ease-in-out hover:scale-110"
                  onError={() => setImgError(true)}
                />
              )}
            </div>

            <div className="w-full h-[30%] flex flex-col justify-between p-4">
              <div className="flex justify-between items-center">
                <h1 className="text-lg text-branco font-semibold">{nome}</h1>
                {jogoError ? (
                  <div className="w-6 h-6 bg-cinza-escuro rounded-md"></div>
                ) : (
                  <img
                    src={jogo || defaultJogo}
                    alt="Logo do jogo"
                    className="w-6 h-6"
                    onError={() => setJogoError(true)}
                  />
                )}
              </div>

              {isAdmin && (
                <div className="flex justify-center space-x-4">
                  <EditarBtn
                    onClick={handleEditClick}
                    role="button"
                    aria-label={`Editar time ${nome}`}
                  />
                  <DeletarBtn
                    itemId={timeId}
                    onDelete={handleDeleteClick}
                    tipo="time"
                    role="button"
                    aria-label={`Deletar time ${nome}`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            <p>Tem certeza que deseja deletar o time {nome}?</p>
            <button
              onClick={confirmDelete}
              className="bg-red-500 text-white p-2 mr-2"
            >
              Confirmar
            </button>
            <button
              onClick={() => setShowConfirmModal(false)}
              className="bg-gray-500 text-white p-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

CardTime.propTypes = {
  timeId: PropTypes.number.isRequired,
  nome: PropTypes.string.isRequired,
  foto: PropTypes.string.isRequired,
  jogo: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
  userRole: PropTypes.oneOf([
    "Jogador",
    "Administrador",
    "Administrador Geral",
    null,
  ]),
};

export default CardTime;