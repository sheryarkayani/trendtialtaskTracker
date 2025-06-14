
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Plus, Clock, MessageSquare, UserPlus, FileText, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const QuickActionsPanel = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const universalActions = [
    {
      icon: Plus,
      label: 'Create Campaign',
      action: () => window.location.href = '/tasks',
      color: 'text-blue-600'
    },
    {
      icon: Clock,
      label: 'Log Time',
      action: () => console.log('Log time'),
      color: 'text-green-600'
    },
    {
      icon: MessageSquare,
      label: 'Add Client Note',
      action: () => window.location.href = '/clients',
      color: 'text-purple-600'
    }
  ];

  const roleBasedActions = {
    team_lead: [
      {
        icon: UserPlus,
        label: 'Assign Tasks',
        action: () => window.location.href = '/tasks',
        color: 'text-orange-600'
      },
      {
        icon: FileText,
        label: 'Generate Report',
        action: () => window.location.href = '/analytics',
        color: 'text-indigo-600'
      }
    ],
    team_member: [
      {
        icon: Clock,
        label: 'Start Timer',
        action: () => console.log('Start timer'),
        color: 'text-green-600'
      },
      {
        icon: FileText,
        label: 'Upload Asset',
        action: () => console.log('Upload asset'),
        color: 'text-blue-600'
      }
    ]
  };

  const currentRoleActions = roleBasedActions[user?.role as keyof typeof roleBasedActions] || [];
  const allActions = [...universalActions, ...currentRoleActions];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <Plus className="w-4 h-4 mr-1" />
          Quick Actions
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        {allActions.map((action, index) => (
          <DropdownMenuItem 
            key={index}
            onClick={() => {
              action.action();
              setIsOpen(false);
            }}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <action.icon className={`w-4 h-4 ${action.color}`} />
            <span>{action.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default QuickActionsPanel;
