import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Task } from '@/types';
import { Client } from '@/types/client';
import TaskListView from './TaskListView';
import { TeamMember } from '@/hooks/useTeam';

interface ClientTaskViewProps {
  clients: Client[];
  tasks: Task[];
  teamMembers: TeamMember[];
}

const ClientTaskView: React.FC<ClientTaskViewProps> = ({ clients, tasks, teamMembers }) => {
  const getTasksForClient = (clientId: string) => {
    return tasks.filter(task => task.client_id === clientId);
  };

  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      {clients.map(client => {
        const clientTasks = getTasksForClient(client.id);
        return (
          <AccordionItem key={client.id} value={client.id} className="border rounded-lg">
            <AccordionTrigger className="p-6">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <div
                    className="w-3 h-12 rounded"
                    style={{ backgroundColor: client.brand_color || '#3B82F6' }}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                    <p className="text-sm text-gray-500">{client.company}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 pr-4">
                  {clientTasks.length} {clientTasks.length === 1 ? 'task' : 'tasks'}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
              {clientTasks.length > 0 ? (
                <TaskListView filteredTasks={clientTasks} teamMembers={teamMembers} />
              ) : (
                <p className="text-gray-500 text-center py-8">No tasks for this client.</p>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default ClientTaskView; 