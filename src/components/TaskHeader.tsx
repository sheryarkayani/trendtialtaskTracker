import React from 'react';
import { Button } from '@/components/ui/button';
import { Kanban, List, Users, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskHeaderProps {
  viewMode: 'kanban' | 'list' | 'clients';
  setViewMode: (mode: 'kanban' | 'list' | 'clients') => void;
  onCreateTask: () => void;
  showClientView: boolean;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({ 
  viewMode, 
  setViewMode, 
  onCreateTask,
  showClientView
}) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
        <p className="text-muted-foreground mt-1">Manage your campaigns and tasks.</p>
      </div>
      <div className="flex items-center space-x-2 mt-4 md:mt-0">
        <div className="bg-muted p-1 rounded-lg flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('kanban')}
            className={cn(
              'flex items-center gap-2',
              viewMode === 'kanban' && 'bg-background shadow-sm'
            )}
          >
            <Kanban className="w-4 h-4" />
            <span>Kanban</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('list')}
            className={cn(
              'flex items-center gap-2',
              viewMode === 'list' && 'bg-background shadow-sm'
            )}
          >
            <List className="w-4 h-4" />
            <span>List</span>
          </Button>
          {showClientView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('clients')}
              className={cn(
                'flex items-center gap-2',
                viewMode === 'clients' && 'bg-background shadow-sm'
              )}
            >
              <Users className="w-4 h-4" />
              <span>Clients</span>
            </Button>
          )}
        </div>
        <Button 
          onClick={onCreateTask}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </Button>
      </div>
    </div>
  );
};

export default TaskHeader;
