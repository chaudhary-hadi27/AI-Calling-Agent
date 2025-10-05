import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Calling Agent - Enterprise Voice AI Platform",
  description: "Production-ready AI-powered calling system with intelligent voice agents for enterprise communications",
  keywords: "AI, calling, voice agents, enterprise, automation, communications",
  authors: [{ name: "Your Company Name" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}