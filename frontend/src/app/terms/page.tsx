"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border-primary)] bg-[var(--color-surface-primary)]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-600)] rounded-lg flex items-center justify-center font-bold text-xl shadow-lg">
                S
              </div>
              <span className="text-xl font-bold">Smartkode</span>
            </Link>
            <Link
              href="/"
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-2xl p-8 md:p-12 shadow-xl">
          {/* Title */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text-primary)] mb-4">
              Terms of Service
            </h1>
            <p className="text-[var(--color-text-secondary)] text-lg">
              Last updated: January 2025
            </p>
            <p className="text-[var(--color-text-tertiary)] mt-2">
              Smartkode AI Calling Platform
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-10 text-[var(--color-text-secondary)]">
            {/* 1. Agreement to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                1. Agreement to Terms
              </h2>
              <p className="leading-relaxed mb-4">
                By accessing or using Smartkode's AI Calling Platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
              </p>
              <p className="leading-relaxed">
                These Terms apply to all visitors, users, and others who access or use the Service provided by Smartkode ("Company", "we", "us", or "our") at smartkode.io.
              </p>
            </section>

            {/* 2. Description of Service */}
            <section>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                2. Description of Service
              </h2>
              <p className="leading-relaxed mb-4">
                Smartkode provides an enterprise-grade AI-powered calling platform that enables businesses to automate and enhance their voice communications. Our Service includes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>AI voice agents for automated calling</li>
                <li>Real-time call monitoring and analytics</li>
                <li>Campaign management tools</li>
                <li>Integration capabilities with existing systems</li>
                <li>Call transcription and recording services</li>
              </ul>
            </section>

            {/* 3. User Accounts */}
            <section>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                3. User Accounts
              </h2>
              <p className="leading-relaxed mb-4">
                When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms.
              </p>
              <p className="leading-relaxed mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Safeguarding your account password</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Ensuring your account information remains accurate and up-to-date</li>
              </ul>
            </section>

            {/* 4. Acceptable Use */}
            <section>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                4. Acceptable Use Policy
              </h2>
              <p className="leading-relaxed mb-4">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Make unsolicited calls without proper consent</li>
                <li>Harass, abuse, or harm another person</li>
                <li>Impersonate or attempt to impersonate the Company or others</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use the Service for fraudulent or illegal purposes</li>
                <li>Violate telecommunications regulations (TCPA, Do Not Call lists, etc.)</li>
              </ul>
            </section>

            {/* 5. Compliance */}
            <section>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                5. Regulatory Compliance
              </h2>
              <p className="leading-relaxed mb-4">
                You are responsible for ensuring your use of the Service complies with all applicable laws and regulations, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Telephone Consumer Protection Act (TCPA)</li>
                <li>Telemarketing Sales Rule (TSR)</li>
                <li>General Data Protection Regulation (GDPR)</li>
                <li>California Consumer Privacy Act (CCPA)</li>
                <li>Local telecommunications regulations</li>
              </ul>
            </section>

            {/* 6. Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                6. Intellectual Property Rights
              </h2>
              <p className="leading-relaxed mb-4">
                The Service and its original content, features, and functionality are owned by Smartkode and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p className="leading-relaxed">
                You may not copy, modify, distribute, sell, or lease any part of our Service without our express written permission.
              </p>
            </section>

            {/* 7. Data and Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                7. Data and Privacy
              </h2>
              <p className="leading-relaxed mb-4">
                Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy, which explains how we collect, use, and disclose information.
              </p>
              <p className="leading-relaxed">
                You retain all rights to your data. We will not use your data for purposes other than providing and improving the Service without your explicit consent.
              </p>
            </section>

            {/* 8. Payment Terms */}
            <section>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                8. Payment Terms
              </h2>
              <p className="leading-relaxed mb-4">
                Certain aspects of the Service are provided on a subscription basis. You agree to pay all fees according to the pricing plan you selected. Fees are:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Billed in advance on a recurring basis</li>
                <li>Non-refundable except as required by law</li>
                <li>Subject to change with 30 days' notice</li>
                <li>Exclusive of applicable taxes</li>
              </ul>
            </section>

            {/* 9. Termination */}
            <section>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                9. Termination
              </h2>
              <p className="leading-relaxed mb-4">
                We may terminate or suspend your account immediately, without prior notice, for any breach of these Terms. Upon termination:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your right to use the Service will immediately cease</li>
                <li>You must cease all use of the Service</li>
                <li>We may delete your account and data</li>
                <li>Outstanding fees remain payable</li>
              </ul>
            </section>

            {/* 10. Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                10. Limitation of Liability
              </h2>
              <p className="leading-relaxed mb-4">
                To the maximum extent permitted by law, Smartkode shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your use or inability to use the Service</li>
                <li>Any unauthorized access to your data</li>
                <li>Service interruptions or errors</li>
                <li>Third-party conduct or content</li>
              </ul>
            </section>

            {/* 11. Warranty Disclaimer */}
            <section>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                11. Warranty Disclaimer
              </h2>
              <p className="leading-relaxed">
                The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, secure, or error-free.
              </p>
            </section>

            {/* 12. Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                12. Changes to Terms
              </h2>
              <p className="leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through the Service. Your continued use after such modifications constitutes acceptance of the updated Terms.
              </p>
            </section>

            {/* 13. Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                13. Governing Law
              </h2>
              <p className="leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Smartkode operates, without regard to its conflict of law provisions.
              </p>
            </section>

            {/* Contact */}
            <section className="pt-8 border-t border-[var(--color-border-primary)]">
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                Contact Us
              </h2>
              <p className="leading-relaxed mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="space-y-2">
                <p>
                  <span className="font-medium text-[var(--color-text-primary)]">Email:</span>{" "}
                  <a
                    href="mailto:legal@smartkode.io"
                    className="text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)]"
                  >
                    legal@smartkode.io
                  </a>
                </p>
                <p>
                  <span className="font-medium text-[var(--color-text-primary)]">Website:</span>{" "}
                  <a
                    href="https://smartkode.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)]"
                  >
                    smartkode.io
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border-primary)] bg-[var(--color-surface-primary)]/80 backdrop-blur-md mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-center text-[var(--color-text-tertiary)] text-sm">
              © 2025 Smartkode. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/terms"
                className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}