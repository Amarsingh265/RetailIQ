import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, role?: UserRole) => boolean;
  loginAsDemo: (role: UserRole) => void;
  register: (name: string, email: string, role: UserRole) => boolean;
  logout: () => void;
  updateUserStatus: (userId: string, active: boolean) => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  updateProfile: (name: string, department?: string) => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
}

const DEFAULT_USERS: User[] = [
  {
    id: 'user-retailer-01',
    name: 'Alex Vance',
    email: 'retailer@retailiq.ai',
    role: 'retailer',
    department: 'Retail Operations & Merchandising',
    active: true,
    createdAt: '2026-01-10',
    lastLogin: 'Today, 10:24 AM'
  },
  {
    id: 'user-analyst-02',
    name: 'Dr. Sarah Chen',
    email: 'analyst@retailiq.ai',
    role: 'analyst',
    department: 'Predictive Analytics & Data Science',
    active: true,
    createdAt: '2026-01-15',
    lastLogin: 'Today, 11:45 AM'
  },
  {
    id: 'user-admin-03',
    name: 'Marcus Brody',
    email: 'admin@retailiq.ai',
    role: 'admin',
    department: 'Enterprise Systems Administration',
    active: true,
    createdAt: '2025-11-20',
    lastLogin: 'Just now'
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('retailiq_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('retailiq_current_user');
    return saved ? JSON.parse(saved) : DEFAULT_USERS[0]; // Default logged in as Retailer
  });

  useEffect(() => {
    localStorage.setItem('retailiq_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('retailiq_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('retailiq_current_user');
    }
  }, [currentUser]);

  const login = (email: string, role?: UserRole): boolean => {
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      if (!user.active) {
        return false;
      }
      const updated = { ...user, lastLogin: 'Just now' };
      setCurrentUser(updated);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      return true;
    }

    // Auto-create for custom login in academic demo
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: role || 'retailer',
      department: 'Retail Branch Operations',
      active: true,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Just now'
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const loginAsDemo = (role: UserRole) => {
    const demo = users.find((u) => u.role === role) || DEFAULT_USERS.find((u) => u.role === role) || DEFAULT_USERS[0];
    const updated = { ...demo, active: true, lastLogin: 'Just now' };
    setCurrentUser(updated);
  };

  const register = (name: string, email: string, role: UserRole): boolean => {
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) return false;

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      department: role === 'retailer' ? 'Retail Branch' : role === 'analyst' ? 'Data Analytics' : 'IT Admin',
      active: true,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Just now'
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateUserStatus = (userId: string, active: boolean) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, active } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, active } : null));
    }
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, role: newRole } : null));
    }
  };

  const updateProfile = (name: string, department?: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, name, department: department || currentUser.department };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!currentUser) return false;
    return allowedRoles.includes(currentUser.role);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        loginAsDemo,
        register,
        logout,
        updateUserStatus,
        updateUserRole,
        updateProfile,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
