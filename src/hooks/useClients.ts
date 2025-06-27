import { useState, useEffect, useCallback } from 'react';
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

  const fetchClients = useCallback(async () => {
    if (!user) return;
    
    try {
      const fetchedClients = await apiFetchClients();
      // Ensure proper type casting for all string fields that have enum constraints
      const typedClients: Client[] = fetchedClients.map(client => ({
        ...client,
        status: client.status as 'active' | 'inactive' | 'archived',
        client_size: client.client_size as 'small' | 'medium' | 'large' | 'enterprise' | null,
        preferred_communication: client.preferred_communication as 'email' | 'phone' | 'slack' | 'teams' | null,
        health_status: client.health_status as 'healthy' | 'needs_attention' | 'issues'
      }));
      setClients(typedClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // console.log('Setting up clients hook for user:', user.id);
    fetchClients();
    subscribeToClientsRealtime(user.id);

    const handleClientsUpdate = () => {
      // console.log('Clients updated via realtime, refetching...');
      fetchClients();
    };

    window.addEventListener('clients-updated', handleClientsUpdate);

    return () => {
      // console.log('Cleanup: removing clients hook subscriber');
      unsubscribeFromClientsRealtime();
      window.removeEventListener('clients-updated', handleClientsUpdate);
    };
  }, [user, fetchClients, subscribeToClientsRealtime, unsubscribeFromClientsRealtime]);

  const createClient = useCallback(async (clientData: {
    name: string;
    email?: string;
    company?: string;
    description?: string;
    brand_color?: string;
    phone?: string;
    address?: string;
    industry?: string;
    client_size?: 'small' | 'medium' | 'large' | 'enterprise';
    preferred_communication?: 'email' | 'phone' | 'slack' | 'teams';
    time_zone?: string;
    account_manager_id?: string;
    contract_start_date?: string;
    contract_end_date?: string;
    monthly_retainer?: number;
  }) => {
    if (!user) return;
    
    try {
      await apiCreateClient(clientData, user.id);
      await fetchClients();
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }, [user, fetchClients]);

  const updateClient = useCallback(async (clientId: string, updates: Partial<Client>) => {
    if (!user) return;
    
    try {
      await apiUpdateClient(clientId, updates, user.id);
      await fetchClients();
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }, [user, fetchClients]);

  const deleteClient = useCallback(async (clientId: string) => {
    if (!user) return;
    
    try {
      await apiDeleteClient(clientId, user.id);
      await fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }, [user, fetchClients]);

  return { 
    clients, 
    loading, 
    refetch: fetchClients, 
    createClient,
    updateClient,
    deleteClient
  };
};
