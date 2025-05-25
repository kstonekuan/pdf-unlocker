import PDFWorkerProvider from "@/components/PDFWorkerProvider";
import type { Metadata } from "next";
import "./globals.css";

// Get the base path from the same env var as next.config.js
const basePath = process.env.STATIC_EXPORT === "true" ? "/pdf-unlocker" : "";

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
      <head>
        <meta property="og:title" content="PDF Unlocker" />
        <meta property="og:description" content="Unlock password-protected PDF files securely in your browser" />
        <meta property="og:image" content={`${basePath}/og-image.png`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="PDF Unlocker" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PDF Unlocker" />
        <meta name="twitter:description" content="Unlock password-protected PDF files securely in your browser" />
        <meta name="twitter:image" content={`${basePath}/og-image.png`} />
      </head>
      <body>
        <PDFWorkerProvider>{children}</PDFWorkerProvider>
      </body>
    </html>
  );
}
