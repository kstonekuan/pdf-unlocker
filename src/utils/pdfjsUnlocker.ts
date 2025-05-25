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

export const COMMON_PASSWORDS = [
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

// PDF.js worker is initialized in PDFWorkerProvider.tsx
// No need to reinitialize here

export async function unlockPDFWithPdfJs(
  file: File,
  userPassword?: string,
): Promise<Blob> {
  // Create a helper function to get fresh ArrayBuffer
  const getArrayBuffer = async () => {
    return await file.arrayBuffer();
  };

  const pdfjsLib = await import("pdfjs-dist");

  // Try to load PDF without password first
  try {
    const arrayBuffer = await getArrayBuffer();
    const loadingTask = (pdfjsLib as PDFJSLib).getDocument({
      data: arrayBuffer,
    });
    await loadingTask.promise;

    // If successful, PDF is not encrypted, return as-is
    return new Blob([arrayBuffer], { type: "application/pdf" });
  } catch (error: unknown) {
    const err = error as PDFJSError;
    console.error("PDF.js loading error:", err);
    // If not a password error, re-throw
    if (err.name !== "PasswordException") {
      // Try with pdf-lib to see if it's just a PDF.js loading issue
      try {
        const arrayBuffer = await getArrayBuffer();
        await PDFDocument.load(arrayBuffer);
        console.log("PDF-lib loaded successfully, returning original file");
        return new Blob([arrayBuffer], { type: "application/pdf" });
      } catch (pdfLibError) {
        console.error("PDF-lib loading error:", pdfLibError);
        throw new Error("Failed to load PDF - file may be corrupted");
      }
    }
  }

  // PDF is encrypted, try passwords
  if (!userPassword) {
    // Try common passwords (excluding empty password for encrypted PDFs)
    const passwordsToTry = COMMON_PASSWORDS.filter((p) => p !== "");
    for (const password of passwordsToTry) {
      try {
        const arrayBuffer = await getArrayBuffer(); // Fresh buffer for each attempt

        const loadingTask = (pdfjsLib as PDFJSLib).getDocument({
          data: arrayBuffer,
          password: password,
        });
        await loadingTask.promise;

        // If successful, return the unlocked PDF as-is
        console.log(`Successfully unlocked with password: ${password}`);
        return new Blob([await getArrayBuffer()], { type: "application/pdf" });
      } catch (error: unknown) {
        const err = error as PDFJSError;
        console.log(`Failed with password "${password}":`, err.message);
        if (
          err.name === "PasswordException" &&
          err.message === "Incorrect Password"
        ) {
          continue; // Try next password
        }
        // Other errors, stop trying
        console.error("Stopping password attempts due to error:", err);
        break;
      }
    }

    throw new Error("PASSWORD_REQUIRED");
  }

  // Try user-provided password
  try {
    const arrayBuffer = await getArrayBuffer(); // Fresh buffer
    const loadingTask = (pdfjsLib as PDFJSLib).getDocument({
      data: arrayBuffer,
      password: userPassword,
    });
    await loadingTask.promise;

    return new Blob([await getArrayBuffer()], { type: "application/pdf" });
  } catch (error: unknown) {
    const err = error as PDFJSError;
    if (
      err.name === "PasswordException" &&
      err.message === "Incorrect Password"
    ) {
      throw new Error("Incorrect password");
    }
    throw new Error("Failed to unlock PDF");
  }
}

export async function extractTextFromEncryptedPDF(
  file: File,
  password: string,
): Promise<string> {
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
