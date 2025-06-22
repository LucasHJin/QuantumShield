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
  const [activeTab, setActiveTab] = useState('received');
  const { user } = useAuth();

  const renderFileSection = () => {
    if (activeTab === 'received') {
      return <FileInbox />;
    } else {
      return <SentFiles />;
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#3b275f',
            color: '#eadaff',
            border: '1px solid #eadaff',
          },
        }}
      />
      
      {/* Header */}
      <Header 
        showAuthButtons={false} 
        onBackToLanding={onBackToLanding}
        activeAuthTab=""
      />

      {/* Main Content */}
      <main className="flex-grow w-full px-8 py-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex gap-12">
            {/* Left Section - Upload (1/3) */}
            <div className="w-1/3 flex-shrink-0">
              <FileUpload />
            </div>
            
            {/* Right Section - Files (2/3) */}
            <div className="w-2/3 flex-grow">
              {/* Toggle for Received/Sent */}
              <div className="mb-8">
                <div className="flex bg-[#3b275f]/20 rounded-lg p-1 border border-[#eadaff]/30">
                  <button
                    onClick={() => setActiveTab('received')}
                    className={`flex-1 py-3 px-6 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === 'received'
                        ? 'bg-[#f38cff] text-black shadow-lg'
                        : 'text-[#eadaff] hover:text-white'
                    }`}
                  >
                    Received Files
                  </button>
                  <button
                    onClick={() => setActiveTab('sent')}
                    className={`flex-1 py-3 px-6 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === 'sent'
                        ? 'bg-[#f38cff] text-black shadow-lg'
                        : 'text-[#eadaff] hover:text-white'
                    }`}
                  >
                    Sent Files
                  </button>
                </div>
              </div>
              
              {/* File Section */}
              {renderFileSection()}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 