
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Users } from 'lucide-react';
import { useTeam } from '@/hooks/useTeam';
import { useTasks } from '@/hooks/useTasks';

const TeamPerformanceChart = () => {
  const { teamMembers } = useTeam();
  const { tasks } = useTasks();

  const chartData = teamMembers.map(member => {
    const memberTasks = tasks.filter(task => task.assignee_id === member.id);
    const completedCount = memberTasks.filter(task => task.status === 'completed').length;
    
    return {
      name: `${member.first_name} ${member.last_name}`.split(' ').map(n => n[0]).join(''),
      completed: completedCount,
      total: memberTasks.length
    };
  });

  const chartConfig = {
    completed: {
      label: 'Completed Tasks',
      color: '#10B981'
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Users className="w-5 h-5 text-purple-600" />
          <span>Team Performance</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-64">
          <BarChart data={chartData}>
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar 
              dataKey="completed" 
              fill="var(--color-completed)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default TeamPerformanceChart;
