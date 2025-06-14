
import React from 'react';
import { User, Mail, Phone } from 'lucide-react';
import { useTeam } from '@/hooks/useTeam';

const TeamOverview = () => {
  const { teamMembers, loading } = useTeam();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Team Overview</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Team Overview</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {teamMembers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No team members found</p>
        ) : (
          teamMembers.map((member) => (
            <div key={member.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">
                  {member.first_name && member.last_name 
                    ? `${member.first_name} ${member.last_name}`
                    : 'Unknown User'
                  }
                </p>
                <p className="text-sm text-gray-500 capitalize">{member.role.replace('_', ' ')}</p>
              </div>

              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                  <Mail className="w-4 h-4" />
                </button>
                <div className={`w-2 h-2 rounded-full ${Math.random() > 0.5 ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
            </div>
          ))
        )}
      </div>

      {teamMembers.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Total Members</span>
            <span className="font-medium text-gray-900">{teamMembers.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-500">Online Now</span>
            <span className="font-medium text-green-600">
              {teamMembers.filter(() => Math.random() > 0.5).length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamOverview;
