import { Link } from 'react-router';

function Sidebar() {
    return (
        <aside className="sidebar">
            <h2 className="sidebar__title">
                📊 Инвестор
            </h2>

            <nav className="sidebar__nav">
                <Link
                    to="/"
                    className="sidebar__link"
                >
                    📈 Портфель
                </Link>

                <Link
                    to="/stocks"
                    className="sidebar__link"
                >
                    📊 Акции
                </Link>

                <Link
                    to="/bonds"
                    className="sidebar__link"
                >
                    🏦 Облигации
                </Link>
            </nav>
        </aside>
    );
}

export default Sidebar;