import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import type { UserRole } from '../types/index.js';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading, switchDemoRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-white rounded-3xl border border-stone-200 shadow-xl text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Access Restricted</h2>
        <p className="text-xs text-stone-600 leading-relaxed">
          Your current account role is <strong className="capitalize">{user.role.replace(/_/g, ' ')}</strong>.
          This section requires one of: <strong>{allowedRoles.map((r) => r.replace(/_/g, ' ')).join(', ')}</strong>.
        </p>

        <div className="pt-3 border-t border-stone-100">
          <p className="text-xs font-semibold text-stone-500 mb-2">Switch demo persona to test this portal:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {allowedRoles.map((role) => (
              <button
                key={role}
                onClick={() => switchDemoRole(role as any)}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition capitalize"
              >
                Switch to {role.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
