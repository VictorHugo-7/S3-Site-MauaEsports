import React, { useState } from "react";
import ReactDOM from "react-dom";
import { FaInstagram } from "react-icons/fa";
import { RiTwitterXFill } from "react-icons/ri";
import { IoLogoTwitch } from "react-icons/io";
import Foto from "../assets/images/Foto.svg";
import DeletarBtn from "./DeletarBtn";
import EditarBtn from "./EditarBtn";
import EditarJogador from "./ModalEditarJogador";
import PropTypes from "prop-types";

const CardJogador = ({
  jogadorId,
  nome,
  titulo,
  descricao,
  foto,
  instagram,
  twitter,
  twitch,
  onDelete,
  onEdit,
  logoTime,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasSocialMedia = instagram || twitter || twitch;

  const handleEdit = (updatedData) => {
    onEdit(jogadorId, updatedData);
    setIsModalOpen(false);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isConfirmed = window.confirm(
      `Tem certeza que deseja deletar o jogador ${nome}?`
    );

    if (isConfirmed && onDelete) {
      onDelete(jogadorId);
    }
  };

  return (
    <>
      <div className="border-2 border-borda relative w-[300px] h-[450px] bg-fundo shadow-lg flex flex-col items-center hover:scale-110 transition-transform duration-300 cursor-pointer animate-fadeInUp rounded-md">
        <h1 className="text-xl font-bold font-blinker bg-azul-claro rounded-tr-md rounded-bl-md px-2 py-1 inline-block absolute top-0.1 right-0 z-10 opacity-70">
          {titulo}
        </h1>

        <div className="w-full h-full relative">
          <img
            src={foto || Foto}
            alt={`Foto de ${nome}`}
            className="w-full h-[90%] object-cover rounded-t-md"
            onError={(e) => {
              e.target.src = Foto;
            }}
          />
        </div>

        <div className="w-full px-0">
          <div className="flex justify-between items-center font-blinker w-full">
            <h1 className="text-lg font-semibold text-fonte-clara ml-4">
              {nome}
            </h1>
            <img
              src={logoTime}
              alt="Logo do Time"
              className="w-6 h-6 mr-4 text-azul-claro"
            />
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
              <EditarBtn onClick={() => setIsModalOpen(true)} />
              <DeletarBtn
                jogadorId={jogadorId}
                onDelete={handleDelete}
                tipo="jogador"
              />
            </div>
          </div>
        </div>
      </div>

      {isModalOpen &&
        ReactDOM.createPortal(
          <EditarJogador
            jogador={{
              _id: jogadorId,
              nome,
              titulo,
              descricao,
              fotoUrl: foto,
              insta: instagram,
              twitter,
              twitch,
            }}
            onSave={handleEdit}
            onClose={() => setIsModalOpen(false)}
          />,
          document.body
        )}
    </>
  );
};

CardJogador.propTypes = {
  jogadorId: PropTypes.string.isRequired,
  nome: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
  descricao: PropTypes.string.isRequired,
  foto: PropTypes.string,
  instagram: PropTypes.string,
  twitter: PropTypes.string,
  twitch: PropTypes.string,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  logoTime: PropTypes.string,
};

export default CardJogador;
