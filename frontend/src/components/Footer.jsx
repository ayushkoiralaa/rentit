import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, ExternalLink, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-zinc-950 border-t border-zinc-900 text-zinc-400 pt-14 pb-8 select-none">
      
      {/* 1. Animated Ambient Light Beams */}
      <div 
        className="pointer-events-none absolute -bottom-20 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] animate-pulse" 
        style={{ animationDuration: '7s' }} 
      />
      <div 
        className="pointer-events-none absolute top-0 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] animate-pulse" 
        style={{ animationDuration: '9s' }} 
      />

      {/* 2. Top Glowing Accent Border */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10">
          
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md shadow-blue-600/30">
                R
              </div>
              <span className="text-xl font-bold text-white font-serif italic tracking-wide">
                RentIt
              </span>
            </div>

            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
              Borrow what you need for a day, list what's sitting idle. Simple, safe, and close to home.
            </p>

            {/* Live Support Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800/80 text-xs text-zinc-300 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Available 24/7 for rental support.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-4 text-blue-400">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              {[
                { name: "Browse Items", path: "/browse" },
                { name: "About Us", path: "/about" },
                { name: "Help & Support", path: "/help" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="group inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors duration-200"
                  >
                    <span>{link.name}</span>
                    <ExternalLink size={12} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-blue-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details Box */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-4 text-blue-400">
              Contact Us
            </h4>

            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-zinc-300">
                <Phone size={14} className="text-blue-400 shrink-0" />
                <span className="font-mono text-[11px]">9827036905 / 9743852583</span>
              </div>

              <div className="flex items-start gap-2.5 text-zinc-300">
                <Mail size={14} className="text-blue-400 shrink-0 mt-0.5" />
                <div className="flex flex-col font-mono text-[11px] truncate">
                  <a href="mailto:namsanyz18m@gmail.com" className="hover:text-white transition-colors">namsanyz18m@gmail.com</a>
                  <a href="mailto:support_rentit@gmail.com" className="hover:text-white transition-colors">support_rentit@gmail.com</a>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-zinc-400 pt-2 border-t border-zinc-800/60">
                <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                <span className="text-[11px]">Verified Community Security</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-4 border-t border-zinc-900 text-xs text-zinc-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>© 2026 RentIt — All Rights Reserved.</span>
          <div className="flex gap-6">
            <Link to="/legal/privacy" className="hover:text-zinc-300 transition-colors">Privacy</Link>
            <Link to="/legal/terms" className="hover:text-zinc-300 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}