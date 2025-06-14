import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ListTodo, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Task } from '@/types';

interface TaskStatsProps {
  tasks: Task[];
}

const TaskStats: React.FC<TaskStatsProps> = ({ tasks }) => {
  const totalTasks = tasks.length;
  const todoTasks = tasks.filter(task => task.status === 'todo').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;

  const stats = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: <ListTodo className="w-6 h-6 text-primary" />,
      color: 'bg-primary/10',
    },
    {
      title: 'In Progress',
      value: inProgressTasks,
      icon: <ArrowRight className="w-6 h-6 text-orange-500" />,
      color: 'bg-orange-500/10',
    },
    {
      title: 'Completed',
      value: completedTasks,
      icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
      color: 'bg-green-500/10',
    },
    {
      title: 'High Priority',
      value: highPriorityTasks,
      icon: <AlertTriangle className="w-6 h-6 text-destructive" />,
      color: 'bg-destructive/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-full ${stat.color}`}>
              {stat.icon}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TaskStats;
