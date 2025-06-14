
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Clock, Users, TrendingUp, TrendingDown, ArrowUp, ArrowDown, Minus, Plus, Eye } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useTeam } from '@/hooks/useTeam';
import { useClients } from '@/hooks/useClients';
import { cn } from '@/lib/utils';

interface DashboardStatsProps {
  refreshKey: number;
}

const DashboardStats = ({ refreshKey }: DashboardStatsProps) => {
  const { tasks, loading: tasksLoading } = useTasks();
  const { teamMembers, loading: teamLoading } = useTeam();
  const { clients } = useClients();
  const [previousStats, setPreviousStats] = useState<any>(null);

  // Calculate current statistics
  const activeCampaigns = tasks.filter(task => 
    ['todo', 'in-progress'].includes(task.status)
  ).length;

  const tasksDueToday = tasks.filter(task => {
    if (!task.due_date) return false;
    const today = new Date().toDateString();
    return new Date(task.due_date).toDateString() === today;
  }).length;

  const overdueTasks = tasks.filter(task => {
    if (!task.due_date) return false;
    return new Date(task.due_date) < new Date() && task.status !== 'completed';
  }).length;

  const completedThisWeek = tasks.filter(task => {
    if (!task.completed_at) return false;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(task.completed_at) >= weekAgo;
  }).length;

  const totalAssignedThisWeek = tasks.filter(task => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(task.created_at) >= weekAgo;
  }).length;

  const teamProductivity = totalAssignedThisWeek > 0 
    ? Math.round((completedThisWeek / totalAssignedThisWeek) * 100)
    : 0;

  const clientSatisfaction = 85; // Mock data - would come from feedback system

  const stats = [
    {
      title: 'Active Campaigns',
      value: activeCampaigns.toString(),
      change: `${overdueTasks > 0 ? overdueTasks + ' overdue' : 'On track'}`,
      changeType: overdueTasks > 0 ? 'negative' : 'positive',
      icon: Target,
      iconColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      actions: [
        { label: 'View All', action: () => window.location.href = '/tasks' },
        { label: 'Add New', action: () => console.log('Add campaign') }
      ]
    },
    {
      title: 'Tasks Due Today',
      value: tasksDueToday.toString(),
      change: overdueTasks > 0 ? `${overdueTasks} overdue` : 'All current',
      changeType: overdueTasks > 0 ? 'negative' : 'positive',
      icon: Clock,
      iconColor: 'bg-gradient-to-br from-orange-500 to-orange-600',
      actions: [
        { label: 'View Details', action: () => console.log('View tasks') },
        { label: 'Reschedule', action: () => console.log('Reschedule') }
      ]
    },
    {
      title: 'Team Productivity',
      value: `${teamProductivity}%`,
      change: `${completedThisWeek} completed this week`,
      changeType: teamProductivity >= 70 ? 'positive' : teamProductivity >= 50 ? 'neutral' : 'negative',
      icon: Users,
      iconColor: 'bg-gradient-to-br from-green-500 to-green-600',
      actions: [
        { label: 'Team View', action: () => window.location.href = '/team' },
        { label: 'Analytics', action: () => window.location.href = '/analytics' }
      ]
    },
    {
      title: 'Client Satisfaction',
      value: `${clientSatisfaction}%`,
      change: 'Based on recent feedback',
      changeType: clientSatisfaction >= 80 ? 'positive' : clientSatisfaction >= 60 ? 'neutral' : 'negative',
      icon: TrendingUp,
      iconColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      actions: [
        { label: 'View Clients', action: () => window.location.href = '/clients' },
        { label: 'Feedback', action: () => console.log('View feedback') }
      ]
    }
  ];

  const getTrendIcon = (changeType: string) => {
    switch (changeType) {
      case 'positive':
        return <ArrowUp className="w-3 h-3 text-green-600" />;
      case 'negative':
        return <ArrowDown className="w-3 h-3 text-red-600" />;
      default:
        return <Minus className="w-3 h-3 text-gray-600" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (tasksLoading || teamLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-white"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  {getTrendIcon(stat.changeType)}
                </div>
              </div>
              <div className={cn("p-3 rounded-xl", stat.iconColor)}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border mb-3",
              getChangeColor(stat.changeType)
            )}>
              {stat.change}
            </div>

            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {stat.actions.map((action, actionIndex) => (
                <Button
                  key={actionIndex}
                  variant="ghost"
                  size="sm"
                  onClick={action.action}
                  className="text-xs h-7 px-2"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
