import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/ToastProvider";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Calling Agent - Enterprise Voice AI Platform",
  description: "Production-ready AI-powered calling system with intelligent voice agents for enterprise communications",
  keywords: "AI, calling, voice agents, enterprise, automation, communications",
  authors: [{ name: "Smartkode" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#2563eb",
  manifest: "/manifest.json", // ✅ PWA manifest
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* ✅ CSRF Token Meta Tag (backend should inject this) */}
        <meta name="csrf-token" content="BACKEND_WILL_INJECT_TOKEN" />

        {/* ✅ PWA Meta Tags */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ErrorBoundary>

        {/* ✅ Register Service Worker for Offline Support */}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}