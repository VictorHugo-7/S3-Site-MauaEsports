import PropTypes from 'prop-types';
import Margin from '../../padrao/Margin';
import Card from './Card';

const CardLayout = () => {
    return (
        <Margin horizontal="60px">
            <div className='flex flex-wrap justify-between'>
                <Card 
                    icon="https://cdn-icons-png.flaticon.com/128/1865/1865273.png" 
                    texto="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Soluta, consequuntur totam? Porro molestias eius inventore minima, similique exercitationem dignissimos ab, adipisci magni odio sit cumque corporis, sequi sunt nihil quos!"
                    titulo="Título"
                />
                <Card 
                    icon="https://cdn-icons-png.flaticon.com/128/1865/1865273.png" 
                    texto="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Soluta, consequuntur totam? Porro molestias eius inventore minima, similique exercitationem dignissimos ab, adipisci magni odio sit cumque corporis, sequi sunt nihil quos!"
                    titulo="Título"
                />
                <Card 
                    icon="https://cdn-icons-png.flaticon.com/128/1865/1865273.png" 
                    texto="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Soluta, consequuntur totam? Porro molestias eius inventore minima, similique exercitationem dignissimos ab, adipisci magni odio sit cumque corporis, sequi sunt nihil quos!"
                    titulo="Título"
                />
                <Card 
                    icon="https://cdn-icons-png.flaticon.com/128/1865/1865273.png" 
                    texto="Lorem ipsum dolor Lorem ipsum dolor Lorem ipsum dolor Lorem ipsum dolor Lorem ipsum dolor"
                    titulo="Título"
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