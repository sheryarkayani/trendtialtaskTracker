import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Global singleton for realtime subscription
let globalClientChannel: any = null;
let clientSubscriberCount = 0;
let globalClientUserId: string | null = null;
let isClientSubscribing = false;

export const useClientsRealtime = () => {
  const setupGlobalClientsRealtime = useCallback(async (userId: string) => {
    if (globalClientChannel || !userId || isClientSubscribing) return;

    // console.log('Setting up global clients realtime subscription for user:', userId);
    isClientSubscribing = true;
    
    try {
      globalClientChannel = supabase
        .channel(`clients-global-${userId}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'clients' },
          (payload) => { 
            // console.log('Clients updated via realtime:', payload);
            // Trigger refetch for all subscribers
            window.dispatchEvent(new CustomEvent('clients-updated'));
          }
        );

      await globalClientChannel.subscribe((status: string) => {
        // console.log('Global clients realtime status:', status);
        isClientSubscribing = false;
      });
    } catch (error) {
      // console.error('Error setting up clients realtime subscription:', error);
      isClientSubscribing = false;
      globalClientChannel = null;
    }
  }, []);

  const cleanupGlobalClientsRealtime = useCallback(() => {
    if (globalClientChannel && clientSubscriberCount === 0) {
      // console.log('Cleaning up global clients realtime subscription');
      supabase.removeChannel(globalClientChannel);
      globalClientChannel = null;
      globalClientUserId = null;
      isClientSubscribing = false;
    }
  }, []);

  const subscribeToClientsRealtime = useCallback((userId: string) => {
    clientSubscriberCount++;
    
    // Set up global realtime if user changed or doesn't exist
    if (globalClientUserId !== userId) {
      if (globalClientChannel) {
        supabase.removeChannel(globalClientChannel);
        globalClientChannel = null;
        isClientSubscribing = false;
      }
      globalClientUserId = userId;
      setupGlobalClientsRealtime(userId);
    } else if (!globalClientChannel && !isClientSubscribing) {
      setupGlobalClientsRealtime(userId);
    }
  }, [setupGlobalClientsRealtime]);

  const unsubscribeFromClientsRealtime = useCallback(() => {
    clientSubscriberCount = Math.max(0, clientSubscriberCount - 1);
    // Clean up global channel if no more subscribers
    setTimeout(cleanupGlobalClientsRealtime, 100);
  }, [cleanupGlobalClientsRealtime]);

  return {
    subscribeToClientsRealtime,
    unsubscribeFromClientsRealtime
  };
};
