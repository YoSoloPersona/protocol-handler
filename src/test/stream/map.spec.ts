import { promises } from 'fs';
import * as path from 'path';

// local
import { dirData } from '../config';
import { getFiles } from '../../stream/getFiles';
import { map } from '../../stream/map';

type u = {
    source: string;
    size: number;
}

const listData: u[] = [];
const ld = [
    { source: '..\\..\\..\\..\\spec\\test-files\\1.txt', size: 11 },
    { source: '..\\..\\..\\..\\spec\\test-files\\a\\1.bin', size: 0 }
  ]

describe('#map', () => {
    it(`Получение длин файлов в папке ${path.resolve(dirData)}`, (done) => {
        const stream = getFiles(dirData)
        .pipe(map<string, u>(async (source) => { 
            return {
                source: path.relative(__dirname, source),
                size: await (await promises.stat(source)).size
            };
        }))
        .on('readable', () => {
            let data: u;

            while (null != (data = stream.read())) {
                listData.push(data);
            }
        })
        .on('end', () => {
            expect(listData).toEqual(ld);
            done();
        })
        .on('error', err => {
            fail(err);
        })
    });
});