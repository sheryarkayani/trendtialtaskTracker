
import React, { useState, useMemo } from 'react';
import { useClients } from '@/hooks/useClients';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Plus, Building2, TrendingUp, AlertCircle, Users } from 'lucide-react';
import CreateClientDialog from '@/components/CreateClientDialog';
import EditClientDialog from '@/components/EditClientDialog';
import EnhancedClientCard from '@/components/EnhancedClientCard';
import ClientDetailModal from '@/components/ClientDetailModal';
import EnhancedClientFilters from '@/components/EnhancedClientFilters';
import ClientBulkActions from '@/components/ClientBulkActions';
import { Client } from '@/types/client';
import { toast } from '@/hooks/use-toast';
import { bulkUpdateClients } from '@/api/clientApi';

const Clients = () => {
  const { clients, loading, deleteClient, updateClient } = useClients();
  const { tasks } = useTasks();
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    healthStatus: '',
    contractStatus: '',
    accountManager: '',
    industry: '',
    clientSize: '',
    lastContact: ''
  });

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchMatch = 
          client.name.toLowerCase().includes(searchLower) ||
          client.company?.toLowerCase().includes(searchLower) ||
          client.email?.toLowerCase().includes(searchLower) ||
          client.description?.toLowerCase().includes(searchLower);
        if (!searchMatch) return false;
      }

      // Status filter
      if (filters.status && client.status !== filters.status) return false;

      // Health status filter
      if (filters.healthStatus && client.health_status !== filters.healthStatus) return false;

      // Contract status filter
      if (filters.contractStatus) {
        const now = new Date();
        const contractEndDate = client.contract_end_date ? new Date(client.contract_end_date) : null;
        
        switch (filters.contractStatus) {
          case 'active':
            if (!contractEndDate || contractEndDate <= now) return false;
            break;
          case 'expiring':
            if (!contractEndDate) return false;
            const daysUntilExpiry = (contractEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
            if (daysUntilExpiry < 0 || daysUntilExpiry > 30) return false;
            break;
          case 'expired':
            if (!contractEndDate || contractEndDate > now) return false;
            break;
        }
      }

      // Client size filter
      if (filters.clientSize && client.client_size !== filters.clientSize) return false;

      // Last contact filter
      if (filters.lastContact) {
        const now = new Date();
        const lastContact = client.last_contact_date ? new Date(client.last_contact_date) : null;
        
        switch (filters.lastContact) {
          case 'this_week':
            if (!lastContact) return false;
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (lastContact < weekAgo) return false;
            break;
          case 'this_month':
            if (!lastContact) return false;
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (lastContact < monthAgo) return false;
            break;
          case 'over_30_days':
            if (!lastContact) return true;
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (lastContact >= thirtyDaysAgo) return false;
            break;
        }
      }

      return true;
    });
  }, [clients, filters]);

  const getClientTaskCount = (clientId: string) => {
    return tasks.filter(task => task.client_id === clientId && task.status !== 'completed').length;
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setDetailModalOpen(true);
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

  const handleSendMessage = (client: Client) => {
    // Placeholder for messaging functionality
    toast({
      title: "Message Feature",
      description: "Message functionality would be implemented here.",
    });
  };

  const handleSelectClient = (clientId: string) => {
    setSelectedClientIds(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedClientIds.length === filteredClients.length) {
      setSelectedClientIds([]);
    } else {
      setSelectedClientIds(filteredClients.map(client => client.id));
    }
  };

  const handleBulkAction = async (action: string, value?: string) => {
    if (!user || selectedClientIds.length === 0) return;

    setBulkActionLoading(true);
    try {
      switch (action) {
        case 'changeStatus':
          if (value) {
            await bulkUpdateClients(selectedClientIds, { status: value as any }, user.id);
            toast({
              title: "Success",
              description: `Updated ${selectedClientIds.length} clients status to ${value}`,
            });
          }
          break;
        case 'assignManager':
          if (value) {
            await bulkUpdateClients(selectedClientIds, { account_manager_id: value }, user.id);
            toast({
              title: "Success",
              description: `Assigned manager to ${selectedClientIds.length} clients`,
            });
          }
          break;
        case 'sendEmail':
          toast({
            title: "Email Feature",
            description: "Bulk email functionality would be implemented here.",
          });
          break;
        case 'export':
          toast({
            title: "Export Feature",
            description: "Export functionality would be implemented here.",
          });
          break;
        case 'archive':
          await bulkUpdateClients(selectedClientIds, { status: 'archived' }, user.id);
          toast({
            title: "Success",
            description: `Archived ${selectedClientIds.length} clients`,
          });
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedClientIds.length} clients?`)) {
            await bulkUpdateClients(selectedClientIds, { status: 'archived' }, user.id);
            toast({
              title: "Success",
              description: `Deleted ${selectedClientIds.length} clients`,
            });
          }
          break;
      }
      setSelectedClientIds([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform bulk action. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: clients.length,
      active: clients.filter(c => c.status === 'active').length,
      needsAttention: clients.filter(c => c.health_status === 'needs_attention').length,
      expiringContracts: clients.filter(c => {
        if (!c.contract_end_date) return false;
        const endDate = new Date(c.contract_end_date);
        const daysUntilExpiry = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
      }).length,
      totalCampaigns: tasks.length
    };
  }, [clients, tasks]);

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
            <p className="text-gray-600">Manage your clients and track their relationships</p>
          </div>
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </Button>
        </div>

        {/* Enhanced Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Clients</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <div className="flex items-center mt-1">
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600">+12% this month</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Active Clients</h3>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            <div className="text-xs text-gray-500 mt-1">
              {((stats.active / stats.total) * 100).toFixed(0)}% of total
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Needs Attention</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.needsAttention}</p>
            <div className="flex items-center mt-1">
              <AlertCircle className="w-3 h-3 text-yellow-500 mr-1" />
              <span className="text-xs text-yellow-600">Requires follow-up</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Expiring Contracts</h3>
            <p className="text-2xl font-bold text-red-600">{stats.expiringContracts}</p>
            <div className="text-xs text-gray-500 mt-1">Next 30 days</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Campaigns</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.totalCampaigns}</p>
            <div className="text-xs text-gray-500 mt-1">All clients</div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <EnhancedClientFilters
          filters={filters}
          onFiltersChange={setFilters}
          resultCount={filteredClients.length}
        />

        {/* Select All Checkbox */}
        {filteredClients.length > 0 && (
          <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedClientIds.length === filteredClients.length && filteredClients.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                {selectedClientIds.length > 0 
                  ? `${selectedClientIds.length} of ${filteredClients.length} clients selected`
                  : `Select all ${filteredClients.length} clients`
                }
              </span>
            </div>
          </div>
        )}

        {/* Client Grid */}
        {filteredClients.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm border">
            <div className="text-gray-400 mb-4">
              <Building2 className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-600 mb-4">
              {Object.values(filters).some(f => f !== '') 
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first client'
              }
            </p>
            {!Object.values(filters).some(f => f !== '') && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Client
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <EnhancedClientCard
                key={client.id}
                client={client}
                taskCount={getClientTaskCount(client.id)}
                teamCount={0} // TODO: Implement team assignments
                onView={handleViewClient}
                onEdit={handleEditClient}
                onDelete={handleDeleteClient}
                onSendMessage={handleSendMessage}
                isSelected={selectedClientIds.includes(client.id)}
                onSelect={handleSelectClient}
              />
            ))}
          </div>
        )}

        {/* Bulk Actions */}
        <ClientBulkActions
          selectedCount={selectedClientIds.length}
          onClearSelection={() => setSelectedClientIds([])}
          onBulkAction={handleBulkAction}
          isLoading={bulkActionLoading}
        />

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

        <ClientDetailModal
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          client={selectedClient}
          onUpdate={updateClient}
        />
      </div>
    </div>
  );
};

export default Clients;
