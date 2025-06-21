"use client";
import React, { useState, useEffect } from "react";
import UploadFile from "./uploadFile";
import DecryptFile from "./decryptFile";
import DownloadEncryptedFile from "./downloadEncryptedFile";
import UserAuth from "./UserAuth";
import FileSharing from "./FileSharing";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const savedToken = localStorage.getItem('quantumdocs_token');
    const savedUser = localStorage.getItem('quantumdocs_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (userData, token) => {
    setToken(token);
    setCurrentUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('quantumdocs_token', token);
    localStorage.setItem('quantumdocs_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('quantumdocs_token');
    localStorage.removeItem('quantumdocs_user');
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
        <h1>QuantumDocs - Secure File Encryption</h1>
        <p>Please log in or register to continue.</p>
        <UserAuth onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>QuantumDocs</h1>
        <div>
          <span style={{ marginRight: 10 }}>Welcome, {currentUser?.username}!</span>
          <button 
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <h2>File Operations</h2>
          <UploadFile token={token} />
          <hr style={{ margin: '20px 0' }} />
          <DecryptFile token={token} />
          <hr style={{ margin: '20px 0' }} />
          <DownloadEncryptedFile />
        </div>
        
        <div>
          <h2>File Sharing</h2>
          <FileSharing token={token} currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
}
