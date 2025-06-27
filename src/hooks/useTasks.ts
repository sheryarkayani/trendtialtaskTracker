import { useState, useEffect } from 'react';
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
    if (!user?.id) return;

    console.log('Setting up tasks hook for user:', user.id);
    fetchTasks();
    subscribeToRealtime(user.id);

    const handleTasksUpdate = () => {
      console.log('Tasks updated via realtime, refetching...');
      fetchTasks();
    };

    window.addEventListener('tasks-updated', handleTasksUpdate);

    return () => {
      console.log('Cleanup: removing tasks hook subscriber');
      unsubscribeFromRealtime();
      window.removeEventListener('tasks-updated', handleTasksUpdate);
    };
  }, [user?.id, subscribeToRealtime, unsubscribeFromRealtime]);

  const createTask = async (taskData: {
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
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;
    
    try {
      await apiUpdateTask(taskId, updates, user.id);
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    if (!user) return;
    
    try {
      await apiUpdateTask(taskId, { status }, user.id);
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    
    try {
      await apiDeleteTask(taskId, user.id);
      await fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

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
