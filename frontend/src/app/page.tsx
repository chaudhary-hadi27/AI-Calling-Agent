"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Phone, ArrowRight, CheckCircle, TrendingUp, Clock, Users, Shield,
  Zap, BarChart3, Code2, Globe, Lock, Activity, ChevronRight, Play,
  Cpu, Database, MessageSquare, HeadphonesIcon
} from 'lucide-react';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('calls');
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    activeCalls: 1247,
    responseTime: 342,
    successRate: 97.8,
    satisfaction: 4.8
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animate stats
  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setStats(prev => ({
        activeCalls: 1200 + Math.floor(Math.random() * 100),
        responseTime: 320 + Math.floor(Math.random() * 50),
        successRate: 97 + Math.random() * 2,
        satisfaction: 4.6 + Math.random() * 0.4
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [mounted]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              {/*
                CUSTOM LOGO: Replace the div below with your logo
                Example: <Image src="/logo.png" alt="Smartkode" width={36} height={36} />
              */}
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-slate-900">Smartkode</span>
                <span className="text-xs font-medium text-slate-500">AI Calling</span>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#platform" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Platform
              </Link>
              <Link href="#solutions" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Solutions
              </Link>
              <Link href="#developers" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Developers
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Pricing
              </Link>
              <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Dashboard
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2">
                Sign in
              </Link>
              <Link href="/register" className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full mb-6">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-sm font-medium text-blue-900">Now serving 500+ enterprise customers</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 tracking-tight leading-[1.1]">
              Voice AI for
              <br />
              <span className="text-blue-600">enterprise scale</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Deploy intelligent voice agents that handle millions of customer conversations with human-like precision. Built for reliability, designed for compliance.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/register" className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-sm">
                Start free trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="#demo" className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-900 font-semibold rounded-lg border border-slate-300 transition-colors">
                <Play className="w-4 h-4" />
                Watch demo
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>SOC 2 certified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>GDPR compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>99.99% uptime</span>
              </div>
            </div>
          </div>

          {/* Product Screenshot - Dashboard Preview */}
          <div className="max-w-6xl mx-auto">
            <div className="relative">
              {/* Subtle background glow */}
              <div className="absolute -inset-4 bg-blue-50 rounded-2xl blur-3xl opacity-30" />

              {/* Main Dashboard */}
              <div className="relative bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden">
                {/* Dashboard Header */}
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-slate-600" />
                        <span className="font-semibold text-slate-900">Live Dashboard</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs font-medium text-green-900">All systems operational</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4" />
                      {mounted ? 'Live' : 'Loading'}
                    </div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="w-4 h-4 text-slate-600" />
                        <span className="text-xs font-medium text-slate-600">Active Calls</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900">
                        {mounted ? stats.activeCalls.toLocaleString() : '1,247'}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                        <TrendingUp className="w-3 h-3" />
                        <span>+12% vs last hour</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-slate-600" />
                        <span className="text-xs font-medium text-slate-600">Avg Response</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900">
                        {mounted ? Math.round(stats.responseTime) : '342'}ms
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                        <TrendingUp className="w-3 h-3" />
                        <span>-8% improvement</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-slate-600" />
                        <span className="text-xs font-medium text-slate-600">Success Rate</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900">
                        {mounted ? stats.successRate.toFixed(1) : '97.8'}%
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-slate-600">
                        <span>Industry leading</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-slate-600" />
                        <span className="text-xs font-medium text-slate-600">CSAT Score</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900">
                        {mounted ? stats.satisfaction.toFixed(1) : '4.8'}/5
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                        <TrendingUp className="w-3 h-3" />
                        <span>+0.3 this month</span>
                      </div>
                    </div>
                  </div>

                  {/* Chart Visualization */}
                  <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-slate-900">Call Volume (Last 24 Hours)</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveTab('calls')}
                          className={`px-3 py-1 text-xs font-medium rounded ${
                            activeTab === 'calls'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-slate-600 border border-slate-200'
                          }`}
                        >
                          Calls
                        </button>
                        <button
                          onClick={() => setActiveTab('sentiment')}
                          className={`px-3 py-1 text-xs font-medium rounded ${
                            activeTab === 'sentiment'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-slate-600 border border-slate-200'
                          }`}
                        >
                          Sentiment
                        </button>
                      </div>
                    </div>

                    {/* Simple Bar Chart */}
                    <div className="flex items-end justify-between h-40 gap-2">
                      {mounted && [...Array(24)].map((_, i) => {
                        const height = 30 + Math.random() * 70;
                        return (
                          <div key={i} className="flex-1 flex flex-col justify-end">
                            <div
                              className="bg-blue-600 rounded-t transition-all hover:bg-blue-700 cursor-pointer"
                              style={{ height: `${height}%` }}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                      <span>00:00</span>
                      <span>06:00</span>
                      <span>12:00</span>
                      <span>18:00</span>
                      <span>24:00</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Footer */}
                <div className="bg-slate-50 border-t border-slate-200 px-6 py-3">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Last updated: {mounted ? 'Just now' : 'Loading...'}</span>
                    <button className="flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700">
                      View full analytics
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Customer Logos */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-slate-600 mb-8">
            Trusted by leading enterprises worldwide
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center opacity-50">
            {['Acme Corp', 'TechFlow', 'GlobalCom', 'DataSync', 'CloudBase'].map((company, i) => (
              <div key={i} className="text-center">
                <div className="text-xl font-bold text-slate-400">{company}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-slate-900 mb-2">10M+</div>
              <div className="text-sm text-slate-600">Calls processed monthly</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-slate-900 mb-2">99.99%</div>
              <div className="text-sm text-slate-600">Guaranteed uptime SLA</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-slate-900 mb-2">&lt;500ms</div>
              <div className="text-sm text-slate-600">Average response time</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-slate-900 mb-2">500+</div>
              <div className="text-sm text-slate-600">Enterprise customers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="platform" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Built for enterprise scale
            </h2>
            <p className="text-xl text-slate-600">
              Production-ready infrastructure with enterprise-grade security, compliance, and reliability built in from day one.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Lightning fast",
                description: "Sub-500ms response times with global edge infrastructure. Handle 10,000+ concurrent calls without breaking a sweat.",
                stats: "99.99% uptime"
              },
              {
                icon: Shield,
                title: "Enterprise security",
                description: "SOC 2 Type II certified with end-to-end encryption. GDPR, HIPAA, and CCPA compliant out of the box.",
                stats: "Bank-level encryption"
              },
              {
                icon: BarChart3,
                title: "Real-time analytics",
                description: "Comprehensive dashboards with live metrics, call transcripts, and sentiment analysis for actionable insights.",
                stats: "Live monitoring"
              },
              {
                icon: Code2,
                title: "Developer first",
                description: "RESTful APIs, WebSocket events, and comprehensive SDKs. Get started in minutes with detailed documentation.",
                stats: "5min integration"
              },
              {
                icon: Globe,
                title: "Global infrastructure",
                description: "Multi-region deployment across 6 continents with automatic failover and edge computing for optimal performance.",
                stats: "6 regions"
              },
              {
                icon: MessageSquare,
                title: "Natural conversations",
                description: "Advanced NLP with context awareness and emotion detection for human-like interactions that your customers will love.",
                stats: "98% accuracy"
              },
            ].map((feature, i) => (
              <div key={i} className="group">
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg border border-blue-100">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 mb-3 leading-relaxed">
                  {feature.description}
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs font-medium text-slate-700">{feature.stats}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Code Example */}
      <section id="developers" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full mb-6">
                <Code2 className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Developer API</span>
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Simple, powerful API
              </h2>
              <p className="text-xl text-slate-600 mb-6">
                Integrate voice AI into your application in minutes with our RESTful API and comprehensive SDKs.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Full REST API with webhook support',
                  'Real-time WebSocket events',
                  'SDKs for Python, Node.js, Go, Ruby',
                  'Comprehensive documentation',
                  'Sandbox environment included'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                View documentation
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
                <div className="bg-slate-800 px-4 py-3 flex items-center gap-2 border-b border-slate-700">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-sm text-slate-400 ml-2">api.smartkode.ai</span>
                </div>
                <div className="p-6 font-mono text-sm">
                  <div className="text-green-400">POST</div>
                  <div className="text-slate-400 mt-1">/v1/calls/create</div>
                  <div className="text-slate-500 mt-4">{'{'}</div>
                  <div className="ml-4">
                    <div className="text-blue-400">"phone"<span className="text-slate-500">:</span> <span className="text-yellow-400">"+1234567890"</span>,</div>
                    <div className="text-blue-400">"agent_id"<span className="text-slate-500">:</span> <span className="text-yellow-400">"agent_123"</span>,</div>
                    <div className="text-blue-400">"context"<span className="text-slate-500">:</span> <span className="text-slate-500">{'{'}</span></div>
                    <div className="ml-4">
                      <div className="text-blue-400">"customer_name"<span className="text-slate-500">:</span> <span className="text-yellow-400">"John"</span>,</div>
                      <div className="text-blue-400">"order_id"<span className="text-slate-500">:</span> <span className="text-yellow-400">"ORD-4782"</span></div>
                    </div>
                    <div className="text-slate-500">{'}'}</div>
                  </div>
                  <div className="text-slate-500">{'}'}</div>

                  <div className="mt-6 text-slate-600">// Response</div>
                  <div className="text-slate-500 mt-2">{'{'}</div>
                  <div className="ml-4">
                    <div className="text-blue-400">"call_id"<span className="text-slate-500">:</span> <span className="text-yellow-400">"call_xyz"</span>,</div>
                    <div className="text-blue-400">"status"<span className="text-slate-500">:</span> <span className="text-yellow-400">"initiated"</span>,</div>
                    <div className="text-blue-400">"webhook_url"<span className="text-slate-500">:</span> <span className="text-yellow-400">"..."</span></div>
                  </div>
                  <div className="text-slate-500">{'}'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Security & compliance first
            </h2>
            <p className="text-xl text-slate-600">
              Enterprise-grade security with comprehensive compliance certifications. Your data is protected by industry-leading standards.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
              { name: "SOC 2 Type II", icon: "🔒" },
              { name: "GDPR Compliant", icon: "🇪🇺" },
              { name: "HIPAA Ready", icon: "🏥" },
              { name: "ISO 27001", icon: "✓" },
            ].map((cert, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
                <div className="text-3xl mb-3">{cert.icon}</div>
                <div className="font-semibold text-slate-900">{cert.name}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Lock, title: "End-to-end encryption", desc: "AES-256 encryption for all data in transit and at rest" },
              { icon: Shield, title: "Zero-trust architecture", desc: "Multi-layered security with continuous verification" },
              { icon: Database, title: "Data residency", desc: "Store data in your preferred region for compliance" },
            ].map((item, i) => (
              <div key={i}>
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-50 rounded-lg border border-slate-200">
                    <item.icon className="w-6 h-6 text-slate-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-slate-300 mb-10">
            Join hundreds of enterprises using Smartkode to transform customer communications.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
              Start free trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-colors">
              Contact sales
            </Link>
          </div>
          <p className="text-sm text-slate-400 mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                {/*
                  CUSTOM LOGO: Replace with your logo
                  Example: <Image src="/logo.png" alt="Smartkode" width={32} height={32} />
                */}
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="font-semibold text-slate-900">Smartkode</span>
              </Link>
              <p className="text-sm text-slate-600 max-w-sm">
                Enterprise AI calling platform for modern businesses. Built for scale, designed for compliance.
              </p>
            </div>

            {[
              {
                title: "Product",
                links: [
                  { name: "Features", href: "#platform" },
                  { name: "Pricing", href: "#pricing" },
                  { name: "API", href: "#developers" },
                  { name: "Documentation", href: "/docs" },
                  { name: "Changelog", href: "/changelog" }
                ]
              },
              {
                title: "Company",
                links: [
                  { name: "About", href: "/about" },
                  { name: "Blog", href: "/blog" },
                  { name: "Careers", href: "/careers" },
                  { name: "Press", href: "/press" },
                  { name: "Contact", href: "/contact" }
                ]
              },
              {
                title: "Legal",
                links: [
                  { name: "Privacy", href: "/privacy" },
                  { name: "Terms", href: "/terms" },
                  { name: "Security", href: "/security" },
                  { name: "Compliance", href: "/compliance" },
                  { name: "DPA", href: "/dpa" }
                ]
              },
            ].map((col, i) => (
              <div key={i}>
                <h3 className="font-semibold text-slate-900 mb-4">{col.title}</h3>
                <ul className="space-y-3">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <Link href={link.href} className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              © 2025 Smartkode, Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/status" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                Status
              </Link>
              <Link href="/support" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                Support
              </Link>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                Twitter
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}