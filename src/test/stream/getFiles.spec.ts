import { getFiles } from '../../stream/getFiles';
import * as path from 'path';
import * as debug from 'debug';

const log = debug('test:getFiles');
const dir = './test-files';
const dirFail = './dir-fail';

describe('#getFiles', () => {
    it(`Получение всех файлов в указанной папке ${path.resolve(dir)} и во всех подпапках.`, (done) => {
        let countFiles = 0;

        const stream = getFiles(dir)
        .on('readable', () => {
            let data;

            while (null != (data = stream.read())) {
                countFiles++;
                log(`stream readable: ${data}`);
            }
        })
        .on('end', () => {
            log(`stream end`);
            expect(countFiles).toBe(2);
            done();
        })
        .on('error', err => {
            log(`stream error: ${err}`);
            fail(err);
        });
    });

    it(`Получение всех файлов в указанной папке ${path.resolve(dir)}, исключая подпапки.`, (done) => {
        let countFiles = 0;

        const stream = getFiles(dir, false)
        .on('readable', () => {
            let data;

            while (null != (data = stream.read())) {
                countFiles++;
                log(`stream readable: ${data}`);
            }
        })
        .on('end', () => {
            log(`stream end`);
            expect(countFiles).toBe(1);
            done();
        })
        .on('error', err => {
            log(`stream error: ${err}`);
            fail(err);
        });
    });

    it(`Получение *.txt файлов из указанной папки ${path.resolve(dir)}.`, (done) => {
        let countFiles = 0;

        const stream = getFiles(dir, true, /\w+\.txt/)
        .on('readable', () => {
            let data;

            while (null != (data = stream.read())) {
                countFiles++;
                log(`stream readable: ${data}`);
            }
        })
        .on('end', () => {
            log(`stream end`);
            expect(countFiles).toBe(1);
            done();
        })
        .on('error', err => {
            log(`stream error: ${err}`);
            fail(err);
        });
    });

    it(`Получение всех файлов из несуществующей папки ${dirFail}.`, (done) => {
        let countFiles = 0;

        const stream = getFiles(dirFail)
        .on('readable', () => {
            let data;

            while (null != (data = stream.read())) {
                countFiles++;
                log(`stream readable: ${data}`);
            }
        })
        .on('end', () => {
            log(`stream end`);
            fail(`Удалось получить файлы из несуществующей папки.`);
        })
        .on('error', err => {
            log(`stream error: ${err}`);
            done();
        });
    });
})

