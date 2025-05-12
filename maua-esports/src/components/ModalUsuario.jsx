import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaDiscord,
  FaUserShield,
  FaUserTie,
  FaUserAlt,
  FaTimes,
} from "react-icons/fa";

const ModalUsuario = ({
  usuario,
  onSave,
  onClose,
  modoEdicao,
  currentUserEmail,
  podeAdicionarTipo,
  times = {}, // Agora recebe um objeto, não array
  usuarioAtual,
}) => {
  const [formData, setFormData] = useState({
    email: "",
    discordID: "",
    tipoUsuario: "Jogador",
    time: "",
  });

  const [errors, setErrors] = useState({});

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
    } else if (!formData.email.endsWith("@maua.br")) {
      newErrors.email = "Email deve ser @maua.br";
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

  // Filtra os times disponíveis baseado no tipo de usuário
  const getTimesDisponiveis = () => {
    if (usuarioAtual?.tipoUsuario === "Capitão de time") {
      // Capitão só pode ver/adicionar ao próprio time
      return Object.values(times).filter((t) => t?.Name === usuarioAtual?.time);
    }
    return Object.values(times);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-navbar rounded-lg p-6 w-full max-w-md border-2 border-borda">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            {modoEdicao ? "Editar Usuário" : "Adicionar Usuário"}
          </h2>
          <button
            onClick={onClose}
            className="text-vermelho-claro hover:text-vermelho-escuro"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={modoEdicao}
              className={`w-full p-2 rounded bg-fundo text-white border ${errors.email ? "border-vermelho-claro" : "border-borda"
                }`}
            />
            {errors.email && (
              <p className="text-vermelho-claro text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-white mb-2">Discord ID</label>
            <input
              type="text"
              name="discordID"
              value={formData.discordID}
              onChange={handleChange}
              className={`w-full p-2 rounded bg-fundo text-white border ${errors.discordID ? "border-vermelho-claro" : "border-borda"
                }`}
              placeholder="Opcional"
            />
            {errors.discordID && (
              <p className="text-vermelho-claro text-sm mt-1">
                {errors.discordID}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-white mb-2">Tipo de Usuário</label>
            <div className="relative">
              <select
                name="tipoUsuario"
                value={formData.tipoUsuario}
                onChange={handleChange}
                disabled={modoEdicao && usuario?.email === currentUserEmail && usuario?.tipoUsuario === 'Administrador Geral'}
                className={`w-full p-2 rounded bg-fundo text-white border ${errors.tipoUsuario ? "border-vermelho-claro" : "border-borda"}`}
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
              <div className="absolute right-3 top-3 text-white">
                {formData.tipoUsuario === "Administrador Geral" && (
                  <FaUserShield />
                )}
                {formData.tipoUsuario === "Administrador" && <FaUserShield />}
                {formData.tipoUsuario === "Capitão de time" && <FaUserTie />}
                {formData.tipoUsuario === "Jogador" && <FaUserAlt />}
              </div>
            </div>
          </div>

          {["Capitão de time", "Jogador"].includes(formData.tipoUsuario) && (
            <div className="mb-4">
              <label className="block text-white mb-2">Time</label>
              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                disabled={
                  modoEdicao &&
                  usuario?.tipoUsuario === "Capitão de time" &&
                  usuario?.email === currentUserEmail
                }
                className={`w-full p-2 rounded bg-fundo text-white border ${errors.time ? "border-vermelho-claro" : "border-borda"}`}
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

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-cinza-escuro text-white rounded hover:bg-cinza-claro"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-azul-claro text-white rounded hover:bg-azul-escuro"
            >
              {modoEdicao ? "Salvar Alterações" : "Adicionar Usuário"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalUsuario;
