
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
      console.log('=== DEBUGGING TEAM FETCH ===');
      console.log('Fetching team members for user:', user.id);
      
      // First get current user's profile with more details
      const { data: currentUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('Current user full profile:', currentUserProfile);
      console.log('Profile fetch error:', profileError);

      if (!currentUserProfile) {
        console.error('No profile found for current user');
        setLoading(false);
        return;
      }

      const organizationId = currentUserProfile.organization_id;
      console.log('Current user organization_id:', organizationId);
      
      // Fetch ALL profiles first to see what's in the database
      const { data: allProfiles, error: allError } = await supabase
        .from('profiles')
        .select('*');
      
      console.log('=== ALL PROFILES IN DATABASE ===');
      console.log('All profiles:', allProfiles);
      console.log('All profiles error:', allError);

      // If current user doesn't have organization_id, update it
      if (!organizationId) {
        console.log('Current user missing organization_id, updating...');
        const defaultOrgId = '00000000-0000-0000-0000-000000000001';
        
        const { error: updateCurrentUserError } = await supabase
          .from('profiles')
          .update({ organization_id: defaultOrgId })
          .eq('id', user.id);
        
        if (updateCurrentUserError) {
          console.error('Error updating current user organization_id:', updateCurrentUserError);
        } else {
          console.log('Updated current user organization_id to:', defaultOrgId);
          // Update all other profiles without organization_id
          const { error: updateOthersError } = await supabase
            .from('profiles')
            .update({ organization_id: defaultOrgId })
            .is('organization_id', null);
          
          if (updateOthersError) {
            console.error('Error updating other profiles organization_id:', updateOthersError);
          } else {
            console.log('Updated other profiles organization_id');
          }
        }
        
        // Re-fetch all profiles after update
        const { data: updatedProfiles } = await supabase
          .from('profiles')
          .select('*');
        console.log('Updated profiles:', updatedProfiles);
      }
      
      // Update any profiles that don't have an organization_id to match current user's org
      if (organizationId) {
        console.log('Updating profiles without organization_id to match current user...');
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

      // Final organization ID to use
      const finalOrgId = organizationId || '00000000-0000-0000-0000-000000000001';
      console.log('Using final organization ID for query:', finalOrgId);
      
      // Fetch team members (excluding current user)
      const { data: teamData, error: teamError } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', finalOrgId)
        .neq('id', user.id);

      console.log('=== TEAM QUERY RESULTS ===');
      console.log('Team members query result:', teamData);
      console.log('Team query error:', teamError);
      console.log('Query used organization_id:', finalOrgId);
      console.log('Excluded user_id:', user.id);

      if (teamError) {
        console.error('Error fetching team members:', teamError);
        throw teamError;
      }

      // Get task counts for each team member
      const membersWithStats = await Promise.all(
        (teamData || []).map(async (member) => {
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

            console.log(`Stats for member ${member.email}:`, {
              tasksCompleted,
              tasksInProgress,
              workload: Math.round(workload)
            });

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

      console.log('=== FINAL RESULT ===');
      console.log('Final team members with stats:', membersWithStats);
      console.log('Total team members found:', membersWithStats.length);
      
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
