
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useClientsRealtime } from './useClientsRealtime';
import { Client } from '@/types/client';
import { 
  fetchClients as apiFetchClients,
  createClient as apiCreateClient,
  updateClient as apiUpdateClient,
  deleteClient as apiDeleteClient
} from '@/api/clientApi';

export const useClients = () => {
  const { user } = useAuth();
  const { subscribeToClientsRealtime, unsubscribeFromClientsRealtime } = useClientsRealtime();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    if (!user) return;
    
    try {
      const fetchedClients = await apiFetchClients();
      // Ensure proper type casting for status field
      const typedClients = fetchedClients.map(client => ({
        ...client,
        status: client.status as 'active' | 'inactive' | 'archived'
      }));
      setClients(typedClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    console.log('Setting up clients hook for user:', user.id);
    fetchClients();
    subscribeToClientsRealtime(user.id);

    const handleClientsUpdate = () => {
      console.log('Clients updated via realtime, refetching...');
      fetchClients();
    };

    window.addEventListener('clients-updated', handleClientsUpdate);

    return () => {
      console.log('Cleanup: removing clients hook subscriber');
      unsubscribeFromClientsRealtime();
      window.removeEventListener('clients-updated', handleClientsUpdate);
    };
  }, [user?.id]);

  const createClient = async (clientData: {
    name: string;
    email?: string;
    company?: string;
    description?: string;
    brand_color?: string;
  }) => {
    if (!user) return;
    
    try {
      await apiCreateClient(clientData, user.id);
      await fetchClients();
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  };

  const updateClient = async (clientId: string, updates: Partial<Client>) => {
    if (!user) return;
    
    try {
      await apiUpdateClient(clientId, updates, user.id);
      await fetchClients();
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  };

  const deleteClient = async (clientId: string) => {
    if (!user) return;
    
    try {
      await apiDeleteClient(clientId, user.id);
      await fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  };

  return { 
    clients, 
    loading, 
    refetch: fetchClients, 
    createClient,
    updateClient,
    deleteClient
  };
};
