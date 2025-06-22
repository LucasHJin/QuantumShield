'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function FileInbox() {
  const [receivedFiles, setReceivedFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingFile, setDownloadingFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadReceivedFiles();
  }, []);

  useEffect(() => {
    // Filter files based on search term
    if (searchTerm.trim() === '') {
      setFilteredFiles(receivedFiles);
    } else {
      const filtered = receivedFiles.filter(file => 
        file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.sender_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.file_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFiles(filtered);
    }
  }, [searchTerm, receivedFiles]);

  const loadReceivedFiles = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/files/received');
      setReceivedFiles(response.data.files);
      setFilteredFiles(response.data.files);
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

      const response = await axios.post('http://localhost:8000/api/download', 
        formData,
        { 
          responseType: 'blob',
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
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
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-white">Received Files</h2>
        <div className="text-center text-[#eadaff] text-lg">Loading files...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-white">Received Files</h2>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search files, senders, or file IDs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-[#eadaff] rounded-lg shadow-sm focus:outline-none focus:ring-[#eadaff] focus:border-[#eadaff] bg-[#3b275f]/20 backdrop-blur-sm text-white placeholder-[#eadaff] text-sm"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-[#eadaff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {filteredFiles.length === 0 ? (
        <div className="text-center py-8 text-[#eadaff] text-base">
          <p>{searchTerm ? 'No files found matching your search.' : 'No files received yet.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.file_id}
              className="bg-[#3b275f]/20 backdrop-blur-sm rounded-lg p-4 border border-[#eadaff]/30 hover:bg-[#3b275f]/30 transition-all duration-200"
            >
              <h3 className="font-semibold text-white text-base mb-2 break-words">{file.filename}</h3>
              <div className="space-y-1 mb-3">
                <p className="text-sm text-[#eadaff] break-words">
                  <span className="font-medium">From:</span> {file.sender_username}
                </p>
                <p className="text-sm text-[#eadaff] break-words">
                  <span className="font-medium">ID:</span> {file.file_id}
                </p>
              </div>
              <button
                onClick={() => handleDownload(file.file_id, file.filename)}
                disabled={downloadingFile === file.file_id}
                className="w-full px-4 py-2 bg-[#3b275f] text-white rounded-lg hover:bg-[#eadaff] hover:text-black focus:outline-none focus:ring-2 focus:ring-[#eadaff] disabled:opacity-50 transition-all duration-200 shadow-lg font-medium text-sm"
              >
                {downloadingFile === file.file_id ? 'Decrypting...' : 'Download & Decrypt'}
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6">
        <button
          onClick={loadReceivedFiles}
          className="px-4 py-2 bg-[#3b275f] text-white rounded-lg hover:bg-[#eadaff] hover:text-black focus:outline-none focus:ring-2 focus:ring-[#eadaff] transition-all duration-200 shadow-lg text-sm font-medium"
        >
          Refresh
        </button>
      </div>
    </div>
  );
} 