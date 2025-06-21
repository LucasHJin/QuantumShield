"use client";
import React, { useState } from "react";

export default function DecryptFile() {
  const [fileId, setFileId] = useState("");
  const [encryptedKey, setEncryptedKey] = useState("");
  const [nonce, setNonce] = useState("");
  const [signature, setSignature] = useState("");
  const [senderPubKey, setSenderPubKey] = useState("");
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);

  async function handleDecrypt() {
    const formData = new FormData();
    formData.append("file_id", fileId);
    formData.append("encrypted_key", encryptedKey);
    formData.append("nonce", nonce);
    formData.append("signature", signature);
    formData.append("sender_public_key", senderPubKey);

    const res = await fetch("http://localhost:8000/api/decrypt", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error || "Decryption failed");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    setDownloadUrl(url);
    setError(null);
  }

  return (
    <div>
      <h2>Decrypt File</h2>
      <input
        type="text"
        placeholder="File ID"
        value={fileId}
        onChange={(e) => setFileId(e.target.value)}
      />
      <textarea
        placeholder="Encrypted Key (base64)"
        value={encryptedKey}
        onChange={(e) => setEncryptedKey(e.target.value)}
        rows={3}
      />
      <textarea
        placeholder="Nonce (base64)"
        value={nonce}
        onChange={(e) => setNonce(e.target.value)}
        rows={3}
      />
      <textarea
        placeholder="Signature (base64)"
        value={signature}
        onChange={(e) => setSignature(e.target.value)}
        rows={3}
      />
      <textarea
        placeholder="Sender Public Key (base64)"
        value={senderPubKey}
        onChange={(e) => setSenderPubKey(e.target.value)}
        rows={3}
      />
      <button onClick={handleDecrypt}>Decrypt</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {downloadUrl && (
        <a href={downloadUrl} download={`${fileId}.dec`}>
          Download Decrypted File
        </a>
      )}
    </div>
  );
}
