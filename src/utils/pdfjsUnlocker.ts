import { PDFDocument } from "pdf-lib";

// PDF.js type definitions
interface PDFJSError {
  name: string;
  message: string;
  code?: number;
}

interface PDFJSTextItem {
  str: string;
  dir: string;
  width: number;
  height: number;
  transform: number[];
  fontName: string;
}

interface PDFJSTextContent {
  items: PDFJSTextItem[];
  styles: Record<string, unknown>;
}

interface PDFJSViewport {
  width: number;
  height: number;
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
  transform: number[];
}

interface PDFJSRenderContext {
  canvasContext: CanvasRenderingContext2D;
  viewport: PDFJSViewport;
}

interface PDFJSRenderTask {
  promise: Promise<void>;
}

interface PDFJSPageProxy {
  getViewport(params: { scale: number }): PDFJSViewport;
  getTextContent(): Promise<PDFJSTextContent>;
  render(renderContext: PDFJSRenderContext): PDFJSRenderTask;
}

interface PDFJSDocumentProxy {
  numPages: number;
  getPage(pageNumber: number): Promise<PDFJSPageProxy>;
}

interface PDFJSLoadingTask {
  promise: Promise<PDFJSDocumentProxy>;
}

interface PDFJSLib {
  getDocument(params: {
    data: ArrayBuffer;
    password?: string;
  }): PDFJSLoadingTask;
  GlobalWorkerOptions: {
    workerSrc: string;
  };
}

const COMMON_PASSWORDS = [
  "",
  "password",
  "123456",
  "12345678",
  "1234",
  "12345",
  "password123",
  "admin",
  "letmein",
  "welcome",
  "monkey",
  "dragon",
  "baseball",
  "abc123",
  "111111",
  "mustang",
  "access",
  "shadow",
  "master",
  "michael",
  "superman",
  "696969",
  "123123",
  "batman",
  "trustno1",
];

// Initialize PDF.js worker
let pdfJsInitialized = false;

async function initializePdfJs() {
  if (pdfJsInitialized || typeof window === "undefined") {
    return;
  }

  try {
    const pdfjsLib = await import("pdfjs-dist");

    // Use local worker file
    (pdfjsLib as PDFJSLib).GlobalWorkerOptions.workerSrc =
      "/pdf.worker.min.mjs";
    pdfJsInitialized = true;
  } catch (error) {
    console.error("Failed to initialize PDF.js:", error);
    throw new Error("PDF.js initialization failed");
  }
}

export async function unlockPDFWithPdfJs(
  file: File,
  userPassword?: string,
): Promise<Blob> {
  console.log("Starting PDF unlock process for:", file.name);
  await initializePdfJs();

  // Create a helper function to get fresh ArrayBuffer
  const getArrayBuffer = async () => {
    return await file.arrayBuffer();
  };

  const pdfjsLib = await import("pdfjs-dist");

  // Try to load PDF without password first
  try {
    console.log("Trying to load PDF without password...");
    const arrayBuffer = await getArrayBuffer();
    const loadingTask = (pdfjsLib as PDFJSLib).getDocument({
      data: arrayBuffer,
    });
    await loadingTask.promise;

    console.log("PDF loaded successfully without password - not encrypted");
    // If successful, PDF is not encrypted, return as-is
    return new Blob([arrayBuffer], { type: "application/pdf" });
  } catch (error: unknown) {
    const err = error as PDFJSError;
    console.log("Error loading PDF without password:", err.name, err.message);
    // If not a password error, re-throw
    if (err.name !== "PasswordException") {
      // Try with pdf-lib to see if it's just a PDF.js loading issue
      try {
        console.log("Trying with pdf-lib...");
        const arrayBuffer = await getArrayBuffer();
        await PDFDocument.load(arrayBuffer);
        console.log("PDF loaded with pdf-lib - returning original");
        return new Blob([arrayBuffer], { type: "application/pdf" });
      } catch (pdfLibError) {
        console.error("Both PDF.js and pdf-lib failed:", pdfLibError);
        throw new Error("Failed to load PDF - file may be corrupted");
      }
    }
    console.log("PDF is password protected");
  }

  // PDF is encrypted, try passwords
  if (!userPassword) {
    console.log("Trying common passwords...");
    // Try common passwords (excluding empty password for encrypted PDFs)
    const passwordsToTry = COMMON_PASSWORDS.filter((p) => p !== "");
    for (const password of passwordsToTry) {
      try {
        console.log("Trying password: ***");
        const arrayBuffer = await getArrayBuffer(); // Fresh buffer for each attempt

        const loadingTask = (pdfjsLib as PDFJSLib).getDocument({
          data: arrayBuffer,
          password: password,
        });
        await loadingTask.promise;

        console.log("Password worked! Decrypting PDF...");
        // If successful, decrypt and return
        return await decryptPDFToImages(await getArrayBuffer(), password);
      } catch (error: unknown) {
        const err = error as PDFJSError;
        console.log("Password failed:", err.name, err.message);
        if (
          err.name === "PasswordException" &&
          err.message === "Incorrect Password"
        ) {
          continue; // Try next password
        }
        // Other errors, stop trying
        console.error("Unexpected error during password attempt:", err);
        break;
      }
    }

    console.log("All common passwords failed, requiring user password");
    throw new Error("PASSWORD_REQUIRED");
  }

  // Try user-provided password
  try {
    console.log("Trying user-provided password...");
    const arrayBuffer = await getArrayBuffer(); // Fresh buffer
    const loadingTask = (pdfjsLib as PDFJSLib).getDocument({
      data: arrayBuffer,
      password: userPassword,
    });
    await loadingTask.promise;

    console.log("User password worked! Decrypting PDF...");
    return await decryptPDFToImages(await getArrayBuffer(), userPassword);
  } catch (error: unknown) {
    const err = error as PDFJSError;
    console.error("User password failed:", err.name, err.message);
    if (
      err.name === "PasswordException" &&
      err.message === "Incorrect Password"
    ) {
      throw new Error("Incorrect password");
    }
    throw new Error("Failed to unlock PDF");
  }
}

async function decryptPDFToImages(
  arrayBuffer: ArrayBuffer,
  password: string,
): Promise<Blob> {
  try {
    console.log("Starting PDF decryption to images...");
    const pdfjsLib = await import("pdfjs-dist");

    // Load the encrypted PDF with PDF.js
    const loadingTask = (pdfjsLib as PDFJSLib).getDocument({
      data: arrayBuffer,
      password: password,
    });
    const pdfDoc: PDFJSDocumentProxy = await loadingTask.promise;
    console.log("PDF loaded successfully, pages:", pdfDoc.numPages);

    // Create a new PDF with pdf-lib
    const newPdfDoc = await PDFDocument.create();
    console.log("Created new PDF document");

    // Copy all pages by rendering them as images
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      console.log(`Processing page ${i}/${pdfDoc.numPages}...`);
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality

      // Create canvas to render page
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Could not get canvas context");
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render PDF page to canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      console.log(`Rendering page ${i} to canvas...`);
      await page.render(renderContext).promise;
      console.log(`Page ${i} rendered successfully`);

      // Convert canvas to PNG and embed in new PDF
      console.log(`Converting page ${i} to PNG...`);
      const imageData = canvas.toDataURL("image/png");
      const imageArrayBuffer = await fetch(imageData).then((res) =>
        res.arrayBuffer(),
      );

      console.log(`Embedding PNG for page ${i}...`);
      const image = await newPdfDoc.embedPng(imageArrayBuffer);

      // Calculate page size - maintain aspect ratio but fit within reasonable bounds
      const maxWidth = 612; // 8.5 inches at 72 DPI
      const maxHeight = 792; // 11 inches at 72 DPI

      let pageWidth = viewport.width;
      let pageHeight = viewport.height;

      // Scale down if too large
      if (pageWidth > maxWidth || pageHeight > maxHeight) {
        const scale = Math.min(maxWidth / pageWidth, maxHeight / pageHeight);
        pageWidth *= scale;
        pageHeight *= scale;
      }

      const newPage = newPdfDoc.addPage([pageWidth, pageHeight]);

      newPage.drawImage(image, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      });
    }

    console.log("Saving new PDF document...");
    const pdfBytes = await newPdfDoc.save();
    console.log(
      "PDF successfully decrypted and saved! Size:",
      pdfBytes.length,
      "bytes",
    );
    return new Blob([pdfBytes], { type: "application/pdf" });
  } catch (error) {
    console.error("Error decrypting PDF:", error);
    throw new Error("Failed to decrypt PDF");
  }
}

export async function extractTextFromEncryptedPDF(
  file: File,
  password: string,
): Promise<string> {
  await initializePdfJs();

  const arrayBuffer = await file.arrayBuffer();
  const pdfjsLib = await import("pdfjs-dist");

  try {
    const loadingTask = (pdfjsLib as PDFJSLib).getDocument({
      data: arrayBuffer,
      password: password,
    });

    const pdfDoc: PDFJSDocumentProxy = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page: PDFJSPageProxy = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += `Page ${i}:\n${pageText}\n\n`;
    }

    return fullText;
  } catch (error: unknown) {
    const err = error as PDFJSError;
    if (err.name === "IncorrectPasswordException") {
      throw new Error("Incorrect password");
    }
    throw new Error("Failed to extract text from PDF");
  }
}
