
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, User } from 'lucide-react';
import { useTeam } from '@/hooks/useTeam';
import { useTasks } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';

const TeamWorkloadWidget = () => {
  const { teamMembers } = useTeam();
  const { tasks } = useTasks();

  // Calculate workload for each team member
  const teamWorkload = teamMembers.map(member => {
    const memberTasks = tasks.filter(task => task.assignee_id === member.id);
    const activeTasks = memberTasks.filter(task => 
      ['todo', 'in-progress', 'review'].includes(task.status)
    );
    const completedThisWeek = memberTasks.filter(task => {
      if (!task.completed_at) return false;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(task.completed_at) >= weekAgo;
    });

    const workloadPercentage = Math.min((activeTasks.length / 10) * 100, 100); // Max 10 tasks = 100%
    
    let status: 'available' | 'busy' | 'overloaded';
    if (workloadPercentage < 40) status = 'available';
    else if (workloadPercentage < 80) status = 'busy';
    else status = 'overloaded';

    return {
      ...member,
      activeTasks: activeTasks.length,
      completedThisWeek: completedThisWeek.length,
      workloadPercentage,
      status,
      avgCompletionTime: 2.5 // Mock data - would calculate from actual completion times
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overloaded':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'overloaded':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Users className="w-5 h-5 text-purple-600" />
          <span>Team Workload</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {teamWorkload.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="font-medium">No team members</p>
            <p className="text-sm">Add team members to see workload</p>
          </div>
        ) : (
          teamWorkload.map((member) => (
            <div key={member.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.avatar_url || ''} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {member.first_name?.[0]}{member.last_name?.[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm text-gray-900 truncate">
                    {member.first_name} {member.last_name}
                  </h4>
                  <Badge className={cn("text-xs", getStatusColor(member.status))}>
                    {member.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>{member.activeTasks} active tasks</span>
                  <span>{member.completedThisWeek} completed this week</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Progress 
                    value={member.workloadPercentage} 
                    className="flex-1 h-2"
                  />
                  <span className="text-xs text-gray-500 w-8">
                    {Math.round(member.workloadPercentage)}%
                  </span>
                </div>
              </div>
            </div>
          ))
        )}

        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Team Capacity</span>
            <span>
              {teamWorkload.filter(m => m.status === 'available').length} available, {' '}
              {teamWorkload.filter(m => m.status === 'busy').length} busy, {' '}
              {teamWorkload.filter(m => m.status === 'overloaded').length} overloaded
            </span>
          </div>
          
          <div className="flex space-x-1 h-2 rounded-full overflow-hidden bg-gray-200">
            <div 
              className="bg-green-500 transition-all duration-300"
              style={{ 
                width: `${(teamWorkload.filter(m => m.status === 'available').length / teamWorkload.length) * 100}%` 
              }}
            />
            <div 
              className="bg-yellow-500 transition-all duration-300"
              style={{ 
                width: `${(teamWorkload.filter(m => m.status === 'busy').length / teamWorkload.length) * 100}%` 
              }}
            />
            <div 
              className="bg-red-500 transition-all duration-300"
              style={{ 
                width: `${(teamWorkload.filter(m => m.status === 'overloaded').length / teamWorkload.length) * 100}%` 
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamWorkloadWidget;
