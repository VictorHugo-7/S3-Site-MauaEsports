import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const BtnApresentacao = ({ btnName, to = "/sobre" }) => {
    return (
        <Link to={to}>
            <button className="bg-azul-escuro hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition duration-300 flex items-center cursor-pointer">
                {btnName}
                <svg 
                    className="ml-2 w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </button>
        </Link>
    );
};

BtnApresentacao.propTypes = {
    btnName: PropTypes.string,
    to: PropTypes.string
};

export default BtnApresentacao;