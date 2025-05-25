"use client";

import PDFList from "@/components/PDFList";
import PDFUploader from "@/components/PDFUploader";
import type { PDFFile } from "@/types";
import { COMMON_PASSWORDS } from "@/utils/pdfjsUnlocker";
import { useState } from "react";

export default function Home() {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const aiSuggestionsAvailable =
    process.env.NODE_ENV !== "production" ||
    !!process.env.NEXT_PUBLIC_ENABLE_AI_SUGGESTIONS;
  const [enableRenaming, setEnableRenaming] = useState(aiSuggestionsAvailable);

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
        <p>
          {aiSuggestionsAvailable && enableRenaming
            ? "Unlock password-protected PDFs and get AI-powered filename suggestions"
            : "Unlock password-protected PDFs securely in your browser"}
        </p>
      </header>

      {aiSuggestionsAvailable && (
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
      )}

      <PDFUploader onFilesSelected={handleFilesSelected} />

      {pdfFiles.length > 0 && (
        <PDFList
          files={pdfFiles}
          onRemoveFile={handleRemoveFile}
          onUpdateFile={handleUpdateFile}
          enableRenaming={enableRenaming}
        />
      )}

      <section className="info-section">
        <h2>How It Works</h2>
        <div className="info-content">
          <div className="info-card">
            <h3>🔓 Smart Password Detection</h3>
            <p>
              When you upload a password-protected PDF, we first try common
              passwords automatically. If none work, we'll ask you to enter the
              password manually.
            </p>
          </div>

          <div className="info-card">
            <h3>🔒 Privacy & Security</h3>
            <p>
              All processing happens in your browser - your PDFs never leave
              your device. The unlocking is done using client-side JavaScript
              libraries.
            </p>
          </div>

          <div className="info-card">
            <h3>🎯 Complete Unlock</h3>
            <p>
              Password-protected PDFs are fully unlocked by converting pages to
              high-resolution images. This removes all restrictions but text
              becomes non-searchable.
            </p>
          </div>
        </div>

        <details className="common-passwords">
          <summary>Common Passwords We Try</summary>
          <div className="password-list">
            <p>We automatically test these common passwords (in order):</p>
            <div className="password-grid">
              {COMMON_PASSWORDS.filter((password) => password !== "").map(
                (password) => (
                  <span key={password}>{password}</span>
                ),
              )}
            </div>
          </div>
        </details>
      </section>

      <footer className="footer">
        <p>
          {aiSuggestionsAvailable && enableRenaming
            ? "PDF unlocking happens in your browser. When AI suggestions are enabled, unlocked PDFs are sent to Anthropic for filename analysis."
            : "Your PDFs are processed securely in your browser. No files are uploaded to any server."}
        </p>
        <p>
          <a
            href="https://github.com/kstonekuan/pdf-unlocker"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ marginRight: "0.5rem" }}
              aria-hidden="true"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            View source on GitHub
          </a>
        </p>
      </footer>
    </main>
  );
}
