import React, { useState, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import CommandCenter from '@/components/dashboard/CommandCenter';
import DashboardStats from '@/components/dashboard/DashboardStats';
import { OverdueTasks, UnassignedTasks, HighPriorityTasks } from '@/components/dashboard/TasksWidgets';
import { MyTasks, CampaignPipeline, ClientHealth } from '@/components/dashboard/BottomWidgets';

const Dashboard = () => {
  const { user } = useAuth();
  const { tasks, loading } = useTasks();

  const [overdue, setOverdue] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [highPriority, setHighPriority] = useState([]);
  const [myTasks, setMyTasks] = useState([]);

  useEffect(() => {
    if (tasks) {
      const now = new Date();
      setOverdue(tasks.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== 'completed'));
      setUnassigned(tasks.filter(t => !t.assignee_id));
      setHighPriority(tasks.filter(t => t.priority === 'high' && t.status !== 'completed'));
      if (user) {
        setMyTasks(tasks.filter(t => t.assignee_id === user.id));
      }
    }
  }, [tasks, user]);

  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <CommandCenter />
        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <OverdueTasks tasks={overdue} />
          <UnassignedTasks tasks={unassigned} />
          <HighPriorityTasks tasks={highPriority} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <MyTasks tasks={myTasks} />
          </div>
          <div className="lg:col-span-2">
            <CampaignPipeline tasks={tasks} />
          </div>
        </div>

        <div className="mt-8">
          <ClientHealth />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 