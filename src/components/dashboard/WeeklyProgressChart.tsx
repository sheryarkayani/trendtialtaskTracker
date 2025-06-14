
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';

const WeeklyProgressChart = () => {
  const { tasks } = useTasks();

  // Generate data for last 14 days
  const chartData = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const created = tasks.filter(task => {
      const createdDate = new Date(task.created_at);
      return createdDate >= dayStart && createdDate <= dayEnd;
    }).length;

    const completed = tasks.filter(task => {
      if (!task.completed_at) return false;
      const completedDate = new Date(task.completed_at);
      return completedDate >= dayStart && completedDate <= dayEnd;
    }).length;

    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      created,
      completed
    };
  });

  const chartConfig = {
    created: {
      label: 'Created',
      color: '#3B82F6'
    },
    completed: {
      label: 'Completed',
      color: '#10B981'
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <span>Weekly Progress</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-64">
          <LineChart data={chartData}>
            <XAxis 
              dataKey="date" 
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
            <Line 
              type="monotone" 
              dataKey="created" 
              stroke="var(--color-created)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="var(--color-completed)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default WeeklyProgressChart;
