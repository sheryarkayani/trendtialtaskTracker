
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, Users, Building2 } from 'lucide-react';
import { Client } from '@/types/client';

interface TaskFiltersProps {
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
  teamMembers: Array<{ id: string; first_name: string | null; last_name: string | null; }>;
  clients: Client[];
  onClearFilters: () => void;
}

const TaskFilters = ({
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
  onClearFilters
}: TaskFiltersProps) => {
  return (
    <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <SelectValue placeholder="Client" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: client.brand_color || '#3B82F6' }}
                  />
                  {client.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
          </SelectContent>
        </Select>

        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="instagram">📸 Instagram</SelectItem>
            <SelectItem value="facebook">📘 Facebook</SelectItem>
            <SelectItem value="tiktok">🎵 TikTok</SelectItem>
            <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
            <SelectItem value="twitter">🐦 Twitter</SelectItem>
          </SelectContent>
        </Select>

        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <SelectValue placeholder="Assignee" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Team Members</SelectItem>
            {teamMembers.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.first_name} {member.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button 
          variant="outline" 
          onClick={onClearFilters}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Clear
        </Button>
      </div>
    </div>
  );
};

export default TaskFilters;
