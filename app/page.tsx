'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Cpu, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Lock, 
  BarChart3,
  Smartphone,
  Globe
} from 'lucide-react';
import { motion } from 'motion/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth-context';

export default function LandingPage() {
  const { user, role } = useAuth();

  const dashboardHref = role === 'SUPER_ADMIN' ? '/super-admin' : '/dashboard';

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-brand-blue selection:text-white">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-blue/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-green/5 rounded-full blur-[120px]" />
          </div>

          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-xs font-bold uppercase tracking-widest mb-6"
              >
                <Zap size={14} />
                Next-Gen Attendance Tracking
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-6xl lg:text-8xl font-bold text-brand-navy tracking-tight leading-[0.9] mb-8"
              >
                Secure Attendance <br />
                <span className="text-brand-blue italic">Simplified.</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-zinc-600 leading-relaxed mb-10 max-w-2xl"
              >
                Enterprise-grade RFID attendance management for schools and organizations. Real-time tracking, secure device authentication, and instant analytics.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                {user ? (
                  <Link 
                    href={dashboardHref}
                    className="bg-brand-navy text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-brand-navy/90 transition-all shadow-xl shadow-brand-navy/20 active:scale-95"
                  >
                    Go to Dashboard
                    <ArrowRight size={20} />
                  </Link>
                ) : (
                  <>
                    <Link 
                      href="/signup" 
                      className="bg-brand-blue text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-brand-blue/90 transition-all shadow-xl shadow-brand-blue/20 active:scale-95"
                    >
                      Start Free Trial
                      <ArrowRight size={20} />
                    </Link>
                    <Link 
                      href="/contact" 
                      className="bg-white text-brand-navy border border-zinc-200 px-8 py-4 rounded-full font-bold hover:bg-zinc-50 transition-all active:scale-95"
                    >
                      Book a Demo
                    </Link>
                  </>
                )}
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="mt-16 flex items-center gap-8"
              >
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-zinc-100 overflow-hidden relative">
                      <Image 
                        src={`https://picsum.photos/seed/user${i}/100/100`} 
                        alt="User" 
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-zinc-500 font-medium">
                  Trusted by <span className="text-brand-navy font-bold">500+</span> organizations across Nigeria
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-zinc-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-sm font-bold text-brand-blue uppercase tracking-widest mb-4">Core Features</h2>
              <h3 className="text-4xl font-bold text-brand-navy tracking-tight">Everything you need to manage attendance at scale.</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={ShieldCheck}
                title="HMAC Security"
                description="Device-level cryptographic signing ensures that every attendance record is authentic and untampered."
              />
              <FeatureCard 
                icon={Zap}
                title="Real-time Sync"
                description="Attendance data is synced instantly from hardware devices to your dashboard with sub-second latency."
              />
              <FeatureCard 
                icon={BarChart3}
                title="Advanced Analytics"
                description="Gain deep insights into attendance patterns, absenteeism trends, and organizational efficiency."
              />
              <FeatureCard 
                icon={Smartphone}
                title="Mobile Ready"
                description="Access your dashboard and receive instant notifications on any device, anywhere in the world."
              />
              <FeatureCard 
                icon={Lock}
                title="Role-based Access"
                description="Granular permissions ensure that only authorized personnel can access sensitive student or staff data."
              />
              <FeatureCard 
                icon={Globe}
                title="Multi-tenant"
                description="Manage multiple branches or schools from a single unified super-administrator interface."
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 bg-brand-navy text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-blue/10 skew-x-12 translate-x-1/4" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
              <StatItem value="99.9%" label="System Uptime" />
              <StatItem value="1M+" label="Daily Scans" />
              <StatItem value="500+" label="Organizations" />
              <StatItem value="10ms" label="Average Latency" />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-brand-blue rounded-[2rem] p-12 lg:p-20 text-white text-center relative overflow-hidden shadow-2xl shadow-brand-blue/40">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
              
              <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-4xl lg:text-6xl font-bold tracking-tight mb-8">Ready to modernize your attendance system?</h2>
                <p className="text-xl text-white/80 mb-12">
                  Join the growing list of schools and companies that trust Craft Innovations for their attendance management.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link 
                    href="/signup" 
                    className="bg-white text-brand-blue px-10 py-5 rounded-full font-bold text-lg hover:bg-zinc-100 transition-all active:scale-95"
                  >
                    Get Started Now
                  </Link>
                  <Link 
                    href="/contact" 
                    className="bg-brand-navy text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-brand-navy/90 transition-all active:scale-95"
                  >
                    Contact Sales
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-zinc-200 hover:border-brand-blue/30 hover:shadow-xl hover:shadow-brand-blue/5 transition-all group">
      <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue mb-6 group-hover:scale-110 transition-transform">
        <Icon size={24} />
      </div>
      <h4 className="text-xl font-bold text-brand-navy mb-4">{title}</h4>
      <p className="text-zinc-500 leading-relaxed">{description}</p>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <h3 className="text-5xl lg:text-6xl font-bold text-brand-green mb-2">{value}</h3>
      <p className="text-brand-purple/60 font-bold uppercase tracking-widest text-xs">{label}</p>
    </div>
  );
}
