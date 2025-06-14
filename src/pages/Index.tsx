
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppData } from '@/contexts/AppDataContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import TaskBoard from '@/components/TaskBoard';
import RecentActivity from '@/components/RecentActivity';  
import TeamOverview from '@/components/TeamOverview';
import { CheckSquare, Clock, Users, BarChart3 } from 'lucide-react';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    analytics, 
    tasksLoading, 
    teamLoading,
    teamMembers 
  } = useAppData();

  useEffect(() => {
    if (user) {
      console.log('User authenticated:', user.email);
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const totalTeamMembers = teamMembers.length + 1; // +1 for current user

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto">
          {/* Dynamic Stats Cards using real analytics data */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Tasks"
              value={tasksLoading ? '...' : analytics.totalTasks.toString()}
              change={`${analytics.inProgressTasks} in progress, ${analytics.overdueTasks} overdue`}
              changeType={analytics.overdueTasks > 0 ? "negative" : "positive"}
              icon={CheckSquare}
              iconColor="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <StatsCard
              title="Completion Rate"
              value={tasksLoading ? '...' : `${analytics.completionRate}%`}
              change={`${analytics.completedTasks} completed tasks`}
              changeType={analytics.completionRate > 60 ? "positive" : "neutral"}
              icon={Clock}
              iconColor="bg-gradient-to-br from-yellow-500 to-orange-500"
            />
            <StatsCard
              title="Team Members"
              value={teamLoading ? '...' : totalTeamMembers.toString()}
              change="Including you"
              changeType="positive"
              icon={Users}
              iconColor="bg-gradient-to-br from-green-500 to-green-600"
            />
            <StatsCard
              title="Avg. Completion"
              value={tasksLoading ? '...' : `${analytics.averageCompletionTime}d`}
              change="Days to complete"
              changeType={analytics.averageCompletionTime < 3 ? "positive" : "neutral"}
              icon={BarChart3}
              iconColor="bg-gradient-to-br from-purple-500 to-purple-600"
            />
          </div>

          {/* Main Content Grid - Now fully dynamic and interconnected */}
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Task Board - Takes up 2 columns, now connected to global state */}
              <div className="lg:col-span-2">
                <TaskBoard />
              </div>
              
              {/* Right Sidebar with interconnected real-time data */}
              <div className="space-y-6">
                <RecentActivity />
                <TeamOverview />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
