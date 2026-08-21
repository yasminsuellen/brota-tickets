const DIACRITIC_RANGE_START = 0x0300;
const DIACRITIC_RANGE_END = 0x036f;

export function removeAccents(text) {
    if (!text) return text;

    let result = '';
    for (const char of text.normalize('NFD')) {
        const code = char.codePointAt(0);
        if (code >= DIACRITIC_RANGE_START && code <= DIACRITIC_RANGE_END) {
            continue;
        }
        result += char;
    }
    return result;
}
