
import { parseLine } from './csv';


test('get columns by seperator', () => {

    const cols = parseLine(Buffer.from('a,b,c'), ','.charCodeAt(0), '"'.charCodeAt(0));

    expect(cols.map(col => col.toString())).toStrictEqual(['a', 'b', 'c']);

});


test('get escaped columns by seperator', () => {

    const cols = parseLine(Buffer.from('a,"b,c",d'), ','.charCodeAt(0), '"'.charCodeAt(0));

    expect(cols.map(col => col.toString())).toStrictEqual(['a', 'b,c', 'd']);
    
});

