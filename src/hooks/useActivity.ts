
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
  user?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export const useActivity = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);
  const fetchedRef = useRef(false);

  const fetchActivities = async () => {
    if (!user) return;
    
    try {
      console.log('Fetching activities...');
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          user:profiles!user_id(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching activities:', error);
        throw error;
      }
      
      console.log('Activities fetched successfully:', data?.length || 0);
      setActivities(data || []);
      fetchedRef.current = true;
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !fetchedRef.current) {
      fetchActivities();
      
      // Only set up realtime if not already subscribed
      if (!isSubscribedRef.current) {
        // Clean up any existing channel first
        if (channelRef.current) {
          console.log('Cleaning up existing activity channel');
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
        
        // Set up realtime subscription with unique channel name
        const channelName = `activity-realtime-${user.id}-${Date.now()}`;
        console.log('Setting up activity realtime channel:', channelName);
        
        channelRef.current = supabase
          .channel(channelName)
          .on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'activity_logs' },
            (payload) => { 
              console.log('Activity updated via realtime:', payload);
              fetchActivities(); 
            }
          )
          .subscribe((status) => {
            console.log('Activity realtime status:', status);
            if (status === 'SUBSCRIBED') {
              isSubscribedRef.current = true;
            } else if (status === 'CLOSED') {
              isSubscribedRef.current = false;
            }
          });
      }
    }

    return () => {
      if (channelRef.current) {
        console.log('Cleanup: removing activity channel');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [user?.id]);

  return { activities, loading, refetch: fetchActivities };
};
