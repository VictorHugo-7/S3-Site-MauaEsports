import { useState } from "react";
import PropTypes from "prop-types";
import { MdDone } from "react-icons/md";
import { RiLoader4Line } from "react-icons/ri";

const SalvarBtn = ({ onClick = () => {}, type = "button", disabled = false, loading = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type={type}
      onMouseEnter={() => !disabled && !loading && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-8 h-8 flex items-center justify-center p-1 rounded-full text-branco cursor-pointer transition-all duration-300
        ${
          loading
            ? "bg-gray-500 cursor-not-allowed"
            : isHovered && !disabled
            ? "bg-green-600 scale-110 shadow-glow"
            : "bg-emerald-300"
        }`}
    >
      {loading ? (
        <RiLoader4Line className="w-4 h-4 animate-spin" />
      ) : (
        <MdDone className={`w-4 h-4 ${isHovered && !disabled ? "animate-pulse-check" : ""}`} />
      )}
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
        button:active:not(:disabled) {
          animation: press 0.2s ease-in-out;
        }
      `}</style>
    </button>
  );
};

SalvarBtn.propTypes = {
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
};

export default SalvarBtn;