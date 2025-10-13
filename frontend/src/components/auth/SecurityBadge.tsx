"use client";

import React from "react";

const SecurityBadge: React.FC = () => {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
      {/* SOC 2 Type II */}
      <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors group cursor-pointer">
        <div className="w-8 h-8 bg-[var(--color-surface-secondary)] rounded-lg flex items-center justify-center group-hover:bg-[var(--color-surface-hover)] transition-colors">
          <svg className="w-5 h-5 text-[var(--color-success-500)]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="text-xs">
          <div className="font-semibold">SOC 2</div>
          <div className="text-[var(--color-text-quaternary)]">Type II</div>
        </div>
      </div>

      {/* GDPR Compliant */}
      <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors group cursor-pointer">
        <div className="w-8 h-8 bg-[var(--color-surface-secondary)] rounded-lg flex items-center justify-center group-hover:bg-[var(--color-surface-hover)] transition-colors">
          <svg className="w-5 h-5 text-[var(--color-info-500)]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="text-xs">
          <div className="font-semibold">GDPR</div>
          <div className="text-[var(--color-text-quaternary)]">Compliant</div>
        </div>
      </div>

      {/* 256-bit Encryption */}
      <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors group cursor-pointer">
        <div className="w-8 h-8 bg-[var(--color-surface-secondary)] rounded-lg flex items-center justify-center group-hover:bg-[var(--color-surface-hover)] transition-colors">
          <svg className="w-5 h-5 text-[var(--color-warning-500)]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="text-xs">
          <div className="font-semibold">256-bit</div>
          <div className="text-[var(--color-text-quaternary)]">Encryption</div>
        </div>
      </div>

      {/* ISO 27001 Certified */}
      <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors group cursor-pointer">
        <div className="w-8 h-8 bg-[var(--color-surface-secondary)] rounded-lg flex items-center justify-center group-hover:bg-[var(--color-surface-hover)] transition-colors">
          <svg className="w-5 h-5 text-[var(--color-primary-500)]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="text-xs">
          <div className="font-semibold">ISO 27001</div>
          <div className="text-[var(--color-text-quaternary)]">Certified</div>
        </div>
      </div>
    </div>
  );
};

export default SecurityBadge;