"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Modal } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { authService } from "@/lib/api/services/auth.service";

interface MFASetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const MFASetup: React.FC<MFASetupProps> = ({ isOpen, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'qr' | 'verify' | 'backup'>('qr');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      initiateMFA();
    }
  }, [isOpen]);

  const initiateMFA = async () => {
    setIsLoading(true);
    try {
      const response = await authService.initiateMFA();
      setQrCodeUrl(response.qrCodeUrl);
      setSecret(response.secret);
      setBackupCodes(response.backupCodes);
      setStep('qr');
    } catch (err: any) {
      toast.error('Failed to initiate MFA setup');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.verifyMFA(verificationCode);
      toast.success('MFA enabled successfully!');
      setStep('backup');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Invalid code. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    onSuccess();
    onClose();
  };

  const copyBackupCodes = () => {
    const text = backupCodes.join('\n');
    navigator.clipboard.writeText(text);
    toast.success('Backup codes copied to clipboard');
  };

  const downloadBackupCodes = () => {
    const text = `Smartkode MFA Backup Codes\nGenerated: ${new Date().toISOString()}\n\n${backupCodes.join('\n')}\n\nKeep these codes safe. Each code can only be used once.`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smartkode-mfa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Backup codes downloaded');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Set Up Two-Factor Authentication"
      size="md"
      closeOnOverlayClick={false}
    >
      {step === 'qr' && (
        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-[var(--color-info-500)]/10 border border-[var(--color-info-500)]/30 rounded-lg p-4">
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">
              Step 1: Scan QR Code
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator to scan this QR code.
            </p>
          </div>

          {/* QR Code */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary-600)]"></div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <img
                  src={qrCodeUrl}
                  alt="MFA QR Code"
                  className="w-64 h-64"
                />
              </div>

              {/* Manual Entry */}
              <div className="w-full">
                <p className="text-sm text-[var(--color-text-tertiary)] text-center mb-2">
                  Can't scan? Enter this code manually:
                </p>
                <div className="flex items-center gap-2 bg-[var(--color-surface-secondary)] p-3 rounded-lg">
                  <code className="flex-1 text-center text-[var(--color-text-primary)] font-mono text-sm">
                    {secret}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(secret);
                      toast.success('Secret copied to clipboard');
                    }}
                    className="p-2 hover:bg-[var(--color-surface-hover)] rounded transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Next Button */}
          <Button
            onClick={() => setStep('verify')}
            variant="primary"
            size="lg"
            fullWidth
            disabled={isLoading}
          >
            Continue to Verification
          </Button>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-[var(--color-info-500)]/10 border border-[var(--color-info-500)]/30 rounded-lg p-4">
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">
              Step 2: Verify Setup
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Enter the 6-digit code from your authenticator app to complete setup.
            </p>
          </div>

          {/* Verification Input */}
          <div>
            <Input
              label="Enter 6-Digit Code"
              type="text"
              inputMode="numeric"
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setVerificationCode(value);
                setError('');
              }}
              placeholder="000000"
              maxLength={6}
              error={error}
              fullWidth
              disabled={isLoading}
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => setStep('qr')}
              variant="outline"
              size="lg"
              fullWidth
              disabled={isLoading}
            >
              Back
            </Button>
            <Button
              onClick={handleVerify}
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading || verificationCode.length !== 6}
            >
              Verify & Enable
            </Button>
          </div>
        </div>
      )}

      {step === 'backup' && (
        <div className="space-y-6">
          {/* Success Message */}
          <div className="bg-[var(--color-success-500)]/10 border border-[var(--color-success-500)]/30 rounded-lg p-4 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-[var(--color-success-500)]/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[var(--color-success-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">
              MFA Enabled Successfully!
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Your account is now protected with two-factor authentication
            </p>
          </div>

          {/* Backup Codes Warning */}
          <div className="bg-[var(--color-warning-500)]/10 border border-[var(--color-warning-500)]/30 rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-[var(--color-warning-500)] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">
                  Save Your Backup Codes
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Store these codes in a safe place. You can use them to access your account if you lose your phone.
                </p>
              </div>
            </div>
          </div>

          {/* Backup Codes */}
          <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border-primary)] rounded-lg p-4">
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">
              Backup Codes
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {backupCodes.map((code, i) => (
                <code key={i} className="text-sm font-mono text-[var(--color-text-primary)] bg-[var(--color-bg-secondary)] px-3 py-2 rounded">
                  {code}
                </code>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={copyBackupCodes}
                variant="outline"
                size="sm"
                fullWidth
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                }
              >
                Copy
              </Button>
              <Button
                onClick={downloadBackupCodes}
                variant="outline"
                size="sm"
                fullWidth
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                }
              >
                Download
              </Button>
            </div>
          </div>

          {/* Complete Button */}
          <Button
            onClick={handleComplete}
            variant="primary"
            size="lg"
            fullWidth
          >
            Complete Setup
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default MFASetup;