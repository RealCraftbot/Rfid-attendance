'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Search, 
  BookOpen, 
  MessageSquare, 
  Cpu, 
  ShieldCheck, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <main className="pt-32 pb-24">
        {/* Search Header */}
        <section className="bg-brand-navy py-24 mb-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-blue/10 skew-x-12 translate-x-1/4" />
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-white tracking-tight mb-8">How can we help?</h1>
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-purple/40" size={24} />
              <input 
                type="text" 
                placeholder="Search for hardware setup, API docs, or troubleshooting..."
                className="w-full pl-16 pr-8 py-5 bg-white/10 border border-white/10 rounded-2xl text-white placeholder:text-brand-purple/40 outline-none focus:ring-2 ring-brand-blue/50 transition-all backdrop-blur-sm"
              />
            </div>
          </div>
        </section>

        {/* Support Categories */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SupportCategory 
              icon={BookOpen}
              title="Documentation"
              description="Detailed guides on setting up your organization, managing students, and exporting reports."
              href="#"
            />
            <SupportCategory 
              icon={Cpu}
              title="Hardware Setup"
              description="Step-by-step instructions for configuring ESP32 and Arduino RFID readers with our platform."
              href="#"
            />
            <SupportCategory 
              icon={ShieldCheck}
              title="Security & API"
              description="Learn about HMAC signing, API keys, and how to securely integrate your own devices."
              href="#"
            />
          </div>
        </section>

        {/* FAQs */}
        <section className="max-w-3xl mx-auto px-6 mb-24">
          <h2 className="text-3xl font-bold text-brand-navy text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <FAQItem 
              question="How do I register a new RFID device?"
              answer="Navigate to the Devices section in your dashboard, click 'Add Device', and follow the prompts to generate a unique Device ID and Secret Key for your hardware."
            />
            <FAQItem 
              question="What hardware is compatible?"
              answer="Our platform is optimized for ESP32 and Arduino boards using RC522 or PN532 RFID modules. We provide standard libraries for secure communication."
            />
            <FAQItem 
              question="Can I export attendance data?"
              answer="Yes, you can export data in CSV or PDF format from the Attendance section. Super-admins can also access global reports."
            />
            <FAQItem 
              question="Is my data secure?"
              answer="Absolutely. We use industry-standard encryption for data at rest and in transit, plus cryptographic signing for all hardware communication."
            />
          </div>
        </section>

        {/* Still need help? */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="bg-brand-blue/5 rounded-[2rem] p-12 flex flex-col lg:flex-row items-center justify-between gap-8 border border-brand-blue/10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-brand-blue rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-blue/20">
                <MessageSquare size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-brand-navy">Still need help?</h3>
                <p className="text-zinc-500">Our support engineers are ready to assist you with any technical issues.</p>
              </div>
            </div>
            <Link 
              href="/contact" 
              className="bg-brand-blue text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-brand-blue/90 transition-all active:scale-95 shadow-lg shadow-brand-blue/20"
            >
              Contact Support
              <ArrowRight size={20} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function SupportCategory({ icon: Icon, title, description, href }: { icon: any; title: string; description: string; href: string }) {
  return (
    <Link href={href} className="group p-8 bg-white border border-zinc-200 rounded-2xl hover:border-brand-blue/30 hover:shadow-xl hover:shadow-brand-blue/5 transition-all">
      <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue mb-6 group-hover:scale-110 transition-transform">
        <Icon size={24} />
      </div>
      <h4 className="text-xl font-bold text-brand-navy mb-4">{title}</h4>
      <p className="text-zinc-500 text-sm leading-relaxed mb-6">{description}</p>
      <div className="flex items-center gap-2 text-brand-blue font-bold text-sm">
        Learn more <ArrowRight size={16} />
      </div>
    </Link>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-2xl">
      <h4 className="text-lg font-bold text-brand-navy mb-2 flex items-center gap-3">
        <HelpCircle size={20} className="text-brand-blue shrink-0" />
        {question}
      </h4>
      <p className="text-zinc-600 text-sm leading-relaxed pl-8">{answer}</p>
    </div>
  );
}
