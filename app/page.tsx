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
  Globe,
  BookOpen,
  Settings,
  Bell,
  CreditCard,
  UserCheck,
  Clock,
  ChevronRight,
  Play
} from 'lucide-react';
import { motion } from 'motion/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth-context';

const steps = [
  {
    number: '01',
    title: 'Create Your Organization',
    description: 'Sign up and set up your school or organization. Add your school name, logo, and basic information.',
    icon: BookOpen,
    color: 'bg-blue-500'
  },
  {
    number: '02',
    title: 'Add Staff & Teachers',
    description: 'Invite your teachers and administrative staff. Assign roles and permissions to control access.',
    icon: UserCheck,
    color: 'bg-emerald-500'
  },
  {
    number: '03',
    title: 'Create Classrooms',
    description: 'Set up classrooms and assign class teachers. Organize students into their respective classes.',
    icon: Users,
    color: 'bg-purple-500'
  },
  {
    number: '04',
    title: 'Register Students',
    description: 'Add student records with RFID cards. Assign each student to their classroom.',
    icon: ShieldCheck,
    color: 'bg-amber-500'
  },
  {
    number: '05',
    title: 'Setup RFID Devices',
    description: 'Register and configure your RFID scanners. Each device gets a secure API key for authentication.',
    icon: Cpu,
    color: 'bg-rose-500'
  },
  {
    number: '06',
    title: 'Set Up Parents',
    description: 'Register parent accounts and link them to their children for real-time notifications.',
    icon: Bell,
    color: 'bg-cyan-500'
  }
];

const features = [
  {
    icon: ShieldCheck,
    title: 'Secure RFID Scanning',
    description: 'HMAC-signed attendance records ensure tamper-proof data from your RFID devices.'
  },
  {
    icon: Zap,
    title: 'Real-time Updates',
    description: 'Attendance is recorded instantly. Parents receive notifications the moment their child checks in or out.'
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track attendance trends, identify patterns, and generate comprehensive reports.'
  },
  {
    icon: Smartphone,
    title: 'Mobile Access',
    description: 'Monitor attendance from any device. Administrators and parents stay connected on-the-go.'
  },
  {
    icon: Lock,
    title: 'Role-based Access',
    description: 'Granular permissions for admins, teachers, bursars, and parents. Everyone sees what they need.'
  },
  {
    icon: Globe,
    title: 'Multi-branch Support',
    description: 'Manage multiple schools or branches from a single super-admin dashboard.'
  }
];

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
                Craftinnovations Nigeria Ltd
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-6xl lg:text-8xl font-bold text-brand-navy tracking-tight leading-[0.9] mb-8"
              >
                Smart Attendance <br />
                <span className="text-brand-blue italic">Made Simple.</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-zinc-600 leading-relaxed mb-10 max-w-2xl"
              >
                <strong>AttendIQ</strong> is a complete RFID-based attendance management system for Nigerian schools. Track students, staff, manage timetables, handle fees, and keep parents informed — all in one platform.
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
                  Trusted by <span className="text-brand-navy font-bold">200+</span> schools across Nigeria
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works - Step by Step */}
        <section id="how-it-works" className="py-24 bg-zinc-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-sm font-bold text-brand-blue uppercase tracking-widest mb-4">Get Started</h2>
              <h3 className="text-4xl font-bold text-brand-navy tracking-tight">6 Simple Steps to Set Up Your School</h3>
              <p className="text-zinc-500 mt-4">Follow this guide to get your attendance system up and running in minutes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 border border-zinc-200 hover:border-brand-blue/30 hover:shadow-xl hover:shadow-brand-blue/5 transition-all group"
                >
                  <div className="flex items-start gap-6">
                    <div className={`${step.color} w-14 h-14 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform`}>
                      <step.icon size={24} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{step.number}</span>
                      <h4 className="text-lg font-bold text-brand-navy mt-1 mb-3">{step.title}</h4>
                      <p className="text-sm text-zinc-500 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Link 
                href="/signup" 
                className="inline-flex items-center gap-2 bg-brand-blue text-white px-8 py-4 rounded-full font-bold hover:bg-brand-blue/90 transition-all shadow-xl shadow-brand-blue/20"
              >
                <Play size={20} />
                Start Setting Up Your School
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-sm font-bold text-brand-blue uppercase tracking-widest mb-4">Core Features</h2>
              <h3 className="text-4xl font-bold text-brand-navy tracking-tight">Everything your school needs.</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="p-8 rounded-2xl border border-zinc-200 hover:border-brand-blue/30 hover:shadow-xl hover:shadow-brand-blue/5 transition-all group"
                >
                  <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon size={24} />
                  </div>
                  <h4 className="text-xl font-bold text-brand-navy mb-4">{feature.title}</h4>
                  <p className="text-zinc-500 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* What's Included Section */}
        <section className="py-24 bg-brand-navy text-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-sm font-bold text-brand-green uppercase tracking-widest mb-4">Complete Platform</h2>
              <h3 className="text-4xl font-bold tracking-tight">Everything Included in AttendIQ</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Users, title: 'Student Management', desc: 'Track enrollment, assign RFID cards, manage class assignments' },
                { icon: UserCheck, title: 'Staff Management', desc: 'Teacher profiles, attendance tracking, schedule management' },
                { icon: Clock, title: 'Timetable Builder', desc: 'Create and manage class schedules with ease' },
                { icon: ShieldCheck, title: 'RFID Attendance', desc: 'Real-time check-in/check-out with hardware integration' },
                { icon: Bell, title: 'Parent Portal', desc: 'Link parents to students, instant notifications' },
                { icon: BarChart3, title: 'Reports & Analytics', desc: 'Attendance reports, trends, export to CSV/PDF' },
                { icon: CreditCard, title: 'Fees Management', desc: 'Invoice generation, payment tracking, receipts' },
                { icon: Globe, title: 'Multi-branch', desc: 'Manage multiple schools from one dashboard' }
              ].map((item, i) => (
                <div key={i} className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                  <item.icon className="w-8 h-8 text-brand-green mb-4" />
                  <h4 className="font-bold mb-2">{item.title}</h4>
                  <p className="text-sm text-white/60">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 bg-brand-blue text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-1/4" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
              <div className="text-center">
                <h3 className="text-5xl lg:text-6xl font-bold text-white mb-2">99.9%</h3>
                <p className="text-white/60 font-bold uppercase tracking-widest text-xs">System Uptime</p>
              </div>
              <div className="text-center">
                <h3 className="text-5xl lg:text-6xl font-bold text-white mb-2">500K+</h3>
                <p className="text-white/60 font-bold uppercase tracking-widest text-xs">Daily Scans</p>
              </div>
              <div className="text-center">
                <h3 className="text-5xl lg:text-6xl font-bold text-white mb-2">200+</h3>
                <p className="text-white/60 font-bold uppercase tracking-widest text-xs">Schools</p>
              </div>
              <div className="text-center">
                <h3 className="text-5xl lg:text-6xl font-bold text-white mb-2">&lt;2s</h3>
                <p className="text-white/60 font-bold uppercase tracking-widest text-xs">Sync Time</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-brand-blue rounded-[2rem] p-12 lg:p-20 text-white text-center relative overflow-hidden shadow-2xl shadow-brand-blue/40">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
              
              <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-4xl lg:text-6xl font-bold tracking-tight mb-8">Ready to modernize your school?</h2>
                <p className="text-xl text-white/80 mb-12">
                  Join 200+ Nigerian schools using AttendIQ to track attendance, manage students, and keep parents informed.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link 
                    href="/signup" 
                    className="bg-white text-brand-blue px-10 py-5 rounded-full font-bold text-lg hover:bg-zinc-100 transition-all active:scale-95 flex items-center gap-2"
                  >
                    Get Started Free
                    <ArrowRight size={20} />
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
