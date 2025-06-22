'use client';

import { useState } from 'react';
import { useAuth } from './AuthContext';
import FileUpload from './FileUpload';
import FileInbox from './FileInbox';
import SentFiles from './SentFiles';
import { Toaster } from 'react-hot-toast';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('upload');
  const { user, logout } = useAuth();

  const tabs = [
    { id: 'upload', name: 'Upload File', component: FileUpload },
    { id: 'inbox', name: 'Received Files', component: FileInbox },
    { id: 'sent', name: 'Sent Files', component: SentFiles },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Secure File Transfer System
              </h1>
              <p className="text-sm text-gray-600">
                Post-Quantum Cryptography Powered
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, <span className="font-semibold">{user}</span>
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-12">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>
              Built with Kyber (Key Encapsulation) and Dilithium (Digital Signatures)
            </p>
            <p className="mt-1">
              Post-Quantum Cryptography for Secure File Transfer
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 