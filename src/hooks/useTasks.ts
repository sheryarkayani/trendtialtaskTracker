
import { useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { useTasksRealtime } from './useTasksRealtime';
import { Task } from '@/types/task';
import { 
  fetchTasks as apiFetchTasks, 
  updateTaskStatus as apiUpdateTaskStatus,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask
} from '@/api/taskApi';

export const useTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const subscribedRef = useRef(false);
  const { subscribeToRealtime, unsubscribeFromRealtime } = useTasksRealtime();

  const fetchTasks = async () => {
    if (!user) return;
    
    try {
      const fetchedTasks = await apiFetchTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    console.log('Setting up tasks hook for user:', user.id);
    
    // Initial fetch
    fetchTasks();

    // Set up realtime subscription
    subscribeToRealtime(user.id);

    // Listen for global task updates
    const handleTasksUpdated = () => {
      fetchTasks();
    };

    window.addEventListener('tasks-updated', handleTasksUpdated);
    subscribedRef.current = true;

    // Cleanup function
    return () => {
      console.log('Cleanup: removing tasks hook subscriber');
      subscribedRef.current = false;
      window.removeEventListener('tasks-updated', handleTasksUpdated);
      unsubscribeFromRealtime();
    };
  }, [user?.id]);

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    if (!user) {
      console.error('No user authenticated');
      return;
    }
    
    try {
      await apiUpdateTaskStatus(taskId, status, user.id);
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
      await apiCreateTask(taskData, user.id);
      await fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;
    
    try {
      await apiUpdateTask(taskId, updates, user.id);
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    
    try {
      await apiDeleteTask(taskId, user.id);
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

// Re-export the Task type for backward compatibility
export type { Task };
