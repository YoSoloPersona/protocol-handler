import { promises } from 'fs';
import { Readable } from 'stream';
import * as path from 'path';

/**
 * Ищет необходимые файлы по указанному шаблону в указанной папке.
 * @param rootDir папка в которой ищутся необходимые папки.
 * @param recursive необходимость поиска в подпапках.
 * @param re регулярное выражение для поиска папок.
 */
async function* gen(rootDir: string, recursive = true, re?: RegExp) {
    for (const child of await promises.readdir(rootDir)) {
        const childdDir = path.resolve(rootDir, child);
        const stat = await promises.stat(childdDir);

        // Если нашли файл с необходимым расширением
        if (stat.isFile() && (!re || re.test(child))) {
            yield childdDir;
        }

        // Вложенная директория
        else if (recursive && stat.isDirectory()) {
            yield* gen(childdDir, recursive, re);
        }
    }
}

/**
 * Ищет необходимые файлы в указанной директории.
 * @param dir папка в которой ищутся необходимые папки.
 * @param recursive необходимость поиска в подпапках.
 * @param re регулярное выражение для поиска папок.
 * @returns возвращает поток для чтения с найденными путями к файлам.
 */
export function getFiles(dir: string, recursive = true, re?: RegExp): Readable {
    return Readable.from(gen(dir, recursive, re));
}
