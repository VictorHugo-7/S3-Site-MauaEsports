import { useState, useEffect } from 'react';
import Espaco from '../components/padrao/Espaco';
import Apresentacao from '../components/home/s1Apresentacao/Apresentacao';
import Twitch from '../components/home/s2Twitch/Twitch';
import CardLayout from '../components/home/s3Cards/CardLayout';
import Novidade from '../components/home/s4Novidade/Novidade';
import AlertaOk from '../components/AlertaOk';

const Home = () => {
  const [showAlertaOk, setShowAlertaOk] = useState(false);

  const handleCardSave = () => {
    setShowAlertaOk(true);
  };

  useEffect(() => {
    if (showAlertaOk) {
      const timer = setTimeout(() => {
        setShowAlertaOk(false);
      }, 3000); // 3 segundos
      return () => clearTimeout(timer);
    }
  }, [showAlertaOk]);

  return (
    <div className="bg-[#0D1117]">
      {showAlertaOk && (
          <AlertaOk mensagem="Card atualizado com sucesso!" />
  
      )}
      <div className="bg-[#010409] h-[104px]">.</div>
      <Espaco tamanho="80px" />
      <Apresentacao />
      <Espaco tamanho="80px" />
      <Twitch />
      <Espaco tamanho="80px" />
      <CardLayout onCardSave={handleCardSave} />
      <Espaco tamanho="80px" />
      <Novidade />
      <Espaco tamanho="80px" />
    </div>
  );
};

export default Home;