
import React, { useState } from 'react';
import { useClients } from '@/hooks/useClients';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter } from 'lucide-react';
import CreateClientDialog from '@/components/CreateClientDialog';
import EditClientDialog from '@/components/EditClientDialog';
import ClientManagementCard from '@/components/ClientManagementCard';
import { Client } from '@/types/client';
import { toast } from '@/hooks/use-toast';

const Clients = () => {
  const { clients, loading, deleteClient } = useClients();
  const { tasks } = useTasks();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getClientTaskCount = (clientId: string) => {
    return tasks.filter(task => task.client_id === clientId).length;
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setEditDialogOpen(true);
  };

  const handleDeleteClient = async (client: Client) => {
    if (window.confirm(`Are you sure you want to delete "${client.name}"? This action cannot be undone.`)) {
      try {
        await deleteClient(client.id);
        toast({
          title: "Client deleted",
          description: "The client has been deleted successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete client. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading clients...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
            <p className="text-gray-600">Manage your clients and track their campaigns</p>
          </div>
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={handleClearFilters}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Total Clients</h3>
            <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Active Clients</h3>
            <p className="text-2xl font-bold text-green-600">
              {clients.filter(c => c.status === 'active').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Inactive Clients</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {clients.filter(c => c.status === 'inactive').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Total Campaigns</h3>
            <p className="text-2xl font-bold text-blue-600">{tasks.length}</p>
          </div>
        </div>

        {/* Client Grid */}
        {filteredClients.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm border">
            <div className="text-gray-400 mb-4">
              <Building2 className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first client'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Client
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <ClientManagementCard
                key={client.id}
                client={client}
                taskCount={getClientTaskCount(client.id)}
                teamCount={0} // TODO: Implement team assignments
                onEdit={handleEditClient}
                onDelete={handleDeleteClient}
              />
            ))}
          </div>
        )}

        {/* Dialogs */}
        <CreateClientDialog 
          open={createDialogOpen} 
          onOpenChange={setCreateDialogOpen}
          onSuccess={() => setCreateDialogOpen(false)}
        />

        <EditClientDialog 
          open={editDialogOpen} 
          onOpenChange={setEditDialogOpen}
          client={selectedClient}
          onSuccess={() => setEditDialogOpen(false)}
        />
      </div>
    </div>
  );
};

export default Clients;
