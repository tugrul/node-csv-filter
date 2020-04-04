
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

        this.pause();

        while (index > -1 && index < chunk.length - 1) {
            const parts = [];
            const cols = [];
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

                const chunk = line.slice(colIndex, col > -1 ? col++ : line.length);
                parts.push(chunk);

            }

            if (parts.length === 0) {
                continue;
            }

            this._filter(parts).forEach((part, index) => {
                index > 0 && cols.push(delimiter);
                cols.push(part);
            });



            lines.push(Buffer.concat(cols));
            lines.push(newLine);
        }

        this.resume();

        callback(null, Buffer.concat(lines));
    }

}

module.exports = CsvFilter;
