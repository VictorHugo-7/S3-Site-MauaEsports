import PropTypes from "prop-types";
import { MdEdit, MdFormatListBulletedAdd } from "react-icons/md";

const Agendamento = ({
  horario = "",
  status = "agendado",
  compromisso = "",
  onAgendar = () => {},
  onEditar = () => {},
}) => {
  return (
    <div className="flex items-center mx-10 my-0 h-[80px] border-b border-borda text-center">
      <div className="mr-3">
        {status === "livre" ? (
          <button
            onClick={onAgendar}
            className="text-verde-claro hover:text-verde-escuro text-2xl cursor-pointer"
          >
            <MdFormatListBulletedAdd />
          </button>
        ) : (
          <button
            onClick={onEditar}
            className="text-azul-claro hover:text-azul-escuro text-2xl cursor-pointer"
          >
            <MdEdit />
          </button>
        )}
      </div>
      <div
        className={`w-[120px] h-[40px] flex items-center justify-center rounded border ${
          status === "livre"
            ? "border-verde-claro bg-fundo/20"
            : "border-borda bg-fundo/50"
        }`}
      >
        <div className="text-center">
          {status === "livre" ? (
            <span className="text-verde-claro text-sm">Livre</span>
          ) : (
            <span className="text-branco text-sm">{horario}</span>
          )}
        </div>
      </div>
      {status !== "livre" && (
        <div className="ml-3 text-sm">
          <p className="font-semibold text-white font-blinker">{compromisso}</p>
          <p className="text-branco font-blinker">
            {status === "agendado" ? "Agendado" : "Realizado"}
          </p>
        </div>
      )}
    </div>
  );
};

Agendamento.propTypes = {
  horario: PropTypes.string,
  status: PropTypes.oneOf(["livre", "agendado", "realizado"]),
  compromisso: PropTypes.string,
  onAgendar: PropTypes.func,
  onEditar: PropTypes.func,
};

export default Agendamento;
