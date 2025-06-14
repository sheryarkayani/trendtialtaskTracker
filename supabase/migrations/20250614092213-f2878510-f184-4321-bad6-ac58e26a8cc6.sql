
-- First, let's fix the user's organization assignment and role
UPDATE profiles 
SET organization_id = '00000000-0000-0000-0000-000000000001',
    role = 'team_lead'
WHERE email = 'admin@taskflow.com';

-- Add a policy that allows team leads to create profiles for their organization
CREATE POLICY "Team leads can create profiles in their organization" ON profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'team_lead' 
      AND organization_id = profiles.organization_id
    )
  );

-- Add a policy that allows team leads to update profiles in their organization  
CREATE POLICY "Team leads can update profiles in their organization" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'team_lead' 
      AND p.organization_id = profiles.organization_id
    )
  );
