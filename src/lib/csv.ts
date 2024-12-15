
export function parseLine(line: Buffer, delimiter: number, quote: number): Array<Buffer> {
    const columns: Buffer[] = [];
    let current: number[] = [];
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (inQuotes) {
            if (char === quote) { 
                if (line[i + 1] === quote) {
                    current.push(quote);
                    i++; // Skip the next quote
                } else {
                    inQuotes = false; // End of quoted section
                }
            } else {
                current.push(char);
            }
        } else {
            if (char === delimiter) {
                // End of column
                columns.push(Buffer.from(current));
                current = [];
            } else if (char === quote) {
                // Start of quoted section
                inQuotes = true;
            } else {
                current.push(char);
            }
        }
    }

    // Add the final column
    columns.push(Buffer.from(current));

    return columns;
}
