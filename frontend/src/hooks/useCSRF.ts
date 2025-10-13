"use client";

import { useEffect, useState } from 'react';
import { getCSRFToken, rotateCSRFToken } from '@/lib/security/csrfProtection';

/**
 * React hook for CSRF token
 */
export function useCSRFToken() {
  const [token, setToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const newToken = await getCSRFToken();
        setToken(newToken);
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();

    // Refresh token every 30 minutes
    const interval = setInterval(fetchToken, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const refreshToken = async () => {
    setIsLoading(true);
    try {
      const newToken = await rotateCSRFToken();
      setToken(newToken);
    } finally {
      setIsLoading(false);
    }
  };

  return { token, isLoading, refreshToken };
}