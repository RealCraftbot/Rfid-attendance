'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'motion/react';
import { ShieldCheck, Target, Users, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <main className="pt-32 pb-24">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl lg:text-7xl font-bold text-brand-navy tracking-tight mb-8">
              We are building the <span className="text-brand-blue">future</span> of organizational management.
            </h1>
            <p className="text-xl text-zinc-600 leading-relaxed">
              Craft Innovations Nigeria Limited is a technology firm dedicated to solving complex operational challenges through elegant hardware and software integration.
            </p>
          </motion.div>
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
                To empower institutions with secure, reliable, and automated systems that eliminate manual errors and provide actionable insights for growth.
              </p>
            </div>
            <div className="space-y-6">
              <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green">
                <Globe size={24} />
              </div>
              <h2 className="text-3xl font-bold text-brand-navy">Our Vision</h2>
              <p className="text-zinc-600 leading-relaxed">
                To be the leading provider of IoT-driven management solutions in Africa, fostering a culture of accountability and digital transformation.
              </p>
            </div>
          </div>
        </section>

        {/* Team/Values */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-brand-navy">Why Choose Us?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <ValueCard 
              icon={ShieldCheck}
              title="Security First"
              description="We believe security is not an afterthought. Our systems are built with cryptographic integrity at their core."
            />
            <ValueCard 
              icon={Users}
              title="User Centric"
              description="Our interfaces are designed for real people. We prioritize ease of use without sacrificing powerful functionality."
            />
            <ValueCard 
              icon={Globe}
              title="Scalable Solutions"
              description="Whether you are a small school or a multinational corporation, our platform grows with your needs."
            />
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
