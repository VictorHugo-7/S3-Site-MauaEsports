import React, { useState, useEffect } from "react";
import { FaDiscord } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import SalvarBtn from "./SalvarBtn";
import CancelarBtn from "./CancelarBtn";

const ModalUsuario = ({
  usuario,
  onSave,
  onClose,
  modoEdicao,
  currentUserEmail,
  podeAdicionarTipo,
}) => {
  const [formData, setFormData] = React.useState({
    email: usuario?.email || "",
    discordID: usuario?.discordID || "",
    tipoUsuario: usuario?.tipoUsuario || "Jogador",
  });
  const [erro, setErro] = React.useState("");
  const [isVisible, setIsVisible] = useState(false); // Estado para animação

  // Iniciar animação de entrada ao montar o componente
  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false); // Limpar estado ao desmontar
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validarFormulario = () => {
    if (!formData.email.endsWith("@maua.br")) {
      setErro("O email deve ser institucional (@maua.br)");
      return false;
    }

    if (formData.discordID && !/^\d{18}$/.test(formData.discordID)) {
      setErro("O Discord ID deve ter exatamente 18 dígitos");
      return false;
    }

    if (!modoEdicao && !podeAdicionarTipo(formData.tipoUsuario)) {
      setErro("Você não tem permissão para criar este tipo de usuário");
      return false;
    }

    setErro("");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    onSave(formData);
    handleClose(); // Inicia animação de saída antes de fechar
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Aguarda a animação (300ms) antes de fechar
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-fundo/80 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`bg-fundo p-6 rounded-lg shadow-sm shadow-azul-claro w-full max-w-md relative max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-branco">
            {modoEdicao ? "Editar Usuário" : "Adicionar Novo Usuário"}
          </h2>
          <button
            onClick={handleClose}
            className="text-fonte-escura hover:text-vermelho-claro hover:cursor-pointer"
          >
            <IoMdClose size={24} />
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
              Email Institucional <span className="text-vermelho-claro">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={modoEdicao}
              className="w-full border border-borda rounded p-2 text-branco bg-preto focus:border-azul-claro focus:outline-none"
              placeholder="exemplo@maua.br"
              required
            />
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
                className="w-full border border-borda border-l-0 rounded-r-md p-2 focus:border-azul-claro text-branco bg-preto focus:outline-none"
                placeholder="123456789012345678"
                pattern="\d{18}|^$"
              />
            </div>
            <p className="text-xs text-fonte-escura/50 mt-1">
              Deixe vazio para remover o Discord ID (deve ter um número de 18
              dígitos)
            </p>
          </div>

          <div>
            <label className="block text-sm text-fonte-escura font-semibold mb-1">
              Tipo de Usuário <span className="text-vermelho-claro">*</span>
            </label>
            <select
              name="tipoUsuario"
              value={formData.tipoUsuario}
              onChange={handleChange}
              className="w-full border border-borda rounded p-2 text-branco bg-preto focus:border-azul-claro focus:outline-none"
              disabled={
                modoEdicao && usuario?.tipoUsuario === "Administrador Geral"
              }
              required
            >
              <option value="Jogador">Jogador</option>
              <option value="Capitão de time">Capitão de time</option>
              <option value="Administrador">Administrador</option>
              {!modoEdicao && podeAdicionarTipo("Administrador Geral") && (
                <option value="Administrador Geral">Administrador Geral</option>
              )}
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <SalvarBtn
              type="submit"
              label={modoEdicao ? "Salvar" : "Adicionar"}
            />
            <CancelarBtn onClick={handleClose} />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalUsuario;
