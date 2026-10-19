import { Outlet } from 'react-router';

import Sidebar from '../../widgets/Sidebar/ui/Sidebar';

function AppLayout() {
    return (
        <div className="app-layout">
            <Sidebar />

            <div className="main-content">
                <Outlet />
            </div>
        </div>
    );
}

export default AppLayout;
