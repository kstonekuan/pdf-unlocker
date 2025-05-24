"use client";

import type { PDFFile } from "@/types";
import { useRef } from "react";

interface PDFUploaderProps {
  onFilesSelected: (files: PDFFile[]) => void;
}

export default function PDFUploader({ onFilesSelected }: PDFUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const pdfFiles = files
      .filter((file) => file.type === "application/pdf")
      .map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        name: file.name,
        file,
        status: "pending" as const,
      }));

    if (pdfFiles.length > 0) {
      onFilesSelected(pdfFiles);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const pdfFiles = files
      .filter((file) => file.type === "application/pdf")
      .map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        name: file.name,
        file,
        status: "pending" as const,
      }));

    if (pdfFiles.length > 0) {
      onFilesSelected(pdfFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <button
      type="button"
      className="upload-area"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => fileInputRef.current?.click()}
      aria-label="Click or drop PDFs here to upload"
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <p className="upload-text">Drop PDFs here or click to upload</p>
      <p className="upload-subtext">Multiple files supported</p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </button>
  );
}
