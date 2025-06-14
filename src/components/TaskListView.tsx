
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User, Calendar as CalendarIcon } from 'lucide-react';
import { Task } from '@/types/task';
import { cn } from '@/lib/utils';

interface TaskListViewProps {
  filteredTasks: Task[];
  teamMembers: Array<{ id: string; first_name: string | null; last_name: string | null; }>;
}

const TaskListView = ({ filteredTasks, teamMembers }: TaskListViewProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      instagram: '📸',
      facebook: '📘',
      tiktok: '🎵',
      linkedin: '💼',
      twitter: '🐦'
    };
    return icons[platform] || '📱';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6">
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const assignee = teamMembers.find(member => member.id === task.assignee_id);
            return (
              <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", getPriorityColor(task.priority))}
                      >
                        {task.priority}
                      </Badge>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {task.status === 'in-progress' ? 'Creating' : 
                         task.status === 'todo' ? 'Brief' :
                         task.status === 'review' ? 'Review' :
                         task.status === 'completed' ? 'Published' : task.status}
                      </Badge>
                      {task.platform && (
                        <Badge variant="outline" className="text-xs">
                          {getPlatformIcon(task.platform)} {task.platform}
                        </Badge>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {assignee && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{assignee.first_name} {assignee.last_name}</span>
                        </div>
                      )}
                      {task.due_date && (
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          <span>{new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TaskListView;
