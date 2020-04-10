
const {Transform} = require('stream');

class CsvFilter extends Transform {

    constructor(options) {
        super();
        this._delimiter = options.delimiter || ',';
        this._newLine = options.newLine || '\n';
        this._targetDelimiter = options.targetDelimiter || this._delimiter;
        this._targetNewLine = options.targetNewLine || this._newLine;
        this._filter = options.filter || (fields => fields);
        this._skipFirstLine = options.skipFirstLine || false;
    }

    _transform(chunk, encoding, callback) {

        const newLine = Buffer.from(this._targetNewLine);
        const delimiter = Buffer.from(this._targetDelimiter);

        let index = 0;

        const lines = [];

        while (index > -1 && index < chunk.length - 1) {
            const parts = [];
            const prevIndex = index;
            index = chunk.indexOf(this._newLine, index);

            const line = chunk.slice(prevIndex, index > -1 ? index++ : chunk.length);

            if (this._skipFirstLine) {
                this._skipFirstLine = false;
                continue;
            }

            let col = 0;

            while (col > -1) {
                const colIndex = col;
                col = line.indexOf(this._delimiter, col);
                parts.push(line.slice(colIndex, col > -1 ? col++ : line.length));
            }

            // skip line if it doesn't have csv column
            if (parts.length === 0) {
                continue;
            }

            let targetLine = this._filter(parts, chunk);

            // skip line if callback return undefined
            if (!targetLine) {
                continue;
            }

            switch (typeof targetLine) {
                case 'object':
                    if (targetLine instanceof Array) {
                        const cols = [];

                        // seperate columns with column seperator character
                        targetLine.forEach((part, index) => {
                            index > 0 && cols.push(delimiter);
                            cols.push(part);
                        });

                        targetLine = Buffer.concat(cols);
                    } else if (!Buffer.isBuffer(targetLine)) {
                        continue;
                    }
                    break;
                case 'string': targetLine = Buffer.from(targetLine); break;
                default: continue;
            }

            // combine new columns
            lines.push(targetLine);
            lines.push(newLine);
        }

        // combine new rows and give back to transform
        callback(null, Buffer.concat(lines));
    }

}

module.exports = CsvFilter;
