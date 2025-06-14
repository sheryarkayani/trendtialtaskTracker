
import React from 'react';
import { 
  Home, 
  Calendar, 
  CheckSquare, 
  Users, 
  BarChart3, 
  Settings,
  Plus,
  Search,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppData } from '@/contexts/AppDataContext';

const Sidebar = ({ isCollapsed = false }: { isCollapsed?: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { analytics, tasks } = useAppData();
  
  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/', active: location.pathname === '/' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks', active: location.pathname === '/tasks', count: analytics.totalTasks },
    { icon: Calendar, label: 'Calendar', path: '/calendar', active: location.pathname === '/calendar', count: analytics.overdueTasks },
    { icon: Users, label: 'Team', path: '/team', active: location.pathname === '/team' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics', active: location.pathname === '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings', active: location.pathname === '/settings' },
  ];

  // Dynamic platform stats based on actual task data
  const platforms = [
    { name: 'Instagram', color: 'bg-pink-500', count: analytics.tasksByPlatform.instagram || 0 },
    { name: 'Facebook', color: 'bg-blue-600', count: analytics.tasksByPlatform.facebook || 0 },  
    { name: 'TikTok', color: 'bg-black', count: analytics.tasksByPlatform.tiktok || 0 },
    { name: 'LinkedIn', color: 'bg-blue-500', count: analytics.tasksByPlatform.linkedin || 0 },
    { name: 'Twitter', color: 'bg-sky-400', count: analytics.tasksByPlatform.twitter || 0 },
  ].filter(platform => platform.count > 0); // Only show platforms with tasks

  return (
    <div className={cn(
      "h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">TaskFlow</h1>
              <p className="text-sm text-gray-500">Social Media Hub</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg px-4 py-3 flex items-center justify-center space-x-2 hover:shadow-lg transition-all duration-200">
            <Plus className="w-4 h-4" />
            <span className="font-medium">New Task</span>
          </button>
          
          <div className="mt-3 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200",
                item.active 
                  ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-200" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <div className="flex items-center space-x-3">
                <item.icon className={cn("w-5 h-5", item.active && "text-blue-600")} />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </div>
              {!isCollapsed && item.count !== undefined && item.count > 0 && (
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  item.active ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                )}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Platform Stats - Now dynamic */}
        {!isCollapsed && platforms.length > 0 && (
          <div className="p-4 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Active Platforms</h3>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              {platforms.map((platform, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={cn("w-3 h-3 rounded-full", platform.color)} />
                    <span className="text-sm text-gray-700">{platform.name}</span>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {platform.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
