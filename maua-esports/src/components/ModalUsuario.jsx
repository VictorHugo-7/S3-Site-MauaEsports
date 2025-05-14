import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaDiscord,
  FaUserShield,
  FaUserTie,
  FaUserAlt,
} from "react-icons/fa";
import SalvarBtn from "./SalvarBtn";
import CancelarBtn from "./CancelarBtn";
import { RiCloseFill } from "react-icons/ri";

const ModalUsuario = ({
  usuario,
  onSave,
  onClose,
  modoEdicao,
  currentUserEmail,
  podeAdicionarTipo,
  times = {},
  usuarioAtual,
}) => {
  const [formData, setFormData] = useState({
    email: "",
    discordID: "",
    tipoUsuario: "Jogador",
    time: "",
  });
  const [erro, setErro] = useState("");
  const [errors, setErrors] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true); // Ativa a animação de entrada quando o modal é montado
  }, []);

  useEffect(() => {
    if (modoEdicao && usuario) {
      setFormData({
        email: usuario.email,
        discordID: usuario.discordID || "",
        tipoUsuario: usuario.tipoUsuario,
        time: usuario.time || "",
      });
    } else {
      setFormData({
        email: "",
        discordID: "",
        tipoUsuario: "Jogador",
        time: "",
      });
    }
  }, [modoEdicao, usuario]);

  const handleClose = () => {
    setIsVisible(false); // Inicia a animação de saída
    setTimeout(() => {
      onClose(); // Chama onClose após a animação
    }, 300);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email é obrigatório";
    } else {
      const emailParts = formData.email.split('@');
      const emailWithoutDomain = emailParts[0];

      if (!formData.email.endsWith("@maua.br") && emailWithoutDomain.length !== 10) {
        newErrors.email = "Email deve ser @maua.br e a parte antes do @ deve ter 10 caracteres";
      } else if (!formData.email.endsWith("@maua.br")) {
        newErrors.email = "Email deve ser @maua.br";
      } else if (emailWithoutDomain.length !== 10) {
        newErrors.email = "A parte do email antes do @ deve ter exatamente 10 caracteres";
      }
    }

    if (formData.discordID && !/^\d{18}$/.test(formData.discordID)) {
      newErrors.discordID = "Discord ID deve ter exatamente 18 dígitos";
    }

    if (
      ["Capitão de time", "Jogador"].includes(formData.tipoUsuario) &&
      !formData.time
    ) {
      newErrors.time = "Time é obrigatório para este tipo de usuário";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  const getTimesDisponiveis = () => {
    if (usuarioAtual?.tipoUsuario === "Capitão de time") {
      return Object.values(times).filter((t) => t?.Name === usuarioAtual?.time);
    }
    return Object.values(times);
  };

  const getTipoUsuarioIcon = () => {
    switch (formData.tipoUsuario) {
      case "Administrador Geral":
        return <FaUserTie className="text-2xl" />;
      case "Administrador":
        return <FaUserTie className="text-2xl" />;
      case "Capitão de time":
        return <FaUserShield className="text-2xl" />;
      case "Jogador":
        return <FaUserAlt className="text-2xl" />;
      default:
        return <FaUser className="text-2xl" />;
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-fundo/80 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
    >
      <div
        className={`bg-fundo p-6 rounded-lg max-w-md w-full border shadow-sm shadow-azul-claro max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-branco">
            {modoEdicao ? "Editar Usuário" : "Adicionar Usuário"}
          </h2>
          <button
            onClick={handleClose}
            className="text-fonte-escura hover:text-vermelho-claro hover:cursor-pointer"
          >
            <RiCloseFill size={24} />
          </button>
        </div>

        {erro && (
          <div className="mb-4 p-2 bg-vermelho-claro/20 text-vermelho-claro rounded text-sm">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-fonte-escura font-semibold mb-1">
              Email <span className="text-vermelho-claro">*</span>
            </label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={modoEdicao}
              className={`w-full border rounded p-2 text-branco bg-preto focus:outline-none ${errors.email
                ? "border-vermelho-claro focus:border-vermelho-claro"
                : "border-borda focus:border-azul-claro"
                }`}
            />
            {errors.email && (
              <p className="text-vermelho-claro text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-fonte-escura font-semibold mb-1">
              Discord ID
            </label>
            <div className="flex items-center">
              <div className="bg-fonte-escura rounded-l-md px-2 py-2 flex items-center justify-center">
                <FaDiscord className="text-2xl" />
              </div>
              <input
                type="text"
                name="discordID"
                value={formData.discordID}
                onChange={handleChange}

                className={`w-full border border-l-0 rounded-r-md p-2 text-branco bg-preto focus:outline-none ${errors.discordID
                  ? "border-vermelho-claro focus:border-vermelho-claro"
                  : "border-borda focus:border-azul-claro"
                  }`}
                placeholder="Exemplo: 123456789012345678"

              />
            </div>
            <p className="text-xs text-fonte-escura mt-1">
              Deixe vazio para remover o Discord ID (deve ser um
              número de 18 dígitos)
            </p>
            {errors.discordID && (
              <p className="text-vermelho-claro text-sm mt-1">
                {errors.discordID}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-fonte-escura font-semibold mb-1">
              Tipo de Usuário
            </label>
            <div className="flex items-center">
              <div className="bg-fonte-escura rounded-l-md px-2 py-2 flex items-center justify-center">
                {getTipoUsuarioIcon()}
              </div>
              <select
                name="tipoUsuario"
                value={formData.tipoUsuario}
                onChange={handleChange}
                disabled={
                  modoEdicao &&
                  usuario?.email === currentUserEmail &&
                  usuario?.tipoUsuario === "Administrador Geral"
                }
                className={`w-full border border-l-0 rounded-r-md p-2 text-branco bg-preto focus:outline-none ${errors.tipoUsuario
                  ? "border-vermelho-claro focus:border-vermelho-claro"
                  : "border-borda focus:border-azul-claro"
                  }`}
              >
                <option
                  value="Jogador"
                  disabled={!podeAdicionarTipo("Jogador")}
                >
                  Jogador
                </option>
                <option
                  value="Capitão de time"
                  disabled={!podeAdicionarTipo("Capitão de time")}
                >
                  Capitão de time
                </option>
                <option
                  value="Administrador"
                  disabled={!podeAdicionarTipo("Administrador")}
                >
                  Administrador
                </option>
                <option
                  value="Administrador Geral"
                  disabled={!podeAdicionarTipo("Administrador Geral")}
                >
                  Administrador Geral
                </option>
              </select>
            </div>
          </div>

          {["Capitão de time", "Jogador"].includes(formData.tipoUsuario) && (
            <div>
              <label className="block text-sm text-fonte-escura font-semibold mb-1">
                Time{" "}
                {formData.tipoUsuario !== "Administrador" && (
                  <span className="text-vermelho-claro">*</span>
                )}
              </label>
              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                disabled={
                  modoEdicao &&
                  usuario?.tipoUsuario === "Capitão de time" &&
                  usuario?.email === currentUserEmail
                }
                className={`w-full border rounded p-2 text-branco bg-preto focus:outline-none ${errors.time
                  ? "border-vermelho-claro focus:border-vermelho-claro"
                  : "border-borda focus:border-azul-claro"
                  }`}
              >
                <option value="">Selecione um time</option>
                {getTimesDisponiveis().map((time) => (
                  <option key={time._id} value={time.Name}>
                    {time.Name}
                  </option>
                ))}
              </select>
              {errors.time && (
                <p className="text-vermelho-claro text-sm mt-1">
                  {errors.time}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-6">
            <SalvarBtn type="submit" />
            <CancelarBtn onClick={handleClose} />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalUsuario;
