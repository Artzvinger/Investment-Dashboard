interface MacroItemProps {
    label: string;
    value: string;
    change?: number | null;
    icon: string;
}

function MacroItem({
                       label,
                       value,
                       change,
                       icon,
                   }: MacroItemProps) {
    return (
        <div className="macro-item">
            <div className="macro-item__label">
                {icon} {label}
            </div>

            <div className="macro-item__value">
                {value}
            </div>

            {change !== null && change !== undefined && (
                <div
                    className={
                        change > 0
                            ? 'macro-item__change macro-item__change--positive'
                            : 'macro-item__change macro-item__change--negative'
                    }
                >
                    {change > 0 ? '↑' : '↓'}{' '}
                    {Math.abs(change)}%
                </div>
            )}
        </div>
    );
}

export default MacroItem;