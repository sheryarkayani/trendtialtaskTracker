
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, X, Check, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'assignment' | 'deadline' | 'completion' | 'client' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

const NotificationsFeed = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'deadline',
      title: 'Task Due Soon',
      message: 'Instagram campaign due in 2 hours',
      time: '2h ago',
      read: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'assignment',
      title: 'New Task Assigned',
      message: 'Facebook ad creative assigned to you',
      time: '4h ago',
      read: false,
      priority: 'medium'
    },
    {
      id: '3',
      type: 'completion',
      title: 'Task Completed',
      message: 'LinkedIn post published successfully',
      time: '1d ago',
      read: true,
      priority: 'low'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return AlertTriangle;
      case 'assignment':
        return Info;
      case 'completion':
        return CheckCircle;
      case 'client':
        return Bell;
      default:
        return Info;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return 'text-red-600 bg-red-50';
    if (type === 'completion') return 'text-green-600 bg-green-50';
    if (type === 'assignment') return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  const filteredNotifications = notifications.filter(notification =>
    filter === 'all' || !notification.read
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
              className="text-xs"
            >
              {filter === 'all' ? 'Unread' : 'All'}
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <Check className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 max-h-64 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <Bell className="w-6 h-6 mx-auto mb-1 text-gray-300" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const IconComponent = getNotificationIcon(notification.type);
            const colorClass = getNotificationColor(notification.type, notification.priority);

            return (
              <div
                key={notification.id}
                className={cn(
                  "p-3 rounded-lg border transition-all duration-200",
                  notification.read 
                    ? "bg-gray-50 border-gray-200" 
                    : "bg-white border-blue-200 ring-1 ring-blue-100"
                )}
              >
                <div className="flex items-start space-x-3">
                  <div className={cn("p-1 rounded-full", colorClass)}>
                    <IconComponent className="w-3 h-3" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={cn(
                        "text-sm font-medium",
                        notification.read ? "text-gray-600" : "text-gray-900"
                      )}>
                        {notification.title}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissNotification(notification.id)}
                        className="h-4 w-4 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <p className={cn(
                      "text-xs mt-1",
                      notification.read ? "text-gray-500" : "text-gray-700"
                    )}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{notification.time}</span>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs h-5 px-2"
                        >
                          Mark read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsFeed;
