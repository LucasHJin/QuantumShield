import React from "react";
import UploadFile from "./UploadFile";
import DecryptFile from "./decryptFile";
import DownloadEncryptedFile from "./downloadEncryptedFile";

export default function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Quantum Secure File Encryptor</h1>
      <UploadFile />
      <hr />
      <DecryptFile />
      <hr />
      <DownloadEncryptedFile />
    </div>
  );
}
