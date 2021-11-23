import { Transform } from 'stream';

type FuncBufferToData<T> = (data: Buffer) => T;

export function bufferToObject<T>(sizeBlock: number, func: FuncBufferToData<T>) {
    if (!sizeBlock) {
        throw new Error(`sizeBlock nust be more zero.`)
    }

    return new StreamBufferToData<T>(sizeBlock, func);
}

/**
 * Класс. Поток для преобразования двоичных данных в поток объектов.
 */
export class StreamBufferToData<T> extends Transform {
    /**
     * Конструктор. Инстанцирует поток для преобразования двоичных данных в поток объектов.
     * @param _sizeBlock размер двоичных данных содержащих описание одного объекта.
     * @param _func делегат для преобразования двоичных данных в объект.
     */
    constructor(private _sizeBlock: number, private _func: FuncBufferToData<T>) {
        super({ objectMode: true, highWaterMark: 16 });
    }

    /**
     * Преобразует массив байт в массив объектов.
     * @param chunk исходный массив байт.
     * @param encoding кодировка.
     * @param callback  функция обратного вызова вызываемая после завершения обработки исходного массива.
     */
    _transform(chunk: Buffer, encoding, callback) {
        try {
            if (this._tail) { // Если остался хвост байт от предыдущего массива, добавляем его перед текущим массивом байт
                chunk = Buffer.concat([this._tail, chunk], this._tail.length + chunk.length);
                this._tail = undefined;
            }

            for (let i = 0, start = 0, end = 0; end < chunk.length; i++) {
                start = i * this._sizeBlock;
                end = (start + this._sizeBlock >= chunk.length) ? // Хватает ли данных в конце массива до полного размера
                    chunk.length :
                    start + this._sizeBlock;

                let data = chunk.slice(start, end);
                if (data.length === this._sizeBlock) { // Если данных в конце массива не хватает
                    this.push(this._func(data));
                } else {
                    this._tail = data; // Сохраняем хвост
                }
            }
        }
        catch (err) { // Если в процессе обработки возникла ошибка, прекращаем преобразования и возвращаем ошибку
            callback(err);
        }

        process.nextTick(callback);
    }

    /**
     * Дообрабатывает остаточные данные.
     * @param callback функция обратного вызова вызываемая после обработки остаточных данных.
     */
    _flush(callback) {
        process.nextTick(callback);
    }

    private _tail: Buffer;
}