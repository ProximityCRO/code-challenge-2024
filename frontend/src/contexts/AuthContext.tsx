import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'driver';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phoneNumber: string, role: 'user' | 'driver') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Implement token validation logic here
      // For now, we'll just assume the token is valid
      const userId = localStorage.getItem('userId');
      const userRole = localStorage.getItem('userRole');
      if (userId && userRole) {
        setUser({ id: parseInt(userId), name: '', email: '', role: userRole as 'user' | 'driver' });
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:3001/api/v1/auth/login', { email, password });
      const { token, email: userEmail, id, role } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', id.toString());
      localStorage.setItem('userRole', role);
      setUser({ id, email: userEmail, name: '', role });
      navigate(role === 'driver' ? '/driver-dashboard' : '/user-dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, phoneNumber: string, role: 'user' | 'driver') => {
    try {
      console.log('Registering user:', { name, email, phoneNumber, role });
      const response = await axios.post('http://localhost:3001/api/v1/auth/register', {
        name,
        email,
        password,
        phone_number: phoneNumber,
        role
      });
      const { name: userName, email: userEmail } = response.data;
      setUser({ id: 0, name: userName, email: userEmail, role });
      navigate('/login');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Registration failed:', error.response.data);
        throw new Error(error.response.data.message || 'Registration failed. Please check your input and try again.');
      } else {
        console.error('Registration failed:', error);
        throw new Error('An unexpected error occurred. Please try again later.');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};