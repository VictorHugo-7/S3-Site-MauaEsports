import { useEffect } from 'react';
import PropTypes from 'prop-types';
import Margin from '../../padrao/Margin';
import Card from './Card';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Importe o CSS do AOS
import s3IconAcessoSeguro from "../../../assets/images/home/s3IconAcessoSeguro.png";
import s3IconGestaoDeTreinos from "../../../assets/images/home/s3IconGestaoDeTreinos.png";
import s3IconHoraPaes from "../../../assets/images/home/s3IconHoraPaes.png";
import s3IconNossaMissao from "../../../assets/images/home/s3IconNossaMissao.png";

const CardLayout = () => {
    useEffect(() => {
        AOS.init({
            duration: 1500,
            once: true, // Anima apenas uma vez ao rolar
        });
    }, []);

    return (
        <Margin horizontal="60px">
            <div className='grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-6 justify-items-center'>
                <Card 
                    icon={s3IconAcessoSeguro} 
                    texto="Digitalizar e centralizar a gestão dos e-sports na Mauá, conectando atletas, capitães e administradores em um ambiente moderno, colaborativo e acessível."
                    titulo="Nossa Missão"
                    data-aos="fade-up" // Adiciona a animação AOS
                />
                <Card 
                    icon={s3IconGestaoDeTreinos} 
                    texto="Organize seus horários de treino com praticidade! A plataforma oferece uma interface intuitiva para visualizar, editar e acompanhar os treinos dos times de forma eficiente."
                    titulo="Treinos"
                    data-aos="fade-up" // Adiciona a animação AOS
                    data-aos-delay="100" // Delay para diferenciar a animação
                />
                <Card 
                    icon={s3IconHoraPaes} 
                    texto="Facilitamos o registro e a consulta das horas PAE dos alunos, garantindo um acompanhamento transparente e integrado com as atividades esportivas."
                    titulo="Horas PAE"
                    data-aos="fade-up" // Adiciona a animação AOS
                    data-aos-delay="200" // Delay para diferenciar a animação
                />
                <Card 
                    icon={s3IconNossaMissao} 
                    texto="Com login via conta Microsoft (@maua.br), cada perfil tem permissões específicas para uma gestão segura e organizada: administradores, capitães e atletas com acesso sob medida."
                    titulo="Acesso Seguro"
                    data-aos="fade-up" // Adiciona a animação AOS
                    data-aos-delay="300" // Delay para diferenciar a animação
                />
            </div>
        </Margin>
    );
};

CardLayout.propTypes = {
    btnName: PropTypes.string,
    to: PropTypes.string
};

export default CardLayout;