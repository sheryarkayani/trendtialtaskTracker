import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  BarChart3, 
  Calendar,
  Building2,
  Settings 
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

const Sidebar = () => {
  const { profile } = useProfile();
  
  // Define navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/tasks', icon: CheckSquare, label: 'Campaigns' },
    ];

    // Only show additional pages for team leads and admins
    if (profile?.role === 'team_lead') {
      return [
        ...baseItems,
        { to: '/clients', icon: Building2, label: 'Clients' },
        { to: '/team', icon: Users, label: 'Team' },
        { to: '/analytics', icon: BarChart3, label: 'Analytics' },
        { to: '/calendar', icon: Calendar, label: 'Calendar' },
        { to: '/settings', icon: Settings, label: 'Settings' },
      ];
    }

    // Team members and clients only see limited pages
    return [
      ...baseItems,
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
      { to: '/calendar', icon: Calendar, label: 'Calendar' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="hidden md:block bg-card w-64 min-h-screen border-r">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">TaskFlow</h1>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
