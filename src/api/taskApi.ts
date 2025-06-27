import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/task';

export const fetchTasks = async () => {
  console.log('Fetching tasks...');
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      assignee:profiles!assignee_id(first_name, last_name, avatar_url),
      client:clients!client_id(id, name, company, brand_color),
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
  return processedTasks;
};

export const updateTaskStatus = async (taskId: string, status: Task['status'], userId: string) => {
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
        user_id: userId,
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
  return updatedTask;
};

export const createTask = async (taskData: {
  title: string;
  description?: string;
  priority?: Task['priority'];
  platform?: Task['platform'];
  assignee_id?: string;
  client_id?: string;
  project_id?: string;
  due_date?: string;
  subtasks_total?: number;
}, userId: string) => {
  console.log('Creating new task:', taskData);

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', userId)
    .single();

  if (!profile) {
    throw new Error('User profile not found, cannot determine organization.');
  }

  const { error } = await supabase
    .from('tasks')
    .insert([{
      ...taskData,
      organization_id: profile.organization_id,
      created_by: userId,
      status: 'todo' as const,
      subtasks_completed: 0,
      time_spent: 0,
      is_timer_running: false
    }]);

  if (error) throw error;
  
  // Create activity log
  await supabase
    .from('activity_logs')
    .insert([{
      user_id: userId,
      action: `created new task "${taskData.title}"`,
      entity_type: 'task',
      entity_id: null
    }]);
    
  console.log('Task created successfully');
};

export const updateTask = async (taskId: string, updates: Partial<Task>, userId: string) => {
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
      user_id: userId,
      action: 'updated task details',
      entity_type: 'task',
      entity_id: taskId
    }]);
    
  console.log('Task updated successfully');
};

export const deleteTask = async (taskId: string, userId: string) => {
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
      user_id: userId,
      action: 'deleted task',
      entity_type: 'task',
      entity_id: taskId
    }]);
    
  console.log('Task deleted successfully');
};

// Time tracking functions
export const startTimer = async (taskId: string, userId: string) => {
  const { error } = await supabase
    .from('tasks')
    .update({
      is_timer_running: true,
      timer_started_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', taskId);

  if (error) throw error;
  console.log('Timer started for task:', taskId);
};

export const stopTimer = async (taskId: string, userId: string) => {
  // First get the current task to calculate duration
  const { data: task, error: fetchError } = await supabase
    .from('tasks')
    .select('timer_started_at, time_spent')
    .eq('id', taskId)
    .single();

  if (fetchError) throw fetchError;

  const now = new Date();
  const startTime = new Date(task.timer_started_at);
  const sessionDuration = Math.floor((now.getTime() - startTime.getTime()) / 60000); // in minutes
  const totalTimeSpent = (task.time_spent || 0) + sessionDuration;

  // Update task
  const { error: updateError } = await supabase
    .from('tasks')
    .update({
      is_timer_running: false,
      timer_started_at: null,
      time_spent: totalTimeSpent,
      updated_at: new Date().toISOString()
    })
    .eq('id', taskId);

  if (updateError) throw updateError;

  // Create time log entry
  const { error: timeLogError } = await supabase
    .from('time_logs')
    .insert([{
      task_id: taskId,
      user_id: userId,
      start_time: task.timer_started_at,
      end_time: now.toISOString(),
      duration: sessionDuration,
      is_manual_entry: false
    }]);

  if (timeLogError) throw timeLogError;

  console.log('Timer stopped for task:', taskId, 'Duration:', sessionDuration, 'minutes');
};

export const addManualTimeEntry = async (taskId: string, userId: string, duration: number, description?: string) => {
  // Add to time_logs
  const { error: timeLogError } = await supabase
    .from('time_logs')
    .insert([{
      task_id: taskId,
      user_id: userId,
      start_time: new Date().toISOString(),
      duration,
      description,
      is_manual_entry: true
    }]);

  if (timeLogError) throw timeLogError;

  // Update task total time
  const { data: task, error: fetchError } = await supabase
    .from('tasks')
    .select('time_spent')
    .eq('id', taskId)
    .single();

  if (fetchError) throw fetchError;

  const { error: updateError } = await supabase
    .from('tasks')
    .update({
      time_spent: (task.time_spent || 0) + duration,
      updated_at: new Date().toISOString()
    })
    .eq('id', taskId);

  if (updateError) throw updateError;

  console.log('Manual time entry added:', duration, 'minutes');
};
