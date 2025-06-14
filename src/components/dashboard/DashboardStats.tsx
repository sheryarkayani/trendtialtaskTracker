import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change: string;
  changeType: 'increase' | 'decrease';
  footerText: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, changeType, footerText }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center">
          {changeType === 'increase' ? 
            <ArrowUp className="w-4 h-4 mr-1 text-green-500" /> : 
            <ArrowDown className="w-4 h-4 mr-1 text-red-500" />
          }
          <span className={changeType === 'increase' ? 'text-green-500' : 'text-red-500'}>{change}</span>
          <span className="ml-1">{footerText}</span>
        </p>
      </CardContent>
    </Card>
  );
};

interface DashboardStatsProps {
  // Add props for data as we build out the data fetching
}

const DashboardStats: React.FC<DashboardStatsProps> = (props) => {
  // Dummy data for now
  const stats: StatCardProps[] = [
    { title: 'Active Campaigns', value: '1', icon: <div className="p-2 bg-blue-500/10 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>, change: '1', changeType: 'decrease', footerText: 'overdue' },
    { title: 'Tasks Due Today', value: '0', icon: <div className="p-2 bg-orange-500/10 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>, change: '1', changeType: 'decrease', footerText: 'overdue' },
    { title: 'Team Productivity', value: '0%', icon: <div className="p-2 bg-green-500/10 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg></div>, change: '0', changeType: 'decrease', footerText: 'completed this week' },
    { title: 'Client Satisfaction', value: '85%', icon: <div className="p-2 bg-violet-500/10 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>, change: '5%', changeType: 'increase', footerText: 'Based on recent feedback' }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {stats.map(stat => <StatCard key={stat.title} {...stat} />)}
    </div>
  );
};

export default DashboardStats;
