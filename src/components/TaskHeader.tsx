
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3, List, Building2 } from 'lucide-react';

interface TaskHeaderProps {
  viewMode: 'list' | 'kanban' | 'clients';
  setViewMode: (mode: 'list' | 'kanban' | 'clients') => void;
  onCreateTask: () => void;
}

const TaskHeader = ({ viewMode, setViewMode, onCreateTask }: TaskHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
        <p className="text-gray-600">Manage social media campaigns from brief to publication</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border">
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('kanban')}
            className="text-xs"
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            Pipeline
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="text-xs"
          >
            <List className="w-4 h-4 mr-1" />
            List
          </Button>
          <Button
            variant={viewMode === 'clients' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('clients')}
            className="text-xs"
          >
            <Building2 className="w-4 h-4 mr-1" />
            Clients
          </Button>
        </div>
        <Button onClick={onCreateTask} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>
    </div>
  );
};

export default TaskHeader;
