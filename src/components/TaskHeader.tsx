
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, List, LayoutGrid, Building2 } from 'lucide-react';

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
        <p className="text-gray-600">Manage your social media campaigns and client projects</p>
      </div>

      <div className="flex items-center gap-4">
        <Select value={viewMode} onValueChange={(value: 'list' | 'kanban' | 'clients') => setViewMode(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kanban">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4" />
                Kanban Board
              </div>
            </SelectItem>
            <SelectItem value="list">
              <div className="flex items-center gap-2">
                <List className="w-4 h-4" />
                List View
              </div>
            </SelectItem>
            <SelectItem value="clients">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Client View
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={onCreateTask} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>
    </div>
  );
};

export default TaskHeader;
