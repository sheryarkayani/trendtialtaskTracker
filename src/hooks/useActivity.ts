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

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          user:profiles!user_id(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchActivities();
      
      // Only set up realtime if not already subscribed
      if (!isSubscribedRef.current) {
        // Clean up any existing channel first
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
        
        // Set up realtime subscription with unique channel name
        const channelName = `activity-changes-${user.id}-${Date.now()}-${Math.random()}`;
        channelRef.current = supabase
          .channel(channelName)
          .on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'activity_logs' },
            () => { 
              console.log('Activity updated via realtime');
              fetchActivities(); 
            }
          )
          .subscribe((status) => {
            console.log('Activity channel status:', status);
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
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [user?.id]); // Only depend on user ID to avoid unnecessary re-runs

  return { activities, loading, refetch: fetchActivities };
};
