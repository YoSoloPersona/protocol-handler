import { promises } from 'fs';
import { Readable } from 'stream';
import * as path from 'path';

/**
 * Ищет папки по указанному шаблону в указанной папке.
 * @param parentDir путь к папке в которой ищутся папки.
 * @param recursive необхоимость поиска в подпапках.
 * @param re регулярное выражение для поиска необходимых папок.
 */
async function* gen(parentDir: string, recursive = true, re: RegExp) {
    const listChild = await promises.readdir(parentDir);

    for (const child of listChild) {
        const childFull = path.join(parentDir, child);
        const stat = await promises.stat(childFull);

        // Вложенная директория
        if (recursive && stat.isDirectory()) {
            yield* gen(childFull, recursive, re);
        }

        if (stat.isDirectory() && (!re || re.test(child))) {
            yield childFull;
        }
    }
}

/**
 * Ищет папки по указанному шаблону в указанной папке.
 * @param parentDir путь к папке в которой ищутся папки.
 * @param recursive необхоимость поиска в подпапках.
 * @param re регулярное выражение для поиска необходимых папок.
 * @returns возвращает поток для чтения с найденными путями к папкам.
 */
export function getDirectories(parentDir: string, recursive = true, re?: RegExp): Readable {
    return Readable.from(gen(parentDir, recursive, re));
}