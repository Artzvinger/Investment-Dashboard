import { AppRouterProvider } from './providers/AppRouterProvider';
import { QueryProvider } from './providers/QueryProvider';

function App() {
    return (
        <QueryProvider>
            <AppRouterProvider />
        </QueryProvider>
    );
}

export default App;