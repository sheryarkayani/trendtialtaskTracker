
import React, { useState } from 'react';
import { Clock, User, MessageCircle, Paperclip, MoreHorizontal, Building2, CheckSquare, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task } from '@/types/task';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format, isAfter } from 'date-fns';

interface EnhancedTaskCardProps {
  task: Task;
  onUpdate: () => Promise<void>;
  updateTaskStatus: (taskId: string, status: Task['status']) => Promise<void>;
  isDragging?: boolean;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onOpenDetail?: () => void;
}

const EnhancedTaskCard = ({ 
  task, 
  onUpdate, 
  updateTaskStatus, 
  isDragging, 
  isSelected,
  onSelect,
  onOpenDetail 
}: EnhancedTaskCardProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const priorityColors = {
    high: 'border-l-red-500',
    medium: 'border-l-yellow-500', 
    low: 'border-l-blue-500'
  };

  const priorityBadges = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-blue-100 text-blue-700 border-blue-200'
  };

  const platformIcons = {
    instagram: '📷',
    facebook: '📘',
    tiktok: '🎵',
    linkedin: '💼',
    twitter: '🐦'
  };

  const platformColors = {
    instagram: 'bg-pink-500',
    facebook: 'bg-blue-600',
    tiktok: 'bg-black',
    linkedin: 'bg-blue-700',
    twitter: 'bg-sky-500'
  };

  const isOverdue = task.due_date && isAfter(new Date(), new Date(task.due_date));
  const progress = task.subtasks_total ? (task.subtasks_completed || 0) / task.subtasks_total : 0;

  const getDisplayName = () => {
    if (task.assignee?.first_name || task.assignee?.last_name) {
      return `${task.assignee.first_name || ''} ${task.assignee.last_name || ''}`.trim();
    }
    return 'Unassigned';
  };

  const getInitials = () => {
    if (task.assignee?.first_name || task.assignee?.last_name) {
      return `${task.assignee.first_name?.charAt(0) || ''}${task.assignee.last_name?.charAt(0) || ''}`;
    }
    return 'U';
  };

  const formatDueDate = () => {
    if (!task.due_date) return null;
    return format(new Date(task.due_date), 'MMM dd');
  };

  const handleCardClick = () => {
    onOpenDetail?.();
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(!isSelected);
  };

  return (
    <div 
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group relative",
        "border-l-4",
        priorityColors[task.priority || 'medium'],
        isLoading && "opacity-50",
        isDragging && "rotate-2 opacity-75 shadow-xl",
        isOverdue && "bg-red-50 border-red-100",
        isSelected && "ring-2 ring-blue-500 shadow-lg"
      )}
      draggable
      onClick={handleCardClick}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({
          taskId: task.id,
          currentStatus: task.status
        }));
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      {/* Selection Checkbox - appears on hover */}
      <div 
        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={handleCheckboxClick}
      >
        <div className={cn(
          "w-4 h-4 border-2 rounded flex items-center justify-center cursor-pointer",
          isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300 hover:border-blue-400"
        )}>
          {isSelected && <CheckSquare className="w-3 h-3 text-white" />}
        </div>
      </div>

      {/* Header with Platform and Assignee */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {task.platform && (
            <div className="flex items-center space-x-1">
              <div className={cn("w-2 h-2 rounded-full", platformColors[task.platform])} />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {platformIcons[task.platform]} {task.platform}
              </span>
            </div>
          )}
          {isOverdue && (
            <div className="flex items-center space-x-1 text-red-500">
              <AlertCircle className="w-3 h-3" />
              <span className="text-xs font-medium">Overdue</span>
            </div>
          )}
        </div>
        
        {/* Assignee Avatar */}
        <Avatar className="w-6 h-6">
          <AvatarImage src={task.assignee?.avatar_url} />
          <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Timer indicator */}
      {task.is_timer_running && (
        <div className="absolute top-2 right-8">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      )}

      {/* Client Badge */}
      {task.client && (
        <div className="mb-3">
          <div 
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border-l-4 bg-gray-50"
            style={{ borderLeftColor: task.client.brand_color || '#3B82F6' }}
          >
            <Building2 className="w-3 h-3 mr-1" />
            {task.client.name}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="mb-3">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 pr-8">{task.title}</h3>
        {task.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
        )}
      </div>

      {/* Progress Bar for Subtasks */}
      {task.subtasks_total && task.subtasks_total > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{task.subtasks_completed || 0}/{task.subtasks_total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Priority Badge */}
      <div className="mb-3">
        <Badge className={cn("text-xs border", priorityBadges[task.priority || 'medium'])}>
          {(task.priority || 'medium').charAt(0).toUpperCase() + (task.priority || 'medium').slice(1)} Priority
        </Badge>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Due Date */}
        <div className={cn(
          "flex items-center space-x-1 text-xs",
          isOverdue ? "text-red-500" : "text-gray-500"
        )}>
          <Clock className="w-3 h-3" />
          <span>{formatDueDate() ? `Due: ${formatDueDate()}` : 'No due date'}</span>
        </div>

        {/* Meta Info */}
        <div className="flex items-center space-x-3 text-gray-400">
          {(task.comments_count || 0) > 0 && (
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-3 h-3" />
              <span className="text-xs">{task.comments_count}</span>
            </div>
          )}
          {(task.attachments_count || 0) > 0 && (
            <div className="flex items-center space-x-1">
              <Paperclip className="w-3 h-3" />
              <span className="text-xs">{task.attachments_count}</span>
            </div>
          )}
          {task.time_spent && task.time_spent > 0 && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{Math.round(task.time_spent / 60)}h</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedTaskCard;
