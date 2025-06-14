
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface TeamMember {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: 'team_lead' | 'team_member' | 'client';
  avatar_url: string | null;
  email: string;
  bio: string | null;
  skills: string[] | null;
  tasks_completed: number;
  tasks_in_progress: number;
  workload: number;
  organization_id: string | null;
}

export const useTeam = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeamMembers = async () => {
    if (!user) return;
    
    try {
      console.log('Fetching team members for user:', user.id);
      
      // First get current user's organization
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      console.log('Current user profile:', currentUserProfile);

      const organizationId = currentUserProfile?.organization_id || '00000000-0000-0000-0000-000000000001';
      
      // Update any profiles that don't have an organization_id assigned to match the admin's organization
      if (currentUserProfile?.organization_id) {
        console.log('Fixing profiles without organization_id...');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ organization_id: organizationId })
          .is('organization_id', null);
        
        if (updateError) {
          console.error('Error updating profiles organization_id:', updateError);
        } else {
          console.log('Successfully updated profiles without organization_id');
        }
      }
      
      // Fetch all profiles in the same organization, excluding current user
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', organizationId)
        .neq('id', user.id);

      if (error) {
        console.error('Error fetching team members:', error);
        throw error;
      }

      console.log('Raw team members data:', data);
      console.log('Organization ID used for query:', organizationId);

      // Also fetch all profiles to debug
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('*');
      
      console.log('All profiles in database:', allProfiles);

      // Get task counts for each team member
      const membersWithStats = await Promise.all(
        (data || []).map(async (member) => {
          try {
            const { data: completedTasks } = await supabase
              .from('tasks')
              .select('id')
              .eq('assignee_id', member.id)
              .eq('status', 'completed');

            const { data: inProgressTasks } = await supabase
              .from('tasks')
              .select('id')
              .eq('assignee_id', member.id)
              .in('status', ['todo', 'in-progress', 'review']);

            const tasksCompleted = completedTasks?.length || 0;
            const tasksInProgress = inProgressTasks?.length || 0;
            const workload = Math.min(100, Math.max(0, (tasksInProgress * 15) + (Math.random() * 30)));

            return {
              ...member,
              tasks_completed: tasksCompleted,
              tasks_in_progress: tasksInProgress,
              workload: Math.round(workload),
            };
          } catch (taskError) {
            console.error('Error fetching tasks for member:', member.id, taskError);
            return {
              ...member,
              tasks_completed: 0,
              tasks_in_progress: 0,
              workload: 0,
            };
          }
        })
      );

      console.log('Team members with stats:', membersWithStats);
      setTeamMembers(membersWithStats);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTeamMembers();
    }
  }, [user?.id]);

  return { teamMembers, loading, refetch: fetchTeamMembers };
};
