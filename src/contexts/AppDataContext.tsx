import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useTeam } from '@/hooks/useTeam';
import { useActivity } from '@/hooks/useActivity';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface AppDataContextType {
  // Tasks data
  tasks: any[];
  tasksLoading: boolean;
  refreshTasks: () => Promise<void>;
  
  // Team data
  teamMembers: any[];
  teamLoading: boolean;
  refreshTeam: () => Promise<void>;
  
  // Activity data
  activities: any[];
  activitiesLoading: boolean;
  refreshActivities: () => Promise<void>;
  
  // Global refresh
  refreshAll: () => Promise<void>;
  
  // Connection status
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  
  // Analytics data
  analytics: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    completionRate: number;
    averageCompletionTime: number;
    tasksByPlatform: Record<string, number>;
    tasksByPriority: Record<string, number>;
    teamProductivity: Array<{ memberId: string; name: string; completedTasks: number; efficiency: number }>;
    weeklyProgress: Array<{ week: string; completed: number; created: number }>;
  };
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { tasks, loading: tasksLoading, refetch: refreshTasks } = useTasks();
  const { teamMembers, loading: teamLoading, refetch: refreshTeam } = useTeam();
  const { activities, loading: activitiesLoading, refetch: refreshActivities } = useActivity();
  
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [analytics, setAnalytics] = useState<AppDataContextType['analytics']>({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
    averageCompletionTime: 0,
    tasksByPlatform: {},
    tasksByPriority: {},
    teamProductivity: [],
    weeklyProgress: []
  });

  // Use refs to track connection state across re-renders
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeChannelRef = useRef<RealtimeChannel | null>(null);
  const isConnectingRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setConnectionStatus('disconnected');
      return;
    }

    const maxRetries = 5;
    const baseDelay = 1000; // Start with 1 second
    const maxDelay = 30000; // Max 30 seconds

    const cleanupChannel = async () => {
      if (activeChannelRef.current) {
        try {
          await supabase.removeChannel(activeChannelRef.current);
        } catch (error) {
          console.warn('Error removing channel:', error);
        } finally {
          activeChannelRef.current = null;
        }
      }
    };

    const setupRealtimeSubscription = async () => {
      // Prevent multiple simultaneous connection attempts
      if (isConnectingRef.current || !isMountedRef.current) return;
      
      isConnectingRef.current = true;
      setConnectionStatus('connecting');

      try {
        // Clean up existing channel first
        await cleanupChannel();

        // Create new channel
        const channel = supabase
          .channel(`tasks_${user.id}`, {
            config: {
              broadcast: { ack: true, self: false },
              presence: { key: user.id }
            }
          })
          .on(
            'postgres_changes',
            { 
              event: '*', 
              schema: 'public', 
              table: 'tasks',
              filter: `assignee_id=eq.${user.id}` // Only listen to user's tasks
            },
            async (payload) => {
              if (!isMountedRef.current) return;
              
              console.log('Realtime change received:', payload.eventType, payload.table);
              
              // Debounced refresh to avoid excessive API calls
              try {
                await refreshTasks();
              } catch (error) {
                console.error('Error refreshing tasks after realtime update:', error);
              }
            }
          );

        activeChannelRef.current = channel;
        
        // Subscribe with timeout
        const subscriptionPromise = new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Subscription timeout'));
          }, 10000); // 10 second timeout

          channel.subscribe((status: string, err?: Error) => {
            clearTimeout(timeout);
            
            if (!isMountedRef.current) return;

            console.log('Subscription status:', status);
            
            switch (status) {
              case 'SUBSCRIBED':
                console.log('Successfully subscribed to realtime channel');
                setConnectionStatus('connected');
                retryCountRef.current = 0; // Reset retry count
                isConnectingRef.current = false;
                resolve();
                break;
                
              case 'CHANNEL_ERROR':
              case 'TIMED_OUT':
              case 'CLOSED':
                console.warn(`Connection ${status.toLowerCase()}:`, err);
                setConnectionStatus('error');
                isConnectingRef.current = false;
                reject(new Error(`Connection ${status.toLowerCase()}`));
                break;
                
              default:
                console.log('Connection status:', status);
            }
          });
        });

        await subscriptionPromise;
        
      } catch (error) {
        console.error('Error setting up realtime subscription:', error);
        
        if (!isMountedRef.current) return;
        
        setConnectionStatus('error');
        isConnectingRef.current = false;
        
        // Only retry if we haven't exceeded max retries
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          
          // Exponential backoff with jitter
          const jitter = Math.random() * 1000; // Add up to 1 second of jitter
          const delay = Math.min(baseDelay * Math.pow(2, retryCountRef.current - 1) + jitter, maxDelay);
          
          console.log(`Retrying connection in ${Math.round(delay)}ms... (Attempt ${retryCountRef.current}/${maxRetries})`);
          
          retryTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              setupRealtimeSubscription();
            }
          }, delay);
        } else {
          console.error('Max retries reached. Real-time updates disabled.');
          setConnectionStatus('disconnected');
        }
      }
    };

    // Initial connection
    setupRealtimeSubscription();

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      
      isConnectingRef.current = false;
      
      cleanupChannel();
    };
  }, [user, refreshTasks]);

  // Calculate analytics whenever tasks or team data changes
  useEffect(() => {
    if (!tasks.length) return;

    const now = new Date();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const overdueTasks = tasks.filter(task => 
      task.due_date && new Date(task.due_date) < now && task.status !== 'completed'
    ).length;
    
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Calculate average completion time
    const completedTasksWithDates = tasks.filter(task => 
      task.status === 'completed' && task.created_at && task.completed_at
    );
    const averageCompletionTime = completedTasksWithDates.length > 0 
      ? completedTasksWithDates.reduce((acc, task) => {
          const created = new Date(task.created_at);
          const completed = new Date(task.completed_at);
          return acc + (completed.getTime() - created.getTime());
        }, 0) / completedTasksWithDates.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    // Tasks by platform
    const tasksByPlatform = tasks.reduce((acc, task) => {
      const platform = task.platform || 'general';
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Tasks by priority
    const tasksByPriority = tasks.reduce((acc, task) => {
      const priority = task.priority || 'medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Team productivity
    const teamProductivity = teamMembers.map(member => {
      const memberTasks = tasks.filter(task => task.assignee_id === member.id);
      const memberCompletedTasks = memberTasks.filter(task => task.status === 'completed').length;
      const efficiency = memberTasks.length > 0 
        ? Math.round((memberCompletedTasks / memberTasks.length) * 100)
        : 0;
      
      return {
        memberId: member.id,
        name: `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Unknown',
        completedTasks: memberCompletedTasks,
        efficiency
      };
    });

    // Weekly progress (last 8 weeks)
    const weeklyProgress = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekTasks = tasks.filter(task => {
        const taskDate = new Date(task.created_at);
        return taskDate >= weekStart && taskDate <= weekEnd;
      });
      
      const weekCompleted = weekTasks.filter(task => 
        task.status === 'completed' && 
        task.completed_at && 
        new Date(task.completed_at) >= weekStart && 
        new Date(task.completed_at) <= weekEnd
      ).length;

      weeklyProgress.push({
        week: `Week ${8 - i}`,
        completed: weekCompleted,
        created: weekTasks.length
      });
    }

    setAnalytics({
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      completionRate,
      averageCompletionTime: Math.round(averageCompletionTime * 10) / 10,
      tasksByPlatform,
      tasksByPriority,
      teamProductivity,
      weeklyProgress
    });
  }, [tasks, teamMembers]);

  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([
        refreshTasks(),
        refreshTeam(),
        refreshActivities()
      ]);
    } catch (error) {
      console.error('Error refreshing all data:', error);
    }
  }, [refreshTasks, refreshTeam, refreshActivities]);

  const value = {
    // Tasks
    tasks,
    tasksLoading,
    refreshTasks,
    
    // Team
    teamMembers,
    teamLoading,
    refreshTeam,
    
    // Activities
    activities,
    activitiesLoading,
    refreshActivities,
    
    // Global
    refreshAll,
    
    // Connection status
    connectionStatus,
    
    // Analytics
    analytics
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
