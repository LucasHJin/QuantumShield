'use client';

import { useState } from 'react';
import { useAuth } from './AuthContext';
import Header from './Header';
import Footer from './Footer';
import toast from 'react-hot-toast';

export default function LoginForm({ onSwitchToRegister, onBackToLanding }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      toast.success('Login successful!');
    } else {
      toast.error(result.error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header 
        showAuthButtons={true} 
        onSwitchToLogin={() => {}} 
        onSwitchToRegister={onSwitchToRegister}
        onBackToLanding={onBackToLanding}
        activeAuthTab="login"
      />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full min-w-[400px] space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-[#eadaff]">
              Access your secure file transfer dashboard
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[#eadaff] placeholder-[#eadaff] text-white bg-[#3b275f]/20 backdrop-blur-sm rounded-t-md focus:outline-none focus:ring-[#eadaff] focus:border-[#eadaff] focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[#eadaff] placeholder-[#eadaff] text-white bg-[#3b275f]/20 backdrop-blur-sm rounded-b-md focus:outline-none focus:ring-[#eadaff] focus:border-[#eadaff] focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#3b275f] hover:bg-[#eadaff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#eadaff] disabled:opacity-50 transition-all duration-200 shadow-lg"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-[#eadaff] hover:text-white text-sm cursor-pointer inline-block transition-colors duration-200"
              >
                Don't have an account? <span className="underline">Register here</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 