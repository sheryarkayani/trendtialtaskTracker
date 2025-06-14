
import React from 'react';
import { Search, X, Filter, Users, Building2, Calendar, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface EnhancedTaskFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  platformFilter: string;
  setPlatformFilter: (platform: string) => void;
  assigneeFilter: string;
  setAssigneeFilter: (assignee: string) => void;
  clientFilter: string;
  setClientFilter: (client: string) => void;
  teamMembers: any[];
  clients: any[];
  onClearFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

const EnhancedTaskFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  platformFilter,
  setPlatformFilter,
  assigneeFilter,
  setAssigneeFilter,
  clientFilter,
  setClientFilter,
  teamMembers,
  clients,
  onClearFilters,
  filteredCount,
  totalCount
}: EnhancedTaskFiltersProps) => {
  const hasActiveFilters = searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || 
                          platformFilter !== 'all' || assigneeFilter !== 'all' || clientFilter !== 'all';

  const quickFilters = [
    { id: 'my-tasks', label: 'My Tasks', icon: Users, action: () => setAssigneeFilter('current-user') },
    { id: 'overdue', label: 'Overdue', icon: AlertTriangle, action: () => setStatusFilter('overdue') },
    { id: 'this-week', label: 'This Week', icon: Calendar, action: () => setStatusFilter('this-week') },
    { id: 'high-priority', label: 'High Priority', icon: Filter, action: () => setPriorityFilter('high') }
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Filter Chips */}
      <div className="flex items-center flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-700 mr-2">Quick filters:</span>
        {quickFilters.map((filter) => (
          <Button
            key={filter.id}
            variant="outline"
            size="sm"
            onClick={filter.action}
            className="flex items-center space-x-1 h-8"
          >
            <filter.icon className="w-3 h-3" />
            <span>{filter.label}</span>
          </Button>
        ))}
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">Content Brief</SelectItem>
            <SelectItem value="in-progress">Creating</SelectItem>
            <SelectItem value="review">Client Review</SelectItem>
            <SelectItem value="completed">Published</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
          </SelectContent>
        </Select>

        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="instagram">📷 Instagram</SelectItem>
            <SelectItem value="facebook">📘 Facebook</SelectItem>
            <SelectItem value="tiktok">🎵 TikTok</SelectItem>
            <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
            <SelectItem value="twitter">🐦 Twitter</SelectItem>
          </SelectContent>
        </Select>

        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {teamMembers.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.first_name} {member.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: client.brand_color || '#3B82F6' }}
                  />
                  <span>{client.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filter Results Summary */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Showing {filteredCount} of {totalCount} tasks
          </span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="w-3 h-3 mr-1" />
              Clear all filters
            </Button>
          )}
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Active filters:</span>
            {searchTerm && (
              <Badge variant="secondary">
                Search: {searchTerm}
                <button onClick={() => setSearchTerm('')} className="ml-1">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge variant="secondary">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('all')} className="ml-1">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {priorityFilter !== 'all' && (
              <Badge variant="secondary">
                Priority: {priorityFilter}
                <button onClick={() => setPriorityFilter('all')} className="ml-1">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedTaskFilters;
