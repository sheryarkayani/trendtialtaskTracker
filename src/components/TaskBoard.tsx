
import React, { useState } from 'react';
import { Plus, Filter, MoreHorizontal, Calendar, User } from 'lucide-react';
import TaskCard from './TaskCard';
import CreateTaskDialog from './CreateTaskDialog';
import { useTasks } from '@/hooks/useTasks';
import { Badge } from '@/components/ui/badge';

const TaskBoard = () => {
  const { tasks, loading, refetch } = useTasks();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const columns = [
    {
      id: 'todo', 
      title: 'Content Brief',
      color: 'bg-gray-100',
      description: 'New campaigns & content ideas'
    },
    {
      id: 'in-progress',
      title: 'Creating', 
      color: 'bg-blue-100',
      description: 'Content in production'
    },
    {
      id: 'review',
      title: 'Client Review',
      color: 'bg-yellow-100',
      description: 'Pending client approval'
    },
    {
      id: 'completed',
      title: 'Published',
      color: 'bg-green-100',
      description: 'Live content'
    }
  ];

  const getTasksForColumn = (columnId: string) => {
    return tasks.filter(task => task.status === columnId);
  };

  const handleTaskUpdate = async () => {
    await refetch();
  };

  const handleTaskCreated = () => {
    setShowCreateDialog(false);
    refetch();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 h-96"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Enhanced Board Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Campaign Pipeline</h2>
            <p className="text-gray-500">Track your social media content from brief to publication</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button 
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Campaign</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Active: {getTasksForColumn('in-progress').length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-600">In Review: {getTasksForColumn('review').length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Published: {getTasksForColumn('completed').length}</span>
          </div>
        </div>
      </div>

      {/* Board Columns */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => {
            const columnTasks = getTasksForColumn(column.id);
            return (
              <div key={column.id} className="bg-gray-50 rounded-xl p-4">
                {/* Enhanced Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${column.color.replace('bg-', 'bg-').replace('-100', '-500')}`} />
                    <div>
                      <h3 className="font-semibold text-gray-900">{column.title}</h3>
                      <p className="text-xs text-gray-500">{column.description}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {columnTasks.length}
                  </Badge>
                </div>

                {/* Tasks */}
                <div className="space-y-4">
                  {columnTasks.map((task) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onUpdate={handleTaskUpdate}
                    />
                  ))}
                  
                  {/* Add Task Button */}
                  <button 
                    onClick={() => setShowCreateDialog(true)}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add {column.title}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CreateTaskDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        onSuccess={handleTaskCreated}
      />
    </div>
  );
};

export default TaskBoard;
