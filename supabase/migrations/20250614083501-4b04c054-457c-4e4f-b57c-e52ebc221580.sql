
-- Insert superadmin user data into profiles table
-- Note: You'll need to sign up with email 'admin@taskflow.com' and password 'admin123456' 
-- through the auth form first, then this will update the profile with admin role

-- Update the sample organization
UPDATE organizations 
SET name = 'TaskFlow Agency', 
    description = 'Main TaskFlow organization for demo purposes'
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Insert sample projects
INSERT INTO projects (id, title, description, organization_id, status, start_date, end_date) VALUES
('11111111-1111-1111-1111-111111111111', 'Social Media Campaign Q1', 'Complete social media marketing campaign for Q1 2024', '00000000-0000-0000-0000-000000000001', 'active', '2024-01-01', '2024-03-31'),
('22222222-2222-2222-2222-222222222222', 'Brand Redesign Project', 'Complete brand identity redesign for client', '00000000-0000-0000-0000-000000000001', 'active', '2024-02-01', '2024-04-30'),
('33333333-3333-3333-3333-333333333333', 'Website Development', 'New company website development project', '00000000-0000-0000-0000-000000000001', 'completed', '2023-10-01', '2023-12-31');

-- Function to create sample tasks (will be executed after user signs up)
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

    -- Insert sample tasks
    INSERT INTO tasks (title, description, status, priority, platform, assignee_id, project_id, organization_id, due_date) VALUES
    ('Create Instagram content calendar', 'Design and plan Instagram posts for the next month including captions and hashtags', 'in-progress', 'high', 'instagram', user_id, project1_id, org_id, NOW() + INTERVAL '3 days'),
    ('Design Facebook ad creatives', 'Create engaging ad creatives for Facebook advertising campaign', 'todo', 'medium', 'facebook', user_id, project1_id, org_id, NOW() + INTERVAL '5 days'),
    ('Write blog post for LinkedIn', 'Create thought leadership article for company LinkedIn page', 'review', 'medium', 'linkedin', user_id, project1_id, org_id, NOW() + INTERVAL '2 days'),
    ('TikTok video production', 'Produce viral TikTok content for brand awareness', 'todo', 'low', 'tiktok', user_id, project1_id, org_id, NOW() + INTERVAL '7 days'),
    ('Analyze campaign performance', 'Review Q4 campaign metrics and prepare report', 'completed', 'high', NULL, user_id, project3_id, org_id, NOW() - INTERVAL '2 days'),
    ('Client presentation prep', 'Prepare presentation materials for client meeting', 'in-progress', 'high', NULL, user_id, project2_id, org_id, NOW() + INTERVAL '1 day'),
    ('Brand logo variations', 'Create different logo variations for various use cases', 'todo', 'medium', NULL, user_id, project2_id, org_id, NOW() + INTERVAL '4 days'),
    ('Twitter engagement strategy', 'Develop strategy for increasing Twitter engagement', 'review', 'low', 'twitter', user_id, project1_id, org_id, NOW() + INTERVAL '6 days');

    -- Insert sample activity logs
    INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES
    (user_id, 'Task completed', 'task', (SELECT id FROM tasks WHERE title = 'Analyze campaign performance' LIMIT 1)),
    (user_id, 'Task created', 'task', (SELECT id FROM tasks WHERE title = 'Create Instagram content calendar' LIMIT 1)),
    (user_id, 'Task updated', 'task', (SELECT id FROM tasks WHERE title = 'Write blog post for LinkedIn' LIMIT 1)),
    (user_id, 'Project created', 'project', project1_id),
    (user_id, 'Task assigned', 'task', (SELECT id FROM tasks WHERE title = 'Client presentation prep' LIMIT 1));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the user creation trigger to include sample data
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
