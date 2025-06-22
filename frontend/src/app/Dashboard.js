'use client';

import { useState } from 'react';
import { useAuth } from './AuthContext';
import FileUpload from './FileUpload';
import FileInbox from './FileInbox';
import SentFiles from './SentFiles';
import Header from './Header';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast';

export default function Dashboard({ onBackToLanding }) {
  const [activeTab, setActiveTab] = useState('upload');
  const { user } = useAuth();

  const tabs = [
    { id: 'upload', name: 'Upload File', component: FileUpload },
    { id: 'inbox', name: 'Received Files', component: FileInbox },
    { id: 'sent', name: 'Sent Files', component: SentFiles },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid #475569',
          },
        }}
      />
      
      {/* Header */}
      <Header 
        showAuthButtons={false} 
        onBackToLanding={onBackToLanding}
        activeAuthTab=""
      />

      {/* Navigation */}
      <nav className="gradient-bg-alt border-b border-slate-700/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600'
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

      <Footer />
    </div>
  );
} 