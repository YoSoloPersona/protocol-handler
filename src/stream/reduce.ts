import { Transform } from 'stream';

/** Тип функции для вычисления накопленного значения. */
type FuncReduce<T, U> = (accumulator: T, currentValue: U) => T;

/**
 * Функция для вычисления одного значения из потока, полученного из всех данных входного потока.
 * @param seed начальное значение.
 * @param func функция накопления.
 * @returns возвращает поток с накопленным знаением.
 */
export function reduce<T, U>(seed: T, func: FuncReduce<T, U>): Transform {
    return new StreamReduce<T, U>(seed, func);
}

/** Класс для вычисления итогового значения, полученного из всех данных входного потока. */
export class StreamReduce<T, U> extends Transform {
    /**
     * Создаёт объект для вычисления итогового значения, полученного из всех данных входного потока.
     * @param seed начальное значение.
     * @param _func функция вычисления итогового значения.
     */
    constructor(seed: T, private _func: FuncReduce<T, U>) {
        super({ objectMode: true });

        this._accumulator = seed;
    }

    /**
     * Считывает очередные данные из входного потока и вычисляет очередную итерацию итогового значения.
     * @param currentValue входящие данные.
     * @param encoding кодировка.
     * @param cb функция обратного вызова для оповещения о завершении обработки входящих данных.
     */
    _transform(currentValue: U, encoding, cb): void {
        try {
            this._accumulator = this._func(this._accumulator, currentValue);
            process.nextTick(cb);
        } catch (err) {
            cb(err);
        }
    }

    /**
     * Считывает остаточные данные из входного потока и вычисляет очередную итерацию итогового значения.
     * @param cb функция обратного вызова для оповещения о завершении обработки входящих данных.
     */
    _flush(cb) {
        this.push(this._accumulator);
        process.nextTick(cb);
    }

    /** Итоговое вычисляемое значение. */
    private _accumulator: T;
}
