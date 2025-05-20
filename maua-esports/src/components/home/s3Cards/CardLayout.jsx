import { useEffect, useState } from 'react';
import Margin from '../../padrao/Margin';
import Card from './Card';
import AOS from 'aos';
import 'aos/dist/aos.css';
import axios from 'axios';
import AlertaErro from '../../AlertaErro';

const API_BASE_URL = "http://localhost:3000";

const CardLayout = () => {
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

        // LOG para debugging (pode remover depois)
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

export default CardLayout;
