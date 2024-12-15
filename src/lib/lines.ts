
export function* getLines(chunk: Buffer, separator: string): Generator<Buffer, void, unknown> {
    const sepBuffer = Buffer.from(separator);
    const sepLength = sepBuffer.length;
    let index = 0;

    while (index < chunk.length) {
        const nextIndex = chunk.indexOf(sepBuffer, index);
        const end = nextIndex === -1 ? chunk.length : nextIndex;

        yield chunk.slice(index, end);

        if (nextIndex === -1) break; // No more separators
        index = nextIndex + sepLength;
    }
}

