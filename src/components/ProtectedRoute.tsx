import React from 'react';
import { Navigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('team_lead' | 'team_member' | 'client' | 'superadmin')[];
  redirectTo?: string;
}

const ProtectedRoute = ({ children, allowedRoles, redirectTo = '/' }: ProtectedRouteProps) => {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile || !allowedRoles.includes(profile.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
