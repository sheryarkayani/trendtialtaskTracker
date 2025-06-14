
import React from 'react';
import { Clock, CheckCircle, AlertCircle, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActivity } from '@/hooks/useActivity';
import { formatDistanceToNow } from 'date-fns';

const RecentActivity = () => {
  const { activities, loading } = useActivity();

  const getActivityIcon = (action: string) => {
    if (action.includes('completed')) return CheckCircle;
    if (action.includes('comment')) return MessageCircle;
    if (action.includes('assigned')) return User;
    if (action.includes('deadline')) return AlertCircle;
    return Clock;
  };

  const getActivityColor = (action: string) => {
    if (action.includes('completed')) return 'text-green-500 bg-green-50';
    if (action.includes('comment')) return 'text-blue-500 bg-blue-50';
    if (action.includes('assigned')) return 'text-purple-500 bg-purple-50';
    if (action.includes('deadline')) return 'text-orange-500 bg-orange-50';
    return 'text-gray-500 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex items-start space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent activity</p>
        ) : (
          activities.slice(0, 10).map((activity) => {
            const Icon = getActivityIcon(activity.action);
            const userName = activity.user?.first_name && activity.user?.last_name 
              ? `${activity.user.first_name} ${activity.user.last_name}`
              : 'Unknown User';

            return (
              <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={cn("p-2 rounded-lg", getActivityColor(activity.action))}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{userName}</span>
                    {' ' + activity.action.toLowerCase()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
