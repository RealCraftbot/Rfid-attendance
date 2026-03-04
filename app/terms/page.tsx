'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileText, ShieldCheck, Scale, AlertCircle } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <main className="pt-32 pb-24">
        <section className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold text-brand-navy tracking-tight mb-4">Terms of Service</h1>
            <p className="text-zinc-500 font-medium">Last Updated: March 2024</p>
          </div>

          <div className="prose prose-zinc max-w-none space-y-12">
            <TermsSection 
              icon={FileText}
              title="1. Acceptance of Terms"
              content="By accessing or using the Craft Innovations RFID SaaS platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site."
            />
            <TermsSection 
              icon={ShieldCheck}
              title="2. Use License"
              content="Permission is granted to temporarily use the materials (information or software) on Craft Innovations' website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not modify or copy the materials."
            />
            <TermsSection 
              icon={Scale}
              title="3. Disclaimer"
              content="The materials on Craft Innovations' website are provided on an 'as is' basis. Craft Innovations makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights."
            />
            <TermsSection 
              icon={AlertCircle}
              title="4. Limitations"
              content="In no event shall Craft Innovations or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Craft Innovations' website, even if Craft Innovations or a Craft Innovations authorized representative has been notified orally or in writing of the possibility of such damage."
            />
            <TermsSection 
              icon={FileText}
              title="5. Governing Law"
              content="These terms and conditions are governed by and construed in accordance with the laws of Nigeria and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location."
            />
          </div>

          <div className="mt-24 p-12 bg-zinc-50 border border-zinc-200 rounded-[2rem] text-center">
            <h3 className="text-2xl font-bold text-brand-navy mb-4">Need clarification on our terms?</h3>
            <p className="text-zinc-500 mb-8 max-w-xl mx-auto">
              Our legal team is available to discuss any specific requirements or questions you may have regarding our service agreement.
            </p>
            <a 
              href="mailto:legal@craftinnovations.com" 
              className="bg-brand-blue text-white px-8 py-4 rounded-full font-bold inline-flex items-center gap-2 hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20"
            >
              Contact Legal Team
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function TermsSection({ icon: Icon, title, content }: { icon: any; title: string; content: string }) {
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
