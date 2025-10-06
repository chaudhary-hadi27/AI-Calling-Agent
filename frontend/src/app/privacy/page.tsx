"use client";

import Link from "next/link";

export default function PrivacyPage() {
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
              Privacy Policy
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
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                Introduction
              </h2>
              <p className="leading-relaxed mb-4">
                At Smartkode ("we", "us", or "our"), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI Calling Platform.
              </p>
              <p className="leading-relaxed">
                By using our Service, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our Service.
              </p>
            </section>

            {/* 1. Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                1. Information We Collect
              </h2>

              <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3 mt-6">
                1.1 Information You Provide
              </h3>
              <p className="leading-relaxed mb-4">
                We collect information that you voluntarily provide when you:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Create an account (name, email, password, company information)</li>
                <li>Use our Service (call data, recordings, transcripts)</li>
                <li>Contact our support team</li>
                <li>Subscribe to our newsletter or updates</li>
                <li>Participate in surveys or promotions</li>
              </ul>

              <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3 mt-6">
                1.2 Automatically Collected Information
              </h3>
              <p className="leading-relaxed mb-4">
                We automatically collect certain information when you use our Service:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, features used, time spent)</li>
                <li>Call metadata (duration, timestamps, phone numbers)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>

              <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3 mt-6">
                1.3 Third-Party Information
              </h3>
              <p className="leading-relaxed">
                When you sign in using third-party authentication (Google, Microsoft), we receive basic profile information as authorized by you through those services.
              </p>
            </section>

            {/* 2. How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                2. How We Use Your Information
              </h2>
              <p className="leading-relaxed mb-4">
                We use the collected information for various purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide, maintain, and improve our Service</li>
                <li>Process your transactions and manage your account</li>
                <li>Send you technical notices, updates, and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Analyze usage patterns and optimize performance</li>
                <li>Detect, prevent, and address technical issues and fraud</li>
                <li>Comply with legal obligations</li>
                <li>Develop new features and services</li>
              </ul>
            </section>

            {/* 3. Data Sharing and Disclosure */}
            <section>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                3. How We Share Your Information
              </h2>
              <p className="leading-relaxed mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>

              <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3 mt-6">
                3.1 Service Providers
              </h3>
              <p className="leading-relaxed mb-4">
                We share information with third-party service providers who perform services on our behalf:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cloud hosting providers (AWS, Google Cloud)</li>
                <li>Payment processors</li>
                <li>Analytics providers</li>
                <li>Communication service providers</li>
              </ul>

              <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3 mt-6">
                3.2 Legal Requirements
              </h3>
              <p className="leading-relaxed mb-4">
                We may disclose your information if required to do so by law or in response to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Valid legal requests from authorities</li>
                <li>Court orders or subpoenas</li>
                <li>Protection of our legal rights</li>
                <li>Investigation of potential violations</li>
              </ul>

              <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3 mt-6">
                3.3 Business Transfers
              </h3>
              <p className="leading-relaxed">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
              </p>
            </section>

            {/* 4. Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                4. Data Security
              </h2>
              <p className="leading-relaxed mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>End-to-end encryption for call data</li>
                <li>Secure socket layer (SSL) technology</li>
                <li>Regular security audits and assessments</li>
                <li>Access controls and authentication</li>
                <li>Data backup and disaster recovery procedures</li>
                <li>Employee training on data protection</li>
              </ul>
              <p className="leading-relaxed mt-4">
                However, no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            {/* 5. Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                5. Data Retention
              </h2>
              <p className="leading-relaxed mb-4">
                We retain your information for as long as necessary to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide our Service</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Enforce our agreements</li>
              </ul>
              <p className="leading-relaxed mt-4">
                Call recordings are retained according to your account settings and applicable regulations, typically for 30-90 days unless extended for compliance purposes.
              </p>
            </section>

            {/* 6. Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                6. Your Privacy Rights
              </h2>
              <p className="leading-relaxed mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                <li><strong>Deletion:</strong> Request deletion of your information</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Opt-out:</strong> Opt out of marketing communications</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
                <li><strong>Object:</strong> Object to certain types of processing</li>
              </ul>
              <p className="leading-relaxed mt-4">
                To exercise these rights, please contact us at privacy@smartkode.io.
              </p>
            </section>

            {/* 7. Cookies and Tracking */}
            <section>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                7. Cookies and Tracking Technologies
              </h2>
              <p className="leading-relaxed mb-4">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Remember your preferences</li>
                <li>Understand how you use our Service</li>
                <li>Improve your experience</li>
                <li>Analyze trends and track user engagement</li>
              </ul>
              <p className="leading-relaxed mt-4">
                You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our Service.
              </p>
            </section>

            {/* 8. International Data Transfers */}
            <section>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                8. International Data Transfers
              </h2>
              <p className="leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy and applicable laws, including Standard Contractual Clauses approved by the European Commission.
              </p>
            </section>

            {/* 9. Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                9. Children's Privacy
              </h2>
              <p className="leading-relaxed">
                Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            {/* 10. Third-Party Links */}
            <section>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                10. Third-Party Links and Services
              </h2>
              <p className="leading-relaxed">
                Our Service may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies before providing any information.
              </p>
            </section>

            {/* 11. California Privacy Rights */}
            <section>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                11. California Privacy Rights (CCPA)
              </h2>
              <p className="leading-relaxed mb-4">
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Right to know what personal information is collected</li>
                <li>Right to know if personal information is sold or disclosed</li>
                <li>Right to opt-out of the sale of personal information</li>
                <li>Right to deletion of personal information</li>
                <li>Right to non-discrimination for exercising CCPA rights</li>
              </ul>
            </section>

            {/* 12. GDPR Compliance */}
            <section>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                12. GDPR Compliance
              </h2>
              <p className="leading-relaxed mb-4">
                For users in the European Economic Area (EEA), we process your personal data based on the following legal grounds:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Contract:</strong> Processing necessary to fulfill our contract with you</li>
                <li><strong>Consent:</strong> You have given explicit consent</li>
                <li><strong>Legitimate interests:</strong> Processing necessary for our legitimate business interests</li>
                <li><strong>Legal obligation:</strong> Processing necessary to comply with legal requirements</li>
              </ul>
            </section>

            {/* 13. Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                13. Changes to This Privacy Policy
              </h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            {/* Contact */}
            <section className="pt-8 border-t border-[var(--color-border-primary)]">
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                Contact Us
              </h2>
              <p className="leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2">
                <p>
                  <span className="font-medium text-[var(--color-text-primary)]">Email:</span>{" "}
                  <a
                    href="mailto:info@smartkode.io"
                    className="text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)]"
                  >
                    info@smartkode.io
                  </a>
                </p>
                <p>
                  <span className="font-medium text-[var(--color-text-primary)]">Data Protection Officer:</span>{" "}
                  <a
                    href="mailto:support@smartkode.io"
                    className="text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)]"
                  >
                    support@smartkode.io
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