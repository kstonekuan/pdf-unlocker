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
  openGraph: {
    title: "PDF Unlocker",
    description: "Unlock password-protected PDF files securely in your browser",
    siteName: "PDF Unlocker",
    images: [
      {
        url: `${basePath}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "PDF Unlocker - Unlock password-protected PDFs securely in your browser",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Unlocker",
    description: "Unlock password-protected PDF files securely in your browser",
    images: [`${basePath}/og-image.png`],
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
