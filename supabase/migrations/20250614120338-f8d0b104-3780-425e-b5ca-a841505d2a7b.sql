
-- Add subtasks support and time tracking to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS subtasks_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS subtasks_total INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS time_spent INTEGER DEFAULT 0, -- in minutes
ADD COLUMN IF NOT EXISTS is_timer_running BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS timer_started_at TIMESTAMP WITH TIME ZONE;

-- Create time_logs table for tracking time entries
CREATE TABLE IF NOT EXISTS time_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in minutes
  description TEXT,
  is_manual_entry BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for time_logs
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for time_logs
CREATE POLICY "Users can view time logs for their organization tasks" ON time_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks t 
      WHERE t.id = time_logs.task_id 
      AND t.organization_id = get_current_user_organization_id()
    )
  );

CREATE POLICY "Users can create time logs for their organization tasks" ON time_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks t 
      WHERE t.id = time_logs.task_id 
      AND t.organization_id = get_current_user_organization_id()
    )
  );

CREATE POLICY "Users can update their own time logs" ON time_logs
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own time logs" ON time_logs
  FOR DELETE USING (user_id = auth.uid());

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_time_logs_task_id ON time_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_user_id ON time_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_timer_running ON tasks(is_timer_running) WHERE is_timer_running = TRUE;

-- Add realtime for time_logs
ALTER PUBLICATION supabase_realtime ADD TABLE time_logs;
