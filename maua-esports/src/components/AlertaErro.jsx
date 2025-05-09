import React, { useEffect, useState } from "react";

const AlertaErro = ({ mensagem }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (mensagem) {
      const timer = setTimeout(() => {
        setIsVisible(false); // Fecha o alerta automaticamente após 3 segundos
      }, 3000);

      return () => clearTimeout(timer); // Limpa o timer quando o componente é desmontado ou a mensagem muda
    }
  }, [mensagem]);

  if (!mensagem || !isVisible) return null;

  return (
    <div className="fixed top-25 right-4 z-50 bg-red-200 text-red-800 border border-red-400 px-6 py-3 rounded-xl shadow-lg animate-bounce">
      <p className="font-semibold">{mensagem}</p>
    </div>
  );
};

export default AlertaErro;
