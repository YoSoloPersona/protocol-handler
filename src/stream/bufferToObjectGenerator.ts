import { Transform } from 'stream';

/** Тип генераторной функции преобразования потока байт в объекты. */
type FuncGenerator<T> = (
    buffer: Buffer,
    ...parameters
) => Generator<T | Buffer, void, unknown>;

/**
 * Преоразует потока байт в неоходимые данные.
 * @param func генераторная функция для преобразования.
 */
export function bufferToObjectGenerator<T>(
    func: FuncGenerator<T>,
    ...params
): Transform {
    return new StreamBufferToObjectGenerator<T>(func, params);
}

/**
 * Класс. Преобразует поток байт в поток неоходимых данных.
 */
class StreamBufferToObjectGenerator<T> extends Transform {
    /**
     * Создаёт объект для преобразования потока байт в поток неоходимых данных.
     * @param _func генераторная функция для преобразования.
     */
    constructor(private _func: FuncGenerator<T>, ...parameters) {
        super({ objectMode: true, highWaterMark: 128 });

        this._parameters = parameters;
    }

    /**
     * Считывает очередной буффер и преобразует в необходимые данные.
     * @param buffer массив байт.
     * @param encoding кодировка.
     * @param cb функция обратного вызова для оповещения о завершении преоразовании данных.
     */
    _transform(buffer: Buffer, encoding, cb) {
        try {
            if (this._tail) {
                // Если остался хвост от предыдущей обработки
                buffer = Buffer.concat([this._tail, buffer]);
                delete this._tail;
            }

            for (const obj of this._func(buffer, ...this._parameters)) {
                if (obj instanceof Buffer) {
                    // Остался хвост после обработки
                    this._tail = obj;
                } else {
                    this.push(obj);
                }
            }
        } catch (err) {
            process.nextTick(cb, err);
        }

        process.nextTick(cb);
    }

    /**
     * Считывает оставшийся массив байт и преобразует в необходимые данные.
     * @param cb функция обратного вызова для оповещения о завершении преоразовании данных.
     */
    _flush(cb) {
        process.nextTick(cb);
    }

    /** Остатки необработанных данных из массива байт. */
    private _tail?: Buffer;

    /** Дополнительные параметры передаваемые для преобразования. */
    private _parameters: any[];
}
