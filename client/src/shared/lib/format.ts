export function formatMoney(value: number): string {
    return `${value.toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} ₽`;
}

export function formatPercent(value: number): string {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}
