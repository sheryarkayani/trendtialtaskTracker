
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Client } from '@/types/client';
import { 
  MoreHorizontal, 
  Mail, 
  Edit, 
  Archive, 
  Trash, 
  Eye,
  Building2,
  Calendar,
  Phone,
  MapPin,
  User,
  Target
} from 'lucide-react';

interface EnhancedClientCardProps {
  client: Client;
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
  onSelect?: (clientId: string, selected: boolean) => void;
  isSelected?: boolean;
  showSelection?: boolean;
}

const EnhancedClientCard = ({ 
  client, 
  onView, 
  onEdit, 
  onDelete, 
  onSelect,
  isSelected = false,
  showSelection = false
}: EnhancedClientCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'needs_attention': return 'bg-yellow-500';
      case 'issues': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'archived': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatLastContact = (date: string | null) => {
    if (!date) return 'No contact logged';
    const contactDate = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - contactDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getContractStatus = () => {
    if (!client.contract_end_date) return null;
    
    const endDate = new Date(client.contract_end_date);
    const now = new Date();
    const diffDays = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Contract expired', color: 'bg-red-100 text-red-700' };
    if (diffDays <= 30) return { text: `Expires in ${diffDays} days`, color: 'bg-yellow-100 text-yellow-700' };
    return { text: `Expires ${endDate.toLocaleDateString()}`, color: 'bg-green-100 text-green-700' };
  };

  const contractStatus = getContractStatus();

  const handleCheckboxChange = (checked: boolean) => {
    if (onSelect) {
      onSelect(client.id, checked);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger onView if clicking on interactive elements
    if ((e.target as HTMLElement).closest('.dropdown-trigger') || 
        (e.target as HTMLElement).closest('.checkbox-container') ||
        (e.target as HTMLElement).closest('button')) {
      return;
    }
    onView(client);
  };

  return (
    <Card 
      className={`transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-1 ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            {showSelection && (
              <div className="checkbox-container pt-1">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={handleCheckboxChange}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            <Avatar className="w-12 h-12">
              <AvatarFallback 
                className="text-lg font-semibold"
                style={{ backgroundColor: client.brand_color || '#3B82F6' }}
              >
                {client.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg truncate">{client.name}</h3>
                <div className={`w-2 h-2 rounded-full ${getHealthColor(client.health_status)}`} />
              </div>
              {client.company && (
                <p className="text-gray-600 text-sm flex items-center gap-1 mb-1">
                  <Building2 className="w-3 h-3" />
                  {client.company}
                </p>
              )}
              <p className="text-gray-500 text-xs">
                Last contact: {formatLastContact(client.last_contact_date)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Campaign count badge */}
            <Badge variant="outline" className="text-xs">
              <Target className="w-3 h-3 mr-1" />
              3 campaigns
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="dropdown-trigger">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(client)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(client)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Client
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(client.id)}
                  className="text-red-600"
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(client.status)}>
              {client.status}
            </Badge>
            {contractStatus && (
              <Badge className={contractStatus.color}>
                {contractStatus.text}
              </Badge>
            )}
          </div>

          <div className="space-y-1 text-sm text-gray-600">
            {client.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3" />
                <span className="truncate">{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.address && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{client.address}</span>
              </div>
            )}
            {client.account_manager && (
              <div className="flex items-center gap-2">
                <User className="w-3 h-3" />
                <span>{client.account_manager.first_name} {client.account_manager.last_name}</span>
              </div>
            )}
          </div>

          {client.monthly_retainer && (
            <div className="text-sm font-semibold text-green-600">
              ${client.monthly_retainer}/month
            </div>
          )}
        </div>

        {(isHovered || isSelected) && (
          <div className="mt-4 pt-4 border-t flex gap-2">
            <Button size="sm" variant="outline" className="flex-1">
              <Mail className="w-3 h-3 mr-1" />
              Message
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <Calendar className="w-3 h-3 mr-1" />
              Schedule
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedClientCard;
