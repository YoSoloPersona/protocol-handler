import { promises } from 'fs';

import { dirData } from '../config'
import { map, reduce, getFiles } from '../../stream';



describe('#reduce', () => {
    it(`Получение размера всех файлов в папке '${dirData}'`, (done) => {
        let sum = 0;
        const stream = getFiles(dirData)
            // преобразуем пути к файлам в их размеры в байтах
            .pipe(
                map<string, number>(
                    async (source) => (await promises.stat(source)).size
                )
            )
            // Накапливаем полученные значения
            .pipe(reduce<number, number>(0, (acc, size) => acc + size))
            .on('readable', () => {
                let data: number;

                while (null != (data = stream.read())) {
                    sum = data;
                }
            })
            .on('end', () => {
                expect(sum).toEqual(11);
                done();
            })
            .on('error', (err) => {
                fail(err);
            });
    });
});
