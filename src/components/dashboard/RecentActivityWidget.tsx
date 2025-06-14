
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, CheckSquare, User, MessageSquare } from 'lucide-react';
import { useActivity } from '@/hooks/useActivity';

const RecentActivityWidget = () => {
  const { activities, loading } = useActivity();

  const getActivityIcon = (action: string) => {
    if (action.includes('completed')) return CheckSquare;
    if (action.includes('assigned')) return User;
    if (action.includes('commented')) return MessageSquare;
    return Clock;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Clock className="w-5 h-5 text-orange-600" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-1" />
                  <div className="h-2 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="font-medium">No recent activity</p>
            <p className="text-sm">Team activity will appear here</p>
          </div>
        ) : (
          activities.slice(0, 10).map((activity) => {
            const IconComponent = getActivityIcon(activity.action);
            
            return (
              <div key={activity.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                    <IconComponent className="w-3 h-3" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">User</span> {activity.action.toLowerCase()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTime(activity.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityWidget;
