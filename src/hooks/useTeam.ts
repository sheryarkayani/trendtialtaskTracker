
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface TeamMember {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: 'team_lead' | 'team_member' | 'client';
  avatar_url: string | null;
  tasks_completed: number;
  tasks_in_progress: number;
  workload: number;
}

export const useTeam = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTeamMembers();
    }
  }, [user]);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id);

      if (error) throw error;

      // Get task counts for each team member
      const membersWithStats = await Promise.all(
        (data || []).map(async (member) => {
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
          const workload = Math.min(100, Math.max(0, (tasksInProgress * 20) + (Math.random() * 40)));

          return {
            ...member,
            tasks_completed: tasksCompleted,
            tasks_in_progress: tasksInProgress,
            workload: Math.round(workload),
          };
        })
      );

      setTeamMembers(membersWithStats);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  return { teamMembers, loading, refetch: fetchTeamMembers };
};
