import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Task } from '@/types';
import { TeamMember } from '@/hooks/useTeam';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  index: number;
  teamMembers: TeamMember[];
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index, teamMembers }) => {
  const assignee = teamMembers.find((member) => member.id === task.assignee_id);

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500';
      case 'medium':
        return 'border-l-4 border-yellow-500';
      case 'low':
        return 'border-l-4 border-green-500';
      default:
        return 'border-l-4 border-gray-300';
    }
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-4"
        >
          <Card
            className={cn(
              'hover:shadow-md transition-shadow',
              getPriorityClass(task.priority),
              snapshot.isDragging && 'shadow-lg rotate-2'
            )}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-gray-800">{task.title}</span>
              </div>
              {task.description && (
                <p className="text-sm text-gray-600 mb-3">{task.description}</p>
              )}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  {task.platform && <Badge variant="outline">{task.platform}</Badge>}
                </div>
                {assignee && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={assignee.avatar_url || ''} alt={assignee.first_name || ''} />
                    <AvatarFallback>
                      {assignee.first_name?.[0]}
                      {assignee.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
