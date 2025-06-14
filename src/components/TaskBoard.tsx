
import React, { useState } from 'react';
import { Plus, Filter, MoreHorizontal } from 'lucide-react';
import TaskCard from './TaskCard';
import CreateTaskDialog from './CreateTaskDialog';
import { useTasks } from '@/hooks/useTasks';

const TaskBoard = () => {
  const { tasks, loading, refetch } = useTasks();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const columns = [
    {
      id: 'todo', 
      title: 'To Do',
      color: 'bg-gray-100',
    },
    {
      id: 'in-progress',
      title: 'In Progress', 
      color: 'bg-blue-100',
    },
    {
      id: 'review',
      title: 'Review',
      color: 'bg-yellow-100', 
    },
    {
      id: 'completed',
      title: 'Completed',
      color: 'bg-green-100',
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
      <div className="p-6">
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
    <div className="p-6">
      {/* Board Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Task Board</h2>
          <p className="text-gray-500">Manage your team's social media tasks</p>
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
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => {
          const columnTasks = getTasksForColumn(column.id);
          return (
            <div key={column.id} className="bg-gray-50 rounded-xl p-4">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${column.color.replace('bg-', 'bg-').replace('-100', '-500')}`} />
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
                <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
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
                  <span>Add Task</span>
                </button>
              </div>
            </div>
          );
        })}
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
