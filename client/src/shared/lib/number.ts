export function parseDecimal(value: string): number {
    return Number(
        value
            .trim()
            .replace(/\s/g, '')
            .replace(/,/g, '.'),
    );
}
