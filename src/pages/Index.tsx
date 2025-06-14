
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import TaskBoard from '@/components/TaskBoard';
import RecentActivity from '@/components/RecentActivity';  
import TeamOverview from '@/components/TeamOverview';
import { CheckSquare, Clock, Users, BarChart3 } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useTeam } from '@/hooks/useTeam';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { tasks, loading: tasksLoading } = useTasks();
  const { teamMembers, loading: teamLoading } = useTeam();

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

  // Calculate real-time stats from actual data
  const totalTasks = tasks.length;
  const todoTasks = tasks.filter(task => task.status === 'todo').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const reviewTasks = tasks.filter(task => task.status === 'review').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalTeamMembers = teamMembers.length + 1; // +1 for current user

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto">
          {/* Dynamic Stats Cards */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Tasks"
              value={tasksLoading ? '...' : totalTasks.toString()}
              change={`${todoTasks} todo, ${inProgressTasks} in progress`}
              changeType="positive"
              icon={CheckSquare}
              iconColor="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <StatsCard
              title="In Progress"
              value={tasksLoading ? '...' : inProgressTasks.toString()}
              change={`${reviewTasks} in review`}
              changeType="positive"
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
              title="Completion Rate"
              value={tasksLoading ? '...' : `${completionRate}%`}
              change={`${completedTasks} completed tasks`}
              changeType={completionRate > 60 ? "positive" : "neutral"}
              icon={BarChart3}
              iconColor="bg-gradient-to-br from-purple-500 to-purple-600"
            />
          </div>

          {/* Main Content Grid - Now fully dynamic */}
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Task Board - Takes up 2 columns */}
              <div className="lg:col-span-2">
                <TaskBoard />
              </div>
              
              {/* Right Sidebar with real-time data */}
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
