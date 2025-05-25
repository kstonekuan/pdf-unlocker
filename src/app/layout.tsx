import PDFWorkerProvider from "@/components/PDFWorkerProvider";
import type { Metadata } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "PDF Unlocker",
  description: "Unlock password-protected PDF files securely in your browser",
  icons: {
    icon: `${basePath}/favicon.svg`,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PDFWorkerProvider>{children}</PDFWorkerProvider>
      </body>
    </html>
  );
}
