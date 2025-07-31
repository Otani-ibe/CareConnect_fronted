import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const AuthTest: React.FC = () => {
  const { user, loading } = useAuth();

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Auth Context Test</h2>
      <div className="space-y-2">
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {user ? user.name : 'Not logged in'}</p>
        <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
        <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
      </div>
    </div>
  );
};

export default AuthTest; 