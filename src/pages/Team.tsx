
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTeam } from '@/hooks/useTeam';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import AddTeamMemberDialog from '@/components/AddTeamMemberDialog';
import EditTeamMemberDialog from '@/components/EditTeamMemberDialog';
import DeleteTeamMemberDialog from '@/components/DeleteTeamMemberDialog';
import { TeamMember } from '@/hooks/useTeam';

const Team = () => {
  const { user, loading: authLoading } = useAuth();
  const { teamMembers, loading: teamLoading, refetch } = useTeam();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'team_lead':
        return 'bg-purple-100 text-purple-800';
      case 'team_member':
        return 'bg-blue-100 text-blue-800';
      case 'client':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getWorkloadColor = (workload: number) => {
    if (workload >= 80) return 'bg-red-500';
    if (workload >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600 mt-1">Manage your team members and their roles</p>
          </div>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Members</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{teamLoading ? '...' : teamMembers.length + 1}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Team Leads</h3>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {teamLoading ? '...' : teamMembers.filter(m => m.role === 'team_lead').length + 1}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Team Members</h3>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {teamLoading ? '...' : teamMembers.filter(m => m.role === 'team_member').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Clients</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {teamLoading ? '...' : teamMembers.filter(m => m.role === 'client').length}
          </p>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
        </div>
        
        {teamLoading ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg p-6 h-48"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6">
            {teamMembers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
                <p className="text-gray-500 mb-4">Get started by adding your first team member</p>
                <Button onClick={() => setShowAddDialog(true)}>
                  Add Team Member
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.map((member) => (
                  <div key={member.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {member.first_name?.[0] || member.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {member.first_name && member.last_name 
                              ? `${member.first_name} ${member.last_name}`
                              : 'Unknown User'
                            }
                          </h3>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                            {member.role.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingMember(member)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeletingMember(member)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {member.email}
                      </div>
                      {member.bio && (
                        <p className="text-sm text-gray-600">{member.bio}</p>
                      )}
                    </div>

                    {member.skills && member.skills.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-1">
                          {member.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                          {member.skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{member.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Workload</span>
                          <span className="text-sm font-medium text-gray-900">{member.workload}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getWorkloadColor(member.workload)}`}
                            style={{ width: `${member.workload}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex justify-between text-sm">
                        <div>
                          <span className="text-gray-500">Completed:</span>
                          <span className="font-medium ml-1">{member.tasks_completed}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">In Progress:</span>
                          <span className="font-medium ml-1">{member.tasks_in_progress}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AddTeamMemberDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        onSuccess={() => {
          refetch();
          setShowAddDialog(false);
        }}
      />
      
      <EditTeamMemberDialog 
        member={editingMember}
        open={!!editingMember}
        onOpenChange={(open) => !open && setEditingMember(null)}
        onSuccess={() => {
          refetch();
          setEditingMember(null);
        }}
      />
      
      <DeleteTeamMemberDialog 
        member={deletingMember}
        open={!!deletingMember}
        onOpenChange={(open) => !open && setDeletingMember(null)}
        onSuccess={() => {
          refetch();
          setDeletingMember(null);
        }}
      />
    </div>
  );
};

export default Team;
