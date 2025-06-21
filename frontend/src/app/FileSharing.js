"use client";
import React, { useState, useEffect } from "react";

export default function FileSharing({ token, currentUser }) {
  const [users, setUsers] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [shareForm, setShareForm] = useState({
    recipient_username: "",
    file_id: "",
    encrypted_key: "",
    nonce: "",
    signature: "",
    sender_public_key: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchSharedFiles();
    }
  }, [token]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.filter(user => user.username !== currentUser.username));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchSharedFiles = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/shared-with-me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSharedFiles(data);
      }
    } catch (error) {
      console.error("Error fetching shared files:", error);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:8000/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(shareForm),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("File shared successfully!");
        setShareForm({
          recipient_username: "",
          file_id: "",
          encrypted_key: "",
          nonce: "",
          signature: "",
          sender_public_key: "",
        });
      } else {
        setMessage(data.detail || "Failed to share file");
      }
    } catch (error) {
      setMessage("Network error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecryptShared = async (shareId) => {
    const password = prompt("Enter your password to decrypt the shared metadata:");
    if (!password) return;

    try {
      const formData = new FormData();
      formData.append("password", password);

      const response = await fetch(`http://localhost:8000/api/decrypt-shared/${shareId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const metadata = await response.json();
        setMessage(`Decrypted metadata: File ID: ${metadata.file_id}`);
        
        // Update the share as read
        setSharedFiles(prev => 
          prev.map(share => 
            share.id === shareId ? { ...share, is_read: true } : share
          )
        );
      } else {
        const error = await response.json();
        setMessage(error.detail || "Failed to decrypt metadata");
      }
    } catch (error) {
      setMessage("Error decrypting metadata: " + error.message);
    }
  };

  const handleInputChange = (e) => {
    setShareForm({
      ...shareForm,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Share File Section */}
      <div style={{ border: "1px solid #ddd", padding: 15, borderRadius: "8px" }}>
        <h3>Share File with User</h3>
        <form onSubmit={handleShare} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <label style={{ display: "block", marginBottom: 5 }}>
              Recipient Username:
            </label>
            <select
              name="recipient_username"
              value={shareForm.recipient_username}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            >
              <option value="">Select a user...</option>
              {users.map(user => (
                <option key={user.id} value={user.username}>
                  {user.username} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 5 }}>
              File ID:
            </label>
            <input
              type="text"
              name="file_id"
              value={shareForm.file_id}
              onChange={handleInputChange}
              required
              placeholder="Enter file ID"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 5 }}>
              Encrypted Key:
            </label>
            <input
              type="text"
              name="encrypted_key"
              value={shareForm.encrypted_key}
              onChange={handleInputChange}
              required
              placeholder="Enter encrypted key"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 5 }}>
              Nonce:
            </label>
            <input
              type="text"
              name="nonce"
              value={shareForm.nonce}
              onChange={handleInputChange}
              required
              placeholder="Enter nonce"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 5 }}>
              Signature:
            </label>
            <input
              type="text"
              name="signature"
              value={shareForm.signature}
              onChange={handleInputChange}
              required
              placeholder="Enter signature"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 5 }}>
              Sender Public Key:
            </label>
            <input
              type="text"
              name="sender_public_key"
              value={shareForm.sender_public_key}
              onChange={handleInputChange}
              required
              placeholder="Enter sender public key"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Sharing..." : "Share File"}
          </button>
        </form>
      </div>

      {/* Shared Files Section */}
      <div style={{ border: "1px solid #ddd", padding: 15, borderRadius: "8px" }}>
        <h3>Files Shared with Me</h3>
        {sharedFiles.length === 0 ? (
          <p>No files have been shared with you yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sharedFiles.map(share => (
              <div
                key={share.id}
                style={{
                  border: "1px solid #eee",
                  padding: 10,
                  borderRadius: "4px",
                  backgroundColor: share.is_read ? "#f8f9fa" : "#fff3cd",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>File ID:</strong> {share.file_id}
                    <br />
                    <strong>From:</strong> {share.sender_username}
                    <br />
                    <strong>Date:</strong> {new Date(share.created_at).toLocaleDateString()}
                    <br />
                    <strong>Status:</strong> {share.is_read ? "Read" : "Unread"}
                  </div>
                  <button
                    onClick={() => handleDecryptShared(share.id)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Decrypt Metadata
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {message && (
        <div
          style={{
            padding: "10px",
            borderRadius: "4px",
            backgroundColor: message.includes("successfully") ? "#d4edda" : "#f8d7da",
            color: message.includes("successfully") ? "#155724" : "#721c24",
            border: `1px solid ${message.includes("successfully") ? "#c3e6cb" : "#f5c6cb"}`,
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
} 