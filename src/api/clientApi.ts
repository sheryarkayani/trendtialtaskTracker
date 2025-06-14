
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/client';

export const fetchClients = async () => {
  console.log('Fetching clients...');
  const { data, error } = await supabase
    .from('clients')
    .select('*')
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
}, userId: string) => {
  console.log('Creating new client:', clientData);
  const { error } = await supabase
    .from('clients')
    .insert([{
      ...clientData,
      organization_id: '00000000-0000-0000-0000-000000000001', // Default org
      status: 'active'
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
