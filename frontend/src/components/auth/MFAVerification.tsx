"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui";
import { useToast } from "@/hooks/useToast";

interface MFAVerificationProps {
  onVerify: (code: string) => Promise<void>;
  onUseBackupCode: () => void;
  isLoading?: boolean;
}

const MFAVerification: React.FC<MFAVerificationProps> = ({
  onVerify,
  onUseBackupCode,
  isLoading = false,
}) => {
  const { toast } = useToast();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields filled
    if (index === 5 && value) {
      const fullCode = newCode.join('');
      handleVerify(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();

      // Auto-submit
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (codeValue: string) => {
    try {
      await onVerify(codeValue);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Invalid code. Please try again.';
      setError(message);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');

    if (fullCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    handleVerify(fullCode);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-[var(--color-primary-500)]/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--color-primary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
          Two-Factor Authentication
        </h2>
        <p className="text-[var(--color-text-secondary)]">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      {/* Code Input Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div
            className="flex gap-2 justify-center mb-2"
            onPaste={handlePaste}
          >
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`
                  w-12 h-14 text-center text-2xl font-bold
                  bg-[var(--color-bg-secondary)]
                  border-2 ${
                    error
                      ? 'border-[var(--color-error-500)]'
                      : 'border-[var(--color-border-primary)]'
                  }
                  text-[var(--color-text-primary)]
                  rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent
                  transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                disabled={isLoading}
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-[var(--color-error-500)] text-center mt-2 flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          disabled={isLoading || code.join('').length !== 6}
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--color-border-primary)]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-[var(--color-surface-primary)] text-[var(--color-text-tertiary)]">
            Having trouble?
          </span>
        </div>
      </div>

      {/* Alternative Options */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={onUseBackupCode}
          disabled={isLoading}
          className="w-full text-sm text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] transition-colors font-medium disabled:opacity-50"
        >
          Use a backup code instead
        </button>

        <p className="text-xs text-center text-[var(--color-text-tertiary)]">
          Lost your device?{" "}
          <a
            href="/support"
            className="text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] transition-colors underline"
          >
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
};

export default MFAVerification;