import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types.ts';

interface AuthContextType {
  currentUser: User;
  allUsers: User[];
  switchUser: (role: UserRole) => void;
  canModifyDevices: boolean;
  canManageAlerts: boolean;
  canTrainModels: boolean;
  canChangeSettings: boolean;
}

const defaultAdmin: User = {
  id: 'usr-admin',
  username: 'admin',
  name: 'Dr. Evelyn Reed (SecOps Lead)',
  role: 'Admin',
  email: 'evelyn.reed@hospital-heartguard.med',
};

const AuthContext = createContext<AuthContextType>({
  currentUser: defaultAdmin,
  allUsers: [defaultAdmin],
  switchUser: () => {},
  canModifyDevices: true,
  canManageAlerts: true,
  canTrainModels: true,
  canChangeSettings: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(defaultAdmin);
  const [allUsers, setAllUsers] = useState<User[]>([defaultAdmin]);

  useEffect(() => {
    fetch('/api/auth/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.users && data.users.length > 0) {
          setAllUsers(data.users);
          const savedRole = localStorage.getItem('hg_user_role') as UserRole;
          if (savedRole) {
            const found = data.users.find((u: User) => u.role === savedRole);
            if (found) setCurrentUser(found);
          }
        }
      })
      .catch((err) => console.error('Failed to fetch users:', err));
  }, []);

  const switchUser = (role: UserRole) => {
    const user = allUsers.find((u) => u.role === role);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('hg_user_role', role);
      // Inform backend
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      }).catch((e) => console.error(e));
    }
  };

  const isViewer = currentUser.role === 'Viewer';
  const isAdmin = currentUser.role === 'Admin';
  const isAnalyst = currentUser.role === 'Security Analyst' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        switchUser,
        canModifyDevices: !isViewer,
        canManageAlerts: !isViewer,
        canTrainModels: isAnalyst,
        canChangeSettings: isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
