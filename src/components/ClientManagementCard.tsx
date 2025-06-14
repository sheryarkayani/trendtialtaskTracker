
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Mail, Users, Edit, Trash } from 'lucide-react';
import { Client } from '@/types/client';

interface ClientManagementCardProps {
  client: Client;
  taskCount?: number;
  teamCount?: number;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

const ClientManagementCard = ({ 
  client, 
  taskCount = 0, 
  teamCount = 0, 
  onEdit, 
  onDelete 
}: ClientManagementCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4"
          style={{ borderLeftColor: client.brand_color || '#3B82F6' }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg text-gray-900">
                {client.name}
              </h3>
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: client.brand_color || '#3B82F6' }}
              />
            </div>
            {client.company && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Building2 className="w-4 h-4" />
                <span>{client.company}</span>
              </div>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(client)}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(client)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {client.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {client.description}
          </p>
        )}

        {client.email && (
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
            <Mail className="w-4 h-4" />
            <span>{client.email}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-xs">
              {taskCount} Tasks
            </Badge>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="w-3 h-3" />
              <span>{teamCount} Team</span>
            </div>
          </div>
          <Badge 
            variant={client.status === 'active' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {client.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientManagementCard;
