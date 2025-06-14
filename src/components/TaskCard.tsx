
import React, { useState } from 'react';
import { Clock, User, MessageCircle, Paperclip, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task } from '@/hooks/useTasks';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onUpdate: () => Promise<void>;
  updateTaskStatus: (taskId: string, status: Task['status']) => Promise<void>;
  isDragging?: boolean;
}

const TaskCard = ({ task, onUpdate, updateTaskStatus, isDragging }: TaskCardProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const priorityColors = {
    high: 'bg-red-100 text-red-600 border-red-200',
    medium: 'bg-yellow-100 text-yellow-600 border-yellow-200', 
    low: 'bg-green-100 text-green-600 border-green-200'
  };

  const platformColors = {
    instagram: 'bg-pink-500',
    facebook: 'bg-blue-600',
    tiktok: 'bg-black',
    linkedin: 'bg-blue-700',
    twitter: 'bg-sky-500'
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date();

  const handleStatusChange = async (newStatus: Task['status']) => {
    setIsLoading(true);
    try {
      console.log('Moving task to status:', newStatus, 'Task ID:', task.id);
      await updateTaskStatus(task.id, newStatus);
      await onUpdate();
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayName = () => {
    if (task.assignee?.first_name || task.assignee?.last_name) {
      return `${task.assignee.first_name || ''} ${task.assignee.last_name || ''}`.trim();
    }
    return 'Unassigned';
  };

  const formatDueDate = () => {
    if (!task.due_date) return 'No due date';
    return format(new Date(task.due_date), 'MMM dd');
  };
  
  return (
    <div 
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing group",
        isLoading && "opacity-50",
        isDragging && "rotate-3 opacity-75 shadow-xl"
      )}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({
          taskId: task.id,
          currentStatus: task.status
        }));
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          {task.platform && (
            <div className={cn("w-3 h-3 rounded-full", platformColors[task.platform])} />
          )}
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {task.platform || 'General'}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all">
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleStatusChange('todo')}>
              Move to Content Brief
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('in-progress')}>
              Move to Creating
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('review')}>
              Move to Client Review
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
              Move to Published
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="w-4 h-4 mr-2" />
              Edit Campaign
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Campaign
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{task.title}</h3>
        {task.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
        )}
      </div>

      {/* Priority Badge */}
      <div className="mb-4">
        <span className={cn(
          "inline-flex px-3 py-1 rounded-full text-xs font-medium border",
          priorityColors[task.priority || 'medium']
        )}>
          {(task.priority || 'medium').charAt(0).toUpperCase() + (task.priority || 'medium').slice(1)} Priority
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Assignee */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm text-gray-600">{getDisplayName()}</span>
        </div>

        {/* Meta Info */}
        <div className="flex items-center space-x-3 text-gray-400">
          {(task.comments_count || 0) > 0 && (
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">{task.comments_count}</span>
            </div>
          )}
          {(task.attachments_count || 0) > 0 && (
            <div className="flex items-center space-x-1">
              <Paperclip className="w-4 h-4" />
              <span className="text-xs">{task.attachments_count}</span>
            </div>
          )}
          <div className={cn(
            "flex items-center space-x-1",
            isOverdue && "text-red-500"
          )}>
            <Clock className="w-4 h-4" />
            <span className="text-xs">{formatDueDate()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
