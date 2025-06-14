
import React from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, Building2, Plus } from 'lucide-react';

interface TaskHeaderProps {
  viewMode: 'list' | 'kanban' | 'clients';
  setViewMode: (mode: 'list' | 'kanban' | 'clients') => void;
  onCreateTask: () => void;
  showClientView?: boolean;
}

const TaskHeader = ({ viewMode, setViewMode, onCreateTask, showClientView = true }: TaskHeaderProps) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Campaign Management</h1>
        <p className="text-gray-600">Manage your social media campaigns and client projects</p>
      </div>
      
      <div className="flex items-center gap-3">
        {/* View Mode Toggle */}
        <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('kanban')}
            className="flex items-center gap-2"
          >
            <LayoutGrid className="w-4 h-4" />
            Kanban
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="flex items-center gap-2"
          >
            <List className="w-4 h-4" />
            List
          </Button>
          {showClientView && (
            <Button
              variant={viewMode === 'clients' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('clients')}
              className="flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              Clients
            </Button>
          )}
        </div>

        {/* Create Task Button */}
        <Button onClick={onCreateTask} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>
    </div>
  );
};

export default TaskHeader;
