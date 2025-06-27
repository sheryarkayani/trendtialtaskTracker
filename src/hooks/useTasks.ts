import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useTasksRealtime } from './useTasksRealtime';
import { Task } from '@/types/task';
import { 
  fetchTasks as apiFetchTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask
} from '@/api/taskApi';

export const useTasks = () => {
  const { user } = useAuth();
  const { subscribeToRealtime, unsubscribeFromRealtime } = useTasksRealtime();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    
    try {
      const fetchedTasks = await apiFetchTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    console.log('Setting up tasks hook for user:', user.id);
    fetchTasks();
    subscribeToRealtime(user.id);

    const handleTasksUpdate = () => {
      console.log('Tasks updated via realtime, refetching...');
      fetchTasks();
    };

    window.addEventListener('tasks-updated', handleTasksUpdate);

    return () => {
      unsubscribeFromRealtime();
      window.removeEventListener('tasks-updated', handleTasksUpdate);
    };
  }, [user, fetchTasks, subscribeToRealtime, unsubscribeFromRealtime]);

  const createTask = useCallback(async (taskData: {
    title: string;
    description?: string;
    priority?: Task['priority'];
    platform?: Task['platform'];
    client_id?: string;
    assignee_id?: string;
    project_id?: string;
    due_date?: string;
  }) => {
    if (!user) return;
    
    try {
      await apiCreateTask(taskData, user.id);
      await fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }, [user, fetchTasks]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;
    
    try {
      await apiUpdateTask(taskId, updates, user.id);
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }, [user, fetchTasks]);

  const updateTaskStatus = useCallback(async (taskId: string, status: Task['status']) => {
    if (!user) return;
    
    try {
      await apiUpdateTask(taskId, { status }, user.id);
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }, [user, fetchTasks]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!user) return;
    
    try {
      await apiDeleteTask(taskId, user.id);
      await fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }, [user, fetchTasks]);

  return { 
    tasks, 
    loading, 
    refetch: fetchTasks, 
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask
  };
};
