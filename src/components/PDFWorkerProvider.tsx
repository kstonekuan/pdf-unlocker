"use client";

import { useEffect, useState } from "react";

interface PDFWorkerProviderProps {
  children: React.ReactNode;
}

export default function PDFWorkerProvider({
  children,
}: PDFWorkerProviderProps) {
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializePdfWorker() {
      try {
        // Only initialize on client side
        if (typeof window === "undefined") return;

        console.log("🔧 Initializing PDF worker...");
        console.log("Environment:", process.env.NODE_ENV);
        console.log("Hostname:", window.location.hostname);
        console.log("Pathname:", window.location.pathname);

        // Dynamic import of PDF.js to avoid SSR issues
        const pdfjsLib = await import("pdfjs-dist");
        console.log("📦 PDF.js loaded successfully");

        // Use local worker file with base path support
        const isGitHubPages =
          typeof window !== "undefined" &&
          window.location.hostname.endsWith(".github.io");
        const basePath = isGitHubPages
          ? `/${window.location.pathname.split("/")[1]}`
          : "";

        // For development, use absolute path from public folder
        const workerPath =
          process.env.NODE_ENV === "development"
            ? "/pdf.worker.min.mjs"
            : `${basePath}/pdf.worker.min.mjs`;

        console.log("🔨 Worker path:", workerPath);
        console.log("🌐 Is GitHub Pages:", isGitHubPages);
        console.log("📂 Base path:", basePath);

        pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
        console.log("✅ Worker source set");

        // Test that the worker is working by loading a minimal PDF
        const testPdf = new Uint8Array([
          0x25,
          0x50,
          0x44,
          0x46,
          0x2d,
          0x31,
          0x2e,
          0x34, // %PDF-1.4
          0x0a,
          0x25,
          0xe2,
          0xe3,
          0xcf,
          0xd3,
          0x0a, // header
          0x31,
          0x20,
          0x30,
          0x20,
          0x6f,
          0x62,
          0x6a,
          0x0a, // 1 0 obj
          0x3c,
          0x3c,
          0x2f,
          0x54,
          0x79,
          0x70,
          0x65,
          0x2f,
          0x43,
          0x61,
          0x74,
          0x61,
          0x6c,
          0x6f,
          0x67,
          0x2f,
          0x50,
          0x61,
          0x67,
          0x65,
          0x73,
          0x20,
          0x32,
          0x20,
          0x30,
          0x20,
          0x52,
          0x3e,
          0x3e,
          0x0a, // <</Type/Catalog/Pages 2 0 R>>
          0x65,
          0x6e,
          0x64,
          0x6f,
          0x62,
          0x6a,
          0x0a, // endobj
          0x32,
          0x20,
          0x30,
          0x20,
          0x6f,
          0x62,
          0x6a,
          0x0a, // 2 0 obj
          0x3c,
          0x3c,
          0x2f,
          0x54,
          0x79,
          0x70,
          0x65,
          0x2f,
          0x50,
          0x61,
          0x67,
          0x65,
          0x73,
          0x2f,
          0x4b,
          0x69,
          0x64,
          0x73,
          0x5b,
          0x33,
          0x20,
          0x30,
          0x20,
          0x52,
          0x5d,
          0x2f,
          0x43,
          0x6f,
          0x75,
          0x6e,
          0x74,
          0x20,
          0x31,
          0x3e,
          0x3e,
          0x0a, // <</Type/Pages/Kids[3 0 R]/Count 1>>
          0x65,
          0x6e,
          0x64,
          0x6f,
          0x62,
          0x6a,
          0x0a, // endobj
          0x33,
          0x20,
          0x30,
          0x20,
          0x6f,
          0x62,
          0x6a,
          0x0a, // 3 0 obj
          0x3c,
          0x3c,
          0x2f,
          0x54,
          0x79,
          0x70,
          0x65,
          0x2f,
          0x50,
          0x61,
          0x67,
          0x65,
          0x2f,
          0x50,
          0x61,
          0x72,
          0x65,
          0x6e,
          0x74,
          0x20,
          0x32,
          0x20,
          0x30,
          0x20,
          0x52,
          0x2f,
          0x4d,
          0x65,
          0x64,
          0x69,
          0x61,
          0x42,
          0x6f,
          0x78,
          0x5b,
          0x30,
          0x20,
          0x30,
          0x20,
          0x36,
          0x31,
          0x32,
          0x20,
          0x37,
          0x39,
          0x32,
          0x5d,
          0x3e,
          0x3e,
          0x0a, // <</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>
          0x65,
          0x6e,
          0x64,
          0x6f,
          0x62,
          0x6a,
          0x0a, // endobj
          0x78,
          0x72,
          0x65,
          0x66,
          0x0a,
          0x30,
          0x20,
          0x34,
          0x0a, // xref 0 4
          0x30,
          0x30,
          0x30,
          0x30,
          0x30,
          0x30,
          0x30,
          0x30,
          0x30,
          0x30,
          0x20,
          0x36,
          0x35,
          0x35,
          0x33,
          0x35,
          0x20,
          0x66,
          0x20,
          0x0a, // 0000000000 65535 f
          0x30,
          0x30,
          0x30,
          0x30,
          0x30,
          0x30,
          0x30,
          0x30,
          0x30,
          0x39,
          0x20,
          0x30,
          0x30,
          0x30,
          0x30,
          0x30,
          0x20,
          0x6e,
          0x20,
          0x0a, // 0000000009 00000 n
          0x30,
          0x30,
          0x30,
          0x30,
          0x30,
          0x30,
          0x30,
          0x30,
          0x36,
          0x38,
          0x20,
          0x30,
          0x30,
          0x30,
          0x30,
          0x30,
          0x20,
          0x6e,
          0x20,
          0x0a, // 0000000068 00000 n
          0x30,
          0x30,
          0x30,
          0x30,
          0x30,
          0x30,
          0x30,
          0x31,
          0x33,
          0x32,
          0x20,
          0x30,
          0x30,
          0x30,
          0x30,
          0x30,
          0x20,
          0x6e,
          0x20,
          0x0a, // 0000000132 00000 n
          0x74,
          0x72,
          0x61,
          0x69,
          0x6c,
          0x65,
          0x72,
          0x0a, // trailer
          0x3c,
          0x3c,
          0x2f,
          0x53,
          0x69,
          0x7a,
          0x65,
          0x20,
          0x34,
          0x2f,
          0x52,
          0x6f,
          0x6f,
          0x74,
          0x20,
          0x31,
          0x20,
          0x30,
          0x20,
          0x52,
          0x3e,
          0x3e,
          0x0a, // <</Size 4/Root 1 0 R>>
          0x73,
          0x74,
          0x61,
          0x72,
          0x74,
          0x78,
          0x72,
          0x65,
          0x66,
          0x0a, // startxref
          0x32,
          0x32,
          0x39,
          0x0a, // 229
          0x25,
          0x25,
          0x45,
          0x4f,
          0x46, // %%EOF
        ]);

        console.log("📄 Testing PDF worker with sample document...");
        const loadingTask = pdfjsLib.getDocument({ data: testPdf });
        const document = await loadingTask.promise;
        console.log("✅ PDF document loaded successfully:", document);

        setIsWorkerReady(true);
        console.log("🎉 PDF worker initialization complete!");
      } catch (err) {
        console.error("❌ PDF worker initialization failed:", err);
        const error = err instanceof Error ? err : new Error(String(err));
        console.error("Error details:", {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
        setError(
          "Failed to initialize PDF processing. Some features may not work.",
        );
        setIsWorkerReady(true); // Still allow the app to work
      }
    }

    initializePdfWorker();
  }, []);

  if (!isWorkerReady) {
    return (
      <div className="pdf-worker-loading">
        <div className="loading-spinner">
          <svg
            className="spinner"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            aria-label="Initializing PDF processor"
          >
            <title>Initializing PDF processor</title>
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
        </div>
        <p>Initializing PDF processor...</p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="pdf-worker-error">
          <p>{error}</p>
        </div>
      )}
      {children}
    </>
  );
}
