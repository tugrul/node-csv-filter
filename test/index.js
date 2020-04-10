
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
        yield 'foo,bar,baz|raz,naz,';
        yield 'kaz|yaz,boz,haz|hos,';
        yield 'pos,nos'
    }

    const actual = 'foo,bar,baz#raz,naz,kaz#yaz,boz,haz#hos,pos,nos#';

    const expected = await combineData(Readable.from(generate())
        .pipe(new Aline({separator: '|'}))
        .pipe(new CsvFilter({newLine: '|', targetNewLine: '#'})));

    assert.equal(actual, expected.toString());

});

it('should transform comma to column', async () => {

    async function* generate() {
        yield 'foo,bar,baz\nraz,naz,';
        yield 'kaz\nyaz,boz,haz\nhos,';
        yield 'pos,nos'
    }

    const actual = 'foo;bar;baz\nraz;naz;kaz\nyaz;boz;haz\nhos;pos;nos\n';

    const expected = await combineData(Readable.from(generate())
        .pipe(new Aline())
        .pipe(new CsvFilter({delimiter: ',', targetDelimiter: ';'})));

    assert.equal(actual, expected.toString());

});

it('should remove 2nd column', async () => {

    async function* generate() {
        yield 'foo,bar,baz\nraz,naz,';
        yield 'kaz\nyaz,boz,haz\nhos,';
        yield 'pos,nos'
    }

    const actual = Buffer.from('foo,baz\nraz,kaz\nyaz,haz\nhos,nos\n');

    const expected = await combineData(Readable.from(generate())
        .pipe(new Aline())
        .pipe(new CsvFilter({filter: ([col1, col2, col3]) => [col1, col3]})));

    assert.equal(actual, expected.toString());

});

it('should uppercase 2nd column', async () => {

    async function* generate() {
        yield 'foo,bar,baz\nraz,naz,';
        yield 'kaz\nyaz,boz,haz\nhos,';
        yield 'pos,nos'
    }

    const actual = 'foo,BAR,baz\nraz,NAZ,kaz\nyaz,BOZ,haz\nhos,POS,nos\n';

    const expected = await combineData(Readable.from(generate())
        .pipe(new Aline())
        .pipe(new CsvFilter({filter: ([col1, col2, col3]) => [col1, Buffer.from(col2.toString().toUpperCase()), col3]})));

    assert.equal(actual, expected.toString());

});


it('should remove last character of 2nd column', async () => {

    async function* generate() {
        yield 'foo,bar,baz\nraz,naz,';
        yield 'kaz\nyaz,boz,haz\nhos,';
        yield 'pos,nos'
    }

    const actual = 'foo,ba,baz\nraz,na,kaz\nyaz,bo,haz\nhos,po,nos\n';

    const expected = await combineData(Readable.from(generate())
        .pipe(new Aline())
        .pipe(new CsvFilter({filter: ([col1, col2, col3]) => [col1, col2.slice(0, 2), col3]})));

    assert.equal(actual, expected.toString());

});

it('should not omit empty columns', async () => {

    async function* generate() {
        yield ',,\n,naz,';
        yield 'kaz\nyaz,,haz\nhos,';
        yield 'pos,'
    }

    const actual = ';;\n;naz;kaz\nyaz;;haz\nhos;pos;\n';

    const expected = await combineData(Readable.from(generate())
        .pipe(new Aline())
        .pipe(new CsvFilter({delimiter: ',', targetDelimiter: ';'})));

    assert.equal(actual, expected.toString());

});

it('should skip first line', async () => {

    async function* generate() {
        yield ',,\n,naz,';
        yield 'kaz\nyaz,,haz\nhos,';
        yield 'pos,'
    }

    const actual = ',naz,kaz\nyaz,,haz\nhos,pos,\n';

    const expected = await combineData(Readable.from(generate())
        .pipe(new Aline())
        .pipe(new CsvFilter({delimiter: ',', skipFirstLine: true})));

    assert.equal(actual, expected.toString());

});

it('should skip rows if it has a lost column', async() => {

    async function* generate() {
        yield ',,\n,naz,';
        yield 'kaz\nyaz,,haz\nbim,bam,bom\nhos,';
        yield 'pos,\nbom,bim,bam';
    }

    const actual = 'bim,bam,bom\nbom,bim,bam\n';

    const expected = await combineData(Readable.from(generate())
        .pipe(new Aline())
        .pipe(new CsvFilter({delimiter: ',',
            filter: cols => cols.filter(col => col.length > 0).length === cols.length ? cols : null})));

    assert.equal(actual, expected.toString());

});

it('should pick first column', async () => {

    async function* generate() {
        yield 'foo,bar,baz\nraz,naz,';
        yield 'kaz\nyaz,boz,haz\nhos,';
        yield 'pos,nos'
    }

    const actual = 'foo\nraz\nyaz\nhos\n';

    const expected = await combineData(Readable.from(generate())
        .pipe(new Aline())
        .pipe(new CsvFilter({filter: ([col1]) => col1})));

    assert.equal(actual, expected.toString());

});

it('should convert to json', async () => {

    async function* generate() {
        yield 'foo,bar,baz\nraz,naz,';
        yield 'kaz\nyaz,boz,haz\nhos,';
        yield 'pos,nos'
    }

    const actual = [
        '{"firstName":"foo","lastName":"bar"}',
        '{"firstName":"raz","lastName":"naz"}',
        '{"firstName":"yaz","lastName":"boz"}',
        '{"firstName":"hos","lastName":"pos"}',
        ''
    ].join('\n');

    const expected = await combineData(Readable.from(generate())
        .pipe(new Aline())
        .pipe(new CsvFilter({filter: ([col1, col2]) => JSON.stringify({firstName: col1.toString(), lastName: col2.toString()})})));

    assert.equal(actual, expected.toString());

});