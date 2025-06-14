
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Users, Archive, Trash, Mail, UserCheck, MoreHorizontal, Download, X } from 'lucide-react';

interface ClientBulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAction: (action: string, value?: string) => void;
  isLoading?: boolean;
}

const ClientBulkActions = ({ 
  selectedCount, 
  onClearSelection, 
  onBulkAction,
  isLoading = false 
}: ClientBulkActionsProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-lg shadow-lg border p-4 flex items-center gap-4 min-w-96">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-blue-600">
            {selectedCount} selected
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Change */}
          <Select onValueChange={(value) => onBulkAction('changeStatus', value)} disabled={isLoading}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Change Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Set Active</SelectItem>
              <SelectItem value="inactive">Set Inactive</SelectItem>
              <SelectItem value="archived">Archive</SelectItem>
            </SelectContent>
          </Select>

          {/* Assign Account Manager */}
          <Select onValueChange={(value) => onBulkAction('assignManager', value)} disabled={isLoading}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Assign Manager" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user1">John Doe</SelectItem>
              <SelectItem value="user2">Jane Smith</SelectItem>
              <SelectItem value="user3">Mike Johnson</SelectItem>
            </SelectContent>
          </Select>

          {/* Quick Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkAction('sendEmail')}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <Mail className="w-4 h-4" />
            Email
          </Button>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isLoading}>
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onBulkAction('export')}>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkAction('archive')}>
                <Archive className="w-4 h-4 mr-2" />
                Archive Clients
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onBulkAction('delete')}
                className="text-red-600"
              >
                <Trash className="w-4 h-4 mr-2" />
                Delete Clients
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default ClientBulkActions;
