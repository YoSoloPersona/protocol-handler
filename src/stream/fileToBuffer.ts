// node
import { promises } from 'fs';
import { Transform } from 'stream';

// local
import { map } from './map';

/**
 * Преобразует путь к файлу в массив байтов считанными из него.
 */
export function fileToBuffer(): Transform {
    return map<string, Buffer>(async (path) => {
        return promises.readFile(path);
    });
}
