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
}