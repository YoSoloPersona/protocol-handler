import * as path from 'path';
import * as debug from 'debug';

// local
import { dirData, dirFail } from '../config';
import { getFiles } from '../../stream/getFiles';

const log = debug('test:getFiles');

describe('#getFiles', () => {
    it(`Получение всех файлов в указанной папке ${path.resolve(dirData)} и во всех подпапках.`, (done) => {
        let countFiles = 0;

        const stream = getFiles(dirData)
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

    it(`Получение всех файлов в указанной папке ${path.resolve(dirData)}, исключая подпапки.`, (done) => {
        let countFiles = 0;

        const stream = getFiles(dirData, false)
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

    it(`Получение *.txt файлов из указанной папки ${path.resolve(dirData)}.`, (done) => {
        let countFiles = 0;

        const stream = getFiles(dirData, true, /\w+\.txt/)
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
        const stream = getFiles(dirFail)
        .on('readable', () => {
            let data;

            while (null != (data = stream.read())) {
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

