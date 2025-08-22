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
  //useRef для анимаций
  const chosen_interval = useRef(0);
  const previous_interval = useRef<number>(0);
  const intervals_ref = useRef<Interval[]>([]);
  const start_date = useRef<number>(0);
  const end_date = useRef<number>(0);
  //Состояние для хранения текущего выбранного интервала
  const [chosenInterval, setChosenInterval] = useState<number>(0);
  //Для корректной работы анимаций нужен useRef
  //Массив объектов временнЫх интервалов
  const [intervals, setIntervals] = useState<Interval[]>([]);
  //Состояния для отображения текущих дат 
  const[startDate, setStartDate] = useState(0);
  const[endDate, setEndDate] = useState(0);

  // Функции для расчета промежутка между изменениями дат
  const stepDelay = (current: number, previous: number) => {
    const difference: number = Math.abs(current - previous);
    if (difference === 0) return 0;
    return 200 / difference;
  }
  //Функция для ожидания между изменениями
  async function wait(ms:number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  //Функция для плавного изменения дат и вывода в setState
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

  //Эффект для инициализации интервалов, имитирует общение с API
  useEffect(() => {
    intervals_ref.current = SixIntervals;
    setIntervals(SixIntervals);
      setStartDate(SixIntervals?.[0]?.intervalStart ?? 404);
      setEndDate(SixIntervals?.[0]?.intervalEnd ?? 404);
      start_date.current =  SixIntervals?.[0]?.intervalStart ?? 404;
      end_date.current =  SixIntervals?.[0]?.intervalEnd ?? 404;
  }, []);

  // Фукнция переключения интервала для кнопок
  // Она же записывает номер предыдущего интервала
  const IntervalSwitcher = async(action: string | number) => {
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
  return(
    <AppContext.Provider value={{chosenInterval, intervals, setChosenInterval}}>
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
  }
`;