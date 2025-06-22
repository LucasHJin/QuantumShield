'use client';

import { useAuth } from './AuthContext';
import Image from 'next/image';

export default function Header({ showAuthButtons = false, onSwitchToLogin, onSwitchToRegister, onBackToLanding, onBackToDashboard, activeAuthTab = 'login' }) {
  const { user, logout } = useAuth();

  const handleLogoClick = () => {
    if (onBackToLanding) {
      // Use the provided function to navigate back to landing page
      onBackToLanding();
    }
  };

  const handleUserNameClick = () => {
    if (onBackToDashboard) {
      onBackToDashboard();
    }
  };

  return (
    <header className="gradient-bg-alt border-b border-slate-700/50 shadow-lg backdrop-blur-sm h-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo and Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity duration-200"
            onClick={handleLogoClick}
          >
            <div className="relative w-10 h-10">
              <Image
                src="/QShield.png"
                alt="QShield"
                width={40}
                height={40}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                QuantumShield
              </h1>
              <p className="text-sm text-slate-400">
                Post-Quantum Cryptography
              </p>
            </div>
          </div>

          {/* Right side - Auth buttons or user info */}
          <div className="flex items-center justify-end w-64 h-full">
            {showAuthButtons ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={onSwitchToLogin}
                  className={`px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium w-20 ${
                    activeAuthTab === 'login'
                      ? 'bg-slate-600 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={onSwitchToRegister}
                  className={`px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium w-20 ${
                    activeAuthTab === 'register'
                      ? 'bg-slate-600 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-300">
                  Welcome,{' '}
                  <span 
                    className={`font-semibold text-white ${onBackToDashboard ? 'cursor-pointer hover:text-slate-300 transition-colors duration-200' : ''}`}
                    onClick={handleUserNameClick}
                  >
                    {user}
                  </span>
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-slate-700 text-slate-200 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 shadow-lg text-sm font-medium w-20"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 