"use client";

import type { PDFFile } from "@/types";
import { unlockPDFWithPdfJs } from "@/utils/pdfjsUnlocker";
import { useEffect, useState } from "react";

interface PDFListProps {
  files: PDFFile[];
  onRemoveFile: (id: string) => void;
  onUpdateFile: (id: string, updates: Partial<PDFFile>) => void;
  enableRenaming: boolean;
}

export default function PDFList({
  files,
  onRemoveFile,
  onUpdateFile,
  enableRenaming,
}: PDFListProps) {
  const [passwords, setPasswords] = useState<Record<string, string>>({});

  useEffect(() => {
    for (const file of files) {
      if (file.status === "pending") {
        handleUnlock(file);
      }
    }
  }, [files]);

  const handleUnlock = async (file: PDFFile, password?: string) => {
    onUpdateFile(file.id, { status: "unlocking" });

    try {
      const unlockedBlob = await unlockPDFWithPdfJs(file.file, password);
      onUpdateFile(file.id, {
        status: enableRenaming ? "renaming" : "unlocked",
        unlockedBlob,
        passwordRequired: false,
      });

      if (enableRenaming) {
        await getSuggestedName(file.id, unlockedBlob);
      }
    } catch (error) {
      if (error instanceof Error && error.message === "PASSWORD_REQUIRED") {
        onUpdateFile(file.id, {
          status: "needs_password",
          passwordRequired: true,
          error: "Password required to unlock this PDF",
        });
      } else {
        onUpdateFile(file.id, {
          status: "failed",
          error:
            error instanceof Error ? error.message : "Failed to unlock PDF",
        });
      }
    }
  };

  const handlePasswordSubmit = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    const password = passwords[fileId];
    if (file && password) {
      handleUnlock(file, password);
    }
  };

  const getSuggestedName = async (fileId: string, blob: Blob) => {
    // Skip AI suggestions in static builds
    if (
      process.env.NODE_ENV === "production" &&
      !process.env.NEXT_PUBLIC_ENABLE_AI_SUGGESTIONS
    ) {
      onUpdateFile(fileId, { status: "unlocked" });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("pdf", blob);

      const file = files.find((f) => f.id === fileId);
      if (file) {
        formData.append("currentName", file.name);
      }

      const response = await fetch("/api/suggest-filename", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to get filename suggestion");
      }

      const data = await response.json();
      onUpdateFile(fileId, {
        status: "unlocked",
        suggestedName: data.suggestedName,
      });
    } catch (error) {
      onUpdateFile(fileId, { status: "unlocked" });
    }
  };

  const handleDownload = (file: PDFFile) => {
    if (!file.unlockedBlob) return;

    const url = URL.createObjectURL(file.unlockedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      file.suggestedName || file.name.replace(".pdf", "_unlocked.pdf");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = async () => {
    const unlockedFiles = files.filter(
      (file) => file.status === "unlocked" && file.unlockedBlob,
    );

    if (unlockedFiles.length === 0) return;

    if (unlockedFiles.length === 1) {
      // If only one file, download it directly
      handleDownload(unlockedFiles[0]);
      return;
    }

    // For multiple files, create a zip
    try {
      // Dynamic import to avoid bundling JSZip if not needed
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      // Add each file to the zip
      for (const file of unlockedFiles) {
        if (file.unlockedBlob) {
          const fileName =
            file.suggestedName || file.name.replace(".pdf", "_unlocked.pdf");
          zip.file(fileName, file.unlockedBlob);
        }
      }

      // Generate the zip file
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Download the zip
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "unlocked_pdfs.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      // Fallback to individual downloads
      // Fallback: download files individually
      for (const file of unlockedFiles) {
        await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay between downloads
        handleDownload(file);
      }
    }
  };

  const getStatusIcon = (status: PDFFile["status"]) => {
    switch (status) {
      case "unlocking":
      case "renaming":
        return (
          <svg
            className="spinner"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            aria-label="Loading"
          >
            <title>Loading</title>
            <circle
              className="spinner-circle"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
            />
          </svg>
        );
      case "unlocked":
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-label="Success"
          >
            <title>Success</title>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        );
      case "failed":
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-label="Failed"
          >
            <title>Failed</title>
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case "needs_password":
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-label="Password required"
          >
            <title>Password required</title>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        );
      default:
        return null;
    }
  };

  const unlockedFilesCount = files.filter(
    (file) => file.status === "unlocked" && file.unlockedBlob,
  ).length;

  return (
    <div className="pdf-list">
      <div className="pdf-list-header">
        <h2>Your PDFs</h2>
        {unlockedFilesCount > 0 && (
          <button
            type="button"
            className="download-all-btn"
            onClick={handleDownloadAll}
          >
            Download All ({unlockedFilesCount})
          </button>
        )}
      </div>
      {files.map((file) => (
        <div key={file.id} className={`pdf-item ${file.status}`}>
          <div className="pdf-info">
            <div className="pdf-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="pdf-details">
              <p className="pdf-name">{file.name}</p>
              {file.suggestedName && file.suggestedName !== file.name && (
                <p className="pdf-suggested-name">
                  Suggested: {file.suggestedName}
                </p>
              )}
              {file.error && file.status !== "needs_password" && (
                <p className="pdf-error">{file.error}</p>
              )}
              <p className="pdf-status">
                {file.status === "renaming"
                  ? "Getting filename suggestion..."
                  : file.status === "unlocking"
                    ? "Unlocking..."
                    : file.status === "unlocked"
                      ? "Unlocked successfully"
                      : file.status === "needs_password"
                        ? "Enter password to unlock"
                        : file.status === "failed"
                          ? "Failed to unlock"
                          : "Waiting..."}
              </p>
              {file.status === "needs_password" && (
                <div className="password-input-container">
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={passwords[file.id] || ""}
                    onChange={(e) =>
                      setPasswords((prev) => ({
                        ...prev,
                        [file.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handlePasswordSubmit(file.id);
                      }
                    }}
                    className="password-input"
                  />
                  <button
                    type="button"
                    className="unlock-btn"
                    onClick={() => handlePasswordSubmit(file.id)}
                    disabled={!passwords[file.id]}
                  >
                    Unlock
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="pdf-actions">
            <div className="status-icon">{getStatusIcon(file.status)}</div>
            {file.status === "unlocked" && (
              <button
                type="button"
                className="download-btn"
                onClick={() => handleDownload(file)}
              >
                Download
              </button>
            )}
            <button
              type="button"
              className="remove-btn"
              onClick={() => onRemoveFile(file.id)}
              aria-label="Remove file"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
