import PropTypes from 'prop-types';

const AddBtn = ({ onClick, buttonText, width, height, className }) => {
  // Estilos base do componente
  const baseStyles = "flex flex-col items-center justify-center bg-gray-900 rounded-lg p-6 border border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors duration-200 shadow-md";
  
  // Estilos de dimensão personalizados
  const dimensionStyles = {};
  if (width) dimensionStyles.width = width;
  if (height) dimensionStyles.height = height;
  
  return (
    <div 
      className={`${baseStyles} ${className || ''}`}
      onClick={onClick}
      style={dimensionStyles}
    >
      <div className="rounded-full border-2 border-gray-500 p-2 mb-3">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 text-gray-500" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
          />
        </svg>
      </div>
      <span className="text-gray-500 font-medium text-sm">{buttonText || "Adicionar Item"}</span>
    </div>
  );
};

AddBtn.propTypes = {
  onClick: PropTypes.func.isRequired,
  buttonText: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  className: PropTypes.string
};

export default AddBtn;