'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <main className="pt-32 pb-24">
        <section className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold text-brand-navy tracking-tight mb-4">Privacy Policy</h1>
            <p className="text-zinc-500 font-medium">Last Updated: March 2024</p>
          </div>

          <div className="prose prose-zinc max-w-none space-y-12">
            <PrivacySection 
              icon={ShieldCheck}
              title="1. Information We Collect"
              content="We collect information that you provide directly to us when you create an account, register a student, or communicate with us. This includes names, email addresses, organization details, and RFID tag identifiers. We also collect automated data such as scan times, device locations, and system logs to provide our services."
            />
            <PrivacySection 
              icon={Eye}
              title="2. How We Use Your Information"
              content="We use the information we collect to provide, maintain, and improve our services, including processing attendance records, sending notifications, and providing technical support. We also use data for security purposes, such as verifying device authenticity and preventing unauthorized access."
            />
            <PrivacySection 
              icon={Lock}
              title="3. Data Security"
              content="We implement robust security measures to protect your data, including end-to-end encryption for data in transit and at rest. Our hardware integration uses cryptographic HMAC signing to ensure the integrity of every attendance record. Access to sensitive data is restricted to authorized personnel through role-based access control."
            />
            <PrivacySection 
              icon={FileText}
              title="4. Data Sharing & Disclosure"
              content="We do not sell your personal information to third parties. We may share information with service providers who perform functions on our behalf, or when required by law to comply with legal processes or protect the rights and safety of our users and the public."
            />
            <PrivacySection 
              icon={ShieldCheck}
              title="5. Your Choices & Rights"
              content="You have the right to access, update, or delete your personal information at any time through your dashboard. You can also contact our support team for assistance with data portability or to exercise your right to be forgotten in accordance with applicable data protection laws."
            />
          </div>

          <div className="mt-24 p-12 bg-zinc-50 border border-zinc-200 rounded-[2rem] text-center">
            <h3 className="text-2xl font-bold text-brand-navy mb-4">Questions about our privacy practices?</h3>
            <p className="text-zinc-500 mb-8 max-w-xl mx-auto">
              If you have any questions or concerns about how we handle your data, please contact our Data Protection Officer.
            </p>
            <a 
              href="mailto:privacy@craftinnovations.com" 
              className="bg-brand-blue text-white px-8 py-4 rounded-full font-bold inline-flex items-center gap-2 hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20"
            >
              Contact Privacy Team
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function PrivacySection({ icon: Icon, title, content }: { icon: any; title: string; content: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center text-brand-blue">
          <Icon size={20} />
        </div>
        <h2 className="text-2xl font-bold text-brand-navy">{title}</h2>
      </div>
      <p className="text-zinc-600 leading-relaxed pl-14">
        {content}
      </p>
    </div>
  );
}
