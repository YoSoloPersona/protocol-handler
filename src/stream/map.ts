import { Transform } from 'stream';

/** Тип описывающий функцию преобразования типа T к Promise возвращающему тип U. */
type funcMapPromise<T, U> = (obj: T) => Promise<U>;

/** Тип описывающий функцию преобразования типа T к U. */
type funcMap<T, U> = (obj: T) => U;

/**
 * Функция преобразования потока с данными типа T в поток с данными типа U.
 * @param func функция преобразования.
 * @returns возвразает поток с данными типа U.
 */
export function map<T, U>(
    func: funcMap<T, U> | funcMapPromise<T, U>
): Transform {
    return new StreamMap<T, U>(func);
}

/** Класс для преобразования потока с данными типа T в поток с данными типа U. */
class StreamMap<T, U> extends Transform {
    /**
     * Создаёт объект для преобразования потока с данными типа T в поток с данными типа U.
     * @param _func функция преобразования.
     */
    constructor(private _func: funcMap<T, U> | funcMapPromise<T, U>) {
        super({ objectMode: true, highWaterMark: 16 });

        if (!_func || typeof _func !== 'function') {
            throw new Error(
                `Не удалось создать объект для преобразования потока с данными типа T в поток с данными типа U, так как не передана функция преобразования.`
            );
        }
    }

    /**
     * Считывает из входящего потока данные типа Т, преобразует в тип U и записывает в выходной поток.
     * @param obj данные из входящего потока типа Т.
     * @param encoding кодировка.
     * @param callback функция обратного вызова для оповещения о завершении преобразовании данных.
     */
    _transform(obj: T, encoding, callback): void {
        const result = this._func(obj);

        if (result instanceof Promise) {
            result
                .then((result) => {
                    this.push(result);
                    process.nextTick(callback);
                })
                .catch((err) => {
                    process.nextTick(callback(err));
                });
        } else {
            this.push(result);
            process.nextTick(callback);
        }
    }

    /**
     * Считывает остатки из входящего потока данные типа Т, преобразует в тип U и записывает в выходной поток.
     * @param callback функция обратного вызова для оповещения о завершении преобразовании данных.
     */
    _flush(callback): void {
        process.nextTick(callback);
    }
}
