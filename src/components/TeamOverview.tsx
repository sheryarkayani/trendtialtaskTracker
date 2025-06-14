
import React from 'react';
import { User, Clock, CheckCircle } from 'lucide-react';

const TeamOverview = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Team Lead',
      avatar: '',
      status: 'online',
      tasksCompleted: 12,
      tasksInProgress: 3,
      workload: 85
    },
    {
      id: 2,
      name: 'Alex Chen', 
      role: 'Designer',
      avatar: '',
      status: 'online',
      tasksCompleted: 8,
      tasksInProgress: 5,
      workload: 92
    },
    {
      id: 3,
      name: 'Maria Rodriguez',
      role: 'Content Writer',
      avatar: '',
      status: 'away',
      tasksCompleted: 15,
      tasksInProgress: 2,
      workload: 67
    },
    {
      id: 4,
      name: 'James Wilson',
      role: 'Social Media Manager',
      avatar: '',
      status: 'offline',
      tasksCompleted: 10,
      tasksInProgress: 4,
      workload: 78
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getWorkloadColor = (workload: number) => {
    if (workload >= 90) return 'bg-red-500';
    if (workload >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Team Overview</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Manage Team
        </button>
      </div>

      <div className="space-y-4">
        {teamMembers.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-white`} />
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">{member.name}</h4>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{member.tasksCompleted}</span>
                </div>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center space-x-1 text-blue-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">{member.tasksInProgress}</span>
                </div>
                <p className="text-xs text-gray-500">In Progress</p>
              </div>

              <div className="text-center">
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getWorkloadColor(member.workload)} transition-all duration-300`}
                      style={{ width: `${member.workload}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{member.workload}%</span>
                </div>
                <p className="text-xs text-gray-500">Workload</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamOverview;
