import React, {useState, useRef, useMemo, useEffect, createContext, useContext} from 'react';
import ReactDOM from 'react-dom/client';
import styled from 'styled-components';
//Дочерние компоненты
import EventsSwiper from './subcomponents/EventsSwiper';
import IntervalsCircle from './subcomponents/IntervalsCircle';
//Затычки вместо данных
import {TwoIntervals, FourIntervals, SixIntervals} from './subcomponents/ArtificialData';
//Импорт интерфейсов
import {Card, Interval, IntervalContext} from './interfaces/Interfaces';
//Хук для определения размера экрана при условном рендеринге
import useDeviceType from './hooks/useDeviceType';
//Контекст для использования в компонентах
export const AppContext = createContext<IntervalContext | undefined>(undefined);
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within Provider');
  }
  return context;
};

function AppBlock() {
  //Для хранения типа верстки, присваивается через хук useDeviceType перед return
  const isMobile = useRef<boolean>(false);
  //useRef для анимаций
  const chosen_interval = useRef(0);
  const previous_interval = useRef<number>(0);
  const intervals_ref = useRef<Interval[]>([]);
  const start_date = useRef<number>(0);
  const end_date = useRef<number>(0);
  //Состояние для хранения текущего выбранного интервала
  const [chosenInterval, setChosenInterval] = useState<number>(0);
  //Массив объектов временнЫх интервалов
  const [intervals, setIntervals] = useState<Interval[]>([]);
  //Состояния для отображения текущих дат 
  const[startDate, setStartDate] = useState(0);
  const[endDate, setEndDate] = useState(0);

  // Функции для расчета промежутка между изменениями дат
  // Увеличивает интервал к концу для плавной остановки
  const stepDelay = (current: number, previous: number) => {
    const difference: number = Math.abs(current - previous);
    if (difference === 0) return 0;
    return 200 / difference;
  }
  //Функция для ожидания между изменениями
  async function wait(ms:number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  // Функция для плавного изменения дат и вывода в setState
  // Вычисления происходят в useRef'ax, в useState присваиваются после выполнения
  const animate = async(
    startInterval:number, 
    target: number,
    valueRef: React.RefObject<number>,
    valueState: React.Dispatch<React.SetStateAction<number>>) => {
    if(startInterval !== chosen_interval.current) return;
    if(valueRef.current === target) return;
    const direction = valueRef.current > target ? -1 : 1;
    while(startInterval === chosen_interval.current && valueRef.current !== target){
      if(startInterval !== chosen_interval.current) break;
      if(valueRef.current === target) break;
      await wait(stepDelay(valueRef.current, target));
      valueRef.current += direction;
      valueState(valueRef.current);
    }
    valueRef.current = target;
  }
  //Функция для вызова двух независимых анимаций
  const animationCaller = () => {
    animate(
      chosen_interval.current, 
      intervals_ref.current?.[chosen_interval.current]?.intervalStart ?? 1, 
      start_date,
      setStartDate);
    animate(
      chosen_interval.current, 
      intervals_ref.current?.[chosen_interval.current]?.intervalEnd ?? 1, 
      end_date,
      setEndDate);
  }





  //Функция инициализации приложения
  const initializeApp = (intervals: Interval[]) => {
    intervals_ref.current = intervals;
    setIntervals(intervals);
      setStartDate(intervals?.[0]?.intervalStart ?? 404);
      setEndDate(intervals?.[0]?.intervalEnd ?? 404);
      start_date.current =  intervals?.[0]?.intervalStart ?? 404;
      end_date.current =  intervals?.[0]?.intervalEnd ?? 404;
  }
  // Эффект для инициализации интервалов, имитирует общение с API
  // есть также FourIntervals и TwoIntervals для теста
  useEffect(() => {
    initializeApp(SixIntervals);
  }, []);








  // Фукнция переключения интервала для кнопок
  // Она же записывает номер предыдущего интервала
  const IntervalSwitcher = (action: string | number) => {
    if(action === 'minus' && chosen_interval.current > 0){
      previous_interval.current = chosen_interval.current;
      chosen_interval.current -= 1;
      setChosenInterval(chosen_interval.current);
      animationCaller();
    }
    else if(action === 'plus' && chosen_interval.current < (intervals_ref.current.length - 1 )){
      previous_interval.current = chosen_interval.current;
      chosen_interval.current += 1;
      setChosenInterval(chosen_interval.current);
      animationCaller();
    }
    // Если даем в функцию число, то это ЧИСЛО 
    // ДОЛЖНО БЫТЬ КОРРЕКТНЫМ ИНДЕКСОМ МАССИВА
    // Но проверку добавил
    else if(typeof action === 'number'){
      if(action > (intervals_ref.current.length - 1)) return;
      previous_interval.current = chosen_interval.current;
      chosen_interval.current = action;
      setChosenInterval(action);
      animationCaller();
    }
    else return;
  };

  // Код для анимации исчезания/появления полосы и имени интервала в мобильной верстке
  // Дублировал из EventsSwiper, так как зависимость chosenInterval есть здесь, проще повторить
  // Чем передавать в контекст эффект, работающий на состоянии из этого элемента
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

  //Для условного рендеринга
  isMobile.current = useDeviceType();
  //Десктопная верстка
  if(!isMobile.current){
    return(
      <AppContext.Provider value={{chosenInterval, intervals, setChosenInterval, IntervalSwitcher}}>
        <FullscreenBlock>
          <App>
            <Header>
              <HeaderStripe></HeaderStripe>
              <h1>Исторические <br/> даты</h1>
            </Header>
            <DateInterval>
              <p style={{color:'rgba(93, 95, 239, 1)'}}>{startDate}</p>
              <p style={{color:'rgba(239, 93, 168, 1)'}}>{endDate}</p>
            </DateInterval>
            <AdditionalButtons>
              <p>0{chosen_interval.current + 1}/0{intervals_ref.current.length}</p>
              <button 
                style={{bottom:'0', left: '0'}}
                onClick = {() => {IntervalSwitcher('minus')}}
              >&lt;</button>
              <button 
                style={{bottom:'0', right: '0'}}
                onClick = {() => {IntervalSwitcher('plus')}}
              >&gt;</button>
            </AdditionalButtons>
            <EventsSwiper></EventsSwiper>
            <IntervalsCircle></IntervalsCircle>
          </App>
        </FullscreenBlock>
      </AppContext.Provider>
    );
  }
  //Мобильная верстка
  else if(isMobile.current){
    return(
      <AppContext.Provider value={{chosenInterval, intervals, setChosenInterval, IntervalSwitcher}}>
        <MobileBlock>
          <Header style={{left: '3%'}}>
              <h1 style={{color:'#42567A', fontSize: '7vw'}}>Исторические <br/> даты</h1>
            </Header>
          {/* Две больших цветных даты*/}
          <DateInterval
            style = {{
              width: '80%',
              top: '29%'
            }}>
              <p style={{color:'#3877EE', fontSize: '16vw'}}>{startDate}</p>
              <p style={{color:'#F178B6', fontSize: '16vw'}}>{endDate}</p>
            </DateInterval>
            {/* Название интервала над свайпером*/}
            <IntervalName
              style = {{
                //Анимация на основе состояния
                opacity: animating ? 0 : 1,
                transform: animating ? 'scale(0.95)' : 'scale(1)',
                transition: "opacity 0.25s ease , transform 0.25s ease",
                pointerEvents: animating ? "none" : "all",
              }}
            >{intervals[chosenInterval].intervalName}</IntervalName>
            {/* Серая полоска*/}
            <MobileStripe
              style = {{
                //Анимация на основе состояния
                opacity: animating ? 0 : 1,
                transform: animating ? 'scale(0.95)' : 'scale(1)',
                transition: "opacity 0.25s ease , transform 0.25s ease",
                pointerEvents: animating ? "none" : "all",
              }}
            ></MobileStripe>
            {/* Свайпер */}
            <EventsSwiper></EventsSwiper>
            {/* Кнопки навигации */}
            <AdditionalButtons
              style = {{
              width: '20%',
              top: '88%',
              zIndex: 10
            }}>
              <p>0{chosen_interval.current + 1}/0{intervals_ref.current.length}</p>
              <button 
                style={{bottom:'0', left: '0'}}
                onClick = {() => {IntervalSwitcher('minus')}}
              >
                <svg width="10" height="10" viewBox="0 0 6 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.7489 1.04178L1.6239 4.16678L4.7489 7.29178" stroke="#42567A" stroke-width="2"/>
                </svg>
              </button>
              <button 
                style={{bottom:'0', right: '0'}}
                onClick = {() => {IntervalSwitcher('plus')}}
              >
                <svg width="10" height="10" viewBox="0 0 7 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.58386 1.04178L4.70886 4.16678L1.58386 7.29178" stroke="#42567A" stroke-width="2"/>
                </svg>
              </button>
            </AdditionalButtons>
        </MobileBlock>
      </AppContext.Provider>
    )
  }
  else return (<FullscreenBlock/>)

}

export default AppBlock;
/*Элемент, который занимает весь экран, чтобы в нем 
позиционировать основной блок */
const FullscreenBlock = styled.div`
  display: block;
  position: relative;
  width: 100vw;
  height: 100vh;
  min-height: 800px;
  background: repeating-linear-gradient(
    90deg,
    #F4F5F9,
    #F4F5F9 4.05%,
    #F4F5F9 4%,
    #F6C4C7 4.166%
  );
  overflow: scroll;
  &::-webkit-scrollbar{
    display: none;
  }
`;
// Блок на весь экран для мобилок, без фона и скролла
const MobileBlock = styled.div`
  display: block;
  position: relative;
  width: 100vw;
  height: 93vh;
  background-color: #ffffff;
  overflow: hidden;
  min-height: 800px;
`;
/* красивый альтернативный вариант!!!
  const FullscreenBlock = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: scroll;
  //&::-webkit-scrollbar{
  //  display: none;
  //}
  background: repeating-linear-gradient(
    90deg,
    #F4F5F9,
    transparent 4.05%,
    #F4F5F9 4%,
    #F6C4C7 4.166%
  );
  display: block;
`; */

const App = styled.div`
  position: absolute;
  display: block;
  top: 50%;
  transform: translateY(-50%);
  left: 16.6%;
  aspect-ratio: 4.4/ 3;
  width: 76%;
  height: auto;
  background: none;
  overflow: hidden;
  //Добавляем тонкую серую полоску через псевдоэлемент
  &::before{
    position: absolute;
    content: '';
    display: block;
    height: 0.07vw;
    width: 98.5%;
    background-color: rgba(66, 86, 122, 0.1);
    left: 0;
    top: 42.5%;
  }
`;
//Блок с заголовком и градиентной полоской
const Header = styled.header`
  height: 13%;
  width: 35%;
  top: 12%;
  //Заголовок
  h1 {
    left: 16%;
    font-size: 2.8vw;
    color:#42567A;
    line-height: 1.1;
  }
`;
//Градиентная полоска
const HeaderStripe = styled.div`
  width: 0.3vw;
  height: 100%;
  background: linear-gradient(#3877EE, #EF5DA8);
  border-radius: 0;
`;
//Большие цифры с годами, разный цвет задан строчно
const DateInterval = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  left: 48%;
  transform: translateX(-50%);
  top: 30%;
  width: 67%;
  p{
    position: relative;
    font-size: 10vw;
  }
`;
//Блок с номером интервала и кнопками
const AdditionalButtons = styled.div`
  top: 62%;
  left: 5.5%;
  width: 8.33%;
  height: 9%;
  @media screen and (max-width: 768px) {
      height: 15vw;
  }
  //Номер текущего интервала
  p{
    top: 0;
    left: 0;
    font-family: "PtSansRegular";
    font-size: 0.8vw;
    color: rgba(66, 86, 122, 0.8);
    @media screen and (max-width: 768px) {
      font-size: 5vw;
    }
    
  }
  //Маленькие круглые кнопки переключения интервала
  button{
    display: block;
    aspect-ratio: 1/ 1;
    width: 40%;
    border-style: solid;
    border-color: rgba(52, 53, 58, 0.5);
    border-width: 0.08vw;
    border-radius: 100%;
    font-family: 'Consolas', 'Roboto Mono', 'Courier New', monospace;
    font-weight: 400;
    font-size: 1.5vw;
    line-height: 1;
    color: rgba(23, 31, 44, 0.6);
    &:hover{
      background-color: #ffffff;
      color: rgba(23, 31, 44, 0.6);
    }
    &:active{
      background-color: #ffffff;
      color: rgba(23, 31, 44, 0.6);
    }
    @media screen and (max-width: 768px) {
      border-width: 0.3vw;
      font-family: 'Consolas', 'Roboto Mono', 'Courier New', monospace;
      font-weight: 700;
      font-size: 4vw;
    }
  }
  svg{
    transform: translate(-50%, -50%);
    top: 50%;
    left:50%;
  }
`;
const IntervalName = styled.h2`
  top: 44%;
  left: 7%;
  font-family: "PtSansBold";
  font-size: 5vw;
  color: rgba(38, 48, 68, 0.8);
`;
const MobileStripe = styled.div`
    position: absolute;
    display: block;
    height: 0.2vh;
    width: 85%;
    background-color: #C7CDD9;
    left: 7.5%;
    top: 50%;
`;