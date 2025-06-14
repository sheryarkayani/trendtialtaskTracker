
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, UserX, FileText, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useClients } from '@/hooks/useClients';
import { cn } from '@/lib/utils';

const PriorityAlerts = () => {
  const { tasks } = useTasks();
  const { clients } = useClients();
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);

  // Calculate alerts
  const overdueTasks = tasks.filter(task => {
    if (!task.due_date) return false;
    return new Date(task.due_date) < new Date() && task.status !== 'completed';
  });

  const contractRenewals = clients.filter(client => {
    if (!client.contract_end_date) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return new Date(client.contract_end_date) <= thirtyDaysFromNow;
  });

  const unassignedCampaigns = tasks.filter(task => !task.assignee_id);

  const highPriorityPending = tasks.filter(task => 
    task.priority === 'high' && task.status === 'todo'
  );

  const alerts = [
    {
      id: 'overdue-tasks',
      type: 'urgent',
      title: 'Overdue Tasks',
      count: overdueTasks.length,
      description: 'Tasks past their due date',
      color: 'red',
      icon: Clock,
      items: overdueTasks.slice(0, 3),
      actions: [
        { label: 'Reassign', action: () => console.log('Reassign tasks') },
        { label: 'Extend Deadline', action: () => console.log('Extend deadline') }
      ]
    },
    {
      id: 'contract-renewals',
      type: 'warning',
      title: 'Contract Renewals',
      count: contractRenewals.length,
      description: 'Contracts expiring within 30 days',
      color: 'yellow',
      icon: FileText,
      items: contractRenewals.slice(0, 3),
      actions: [
        { label: 'Contact Client', action: () => console.log('Contact client') },
        { label: 'Schedule Meeting', action: () => console.log('Schedule meeting') }
      ]
    },
    {
      id: 'unassigned-campaigns',
      type: 'info',
      title: 'Unassigned Campaigns',
      count: unassignedCampaigns.length,
      description: 'Campaigns without team assignments',
      color: 'blue',
      icon: UserX,
      items: unassignedCampaigns.slice(0, 3),
      actions: [
        { label: 'Assign Now', action: () => console.log('Assign campaigns') },
        { label: 'View All', action: () => window.location.href = '/tasks' }
      ]
    },
    {
      id: 'high-priority-pending',
      type: 'urgent',
      title: 'High Priority Pending',
      count: highPriorityPending.length,
      description: 'High priority tasks not started',
      color: 'red',
      icon: AlertTriangle,
      items: highPriorityPending.slice(0, 3),
      actions: [
        { label: 'Start Now', action: () => console.log('Start tasks') },
        { label: 'Prioritize', action: () => console.log('Prioritize') }
      ]
    }
  ].filter(alert => alert.count > 0 && !dismissedAlerts.includes(alert.id));

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  const toggleSection = (alertId: string) => {
    setCollapsedSections(prev =>
      prev.includes(alertId)
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    );
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'red':
        return {
          badge: 'bg-red-100 text-red-800 border-red-200',
          border: 'border-l-red-500',
          bg: 'bg-red-50'
        };
      case 'yellow':
        return {
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          border: 'border-l-yellow-500',
          bg: 'bg-yellow-50'
        };
      case 'blue':
        return {
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          border: 'border-l-blue-500',
          bg: 'bg-blue-50'
        };
      default:
        return {
          badge: 'bg-gray-100 text-gray-800 border-gray-200',
          border: 'border-l-gray-500',
          bg: 'bg-gray-50'
        };
    }
  };

  if (alerts.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-gray-500">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="font-medium">All Clear!</p>
              <p className="text-sm">No urgent items require attention</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {alerts.map((alert) => {
        const colors = getColorClasses(alert.color);
        const isCollapsed = collapsedSections.includes(alert.id);

        return (
          <Card 
            key={alert.id} 
            className={cn(
              "border-0 shadow-sm border-l-4 transition-all duration-200",
              colors.border,
              colors.bg
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <alert.icon className="w-5 h-5 text-gray-600" />
                  <div>
                    <CardTitle className="text-sm font-semibold">{alert.title}</CardTitle>
                    <p className="text-xs text-gray-600">{alert.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Badge className={cn("text-xs", colors.badge)}>
                    {alert.count}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlert(alert.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {!isCollapsed && (
                <div className="space-y-2 mb-3">
                  {alert.items.map((item: any, index) => (
                    <div key={index} className="text-xs p-2 bg-white rounded border">
                      <p className="font-medium truncate">{item.title || item.name}</p>
                      {item.due_date && (
                        <p className="text-gray-500">
                          Due: {new Date(item.due_date).toLocaleDateString()}
                        </p>
                      )}
                      {item.contract_end_date && (
                        <p className="text-gray-500">
                          Expires: {new Date(item.contract_end_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                  {alert.count > 3 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{alert.count - 3} more items
                    </p>
                  )}
                </div>
              )}

              <div className="flex space-x-2">
                {alert.actions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={action.action}
                    className="text-xs h-7 px-2 flex-1"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PriorityAlerts;
