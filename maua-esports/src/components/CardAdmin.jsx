import React from "react";
import PropTypes from "prop-types";
import { FaInstagram } from "react-icons/fa";
import { RiTwitterXFill } from "react-icons/ri";
import { IoLogoTwitch } from "react-icons/io";
import DeletarBtn from "./DeletarBtn";
import EditarBtn from "./EditarBtn";

const CardAdmin = ({
  adminId,
  nome,
  titulo,
  descricao,
  foto,
  instagram,
  twitter,
  twitch,
  onDelete,
  onEditClick,
}) => {
  const hasSocialMedia = instagram || twitter || twitch;

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isConfirmed = window.confirm(
      `Tem certeza que deseja deletar o admin ${nome}?`
    );

    if (isConfirmed && onDelete) {
      onDelete(adminId);
    }
  };

  return (
    <div className="border-2 border-borda relative w-[300px] h-[450px] bg-fundo shadow-lg flex flex-col items-center hover:scale-110 transition-transform duration-300 cursor-pointer animate-fadeInUp rounded-md">
      <h1 className="text-xl font-bold font-blinker bg-azul-claro rounded-tr-md rounded-bl-md px-2 py-1 inline-block absolute top-0.1 right-0 z-10 opacity-70">
        {titulo}
      </h1>

      <div className="w-full h-full relative">
        <img
          src={foto || "https://via.placeholder.com/300x200?text=Admin"}
          alt={`Foto de ${nome}`}
          className="w-full h-[90%] object-cover rounded-t-md"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x200?text=Admin";
          }}
        />
      </div>

      <div className="w-full px-0">
        <div className="flex justify-between items-center font-blinker w-full">
          <h1 className="text-lg font-semibold text-fonte-clara ml-4">
            {nome}
          </h1>
        </div>

        <div className="w-full border-b-2 py-2 border-borda">
          <p className="text-sm text-left mt-2 ml-4 font-blinker w-full text-fonte-escura">
            {descricao}
          </p>
        </div>

        <div
          className={`flex items-center my-4 text-xl w-full text-fonte-escura ${
            hasSocialMedia ? "justify-between" : "justify-center"
          }`}
        >
          <div className="flex space-x-4 ml-4">
            {instagram && (
              <a href={instagram} target="_blank" rel="noopener noreferrer">
                <FaInstagram className="cursor-pointer hover:scale-110 hover:text-azul-escuro transition-transform duration-300" />
              </a>
            )}
            {twitter && (
              <a href={twitter} target="_blank" rel="noopener noreferrer">
                <RiTwitterXFill className="cursor-pointer hover:scale-110 hover:text-azul-escuro transition-transform duration-300" />
              </a>
            )}
            {twitch && (
              <a href={twitch} target="_blank" rel="noopener noreferrer">
                <IoLogoTwitch className="cursor-pointer hover:scale-110 hover:text-azul-escuro transition-transform duration-300" />
              </a>
            )}
          </div>

          <div className="flex space-x-2 mr-4">
            <EditarBtn onClick={() => onEditClick(adminId)} />
            <DeletarBtn itemId={adminId} onDelete={handleDelete} tipo="admin" />
          </div>
        </div>
      </div>
    </div>
  );
};

CardAdmin.propTypes = {
  adminId: PropTypes.string.isRequired,
  nome: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
  descricao: PropTypes.string.isRequired,
  foto: PropTypes.string,
  instagram: PropTypes.string,
  twitter: PropTypes.string,
  twitch: PropTypes.string,
  onDelete: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
};

export default CardAdmin;
