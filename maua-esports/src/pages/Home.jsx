import { useState, useEffect } from 'react';
import Espaco from '../components/padrao/Espaco';
import Apresentacao from '../components/home/s1Apresentacao/Apresentacao';
import Twitch from '../components/home/s2Twitch/Twitch';
import CardLayout from '../components/home/s3Cards/CardLayout';
import Novidade from '../components/home/s4Novidade/Novidade';
import AlertaOk from '../components/AlertaOk';
import AlertaErro from '../components/AlertaErro';

const Home = () => {
  const [showAlertaOk, setShowAlertaOk] = useState(false);
  const [showAlertaErro, setShowAlertaErro] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');

  const handleCardSave = () => {
    setShowAlertaOk(true);
    setShowAlertaErro(false); // Garante que o AlertaErro não seja exibido ao salvar com sucesso
  };

  const handleCardError = (mensagem) => {
    setMensagemErro(mensagem);
    setShowAlertaErro(true);
    setShowAlertaOk(false); // Garante que o AlertaOk não seja exibido ao falhar
  };

  useEffect(() => {
    if (showAlertaOk || showAlertaErro) {
      const timer = setTimeout(() => {
        setShowAlertaOk(false);
        setShowAlertaErro(false);
        setMensagemErro('');
      }, 3000); // 3 segundos
      return () => clearTimeout(timer);
    }
  }, [showAlertaOk, showAlertaErro]);

  return (
    <div className="bg-[#0D1117]">
      {showAlertaOk && (
          <AlertaOk mensagem="Card atualizado com sucesso!" />
        
      )}
      {showAlertaErro && (
          <AlertaErro mensagem={mensagemErro} />
        
      )}
      <div className="bg-[#010409] h-[104px]">.</div>
      <Espaco tamanho="80px" />
      <Apresentacao />
      <Espaco tamanho="80px" />
      <Twitch />
      <Espaco tamanho="80px" />
      <CardLayout onCardSave={handleCardSave} onCardError={handleCardError} />
      <Espaco tamanho="80px" />
      <Novidade />
      <Espaco tamanho="80px" />
    </div>
  );
};

export default Home;