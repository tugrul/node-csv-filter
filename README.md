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
- `filter`: callback to redact or modify row of CSV stream. `([row1, row2, row3]) => [row1, row3]`


## Sample
```javascript

const assert = require('assert');
const Aline = require('aline');
const {Readable} = require('stream');
const CsvFilter = require('csvf');

async function* generate() {
    yield 'foo,bar,baz\nraz,naz,';
    yield 'kaz\nyaz,boz,haz\nhos,';
    yield 'pos,nos'
}

const target = Buffer.from('foo,BAR,baz\nraz,NAZ,kaz\nyaz,BOZ,haz\nhos,POS,nos\n');

combineData(Readable.from(generate())
    .pipe(new Aline())
    .pipe(new CsvFilter({filter: ([col1, col2, col3]) => [col1, Buffer.from(col2.toString().toUpperCase()), col3]})))
    .then(actual => assert.equal(0, target.compare(actual)));

```
