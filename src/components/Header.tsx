import React from 'react';
import { Search, User, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import MobileNav from './MobileNav';
import { NotificationBell } from './NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { signOut } = useAuth();
  const { profile } = useProfile();

  const handleSignOut = async () => {
    await signOut();
  };

  const displayName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : profile?.email || 'User';

  const displayRole = profile?.role === 'team_lead' ? 'Team Lead' : 
                     profile?.role === 'team_member' ? 'Team Member' : 
                     profile?.role === 'superadmin' ? 'Super Admin' : 'Client';

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Mobile Nav + Title */}
        <div className="flex items-center gap-4">
          <MobileNav />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-500 text-xs md:text-sm">Welcome back!</p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Search - Hidden on mobile */}
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-[200px] lg:w-80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Notifications */}
          <NotificationBell />

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-500">{displayRole}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="md:hidden">
                <div className="flex flex-col">
                  <span className="font-medium">{displayName}</span>
                  <span className="text-sm text-gray-500">{displayRole}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
