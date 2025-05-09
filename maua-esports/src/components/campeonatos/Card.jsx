import PropTypes from 'prop-types';
import EditarBtn from '../EditarBtn';
import DeletarBtn from '../DeletarBtn';

const Card = ({ data, columnId, onEdit, onDelete, isAdminMode, isDraggable }) => {
    const {
        _id,
        name,
        description,
        price,
        gameName,
        startDate,
        firstPrize,
        secondPrize,
        thirdPrize,
        registrationLink,
        teamPosition,
        performanceDescription,
        imageUrl,
        gameIconUrl,
        organizerImageUrl,
    } = data;

    const handleDragStart = (e) => {
        if (!isDraggable) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('cardData', JSON.stringify(data));
        e.dataTransfer.setData('sourceColumn', columnId);
        e.target.classList.add('opacity-50');
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('opacity-50');
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const shouldShowPerformance = columnId !== 'inscricoes' && (teamPosition || performanceDescription);
    const shouldShowRegistrationButton = columnId !== 'passados' && registrationLink;

    return (
        <div
            className={`bg-[#0D1117] text-white overflow-hidden h-full flex flex-col border border-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 ${isDraggable ? 'cursor-move' : 'cursor-default'}`}
            draggable={isDraggable}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            {/* Header with tournament image */}
            <div className="relative border-b border-gray-700">
                <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder-tournament.jpg";
                    }}
                />
                {/* Game icon as a page marker */}
                {gameIconUrl && (
                    <div className="absolute top-3 left-4 -translate-y-1/3 z-10 h-12 w-12">
                        <img
                            src={gameIconUrl}
                            alt="Game Icon"
                            className="w-14 h-16 object-contain rounded-md bg-gray-800 border-2 border-gray-700 shadow-md p-1"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/placeholder-game-icon.png";
                            }}
                        />
                    </div>
                )}
                {/* Gradient overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <h3 className="absolute bottom-3 left-3 font-bold text-xl text-white">{name}</h3>
            </div>

            {/* Body */}
            <div className="p-4 flex-grow border-b border-gray-700 space-y-4">

                {/* Tournament details */}
                <div className="space-y-3">
                    {/* Date */}
                    {startDate && (
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2 flex-shrink-0 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                            </svg>
                            <span className="text-gray-300">Início: <span className="text-white font-medium">{formatDate(startDate)}</span></span>
                        </div>
                    )}

                    {/* Price */}
                    {price && (
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                            </svg>
                            <span className="text-gray-300">Inscrição: <span className="text-white font-medium">{price}</span></span>
                        </div>
                    )}

                    {/* Description */}
                    {description && (

                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z"></path>
                            </svg>
                            <span className="text-gray-300">Descrição: <span className="text-white font-medium">{description}</span></span>
                        </div>

                    )}

                    {/* Prizes */}
                    {(firstPrize || secondPrize || thirdPrize) && (
                        <div className="mt-2 space-y-2">
                            <h4 className="font-semibold text-gray-200 text-sm uppercase tracking-wider">Premiação</h4>
                            <div className="space-y-1.5">
                                {firstPrize && (
                                    <div className="flex items-center bg-yellow-900/20 rounded px-3 py-1.5">
                                        <svg className="w-4 h-4 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M9.668 2.117a1 1 0 011.664 0l2.51 4.124 5.005 1.065a1 1 0 01.538 1.653l-3.54 3.674.649 5.124a1 1 0 01-1.414 1.025L10 16.596l-4.58 2.186a1 1 0 01-1.415-1.025l.648-5.124-3.54-3.674a1 1 0 01.537-1.653l5.005-1.065 2.51-4.124z" clipRule="evenodd"></path>
                                        </svg>
                                        <span className="text-yellow-400 font-medium text-sm">1º: {firstPrize}</span>
                                    </div>
                                )}

                                {secondPrize && (
                                    <div className="flex items-center bg-gray-800/40 rounded px-3 py-1.5">
                                        <svg className="w-4 h-4 mr-2 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M9.668 2.117a1 1 0 011.664 0l2.51 4.124 5.005 1.065a1 1 0 01.538 1.653l-3.54 3.674.649 5.124a1 1 0 01-1.414 1.025L10 16.596l-4.58 2.186a1 1 0 01-1.415-1.025l.648-5.124-3.54-3.674a1 1 0 01.537-1.653l5.005-1.065 2.51-4.124z" clipRule="evenodd"></path>
                                        </svg>
                                        <span className="text-gray-300 font-medium text-sm">2º: {secondPrize}</span>
                                    </div>
                                )}

                                {thirdPrize && (
                                    <div className="flex items-center bg-amber-900/20 rounded px-3 py-1.5">
                                        <svg className="w-4 h-4 mr-2 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M9.668 2.117a1 1 0 011.664 0l2.51 4.124 5.005 1.065a1 1 0 01.538 1.653l-3.54 3.674.649 5.124a1 1 0 01-1.414 1.025L10 16.596l-4.58 2.186a1 1 0 01-1.415-1.025l.648-5.124-3.54-3.674a1 1 0 01.537-1.653l5.005-1.065 2.51-4.124z" clipRule="evenodd"></path>
                                        </svg>
                                        <span className="text-amber-500 font-medium text-sm">3º: {thirdPrize}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Team Performance */}
                {shouldShowPerformance && (
                    <div className="mt-4 pt-3 border-t border-gray-700">
                        <h4 className="font-semibold mb-2 text-blue-400 text-sm uppercase tracking-wider">Desempenho da Equipe</h4>
                        <div className="space-y-2">
                            {teamPosition && (
                                <div className="flex items-center bg-blue-900/20 rounded px-3 py-1.5">
                                    <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v3a2 2 0 002 2h10a2 2 0 002-2v-3a2 2 0 00-2-2V7a5 5 0 00-5-5zm0 2a3 3 0 00-3 3v2h6V7a3 3 0 00-3-3zm-3 7h6v3H7v-3z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-blue-400 font-medium text-sm">{teamPosition}</span>
                                </div>
                            )}

                            {performanceDescription && (
                                <div className="bg-gray-800/30 rounded-md p-3">
                                    <div className="flex items-start">
                                        <svg className="w-4 h-4 mr-2 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-gray-300 text-sm">{performanceDescription}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-900/50 flex items-center justify-between">
                {/* Organizador */}
                <div className="flex items-center">
                    <img
                        src={organizerImageUrl}
                        alt="Organizador"
                        className="max-w-[100px] max-h-[100px] rounded-full mr-2 object-cover"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder-organizer.png";
                        }}
                    />
                </div>

                {/* Botões */}
                <div className="flex gap-2">
                    {/* Botões de edição só aparecem no modo admin */}
                    {isAdminMode && (
                        <>
                            <EditarBtn onClick={onEdit} />
                            <DeletarBtn onDelete={onDelete} />
                        </>
                    )}

                    {/* Mostrar botão de inscrição apenas quando não estiver na coluna "passados" */}
                    {shouldShowRegistrationButton && (
                        <a
                            href={registrationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-500 text-white py-1 px-3 rounded text-sm hover:bg-blue-600"
                        >
                            Inscrever-se
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

Card.propTypes = {
    data: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        price: PropTypes.string,
        gameName: PropTypes.string,
        startDate: PropTypes.string,
        firstPrize: PropTypes.string,
        secondPrize: PropTypes.string,
        thirdPrize: PropTypes.string,
        registrationLink: PropTypes.string,
        teamPosition: PropTypes.string,
        performanceDescription: PropTypes.string,
        imageUrl: PropTypes.string,
        gameIconUrl: PropTypes.string,
        organizerImageUrl: PropTypes.string,
    }).isRequired,
    columnId: PropTypes.string.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    isAdminMode: PropTypes.bool.isRequired,
    isDraggable: PropTypes.bool.isRequired
};

export default Card;