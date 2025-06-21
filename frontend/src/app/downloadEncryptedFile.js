"use client";
import React, { useState } from "react";

export default function DownloadEncryptedFile() {
  const [fileId, setFileId] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  async function handleDownload() {
    if (!fileId.trim()) {
      alert("Please enter a file ID");
      return;
    }

    setDownloading(true);
    setError(null);

    try {
      // Use the full backend URL
      const response = await fetch(`http://localhost:8000/api/download/${fileId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Download failed: ${response.status} - ${errorText}`);
      }

      // Create blob from response
      const blob = await response.blob();
      
      // Create download URL
      const url = window.URL.createObjectURL(blob);
      
      // Create temporary link element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileId}.enc`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      setError(err.message);
      console.error("Download error:", err);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      <h2>Download Encrypted File</h2>
      <input
        type="text"
        placeholder="Enter File ID"
        value={fileId}
        onChange={(e) => setFileId(e.target.value)}
      />
      <button 
        onClick={handleDownload} 
        disabled={downloading || !fileId.trim()}
      >
        {downloading ? "Downloading..." : "Download Encrypted File"}
      </button>
      
      {error && (
        <div>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div>
        <p>This will download the encrypted version of your file (.enc format)</p>
        <p>To decrypt it, use the &quot;Decrypt File&quot; section with the metadata you saved during encryption.</p>
      </div>
    </div>
  );
}