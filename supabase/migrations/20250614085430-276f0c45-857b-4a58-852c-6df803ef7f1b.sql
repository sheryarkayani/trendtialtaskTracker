
-- Fix the infinite recursion in RLS policies by creating security definer functions
-- and updating the policies to use them instead of recursive queries

-- First, create security definer functions to avoid recursive policy checks
CREATE OR REPLACE FUNCTION public.get_current_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop all existing RLS policies that might be causing recursion
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
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;

-- Create new simplified RLS policies that don't cause recursion

-- Organizations policies
CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (id = public.get_current_user_organization_id());

-- Profiles policies - simplified to avoid recursion
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Projects policies
CREATE POLICY "Users can view projects in their organization" ON projects
  FOR SELECT USING (organization_id = public.get_current_user_organization_id());

CREATE POLICY "Team leads can manage projects" ON projects
  FOR ALL USING (
    organization_id = public.get_current_user_organization_id() 
    AND public.get_current_user_role() = 'team_lead'
  );

-- Tasks policies
CREATE POLICY "Users can view tasks in their organization" ON tasks
  FOR SELECT USING (organization_id = public.get_current_user_organization_id());

CREATE POLICY "Users can update tasks assigned to them or team leads can update all" ON tasks
  FOR UPDATE USING (
    assignee_id = auth.uid() 
    OR (organization_id = public.get_current_user_organization_id() AND public.get_current_user_role() = 'team_lead')
  );

CREATE POLICY "Team leads can manage all tasks in their organization" ON tasks
  FOR ALL USING (
    organization_id = public.get_current_user_organization_id() 
    AND public.get_current_user_role() = 'team_lead'
  );

-- Comments policies
CREATE POLICY "Users can view comments on tasks in their organization" ON comments
  FOR SELECT USING (
    task_id IN (
      SELECT id FROM tasks WHERE organization_id = public.get_current_user_organization_id()
    )
  );

CREATE POLICY "Users can create comments" ON comments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Attachments policies
CREATE POLICY "Users can view attachments on tasks in their organization" ON attachments
  FOR SELECT USING (
    task_id IN (
      SELECT id FROM tasks WHERE organization_id = public.get_current_user_organization_id()
    )
  );

-- Activity logs policies
CREATE POLICY "Users can view activity in their organization" ON activity_logs
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM profiles WHERE organization_id = public.get_current_user_organization_id()
    )
  );
