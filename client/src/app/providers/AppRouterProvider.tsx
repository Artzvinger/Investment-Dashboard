import {
    createBrowserRouter,
    Navigate,
    RouterProvider,
} from 'react-router';

import PortfolioPage from '../../pages/PortfolioPage/PortfolioPage';
import StocksPage from '../../pages/StocksPage/StocksPage';
import BondsPage from '../../pages/BondsPage/BondsPage';
import AppLayout from '../layout/AppLayout';

const appRouter = createBrowserRouter([
    {
        element: <AppLayout />,
        children: [
            {path: '/', element: ( <Navigate to="/portfolio" replace/>),},
            {path: '/portfolio', element: <PortfolioPage />,},
            {path: '/stocks', element: <StocksPage />,},
            {path: '/bonds', element: <BondsPage />,},
        ],
    },
]);

export function AppRouterProvider() {
    return <RouterProvider router={appRouter} />;
}