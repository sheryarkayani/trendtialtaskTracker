
import React from 'react';
import { Clock, User, MessageCircle, Paperclip, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    assignee: {
      name: string;
      avatar: string;
    };
    dueDate: string;
    platform: string;
    platformColor: string;
    comments: number;
    attachments: number;
    status: string;
  };
}

const TaskCard = ({ task }: TaskCardProps) => {
  const priorityColors = {
    high: 'bg-red-100 text-red-600 border-red-200',
    medium: 'bg-yellow-100 text-yellow-600 border-yellow-200', 
    low: 'bg-green-100 text-green-600 border-green-200'
  };

  const isOverdue = new Date(task.dueDate) < new Date();
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-lg transition-all duration-200 cursor-pointer group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={cn("w-3 h-3 rounded-full", task.platformColor)} />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {task.platform}
          </span>
        </div>
        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all">
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{task.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
      </div>

      {/* Priority Badge */}
      <div className="mb-4">
        <span className={cn(
          "inline-flex px-3 py-1 rounded-full text-xs font-medium border",
          priorityColors[task.priority]
        )}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Assignee */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm text-gray-600">{task.assignee.name}</span>
        </div>

        {/* Meta Info */}
        <div className="flex items-center space-x-3 text-gray-400">
          {task.comments > 0 && (
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">{task.comments}</span>
            </div>
          )}
          {task.attachments > 0 && (
            <div className="flex items-center space-x-1">
              <Paperclip className="w-4 h-4" />
              <span className="text-xs">{task.attachments}</span>
            </div>
          )}
          <div className={cn(
            "flex items-center space-x-1",
            isOverdue && "text-red-500"
          )}>
            <Clock className="w-4 h-4" />
            <span className="text-xs">{task.dueDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
