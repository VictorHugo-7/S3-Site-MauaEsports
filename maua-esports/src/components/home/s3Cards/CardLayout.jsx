import { useEffect } from 'react';
import PropTypes from 'prop-types';
import Margin from '../../padrao/Margin';
import Card from './Card';
import AOS from 'aos';
import 'aos/dist/aos.css';
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
            <h1 data-aos-delay="100" data-aos="fade-up" className='text-3xl text-center font-bold mb-15 text-azul-claro'>Informações</h1>
            <div className="flex flex-col lg:flex-row justify-between gap-5 items-center">
                <Card 
                    icon={s3IconAcessoSeguro} 
                    texto="Digitalizar e centralizar a gestão dos e-sports na Mauá, conectando atletas, capitães e administradores em um ambiente moderno, colaborativo e acessível."
                    titulo="Nossa Missão"
                    data-aos="fade-up"
                />
                <Card 
                    icon={s3IconGestaoDeTreinos} 
                    texto="Organize seus horários de treino com praticidade! A plataforma oferece uma interface intuitiva para visualizar, editar e acompanhar os treinos dos times de forma eficiente."
                    titulo="Treinos"
                    data-aos="fade-up"
                    data-aos-delay="200"
                />
                
                <Card 
                    icon={s3IconHoraPaes} 
                    texto="Facilitamos o registro e a consulta das horas PAE dos alunos, garantindo um acompanhamento transparente e integrado com as atividades esportivas."
                    titulo="Horas PAE"
                    data-aos="fade-up"
                    data-aos-delay="300"
                />
                <Card 
                    icon={s3IconNossaMissao} 
                    texto="Com login via conta Microsoft (@maua.br), cada perfil tem permissões específicas para uma gestão segura e organizada: administradores, capitães e atletas com acesso sob medida."
                    titulo="Acesso Seguro"
                    data-aos="fade-up"
                    data-aos-delay="400"
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