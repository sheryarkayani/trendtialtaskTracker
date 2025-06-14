
import React from 'react';
import { Users, ArrowRight, Star, Trash2, CheckSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BulkTaskActionsProps {
  selectedTasks: string[];
  onClearSelection: () => void;
  onBulkAssign: (assigneeId: string) => void;
  onBulkStatusChange: (status: string) => void;
  onBulkPriorityChange: (priority: string) => void;
  onBulkDelete: () => void;
  teamMembers: any[];
  isVisible: boolean;
}

const BulkTaskActions = ({
  selectedTasks,
  onClearSelection,
  onBulkAssign,
  onBulkStatusChange,
  onBulkPriorityChange,
  onBulkDelete,
  teamMembers,
  isVisible
}: BulkTaskActionsProps) => {
  if (!isVisible || selectedTasks.length === 0) return null;

  return (
    <div className={cn(
      "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300",
      "bg-white border border-gray-200 rounded-xl shadow-lg p-4",
      "flex items-center space-x-4 min-w-max"
    )}>
      {/* Selection Count */}
      <div className="flex items-center space-x-2">
        <CheckSquare className="w-5 h-5 text-blue-500" />
        <Badge variant="secondary">
          {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
        </Badge>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-300" />

      {/* Bulk Actions */}
      <div className="flex items-center space-x-2">
        {/* Assign */}
        <Select onValueChange={onBulkAssign}>
          <SelectTrigger className="w-40">
            <Users className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Assign to..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassign">Unassign</SelectItem>
            {teamMembers.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.first_name} {member.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Change Status */}
        <Select onValueChange={onBulkStatusChange}>
          <SelectTrigger className="w-40">
            <ArrowRight className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Change status..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">Content Brief</SelectItem>
            <SelectItem value="in-progress">Creating</SelectItem>
            <SelectItem value="review">Client Review</SelectItem>
            <SelectItem value="completed">Published</SelectItem>
          </SelectContent>
        </Select>

        {/* Set Priority */}
        <Select onValueChange={onBulkPriorityChange}>
          <SelectTrigger className="w-40">
            <Star className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Set priority..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
          </SelectContent>
        </Select>

        {/* Delete */}
        <Button
          variant="destructive"
          size="sm"
          onClick={onBulkDelete}
          className="flex items-center space-x-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </Button>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-300" />

      {/* Clear Selection */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        className="flex items-center space-x-2"
      >
        <X className="w-4 h-4" />
        <span>Clear</span>
      </Button>
    </div>
  );
};

export default BulkTaskActions;
