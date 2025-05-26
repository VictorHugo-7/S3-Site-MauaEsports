import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { RiImageAddLine, RiCloseFill } from "react-icons/ri";
import SalvarBtn from "../../SalvarBtn";
import CancelarBtn from "../../CancelarBtn";

const ApresentacaoModal = ({
  isOpen = false,
  onClose = () => {},
  onSave = () => {},
  dadosIniciais = {},
  userRole = null,
}) => {
  const [titulo1, setTitulo1] = useState(dadosIniciais?.titulo1 || "Título 1");
  const [titulo2, setTitulo2] = useState(dadosIniciais?.titulo2 || "Título 2");
  const [descricao1, setDescricao1] = useState(
    dadosIniciais?.descricao1 || "Descrição 1 do componente"
  );
  const [descricao2, setDescricao2] = useState(
    dadosIniciais?.descricao2 || "Descrição 2 do componente"
  );
  const [botao1Nome, setBotao1Nome] = useState(
    dadosIniciais?.botao1Nome || "Botão 1"
  );
  const [botao1Link, setBotao1Link] = useState(
    dadosIniciais?.botao1Link || "#"
  );
  const [botao2Nome, setBotao2Nome] = useState(
    dadosIniciais?.botao2Nome || "Botão 2"
  );
  const [botao2Link, setBotao2Link] = useState(
    dadosIniciais?.botao2Link || "#"
  );
  const [imagemUrl, setImagemUrl] = useState(
    dadosIniciais?.imagem || "/api/placeholder/400/320"
  );
  const [imagemFile, setImagemFile] = useState(null);
  const [icones, setIcones] = useState(
    dadosIniciais?.icones || [
      { id: 1, imagem: "/api/placeholder/40/40", link: "#" },
    ]
  );
  const [erroLocal, setErroLocal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const fileInputRef = useRef(null);
  const iconeFileInputRefs = useRef({});

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  useEffect(() => {
    if (dadosIniciais) {
      setTitulo1(dadosIniciais.titulo1 || "Título 1");
      setTitulo2(dadosIniciais.titulo2 || "Título 2");
      setDescricao1(dadosIniciais.descricao1 || "Descrição 1 do componente");
      setDescricao2(dadosIniciais.descricao2 || "Descrição 2 do componente");
      setBotao1Nome(dadosIniciais.botao1Nome || "Botão 1");
      setBotao1Link(dadosIniciais.botao1Link || "#");
      setBotao2Nome(dadosIniciais.botao2Nome || "Botão 2");
      setBotao2Link(dadosIniciais.botao2Link || "#");
      setImagemUrl(dadosIniciais.imagem || "/api/placeholder/400/320");
      setImagemFile(null);
      setIcones(
        dadosIniciais.icones || [
          { id: 1, imagem: "/api/placeholder/40/40", link: "#" },
        ]
      );
    }
  }, [dadosIniciais]);

  const adicionarIcone = () => {
    const novoIcone = {
      id: Date.now(),
      imagem: "/api/placeholder/40/40",
      link: "#",
    };
    setIcones([...icones, novoIcone]);
  };

  const removerIcone = (id) => {
    setIcones(icones.filter((icone) => icone.id !== id));
  };

  const atualizarLinkIcone = (id, novoLink) => {
    setIcones(
      icones.map((icone) =>
        icone.id === id ? { ...icone, link: novoLink } : icone
      )
    );
  };

  const atualizarImagemIcone = (id, novaImagem) => {
    setIcones(
      icones.map((icone) =>
        icone.id === id ? { ...icone, imagem: novaImagem } : icone
      )
    );
  };

  const handleImagemUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const tiposPermitidos = ["image/jpeg", "image/jpg", "image/png"];
      if (!tiposPermitidos.includes(file.type)) {
        setErroLocal(
          "Formato de imagem inválido. Use apenas JPG, JPEG ou PNG."
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErroLocal("A imagem deve ter no máximo 5MB");
        return;
      }
      setErroLocal("");
      const imageUrl = URL.createObjectURL(file);
      setImagemUrl(imageUrl);
      setImagemFile(file);
    }
  };

  const handleIconeImagemUpload = (e, id) => {
    const file = e.target.files[0];
    if (file) {
      const tiposPermitidos = ["image/jpeg", "image/jpg", "image/png"];
      if (!tiposPermitidos.includes(file.type)) {
        setErroLocal(
          "Formato de imagem inválido. Use apenas JPG, JPEG ou PNG."
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErroLocal("A imagem deve ter no máximo 5MB");
        return;
      }
      setErroLocal("");
      const imageUrl = URL.createObjectURL(file);
      atualizarImagemIcone(id, imageUrl);
    }
  };

  const validarLinks = () => {
    const links = [
      botao1Link,
      botao2Link,
      ...icones.map((icone) => icone.link),
    ];
    for (const link of links) {
      if (link && !link.startsWith("https://")) {
        setErroLocal("Todos os links devem começar com https://");
        return false;
      }
    }
    return true;
  };

  const salvarAlteracoes = async () => {
    if (!["Administrador", "Administrador Geral"].includes(userRole)) {
      setErroLocal("Você não tem permissão para salvar alterações.");
      return;
    }

    setIsSubmitting(true);
    setErroLocal("");

    if (
      !titulo1 ||
      !titulo2 ||
      !descricao1 ||
      !descricao2 ||
      !botao1Nome ||
      !botao2Nome
    ) {
      setErroLocal("Preencha todos os campos obrigatórios!");
      setIsSubmitting(false);
      return;
    }

    if (!validarLinks()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const novosDados = {
        titulo1: titulo1.trim(),
        titulo2: titulo2.trim(),
        descricao1: descricao1.trim(),
        descricao2: descricao2.trim(),
        botao1Nome: botao1Nome.trim(),
        botao1Link: botao1Link.trim(),
        botao2Nome: botao2Nome.trim(),
        botao2Link: botao2Link.trim(),
        imagem: imagemFile || dadosIniciais.imagem,
        icones: icones.map((icone) => ({
          id: icone.id,
          imagem:
            typeof icone.imagem === "string" && icone.imagem.startsWith("data:")
              ? icone.imagem
              : iconeFileInputRefs.current[icone.id]?.files[0] || icone.imagem,
          link: icone.link,
        })),
      };

      await onSave(novosDados);
      setImagemUrl(novosDados.imagem);
    } catch (error) {
      setErroLocal(error.message || "Erro ao salvar alterações");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-fundo/80 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`bg-fundo p-6 rounded-lg shadow-sm shadow-azul-claro w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-branco">
            Editar Seção Apresentação
          </h2>
          <button
            onClick={handleClose}
            className="text-fonte-escura hover:text-vermelho-claro hover:cursor-pointer"
          >
            <RiCloseFill size={24} />
          </button>
        </div>

        {erroLocal && (
          <div className="mb-4 p-2 bg-vermelho-claro/20 text-vermelho-claro rounded">
            {erroLocal}
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm text-fonte-escura font-semibold">
              Títulos e Descrições
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-fonte-escura font-semibold mb-2">
                  Título 1 <span className="text-vermelho-claro">*</span>
                </label>
                <input
                  type="text"
                  value={titulo1}
                  onChange={(e) => setTitulo1(e.target.value)}
                  className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-fonte-escura font-semibold mb-2">
                  Título 2 <span className="text-vermelho-claro">*</span>
                </label>
                <input
                  type="text"
                  value={titulo2}
                  onChange={(e) => setTitulo2(e.target.value)}
                  className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-fonte-escura font-semibold mb-2">
                Descrição 1 <span className="text-vermelho-claro">*</span>
              </label>
              <textarea
                value={descricao1}
                onChange={(e) => setDescricao1(e.target.value)}
                className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
                rows="3"
                required
              ></textarea>
            </div>
            <div>
              <label className="block text-sm text-fonte-escura font-semibold mb-2">
                Descrição 2 <span className="text-vermelho-claro">*</span>
              </label>
              <textarea
                value={descricao2}
                onChange={(e) => setDescricao2(e.target.value)}
                className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
                rows="3"
                required
              ></textarea>
              <p className="text-xs text-fonte-escura/50 mt-1">
                Suporta markdown para formatação (ex.: **negrito**, *itálico*).
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm text-fonte-escura font-semibold">Botões</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-fonte-escura font-semibold mb-2">
                  Botão 1 - Nome <span className="text-vermelho-claro">*</span>
                </label>
                <input
                  type="text"
                  value={botao1Nome}
                  onChange={(e) => setBotao1Nome(e.target.value)}
                  className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-fonte-escura font-semibold mb-2">
                  Botão 1 - Link
                </label>
                <input
                  type="text"
                  value={botao1Link}
                  onChange={(e) => setBotao1Link(e.target.value)}
                  className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-fonte-escura font-semibold mb-2">
                  Botão 2 - Nome <span className="text-vermelho-claro">*</span>
                </label>
                <input
                  type="text"
                  value={botao2Nome}
                  onChange={(e) => setBotao2Nome(e.target.value)}
                  className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-fonte-escura font-semibold mb-2">
                  Botão 2 - Link
                </label>
                <input
                  type="text"
                  value={botao2Link}
                  onChange={(e) => setBotao2Link(e.target.value)}
                  className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm text-fonte-escura font-semibold">Imagem</h3>
            <div className="flex flex-col items-center">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-azul-claro rounded-lg cursor-pointer hover:bg-cinza-escuro/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <RiImageAddLine className="w-8 h-8 text-azul-claro mb-2" />
                  <p className="text-sm text-fonte-escura">
                    Clique para enviar
                  </p>
                  <p className="text-xs text-fonte-escura/50 mt-1">
                    PNG, JPG ou JPEG (Max. 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImagemUpload}
                  accept="image/*"
                  className="hidden"
                />
              </label>
              {imagemUrl && imagemUrl !== "/api/placeholder/400/320" && (
                <div className="mt-4 flex justify-center">
                  <div className="relative w-24 h-24">
                    <img
                      src={imagemUrl}
                      alt="Imagem selecionada"
                      className="w-full h-full rounded object-cover border border-cinza-escuro"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagemUrl("/api/placeholder/400/320");
                        setImagemFile(null);
                      }}
                      className="absolute -top-2 -right-2 bg-vermelho-claro text-branco rounded-full w-6 h-6 flex items-center justify-center hover:bg-vermelho-escuro transition-colors"
                      title="Remover imagem"
                    >
                      <RiCloseFill className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm text-fonte-escura font-semibold">
                Ícones de Jogos
              </h3>
              <button
                onClick={adicionarIcone}
                className="bg-azul-claro hover:bg-azul-escuro text-branco font-semibold py-1 px-3 rounded text-sm"
              >
                Adicionar Ícone
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {icones.map((icone) => (
                <div key={icone.id} className="border border-borda p-4 rounded">
                  <div className="flex flex-col items-center mb-3">
                    <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-azul-claro rounded-lg cursor-pointer hover:bg-cinza-escuro/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-2 pb-3">
                        <RiImageAddLine className="w-6 h-6 text-azul-claro mb-1" />
                        <p className="text-xs text-fonte-escura">
                          Clique para enviar
                        </p>
                      </div>
                      <input
                        type="file"
                        ref={(el) =>
                          (iconeFileInputRefs.current[icone.id] = el)
                        }
                        onChange={(e) => handleIconeImagemUpload(e, icone.id)}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                    {icone.imagem !== "/api/placeholder/40/40" && (
                      <div className="mt-2 flex justify-center">
                        <div className="relative w-10 h-10">
                          <img
                            src={icone.imagem}
                            alt={`Ícone ${icone.id}`}
                            className="w-full h-full rounded object-cover border border-cinza-escuro"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              atualizarImagemIcone(
                                icone.id,
                                "/api/placeholder/40/40"
                              )
                            }
                            className="absolute -top-2 -right-2 bg-vermelho-claro text-branco rounded-full w-5 h-5 flex items-center justify-center hover:bg-vermelho-escuro transition-colors"
                            title="Remover ícone"
                          >
                            <RiCloseFill className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm text-fonte-escura font-semibold mb-2">
                      Link
                    </label>
                    <input
                      type="text"
                      value={icone.link}
                      onChange={(e) =>
                        atualizarLinkIcone(icone.id, e.target.value)
                      }
                      className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none text-sm"
                    />
                  </div>
                  <button
                    onClick={() => removerIcone(icone.id)}
                    className="bg-vermelho-claro hover:bg-vermelho-escuro text-branco font-semibold py-1 px-3 rounded w-full text-sm"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6 space-x-2">
          <SalvarBtn onClick={salvarAlteracoes} disabled={isSubmitting} />
          <CancelarBtn onClick={handleClose} disabled={isSubmitting} />
        </div>
      </div>
    </div>
  );
};

ApresentacaoModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  dadosIniciais: PropTypes.shape({
    titulo1: PropTypes.string,
    titulo2: PropTypes.string,
    descricao1: PropTypes.string,
    descricao2: PropTypes.string,
    botao1Nome: PropTypes.string,
    botao1Link: PropTypes.string,
    botao2Nome: PropTypes.string,
    botao2Link: PropTypes.string,
    imagem: PropTypes.string,
    icones: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        imagem: PropTypes.string.isRequired,
        link: PropTypes.string.isRequired,
      })
    ),
  }),
  userRole: PropTypes.oneOf([
    "Jogador",
    "Capitão de time",
    "Administrador",
    "Administrador Geral",
    null,
  ]),
};

ApresentacaoModal.defaultProps = {
  isOpen: false,
  onClose: () => {},
  onSave: () => {},
  dadosIniciais: {
    titulo1: "Título 1",
    titulo2: "Título 2",
    descricao1: "Descrição 1 do componente",
    descricao2: "Descrição 2 do componente",
    botao1Nome: "Botão 1",
    botao1Link: "#",
    botao2Nome: "Botão 2",
    botao2Link: "#",
    imagem: "/api/placeholder/400/320",
    icones: [{ id: 1, imagem: "/api/placeholder/40/40", link: "#" }],
  },
  userRole: null,
};

export default ApresentacaoModal;
