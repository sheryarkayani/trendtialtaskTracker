
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Zap, BarChart3, Filter } from 'lucide-react';
import { Task } from '@/types/task';

interface TaskStatsProps {
  tasks: Task[];
  filteredTasks: Task[];
  viewMode: 'list' | 'kanban' | 'clients';
}

const TaskStats = ({ tasks, filteredTasks, viewMode }: TaskStatsProps) => {
  const getTasksByStatus = (status: string) => {
    return (viewMode === 'list' ? filteredTasks : tasks).filter(task => task.status === status);
  };

  const getHighPriorityTasks = () => {
    return (viewMode === 'list' ? filteredTasks : tasks).filter(task => task.priority === 'high');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{viewMode === 'list' ? filteredTasks.length : tasks.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Production</p>
              <p className="text-2xl font-bold text-orange-600">{getTasksByStatus('in-progress').length}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Published</p>
              <p className="text-2xl font-bold text-green-600">{getTasksByStatus('completed').length}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-red-600">{getHighPriorityTasks().length}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Filter className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskStats;
