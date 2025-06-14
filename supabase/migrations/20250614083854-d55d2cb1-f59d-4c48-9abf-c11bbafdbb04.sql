
-- First, let's make sure we drop any existing objects that might be causing conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS create_sample_data_for_user(uuid);

-- Now let's recreate everything properly
-- Create enum types (in case they don't exist)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('team_lead', 'team_member', 'client');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('todo', 'in-progress', 'review', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE platform_type AS ENUM ('instagram', 'facebook', 'tiktok', 'linkedin', 'twitter');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role user_role NOT NULL DEFAULT 'team_member',
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  avatar_url TEXT,
  bio TEXT,
  skills TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'todo',
  priority task_priority DEFAULT 'medium',
  platform platform_type,
  assignee_id UUID REFERENCES profiles(id),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attachments table if it doesn't exist
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  content_type TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the demo organization if it doesn't exist
INSERT INTO organizations (id, name, description) 
VALUES ('00000000-0000-0000-0000-000000000001', 'TaskFlow Agency', 'Main TaskFlow organization for demo purposes')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Insert sample projects
INSERT INTO projects (id, title, description, organization_id, status, start_date, end_date) VALUES
('11111111-1111-1111-1111-111111111111', 'Social Media Campaign Q1', 'Complete social media marketing campaign for Q1 2024', '00000000-0000-0000-0000-000000000001', 'active', '2024-01-01', '2024-03-31'),
('22222222-2222-2222-2222-222222222222', 'Brand Redesign Project', 'Complete brand identity redesign for client', '00000000-0000-0000-0000-000000000001', 'active', '2024-02-01', '2024-04-30'),
('33333333-3333-3333-3333-333333333333', 'Website Development', 'New company website development project', '00000000-0000-0000-0000-000000000001', 'completed', '2023-10-01', '2023-12-31')
ON CONFLICT (id) DO NOTHING;

-- Create function to create sample data for user
CREATE OR REPLACE FUNCTION create_sample_data_for_user(user_id UUID)
RETURNS void AS $$
DECLARE
    org_id UUID := '00000000-0000-0000-0000-000000000001';
    project1_id UUID := '11111111-1111-1111-1111-111111111111';
    project2_id UUID := '22222222-2222-2222-2222-222222222222';
    project3_id UUID := '33333333-3333-3333-3333-333333333333';
BEGIN
    -- Update user to be team lead and assign to organization
    UPDATE profiles 
    SET role = 'team_lead', 
        organization_id = org_id,
        bio = 'TaskFlow Administrator with full system access',
        skills = ARRAY['Project Management', 'Team Leadership', 'Social Media Marketing', 'Analytics']
    WHERE id = user_id;

    -- Insert sample tasks only if they don't exist for this user
    INSERT INTO tasks (title, description, status, priority, platform, assignee_id, project_id, organization_id, due_date) 
    SELECT * FROM (VALUES
        ('Create Instagram content calendar', 'Design and plan Instagram posts for the next month including captions and hashtags', 'in-progress', 'high', 'instagram', user_id, project1_id, org_id, NOW() + INTERVAL '3 days'),
        ('Design Facebook ad creatives', 'Create engaging ad creatives for Facebook advertising campaign', 'todo', 'medium', 'facebook', user_id, project1_id, org_id, NOW() + INTERVAL '5 days'),
        ('Write blog post for LinkedIn', 'Create thought leadership article for company LinkedIn page', 'review', 'medium', 'linkedin', user_id, project1_id, org_id, NOW() + INTERVAL '2 days'),
        ('TikTok video production', 'Produce viral TikTok content for brand awareness', 'todo', 'low', 'tiktok', user_id, project1_id, org_id, NOW() + INTERVAL '7 days'),
        ('Analyze campaign performance', 'Review Q4 campaign metrics and prepare report', 'completed', 'high', NULL, user_id, project3_id, org_id, NOW() - INTERVAL '2 days'),
        ('Client presentation prep', 'Prepare presentation materials for client meeting', 'in-progress', 'high', NULL, user_id, project2_id, org_id, NOW() + INTERVAL '1 day'),
        ('Brand logo variations', 'Create different logo variations for various use cases', 'todo', 'medium', NULL, user_id, project2_id, org_id, NOW() + INTERVAL '4 days'),
        ('Twitter engagement strategy', 'Develop strategy for increasing Twitter engagement', 'review', 'low', 'twitter', user_id, project1_id, org_id, NOW() + INTERVAL '6 days')
    ) AS t(title, description, status, priority, platform, assignee_id, project_id, organization_id, due_date)
    WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE assignee_id = user_id);

    -- Insert sample activity logs
    INSERT INTO activity_logs (user_id, action, entity_type, entity_id) 
    SELECT user_id, action, entity_type, entity_id FROM (VALUES
        (user_id, 'Task completed', 'task', (SELECT id FROM tasks WHERE title = 'Analyze campaign performance' AND assignee_id = user_id LIMIT 1)),
        (user_id, 'Task created', 'task', (SELECT id FROM tasks WHERE title = 'Create Instagram content calendar' AND assignee_id = user_id LIMIT 1)),
        (user_id, 'Task updated', 'task', (SELECT id FROM tasks WHERE title = 'Write blog post for LinkedIn' AND assignee_id = user_id LIMIT 1)),
        (user_id, 'Project created', 'project', project1_id),
        (user_id, 'Task assigned', 'task', (SELECT id FROM tasks WHERE title = 'Client presentation prep' AND assignee_id = user_id LIMIT 1))
    ) AS t(user_id, action, entity_type, entity_id)
    WHERE NOT EXISTS (SELECT 1 FROM activity_logs WHERE user_id = t.user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  
  -- If this is the admin user, create sample data
  IF NEW.email = 'admin@taskflow.com' THEN
    PERFORM create_sample_data_for_user(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view projects in their organization" ON projects;
DROP POLICY IF EXISTS "Team leads can manage projects" ON projects;
DROP POLICY IF EXISTS "Users can view tasks in their organization" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks assigned to them" ON tasks;
DROP POLICY IF EXISTS "Team leads can manage all tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view comments on tasks they can see" ON comments;
DROP POLICY IF EXISTS "Users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can view attachments on tasks they can see" ON attachments;
DROP POLICY IF EXISTS "Users can view activity in their organization" ON activity_logs;

-- Recreate RLS policies
CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can view profiles in their organization" ON profiles
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can view projects in their organization" ON projects
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Team leads can manage projects" ON projects
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role = 'team_lead'
    )
  );

CREATE POLICY "Users can view tasks in their organization" ON tasks
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks assigned to them" ON tasks
  FOR UPDATE USING (
    assignee_id = auth.uid() OR 
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role = 'team_lead'
    )
  );

CREATE POLICY "Team leads can manage all tasks" ON tasks
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role = 'team_lead'
    )
  );

CREATE POLICY "Users can view comments on tasks they can see" ON comments
  FOR SELECT USING (
    task_id IN (
      SELECT id FROM tasks WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create comments" ON comments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view attachments on tasks they can see" ON attachments
  FOR SELECT USING (
    task_id IN (
      SELECT id FROM tasks WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view activity in their organization" ON activity_logs
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM profiles WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Enable realtime for tables
ALTER TABLE tasks REPLICA IDENTITY FULL;
ALTER TABLE comments REPLICA IDENTITY FULL;
ALTER TABLE activity_logs REPLICA IDENTITY FULL;
