
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Mail, Users } from 'lucide-react';
import { Client } from '@/types/client';

interface ClientCardProps {
  client: Client;
  taskCount?: number;
  teamCount?: number;
  onClick?: () => void;
}

const ClientCard = ({ client, taskCount = 0, teamCount = 0, onClick }: ClientCardProps) => {
  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 group"
      style={{ borderLeftColor: client.brand_color || '#3B82F6' }}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
              {client.name}
            </h3>
            {client.company && (
              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                <Building2 className="w-4 h-4" />
                <span>{client.company}</span>
              </div>
            )}
          </div>
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: client.brand_color || '#3B82F6' }}
          />
        </div>

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

export default ClientCard;
