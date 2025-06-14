
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Index from '@/pages/Index';
import Tasks from '@/pages/Tasks';
import Team from '@/pages/Team';
import Analytics from '@/pages/Analytics';
import Calendar from '@/pages/Calendar';
import Settings from '@/pages/Settings';
import Clients from '@/pages/Clients';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';
import { useAuth } from '@/hooks/useAuth';
import { AppDataProvider } from '@/contexts/AppDataContext';

function App() {
  const { user } = useAuth();

  if (!user) {
    return <Auth />;
  }

  return (
    <AppDataProvider>
      <Router>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-x-hidden overflow-y-auto">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/team" element={<Team />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </div>
        <Toaster />
      </Router>
    </AppDataProvider>
  );
}

export default App;
