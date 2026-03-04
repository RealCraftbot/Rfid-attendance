'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Cookie, ShieldCheck, Eye, Settings } from 'lucide-react';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <main className="pt-32 pb-24">
        <section className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold text-brand-navy tracking-tight mb-4">Cookie Policy</h1>
            <p className="text-zinc-500 font-medium">Last Updated: March 2024</p>
          </div>

          <div className="prose prose-zinc max-w-none space-y-12">
            <CookieSection 
              icon={Cookie}
              title="1. What are Cookies?"
              content="Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site."
            />
            <CookieSection 
              icon={ShieldCheck}
              title="2. How We Use Cookies"
              content="We use cookies for several reasons. Some cookies are required for technical reasons in order for our website to operate, and we refer to these as 'essential' or 'strictly necessary' cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties."
            />
            <CookieSection 
              icon={Eye}
              title="3. Types of Cookies We Use"
              content="We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our website to operate, and we refer to these as 'essential' or 'strictly necessary' cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties."
            />
            <CookieSection 
              icon={Settings}
              title="4. How Can I Control Cookies?"
              content="You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted."
            />
          </div>

          <div className="mt-24 p-12 bg-zinc-50 border border-zinc-200 rounded-[2rem] text-center">
            <h3 className="text-2xl font-bold text-brand-navy mb-4">Manage your preferences</h3>
            <p className="text-zinc-500 mb-8 max-w-xl mx-auto">
              You can adjust your cookie settings at any time to ensure you are comfortable with how we use your data.
            </p>
            <button 
              className="bg-brand-blue text-white px-8 py-4 rounded-full font-bold inline-flex items-center gap-2 hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20"
            >
              Adjust Cookie Settings
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function CookieSection({ icon: Icon, title, content }: { icon: any; title: string; content: string }) {
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
