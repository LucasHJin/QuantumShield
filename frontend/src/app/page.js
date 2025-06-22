'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import Dashboard from './Dashboard';
import LandingPage from './LandingPage';

function AppContent() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'login', 'register'
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-400 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  // Show landing page by default when not logged in
  if (currentView === 'landing') {
    return (
      <LandingPage 
        onSwitchToLogin={() => setCurrentView('login')}
        onSwitchToRegister={() => setCurrentView('register')}
      />
    );
  }

  if (currentView === 'register') {
    return (
      <RegisterForm 
        onSwitchToLogin={() => setCurrentView('login')}
        onBackToLanding={() => setCurrentView('landing')}
      />
    );
  }

  return (
    <LoginForm 
      onSwitchToRegister={() => setCurrentView('register')}
      onBackToLanding={() => setCurrentView('landing')}
    />
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

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
