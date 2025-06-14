
import React from 'react';
import { Plus, Filter, MoreHorizontal } from 'lucide-react';
import TaskCard from './TaskCard';

const TaskBoard = () => {
  const columns = [
    {
      id: 'todo', 
      title: 'To Do',
      color: 'bg-gray-100',
      count: 12
    },
    {
      id: 'in-progress',
      title: 'In Progress', 
      color: 'bg-blue-100',
      count: 8
    },
    {
      id: 'review',
      title: 'Review',
      color: 'bg-yellow-100', 
      count: 5
    },
    {
      id: 'completed',
      title: 'Completed',
      color: 'bg-green-100',
      count: 23
    }
  ];

  const sampleTasks = [
    {
      id: '1',
      title: 'Create Instagram Stories for Product Launch',
      description: 'Design engaging story templates for the upcoming product launch campaign',
      priority: 'high' as const,
      assignee: { name: 'Alex Chen', avatar: '' },
      dueDate: 'Dec 15',
      platform: 'Instagram',
      platformColor: 'bg-pink-500',
      comments: 3,
      attachments: 2,
      status: 'todo'
    },
    {
      id: '2', 
      title: 'Facebook Ad Copy Review',
      description: 'Review and optimize ad copy for Q4 campaign performance',
      priority: 'medium' as const,
      assignee: { name: 'Maria Rodriguez', avatar: '' },
      dueDate: 'Dec 12',
      platform: 'Facebook',
      platformColor: 'bg-blue-600',
      comments: 1,
      attachments: 0,
      status: 'in-progress'
    },
    {
      id: '3',
      title: 'TikTok Content Calendar',
      description: 'Plan and schedule TikTok content for the next two weeks',
      priority: 'low' as const,
      assignee: { name: 'James Wilson', avatar: '' },
      dueDate: 'Dec 18',
      platform: 'TikTok', 
      platformColor: 'bg-black',
      comments: 0,
      attachments: 1,
      status: 'review'
    }
  ];

  const getTasksForColumn = (columnId: string) => {
    return sampleTasks.filter(task => task.status === columnId);
  };

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
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all">
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="bg-gray-50 rounded-xl p-4">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${column.color.replace('bg-', 'bg-').replace('-100', '-500')}`} />
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {column.count}
                </span>
              </div>
              <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Tasks */}
            <div className="space-y-4">
              {getTasksForColumn(column.id).map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              
              {/* Add Task Button */}
              <button className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskBoard;
