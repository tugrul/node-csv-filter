
import { parseLine } from './csv';

const delimiter = ','.charCodeAt(0);
const quote = '"'.charCodeAt(0);

describe('parseLine', () => {
    it('should parse a simple CSV line', () => {
        const buffer = Buffer.from('value1,value2,value3');
        const result = parseLine(buffer, delimiter, quote);
        expect(result).toEqual([
            Buffer.from('value1'),
            Buffer.from('value2'),
            Buffer.from('value3'),
        ]);
    });

    it('should handle fields with quotes', () => {
        const buffer = Buffer.from('"value1","value,with,commas","value3"');
        const result = parseLine(buffer, delimiter, quote);
        expect(result).toEqual([
            Buffer.from('value1'),
            Buffer.from('value,with,commas'),
            Buffer.from('value3'),
        ]);
    });

    it('should handle escaped quotes within quoted fields', () => {
        const buffer = Buffer.from('"value1","value with ""escaped quotes""","value3"');
        const result = parseLine(buffer, delimiter, quote);
        expect(result).toEqual([
            Buffer.from('value1'),
            Buffer.from('value with "escaped quotes"'),
            Buffer.from('value3'),
        ]);
    });

    it('should handle empty fields', () => {
        const buffer = Buffer.from('value1,,value3');
        const result = parseLine(buffer, delimiter, quote);
        expect(result).toEqual([
            Buffer.from('value1'),
            Buffer.from(''),
            Buffer.from('value3'),
        ]);
    });

    it('should handle completely empty CSV lines', () => {
        const buffer = Buffer.from('');
        const result = parseLine(buffer, delimiter, quote);
        expect(result).toEqual([Buffer.from('')]);
    });

    it('should handle fields with only quotes', () => {
        const buffer = Buffer.from('"",""');
        const result = parseLine(buffer, delimiter, quote);
        expect(result).toEqual([
            Buffer.from(''),
            Buffer.from(''),
        ]);
    });

    it('should handle trailing commas', () => {
        const buffer = Buffer.from('value1,value2,');
        const result = parseLine(buffer, delimiter, quote);
        expect(result).toEqual([
            Buffer.from('value1'),
            Buffer.from('value2'),
            Buffer.from(''),
        ]);
    });

    it('should handle leading commas', () => {
        const buffer = Buffer.from(',value2,value3');
        const result = parseLine(buffer, delimiter, quote);
        expect(result).toEqual([
            Buffer.from(''),
            Buffer.from('value2'),
            Buffer.from('value3'),
        ]);
    });

    it('should handle a single quoted field', () => {
        const buffer = Buffer.from('"value1"');
        const result = parseLine(buffer, delimiter, quote);
        expect(result).toEqual([Buffer.from('value1')]);
    });
});
