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
      const response = await axios.post('http://localhost:8000/api/download', 
        { file_id: fileId },
        { responseType: 'blob' }
      );

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
      toast.error('Failed to download file');
    } finally {
      setDownloadingFile(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto min-w-[600px] bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700/50">
        <h2 className="text-xl font-semibold mb-4 text-white">Received Files</h2>
        <div className="text-center text-slate-400">Loading files...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto min-w-[600px] bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700/50">
      <h2 className="text-xl font-semibold mb-4 text-white">Received Files</h2>
      
      {receivedFiles.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <p>No files received yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {receivedFiles.map((file) => (
            <div
              key={file.file_id}
              className="border border-slate-600/50 rounded-lg p-4 hover:bg-slate-700/30 transition-all duration-200 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-white">{file.filename}</h3>
                  <p className="text-sm text-slate-400">
                    From: {file.sender_username}
                  </p>
                  <p className="text-sm text-slate-400">
                    File ID: {file.file_id}
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(file.file_id, file.filename)}
                  disabled={downloadingFile === file.file_id}
                  className="ml-4 px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50 transition-all duration-200 shadow-lg"
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
          className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all duration-200 shadow-lg"
        >
          Refresh
        </button>
      </div>
    </div>
  );
} 