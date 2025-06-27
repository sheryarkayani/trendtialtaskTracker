import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Database } from '@/integrations/supabase/types';
import { RealtimeChannel } from '@supabase/supabase-js';

type Notification = Database['public']['Tables']['notifications']['Row'] & {
  sender: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
};

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async (limit = 50) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:profiles!notifications_sender_id_fkey(
            id, first_name, last_name, email
          )
        `)
        .eq('recipient_id', user?.id)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setNotifications(data || []);
      
      // Count unread notifications
      const unread = data?.filter(n => !n.is_read).length || 0;
      setUnreadCount(unread);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase.rpc('mark_notification_read', {
        notification_id: notificationId
      });

      if (error) throw error;

      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notificationId 
          ? { ...n, is_read: true, read_at: new Date().toISOString() }
          : n
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', unreadIds)
        .eq('recipient_id', user?.id);

      if (error) throw error;

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('recipient_id', user?.id);

      if (error) throw error;

      // Update local state
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const createNotification = async (notificationData: {
    recipient_id: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    expires_at?: string;
  }) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notificationData,
          sender_id: user?.id,
          organization_id: profile?.organization_id,
        })
        .select(`
          *,
          sender:profiles!notifications_sender_id_fkey(
            id, first_name, last_name, email
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const getNotificationsByType = (type: string) => {
    return notifications.filter(n => n.type === type);
  };

  const getUnreadNotifications = () => {
    return notifications.filter(n => !n.is_read);
  };

  const getPriorityNotifications = (priority: 'high' | 'urgent') => {
    return notifications.filter(n => n.priority === priority && !n.is_read);
  };

  // Real-time subscription for notifications
  useEffect(() => {
    if (!user?.id) return;

    let channel: RealtimeChannel;

    const setupRealtimeSubscription = () => {
      channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotification = payload.new as Notification;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show browser notification for high priority items
            if (newNotification.priority === 'high' || newNotification.priority === 'urgent') {
              if (Notification.permission === 'granted') {
                new Notification(newNotification.title, {
                  body: newNotification.message,
                  icon: '/favicon.ico',
                });
              }
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${user.id}`,
          },
          (payload) => {
            const updatedNotification = payload.new as Notification;
            setNotifications(prev => prev.map(n => 
              n.id === updatedNotification.id ? updatedNotification : n
            ));
          }
        )
        .subscribe();
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user?.id]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Fetch notifications on mount
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    getNotificationsByType,
    getUnreadNotifications,
    getPriorityNotifications,
    refreshNotifications: fetchNotifications,
  };
}; 