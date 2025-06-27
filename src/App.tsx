import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import Dashboard from '@/pages/Dashboard';
import Tasks from '@/pages/Tasks';
import Team from '@/pages/Team';
import Analytics from '@/pages/Analytics';
import Calendar from '@/pages/Calendar';
import Settings from '@/pages/Settings';
import Clients from '@/pages/Clients';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';
import Financial from '@/pages/Financial';
import Attendance from '@/pages/Attendance';
import { useAuth } from '@/hooks/useAuth';
import { AppDataProvider } from '@/contexts/AppDataContext';
import Chat from '@/pages/Chat';
import ChatWidget from '@/components/ChatWidget';

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
                <Route path="/" element={<Dashboard />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route 
                  path="/clients" 
                  element={
                    <ProtectedRoute allowedRoles={['team_lead']}>
                      <Clients />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/team" 
                  element={
                    <ProtectedRoute allowedRoles={['team_lead']}>
                      <Team />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/financial" 
                  element={
                    <ProtectedRoute allowedRoles={['superadmin', 'team_lead']}>
                      <Financial />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </div>
        <ChatWidget />
        <Toaster />
      </Router>
    </AppDataProvider>
  );
}

export default App;
