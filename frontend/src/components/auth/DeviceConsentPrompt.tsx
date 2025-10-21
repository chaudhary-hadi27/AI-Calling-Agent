"use client";

import React, { useState, useEffect } from "react";
import { Modal, Button } from "@/components/ui";

interface DeviceConsentPromptProps {
  onAccept: () => void;
  onDecline: () => void;
}

/**
 * ✅ GDPR/CCPA Compliant Device Fingerprinting Consent
 * Must be shown BEFORE collecting device fingerprint
 */
export default function DeviceConsentPrompt({
  onAccept,
  onDecline,
}: DeviceConsentPromptProps) {
  const [isOpen, setIsOpen] = useState(false);
  const CONSENT_KEY = "device_fingerprint_consent";

  useEffect(() => {
    // Check if user has already given/declined consent
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setIsOpen(false);
    onAccept();
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setIsOpen(false);
    onDecline();
  };

  const handleLearnMore = () => {
    window.open("/privacy#device-fingerprinting", "_blank");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Can't close without choosing
      title="Enhanced Security"
      size="md"
      closeOnOverlayClick={false}
      showCloseButton={false}
    >
      <div className="space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-[var(--color-info-500)]/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[var(--color-info-500)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
            Trust This Device?
          </h3>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            We can remember this device to enhance your security and reduce future verification steps.
          </p>
        </div>

        {/* Details */}
        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--color-success-500)]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            What We Collect:
          </h4>
          <ul className="text-sm text-[var(--color-text-secondary)] space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-text-tertiary)]">•</span>
              <span>Browser type and version</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-text-tertiary)]">•</span>
              <span>Operating system</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-text-tertiary)]">•</span>
              <span>Screen resolution and device type</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-text-tertiary)]">•</span>
              <span>Timezone and language settings</span>
            </li>
          </ul>
        </div>

        {/* Benefits */}
        <div className="bg-[var(--color-info-500)]/10 border border-[var(--color-info-500)]/30 rounded-lg p-4">
          <h4 className="font-semibold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--color-info-500)]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            Benefits:
          </h4>
          <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
            <li>✓ Skip MFA on this device for 30 days</li>
            <li>✓ Detect suspicious login attempts</li>
            <li>✓ Enhanced account security</li>
          </ul>
        </div>

        {/* Privacy Notice */}
        <div className="text-xs text-[var(--color-text-tertiary)] text-center">
          <p>
            We respect your privacy. This data is stored securely and never shared.{" "}
            <button
              onClick={handleLearnMore}
              className="text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] underline"
            >
              Learn more
            </button>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleAccept}
            variant="primary"
            size="lg"
            fullWidth
          >
            Trust This Device
          </Button>
          <Button
            onClick={handleDecline}
            variant="outline"
            size="lg"
            fullWidth
          >
            Continue Without Trusting
          </Button>
        </div>

        {/* Additional Info */}
        <p className="text-xs text-center text-[var(--color-text-tertiary)]">
          You can change this preference anytime in your account settings
        </p>
      </div>
    </Modal>
  );
}

/**
 * Hook to check device consent status
 */
export function useDeviceConsent() {
  const [consentStatus, setConsentStatus] = useState<"pending" | "accepted" | "declined">("pending");

  useEffect(() => {
    const consent = localStorage.getItem("device_fingerprint_consent");
    if (consent === "accepted") {
      setConsentStatus("accepted");
    } else if (consent === "declined") {
      setConsentStatus("declined");
    }
  }, []);

  const updateConsent = (status: "accepted" | "declined") => {
    localStorage.setItem("device_fingerprint_consent", status);
    setConsentStatus(status);
  };

  const revokeConsent = () => {
    localStorage.removeItem("device_fingerprint_consent");
    setConsentStatus("pending");
  };

  return {
    consentStatus,
    hasConsent: consentStatus === "accepted",
    updateConsent,
    revokeConsent,
  };
}