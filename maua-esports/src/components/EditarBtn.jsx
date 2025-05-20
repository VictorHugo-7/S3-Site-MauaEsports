import React, { useState } from "react";
import { FaPen } from "react-icons/fa";
import PropTypes from "prop-types";

const EditarBtn = ({ onClick, isEditing }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center p-1 rounded-full text-branco cursor-pointer transition-all duration-300
        ${isHovered ? "bg-azul-claro scale-110 shadow-glow" : "bg-fonte-escura"}
        ${isEditing ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <FaPen className={`w-4 h-4 ${isHovered ? "animate-pulse-rotate" : ""}`} />
      <style jsx>{`
        @keyframes pulse-rotate {
          0% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(10deg) scale(1.2);
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
        .animate-pulse-rotate {
          animation: pulse-rotate 0.5s ease-in-out;
        }
        .shadow-glow {
          box-shadow: 0 0 8px rgba(0, 188, 255, 0.5);
        }
        button:active:not(.opacity-50) {
          animation: press 0.2s ease-in-out;
        }
      `}</style>
    </button>
  );
};

EditarBtn.propTypes = {
  onClick: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
};

export default EditarBtn;
