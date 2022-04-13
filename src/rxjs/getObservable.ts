import { Observable } from 'rxjs';
import { Readable } from 'stream';

/**
 * Преобразует поток для чтения (Readable) в наблюдаемый поток (Observable) c данными.
 * @param stream поток для чтения .
 * @returns возвращает наблюдаемый поток (Observable) с данными.
 */
export function getObservable<T>(stream: Readable): Observable<T> {
    return new Observable((subscriber) => {
        stream
            .on('readable', () => {
                let data: T | null;

                while (null != (data = stream.read())) {
                    subscriber.next(data);
                }
            })
            .on('end', () => {
                subscriber.complete();
            })
            .on('error', (err) => {
                subscriber.error(err);
            });
    });
}
