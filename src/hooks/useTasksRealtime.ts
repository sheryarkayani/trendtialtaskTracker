
import { supabase } from '@/integrations/supabase/client';

// Global singleton for realtime subscription
let globalChannel: any = null;
let subscriberCount = 0;
let globalUserId: string | null = null;

export const useTasksRealtime = () => {
  const setupGlobalRealtime = (userId: string) => {
    if (globalChannel || !userId) return;

    console.log('Setting up global realtime subscription for user:', userId);
    
    globalChannel = supabase
      .channel(`tasks-global-${userId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => { 
          console.log('Tasks updated via realtime:', payload);
          // Trigger refetch for all subscribers
          window.dispatchEvent(new CustomEvent('tasks-updated'));
        }
      )
      .subscribe((status) => {
        console.log('Global tasks realtime status:', status);
      });
  };

  const cleanupGlobalRealtime = () => {
    if (globalChannel && subscriberCount === 0) {
      console.log('Cleaning up global realtime subscription');
      supabase.removeChannel(globalChannel);
      globalChannel = null;
      globalUserId = null;
    }
  };

  const subscribeToRealtime = (userId: string) => {
    subscriberCount++;
    
    // Set up global realtime if user changed or doesn't exist
    if (globalUserId !== userId) {
      if (globalChannel) {
        supabase.removeChannel(globalChannel);
        globalChannel = null;
      }
      globalUserId = userId;
      setupGlobalRealtime(userId);
    } else if (!globalChannel) {
      setupGlobalRealtime(userId);
    }
  };

  const unsubscribeFromRealtime = () => {
    subscriberCount--;
    // Clean up global channel if no more subscribers
    setTimeout(cleanupGlobalRealtime, 100);
  };

  return {
    subscribeToRealtime,
    unsubscribeFromRealtime
  };
};
