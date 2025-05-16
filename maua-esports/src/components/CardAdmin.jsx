import React, { useState } from "react";
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
  userRole,
}) => {
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const hasSocialMedia = instagram || twitter || twitch;
  const isAdmin = ["Administrador", "Administrador Geral"].includes(userRole);
  const defaultFoto = "/path/to/default-admin.jpg"; // Substitua pelo caminho real

  const normalizeSocialLink = (link, platform) => {
    if (!link) return null;
    if (link.startsWith("http")) return link;
    switch (platform) {
      case "instagram":
        return `https://instagram.com/${link.replace(/^@/, "")}`;
      case "twitter":
        return `https://twitter.com/${link.replace(/^@/, "")}`;
      case "twitch":
        return `https://twitch.tv/${link.replace(/^@/, "")}`;
      default:
        return link;
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await onDelete(adminId);
      setShowConfirmModal(false);
    } catch (err) {
      setError(err.message || "Erro ao deletar administrador");
    }
  };

  return (
    <>
      <div className="border-2 border-borda relative w-[300px] h-[450px] bg-fundo shadow-lg flex flex-col items-center hover:scale-110 transition-transform duration-300 cursor-pointer animate-fadeInUp rounded-md">
        {error && (
          <div className="absolute top-2 left-2 bg-red-500 text-white p-2 rounded">
            {error}
          </div>
        )}
        <h1 className="text-xl font-bold font-blinker bg-azul-claro rounded-tr-md rounded-bl-md px-2 py-1 inline-block absolute top-0.1 right-0 z-10 opacity-70">
          {titulo}
        </h1>

        <div className="w-full h-full relative">
          <img
            src={foto || defaultFoto}
            alt={`Foto de ${nome}`}
            className="w-full h-[90%] object-cover rounded-t-md"
            onError={(e) => {
              e.target.src = defaultFoto;
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

          {(hasSocialMedia || isAdmin) && (
            <div className="flex items-center my-4 text-xl w-full text-fonte-escura justify-between">
              <div className="flex space-x-4 ml-4">
                {instagram && (
                  <a
                    href={normalizeSocialLink(instagram, "instagram")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaInstagram className="cursor-pointer hover:scale-110 hover:text-azul-escuro transition-transform duration-300" />
                  </a>
                )}
                {twitter && (
                  <a
                    href={normalizeSocialLink(twitter, "twitter")}
                    target="_blank"
                    rel="noopener noreferrer"

                  >
                    <RiTwitterXFill className="cursor-pointer hover:scale-110 hover:text-azul-escuro transition-transform duration-300" />
                  </a>
                )}
                {twitch && (
                  <a
                    href={normalizeSocialLink(twitch, "twitch")}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visitar Twitch de ${nome}`}
                  >
                    <IoLogoTwitch className="cursor-pointer hover:scale-110 hover:text-azul-escuro transition-transform duration-300" />
                  </a>
                )}
              </div>
              {isAdmin && (
                <div className="flex space-x-2 mr-4">
                  <EditarBtn
                    onClick={() => onEditClick(adminId)}
                    role="button"
                    aria-label={`Editar administrador ${nome}`}
                  />
                  <DeletarBtn
                    itemId={adminId}
                    onDelete={handleDelete}
                    tipo="admin"
                    role="button"
                    aria-label={`Deletar administrador ${nome}`}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            <p>Tem certeza que deseja deletar o admin {nome}?</p>
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
  userRole: PropTypes.oneOf([
    "Jogador",
    "Administrador",
    "Administrador Geral",
    null,
  ]),
};

export default CardAdmin;