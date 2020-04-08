
import {Transform} from 'stream';

interface CsvFilterOptions {
    delimiter?: string,
    newLine?: string,
    targetDelimiter?: string,
    targetNewLine?: string
    skipFirstLine?: boolean,
    filter?: (cols: Buffer[], chunk: Buffer) => Buffer[]
}

export default class CsvFilter extends Transform {
    constructor(opts?: CsvFilterOptions);
}