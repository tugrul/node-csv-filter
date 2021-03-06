# node-csv-filter

Redact or modify CSV data streams

## Install

### NPM

```
npm install csvf
```

### Yarn

```
yarn add csvf
```

## Options

- `delimiter`: column seperator of CSV stream. `,` `;` `<TAB>`
- `newLine`: new line character of CSV stream. `\n` `\r\n`
- `targetDelimiter`: column seperator of CSV stream after the filter. `,` `;` `<TAB>`
- `targetNewLine`: new line character of CSV stream after the filter.  `\n` `\r\n`
- `skipFirstLine`: remove the first header row of CSV stream after the filter
- `filter`: callback to redact or modify row of CSV stream. `([col1, col2, col3]) => [col1, col3]`
- `objectMode`: pump parsed fragment instead of string fragment. `true` `false`


## Sample
```javascript
const assert = require('assert');
const Aline = require('aline');
const {Readable} = require('stream');
const CsvFilter = require('csvf');

function combineData(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', data => chunks.push(data));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', err => reject(err));
    });
}


async function* generate() {
    yield 'foo,bar,baz\nraz,naz,';
    yield 'kaz\nyaz,boz,haz\nhos,';
    yield 'pos,nos'
}

const actual = 'foo,BAR,baz\nraz,NAZ,kaz\nyaz,BOZ,haz\nhos,POS,nos\n';

combineData(Readable.from(generate())
    .pipe(new Aline())
    .pipe(new CsvFilter({filter: ([col1, col2, col3]) => [col1, Buffer.from(col2.toString().toUpperCase()), col3]})))
    .then(expected => assert.equal(actual, expected.toString()));
```

## Real World Sample
```javascript
const fs = require('fs');
const zlib = require('zlib');
const {pipeline} = require('stream');
const Aline = require('aline');
const CsvFilter = require('csvf');

pipeline(
    fs.createReadStream('huge.csv.gz'), 
    zlib.createGunzip(), 
    new Aline(), 
    new CsvFilter({
        // remove rows with empty columns
        filter: cols => cols.filter(col => col.length > 0).length === cols.length ? cols : null
    }),
    zlib.createGzip(),
    fs.createWriteStream('huge_updated.csv.gz'), 
    (err) => {
        if (err) {
          console.error('Pipeline failed.', err);
        } else {
          console.log('Pipeline succeeded.');
        }
    }
);
```