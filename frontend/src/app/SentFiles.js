'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function SentFiles() {
  const [sentFiles, setSentFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadSentFiles();
  }, []);

  const loadSentFiles = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/files/sent');
      setSentFiles(response.data.files);
    } catch (error) {
      toast.error('Failed to load sent files');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto min-w-[600px] bg-[#3b275f]/20 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-[#eadaff]/30">
        <h2 className="text-xl font-semibold mb-4 text-white">Sent Files</h2>
        <div className="text-center text-[#eadaff]">Loading files...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto min-w-[600px] bg-[#3b275f]/20 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-[#eadaff]/30">
      <h2 className="text-xl font-semibold mb-4 text-white">Sent Files</h2>
      
      {sentFiles.length === 0 ? (
        <div className="text-center py-8 text-[#eadaff]">
          <p>No files sent yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sentFiles.map((file) => (
            <div
              key={file.file_id}
              className="border border-[#eadaff]/30 rounded-lg p-4 hover:bg-[#3b275f]/30 transition-all duration-200 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-white">{file.filename}</h3>
                  <p className="text-sm text-[#eadaff]">
                    To: {file.recipient_username}
                  </p>
                  <p className="text-sm text-[#eadaff]">
                    File ID: {file.file_id}
                  </p>
                </div>
                <div className="ml-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#3b275f] text-[#eadaff] shadow-sm">
                    Sent
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6">
        <button
          onClick={loadSentFiles}
          className="px-4 py-2 bg-[#3b275f] text-white rounded-md hover:bg-[#eadaff] focus:outline-none focus:ring-2 focus:ring-[#eadaff] transition-all duration-200 shadow-lg"
        >
          Refresh
        </button>
      </div>
    </div>
  );
} 