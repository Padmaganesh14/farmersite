import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'farmer' | 'buyer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => void;
  signup: (name: string, email: string, password: string, phone: string, role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for hackathon
const demoUsers: Record<string, User & { password: string }> = {
  'farmer@demo.com': {
    id: '1',
    name: 'Rajan Kumar',
    email: 'farmer@demo.com',
    phone: '+919876543210',
    role: 'farmer',
    password: 'demo123',
  },
  'buyer@demo.com': {
    id: '2',
    name: 'Priya Singh',
    email: 'buyer@demo.com',
    phone: '+919876543211',
    role: 'buyer',
    password: 'demo123',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      const userData: User = {
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        token: data.token
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const signup = async (name: string, email: string, password: string, phone: string, role: UserRole) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      
      const userData: User = {
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        token: data.token
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
