import { Footer, Header } from '@/components';
import { AppRoutes } from '@/routes/AppRoutes';

export function App() {
  return (
    <div className="app-shell">
      <Header />
      <AppRoutes />
      <Footer />
    </div>
  );
}

export default App;
