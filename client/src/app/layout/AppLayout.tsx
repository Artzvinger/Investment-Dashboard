import { useEffect } from 'react';
import { Outlet } from 'react-router';

import Sidebar from '../../widgets/Sidebar/ui/Sidebar';

function AppLayout() {
    useEffect(() => {
        console.warn('⚠️ Сервер не отвечает. Проверь, запущен ли бэкенд!');
    }, []);

    return (
        <div>
            <Sidebar />
            <Outlet />
        </div>
    );
}

export default AppLayout;