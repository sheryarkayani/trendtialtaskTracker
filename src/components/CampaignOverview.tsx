
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Calendar, DollarSign, TrendingUp } from 'lucide-react';

const CampaignOverview = () => {
  // Mock campaign data - in a real app this would come from your database
  const campaigns = [
    {
      id: 1,
      name: 'Summer Fashion Launch',
      client: 'StyleCo',
      status: 'active',
      progress: 75,
      budget: 15000,
      spent: 11250,
      endDate: '2024-07-15',
      platform: 'Instagram'
    },
    {
      id: 2,
      name: 'Tech Product Reveal',
      client: 'InnovateTech',
      status: 'planning',
      progress: 25,
      budget: 25000,
      spent: 3500,
      endDate: '2024-08-01',
      platform: 'LinkedIn'
    },
    {
      id: 3,
      name: 'Holiday Promotion',
      client: 'RetailPlus',
      status: 'completed',
      progress: 100,
      budget: 8000,
      spent: 7800,
      endDate: '2024-06-30',
      platform: 'Facebook'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformEmoji = (platform: string) => {
    const emojis: Record<string, string> = {
      'Instagram': '📸',
      'Facebook': '📘',
      'LinkedIn': '💼',
      'TikTok': '🎵',
      'Twitter': '🐦'
    };
    return emojis[platform] || '📱';
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          Active Campaigns
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{campaign.name}</h4>
                  <p className="text-xs text-gray-500">{campaign.client}</p>
                </div>
                <Badge className={`text-xs ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </Badge>
              </div>

              <div className="space-y-3">
                {/* Progress */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">Progress</span>
                    <span className="text-xs font-medium">{campaign.progress}%</span>
                  </div>
                  <Progress value={campaign.progress} className="h-2" />
                </div>

                {/* Budget */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-green-600" />
                    <span className="text-gray-600">Budget</span>
                  </div>
                  <span className="font-medium">
                    ${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}
                  </span>
                </div>

                {/* Platform & Date */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <span>{getPlatformEmoji(campaign.platform)}</span>
                    <span className="text-gray-600">{campaign.platform}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-600">{campaign.endDate}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Quick Stats */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Campaign Stats</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">$48K</p>
                <p className="text-xs text-gray-500">Total Budget</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">$22.5K</p>
                <p className="text-xs text-gray-500">Total Spent</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignOverview;
