
import { getLines } from './lines';

describe('getLines', () => {
    it('should yield lines split by a single-character separator', () => {
        const chunk = Buffer.from('line1\nline2\nline3');
        const separator = '\n';
        const result = Array.from(getLines(chunk, separator));
        expect(result).toEqual([
            Buffer.from('line1'),
            Buffer.from('line2'),
            Buffer.from('line3'),
        ]);
    });

    it('should handle a multi-character separator', () => {
        const chunk = Buffer.from('line1//line2//line3');
        const separator = '//';
        const result = Array.from(getLines(chunk, separator));
        expect(result).toEqual([
            Buffer.from('line1'),
            Buffer.from('line2'),
            Buffer.from('line3'),
        ]);
    });

    it('should yield the entire chunk if separator is not found', () => {
        const chunk = Buffer.from('line1line2line3');
        const separator = '\n';
        const result = Array.from(getLines(chunk, separator));
        expect(result).toEqual([Buffer.from('line1line2line3')]);
    });

    it('should handle an empty chunk', () => {
        const chunk = Buffer.from('');
        const separator = '\n';
        const result = Array.from(getLines(chunk, separator));
        expect(result).toEqual([]);
    });

    it('should handle a trailing separator', () => {
        const chunk = Buffer.from('line1\nline2\n');
        const separator = '\n';
        const result = Array.from(getLines(chunk, separator));
        expect(result).toEqual([
            Buffer.from('line1'),
            Buffer.from('line2')
        ]);
    });

    it('should handle leading separators', () => {
        const chunk = Buffer.from('\nline1\nline2');
        const separator = '\n';
        const result = Array.from(getLines(chunk, separator));
        expect(result).toEqual([
            Buffer.from(''),
            Buffer.from('line1'),
            Buffer.from('line2'),
        ]);
    });
});
