import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import EditarBtn from "./EditarBtn";
import DeletarBtn from "./DeletarBtn";
import PropTypes from "prop-types";

const CardTime = ({ timeId, nome, foto, jogo, rota, onDelete, onEditClick }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [jogoError, setJogoError] = useState(false);

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(timeId);
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEditClick(timeId);
  };

  const handleCardClick = () => {
    // Usa a rota que vem do banco de dados
    navigate(`/times/${rota}`);
    
    // Alternativa segura caso a rota possa vir undefined/null
    // navigate(`/times/${rota || 'sem-rota'}`);
  };

  return (
    <div className="relative group">
      <div
        onClick={handleCardClick}
        className="block hover:scale-105 transition-transform duration-300 cursor-pointer"
      >
        <div
          className="border-2 border-borda relative w-[300px] h-[450px] bg-fundo shadow-lg flex flex-col items-center"
          style={{
            clipPath:
              "polygon(15% 0%, 100% 0%, 100% 90%, 85% 100%, 0% 100%, 0% 10%)",
          }}
        >
          {/* ID do Time - Posicionado no canto inferior direito */}
          <div className="absolute up-1 right-1 bg-black bg-opacity-90 rounded-full w-8 h-8 flex items-center justify-center z-10 my-2 mx-2">
            <span className="text-branco font-bold text-md">{timeId}</span>
          </div>

          {/* Área da imagem */}
          <div
            className="w-full h-[70%] relative overflow-hidden"
            style={{
              clipPath: "polygon(0% 0%, 100% 0%, 100% 90%, 85% 100%, 0% 100%)",
            }}
          >
            {imgError ? (
              <div className="w-full h-full bg-cinza-escuro flex items-center justify-center">
                <span className="text-branco">Imagem não disponível</span>
              </div>
            ) : (
              <img
                src={foto || '/placeholder-time.jpg'} // Fallback caso foto seja null/undefined
                alt={`Imagem do time ${nome}`}
                className="w-full h-full object-cover absolute top-0 left-0 transition-transform duration-800 ease-in-out hover:scale-112"
                onError={() => setImgError(true)}
              />
            )}
          </div>

          {/* Área de informações */}
          <div className="w-full h-[30%] flex flex-col justify-between p-4">
            <div className="flex justify-between items-center">
              <h1 className="text-lg text-branco font-semibold">{nome}</h1>
              {jogoError ? (
                <div className="w-6 h-6 bg-cinza-escuro"></div>
              ) : (
                <img
                  src={jogo || '/placeholder-jogo.png'} // Fallback caso jogo seja null/undefined
                  alt="Logo do jogo"
                  className="w-6 h-6"
                  onError={() => setJogoError(true)}
                />
              )}
            </div>

            <div className="flex justify-center space-x-4">
              <EditarBtn onClick={handleEditClick} />
              <DeletarBtn onDelete={handleDeleteClick} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

CardTime.propTypes = {
  rota: PropTypes.string.isRequired, // A rota deve vir do banco de dados
  timeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  nome: PropTypes.string.isRequired,
  foto: PropTypes.string, // Não é mais required para lidar com casos null
  jogo: PropTypes.string, // Não é mais required para lidar com casos null
  onDelete: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
};

CardTime.defaultProps = {
  foto: '/placeholder-time.jpg',
  jogo: '/placeholder-jogo.png'
};

export default CardTime;