'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function FileInbox() {
  const [receivedFiles, setReceivedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingFile, setDownloadingFile] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    loadReceivedFiles();
  }, []);

  const loadReceivedFiles = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/files/received');
      setReceivedFiles(response.data.files);
    } catch (error) {
      toast.error('Failed to load received files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (fileId, filename) => {
    setDownloadingFile(fileId);
    
    try {
      const formData = new FormData();
      formData.append('file_id', fileId);

      const response = await axios.post('http://localhost:8000/api/download', formData, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('File downloaded and decrypted successfully!');
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('File decryption failed - signature verification failed');
      } else {
        toast.error('Download failed');
      }
    } finally {
      setDownloadingFile(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Received Files</h2>
        <div className="text-center">Loading files...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Received Files</h2>
      
      {receivedFiles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No files received yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {receivedFiles.map((file) => (
            <div
              key={file.file_id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{file.filename}</h3>
                  <p className="text-sm text-gray-500">
                    From: {file.sender_username}
                  </p>
                  <p className="text-sm text-gray-500">
                    File ID: {file.file_id}
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(file.file_id, file.filename)}
                  disabled={downloadingFile === file.file_id}
                  className="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {downloadingFile === file.file_id ? 'Decrypting...' : 'Download & Decrypt'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6">
        <button
          onClick={loadReceivedFiles}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Refresh
        </button>
      </div>
    </div>
  );
} 