//Карточки которые будут отображаться в свайпере
export interface Card{
    date: number;
    text: string;
}
  //Объект для хранения конкретного временного интервала 
  // и связанных с ним карточек вместе
export interface Interval {
    intervalName: string;
    intervalStart: number;
    intervalEnd: number;
    intervalCards: Card[];
}

export interface IntervalContext {
    chosenInterval: number;
    intervals: Interval[];
    setChosenInterval: React.Dispatch<React.SetStateAction<number>>;
    IntervalSwitcher: (action: string | number) => void;
}

//Интерфейс для декартовых координат 
export interface Cartesian{
    x: number;
    y: number;
}
//Интерйфейс для полярных координат
export interface Polar{
    radius: number;
    angle: number;
}