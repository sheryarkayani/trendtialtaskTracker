
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';

const PlatformPerformanceWidget = () => {
  const { tasks } = useTasks();

  // Calculate platform distribution
  const platformData = tasks.reduce((acc, task) => {
    const platform = task.platform || 'general';
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const platforms = Object.entries(platformData).map(([platform, count]) => {
    const completedTasks = tasks.filter(t => t.platform === platform && t.status === 'completed').length;
    const completionRate = count > 0 ? Math.round((completedTasks / count) * 100) : 0;
    
    return {
      name: platform,
      count,
      completionRate,
      color: getplatformColor(platform)
    };
  }).sort((a, b) => b.count - a.count);

  function getplatformColor(platform: string) {
    const colors: Record<string, string> = {
      instagram: 'bg-pink-500',
      facebook: 'bg-blue-600',
      twitter: 'bg-sky-500',
      linkedin: 'bg-blue-700',
      tiktok: 'bg-black',
      general: 'bg-gray-500'
    };
    return colors[platform] || 'bg-gray-500';
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-green-600" />
          <span>Platform Performance</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {platforms.map((platform) => (
          <div key={platform.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${platform.color}`} />
              <div>
                <p className="font-medium text-sm capitalize">{platform.name}</p>
                <p className="text-xs text-gray-500">{platform.count} campaigns</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {platform.completionRate}%
            </Badge>
          </div>
        ))}

        {platforms.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="font-medium">No platform data</p>
            <p className="text-sm">Create campaigns to see performance</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlatformPerformanceWidget;
