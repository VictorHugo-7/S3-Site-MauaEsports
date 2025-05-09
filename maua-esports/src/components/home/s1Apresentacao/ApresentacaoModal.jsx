import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const ApresentacaoModal = ({ 
    isOpen = false, 
    onClose = () => {}, 
    onSave = () => {}, 
    dadosIniciais = {} 
}) => {
    // Estados para os dados do modal com valores padrão caso dadosIniciais seja undefined ou não tenha as propriedades
    const [titulo1, setTitulo1] = useState(dadosIniciais?.titulo1 || 'Título 1');
    const [titulo2, setTitulo2] = useState(dadosIniciais?.titulo2 || 'Título 2');
    const [descricao1, setDescricao1] = useState(dadosIniciais?.descricao1 || 'Descrição 1 do componente');
    const [descricao2, setDescricao2] = useState(dadosIniciais?.descricao2 || 'Descrição 2 do componente');
    const [botao1Nome, setBotao1Nome] = useState(dadosIniciais?.botao1Nome || 'Botão 1');
    const [botao1Link, setBotao1Link] = useState(dadosIniciais?.botao1Link || '#');
    const [botao2Nome, setBotao2Nome] = useState(dadosIniciais?.botao2Nome || 'Botão 2');
    const [botao2Link, setBotao2Link] = useState(dadosIniciais?.botao2Link || '#');
    const [imagemUrl, setImagemUrl] = useState(dadosIniciais?.imagemUrl || '/api/placeholder/400/320');
    const [icones, setIcones] = useState(dadosIniciais?.icones || [
        { id: 1, imagem: '/api/placeholder/40/40', link: '#' }
    ]);
    
    // Referência para o input de arquivo da imagem principal
    const fileInputRef = useRef(null);
    
    // Objeto para armazenar referências para os inputs de arquivo de cada ícone
    const iconeFileInputRefs = useRef({});
    
    // Atualizar estados quando as props mudam
    useEffect(() => {
        if (dadosIniciais) {
            setTitulo1(dadosIniciais.titulo1 || 'Título 1');
            setTitulo2(dadosIniciais.titulo2 || 'Título 2');
            setDescricao1(dadosIniciais.descricao1 || 'Descrição 1 do componente');
            setDescricao2(dadosIniciais.descricao2 || 'Descrição 2 do componente');
            setBotao1Nome(dadosIniciais.botao1Nome || 'Botão 1');
            setBotao1Link(dadosIniciais.botao1Link || '#');
            setBotao2Nome(dadosIniciais.botao2Nome || 'Botão 2');
            setBotao2Link(dadosIniciais.botao2Link || '#');
            setImagemUrl(dadosIniciais.imagemUrl || '/api/placeholder/400/320');
            setIcones(dadosIniciais.icones || [{ id: 1, imagem: '/api/placeholder/40/40', link: '#' }]);
        }
    }, [dadosIniciais]);
    
    // Função para adicionar novo ícone
    const adicionarIcone = () => {
        const novoIcone = {
            id: Date.now(), // Usar timestamp para garantir IDs únicos
            imagem: '/api/placeholder/40/40',
            link: '#'
        };
        setIcones([...icones, novoIcone]);
    };
    
    // Função para remover ícone
    const removerIcone = (id) => {
        setIcones(icones.filter(icone => icone.id !== id));
    };
    
    // Função para atualizar link de um ícone
    const atualizarLinkIcone = (id, novoLink) => {
        setIcones(icones.map(icone => 
            icone.id === id ? { ...icone, link: novoLink } : icone
        ));
    };
    
    // Função para atualizar imagem de um ícone
    const atualizarImagemIcone = (id, novaImagem) => {
        setIcones(icones.map(icone => 
            icone.id === id ? { ...icone, imagem: novaImagem } : icone
        ));
    };
    
    // Função para lidar com upload de imagem principal
    const handleImagemUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Em um ambiente real, você faria upload para um servidor
            // Por enquanto, apenas simularemos com uma URL local ou blob URL
            const imageUrl = URL.createObjectURL(file);
            setImagemUrl(imageUrl);
            // alert('Em um ambiente real, a imagem seria carregada para o servidor.');
        }
    };
    
    // Função para lidar com upload de imagem de ícone
    const handleIconeImagemUpload = (e, id) => {
        const file = e.target.files[0];
        if (file) {
            // Em um ambiente real, você faria upload para um servidor
            // Por enquanto, apenas simularemos com uma URL local ou blob URL
            const imageUrl = URL.createObjectURL(file);
            atualizarImagemIcone(id, imageUrl);
            // alert('Em um ambiente real, a imagem do ícone seria carregada para o servidor.');
        }
    };
    
    // Função para simular escolha de imagem principal
    const selecionarImagem = () => {
        fileInputRef.current.click();
    };
    
    // Função para simular escolha de imagem de ícone
    const selecionarImagemIcone = (id) => {
        // Verificar se a referência para o input de arquivo existe
        if (iconeFileInputRefs.current[id]) {
            iconeFileInputRefs.current[id].click();
        }
    };
    
    // Função para salvar alterações e enviar para o componente pai
    const salvarAlteracoes = () => {
        onSave({
            titulo1,
            titulo2,
            descricao1,
            descricao2,
            botao1Nome,
            botao1Link,
            botao2Nome,
            botao2Link,
            imagemUrl,
            icones
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Editar Seção</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Seção de Títulos */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700">Títulos</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Título 1 (Cor Branca)
                            </label>
                            <input
                                type="text"
                                value={titulo1}
                                onChange={(e) => setTitulo1(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Título 2 (Cor Azul)
                            </label>
                            <input
                                type="text"
                                value={titulo2}
                                onChange={(e) => setTitulo2(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>

                    {/* Seção de Descrições */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700">Descrições</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descrição 1
                            </label>
                            <textarea
                                value={descricao1}
                                onChange={(e) => setDescricao1(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                rows="2"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descrição 2
                            </label>
                            <textarea
                                value={descricao2}
                                onChange={(e) => setDescricao2(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                rows="2"
                            ></textarea>
                        </div>
                    </div>

                    {/* Seção de Botões */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700">Botões</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Botão 1 - Nome
                            </label>
                            <input
                                type="text"
                                value={botao1Nome}
                                onChange={(e) => setBotao1Nome(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Botão 1 - Link
                            </label>
                            <input
                                type="text"
                                value={botao1Link}
                                onChange={(e) => setBotao1Link(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Botão 2 - Nome
                            </label>
                            <input
                                type="text"
                                value={botao2Nome}
                                onChange={(e) => setBotao2Nome(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Botão 2 - Link
                            </label>
                            <input
                                type="text"
                                value={botao2Link}
                                onChange={(e) => setBotao2Link(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>

                    {/* Seção de Imagem */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700">Imagem</h3>
                        <div className="flex flex-col items-center">
                            <img 
                                src={imagemUrl} 
                                alt="Imagem selecionada" 
                                className="w-40 h-40 object-cover mb-4"
                            />
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImagemUpload}
                                accept="image/*"
                                className="hidden"
                            />
                            <button
                                onClick={selecionarImagem}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md"
                            >
                                Escolher Imagem
                            </button>
                            <p className="text-xs text-gray-500 mt-2">Recomendado: 400px</p>
                        </div>
                    </div>
                </div>

                {/* Seção de Ícones */}
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Ícones de Jogos</h3>
                        <button
                            onClick={adicionarIcone}
                            className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded-md text-sm"
                        >
                            Adicionar Ícone
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {icones.map(icone => (
                            <div key={icone.id} className="border p-4 rounded-md">
                                <div className="flex flex-col items-center mb-3">
                                    <img 
                                        src={icone.imagem} 
                                        alt={`Ícone ${icone.id}`} 
                                        className="w-10 h-10 mb-2"
                                    />
                                    <input
                                        type="file"
                                        ref={el => iconeFileInputRefs.current[icone.id] = el}
                                        onChange={(e) => handleIconeImagemUpload(e, icone.id)}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => selecionarImagemIcone(icone.id)}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm py-1 px-3 rounded-md"
                                    >
                                        Escolher Ícone
                                    </button>
                                </div>
                                <div className="mb-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Link
                                    </label>
                                    <input
                                        type="text"
                                        value={icone.link}
                                        onChange={(e) => atualizarLinkIcone(icone.id, e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                    />
                                </div>
                                <button
                                    onClick={() => removerIcone(icone.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm w-full"
                                >
                                    Remover
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex justify-end mt-8 space-x-4">
                    <button
                        onClick={onClose}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-md"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={salvarAlteracoes}
                        className="bg-[#284880] hover:bg-[#162b50] text-white font-medium py-2 px-6 rounded-md"
                    >
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
};

// Definição dos PropTypes para validação
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
        imagemUrl: PropTypes.string,
        icones: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number.isRequired,
                imagem: PropTypes.string.isRequired,
                link: PropTypes.string.isRequired
            })
        )
    })
};

// Valores padrão para as props
ApresentacaoModal.defaultProps = {
    isOpen: false,
    onClose: () => {},
    onSave: () => {},
    dadosIniciais: {
        titulo1: 'Título 1',
        titulo2: 'Título 2',
        descricao1: 'Descrição 1 do componente',
        descricao2: 'Descrição 2 do componente',
        botao1Nome: 'Botão 1',
        botao1Link: '#',
        botao2Nome: 'Botão 2',
        botao2Link: '#',
        imagemUrl: '/api/placeholder/400/320',
        icones: [{ id: 1, imagem: '/api/placeholder/40/40', link: '#' }]
    }
};

export default ApresentacaoModal;