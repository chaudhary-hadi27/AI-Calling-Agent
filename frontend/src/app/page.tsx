// frontend/src/app/page.tsx

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const conversations = [
  { type: "user", text: "Hi, I'd like to know about your services.", delay: 0 },
  { type: "ai", text: "Hello! I'd be happy to help. What would you like to know?", delay: 2000 },
  { type: "user", text: "What are your operating hours?", delay: 4000 },
  { type: "ai", text: "We're available 24/7! Our AI agents never sleep.", delay: 6000 },
  { type: "user", text: "That's impressive! How fast can you handle calls?", delay: 8000 },
  { type: "ai", text: "We can handle thousands of calls simultaneously with instant responses.", delay: 10000 },
];

export default function LandingPage() {
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [isCallActive, setIsCallActive] = useState(false);

  useEffect(() => {
    setIsCallActive(true);
    const timer = setInterval(() => {
      setVisibleMessages((prev) => {
        if (prev < conversations.length) {
          return prev + 1;
        }
        return 0;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border-primary)] bg-[var(--color-surface-primary)]/80 backdrop-blur-md fixed w-full top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-600)] rounded-lg flex items-center justify-center font-bold text-xl shadow-lg">
                S
              </div>
              <span className="text-xl font-bold">Smartkode</span>
              <span className="text-xs px-2 py-0.5 bg-[var(--color-primary-500)]/20 text-[var(--color-primary-400)] rounded-full font-medium">
                AI Calling
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="#features"
                className="hidden md:block px-4 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="hidden md:block px-4 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/login"
                className="px-6 py-2 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-xl"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-500)]/20 border border-[var(--color-primary-500)]/30 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 bg-[var(--color-success-500)] rounded-full animate-pulse"></span>
              Live AI Conversation Demo
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Enterprise AI Calling
              <span className="block bg-gradient-to-r from-[var(--color-primary-400)] to-[var(--color-secondary-400)] bg-clip-text text-transparent">
                Platform by Smartkode
              </span>
            </h1>

            <p className="text-xl text-[var(--color-text-secondary)] mb-8 leading-relaxed">
              Transform your business communications with intelligent AI voice agents.
              Built for enterprise scale, trusted by industry leaders, powered by cutting-edge technology.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12">
              <Link
                href="/register"
                className="px-8 py-4 bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-secondary-600)] text-white rounded-xl hover:from-[var(--color-primary-700)] hover:to-[var(--color-secondary-700)] transition-all font-semibold text-lg shadow-2xl transform hover:scale-105"
              >
                Start Free Trial
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-[var(--color-surface-primary)] backdrop-blur-sm text-[var(--color-text-primary)] rounded-xl hover:bg-[var(--color-surface-hover)] transition-all font-semibold text-lg border border-[var(--color-border-primary)]"
              >
                Sign In
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[var(--color-border-primary)]">
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--color-primary-400)] mb-1">99.9%</div>
                <div className="text-sm text-[var(--color-text-tertiary)]">Uptime SLA</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--color-secondary-400)] mb-1">&lt;500ms</div>
                <div className="text-sm text-[var(--color-text-tertiary)]">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--color-success-500)] mb-1">24/7</div>
                <div className="text-sm text-[var(--color-text-tertiary)]">Support</div>
              </div>
            </div>
          </div>

          {/* Right Side - Animated Call Demo */}
          <div className="relative">
            {/* Phone Interface */}
            <div className="bg-[var(--color-surface-primary)] rounded-3xl shadow-2xl border border-[var(--color-border-primary)] overflow-hidden">
              {/* Phone Header */}
              <div className="bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-secondary-600)] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    🤖
                  </div>
                  <div>
                    <div className="font-semibold text-white">Smartkode AI Agent</div>
                    <div className="text-sm text-white/70 flex items-center gap-2">
                      <span className="w-2 h-2 bg-[var(--color-success-500)] rounded-full animate-pulse"></span>
                      Active Call
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium text-white">
                  {Math.floor(visibleMessages * 2)}:{(visibleMessages * 2 % 60).toString().padStart(2, '0')}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-6 space-y-4 h-96 overflow-y-auto bg-[var(--color-bg-secondary)]">
                {conversations.slice(0, visibleMessages).map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  >
                    <div
                      className={`max-w-xs px-4 py-3 rounded-2xl ${
                        msg.type === 'user'
                          ? 'bg-[var(--color-primary-600)] text-white rounded-br-none'
                          : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] rounded-bl-none'
                      } shadow-lg`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {visibleMessages > 0 && visibleMessages < conversations.length && (
                  <div className="flex justify-start">
                    <div className="bg-[var(--color-surface-secondary)] px-4 py-3 rounded-2xl rounded-bl-none shadow-lg">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-[var(--color-text-tertiary)] rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-[var(--color-text-tertiary)] rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-[var(--color-text-tertiary)] rounded-full animate-bounce delay-200"></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Voice Wave Animation */}
              {isCallActive && (
                <div className="bg-[var(--color-surface-primary)]/50 backdrop-blur-sm px-6 py-4 border-t border-[var(--color-border-primary)]">
                  <div className="flex items-center justify-center gap-1 h-12">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-gradient-to-t from-[var(--color-primary-500)] to-[var(--color-secondary-500)] rounded-full animate-wave"
                        style={{
                          height: `${Math.random() * 100}%`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      ></div>
                    ))}
                  </div>
                  <div className="text-center text-sm text-[var(--color-text-tertiary)] mt-2">
                    AI is speaking...
                  </div>
                </div>
              )}
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-[var(--color-success-500)] text-white px-4 py-2 rounded-full font-semibold shadow-lg animate-bounce">
              ✓ SOC 2 Certified
            </div>
            <div className="absolute -bottom-4 -left-4 bg-[var(--color-secondary-500)] text-white px-4 py-2 rounded-full font-semibold shadow-lg animate-pulse">
              🚀 Enterprise Ready
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Enterprise-Grade Features</h2>
            <p className="text-xl text-[var(--color-text-secondary)]">Built for scale, designed for reliability</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[var(--color-surface-primary)] backdrop-blur-sm border border-[var(--color-border-primary)] p-8 rounded-2xl hover:border-[var(--color-primary-500)]/50 transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                🎯
              </div>
              <h3 className="text-2xl font-bold mb-3">Natural Conversations</h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                Advanced NLP and context-aware AI that understands intent, emotion, and nuance for genuinely human-like interactions.
              </p>
            </div>

            <div className="bg-[var(--color-surface-primary)] backdrop-blur-sm border border-[var(--color-border-primary)] p-8 rounded-2xl hover:border-[var(--color-secondary-500)]/50 transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-secondary-500)] to-[var(--color-secondary-600)] rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                ⚡
              </div>
              <h3 className="text-2xl font-bold mb-3">Lightning Fast</h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                Sub-500ms response times with infinite scalability. Handle thousands of concurrent calls without breaking a sweat.
              </p>
            </div>

            <div className="bg-[var(--color-surface-primary)] backdrop-blur-sm border border-[var(--color-border-primary)] p-8 rounded-2xl hover:border-[var(--color-success-500)]/50 transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-success-500)] to-[var(--color-success-600)] rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                🔒
              </div>
              <h3 className="text-2xl font-bold mb-3">Bank-Level Security</h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                SOC 2 Type II certified, GDPR & CCPA compliant. Your data is encrypted end-to-end and never shared.
              </p>
            </div>

            <div className="bg-[var(--color-surface-primary)] backdrop-blur-sm border border-[var(--color-border-primary)] p-8 rounded-2xl hover:border-[var(--color-accent-500)]/50 transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-accent-500)] to-[var(--color-accent-600)] rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                📊
              </div>
              <h3 className="text-2xl font-bold mb-3">Real-Time Analytics</h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                Comprehensive dashboards with live metrics, call transcripts, sentiment analysis, and actionable insights.
              </p>
            </div>

            <div className="bg-[var(--color-surface-primary)] backdrop-blur-sm border border-[var(--color-border-primary)] p-8 rounded-2xl hover:border-[var(--color-warning-500)]/50 transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-warning-500)] to-[var(--color-warning-600)] rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                🔗
              </div>
              <h3 className="text-2xl font-bold mb-3">Seamless Integration</h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                Connect with your existing CRM, helpdesk, and business tools via REST API, webhooks, and SDKs.
              </p>
            </div>

            <div className="bg-[var(--color-surface-primary)] backdrop-blur-sm border border-[var(--color-border-primary)] p-8 rounded-2xl hover:border-[var(--color-info-500)]/50 transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-info-500)] to-[var(--color-info-600)] rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                🎨
              </div>
              <h3 className="text-2xl font-bold mb-3">Custom AI Agents</h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                Design and deploy custom voice agents with unique personalities, languages, and use cases tailored to your brand.
              </p>
            </div>
          </div>
        </div>

        {/* Compliance Badges */}
        <div className="mt-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted & Certified</h2>
            <p className="text-lg text-[var(--color-text-secondary)]">
              Industry-leading compliance and security standards
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] px-8 py-4 rounded-xl">
              <span className="text-xl font-bold">🔒 SOC 2 Type II</span>
            </div>
            <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] px-8 py-4 rounded-xl">
              <span className="text-xl font-bold">🇪🇺 GDPR Compliant</span>
            </div>
            <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] px-8 py-4 rounded-xl">
              <span className="text-xl font-bold">🏛️ HIPAA Ready</span>
            </div>
            <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] px-8 py-4 rounded-xl">
              <span className="text-xl font-bold">✅ ISO 27001</span>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32">
          <div className="bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-secondary-600)] rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join leading enterprises using Smartkode AI Calling Platform. Start your free trial today—no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-white text-[var(--color-primary-600)] rounded-xl hover:bg-gray-100 transition-all font-semibold text-lg shadow-xl"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="mailto:sales@smartkode.io"
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-xl hover:bg-white/20 transition-all font-semibold text-lg"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border-primary)] bg-[var(--color-surface-primary)]/80 backdrop-blur-md mt-32">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Company */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-600)] rounded-lg flex items-center justify-center font-bold shadow-lg">
                  S
                </div>
                <span className="font-bold text-lg">Smartkode</span>
              </div>
              <p className="text-sm text-[var(--color-text-tertiary)] mb-4">
                Enterprise AI Calling Platform for modern businesses.
              </p>
              <div className="flex gap-3">
                <a href="https://twitter.com/smartkode" className="text-[var(--color-text-tertiary)] hover:text-[var(--color-primary-500)] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg>
                </a>
                <a href="https://linkedin.com/company/smartkode" className="text-[var(--color-text-tertiary)] hover:text-[var(--color-primary-500)] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
                <a href="https://github.com/smartkode" className="text-[var(--color-text-tertiary)] hover:text-[var(--color-primary-500)] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2A10 10 0 002 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"></path></svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-[var(--color-text-tertiary)]">
                <li><Link href="#features" className="hover:text-[var(--color-text-primary)] transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-[var(--color-text-primary)] transition-colors">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-[var(--color-text-primary)] transition-colors">Dashboard</Link></li>
                <li><Link href="/docs" className="hover:text-[var(--color-text-primary)] transition-colors">Documentation</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-[var(--color-text-tertiary)]">
                <li><Link href="/about" className="hover:text-[var(--color-text-primary)] transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-[var(--color-text-primary)] transition-colors">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-[var(--color-text-primary)] transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-[var(--color-text-primary)] transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-[var(--color-text-tertiary)]">
                <li><Link href="/privacy" className="hover:text-[var(--color-text-primary)] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-[var(--color-text-primary)] transition-colors">Terms of Service</Link></li>
                <li><Link href="/security" className="hover:text-[var(--color-text-primary)] transition-colors">Security</Link></li>
                <li><Link href="/compliance" className="hover:text-[var(--color-text-primary)] transition-colors">Compliance</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[var(--color-border-primary)] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-center text-[var(--color-text-tertiary)] text-sm">
              © 2025 Smartkode. All rights reserved. • Built with 💙 for Enterprise
            </p>
            <p className="text-center text-[var(--color-text-tertiary)] text-sm">
              <a href="https://smartkode.io" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary-500)] transition-colors">
                smartkode.io
              </a>
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes wave {
          0%, 100% {
            height: 20%;
          }
          50% {
            height: 100%;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
}