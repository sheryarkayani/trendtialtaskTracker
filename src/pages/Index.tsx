
import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import TaskBoard from '@/components/TaskBoard';
import RecentActivity from '@/components/RecentActivity';  
import TeamOverview from '@/components/TeamOverview';
import { CheckSquare, Clock, Users, BarChart3 } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto">
          {/* Stats Cards */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Tasks"
              value="48"
              change="+12% from last week"
              changeType="positive"
              icon={CheckSquare}
              iconColor="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <StatsCard
              title="In Progress"
              value="8"
              change="+3 from yesterday"
              changeType="positive"
              icon={Clock}
              iconColor="bg-gradient-to-br from-yellow-500 to-orange-500"
            />
            <StatsCard
              title="Team Members"
              value="12"
              change="2 new this month"
              changeType="positive"
              icon={Users}
              iconColor="bg-gradient-to-br from-green-500 to-green-600"
            />
            <StatsCard
              title="Completion Rate"
              value="94%"
              change="+2% from last month"
              changeType="positive"
              icon={BarChart3}
              iconColor="bg-gradient-to-br from-purple-500 to-purple-600"
            />
          </div>

          {/* Main Content Grid */}
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Task Board - Takes up 2 columns */}
              <div className="lg:col-span-2">
                <TaskBoard />
              </div>
              
              {/* Right Sidebar */}
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
