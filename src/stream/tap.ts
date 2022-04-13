import { map } from './map';

/** Тип описывающий функцию для выполнения побочных эффектов. */
type FuncTap<T> = (obj: T) => void;

/**
 * Функция для выполнения побочных эффектов.
 * @param func функция выполняющая побочные эффекты.
 * @returns возвращает 
 */
export function tap<T>(func: FuncTap<T>) {
    return map<T, T>((obj) => {
        func(obj);

        return obj;
    });
}