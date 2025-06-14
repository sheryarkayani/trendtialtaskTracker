
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
import SocialMediaMetrics from '@/components/SocialMediaMetrics';
import CampaignOverview from '@/components/CampaignOverview';
import { CheckSquare, Clock, Users, BarChart3, Target, TrendingUp, Calendar, Zap } from 'lucide-react';

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
          {/* Agency-focused Welcome Section */}
          <div className="p-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold mb-2">Social Media Command Center</h1>
              <p className="text-blue-100">Manage campaigns, track performance, and coordinate your social media marketing efforts</p>
            </div>
          </div>

          {/* Enhanced Stats Cards for Social Media Agency */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Active Campaigns"
              value={tasksLoading ? '...' : analytics.totalTasks.toString()}
              change={`${analytics.inProgressTasks} in progress`}
              changeType={analytics.overdueTasks > 0 ? "negative" : "positive"}
              icon={Target}
              iconColor="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <StatsCard
              title="Content Completion"
              value={tasksLoading ? '...' : `${analytics.completionRate}%`}
              change={`${analytics.completedTasks} posts delivered`}
              changeType={analytics.completionRate > 60 ? "positive" : "neutral"}
              icon={CheckSquare}
              iconColor="bg-gradient-to-br from-green-500 to-green-600"
            />
            <StatsCard
              title="Team Performance"
              value={teamLoading ? '...' : totalTeamMembers.toString()}
              change="Creative professionals"
              changeType="positive"
              icon={Users}
              iconColor="bg-gradient-to-br from-purple-500 to-purple-600"
            />
            <StatsCard
              title="Avg. Turnaround"
              value={tasksLoading ? '...' : `${analytics.averageCompletionTime}d`}
              change="Days per campaign"
              changeType={analytics.averageCompletionTime < 3 ? "positive" : "neutral"}
              icon={Clock}
              iconColor="bg-gradient-to-br from-orange-500 to-orange-600"
            />
          </div>

          {/* Social Media Specific Metrics */}
          <div className="px-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SocialMediaMetrics />
              </div>
              <div>
                <CampaignOverview />
              </div>
            </div>
          </div>

          {/* Main Content Grid - Agency focused */}
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Task Board - Enhanced for Social Media */}
              <div className="lg:col-span-2">
                <TaskBoard />
              </div>
              
              {/* Right Sidebar with agency-specific data */}
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
