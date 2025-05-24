"use client";

import PDFList from "@/components/PDFList";
import PDFUploader from "@/components/PDFUploader";
import type { PDFFile } from "@/types";
import { useState } from "react";

export default function Home() {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [enableRenaming, setEnableRenaming] = useState(true);

  const handleFilesSelected = (files: PDFFile[]) => {
    setPdfFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveFile = (id: string) => {
    setPdfFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleUpdateFile = (id: string, updates: Partial<PDFFile>) => {
    setPdfFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, ...updates } : file)),
    );
  };

  return (
    <main className="container">
      <header className="header">
        <h1>PDF Unlocker</h1>
        <p>Unlock password-protected PDFs securely in your browser</p>
      </header>

      <div className="settings">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={enableRenaming}
            onChange={(e) => setEnableRenaming(e.target.checked)}
          />
          <span>Enable AI-powered filename suggestions</span>
        </label>
      </div>

      <PDFUploader onFilesSelected={handleFilesSelected} />

      {pdfFiles.length > 0 && (
        <PDFList
          files={pdfFiles}
          onRemoveFile={handleRemoveFile}
          onUpdateFile={handleUpdateFile}
          enableRenaming={enableRenaming}
        />
      )}

      <footer className="footer">
        <p>
          Your PDFs are processed securely in your browser. No files are
          uploaded to any server.
        </p>
      </footer>
    </main>
  );
}
