
export function *getLines(chunk: Buffer, separator: string): Generator<Buffer, void, unknown> {

    const sepLength = separator.length;
    let index = 0;


    while (index > -1 && index < chunk.length) {
        const prevIndex = index;
        index = chunk.indexOf(separator, index);

        let end = chunk.length;

        if (index > -1) {
            end = index;
            index += sepLength;
        }

        yield chunk.slice(prevIndex, end);
    }
}
