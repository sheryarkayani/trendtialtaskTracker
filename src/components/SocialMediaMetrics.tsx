
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppData } from '@/contexts/AppDataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Eye, Heart } from 'lucide-react';

const SocialMediaMetrics = () => {
  const { analytics } = useAppData();

  // Mock social media data - in a real app this would come from social media APIs
  const platformData = [
    { name: 'Instagram', posts: 25, engagement: 8.2, reach: 12500 },
    { name: 'Facebook', posts: 18, engagement: 6.1, reach: 8900 },
    { name: 'TikTok', posts: 12, engagement: 12.5, reach: 15600 },
    { name: 'LinkedIn', posts: 8, engagement: 4.8, reach: 3200 },
    { name: 'Twitter', posts: 22, engagement: 3.2, reach: 5400 }
  ];

  const engagementData = [
    { month: 'Jan', engagement: 6.2 },
    { month: 'Feb', engagement: 7.1 },
    { month: 'Mar', engagement: 8.5 },
    { month: 'Apr', engagement: 7.8 },
    { month: 'May', engagement: 9.2 },
    { month: 'Jun', engagement: 8.9 }
  ];

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Social Media Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">45.2K</p>
              <p className="text-sm text-gray-500">Total Reach</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">7.8%</p>
              <p className="text-sm text-gray-500">Avg Engagement</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">2.1K</p>
              <p className="text-sm text-gray-500">New Followers</p>
            </div>
          </div>

          {/* Platform Performance Chart */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Posts by Platform</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="posts" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Engagement Trend */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Engagement Trend</h4>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="engagement" stroke="#8B5CF6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialMediaMetrics;
