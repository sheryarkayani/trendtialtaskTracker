
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Users, Archive, Trash, Mail, UserCheck, MoreHorizontal, Download, X } from 'lucide-react';

interface ClientBulkActionsProps {
  selectedCount: number;
  onAction: (action: string, data?: any) => Promise<void>;
  onCancel: () => void;
}

const ClientBulkActions = ({ 
  selectedCount, 
  onAction,
  onCancel 
}: ClientBulkActionsProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg border p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-blue-600">
            {selectedCount} selected
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Change */}
          <Select onValueChange={(value) => onAction('status', { status: value })}>
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
          <Select onValueChange={(value) => onAction('manager', { managerId: value })}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Assign Manager" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user1">John Doe</SelectItem>
              <SelectItem value="user2">Jane Smith</SelectItem>
              <SelectItem value="user3">Mike Johnson</SelectItem>
            </SelectContent>
          </Select>

          {/* Delete Action */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onAction('delete')}
            className="flex items-center gap-1"
          >
            <Trash className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientBulkActions;
