
const assert = require('assert');
const Aline = require('aline');
const {Readable} = require('stream');
const CsvFilter = require('../index');

function combineData(stream) {
    return new Promise((resolve, reject) => {

        const chunks = [];

        stream.on('data', data => chunks.push(data));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', err => reject(err));
    });
}

it('should transform LF to CRLF', async () => {

    async function* generate() {
        yield 'foo,bar,baz\nraz,naz,';
        yield 'kaz\nyaz,boz,haz\nhos,';
        yield 'pos,nos'
    }

    const target = Buffer.from('foo,bar,baz\r\nraz,naz,kaz\r\nyaz,boz,haz\r\nhos,pos,nos\r\n');

    const actual = await combineData(Readable.from(generate())
        .pipe(new Aline())
        .pipe(new CsvFilter({newLine: '\n', targetNewLine: '\r\n'})));

    assert.equal(0, target.compare(actual));

});

it('should transform comma to column', async () => {

    async function* generate() {
        yield 'foo,bar,baz\nraz,naz,';
        yield 'kaz\nyaz,boz,haz\nhos,';
        yield 'pos,nos'
    }

    const target = Buffer.from('foo;bar;baz\nraz;naz;kaz\nyaz;boz;haz\nhos;pos;nos\n');

    const actual = await combineData(Readable.from(generate())
        .pipe(new Aline())
        .pipe(new CsvFilter({delimiter: ',', targetDelimiter: ';'})));

    assert.equal(0, target.compare(actual));

});

it('should remove 2nd column', async () => {

    async function* generate() {
        yield 'foo,bar,baz\nraz,naz,';
        yield 'kaz\nyaz,boz,haz\nhos,';
        yield 'pos,nos'
    }

    const target = Buffer.from('foo,baz\nraz,kaz\nyaz,haz\nhos,nos\n');

    const actual = await combineData(Readable.from(generate())
        .pipe(new Aline())
        .pipe(new CsvFilter({filter: ([col1, col2, col3]) => [col1, col3]})));

    assert.equal(0, target.compare(actual));

});

it('should uppercase 2nd column', async () => {

    async function* generate() {
        yield 'foo,bar,baz\nraz,naz,';
        yield 'kaz\nyaz,boz,haz\nhos,';
        yield 'pos,nos'
    }

    const target = Buffer.from('foo,BAR,baz\nraz,NAZ,kaz\nyaz,BOZ,haz\nhos,POS,nos\n');

    const actual = await combineData(Readable.from(generate())
        .pipe(new Aline())
        .pipe(new CsvFilter({filter: ([col1, col2, col3]) => [col1, Buffer.from(col2.toString().toUpperCase()), col3]})));

    assert.equal(0, target.compare(actual));

});


it('should remove last character of 2nd column', async () => {

    async function* generate() {
        yield 'foo,bar,baz\nraz,naz,';
        yield 'kaz\nyaz,boz,haz\nhos,';
        yield 'pos,nos'
    }

    const target = Buffer.from('foo,ba,baz\nraz,na,kaz\nyaz,bo,haz\nhos,po,nos\n');

    const actual = await combineData(Readable.from(generate())
        .pipe(new Aline())
        .pipe(new CsvFilter({filter: ([col1, col2, col3]) => [col1, col2.slice(0, 2), col3]})));

    assert.equal(0, target.compare(actual));

});