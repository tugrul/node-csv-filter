
import {Transform} from 'stream';

export default class CsvFilter extends Transform {
    constructor(opts?: CsvFilter.CsvFilterOptions);
}

declare namespace CsvFilter {
    export interface CsvFilterOptions {
        delimiter?: string,
        newLine?: string,
        targetDelimiter?: string,
        targetNewLine?: string
        skipFirstLine?: boolean,
        filter?: (cols: Buffer[], chunk: Buffer) => Buffer[]
    }
}
