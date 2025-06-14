import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Task } from '@/types';
import { TeamMember } from '@/hooks/useTeam';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface TaskListViewProps {
  filteredTasks: Task[];
  teamMembers: TeamMember[];
}

const TaskListView: React.FC<TaskListViewProps> = ({ filteredTasks, teamMembers }) => {
  const getPriorityClasses = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      {filteredTasks.map((task) => {
        const assignee = teamMembers.find(member => member.id === task.assignee_id);
        const isOverdue = task.due_date && new Date(task.due_date) < new Date();

        return (
          <Card key={task.id} className={cn('hover:shadow-lg transition-shadow border-l-4', getPriorityClasses(task.priority))}>
            <CardContent className="p-4 grid grid-cols-12 gap-4 items-center">
              <div className="col-span-12 md:col-span-5">
                <p className="font-semibold text-gray-800">{task.title}</p>
                {task.description && <p className="text-sm text-gray-500 mt-1">{task.description}</p>}
              </div>
              <div className="col-span-6 md:col-span-2">
                <Badge variant="secondary" className="capitalize">{task.status}</Badge>
              </div>
              <div className="col-span-6 md:col-span-2">
                {task.platform && <Badge variant="outline">{task.platform}</Badge>}
              </div>
              <div className="col-span-6 md:col-span-1 flex justify-center">
                {assignee && (
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={assignee.avatar_url || undefined} alt={assignee.first_name || ''} />
                    <AvatarFallback>{assignee.first_name?.[0]}{assignee.last_name?.[0]}</AvatarFallback>
                  </Avatar>
                )}
              </div>
              <div className="col-span-6 md:col-span-2 text-sm text-gray-600 flex items-center justify-end">
                {task.due_date && (
                  <div className={cn('flex items-center gap-2', isOverdue && 'text-red-500')}>
                    <Clock className="w-4 h-4" />
                    <span>{format(new Date(task.due_date), 'MMM dd, yyyy')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TaskListView;
