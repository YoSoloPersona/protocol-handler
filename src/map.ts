import { Transform } from 'stream';

type FuncMap<T, U> = (obj: T) => U;

type FuncMapPromise<T, U> = (obj: T) => Promise<U>;

export function map<T, U>(func: FuncMap<T, U> | FuncMapPromise<T, U>) {
    return new MapTransform<T, U>(func);
}

export class MapTransform<T, U> extends Transform {

    constructor(private _func: FuncMap<T, U> | FuncMapPromise<T, U>) {
        super({ objectMode: true, highWaterMark: 16 });
    }

    _transform(obj: T, encoding, callback): void {
        const result = this._func(obj);

        if (result instanceof Promise) {
            result
            .then(result => {
                this.push(result);
                process.nextTick(callback);
            })
            .catch(err => {
                process.nextTick(callback(err));
            });
        } else {
            this.push(result);
            process.nextTick(callback);
        }
    }

    _flush(callback): void {
        process.nextTick(callback);
    }
}