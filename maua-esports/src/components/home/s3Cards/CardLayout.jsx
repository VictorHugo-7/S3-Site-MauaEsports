import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Margin from '../../padrao/Margin';
import Card from './Card';
import AOS from 'aos';
import 'aos/dist/aos.css';
import axios from 'axios';
import AlertaErro from '../../AlertaErro';

const API_BASE_URL = "http://localhost:3000";

const CardLayout = ({ onCardSave }) => {
  const [cards, setCards] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    AOS.init({
      duration: 1500,
      once: true,
    });

    const fetchCards = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/cards`);
        console.log("Cards recebidos:", response.data);

        if (!Array.isArray(response.data)) {
          throw new Error("Formato inesperado de resposta da API");
        }

        setCards(response.data);
        setError('');
      } catch (err) {
        console.error('Erro ao buscar cards:', err);
        setError('Erro ao carregar os cards.');
        setCards([]);
      }
    };

    fetchCards();
  }, []);

  const handleUpdateCard = (cardId, updatedData) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card._id === cardId
          ? {
              ...card,
              titulo: updatedData.titulo,
              descricao: updatedData.texto,
              icone: updatedData.icon
                ? { data: updatedData.icon.split(',')[1], contentType: updatedData.icon.split(';')[0].split(':')[1] }
                : card.icone,
            }
          : card
      )
    );
  };

  return (
    <Margin horizontal="60px">
      <h1
        data-aos-delay="100"
        data-aos="fade-up"
        className="text-3xl text-center font-bold mb-15 text-azul-claro"
      >
        Informações
      </h1>

      {error && <AlertaErro mensagem={error} />}

      <div className="flex flex-col lg:flex-row justify-between gap-5 items-center">
        {Array.isArray(cards) && cards.length > 0 ? (
          cards.map((card, index) => (
            <Card
              key={card._id}
              id={card._id}
              icon={
                card.icone
                  ? `data:${card.icone.contentType};base64,${card.icone.data}`
                  : ''
              }
              texto={card.descricao}
              titulo={card.titulo}
              onCardSave={onCardSave}
              onUpdateCard={handleUpdateCard}
              data-aos="fade-up"
              data-aos-delay={`${100 * (index + 1)}`}
            />
          ))
        ) : (
          <p className="text-white">Nenhum card disponível.</p>
        )}
      </div>
    </Margin>
  );
};

CardLayout.propTypes = {
  onCardSave: PropTypes.func.isRequired,
};

export default CardLayout;