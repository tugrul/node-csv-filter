
import { getLines } from './lines';

test('get parts by seperator', () => {

    const lines = Array.from(getLines(Buffer.from('a,b,c'), ',')).map(line => line.toString());

    expect(lines).toStrictEqual(['a', 'b', 'c']);

});

test('get parts by multi bytes seperator', () => {

    const lines = Array.from(getLines(Buffer.from('a<>b<>c'), '<>')).map(line => line.toString());

    expect(lines).toStrictEqual(['a', 'b', 'c']);

});


test('test empty lines', () => {

    const lines = Array.from(getLines(Buffer.from('a,b,c,,d,,,e'), ',')).map(line => line.toString());

    expect(lines).toStrictEqual(['a', 'b', 'c', '', 'd', '', '', 'e']);

});