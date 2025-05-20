import { useState } from "react";
import PropTypes from "prop-types";
import { MdDone } from "react-icons/md";

const SalvarBtn = ({ onClick = () => {}, type = "button" }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type={type}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center p-1 rounded-full text-branco cursor-pointer transition-all duration-300
        ${isHovered ? "bg-green-600 scale-110 shadow-glow" : "bg-emerald-300"}`}
    >
      <MdDone className={`w-4 h-4 ${isHovered ? "animate-pulse-check" : ""}`} />
      <style jsx>{`
        @keyframes pulse-check {
          0% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(5deg) scale(1.2);
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
        .animate-pulse-check {
          animation: pulse-check 0.5s ease-in-out;
        }
        .shadow-glow {
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
        }
        button:active {
          animation: press 0.2s ease-in-out;
        }
      `}</style>
    </button>
  );
};

SalvarBtn.propTypes = {
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
};

export default SalvarBtn;
