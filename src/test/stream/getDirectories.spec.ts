import { dirData, dirFail } from '../config';
import { getDirectories } from '../../stream/getDirectories';
import { getObservable } from '../../rxjs';


const re1 = /1/;

describe('#getDirectories', () => {
    it(`Получение всех папок из указанной ${dirData}, включая подпапки.`, (done) => {
        let countDirs = 0;

        getObservable(getDirectories(dirData)).subscribe({
            next: () => {
                countDirs++;
            },
            complete: () => {
                expect(countDirs).toBe(3);
                done();
            },
            error: (err) => {
                fail(err);
            }
        });
    });

    it(`Получение всех папок из указанной ${dirData}, исключая подпаки.`, (done) => {
        let countDirs = 0;

        getObservable<string>(getDirectories(dirData, false)).subscribe({
            next: () => {
                countDirs++;
            },
            complete: () => {
                expect(countDirs).toBe(2);
                done();
            },
            error: (err) => {
                fail(err);
            }
        });
    });

    it(`Получение папки по регулярному выражению '1' в ${dirData}.`, (done) => {
        let countDirs = 0;
        let foundDir = '';

        getObservable<string>(getDirectories(dirData, true, re1)).subscribe({
            next: (dir) => {
                foundDir = dir;
                countDirs++;
            },
            complete: () => {
                expect(foundDir).toMatch(re1);
                expect(countDirs).toBe(1);
                done();
            },
            error: (err) => {
                fail(err);
            }
        });
    });

    it(`Получение всех папок из несуществующей папки ${dirFail}.`, (done) => {
        getObservable<string>(getDirectories(dirFail)).subscribe({
            complete: () => {
                fail(`Удалось получить папки из несуществующеё папки ${dirFail}.`);
            },
            error: () => {
                done();
            }
        });
    });
});
