import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  platform: 'instagram' | 'facebook' | 'tiktok' | 'linkedin' | 'twitter' | null;
  assignee_id: string | null;
  project_id: string | null;
  organization_id: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  assignee?: {
    first_name: string | null;
    last_name: string | null;
  };
  comments_count?: number;
  attachments_count?: number;
}

// Global singleton for realtime subscription
let globalChannel: any = null;
let subscriberCount = 0;
let globalUserId: string | null = null;

export const useTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const subscribedRef = useRef(false);

  const fetchTasks = async () => {
    if (!user) return;
    
    try {
      console.log('Fetching tasks...');
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:profiles!assignee_id(first_name, last_name),
          comments_count:comments(count),
          attachments_count:attachments(count)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }
      
      // Process the data to get counts
      const processedTasks = data?.map(task => ({
        ...task,
        comments_count: task.comments_count?.[0]?.count || 0,
        attachments_count: task.attachments_count?.[0]?.count || 0,
      })) || [];

      console.log('Tasks fetched successfully:', processedTasks.length);
      setTasks(processedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    if (!user) return;

    console.log('Setting up tasks hook for user:', user.id);
    subscriberCount++;
    
    // Initial fetch
    fetchTasks();

    // Set up global realtime if user changed or doesn't exist
    if (globalUserId !== user.id) {
      if (globalChannel) {
        supabase.removeChannel(globalChannel);
        globalChannel = null;
      }
      globalUserId = user.id;
      setupGlobalRealtime(user.id);
    } else if (!globalChannel) {
      setupGlobalRealtime(user.id);
    }

    // Listen for global task updates
    const handleTasksUpdated = () => {
      fetchTasks();
    };

    window.addEventListener('tasks-updated', handleTasksUpdated);
    subscribedRef.current = true;

    // Cleanup function
    return () => {
      console.log('Cleanup: removing tasks hook subscriber');
      subscriberCount--;
      subscribedRef.current = false;
      window.removeEventListener('tasks-updated', handleTasksUpdated);
      
      // Clean up global channel if no more subscribers
      setTimeout(cleanupGlobalRealtime, 100);
    };
  }, [user?.id]);

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    if (!user) {
      console.error('No user authenticated');
      return;
    }
    
    try {
      console.log('Updating task status - TaskID:', taskId, 'New Status:', status);
      
      // First, check if the task exists
      const { data: existingTask, error: fetchError } = await supabase
        .from('tasks')
        .select('id, status, title')
        .eq('id', taskId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching task before update:', fetchError);
        throw fetchError;
      }
      
      if (!existingTask) {
        console.error('Task not found:', taskId);
        throw new Error('Task not found');
      }
      
      console.log('Found task:', existingTask.title, 'Current status:', existingTask.status);
      
      // Update the task status
      const { data: updatedTask, error: updateError } = await supabase
        .from('tasks')
        .update({ 
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating task status:', updateError);
        throw updateError;
      }
      
      console.log('Task status updated successfully:', updatedTask);
      
      // Create activity log
      try {
        await supabase
          .from('activity_logs')
          .insert([{
            user_id: user.id,
            action: `moved task to ${status}`,
            entity_type: 'task',
            entity_id: taskId
          }]);
        console.log('Activity log created');
      } catch (activityError) {
        console.warn('Failed to create activity log:', activityError);
        // Don't throw here, as the main task update succeeded
      }
        
      console.log('Task status update completed successfully');
      
      // Refresh tasks to get the latest data
      await fetchTasks();
      
    } catch (error) {
      console.error('Error in updateTaskStatus:', error);
      throw error;
    }
  };

  const createTask = async (taskData: {
    title: string;
    description?: string;
    priority?: Task['priority'];
    platform?: Task['platform'];
    assignee_id?: string;
    project_id?: string;
    due_date?: string;
  }) => {
    if (!user) return;
    
    try {
      console.log('Creating new task:', taskData);
      const { error } = await supabase
        .from('tasks')
        .insert([{
          ...taskData,
          organization_id: '00000000-0000-0000-0000-000000000001', // Default org
          status: 'todo' as const
        }]);

      if (error) throw error;
      
      // Create activity log
      await supabase
        .from('activity_logs')
        .insert([{
          user_id: user.id,
          action: `created new task "${taskData.title}"`,
          entity_type: 'task',
          entity_id: null
        }]);
        
      console.log('Task created successfully');
      await fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;
    
    try {
      console.log('Updating task:', taskId, updates);
      const { error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;
      
      // Create activity log
      await supabase
        .from('activity_logs')
        .insert([{
          user_id: user.id,
          action: 'updated task details',
          entity_type: 'task',
          entity_id: taskId
        }]);
        
      console.log('Task updated successfully');
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    
    try {
      console.log('Deleting task:', taskId);
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      
      // Create activity log
      await supabase
        .from('activity_logs')
        .insert([{
          user_id: user.id,
          action: 'deleted task',
          entity_type: 'task',
          entity_id: taskId
        }]);
        
      console.log('Task deleted successfully');
      await fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return { 
    tasks, 
    loading, 
    refetch: fetchTasks, 
    updateTaskStatus,
    createTask,
    updateTask,
    deleteTask
  };
};
