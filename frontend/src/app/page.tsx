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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-600)] rounded-lg flex items-center justify-center font-bold text-xl shadow-lg">
                AI
              </div>
              <span className="text-xl font-bold">AI Calling Agent</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/login"
                className="px-6 py-2 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white rounded-lg transition-all font-medium shadow-lg"
              >
                Login
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

            <h1 className="text-6xl font-bold mb-6 leading-tight">
              AI Agents That
              <span className="block bg-gradient-to-r from-[var(--color-primary-400)] to-[var(--color-secondary-400)] bg-clip-text text-transparent">
                Sound Human
              </span>
            </h1>

            <p className="text-xl text-[var(--color-text-secondary)] mb-8 leading-relaxed">
              Watch our AI agents handle real conversations with natural speech,
              instant responses, and complete understanding. Built for trust and reliability.
            </p>

            <div className="flex items-center gap-4 mb-12">
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-secondary-600)] text-white rounded-xl hover:from-[var(--color-primary-700)] hover:to-[var(--color-secondary-700)] transition-all font-semibold text-lg shadow-2xl transform hover:scale-105"
              >
                Start Free Trial
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-[var(--color-surface-primary)] backdrop-blur-sm text-[var(--color-text-primary)] rounded-xl hover:bg-[var(--color-surface-hover)] transition-all font-semibold text-lg border border-[var(--color-border-primary)]"
              >
                View Demo
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--color-primary-400)] mb-1">99.9%</div>
                <div className="text-sm text-[var(--color-text-tertiary)]">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--color-secondary-400)] mb-1">&lt;500ms</div>
                <div className="text-sm text-[var(--color-text-tertiary)]">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--color-success-500)] mb-1">24/7</div>
                <div className="text-sm text-[var(--color-text-tertiary)]">Available</div>
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
                    <div className="font-semibold">AI Assistant</div>
                    <div className="text-sm text-white/70 flex items-center gap-2">
                      <span className="w-2 h-2 bg-[var(--color-success-500)] rounded-full animate-pulse"></span>
                      Active Call
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium">
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
              ✓ 100% Secure
            </div>
            <div className="absolute -bottom-4 -left-4 bg-[var(--color-secondary-500)] text-white px-4 py-2 rounded-full font-semibold shadow-lg animate-pulse">
              🚀 Lightning Fast
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Our AI Agents?</h2>
            <p className="text-xl text-[var(--color-text-secondary)]">Built for trust, reliability, and scale</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[var(--color-surface-primary)] backdrop-blur-sm border border-[var(--color-border-primary)] p-8 rounded-2xl hover:border-[var(--color-primary-500)]/50 transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                🎯
              </div>
              <h3 className="text-2xl font-bold mb-3">Natural Conversations</h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                Our AI understands context, emotion, and intent - making every conversation feel natural and human-like.
              </p>
            </div>

            <div className="bg-[var(--color-surface-primary)] backdrop-blur-sm border border-[var(--color-border-primary)] p-8 rounded-2xl hover:border-[var(--color-secondary-500)]/50 transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-secondary-500)] to-[var(--color-secondary-600)] rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                ⚡
              </div>
              <h3 className="text-2xl font-bold mb-3">Instant Response</h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                Sub-500ms response times ensure your customers never wait. Handle thousands of calls simultaneously.
              </p>
            </div>

            <div className="bg-[var(--color-surface-primary)] backdrop-blur-sm border border-[var(--color-border-primary)] p-8 rounded-2xl hover:border-[var(--color-success-500)]/50 transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-success-500)] to-[var(--color-success-600)] rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                🔒
              </div>
              <h3 className="text-2xl font-bold mb-3">Enterprise Security</h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                Bank-level encryption, GDPR compliant, and SOC 2 certified. Your data is always protected.
              </p>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-32 text-center">
          <p className="text-[var(--color-text-tertiary)] mb-8">Trusted by leading companies worldwide</p>
          <div className="flex justify-center items-center gap-12 opacity-50">
            <div className="text-2xl font-bold">COMPANY</div>
            <div className="text-2xl font-bold">BRAND</div>
            <div className="text-2xl font-bold">CORP</div>
            <div className="text-2xl font-bold">ENTERPRISE</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border-primary)] bg-[var(--color-surface-primary)]/80 backdrop-blur-md mt-32">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-[var(--color-text-tertiary)]">
            <p>© 2025 AI Calling Agent. Built with Next.js & FastAPI • Enterprise-grade AI calling solution</p>
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