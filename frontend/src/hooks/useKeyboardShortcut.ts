"use client";

import { useEffect } from 'react';

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === key && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, enabled]);
}

// Usage in login page
export function useLoginShortcuts() {
  const router = useRouter();

  // Ctrl/Cmd + K to focus email input
  useKeyboardShortcut('k', () => {
    document.querySelector<HTMLInputElement>('input[name="email"]')?.focus();
  });

  // Ctrl/Cmd + Shift + R to go to register
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'R' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        router.push('/register');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);
}