import { useState } from 'react';
import PropTypes from 'prop-types';
import EditarBtn from '../../EditarBtn';
import CardModal from './CardModal';

const Card = ({ icon, texto, titulo = 'Título', ...aosProps }) => {
    const [modalAberto, setModalAberto] = useState(false);
    const [cardTexto, setCardTexto] = useState(texto);
    const [cardIcon, setCardIcon] = useState(icon);
    const [cardTitulo, setCardTitulo] = useState(titulo);

    const abrirModal = () => {
        setModalAberto(true);
    };

    const fecharModal = () => {
        setModalAberto(false);
    };

    const salvarAlteracoes = (dados) => {
        setCardTexto(dados.texto);
        setCardIcon(dados.icon);
        setCardTitulo(dados.titulo);
    };

    return (
        <div
            className='text-center border border-borda rounded-[12px] p-5 flex flex-col h-70 w-80 min-w-[20rem] max-w-[20rem] hover:scale-101 hover:border-azul-claro transition-all duration-300 ease-in-out'
            {...aosProps} // Passa os atributos AOS (data-aos, data-aos-delay, etc.)
        >
            <div className="flex justify-center mb-1">
                <img className='w-12 h-12 object-contain' src={cardIcon} alt={cardTitulo} />
            </div>

            <hr className='text-borda w-full my-1' />

            <h3 className='text-lg font-semibold text-fonte-escura mt-1'>{cardTitulo}</h3>

            <div className='flex-grow overflow-auto my-4 scrollbar-custom pr-4 text-sm'>
                <style>{`
                    .scrollbar-custom::-webkit-scrollbar {
                        width: 2px;
                    }
                    .scrollbar-custom::-webkit-scrollbar-track {
                        background: #000;
                        border-radius: 20px;
                    }
                    .scrollbar-custom::-webkit-scrollbar-thumb {
                        background: #3D444D;
                        border-radius: 10px;
                    }
                    .scrollbar-custom::-webkit-scrollbar-thumb:hover {
                        background: white;
                    }
                `}</style>
                <p className='text-fonte-escura'>{cardTexto}</p>
            </div>

            <div className='flex justify-end mt-auto'>
                <EditarBtn onClick={abrirModal} />
            </div>

            <CardModal
                isOpen={modalAberto}
                onClose={fecharModal}
                textoAtual={cardTexto}
                tituloAtual={cardTitulo}
                iconAtual={cardIcon}
                onSave={salvarAlteracoes}
            />
        </div>
    );
};

Card.propTypes = {
    texto: PropTypes.string,
    icon: PropTypes.string,
    titulo: PropTypes.string,
    'data-aos': PropTypes.string, // Adiciona suporte para data-aos
    'data-aos-delay': PropTypes.string // Adiciona suporte para data-aos-delay
};

export default Card;