export interface PDFFile {
  id: string;
  name: string;
  file: File;
  status:
    | "pending"
    | "unlocking"
    | "unlocked"
    | "failed"
    | "renaming"
    | "needs_password";
  unlockedBlob?: Blob;
  suggestedName?: string;
  error?: string;
  passwordRequired?: boolean;
}
