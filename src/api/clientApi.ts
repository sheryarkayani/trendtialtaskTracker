
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/client';

export const fetchClients = async () => {
  console.log('Fetching clients...');
  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      account_manager:profiles!clients_account_manager_id_fkey(
        first_name,
        last_name,
        avatar_url
      )
    `)
    .eq('status', 'active')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
  
  console.log('Clients fetched successfully:', data?.length || 0);
  return data || [];
};

export const createClient = async (clientData: {
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
}, userId: string) => {
  console.log('Creating new client:', clientData);
  const { error } = await supabase
    .from('clients')
    .insert([{
      ...clientData,
      organization_id: '00000000-0000-0000-0000-000000000001', // Default org
      status: 'active',
      health_status: 'healthy',
      last_contact_date: new Date().toISOString()
    }]);

  if (error) throw error;
  
  // Create activity log
  await supabase
    .from('activity_logs')
    .insert([{
      user_id: userId,
      action: `created new client "${clientData.name}"`,
      entity_type: 'client',
      entity_id: null
    }]);
    
  console.log('Client created successfully');
};

export const updateClient = async (clientId: string, updates: Partial<Client>, userId: string) => {
  console.log('Updating client:', clientId, updates);
  const { error } = await supabase
    .from('clients')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', clientId);

  if (error) throw error;
  
  // Create activity log
  await supabase
    .from('activity_logs')
    .insert([{
      user_id: userId,
      action: 'updated client details',
      entity_type: 'client',
      entity_id: clientId
    }]);
    
  console.log('Client updated successfully');
};

export const deleteClient = async (clientId: string, userId: string) => {
  console.log('Deleting client:', clientId);
  const { error } = await supabase
    .from('clients')
    .update({ status: 'archived' })
    .eq('id', clientId);

  if (error) throw error;
  
  // Create activity log
  await supabase
    .from('activity_logs')
    .insert([{
      user_id: userId,
      action: 'archived client',
      entity_type: 'client',
      entity_id: clientId
    }]);
    
  console.log('Client archived successfully');
};

export const bulkUpdateClients = async (clientIds: string[], updates: Partial<Client>, userId: string) => {
  console.log('Bulk updating clients:', clientIds, updates);
  const { error } = await supabase
    .from('clients')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .in('id', clientIds);

  if (error) throw error;
  
  // Create activity log
  await supabase
    .from('activity_logs')
    .insert([{
      user_id: userId,
      action: `bulk updated ${clientIds.length} clients`,
      entity_type: 'client',
      entity_id: null
    }]);
    
  console.log('Clients bulk updated successfully');
};

export const logClientCommunication = async (communicationData: {
  client_id: string;
  type: 'email' | 'phone' | 'meeting' | 'note';
  subject?: string;
  content: string;
  priority?: 'low' | 'normal' | 'high';
  follow_up_date?: string;
}, userId: string) => {
  console.log('Logging client communication:', communicationData);
  const { error } = await supabase
    .from('client_communications')
    .insert([{
      ...communicationData,
      user_id: userId
    }]);

  if (error) throw error;
  
  // Update last contact date on client
  await supabase
    .from('clients')
    .update({ 
      last_contact_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', communicationData.client_id);
    
  console.log('Client communication logged successfully');
};
