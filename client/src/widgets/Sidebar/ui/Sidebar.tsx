import { NavLink } from 'react-router';

function Sidebar() {
    return (
        <aside className="sidebar">
            <h2>📊 Инвестиционный дашборд</h2>

            <nav>
                <NavLink
                    to="/"
                    end
                >
                    📈 Портфель
                </NavLink>

                <NavLink to="/stocks">
                    📊 Акции
                </NavLink>

                <NavLink to="/bonds">
                    🏦 Облигации
                </NavLink>
            </nav>
        </aside>
    );
}

export default Sidebar;