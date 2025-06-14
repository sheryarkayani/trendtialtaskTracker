import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Task } from '@/types';
import { Clock, UserPlus, AlertTriangle } from 'lucide-react';

interface TaskWidgetProps {
  tasks: Task[];
  title: string;
  icon: React.ReactNode;
  emptyText: string;
  cta1Text: string;
  cta2Text: string;
}

const TaskWidget: React.FC<TaskWidgetProps> = ({ tasks, title, icon, emptyText, cta1Text, cta2Text }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          {title}
        </div>
        <span className="text-sm font-medium bg-muted text-muted-foreground rounded-full px-2 py-0.5">{tasks.length}</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      {tasks.length > 0 ? (
        <div className="space-y-2">
          {tasks.slice(0, 3).map(task => (
            <div key={task.id} className="p-2 rounded-lg border">
              <p className="font-semibold text-sm">{task.title}</p>
              <p className="text-xs text-muted-foreground">Due: {new Date(task.due_date!).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">{emptyText}</p>
      )}
      <div className="flex items-center gap-2 mt-4">
        <Button variant="outline" size="sm" className="w-full">{cta1Text}</Button>
        <Button variant="outline" size="sm" className="w-full">{cta2Text}</Button>
      </div>
    </CardContent>
  </Card>
);

export const OverdueTasks: React.FC<{ tasks: Task[] }> = ({ tasks }) => (
  <TaskWidget 
    tasks={tasks}
    title="Overdue Tasks"
    icon={<Clock className="w-5 h-5 text-red-500" />}
    emptyText="No tasks are overdue. Great job!"
    cta1Text="Reassign"
    cta2Text="Extend Deadline"
  />
);

export const UnassignedTasks: React.FC<{ tasks: Task[] }> = ({ tasks }) => (
  <TaskWidget 
    tasks={tasks}
    title="Unassigned Campaigns"
    icon={<UserPlus className="w-5 h-5 text-blue-500" />}
    emptyText="All campaigns are assigned."
    cta1Text="Assign Now"
    cta2Text="View All"
  />
);

export const HighPriorityTasks: React.FC<{ tasks: Task[] }> = ({ tasks }) => (
  <TaskWidget 
    tasks={tasks}
    title="High Priority Pending"
    icon={<AlertTriangle className="w-5 h-5 text-yellow-500" />}
    emptyText="No high priority tasks are pending."
    cta1Text="Start Now"
    cta2Text="Prioritize"
  />
); 