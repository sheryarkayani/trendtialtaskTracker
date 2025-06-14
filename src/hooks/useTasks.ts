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

export const useTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);
  const fetchedRef = useRef(false);

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
      fetchedRef.current = true;
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !fetchedRef.current) {
      fetchTasks();
      
      // Only set up realtime if not already subscribed and user is authenticated
      if (!isSubscribedRef.current) {
        // Clean up any existing channel first
        if (channelRef.current) {
          console.log('Cleaning up existing channel');
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
        
        // Set up realtime subscription with unique channel name
        const channelName = `tasks-realtime-${user.id}-${Date.now()}`;
        console.log('Setting up realtime channel:', channelName);
        
        channelRef.current = supabase
          .channel(channelName)
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'tasks' },
            (payload) => { 
              console.log('Tasks updated via realtime:', payload);
              fetchTasks(); 
            }
          )
          .subscribe((status) => {
            console.log('Tasks realtime status:', status);
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
        console.log('Cleanup: removing tasks channel');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
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
    createTask: async (taskData: {
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
    },
    updateTask: async (taskId: string, updates: Partial<Task>) => {
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
    },
    deleteTask: async (taskId: string) => {
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
    }
  };
};
