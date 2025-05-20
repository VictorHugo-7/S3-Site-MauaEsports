import React, { useState } from "react";

import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import PropTypes from "prop-types";

const DeletarBtn = ({ onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onDelete}
      className={`w-8 h-8 flex items-center justify-center p-1 rounded-full text-branco cursor-pointer transition-all duration-300
        ${
          isHovered
            ? "bg-vermelho-claro scale-110 shadow-glow"
            : "bg-fonte-escura"
        }`}
    >
      <FaTrash
        className={`w-4 h-4 ${isHovered ? "animate-bounce-rotate" : ""}`}
      />
      <style jsx>{`
        @keyframes bounce-rotate {
          0% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(-8deg) scale(1.2);
          }
          100% {
            transform: rotate(0deg) scale(1);
          }
        }
        @keyframes press {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-bounce-rotate {
          animation: bounce-rotate 0.5s ease-in-out;
        }
        .shadow-glow {
          box-shadow: 0 0 8px rgba(255, 99, 71, 0.5);
        }
        button:active {
          animation: press 0.2s ease-in-out;
        }
      `}</style>
    </button>
  );
};

DeletarBtn.propTypes = {
  onDelete: PropTypes.func.isRequired,
};

export default DeletarBtn;
