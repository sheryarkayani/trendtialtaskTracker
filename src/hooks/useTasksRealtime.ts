import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Global singleton for realtime subscription
let globalChannel: any = null;
let subscriberCount = 0;
let globalUserId: string | null = null;
let isSubscribing = false;

export const useTasksRealtime = () => {
  const setupGlobalRealtime = useCallback(async (userId: string) => {
    if (globalChannel || !userId || isSubscribing) return;

    console.log('Setting up global realtime subscription for user:', userId);
    isSubscribing = true;
    
    try {
      globalChannel = supabase
        .channel(`tasks-global-${userId}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'tasks' },
          (payload) => { 
            console.log('Tasks updated via realtime:', payload);
            // Trigger refetch for all subscribers
            window.dispatchEvent(new CustomEvent('tasks-updated'));
          }
        );

      await globalChannel.subscribe((status: string) => {
        console.log('Global tasks realtime status:', status);
        isSubscribing = false;
      });
    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
      isSubscribing = false;
      globalChannel = null;
    }
  }, []);

  const cleanupGlobalRealtime = useCallback(() => {
    if (globalChannel && subscriberCount === 0) {
      console.log('Cleaning up global realtime subscription');
      supabase.removeChannel(globalChannel);
      globalChannel = null;
      globalUserId = null;
      isSubscribing = false;
    }
  }, []);

  const subscribeToRealtime = useCallback((userId: string) => {
    subscriberCount++;
    
    // Set up global realtime if user changed or doesn't exist
    if (globalUserId !== userId) {
      if (globalChannel) {
        supabase.removeChannel(globalChannel);
        globalChannel = null;
        isSubscribing = false;
      }
      globalUserId = userId;
      setupGlobalRealtime(userId);
    } else if (!globalChannel && !isSubscribing) {
      setupGlobalRealtime(userId);
    }
  }, [setupGlobalRealtime]);

  const unsubscribeFromRealtime = useCallback(() => {
    subscriberCount = Math.max(0, subscriberCount - 1);
    // Clean up global channel if no more subscribers
    setTimeout(cleanupGlobalRealtime, 100);
  }, [cleanupGlobalRealtime]);

  return {
    subscribeToRealtime,
    unsubscribeFromRealtime
  };
};
