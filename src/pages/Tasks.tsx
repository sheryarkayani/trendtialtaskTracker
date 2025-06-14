
import React, { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useTeam } from '@/hooks/useTeam';
import TaskHeader from '@/components/TaskHeader';
import TaskFilters from '@/components/TaskFilters';
import TaskStats from '@/components/TaskStats';
import TaskListView from '@/components/TaskListView';
import TaskBoard from '@/components/TaskBoard';
import CreateTaskDialog from '@/components/CreateTaskDialog';

const Tasks = () => {
  const { tasks, loading, refetch } = useTasks();
  const { teamMembers } = useTeam();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesPlatform = platformFilter === 'all' || task.platform === platformFilter;
    const matchesAssignee = assigneeFilter === 'all' || task.assignee_id === assigneeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesPlatform && matchesAssignee;
  });

  const handleTaskCreated = () => {
    setCreateDialogOpen(false);
    refetch();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setPlatformFilter('all');
    setAssigneeFilter('all');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading campaigns...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <TaskHeader 
          viewMode={viewMode}
          setViewMode={setViewMode}
          onCreateTask={() => setCreateDialogOpen(true)}
        />

        {viewMode === 'list' && (
          <TaskFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            platformFilter={platformFilter}
            setPlatformFilter={setPlatformFilter}
            assigneeFilter={assigneeFilter}
            setAssigneeFilter={setAssigneeFilter}
            teamMembers={teamMembers}
            onClearFilters={handleClearFilters}
          />
        )}

        <TaskStats 
          tasks={tasks}
          filteredTasks={filteredTasks}
          viewMode={viewMode}
        />

        {viewMode === 'kanban' ? (
          <TaskBoard />
        ) : (
          <TaskListView 
            filteredTasks={filteredTasks}
            teamMembers={teamMembers}
          />
        )}

        <CreateTaskDialog 
          open={createDialogOpen} 
          onOpenChange={setCreateDialogOpen}
          onSuccess={handleTaskCreated}
        />
      </div>
    </div>
  );
};

export default Tasks;
