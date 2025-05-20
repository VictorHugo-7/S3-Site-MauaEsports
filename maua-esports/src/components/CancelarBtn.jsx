import { useState } from "react";
import PropTypes from "prop-types";
import { MdCancel } from "react-icons/md";

const CancelarBtn = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center p-1 rounded-full text-branco cursor-pointer transition-all duration-300
        ${
          isHovered ? "bg-red-500 scale-110 shadow-glow" : "bg-vermelho-claro"
        }`}
    >
      <MdCancel
        className={`w-4 h-4 ${isHovered ? "animate-pulse-cross" : ""}`}
      />
      <style jsx>{`
        @keyframes pulse-cross {
          0% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(-5deg) scale(1.2);
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
        .animate-pulse-cross {
          animation: pulse-cross 0.5s ease-in-out;
        }
        .shadow-glow {
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
        }
        button:active {
          animation: press 0.2s ease-in-out;
        }
      `}</style>
    </button>
  );
};

CancelarBtn.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default CancelarBtn;
