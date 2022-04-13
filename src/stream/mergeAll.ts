import { Readable, Transform } from 'stream';

/**
 * Функция для объединения потока потоков в один единый поток.
 * @returns возвращает единый объединённый поток.
 */
export function mergeAll() {
    return new StreamMergeAll();
}

/** Класс для объединения потока потоков в один единый поток. */
class StreamMergeAll extends Transform {
    /**
     * Создаёт для объединения потока потоков в один единый поток.
     */
    constructor() {
        super({ objectMode: true });
    }

    /**
     * Считывает из входящих потоков данные из записывает в выходной поток.
     * @param stream очередной поток для чтения.
     * @param encoding кодировка.
     * @param cb функция обратного вызова для оповещения о завершении преобразовании данных.
     */
    _transform(stream: Readable, encoding, cb): void {
        stream
            .on('readable', () => {
                let data;
                while (null != (data = stream.read())) {
                    this.push(data);
                }
            })
            .on('end', () => {
                cb();
            })
            .on('error', (err) => {
                cb(err);
            });
    }

    /**
     * Считывает остатки входящих потоков и данные из них записывает в выходной поток.
     * @param cb функция обратного вызова для оповещения о завершении преобразовании данных.
     */
    _flush(cb): void {
        process.nextTick(cb);
    }
}
