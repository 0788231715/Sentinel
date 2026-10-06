import { useEffect } from 'react';
import '../locales/i18n';
import { AppRouter } from './router';
import { useSystemStore } from '../store/systemStore';
import { useAuthStore } from '../store/authStore';

export function App() {
  const { fetchHealth } = useSystemStore();
  const { initialize } = useAuthStore();

  useEffect(() => {
    void initialize();
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, [fetchHealth, initialize]);

  return <AppRouter />;
}

export default App;
