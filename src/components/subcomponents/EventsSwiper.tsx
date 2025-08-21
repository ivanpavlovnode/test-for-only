import React , {useMemo} from 'react';
//Импорт хука с контекстом
import { useAppContext } from '../AppBlock';
//Импорт интерфейсов
import {Card, Interval} from './../interfaces/Interfaces';
//Импорт всего для работы Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import styled from 'styled-components';

const EventsSwiper = () => {
  const {chosenInterval, intervals} = useAppContext();

  //Берем карточки для выбранного интервала
  const chosenCards: Card[] = useMemo(() => {
    //Предварительно сортируем, если данные не упорядочены
    const sortedIntervals: Interval[] = intervals?.sort((a, b) => a.intervalStart - b.intervalStart) ?? [];
    return sortedIntervals?.[chosenInterval]?.intervalCards ?? [];
  }, [intervals, chosenInterval]);

  return (
    <Swiper
      modules={[Navigation, Pagination, Scrollbar, Mousewheel]}
      style={{ 
        height: '17%', 
        width: '89%', 
        overflow: 'hidden', 
        top:'75%', 
        right: '0', 
        backgroundColor:'#ffdcdc'
        
      }}
      spaceBetween={100}
      slidesPerView={3}  // Количество видимых слайдов
      navigation         // Включение стрелок навигации
      centeredSlides={true}        // Центрирование активного слайда
      breakpoints={{               // Адаптивность
        640: { slidesPerView: 2 , centeredSlides: false},
        1024: { slidesPerView: 3 }
      }}
      mousewheel={{ enabled: true }} // Прокрутка колёсиком мыши
    > 
      {chosenCards.map((card) => (
        <SwiperSlide 
          key={card. text}
          style={{ height: '100%', width: '33%', overflow: 'hidden'}}>
          <CardDate>{card.date}</CardDate>
          <CardText>{card.text}</CardText>

        </SwiperSlide>))}
    </Swiper>
  );
};
export default EventsSwiper;

const CardDate = styled.h2`
  top: 0;
  width: 100%;
  font-size: 1.2vw;
  font-family: 'BebasNeueRegular';

`;
const CardText = styled.p`
  top: 25%;
  width: 100%;
  height: 50%;
  overflow: hidden;
  font-size: 1.1vw;
  font-family: 'PtSansRegular';
`;