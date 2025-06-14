
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

  useEffect(() => {
    if (user) {
      fetchTasks();
      
      // Clean up any existing channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      
      // Set up realtime subscription with unique channel name
      channelRef.current = supabase
        .channel(`tasks-changes-${user.id}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'tasks' },
          () => { fetchTasks(); }
        )
        .subscribe();

      return () => {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      };
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:profiles!assignee_id(first_name, last_name),
          comments_count:comments(count),
          attachments_count:attachments(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Process the data to get counts
      const processedTasks = data?.map(task => ({
        ...task,
        comments_count: task.comments_count?.[0]?.count || 0,
        attachments_count: task.attachments_count?.[0]?.count || 0,
      })) || [];

      setTasks(processedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) throw error;
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
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
    try {
      const { error } = await supabase
        .from('tasks')
        .insert([{
          ...taskData,
          organization_id: user?.user_metadata?.organization_id || '00000000-0000-0000-0000-000000000001'
        }]);

      if (error) throw error;
      await fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
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
