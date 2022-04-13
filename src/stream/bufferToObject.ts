import { Readable, Transform } from 'stream';

type FuncBufferToObject<T> = (buffer: Buffer) => T;

/**
 * Преобразует поток байт в поток данных необходмого типа.
 * @param sizeObject размер порции байт для получения одних данных необходимого типа.
 * @param func функция преобразования.
 */
export function bufferToObject<T>(sizeObject: number, func: FuncBufferToObject<T>): Readable {
    return new StreamBufferToObject(sizeObject, func);
}

/**
 * Класс. Поток для преобразования потока байт в поток данных необходмого типа.
 */
class StreamBufferToObject<T> extends Transform {
    /**
     * Создаёт поток для преобразования потока байт в поток данных необходмого типа.
     * @param _sizeBlock размер порции байт для получения одних данных необходимого типа.
     * @param _func функция преобразования.
     */
    constructor(private _sizeBlock: number, private _func: FuncBufferToObject<T>) {
        super({ objectMode: true, highWaterMark: 16 });

        if (this._sizeBlock) {
            throw new Error(`_sizeBlock must be > 0.`);
        }
    }

    /**
     * Считывает очередной буффер и преобразует в необходимые данные.
     * @param chunk исходный массив байт.
     * @param encoding кодировка.
     * @param cb функция обратного вызова для оповещения о завершении преоразовании данных.
     */
    _transform(chunk: Buffer, encoding, cb) {
        try {
            if (this._tail) { // Если остался хвост байт от предыдущего массива, добавляем его перед текущим массивом байт
                chunk = Buffer.concat([this._tail, chunk], this._tail.byteLength + chunk.byteLength);
                delete this._tail;
            }

            for (let i = 0, start = 0, end = 0; end < chunk.byteLength; i++) {
                start = i * this._sizeBlock;
                end = (start + this._sizeBlock >= chunk.byteLength) ? // Хватает ли данных в конце массива до полного размера
                    chunk.byteLength :
                    start + this._sizeBlock;

                const data = chunk.slice(start, end);
                if (data.byteLength === this._sizeBlock) { // Если данных в конце массива не хватает
                    this.push(this._func(data));
                } else {
                    this._tail = data; // Сохраняем хвост
                }
            }
        }
        catch (err) { // Если в процессе обработки возникла ошибка, прекращаем преобразования и возвращаем ошибку
            process.nextTick(cb, err);
        }

        process.nextTick(cb);
    }

    /**
     * Дообрабатывает остаточные данные.
     * @param cb функция обратного вызова для оповещения о завершении преоразовании данных.
     */
    _flush(cb) {
        process.nextTick(cb);
    }

    /** Остатки необработанных данных из массива байт. */
    private _tail?: Buffer;
}