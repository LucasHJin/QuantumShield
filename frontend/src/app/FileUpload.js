'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function FileUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/users');
      setUsers(response.data.users);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    if (!recipient) {
      toast.error('Please select a recipient');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('recipient_username', recipient);

      const response = await axios.post('http://localhost:8000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('File uploaded and encrypted successfully!');
      setSelectedFile(null);
      setRecipient('');
      // Reset file input
      e.target.reset();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingUsers) {
    return (
      <div className="max-w-md mx-auto min-w-[600px] bg-[#3b275f]/20 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-[#eadaff]/30">
        <h2 className="text-xl font-semibold mb-4 text-white">Upload File</h2>
        <div className="text-center text-[#eadaff]">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-w-[600px] bg-[#3b275f]/20 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-[#eadaff]/30">
      <h2 className="text-xl font-semibold mb-4 text-white">Upload File</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#eadaff] mb-2">
            Select File
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-[#eadaff] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#f38cff] file:text-white hover:file:bg-[#eadaff] transition-all duration-200"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#eadaff] mb-2">
            Recipient
          </label>
          <select
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="block w-full px-3 py-2 border border-[#eadaff] rounded-md shadow-sm focus:outline-none focus:ring-[#eadaff] focus:border-[#eadaff] bg-[#3b275f]/20 backdrop-blur-sm text-white"
            required
          >
            <option value="">Select a recipient</option>
            {users.map((username) => (
              <option key={username} value={username}>
                {username}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-[#3b275f] hover:bg-[#eadaff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#eadaff] disabled:opacity-50 transition-all duration-200"
        >
          {isLoading ? 'Uploading...' : 'Upload & Encrypt'}
        </button>
      </form>

      {selectedFile && (
        <div className="mt-4 p-3 bg-[#3b275f]/20 backdrop-blur-sm rounded-md border border-[#eadaff]/30">
          <p className="text-sm text-[#eadaff]">
            <strong>Selected file:</strong> {selectedFile.name}
          </p>
          <p className="text-sm text-[#eadaff]">
            <strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB
          </p>
        </div>
      )}
    </div>
  );
} 