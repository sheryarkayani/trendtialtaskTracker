import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  BarChart3, 
  Calendar,
  Building2,
  Settings,
  Search,
  Bell
} from 'lucide-react';

const MobileNav = () => {
  const { profile } = useProfile();
  const [open, setOpen] = React.useState(false);
  
  const getNavItems = () => {
    const baseItems = [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/tasks', icon: CheckSquare, label: 'Campaigns' },
    ];

    if (profile?.role === 'team_lead' || profile?.role === 'superadmin') {
      return [
        ...baseItems,
        { to: '/clients', icon: Building2, label: 'Clients' },
        { to: '/team', icon: Users, label: 'Team' },
        { to: '/analytics', icon: BarChart3, label: 'Analytics' },
        { to: '/calendar', icon: Calendar, label: 'Calendar' },
        { to: '/settings', icon: Settings, label: 'Settings' },
      ];
    }

    return [
      ...baseItems,
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
      { to: '/calendar', icon: Calendar, label: 'Calendar' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pr-0">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">TaskFlow</h1>
          </div>
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNav;
