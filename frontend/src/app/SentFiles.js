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
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Sent Files</h2>
        <div className="text-center">Loading files...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Sent Files</h2>
      
      {sentFiles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No files sent yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sentFiles.map((file) => (
            <div
              key={file.file_id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{file.filename}</h3>
                  <p className="text-sm text-gray-500">
                    To: {file.recipient_username}
                  </p>
                  <p className="text-sm text-gray-500">
                    File ID: {file.file_id}
                  </p>
                </div>
                <div className="ml-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
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
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Refresh
        </button>
      </div>
    </div>
  );
} 