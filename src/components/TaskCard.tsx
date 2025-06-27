import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Task } from '@/types';
import { TeamMember } from '@/hooks/useTeam';
import { cn } from '@/lib/utils';
import { Calendar, MessageCircle, Paperclip } from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  teamMembers: TeamMember[];
  onTaskClick?: (task: Task) => void;
  onTaskSelect?: (selected: boolean, taskId?: string) => void;
  isSelected?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  teamMembers, 
  onTaskClick, 
  onTaskSelect,
  isSelected = false 
}) => {
  const assignee = teamMembers.find((member) => member.id === task.assignee_id);

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500';
      case 'medium':
        return 'border-l-4 border-yellow-500';
      case 'low':
        return 'border-l-4 border-blue-500';
      default:
        return 'border-l-4 border-gray-300';
    }
  };

  const handleClick = () => {
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  return (
    <div className="mb-4 touch-manipulation">
      <Card
        className={cn(
          'hover:shadow-md transition-all duration-200 cursor-pointer',
          'active:scale-[0.98] transform transition-transform',
          'touch-none select-none',
          getPriorityClass(task.priority),
          isSelected && 'ring-2 ring-blue-400 ring-opacity-50'
        )}
        onClick={handleClick}
      >
        <CardContent className={cn(
          "p-4",
          "transition-[background-color,transform] duration-200",
          "active:bg-gray-50",
          "touch-pan-y touch-pan-x" // Enable smooth touch panning
        )}>
          <div className="space-y-3">
            {/* Title and Platform Badge */}
            <div className="flex justify-between items-start gap-2">
              <span className="font-semibold text-gray-800 flex-1">{task.title}</span>
              {task.platform && (
                <Badge variant="outline" className="shrink-0">
                  {task.platform}
                </Badge>
              )}
            </div>

            {/* Description - truncated on mobile */}
            {task.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
              {task.due_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(task.due_date), 'MMM d')}</span>
                </div>
              )}
              {task.comments_count > 0 && (
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{task.comments_count}</span>
                </div>
              )}
              {task.attachments_count > 0 && (
                <div className="flex items-center gap-1">
                  <Paperclip className="w-4 h-4" />
                  <span>{task.attachments_count}</span>
                </div>
              )}
            </div>

            {/* Footer with Assignee */}
            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-2">
                {task.subtasks_total > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {task.subtasks_completed}/{task.subtasks_total}
                  </Badge>
                )}
              </div>
              {assignee && (
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={assignee.avatar_url || ''} 
                    alt={assignee.first_name || ''} 
                  />
                  <AvatarFallback>
                    {assignee.first_name?.[0]}
                    {assignee.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskCard;
