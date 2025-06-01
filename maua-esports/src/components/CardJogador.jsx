import { useState } from "react";
import { FaInstagram } from "react-icons/fa";
import { RiTwitterXFill } from "react-icons/ri";
import { IoLogoTwitch } from "react-icons/io";
import DeletarBtn from "./DeletarBtn";
import EditarBtn from "./EditarBtn";
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
  userRole,
}) => {
  const [showDescTooltip, setShowDescTooltip] = useState(false);
  const [showNomeTooltip, setShowNomeTooltip] = useState(false);
  const hasSocialMedia = instagram || twitter || twitch;
  const isAdmin = ["Administrador", "Administrador Geral"].includes(userRole);
  const defaultFoto = "/path/to/default-player.jpg";
  const defaultLogo = "/path/to/default-logo.png";
  const MAX_DESC_CHARS = 37;
  const MAX_NOME_CHARS = 29;

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

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  return (
    <div className="border-2 border-borda relative w-[300px] h-[450px] bg-gray-900 shadow-lg flex flex-col items-center hover:scale-110 transition-transform duration-300 cursor-pointer animate-fadeInUp rounded-md">
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
        <div className="flex justify-between items-center font-blinker w-full min-h-[40px] relative">
          <div className="relative">
            <h1
              className="text-lg font-semibold text-fonte-clara ml-4 overflow-hidden text-ellipsis whitespace-nowrap flex-1"
              onMouseEnter={() =>
                nome.length > MAX_NOME_CHARS && setShowNomeTooltip(true)
              }
              onMouseLeave={() => setShowNomeTooltip(false)}
            >
              {truncateText(nome, MAX_NOME_CHARS)}
            </h1>
            {showNomeTooltip && (
              <div
                className="absolute left-4 bottom-full mb-2 px-4 py-2 bg-gray-900 text-white rounded shadow-lg border border-azul-claro z-[60]"
                style={{ width: "max-content", maxWidth: "300px" }}
              >
                <div className="text-sm whitespace-normal break-words">
                  {nome}
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900 border-r border-b border-azul-claro"></div>
              </div>
            )}
          </div>
          <img
            src={logoTime || defaultLogo}
            alt="Logo do Time"
            className="w-6 h-6 mr-4 flex-shrink-0"
            onError={(e) => {
              e.target.src = defaultLogo;
            }}
          />
        </div>

        <div className="w-full border-b-2 py-2 border-borda">
          <div className="relative">
            <p
              className="text-sm text-left mt-2 ml-4 mr-4 font-blinker text-fonte-escura overflow-hidden text-ellipsis whitespace-nowrap"
              onMouseEnter={() =>
                descricao &&
                descricao.length > MAX_DESC_CHARS &&
                setShowDescTooltip(true)
              }
              onMouseLeave={() => setShowDescTooltip(false)}
            >
              {truncateText(descricao || "", MAX_DESC_CHARS)}
            </p>
            {showDescTooltip && (
              <div
                className="absolute left-4 bottom-full mb-2 px-4 py-2 bg-gray-900 text-white rounded shadow-lg border border-azul-claro z-[60]"
                style={{ width: "max-content", maxWidth: "300px" }}
              >
                <div className="text-sm whitespace-normal break-words">
                  {descricao}
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900 border-r border-b border-azul-claro"></div>
              </div>
            )}
          </div>
        </div>

        {(hasSocialMedia || isAdmin) && (
          <div className="flex items-center my-4 text-xl w-full text-fonte-escura justify-between">
            <div className="flex space-x-4 ml-4">
              {instagram && (
                <a
                  href={normalizeSocialLink(instagram, "instagram")}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visitar Instagram de ${nome}`}
                >
                  <FaInstagram className="cursor-pointer hover:scale-110 hover:text-azul-escuro transition-transform duration-300" />
                </a>
              )}
              {twitter && (
                <a
                  href={normalizeSocialLink(twitter, "twitter")}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visitar Twitter de ${nome}`}
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
              <div className="flex space-x-2 mr-4 flex-shrink-0">
                <EditarBtn
                  onClick={() => onEdit(jogadorId)}
                  role="button"
                  aria-label={`Editar jogador ${nome}`}
                />
                <DeletarBtn
                  onDelete={() => onDelete(jogadorId)}
                  role="button"
                  aria-label={`Deletar jogador ${nome}`}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

CardJogador.propTypes = {
  jogadorId: PropTypes.string.isRequired,
  nome: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
  descricao: PropTypes.string,
  foto: PropTypes.string,
  instagram: PropTypes.string,
  twitter: PropTypes.string,
  twitch: PropTypes.string,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  logoTime: PropTypes.string,
  userRole: PropTypes.oneOf([
    "Jogador",
    "Administrador",
    "Administrador Geral",
    null,
  ]),
};

export default CardJogador;
