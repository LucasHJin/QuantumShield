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
    <header className="bg-black border-b border-[#eadaff]/30 shadow-lg backdrop-blur-sm h-20">
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
              <p className="text-sm text-[#eadaff]">
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
                      ? 'bg-[#3b275f] text-white shadow-lg'
                      : 'text-[#eadaff] hover:text-white'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={onSwitchToRegister}
                  className={`px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium w-20 ${
                    activeAuthTab === 'register'
                      ? 'bg-[#3b275f] text-white shadow-lg'
                      : 'text-[#eadaff] hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-[#eadaff]">
                  Welcome,{' '}
                  <span 
                    className={`font-semibold text-white ${onBackToDashboard ? 'cursor-pointer hover:text-[#eadaff] transition-colors duration-200' : ''}`}
                    onClick={handleUserNameClick}
                  >
                    {user}
                  </span>
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-[#3b275f] text-white rounded-md hover:bg-[#eadaff] focus:outline-none focus:ring-2 focus:ring-[#eadaff] focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 shadow-lg text-sm font-medium w-20"
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