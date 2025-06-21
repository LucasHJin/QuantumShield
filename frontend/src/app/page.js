import React from "react";
import UploadFile from "./uploadFile";
import DecryptFile from "./decryptFile";
import DownloadEncryptedFile from "./downloadEncryptedFile";

export default function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h1>QuantumDocs</h1>
      <UploadFile />
      <hr />
      <DecryptFile />
      <hr />
      <DownloadEncryptedFile />
    </div>
  );
}
