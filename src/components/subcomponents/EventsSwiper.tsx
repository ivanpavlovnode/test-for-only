import React , {useState, useEffect, useRef, useMemo} from 'react';
//Импорт хука с контекстом
import { useAppContext } from '../AppBlock';
//Импорт интерфейсов
import {Card, Interval} from './../interfaces/Interfaces';
//Импорт всего для работы Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Mousewheel} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styled from 'styled-components';
import './SwiperButtons.css';

const EventsSwiper = () => {
  const {chosenInterval, intervals} = useAppContext();

  //Берем карточки для выбранного интервала
  const chosenCards: Card[] = useMemo(() => {
    //Предварительно сортируем, если данные не упорядочены
    const sortedIntervals: Interval[] = intervals?.sort((a, b) => a.intervalStart - b.intervalStart) ?? [];
    return sortedIntervals?.[chosenInterval]?.intervalCards ?? [];
  }, [intervals, chosenInterval]);

  //Код для анимации исчезания/появления свайпера
  const [animating, setAnimating] = useState<boolean>(false);
  const animationRef = useRef<boolean>(false);
  const animator = async() => {
    animationRef.current = false;
    setAnimating(false);
    await new Promise(resolve => setTimeout(resolve, 50));
    animationRef.current = true;
    setAnimating(true);
    const startTime: number  = Date.now();
    while(Date.now() < startTime + 500 && animationRef.current === true){
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    animationRef.current = false;
    setAnimating(false);
  }
  useEffect(() => { animator();}, [chosenInterval]);

  return (
    <SwiperWrapper>
      <Swiper
        modules={[Navigation, Pagination, Mousewheel]}
        style={{ 
          position: "relative",
          height: "100%",
          width: "84%",
          overflow: "hidden",
          top: 0,
          left: "5.5%",
          background: "none",
          margin: 0,
          //Анимация на основе состояния
          opacity: animating ? 0 : 1,
          transform: animating ? 'scale(0.95)' : 'scale(1)',
          transition: "opacity 0.25s ease , transform 0.25s ease",
          pointerEvents: animating ? "none" : "all",
        }}
        spaceBetween={20}
        slidesPerView={1.5}
        breakpoints={{
          768: {
            slidesPerView: 3,
            spaceBetween: 30,
          }
        }}
        navigation={{
          nextEl: '.custom-next-btn',
          prevEl: '.custom-prev-btn',
        }}
        centeredSlides={false}
        mousewheel={{ enabled: true }}
        watchOverflow={true}
      > 
        {/*Карточки событий*/}
        {chosenCards.map((card) => (
          <SwiperSlide 
            key={card. text}
            style={{ height: '100%', overflow: 'hidden'}}>
            <CardDate>{card.date}</CardDate>
            <CardText>{card.text}</CardText>

          </SwiperSlide>))}
      </Swiper>
      {/*Кастомные кнопки для свайпера*/}
      <button className="custom-prev-btn">&lt;</button>
      <button className="custom-next-btn">&gt;</button>
    </SwiperWrapper>
  );
};
export default EventsSwiper;
//Необходимо, чтобы вынести кнопки навигации наружу из Swiper 
const SwiperWrapper = styled.footer`
  display: block;
  position: absolute;
  top: 75%;
  height: 15%;
  width: 100%;
  background: none;
  @media screen and (max-width: 768px) {
    top: 53%;
    height: 34%;
    width: 100%;
  }
`;
const CardDate = styled.h2`
  top: 0;
  width: 100%;
  font-size: 1.2vw;
  font-family: 'BebasNeueRegular';
  font-weight: 300;
  color: #3877EE;
  @media screen and (max-width: 768px) {
    font-size: 6vw;
  }
`;
const CardText = styled.p`
  top: 25%;
  width: 100%;
  height: 50%;
  overflow: hidden;
  font-size: 1vw;
  font-family: 'PtSansRegular';
  color: #42567A;
  @media screen and (max-width: 768px) {
    top: 20%;
    font-size: 4vw;
  }
`;