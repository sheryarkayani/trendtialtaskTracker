
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppData } from '@/contexts/AppDataContext';
import DashboardStats from '@/components/dashboard/DashboardStats';
import PriorityAlerts from '@/components/dashboard/PriorityAlerts';
import TaskOverviewWidget from '@/components/dashboard/TaskOverviewWidget';
import TeamWorkloadWidget from '@/components/dashboard/TeamWorkloadWidget';
import CampaignPipelineWidget from '@/components/dashboard/CampaignPipelineWidget';
import PlatformPerformanceWidget from '@/components/dashboard/PlatformPerformanceWidget';
import RecentActivityWidget from '@/components/dashboard/RecentActivityWidget';
import ClientHealthWidget from '@/components/dashboard/ClientHealthWidget';
import PerformanceAnalyticsWidget from '@/components/dashboard/PerformanceAnalyticsWidget';
import WeeklyProgressChart from '@/components/dashboard/WeeklyProgressChart';
import TeamPerformanceChart from '@/components/dashboard/TeamPerformanceChart';
import PlatformTrendsChart from '@/components/dashboard/PlatformTrendsChart';
import QuickActionsPanel from '@/components/dashboard/QuickActionsPanel';
import NotificationsFeed from '@/components/dashboard/NotificationsFeed';
import { AlertTriangle, TrendingUp, Users, Clock } from 'lucide-react';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { analytics, tasksLoading, teamLoading, teamMembers } = useAppData();
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      console.log('Dashboard loaded for user:', user.email);
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Command Center</h1>
              <p className="text-blue-100">Real-time insights and campaign management</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Live Data</span>
              </div>
              <QuickActionsPanel />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Top Statistics Bar */}
        <DashboardStats refreshKey={refreshKey} />

        {/* Priority Alerts Section */}
        <PriorityAlerts />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Task Overview */}
          <div className="lg:col-span-4 space-y-6">
            <TaskOverviewWidget />
            <TeamWorkloadWidget />
          </div>

          {/* Middle Column - Campaign Performance */}
          <div className="lg:col-span-5 space-y-6">
            <CampaignPipelineWidget />
            <PlatformPerformanceWidget />
            <RecentActivityWidget />
          </div>

          {/* Right Column - Client & Analytics */}
          <div className="lg:col-span-3 space-y-6">
            <ClientHealthWidget />
            <PerformanceAnalyticsWidget />
            <NotificationsFeed />
          </div>
        </div>

        {/* Interactive Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <WeeklyProgressChart />
          <TeamPerformanceChart />
          <PlatformTrendsChart />
        </div>
      </div>
    </div>
  );
};

export default Index;
