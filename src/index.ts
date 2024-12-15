
import { Transform } from 'node:stream';
import type { TransformCallback } from 'node:stream';

type CsvFilterCallbackReturnType = Array<Buffer> | string | Buffer | null;
type CsvFilterCallback = (parts: Array<Buffer>, chunk: Buffer) => CsvFilterCallbackReturnType;

interface CsvFilterOptions {
    objectMode?: boolean;
    delimiter?: string;
    newLine?: string;
    targetDelimiter?: string;
    targetNewLine?: string;
    skipFirstLine?: boolean;
    filter?: CsvFilterCallback
}

export default class CsvFilter extends Transform {

    #objectMode: boolean;
    #skipFirstLine: boolean;
    #delimiter: string;
    #newLine: string;
    #targetDelimiter: string;
    #targetNewLine: string;
    #filter: CsvFilterCallback;

    constructor({objectMode = false, delimiter = ',', newLine = '\n', skipFirstLine = false, 
        filter = fields => fields, targetDelimiter, targetNewLine}: CsvFilterOptions) {
        super({objectMode});
        this.#objectMode = objectMode;
        this.#skipFirstLine = skipFirstLine;
        this.#delimiter = delimiter;
        this.#newLine = newLine;
        this.#targetDelimiter = targetDelimiter || delimiter;
        this.#targetNewLine = targetNewLine || newLine;
        this.#filter = filter;
        
    }

    *getLines(chunk: Buffer): Generator<Buffer, void, unknown> {

        let index = 0;

        while (index > -1 && index < chunk.length - 1) {
            const prevIndex = index;
            index = chunk.indexOf(this.#newLine, index);

            if (this.#skipFirstLine) {
                this.#skipFirstLine = false;
                continue;
            }

            yield chunk.slice(prevIndex, index > -1 ? index++ : chunk.length);
        }
    }

    parseColumnsByLine(line: Buffer): Array<Buffer> {
        const parts: Array<Buffer> = [];

        let col = 0;

        while (col > -1) {
            const colIndex = col;
            col = line.indexOf(this.#delimiter, col);
            parts.push(line.slice(colIndex, col > -1 ? col++ : line.length));
        }

        return parts;
    }

    _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback) {

        const newLine = Buffer.from(this.#targetNewLine);
        const delimiter = Buffer.from(this.#targetDelimiter);

        const lines: Array<Buffer> = [];

        for (const line of this.getLines(chunk)) {

            const cols = this.parseColumnsByLine(line);

            // skip line if it doesn't have csv column
            if (cols.length === 0) {
                continue;
            }

            let targetLine: any = this.#filter(cols, chunk);

            // skip line if callback return undefined
            if (!targetLine) {
                continue;
            }

            switch (typeof targetLine) {
                case 'object':
                    if (targetLine instanceof Array) {
                        const cols: Array<Buffer> = [];

                        // seperate columns with column seperator character
                        targetLine.forEach((part, index) => {
                            if (this.#objectMode) {
                                cols.push(part.toString());
                            } else {
                                index > 0 && cols.push(delimiter);
                                cols.push(part);
                            }
                        });

                        targetLine = this.#objectMode ? cols : Buffer.concat(cols);
                    } else if (!Buffer.isBuffer(targetLine)) {
                        continue;
                    }
                    break;
                case 'string': targetLine = this.#objectMode ? [targetLine] : Buffer.from(targetLine); break;
                default: continue;
            }

            // combine new columns
            lines.push(targetLine);
            !this.#objectMode && lines.push(newLine);
        }

        // combine new rows and give back to transform
        callback(null, this.#objectMode ? lines : Buffer.concat(lines));
    }

}

