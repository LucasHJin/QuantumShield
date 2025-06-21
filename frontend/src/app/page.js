'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import Dashboard from './Dashboard';
import UserAuth from './UserAuth';

function AppContent() {
  const [showRegister, setShowRegister] = useState(false);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  return showRegister ? (
    <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />
  ) : (
    <LoginForm onSwitchToRegister={() => setShowRegister(true)} />
  );
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const savedToken = localStorage.getItem('quantumdocs_token');
    const savedUser = localStorage.getItem('quantumdocs_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (userData, token) => {
    setToken(token);
    setCurrentUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('quantumdocs_token', token);
    localStorage.setItem('quantumdocs_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('quantumdocs_token');
    localStorage.removeItem('quantumdocs_user');
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
        <h1>QuantumDocs - Secure File Encryption</h1>
        <p>Please log in or register to continue.</p>
        <UserAuth onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
