import React, { useState, useMemo } from 'react';
import { Plus, MoreVertical, Grid, List, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import EnhancedClientCard from '@/components/EnhancedClientCard';
import ClientDetailModal from '@/components/ClientDetailModal';
import CreateClientDialog from '@/components/CreateClientDialog';
import EditClientDialog from '@/components/EditClientDialog';
import ClientBulkActions from '@/components/ClientBulkActions';
import { useClients } from '@/hooks/useClients';
import { Client } from '@/types/client';
import { useToast } from '@/hooks/use-toast';

interface ClientFilters {
  status: string[];
  healthStatus: string[];
  accountManager: string[];
  industry: string[];
  search: string;
}

const Clients = () => {
  const { clients, loading, createClient, updateClient, deleteClient } = useClients();
  const { toast } = useToast();
  
  // View and modal states
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  // Selection and bulk operations
  const [selectedClientIds, setSelectedClientIds] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState<ClientFilters>({
    status: [],
    healthStatus: [],
    accountManager: [],
    industry: [],
    search: ''
  });

  // Computed values
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          client.name.toLowerCase().includes(searchLower) ||
          (client.company?.toLowerCase().includes(searchLower)) ||
          (client.email?.toLowerCase().includes(searchLower)) ||
          (client.description?.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(client.status)) {
        return false;
      }

      // Health status filter
      if (filters.healthStatus.length > 0 && !filters.healthStatus.includes(client.health_status)) {
        return false;
      }

      // Account manager filter
      if (filters.accountManager.length > 0) {
        const managerName = client.account_manager 
          ? `${client.account_manager.first_name} ${client.account_manager.last_name}`
          : 'Unassigned';
        if (!filters.accountManager.includes(managerName)) return false;
      }

      // Industry filter
      if (filters.industry.length > 0) {
        if (!client.industry || !filters.industry.includes(client.industry)) return false;
      }

      return true;
    });
  }, [clients, filters]);

  const statistics = useMemo(() => {
    const total = clients.length;
    const active = clients.filter(c => c.status === 'active').length;
    const healthy = clients.filter(c => c.health_status === 'healthy').length;
    const needsAttention = clients.filter(c => c.health_status === 'needs_attention').length;
    const issues = clients.filter(c => c.health_status === 'issues').length;
    
    // Calculate contracts expiring in next 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringContracts = clients.filter(c => 
      c.contract_end_date && 
      new Date(c.contract_end_date) <= thirtyDaysFromNow &&
      new Date(c.contract_end_date) >= new Date()
    ).length;

    return { total, active, healthy, needsAttention, issues, expiringContracts };
  }, [clients]);

  // Event handlers
  const handleClientView = (client: Client) => {
    setSelectedClient(client);
    setIsDetailModalOpen(true);
  };

  const handleClientEdit = (client: Client) => {
    setEditingClient(client);
  };

  const handleClientDelete = async (clientId: string) => {
    try {
      await deleteClient(clientId);
      toast({
        title: "Client deleted",
        description: "The client has been successfully removed.",
      });
    } catch (error) {
      toast({
        title: "Error deleting client",
        description: "There was an error deleting the client. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClientUpdate = async (clientId: string, updates: Partial<Client>) => {
    try {
      await updateClient(clientId, updates);
      toast({
        title: "Client updated",
        description: "The client information has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error updating client",
        description: "There was an error updating the client. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClientCreate = async () => {
    try {
      setIsCreateDialogOpen(false);
      toast({
        title: "Client created",
        description: "The new client has been successfully created.",
      });
    } catch (error) {
      toast({
        title: "Error creating client",
        description: "There was an error creating the client. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClientSelection = (clientId: string, selected: boolean) => {
    const newSelection = new Set(selectedClientIds);
    if (selected) {
      newSelection.add(clientId);
    } else {
      newSelection.delete(clientId);
    }
    setSelectedClientIds(newSelection);
    setShowBulkActions(newSelection.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedClientIds.size === filteredClients.length) {
      setSelectedClientIds(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedClientIds(new Set(filteredClients.map(c => c.id)));
      setShowBulkActions(true);
    }
  };

  const handleBulkAction = async (action: string, data?: any) => {
    try {
      const promises = Array.from(selectedClientIds).map(clientId => {
        switch (action) {
          case 'status':
            return updateClient(clientId, { status: data.status });
          case 'manager':
            return updateClient(clientId, { account_manager_id: data.managerId });
          case 'delete':
            return deleteClient(clientId);
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);
      setSelectedClientIds(new Set());
      setShowBulkActions(false);
      
      toast({
        title: "Bulk action completed",
        description: `Successfully updated ${selectedClientIds.size} clients.`,
      });
    } catch (error) {
      toast({
        title: "Error with bulk action",
        description: "There was an error performing the bulk action. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="p-6 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
              <p className="text-gray-600">Manage your client relationships and contracts</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{statistics.total}</div>
                  <div className="text-sm text-gray-600">Total Clients</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{statistics.active}</div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{statistics.healthy}</div>
                  <div className="text-sm text-gray-600">Healthy</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{statistics.needsAttention}</div>
                  <div className="text-sm text-gray-600">Needs Attention</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{statistics.issues}</div>
                  <div className="text-sm text-gray-600">Issues</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{statistics.expiringContracts}</div>
                  <div className="text-sm text-gray-600">Expiring Soon</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search clients..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {filteredClients.length} of {clients.length} clients
                </span>
                {selectedClientIds.size > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedClientIds.size === filteredClients.length ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {showBulkActions && (
            <ClientBulkActions
              selectedCount={selectedClientIds.size}
              onAction={handleBulkAction}
              onCancel={() => {
                setSelectedClientIds(new Set());
                setShowBulkActions(false);
              }}
            />
          )}

          {/* Client Grid/List */}
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "space-y-4"
          }>
            {filteredClients.map((client) => (
              <EnhancedClientCard
                key={client.id}
                client={client}
                onView={handleClientView}
                onEdit={handleClientEdit}
                onDelete={() => handleClientDelete(client.id)}
                onSelect={handleClientSelection}
                isSelected={selectedClientIds.has(client.id)}
                showSelection={showBulkActions}
              />
            ))}
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
              <p className="text-gray-600 mb-4">
                {filters.search || filters.status.length > 0 || filters.healthStatus.length > 0
                  ? "Try adjusting your filters to see more clients."
                  : "Get started by adding your first client."
                }
              </p>
              {!filters.search && filters.status.length === 0 && filters.healthStatus.length === 0 && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Client
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedClient && (
        <ClientDetailModal
          isOpen={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
          client={selectedClient}
          onUpdate={handleClientUpdate}
        />
      )}

      <CreateClientDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleClientCreate}
      />

      {editingClient && (
        <EditClientDialog
          open={!!editingClient}
          onOpenChange={(open) => !open && setEditingClient(null)}
          client={editingClient}
          onSuccess={() => setEditingClient(null)}
        />
      )}
    </div>
  );
};

export default Clients;
