'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function SentFiles() {
  const [sentFiles, setSentFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadSentFiles();
  }, []);

  useEffect(() => {
    // Filter files based on search term
    if (searchTerm.trim() === '') {
      setFilteredFiles(sentFiles);
    } else {
      const filtered = sentFiles.filter(file => 
        file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.recipient_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.file_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFiles(filtered);
    }
  }, [searchTerm, sentFiles]);

  const loadSentFiles = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/files/sent');
      setSentFiles(response.data.files);
      setFilteredFiles(response.data.files);
    } catch (error) {
      toast.error('Failed to load sent files');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-white">Sent Files</h2>
        <div className="text-center text-[#eadaff] text-lg">Loading files...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-white">Sent Files</h2>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search files, recipients, or file IDs..."
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
          <p>{searchTerm ? 'No files found matching your search.' : 'No files sent yet.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.file_id}
              className="bg-[#3b275f]/20 backdrop-blur-sm rounded-lg p-4 border border-[#eadaff]/30 hover:bg-[#3b275f]/30 transition-all duration-200"
            >
              <h3 className="font-semibold text-white text-base mb-2 break-words">{file.filename}</h3>
              <div className="space-y-1">
                <p className="text-sm text-[#eadaff] break-words">
                  <span className="font-medium">To:</span> {file.recipient_username}
                </p>
                <p className="text-sm text-[#eadaff] break-words">
                  <span className="font-medium">ID:</span> {file.file_id}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6">
        <button
          onClick={loadSentFiles}
          className="px-4 py-2 bg-[#3b275f] text-white rounded-lg hover:bg-[#eadaff] hover:text-black focus:outline-none focus:ring-2 focus:ring-[#eadaff] transition-all duration-200 shadow-lg text-sm font-medium"
        >
          Refresh
        </button>
      </div>
    </div>
  );
} 