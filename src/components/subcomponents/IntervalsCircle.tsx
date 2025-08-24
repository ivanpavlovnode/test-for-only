import React , {useState, useEffect, useRef} from 'react';
import styled , { css } from 'styled-components';
import { useAppContext } from '../AppBlock';
//Импорт интерфейсов
import {Polar, Cartesian, Interval} from './../interfaces/Interfaces';

const IntervalsCircle = () => {
  const {chosenInterval, intervals, IntervalSwitcher} = useAppContext();

  //Ref для хранения массива useRef с координатами кнопок
  const buttonsCartesian = useRef<Cartesian[]>([]);
  const buttonsPolar = useRef<Polar[]>([]);
  //Локальные Ref для анимации
  const intervals_ref = useRef<Interval[]>([]);
  const chosen_interval = useRef<number>(0);
  const previous_interval = useRef<number>(0);
  //Чтобы по время анимации скрыть кнопку и название
  const [animating, setAnimating] = useState<boolean>(false);
  //Для отображения создаем состояние
  const [points, setPoints] = useState<Cartesian[]>([]);

  /* Логика работы на пальцах
    0. Все координаты хранятся в массивах и передаются в строчный стиль элементов
    1. Инициализируем массивы полярных и декартовых координат нулями с помощью initialPoints
    2. Распределяем точки по окружности в зависимости от их количества с помощью spreadPoint, 
        там же указываем радиус от родительского элемента в %
    3. С помощью movePoint можно сдвинуть на 1 градус все точки по окружности
    4. animate определяет направление движения и вызывает movePoints с паузами до достижения целового угла offset
    5. animate вызывается в useEffect при изменении chosenInterval, кнопки также вызывают централизованную функцию
        изменения IntervalSwitcher, а изменения потом приходят через Context
    5. profit! кнопки на нужных местах
   */
  //Функция для инициализации массивов нужным числом элементов нулями 
  const initialPoints = 
  (
    intervals_inner: Interval[],
    cartesian: React.RefObject<Cartesian[]>,
    polar: React.RefObject<Polar[]>,
  ) => {
    cartesian.current = intervals_inner.map(() => (
    {
      x: 0,
      y: 0
    }
  ));
    polar.current = intervals_inner.map(() => (
    {
      radius: 0,
      angle: 0
    }
  ));
  }
  //Функция для равномерного распределения точек по окружности
  //offset для начального поворота окружности по дизайну
  //percentRadius это радиус окружности от размера родительского элемента
  const spreadPoints = 
  (
    arr: React.RefObject<Polar[]>, 
    percentRadius: number
  ) => {
    const count: number = arr.current.length;
    const angleStep: number = 360 / count;
    const resultArr: Polar[] = arr.current.map((elem) => (
      {
        radius: percentRadius,
        angle: arr.current.indexOf(elem) * angleStep
      }
    ));
    arr.current = resultArr;
  }
  //Меняет углы в массиве полярных координат
  const movePoints = 
  (
    arr: React.RefObject<Polar[]>, 
    step: number
  ) => {
    const resultArr: Polar[] = arr.current.map((elem) => (
      {
        radius: elem.radius,
        angle: elem.angle + step
      }
    ));
    arr.current = resultArr;
  }
  //Функция преобразования полярных координат в декартовы
  const cartesianPoints = 
  (
    polar: React.RefObject<Polar[]>, 
    cartesian: React.RefObject<Cartesian[]>
  ) => {
    const resultArr: Cartesian[] = polar.current.map((elem) => {
      const rad = elem.angle/180 * Math.PI;
      const absc = Math.cos(rad) * elem.radius;
      const ord = Math.sin(rad) * elem.radius;
      return {x: absc, y: ord};
    });
    cartesian.current = resultArr;
  }
  // Функции для расчета промежутка между изменениями углов
  // Увеличивает интервал к концу для плавной остановки
  const stepDelay = (current: number, previous: number) => {
    const difference: number = Math.abs(current - previous);
    return 10 - (12 / 180) * difference;
  }
  //Функция для ожидания между изменениями
  async function wait(ms:number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  //Функция анимации перемещения кнопок
  const animate = async (target: React.RefObject<number>, polar: React.RefObject<Polar[]>, cartes: React.RefObject<Cartesian[]>, offset: number) => {
    //Костыль, чтобы выполнилась первая анимация и кнопки появились
    //Если все не успеет инициализироваться, то кнопки появятся при первой смене интервала
    if(intervals_ref.current.length === 0) {await wait(200)};
    if(intervals_ref.current.length === 0) return;
    const initialTarget: number = target.current;
    if(polar.current[target.current].angle === offset) return;
    setAnimating(true);
    while(initialTarget === target.current && polar.current[target.current].angle !== offset){
      const direction = polar.current[target.current].angle > offset ? -1 : 1;
      movePoints(polar, direction);
      cartesianPoints(polar, cartes);
      setPoints(cartes.current);
      if(polar.current[target.current].angle === offset) break;
      await wait(stepDelay(polar.current[target.current].angle, offset));
    }
    setAnimating(false);
  }
  //При изменении массива интервалов выполняем ре-инициализацию
  useEffect(() => {
    intervals_ref.current = intervals;
    initialPoints(intervals, buttonsCartesian, buttonsPolar);
    spreadPoints(buttonsPolar, 50);
  }, [intervals]);

  //При изменении внешнего chosenInterval обновляем локальный
  useEffect(() => {
    previous_interval.current = chosen_interval.current;
    chosen_interval.current = chosenInterval;
    animate(chosen_interval, buttonsPolar, buttonsCartesian, -60);
  }, [chosenInterval]);

  const logger = () => {console.log('кнопочка нажалась');}



    return (
    <CircleWrapper>
      {intervals.length !== 0 && points.length !== 0 &&
      intervals.map((elem, index) => 
      <CircleButton 
        $active = {index === chosenInterval}
        $animating = {animating}
        key = {index}
        style = {{
          top: `${points[index].y + 50}%`,
          left: `${points[index].x + 50}%`
        }}
        onClick={() => IntervalSwitcher(index)}>{index + 1} <p>{elem.intervalName}</p></CircleButton>)}
    </CircleWrapper>
    )

}
export default IntervalsCircle;

const CircleWrapper = styled.div`
  z-index: 0;
  aspect-ratio: 1/1;
  background: none;
  border-radius: 100%;
  border-style: solid;
  border-color: rgba(14, 19, 27, 0.1);
  border-width: 0.1vw;
  top: 16%;
  left: 31%;
  height: auto;
  width: 36%;
`;
const CircleButton = styled.button<{ $active?: boolean , $animating?: boolean}>`
  position: absolute;
  aspect-ratio: 1/1;
  width: 1.5%;
  height: auto;
  color:#42567A;
  background-color: #42567A;
  border-radius: 100%;
  text-align: center;
  font-size: 0.2vw;
  font-family: 'PtSansRegular';
  transform: translate(-50%, -50%);
  transform-origin: center;
  transition: transform 0.4s ease, background-color 0.4s ease, width 0.4s ease, font-size 0.4s ease;
  p{
    display: none;
  }
  &:hover{
    font-size: 1.2vw;
    width: 12%;
    background-color: #F4F5F9;
    transform: translate(-50%, -50%);
    &::before{
      content: '';
      position: absolute;
      display: initial;
      aspect-ratio: 1/1;
      width: 98%;
      height: 98%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 100%;
      border-style: solid;
      border-color: rgba(48, 62, 88, 0.5);
      border-width: 0.1vw;
    }
    p{
      display: initial;
      font-size: 1.2vw;
      font-family: 'PtSansBold';
      left: 130%;
    }
  }
  ${props => props.$active === true && css`
    font-size: 1.2vw;
    width: 12%;
    background-color: #F4F5F9;
    transform: translate(-50%, -50%);
    &::before{
      content: '';
      position: absolute;
      display: initial;
      aspect-ratio: 1/1;
      width: 98%;
      height: 98%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 100%;
      border-style: solid;
      border-color: rgba(48, 62, 88, 0.5);
      border-width: 0.1vw;
    }
    p{
      display: ${props.$animating ? 'none' : 'initial'};
      font-size: 1.2vw;
      font-family: 'PtSansBold';
      left: 130%;
    }
  `}
`;