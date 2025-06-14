
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, Mail, Phone, MoreVertical, MessageSquare, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Client } from '@/types/client';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedClientCardProps {
  client: Client;
  taskCount?: number;
  teamCount?: number;
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onSendMessage: (client: Client) => void;
  isSelected?: boolean;
  onSelect?: (clientId: string) => void;
}

const EnhancedClientCard = ({ 
  client, 
  taskCount = 0, 
  teamCount = 0, 
  onView,
  onEdit, 
  onDelete,
  onSendMessage,
  isSelected = false,
  onSelect
}: EnhancedClientCardProps) => {
  const getHealthIcon = () => {
    switch (client.health_status) {
      case 'healthy':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'needs_attention':
        return <Clock className="w-3 h-3 text-yellow-500" />;
      case 'issues':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return <CheckCircle className="w-3 h-3 text-gray-400" />;
    }
  };

  const getContractStatus = () => {
    if (!client.contract_end_date) return null;
    
    const endDate = new Date(client.contract_end_date);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return <Badge variant="destructive" className="text-xs">Contract Expired</Badge>;
    } else if (daysUntilExpiry <= 30) {
      return <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Expires in {daysUntilExpiry} days</Badge>;
    } else if (daysUntilExpiry <= 90) {
      return <Badge variant="secondary" className="text-xs">Expires: {endDate.toLocaleDateString()}</Badge>;
    }
    return null;
  };

  const getLastContactText = () => {
    if (!client.last_contact_date) return "No recent contact";
    return `Last contact: ${formatDistanceToNow(new Date(client.last_contact_date), { addSuffix: true })}`;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView(client);
  };

  const handleSelectChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(client.id);
    }
  };

  return (
    <Card 
      className={`hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 group relative ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{ borderLeftColor: client.brand_color || '#3B82F6' }}
      onClick={handleCardClick}
    >
      {onSelect && (
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelectChange}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="w-12 h-12">
              <AvatarImage src={client.logo_url || ''} alt={client.name} />
              <AvatarFallback className="text-sm font-semibold">
                {client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg text-gray-900 truncate">
                  {client.name}
                </h3>
                {getHealthIcon()}
              </div>
              {client.company && (
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                  <Building2 className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{client.company}</span>
                </div>
              )}
              <p className="text-xs text-gray-500">{getLastContactText()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {taskCount > 0 && (
              <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
                {taskCount} campaigns
              </Badge>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(client)}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(client)}>
                  Edit Client
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSendMessage(client)}>
                  Send Message
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(client)}
                  className="text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {client.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {client.description}
          </p>
        )}

        <div className="space-y-2 mb-4">
          {client.email && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
          )}
          
          {client.phone && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span>{client.phone}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              variant={client.status === 'active' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {client.status}
            </Badge>
            {client.account_manager_id && (
              <div className="text-xs text-gray-500">
                AM: {client.account_manager?.first_name} {client.account_manager?.last_name}
              </div>
            )}
          </div>
          
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSendMessage(client);
              }}
              className="h-8 px-2 text-xs"
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              Message
            </Button>
          </div>
        </div>

        {getContractStatus() && (
          <div className="mt-2 flex justify-end">
            {getContractStatus()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedClientCard;
