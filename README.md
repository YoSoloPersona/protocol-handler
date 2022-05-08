# yo-data-processing

A module that I wrote to process dagta using nodejs stream.

## Install and Usage

```shell
npm i yo-data-processing
```

```ts
import { getFiles } from 'yo-data-processing/stream';

const stream = getFiles(dirData)
    .on('readable', () => {
        let file;

        while (null != (file = stream.read())) {
            countFiles++;
            console.(`file name => ${file}`);
        }
    })
    .on('end', () => {
        console.log('finish');
    })
    .on('error', (err) => {
        console.error(err);
    });
```
