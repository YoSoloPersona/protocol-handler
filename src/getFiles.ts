import { promises } from 'fs';
import { Readable } from 'stream';
import path = require('path');

async function *gen(rootDir: string, listExt?: string[]) {
    let listChild = await promises.readdir(rootDir);

    for (let child of listChild) {
        let childdDir = path.join(rootDir, child);
        let stat = await promises.stat(childdDir);

        //Если нашли файл с необходимым расширением
        if (stat.isFile() 
        && (!listExt || listExt.find(ext => path.extname(child).toLowerCase() === ext.toLowerCase()) != undefined)) {
            yield childdDir;
        }

        //Вложенная директория
        else if (stat.isDirectory()) {
            yield * gen(childdDir, listExt);
        }
    }
}

export function getFiles(dir: string, listExt?: string[]) {
    return Readable.from(gen(dir,listExt));
}