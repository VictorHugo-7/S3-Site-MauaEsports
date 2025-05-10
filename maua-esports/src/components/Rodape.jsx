import { Mail, ArrowUp } from "lucide-react";
import { BsInstagram, BsTwitch, BsDiscord, BsYoutube } from "react-icons/bs";
import { Link } from "react-router-dom";
import Margin from "./padrao/Margin";

const Rodape = () => {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    return (

        <footer className="bg-navbar border-t border-borda mt-auto py-6 w-full">
            <Margin horizontal="60px">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex flex-row items-center gap-5 mb-4 md:mb-0 text-fonte-escura">
                        <p>© 2025 Todos Direitos Reservados Mauá Esports</p>
                        <Link to="/politicas" className="hover:underline">Termos e Políticas</Link>
                    </div>

                    <div className="flex items-center space-x-4 text-fonte-escura">
                        <a href="https://www.instagram.com/esportsmaua" className="hover:text-azul-escuro transition-colors" target="_blank" rel="noopener noreferrer"> <BsInstagram size={20} /> </a>
                        <a href="https://www.twitch.tv/mauaesports" className="hover:text-azul-escuro transition-colors" target="_blank" rel="noopener noreferrer"> <BsTwitch size={20} /> </a>
                        <a href="https://discord.com/invite/Av5EA6QfdR" className="hover:text-azul-escuro transition-colors" target="_blank" rel="noopener noreferrer"> <BsDiscord size={20} /> </a>
                        <a href="https://www.youtube.com/mauaesports" className="hover:text-azul-escuro transition-colors" target="_blank" rel="noopener noreferrer"> <BsYoutube size={20} /> </a>
                        <a href="mailto:esports@maua.br" className="hover:text-azul-escuro transition-colors"> <Mail size={20} /> </a>
                        <button
                            onClick={scrollToTop}
                            className="hover:text-azul-escuro transition-colors ml-2 cursor-pointer"
                            aria-label="Voltar ao topo"
                        >
                            <ArrowUp size={24} />
                        </button>
                    </div>
                </div>
            </Margin>
        </footer>

    );
};

export default Rodape;