import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Task } from '@/types';
import { CheckSquare, Plus, Smile, Meh, Frown } from 'lucide-react';

export const MyTasks: React.FC<{ tasks: Task[] }> = ({ tasks }) => (
  <Card>
    <CardHeader>
      <CardTitle>My Tasks</CardTitle>
    </CardHeader>
    <CardContent>
      {tasks.length > 0 ? (
        <p>You have {tasks.length} tasks.</p>
      ) : (
        <div className="text-center text-muted-foreground py-4">
          <CheckSquare className="mx-auto h-12 w-12" />
          <p className="font-semibold mt-4">No tasks assigned</p>
          <p className="text-sm">You're all caught up!</p>
        </div>
      )}
    </CardContent>
  </Card>
);

export const CampaignPipeline: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  const pipeline = {
    'Brief': tasks.filter(t => t.status === 'todo').length,
    'Creating': tasks.filter(t => t.status === 'in-progress').length,
    'Review': tasks.filter(t => t.status === 'review').length,
    'Published': tasks.filter(t => t.status === 'completed').length
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Campaign Pipeline</CardTitle>
        <Button variant="ghost" size="sm"><Plus className="w-4 h-4 mr-2" /> Add Campaign</Button>
      </CardHeader>
      <CardContent className="grid grid-cols-4 gap-4">
        {Object.entries(pipeline).map(([status, count]) => (
          <div key={status} className="p-2 rounded-lg bg-muted text-center">
            <p className="text-sm text-muted-foreground">{status}</p>
            <p className="text-2xl font-bold">{count}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export const ClientHealth: React.FC<any> = () => (
  <Card>
    <CardHeader>
      <CardTitle>Client Health</CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-3 gap-4">
       <div className="p-2 rounded-lg text-center">
         <Smile className="w-8 h-8 mx-auto text-green-500" />
         <p className="text-2xl font-bold">3</p>
         <p className="text-sm text-muted-foreground">Healthy</p>
       </div>
       <div className="p-2 rounded-lg text-center">
         <Meh className="w-8 h-8 mx-auto text-yellow-500" />
         <p className="text-2xl font-bold">0</p>
         <p className="text-sm text-muted-foreground">Attention</p>
       </div>
       <div className="p-2 rounded-lg text-center">
         <Frown className="w-8 h-8 mx-auto text-red-500" />
         <p className="text-2xl font-bold">0</p>
         <p className="text-sm text-muted-foreground">Issues</p>
       </div>
    </CardContent>
  </Card>
); 