'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, Phone, MapPin, Twitter, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-navy text-white pt-24 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-24">
        {/* Brand Column */}
        <div className="space-y-6">
          <Link href="/" className="flex flex-col gap-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                Craft<span className="text-brand-purple">Innovations</span>
              </span>
            </div>
            <p className="text-[8px] font-bold text-brand-purple/40 uppercase tracking-[0.2em] ml-10">Nigeria Limited</p>
          </Link>
          <p className="text-brand-purple/60 text-sm leading-relaxed max-w-xs">
            Enterprise-grade RFID attendance solutions designed for the next generation of educational and organizational management.
          </p>
          <div className="flex gap-4">
            <SocialLink icon={Twitter} href="#" />
            <SocialLink icon={Linkedin} href="#" />
            <SocialLink icon={Github} href="#" />
          </div>
        </div>

        {/* Product Column */}
        <div className="space-y-6">
          <h4 className="text-sm font-bold uppercase tracking-widest text-brand-green">Product</h4>
          <ul className="space-y-4">
            <FooterLink href="/#features">Features</FooterLink>
            <FooterLink href="/#pricing">Pricing</FooterLink>
            <FooterLink href="/#security">Security</FooterLink>
            <FooterLink href="/support">Support</FooterLink>
          </ul>
        </div>

        {/* Company Column */}
        <div className="space-y-6">
          <h4 className="text-sm font-bold uppercase tracking-widest text-brand-green">Company</h4>
          <ul className="space-y-4">
            <FooterLink href="/about">About Us</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
            <FooterLink href="/privacy">Privacy Policy</FooterLink>
            <FooterLink href="/terms">Terms of Service</FooterLink>
          </ul>
        </div>

        {/* Contact Column */}
        <div className="space-y-6">
          <h4 className="text-sm font-bold uppercase tracking-widest text-brand-green">Get in Touch</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-sm text-brand-purple/60">
              <MapPin size={18} className="text-brand-blue shrink-0" />
              <span>Lagos, Nigeria</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-brand-purple/60">
              <Mail size={18} className="text-brand-blue shrink-0" />
              <span>hello@craftinnovations.com</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-brand-purple/60">
              <Phone size={18} className="text-brand-blue shrink-0" />
              <span>+234 800 CRAFT</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-brand-purple/40 text-xs font-medium">
          © {currentYear} Craft Innovations Nigeria Limited. All rights reserved.
        </p>
        <div className="flex gap-8 text-xs font-medium text-brand-purple/40">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link 
        href={href} 
        className="text-sm text-brand-purple/60 hover:text-white transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}

function SocialLink({ icon: Icon, href }: { icon: any; href: string }) {
  return (
    <Link 
      href={href} 
      className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-brand-purple/60 hover:bg-brand-blue hover:text-white transition-all"
    >
      <Icon size={20} />
    </Link>
  );
}
