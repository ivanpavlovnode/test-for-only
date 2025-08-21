import React, {useState, useRef, useMemo, useEffect, createContext, useContext} from 'react';
import ReactDOM from 'react-dom/client';
import styled from 'styled-components';
//Дочерние компоненты
import EventsSwiper from './subcomponents/EventsSwiper';
import IntervalsCircle from './subcomponents/EventsSwiper';
//Затычка вместо данных
import {TwoIntervals, SixIntervals} from './subcomponents/ArtificialData';
//Импорт интерфейсов
import {Card, Interval, IntervalContext} from './interfaces/Interfaces';
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
  //Состояние для хранения текущего выбранного интервала
  const [chosenInterval, setChosenInterval] = useState<number>(0);
  //Для корректной работы анимаций нужен useRef
  
  //Вспомогательное состояние для хранения номера предыдущего интервала
  const previousInterval = useRef<number>(0);
  //Массив объектов временнЫх интервалов
  const [intervals, setIntervals] = useState<Interval[]>([]);

  // Вспомогательные переменные для анимации дат 
  // внутри styled DateInterval
  const startDate = useRef<number>(0);
  const endDate = useRef<number>(0);
  const [before, callUpdate] = useState(0);

  // Функции для анимации и эффект для вызова
  const stepDelay = (current: number, previous: number) => {
    const difference: number = Math.abs(current - previous);
    if (difference === 0) return 0;
    return 200 / difference;
  }
  async function wait(ms:number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  const animate = async(
    startInterval:number, 
    target: number,
    valueRef: React.RefObject<number>) => {
    if(startInterval !== chosenInterval) return;
    if(valueRef.current === target) return;
    const direction = valueRef.current > target ? -1 : 1;
    while(startInterval === chosenInterval && valueRef.current !== target){
      if(startInterval !== chosenInterval) break;
      if(valueRef.current === target) break;
      await wait(stepDelay(valueRef.current, target));
      callUpdate(before + 1);
      valueRef.current += direction;
    }
    valueRef.current = target;
    callUpdate(before + 1);
  }
  
  useEffect(() => {
    animate(
      chosenInterval, 
      intervals?.[chosenInterval]?.intervalStart ?? 1, 
      startDate);
    animate(
      chosenInterval, 
      intervals?.[chosenInterval]?.intervalEnd ?? 1, 
      endDate);
    }, [chosenInterval]);

  //Эффект для инициализации интервалов, имитирует общение с API
  useEffect(() => {
    setIntervals(SixIntervals);
      startDate.current =  SixIntervals?.[0]?.intervalStart ?? 404;
      endDate.current =  SixIntervals?.[0]?.intervalEnd ?? 404;
  }, []);


  // Фукнция переключения интервала для кнопок
  // Она же записывает номер предыдущего интервала
  const IntervalSwitcher = async(action: string | number) => {
    if(action === 'minus' && chosenInterval > 0){
      previousInterval.current = chosenInterval;
      setChosenInterval(chosenInterval - 1);
    }
    else if(action === 'plus' && chosenInterval < (intervals.length - 1 )){
      previousInterval.current = chosenInterval;
      setChosenInterval(chosenInterval + 1);
    }
    // Если даем в функцию число, то это ЧИСЛО 
    // ДОЛЖНО БЫТЬ КОРРЕКТНЫМ ИНДЕКСОМ МАССИВА
    // Но проверку добавил
    else if(typeof action === 'number'){
      if(action > (intervals.length - 1)) return;
      previousInterval.current = chosenInterval;
      setChosenInterval(action);
    }
    else return;
  };
  return(
    <AppContext.Provider value={{chosenInterval, intervals, setChosenInterval}}>
      <FullscreenBlock>
        <App>
          <Header>
            <HeaderStripe></HeaderStripe>
            <h1>Исторические <br/> даты</h1>
          </Header>
          <DateInterval>
            <p style={{color:'rgba(93, 95, 239, 1)'}}>{startDate.current}</p>
            <p style={{color:'rgba(239, 93, 168, 1)'}}>{endDate.current}</p>
          </DateInterval>
          <AdditionalButtons>
            <p>0{chosenInterval + 1}/0{intervals.length}</p>
            <button 
              style={{bottom:'0', left: '0'}}
              onClick = {() => {IntervalSwitcher('minus')}}
            >&lt;</button>
            <button 
              style={{bottom:'0', right: '0'}}
              onClick = {() => {IntervalSwitcher('plus')}}
            >&gt;</button>
          </AdditionalButtons>
          <EventsSwiper/>
        </App>
      </FullscreenBlock>
    </AppContext.Provider>
  );
}

export default AppBlock;
/*Элемент, который занимает весь экран, чтобы в нем 
позиционировать переиспользуемый блок*/
const FullscreenBlock = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  min-height: 800px;
  overflow: scroll;
  &::-webkit-scrollbar{
    display: none;
  }
  background: repeating-linear-gradient(
    90deg,
    #F4F5F9,
    #F4F5F9 4.05%,
    #F4F5F9 4%,
    #F6C4C7 4.166%
  );
  display: block;
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
  left: 16.7%;
  aspect-ratio: 4.4/ 3;
  width: 76%;
  height: auto;
  background: none;
  overflow: hidden;
  @media (max-width: 768px) {
    
  }
`;
//Блок с заголовком и градиентной полоской
const Header = styled.header`
  height: 13%;
  width: 28%;
  top: 12%;
  //Заголовок
  h1 {
    right: 0;
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
  //Номер текущего интервала
  p{
    top: 0;
    left: 0;
    font-family: "PtSansRegular";
    font-size: 0.8vw;
    color: rgba(66, 86, 122, 0.8);
    
  }
  //Маленькие круглые кнопки переключения интервала
  button{
    display: block;
    aspect-ratio: 1/ 1;
    width: 40%;
    border-style: solid;
    border-color: rgba(153, 159, 172, 0.5);
    border-width: 0.1vw;
    border-radius: 100%;
    font-family: 'Consolas', 'Roboto Mono', 'Courier New', monospace;
    font-weight: 400;
    font-size: 1.5vw;
    line-height: 1;
    color: rgba(66, 86, 122, 0.6);
    &:hover{
      background-color: #e9e9e9;
      color: rgba(66, 86, 122, 1);
    }
    &:active{
      background-color: #c9c8c8;
      color: #000000;
    }
  }
`;