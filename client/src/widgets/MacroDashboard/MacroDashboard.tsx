import { useMacroData } from '../../entities/macro/model/macroQueries';

import MacroItem from './MacroItem';

function MacroDashboard() {
    const {
        data,
        isLoading,
        error,
    } = useMacroData();

    if (isLoading) {
        return (
            <div className="macro-dashboard__status">
                ⏳ Загрузка макропоказателей...
            </div>
        );
    }

    if (error) {
        return (
            <div className="macro-dashboard__status macro-dashboard__status--error">
                ⚠️ Ошибка загрузки макропоказателей
            </div>
        );
    }

    const macroItems = [
        {
            label: 'MOEX',
            value: data?.moexIndex
                ? data.moexIndex.toFixed(2)
                : '—',
            icon: '📈',
        },
        {
            label: 'USD/RUB',
            value: data?.usdRub
                ? data.usdRub.toFixed(2)
                : '—',
            icon: '💵',
        },
        {
            label: 'Ключевая ставка',
            value: data?.keyRate
                ? `${data.keyRate}%`
                : '—',
            icon: '🏦',
        },
        {
            label: 'Инфляция',
            value: data?.inflation
                ? `${data.inflation}%`
                : '—',
            icon: '📊',
        },
    ];

    return (
        <div className="macro-dashboard">
            {macroItems.map((item) => (
                <MacroItem
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    icon={item.icon}
                />
            ))}
        </div>
    );
}

export default MacroDashboard;