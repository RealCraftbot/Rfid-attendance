'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <main className="pt-32 pb-24">
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-24">
          {/* Contact Info */}
          <div className="space-y-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-5xl lg:text-7xl font-bold text-brand-navy tracking-tight mb-8">
                Let&apos;s <span className="text-brand-blue">connect.</span>
              </h1>
              <p className="text-xl text-zinc-600 leading-relaxed">
                Have questions about our RFID solutions? Our team is here to help you find the perfect fit for your organization.
              </p>
            </motion.div>

            <div className="space-y-8">
              <ContactItem 
                icon={Mail}
                title="Email Us"
                value="rfid@craftinnovations.com"
                description="Our team responds within 24 hours."
              />
              <ContactItem 
                icon={Phone}
                title="Call Us"
                value="+234 800 ATTEND"
                description="Mon-Fri, 9am - 5pm WAT"
              />
              <ContactItem 
                icon={MapPin}
                title="Visit Us"
                value="6 Bintu Bolajoko Street, Hotel Busstop, LASU Road, Igando, Lagos"
                description="Headquarters & Innovation Lab"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-zinc-50 p-8 lg:p-12 rounded-[2rem] border border-zinc-200">
            {submitted ? (
              <div className="text-center py-12 space-y-6 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-bold text-brand-navy">Message Sent!</h2>
                <p className="text-zinc-500">Thank you for reaching out. We will get back to you shortly.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-brand-blue font-bold hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-brand-blue/10 transition-all text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Email Address</label>
                    <input 
                      type="email" 
                      required
                      className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-brand-blue/10 transition-all text-sm"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Subject</label>
                  <select className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-brand-blue/10 transition-all text-sm">
                    <option>General Inquiry</option>
                    <option>Sales & Pricing</option>
                    <option>Technical Support</option>
                    <option>Partnership</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Message</label>
                  <textarea 
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-brand-blue/10 transition-all text-sm resize-none"
                    placeholder="How can we help you?"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20 active:scale-[0.98]"
                >
                  Send Message
                  <Send size={18} />
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function ContactItem({ icon: Icon, title, value, description }: { icon: any; title: string; value: string; description: string }) {
  return (
    <div className="flex items-start gap-6">
      <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue shrink-0">
        <Icon size={24} />
      </div>
      <div>
        <h4 className="text-sm font-bold text-brand-navy uppercase tracking-widest mb-1">{title}</h4>
        <p className="text-xl font-bold text-brand-navy mb-1">{value}</p>
        <p className="text-sm text-zinc-500">{description}</p>
      </div>
    </div>
  );
}
