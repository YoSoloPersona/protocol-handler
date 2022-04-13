// node
import * as fs from 'fs';

// local
import { map } from './map';

/**
 * Преобразует путь к файлу в поток с буферами содержимого файла.
 */
export function fileToStream() {
    return map<string, fs.ReadStream>(async (source) => {
        return fs.createReadStream(source);
    });
}