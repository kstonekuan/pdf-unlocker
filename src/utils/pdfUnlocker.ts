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

// Since pdf-lib doesn't support password-protected PDFs, we'll use a workaround
// This function will return the original file if it's not encrypted, or throw an error if it is
export async function unlockPDF(
  file: File,
  userPassword?: string,
): Promise<Blob> {
  // For now, we'll return a message indicating that browser-side PDF unlocking
  // requires a different approach. In a production app, you would:
  // 1. Use a server-side solution with proper PDF libraries
  // 2. Use PDF.js which supports encrypted PDFs but requires more complex setup
  // 3. Use a third-party service API

  // Check if PDF is encrypted by trying to load it
  try {
    const { PDFDocument } = await import("pdf-lib");
    const arrayBuffer = await file.arrayBuffer();

    // Try to load without any options first
    await PDFDocument.load(arrayBuffer);

    // If successful, PDF is not encrypted, return as-is
    return new Blob([arrayBuffer], { type: "application/pdf" });
  } catch (error) {
    if (!userPassword) {
      // Try common passwords - this is a placeholder since pdf-lib doesn't support passwords
      throw new Error("PASSWORD_REQUIRED");
    }
    // In a real implementation, you would decrypt the PDF here
    // For now, we'll throw an error indicating the limitation
    throw new Error(
      "PDF decryption is not supported in the browser. Please use a PDF reader application to unlock this file.",
    );
  }
}
