
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Clock, Users, DollarSign } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useClients } from '@/hooks/useClients';

const PerformanceAnalyticsWidget = () => {
  const { tasks } = useTasks();
  const { clients } = useClients();

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const activeClients = clients.filter(client => client.status === 'active').length;
  const totalRevenue = clients.reduce((sum, client) => sum + (client.monthly_retainer || 0), 0);

  const metrics = [
    {
      title: 'Task Completion Rate',
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Avg. Task Duration',
      value: '2.3d',
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Active Clients',
      value: activeClients.toString(),
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      title: 'Monthly Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50'
    }
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <span>Analytics</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {metrics.map((metric, index) => (
          <div key={index} className={`p-3 rounded-lg ${metric.bg}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">{metric.title}</p>
                <p className={`text-lg font-bold ${metric.color}`}>{metric.value}</p>
              </div>
              <metric.icon className={`w-5 h-5 ${metric.color}`} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PerformanceAnalyticsWidget;
