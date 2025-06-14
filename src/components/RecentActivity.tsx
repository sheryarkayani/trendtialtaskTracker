
import React from 'react';
import { Clock, CheckCircle, AlertCircle, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: 'task_completed',
      user: 'Sarah Johnson',
      action: 'completed',
      target: 'Instagram Story Design',
      time: '2 minutes ago',
      icon: CheckCircle,
      iconColor: 'text-green-500 bg-green-50'
    },
    {
      id: 2,
      type: 'comment',
      user: 'Alex Chen',
      action: 'commented on',
      target: 'Facebook Ad Campaign',
      time: '15 minutes ago', 
      icon: MessageCircle,
      iconColor: 'text-blue-500 bg-blue-50'
    },
    {
      id: 3,
      type: 'task_assigned',
      user: 'Maria Rodriguez',
      action: 'assigned',
      target: 'TikTok Video Edit',
      time: '1 hour ago',
      icon: User,
      iconColor: 'text-purple-500 bg-purple-50'
    },
    {
      id: 4,
      type: 'deadline_approaching',
      user: 'System',
      action: 'deadline approaching for',
      target: 'LinkedIn Content Calendar',
      time: '2 hours ago',
      icon: AlertCircle,
      iconColor: 'text-orange-500 bg-orange-50'
    },
    {
      id: 5,
      type: 'task_started',
      user: 'James Wilson',
      action: 'started working on',
      target: 'Twitter Campaign Analysis',
      time: '3 hours ago',
      icon: Clock,
      iconColor: 'text-gray-500 bg-gray-50'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className={cn("p-2 rounded-lg", activity.iconColor)}>
              <activity.icon className="w-4 h-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{activity.user}</span>
                {' ' + activity.action + ' '}
                <span className="font-medium">{activity.target}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
