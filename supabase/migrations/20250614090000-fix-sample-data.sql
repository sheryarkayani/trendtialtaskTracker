
-- Enable realtime for all tables
ALTER TABLE tasks REPLICA IDENTITY FULL;
ALTER TABLE comments REPLICA IDENTITY FULL;
ALTER TABLE activity_logs REPLICA IDENTITY FULL;
ALTER TABLE profiles REPLICA IDENTITY FULL;
ALTER TABLE projects REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;

-- Create sample projects if they don't exist
INSERT INTO projects (id, title, description, organization_id, status, start_date, end_date)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Social Media Campaign Q1', 'Comprehensive social media strategy for Q1 2024', '00000000-0000-0000-0000-000000000001', 'active', '2024-01-01', '2024-03-31'),
  ('22222222-2222-2222-2222-222222222222', 'Brand Redesign Project', 'Complete brand identity overhaul including logo and messaging', '00000000-0000-0000-0000-000000000001', 'active', '2024-02-01', '2024-05-31'),
  ('33333333-3333-3333-3333-333333333333', 'Analytics & Reporting', 'Advanced analytics setup and quarterly reporting system', '00000000-0000-0000-0000-000000000001', 'completed', '2023-10-01', '2023-12-31')
ON CONFLICT (id) DO NOTHING;

-- Function to create sample data for current user and generate virtual team members
CREATE OR REPLACE FUNCTION create_enhanced_sample_data(target_user_id UUID)
RETURNS void AS $$
DECLARE
    org_id UUID := '00000000-0000-0000-0000-000000000001';
    project1_id UUID := '11111111-1111-1111-1111-111111111111';
    project2_id UUID := '22222222-2222-2222-2222-222222222222';
    project3_id UUID := '33333333-3333-3333-3333-333333333333';
    virtual_team_members UUID[] := ARRAY[
        gen_random_uuid(),
        gen_random_uuid(),
        gen_random_uuid(),
        gen_random_uuid()
    ];
    team_names TEXT[][] := ARRAY[
        ARRAY['Sarah', 'Johnson', 'sarah.johnson@taskflow.com'],
        ARRAY['Mike', 'Chen', 'mike.chen@taskflow.com'],
        ARRAY['Emma', 'Davis', 'emma.davis@taskflow.com'],
        ARRAY['Alex', 'Rodriguez', 'alex.rodriguez@taskflow.com']
    ];
    i INTEGER;
    random_assignee UUID;
BEGIN
    -- Update current user to be team lead and assign to organization
    UPDATE profiles 
    SET role = 'team_lead', 
        organization_id = org_id,
        bio = 'TaskFlow Administrator with full system access',
        skills = ARRAY['Project Management', 'Team Leadership', 'Social Media Marketing', 'Analytics']
    WHERE id = target_user_id;

    -- Create virtual team member profiles (these won't have auth.users entries but will show in lists)
    FOR i IN 1..4 LOOP
        INSERT INTO profiles (id, email, first_name, last_name, role, organization_id, bio, skills)
        VALUES (
            virtual_team_members[i],
            team_names[i][3],
            team_names[i][1],
            team_names[i][2],
            CASE WHEN i = 3 THEN 'team_lead' ELSE 'team_member' END,
            org_id,
            CASE i
                WHEN 1 THEN 'Creative designer with 5+ years experience'
                WHEN 2 THEN 'Social media specialist and content creator'
                WHEN 3 THEN 'Senior project manager and team lead'
                WHEN 4 THEN 'Data analyst and reporting specialist'
            END,
            CASE i
                WHEN 1 THEN ARRAY['Graphic Design', 'Adobe Creative Suite', 'Brand Strategy']
                WHEN 2 THEN ARRAY['Content Creation', 'Social Media Management', 'Photography']
                WHEN 3 THEN ARRAY['Project Management', 'Team Leadership', 'Strategy Planning']
                WHEN 4 THEN ARRAY['Data Analysis', 'Google Analytics', 'Report Generation']
            END
        )
        ON CONFLICT (id) DO NOTHING;
    END LOOP;

    -- Clear existing tasks and activities for clean start
    DELETE FROM tasks WHERE organization_id = org_id;
    DELETE FROM activity_logs WHERE user_id = target_user_id;

    -- Insert diverse sample tasks with different assignees
    FOR i IN 1..15 LOOP
        random_assignee := CASE 
            WHEN i % 4 = 0 THEN target_user_id 
            ELSE virtual_team_members[1 + ((i-1) % array_length(virtual_team_members, 1))]
        END;

        INSERT INTO tasks (title, description, status, priority, platform, assignee_id, project_id, organization_id, due_date) 
        VALUES (
            CASE i
                WHEN 1 THEN 'Create Instagram content calendar'
                WHEN 2 THEN 'Design Facebook ad creatives'
                WHEN 3 THEN 'Write blog post for LinkedIn'
                WHEN 4 THEN 'TikTok video production'
                WHEN 5 THEN 'Analyze campaign performance'
                WHEN 6 THEN 'Client presentation prep'
                WHEN 7 THEN 'Brand logo variations'
                WHEN 8 THEN 'Twitter engagement strategy'
                WHEN 9 THEN 'Instagram Stories templates'
                WHEN 10 THEN 'Facebook event promotion'
                WHEN 11 THEN 'LinkedIn article series'
                WHEN 12 THEN 'TikTok trend analysis'
                WHEN 13 THEN 'Campaign ROI analysis'
                WHEN 14 THEN 'Social media audit'
                WHEN 15 THEN 'Content strategy planning'
                ELSE 'Task ' || i
            END,
            CASE i
                WHEN 1 THEN 'Design and plan Instagram posts for the next month including captions and hashtags'
                WHEN 2 THEN 'Create engaging ad creatives for Facebook advertising campaign'
                WHEN 3 THEN 'Create thought leadership article for company LinkedIn page'
                WHEN 4 THEN 'Produce viral TikTok content for brand awareness'
                WHEN 5 THEN 'Review Q4 campaign metrics and prepare comprehensive report'
                WHEN 6 THEN 'Prepare presentation materials for upcoming client meeting'
                WHEN 7 THEN 'Create different logo variations for various use cases'
                WHEN 8 THEN 'Develop strategy for increasing Twitter engagement rates'
                WHEN 9 THEN 'Design branded Instagram Stories templates for campaigns'
                WHEN 10 THEN 'Create promotional materials for Facebook event'
                WHEN 11 THEN 'Plan and write a series of LinkedIn articles'
                WHEN 12 THEN 'Research and analyze current TikTok trends'
                WHEN 13 THEN 'Calculate and analyze return on investment for recent campaigns'
                WHEN 14 THEN 'Comprehensive audit of all social media accounts and performance'
                WHEN 15 THEN 'Develop content strategy for Q2 marketing initiatives'
                ELSE 'Sample task description'
            END,
            CASE i % 4
                WHEN 0 THEN 'completed'
                WHEN 1 THEN 'in-progress'
                WHEN 2 THEN 'review'
                ELSE 'todo'
            END,
            CASE i % 3
                WHEN 0 THEN 'high'
                WHEN 1 THEN 'medium'
                ELSE 'low'
            END,
            CASE i % 5
                WHEN 0 THEN 'instagram'
                WHEN 1 THEN 'facebook'
                WHEN 2 THEN 'linkedin'
                WHEN 3 THEN 'tiktok'
                WHEN 4 THEN 'twitter'
                ELSE NULL
            END,
            random_assignee,
            CASE i % 3
                WHEN 0 THEN project1_id
                WHEN 1 THEN project2_id
                ELSE project3_id
            END,
            org_id,
            NOW() + (i || ' days')::interval
        );
    END LOOP;

    -- Insert recent activity logs with different users
    INSERT INTO activity_logs (user_id, action, entity_type, entity_id) 
    SELECT 
        CASE WHEN i % 3 = 0 THEN target_user_id ELSE virtual_team_members[1 + ((i-1) % array_length(virtual_team_members, 1))] END,
        CASE i % 8
            WHEN 0 THEN 'completed task "Instagram content calendar"'
            WHEN 1 THEN 'created new task "Brand strategy review"'
            WHEN 2 THEN 'updated task status to in-progress'
            WHEN 3 THEN 'added comment to task'
            WHEN 4 THEN 'assigned task to team member'
            WHEN 5 THEN 'joined project "Social Media Campaign"'
            WHEN 6 THEN 'uploaded file to task'
            ELSE 'reviewed and approved deliverable'
        END,
        'task',
        (SELECT id FROM tasks WHERE organization_id = org_id LIMIT 1 OFFSET (i % 10))
    FROM generate_series(1, 12) AS i;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the user creation trigger to use the enhanced sample data function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple insert with error handling
  BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't block user creation
      RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
      RETURN NEW;
  END;
  
  -- Create enhanced sample data for any new user
  BEGIN
    PERFORM create_enhanced_sample_data(NEW.id);
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't block user creation
      RAISE WARNING 'Error creating sample data for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Call the enhanced sample data function for the current admin user if they exist
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Find the admin user
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@taskflow.com' LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        -- Create enhanced sample data for the admin user
        PERFORM create_enhanced_sample_data(admin_user_id);
    END IF;
END $$;
