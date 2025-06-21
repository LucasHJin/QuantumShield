"use client";
import React, { useState } from "react";

export default function DownloadEncryptedFile() {
  const [fileId, setFileId] = useState("");
  const [downloadUrl, setDownloadUrl] = useState(null);

  function handleDownload() {
    if (!fileId) return alert("Enter a file ID");

    setDownloadUrl(`/api/download/${fileId}`);
  }

  return (
    <div>
      <h2>Download Encrypted File</h2>
      <input
        type="text"
        placeholder="File ID"
        value={fileId}
        onChange={(e) => setFileId(e.target.value)}
      />
      <button onClick={handleDownload}>Download</button>
      {downloadUrl && (
        <a href={downloadUrl} download={`${fileId}.enc`}>
          Click here to download
        </a>
      )}
    </div>
  );
}
