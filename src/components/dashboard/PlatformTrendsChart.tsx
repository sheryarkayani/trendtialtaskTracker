
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';

const PlatformTrendsChart = () => {
  const { tasks } = useTasks();

  const platformData = tasks.reduce((acc, task) => {
    const platform = task.platform || 'general';
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(platformData).map(([platform, count]) => ({
    name: platform,
    value: count,
    fill: getPlatformColor(platform)
  }));

  function getPlatformColor(platform: string) {
    const colors: Record<string, string> = {
      instagram: '#E1306C',
      facebook: '#1877F2',
      twitter: '#1DA1F2',
      linkedin: '#0A66C2',
      tiktok: '#000000',
      general: '#6B7280'
    };
    return colors[platform] || '#6B7280';
  }

  const chartConfig = chartData.reduce((acc, item) => {
    acc[item.name] = {
      label: item.name,
      color: item.fill
    };
    return acc;
  }, {} as any);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <span>Platform Distribution</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-64">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PlatformTrendsChart;
