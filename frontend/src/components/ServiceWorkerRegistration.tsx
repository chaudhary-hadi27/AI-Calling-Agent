"use client";

import { useEffect } from "react";
import { useToast } from "@/hooks/useToast";

/**
 * ✅ Service Worker Registration Component
 * Registers SW and handles updates
 */
export default function ServiceWorkerRegistration() {
  const { toast } = useToast();

  useEffect(() => {
    // Only register in production and if supported
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      console.log("[SW] Service Worker registered:", registration.scope);

      // Check for updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;

        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New version available
              toast.info(
                "New version available! Refresh to update.",
                10000
              );

              // Optionally auto-update after delay
              setTimeout(() => {
                newWorker.postMessage({ type: "SKIP_WAITING" });
                window.location.reload();
              }, 5000);
            }
          });
        }
      });

      // Handle controller change (SW updated)
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("[SW] Controller changed, reloading...");
        window.location.reload();
      });
    } catch (error) {
      console.error("[SW] Registration failed:", error);
    }
  };

  return null; // No UI
}

/**
 * ✅ Utility: Clear Service Worker Cache
 * Call this from settings or when needed
 */
export async function clearServiceWorkerCache(): Promise<void> {
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    registration.active?.postMessage({ type: "CLEAR_CACHE" });
    console.log("[SW] Cache cleared");
  }
}

/**
 * ✅ Utility: Check if offline
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}