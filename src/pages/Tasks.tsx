
import React, { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useTeam } from '@/hooks/useTeam';
import { useClients } from '@/hooks/useClients';
import TaskHeader from '@/components/TaskHeader';
import TaskFilters from '@/components/TaskFilters';
import TaskStats from '@/components/TaskStats';
import TaskListView from '@/components/TaskListView';
import TaskBoard from '@/components/TaskBoard';
import CreateTaskDialog from '@/components/CreateTaskDialog';
import CreateClientDialog from '@/components/CreateClientDialog';
import ClientCard from '@/components/ClientCard';
import { Button } from '@/components/ui/button';
import { Building2, Plus } from 'lucide-react';

const Tasks = () => {
  const { tasks, loading, refetch } = useTasks();
  const { teamMembers } = useTeam();
  const { clients } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'clients'>('kanban');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createClientDialogOpen, setCreateClientDialogOpen] = useState(false);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesPlatform = platformFilter === 'all' || task.platform === platformFilter;
    const matchesAssignee = assigneeFilter === 'all' || task.assignee_id === assigneeFilter;
    const matchesClient = clientFilter === 'all' || task.client_id === clientFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesPlatform && matchesAssignee && matchesClient;
  });

  const handleTaskCreated = () => {
    setCreateDialogOpen(false);
    refetch();
  };

  const handleClientCreated = () => {
    setCreateClientDialogOpen(false);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setPlatformFilter('all');
    setAssigneeFilter('all');
    setClientFilter('all');
  };

  const getClientTaskCount = (clientId: string) => {
    return tasks.filter(task => task.client_id === clientId).length;
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

        {viewMode === 'clients' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Client Management</h2>
              <Button 
                onClick={() => setCreateClientDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Client
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  taskCount={getClientTaskCount(client.id)}
                  teamCount={0} // TODO: Implement team assignments
                  onClick={() => setClientFilter(client.id)}
                />
              ))}
            </div>
          </div>
        )}

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
            clientFilter={clientFilter}
            setClientFilter={setClientFilter}
            teamMembers={teamMembers}
            clients={clients}
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
        ) : viewMode === 'list' ? (
          <TaskListView 
            filteredTasks={filteredTasks}
            teamMembers={teamMembers}
          />
        ) : null}

        <CreateTaskDialog 
          open={createDialogOpen} 
          onOpenChange={setCreateDialogOpen}
          onSuccess={handleTaskCreated}
        />

        <CreateClientDialog 
          open={createClientDialogOpen} 
          onOpenChange={setCreateClientDialogOpen}
          onSuccess={handleClientCreated}
        />
      </div>
    </div>
  );
};

export default Tasks;
