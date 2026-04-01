'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'motion/react';
import { ShieldCheck, Target, Users, Globe, MapPin } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <main className="pt-32 pb-24">
        {/* hero */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl lg:text-7xl font-bold text-brand-navy tracking-tight mb-8">
              We are building the <span className="text-brand-blue">future</span> of school management.
            </h1>
            <p className="text-xl text-zinc-600 leading-relaxed">
              Craftinnovations Nigeria Ltd is a technology firm dedicated to solving operational challenges in Nigerian schools through elegant hardware and software integration. Our flagship product, <strong>AttendIQ</strong>, is revolutionizing how schools track attendance.
            </p>
          </motion.div>
        </section>

        {/* Products */}
        <section className="bg-brand-navy text-white py-16 mb-24">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8">Our Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur rounded-xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold mb-4 text-brand-green">AttendIQ</h3>
                <p className="text-white/70">Complete RFID-based attendance management system for schools. Track students, staff, manage timetables, handle fees, and keep parents informed.</p>
                <a href="https://rfid.craftinnovations.ng" className="inline-block mt-4 text-brand-green hover:underline">rfid.craftinnovations.ng →</a>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold mb-4 text-brand-purple/60">More Coming Soon</h3>
                <p className="text-white/70">We are building more tools to help Nigerian schools operate more efficiently. Stay tuned for updates.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission/Vision */}
        <section className="bg-zinc-50 py-24 mb-24">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-6">
              <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue">
                <Target size={24} />
              </div>
              <h2 className="text-3xl font-bold text-brand-navy">Our Mission</h2>
              <p className="text-zinc-600 leading-relaxed">
                To empower Nigerian schools with secure, reliable, and automated attendance systems that eliminate manual errors and provide actionable insights for growth.
              </p>
            </div>
            <div className="space-y-6">
              <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green">
                <Globe size={24} />
              </div>
              <h2 className="text-3xl font-bold text-brand-navy">Our Vision</h2>
              <p className="text-zinc-600 leading-relaxed">
                To be the leading provider of IoT-driven school management solutions in Nigeria and across Africa, fostering digital transformation in education.
              </p>
            </div>
          </div>
        </section>

        {/* Team/Values */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-brand-navy">Why Choose AttendIQ?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <ValueCard 
              icon={ShieldCheck}
              title="Security First"
              description="We believe security is not an afterthought. Our systems are built with HMAC cryptographic integrity at their core."
            />
            <ValueCard 
              icon={Users}
              title="Made for Nigeria"
              description="Designed specifically for Nigerian schools with support for local requirements like NIN, local curricula, and parent SMS notifications."
            />
            <ValueCard 
              icon={MapPin}
              title="Local Support"
              description="Based in Lagos, we provide hands-on support to schools across Nigeria. Real people, real help."
            />
          </div>
        </section>

        {/* Contact Info */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="bg-zinc-50 rounded-2xl p-8 lg:p-12">
            <h2 className="text-2xl font-bold text-brand-navy mb-8">Get in Touch</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-bold text-brand-navy mb-2">Address</h4>
                <p className="text-zinc-600">6 Bintu Bolajoko Street, Hotel Busstop, LASU Road, Igando, Lagos, Nigeria</p>
              </div>
              <div>
                <h4 className="font-bold text-brand-navy mb-2">Website</h4>
                <a href="https://rfid.craftinnovations.ng" className="text-brand-blue hover:underline">rfid.craftinnovations.ng</a>
              </div>
              <div>
                <h4 className="font-bold text-brand-navy mb-2">Email</h4>
                <p className="text-zinc-600">rfid@craftinnovations.ng</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function ValueCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-brand-navy/5 rounded-full flex items-center justify-center text-brand-navy mx-auto">
        <Icon size={32} />
      </div>
      <h4 className="text-xl font-bold text-brand-navy">{title}</h4>
      <p className="text-zinc-500 leading-relaxed">{description}</p>
    </div>
  );
}
