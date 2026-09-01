import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  Calendar, 
  KeyRound, 
  ShieldCheck, 
  PlusCircle, 
  CheckCircle2, 
  Wallet, 
  HelpCircle,
  ChevronDown,
  Mail,
  AlertTriangle,
  ArrowRight
} from "lucide-react";

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState("renter");
  const [openFaq, setOpenFaq] = useState(null);

  const renterSteps = [
    {
      icon: <Search className="w-6 h-6 text-blue-400" />,
      title: "1. Discover & Choose",
      description: "Search local listings for tools, electronics, or vehicles near you with verified community ratings."
    },
    {
      icon: <Calendar className="w-6 h-6 text-indigo-400" />,
      title: "2. Request Booking",
      description: "Pick your rental dates. Our automated system calculates transparent daily rates and security deposits."
    },
    {
      icon: <KeyRound className="w-6 h-6 text-cyan-400" />,
      title: "3. Fast Pickup & Return",
      description: "Coordinate instant local pickup with the owner, complete your task, and return the item hassle-free."
    }
  ];

  const lenderSteps = [
    {
      icon: <PlusCircle className="w-6 h-6 text-blue-400" />,
      title: "1. List Your Gear",
      description: "Upload photos, set your daily price, and establish custom security deposit requirements in minutes."
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-indigo-400" />,
      title: "2. Approve Requests",
      description: "Review renter profiles, verified identity badges, and rental duration before confirming bookings."
    },
    {
      icon: <Wallet className="w-6 h-6 text-emerald-400" />,
      title: "3. Earn & Grow",
      description: "Receive direct payments safely while putting idle equipment, gear, and tools back to work."
    }
  ];

  const faqs = [
    {
      q: "How does Trust & Safety work on RentIt?",
      a: "Every transaction uses server-calculated pricing and optional security deposits set by the owner. Counterparts rate each other after every rental to keep the community safe."
    },
    {
      q: "What should I do if an item is damaged or delayed?",
      a: "Security deposits cover damages and late returns. Our support team steps in immediately with verification logs if a dispute arises."
    },
    {
      q: "How do I report fake listings or improper behavior?",
      a: "Use the flag icon on any listing page to instantly notify our security moderators. Reports are processed within 2 hours."
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10 relative overflow-hidden select-none">
      
      {/* 1. Ambient Background Glowing Orbs */}
      <div className="pointer-events-none absolute -top-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="pointer-events-none absolute bottom-10 left-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />

      <div className="max-w-5xl mx-auto space-y-12 relative z-10">
        
        {/* Header Title Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <ShieldCheck size={14} />
            <span>Transparent & Secure Peer-to-Peer Rentals</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            How RentIt Works
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Borrow equipment for a day or earn income from unused items sitting in your garage.
          </p>
        </div>

        {/* Tab Toggle (Renting vs Listing) */}
        <div className="flex justify-center">
          <div className="flex p-1.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl backdrop-blur-md">
            <button
              onClick={() => setActiveTab("renter")}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === "renter"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              For Renters
            </button>
            <button
              onClick={() => setActiveTab("lender")}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === "lender"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              For Lenders
            </button>
          </div>
        </div>

        {/* Workflow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(activeTab === "renter" ? renterSteps : lenderSteps).map((step, idx) => (
            <div
              key={idx}
              className="group relative p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/10"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                {step.icon}
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{step.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Safety & Help Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          {/* Safety Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/30 border border-zinc-800/80 space-y-3">
            <div className="flex items-center gap-2.5 text-amber-400">
              <AlertTriangle size={18} />
              <h3 className="text-sm font-bold text-white">Trust & Safety Protections</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every booking features identity verification checks and automated safety logs. Flag any suspicious listing or behavior directly to our moderation team.
            </p>
          </div>

          {/* Contact Support Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/30 border border-zinc-800/80 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-blue-400">
                <Mail size={18} />
                <h3 className="text-sm font-bold text-white">Need Personal Support?</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Have questions about custom security deposits or commercial listings? Reach out directly.
              </p>
            </div>
            <a
              href="mailto:support_rentit@gmail.com"
              className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 pt-2 transition-colors"
            >
              <span>Contact Support Team</span>
              <ArrowRight size={14} />
            </a>
          </div>

        </div>

        {/* Interactive FAQ Accordion */}
        <div className="space-y-4 pt-4 border-t border-zinc-900">
          <h2 className="text-lg font-bold text-white text-center flex items-center justify-center gap-2">
            <HelpCircle size={18} className="text-blue-400" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-2xl bg-zinc-900/40 border border-zinc-800/80 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-4 text-left text-xs font-bold text-zinc-200 flex items-center justify-between hover:bg-zinc-900/60 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-zinc-500 transition-transform duration-200 ${
                      openFaq === index ? "rotate-180 text-blue-400" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/40 pt-3 bg-zinc-950/40">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-zinc-900 border border-blue-500/30 text-center space-y-4">
          <h3 className="text-lg font-bold text-white">Ready to get started?</h3>
          <div className="flex justify-center gap-4">
            <Link
              to="/browse"
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Explore Listings
            </Link>
            <Link
              to="/dashboard/listings/new"
              className="px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Post an Item
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}