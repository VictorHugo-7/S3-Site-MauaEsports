import valorant from "../../assets/images/home/valorant.png";
import cs from "../../assets/images/home/cs.png";
import rocket from "../../assets/images/home/rocket.png";
import tft from "../../assets/images/home/tft.png";


const ApresentacaoIconesJogos = () => {
    return (
        <div className="flex gap-5">
            <a href="https://playvalorant.com" target="_blank" rel="noopener noreferrer">
                <img src={valorant} className="h-[30px]" />
            </a>
            <a href="https://www.counter-strike.net" target="_blank" rel="noopener noreferrer">
                <img src={cs} className="h-[30px]" />
            </a>
            <a href="https://www.rocketleague.com" target="_blank" rel="noopener noreferrer">
                <img src={rocket} className="h-[30px]" />
            </a>
            <a href="https://teamfighttactics.leagueoflegends.com" target="_blank" rel="noopener noreferrer">
                <img src={tft} className="h-[30px]" />
            </a>
        </div>
    );
};

export default ApresentacaoIconesJogos;