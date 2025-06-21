"use client";
import React, { useState } from "react";

export default function UploadFile() {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);

  async function handleUpload() {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:8000/api/encrypt", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      alert("Failed to encrypt file");
      return;
    }

    const json = await res.json();
    setResponse(json);
  }

  return (
    <div>
      <h2>Upload File to Encrypt</h2>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        accept="*/*"
      />
      <button onClick={handleUpload}>Encrypt and Upload</button>

      {response && (
        <div style={{ marginTop: 20 }}>
          <h3>Encryption Metadata (save this!)</h3>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
