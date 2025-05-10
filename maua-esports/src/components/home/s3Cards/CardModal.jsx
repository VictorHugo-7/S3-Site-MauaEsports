import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { RiImageAddLine, RiCloseFill } from 'react-icons/ri';
import SalvarBtn from '../../SalvarBtn';
import CancelarBtn from '../../CancelarBtn';
import { createPortal } from 'react-dom';

const CardModal = ({ isOpen, onClose, textoAtual, tituloAtual, iconAtual, onSave }) => {
    const [texto, setTexto] = useState('');
    const [titulo, setTitulo] = useState('');
    const [iconPreview, setIconPreview] = useState(iconAtual);
    const [iconFile, setIconFile] = useState(null);
    const [erroLocal, setErroLocal] = useState('');

    // Inicializa valores quando o modal é aberto
    useEffect(() => {
        if (isOpen) {
            setTexto(textoAtual);
            setTitulo(tituloAtual);
            setIconPreview(iconAtual);
            setErroLocal('');
        }
    }, [isOpen, textoAtual, tituloAtual, iconAtual]);

    // Função para lidar com o upload de ícone
    const handleIconChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!tiposPermitidos.includes(file.type)) {
                setErroLocal('Formato de imagem inválido. Use apenas JPG, JPEG ou PNG.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setErroLocal('A imagem deve ter no máximo 5MB');
                return;
            }
            setErroLocal('');
            setIconFile(file);
            const previewURL = URL.createObjectURL(file);
            setIconPreview(previewURL);
        }
    };

    // Função para remover a imagem
    const handleRemoveIcon = () => {
        setIconPreview('');
        setIconFile(null);
    };

    // Função para salvar alterações
    const handleSubmit = () => {
        if (!titulo || !texto) {
            setErroLocal('Preencha todos os campos obrigatórios!');
            return;
        }

        if (iconFile) {
            const reader = new FileReader();
            reader.readAsDataURL(iconFile);
            reader.onloadend = () => {
                const base64Icon = reader.result;
                onSave({
                    texto,
                    titulo,
                    icon: base64Icon
                });
                onClose();
            };
        } else {
            onSave({
                texto,
                titulo,
                icon: iconPreview
            });
            onClose();
        }
    };

    // Se o modal não estiver aberto, não renderiza nada
    if (!isOpen) return null;

    // Usa createPortal para renderizar o modal fora da hierarquia do Card
    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-fundo/80">
            <div className="bg-fundo p-6 rounded-lg shadow-sm shadow-azul-claro w-96 relative max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-branco">Editar Informações</h2>
                    <button
                        onClick={onClose}
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

                <div className="mb-4">
                    <label className="block text-sm text-fonte-escura font-semibold mb-2">
                        Ícone <span className="text-vermelho-claro">*</span>
                    </label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-azul-claro rounded-lg cursor-pointer hover:bg-cinza-escuro/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <RiImageAddLine className="w-8 h-8 text-azul-claro mb-2" />
                            <p className="text-sm text-fonte-escura">Clique para enviar</p>
                            <p className="text-xs text-fonte-escura/50 mt-1">
                                PNG, JPG ou JPEG (Max. 5MB)
                            </p>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleIconChange}
                            className="hidden"
                        />
                    </label>
                    {iconPreview && (
                        <div className="mt-4 flex justify-center">
                            <div className="relative w-24 h-24">
                                <img
                                    src={iconPreview}
                                    alt="Pré-visualização do ícone"
                                    className="w-full h-full rounded object-cover border border-cinza-escuro"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveIcon}
                                    className="absolute -top-2 -right-2 bg-vermelho-claro text-branco rounded-full w-6 h-6 flex items-center justify-center hover:bg-vermelho-escuro transition-colors"
                                    title="Remover imagem"
                                >
                                    <RiCloseFill className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block text-sm text-fonte-escura font-semibold mb-2">
                        Título <span className="text-vermelho-claro">*</span>
                    </label>
                    <input
                        type="text"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm text-fonte-escura font-semibold mb-2">
                        Descrição <span className="text-vermelho-claro">*</span>
                    </label>
                    <textarea
                        value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                        className="w-full border border-borda text-branco bg-preto p-2 rounded focus:border-azul-claro focus:outline-none"
                        rows="3"
                        required
                    />
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                    <SalvarBtn onClick={handleSubmit} />
                    <CancelarBtn onClick={onClose} />
                </div>
            </div>
        </div>,
        document.body // Renderiza o modal diretamente no body do documento
    );
};

CardModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    textoAtual: PropTypes.string,
    tituloAtual: PropTypes.string,
    iconAtual: PropTypes.string,
    onSave: PropTypes.func.isRequired
};

export default CardModal;