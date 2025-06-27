import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  BarChart3, 
  Calendar,
  Building2,
  Settings,
  DollarSign,
  Clock
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

const Sidebar = () => {
  const { profile } = useProfile();
  
  // Define navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/tasks', icon: CheckSquare, label: 'Campaigns' },
      { to: '/attendance', icon: Clock, label: 'Attendance' },
    ];

    // Show Financial for both superadmin and team_lead
    if (profile?.role === 'superadmin' || profile?.role === 'team_lead') {
      baseItems.push({ to: '/financial', icon: DollarSign, label: 'Financial' });
    }

    // Only show additional pages for team leads and admins
    if (profile?.role === 'team_lead' || profile?.role === 'superadmin') {
      return [
        ...baseItems,
        { to: '/team', icon: Users, label: 'Team' },
        { to: '/analytics', icon: BarChart3, label: 'Analytics' },
        { to: '/calendar', icon: Calendar, label: 'Calendar' },
        { to: '/clients', icon: Building2, label: 'Clients' },
        { to: '/settings', icon: Settings, label: 'Settings' },
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
        <p className="text-sm text-gray-500">SMMA Agency</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
