import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// Helper component to reveal text word-by-word
function MaskedText({ text, className, delay = 0 }) {
  const words = text.split(" ");

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: { y: "110%", opacity: 0 },
    visible: {
      y: "0%",
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: [0.33, 1, 0.68, 1], // Custom smooth ease
      },
    },
  };

  return (
    <motion.div
      className={`flex flex-wrap ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, i) => (
        <span key={i} className="overflow-hidden inline-block mr-[0.25em] py-1">
          <motion.span variants={wordVariants} className="inline-block">
            {word}
          </motion.span>
        </span>
      ))}
    </motion.div>
  );
}

export default function Home() {
  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: (customDelay = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: customDelay,
        ease: [0.33, 1, 0.68, 1],
      },
    }),
  };

  // Configuration array for floating background bubbles
  const bubbles = [
    { size: "w-24 h-24", pos: "left-[10%] bottom-[-20px]", duration: 12, delay: 0 },
    { size: "w-16 h-16", pos: "left-[25%] bottom-[-20px]", duration: 10, delay: 2 },
    { size: "w-32 h-32", pos: "left-[45%] bottom-[-20px]", duration: 16, delay: 4 },
    { size: "w-20 h-20", pos: "left-[65%] bottom-[-20px]", duration: 11, delay: 1 },
    { size: "w-28 h-28", pos: "left-[80%] bottom-[-20px]", duration: 14, delay: 3 },
    { size: "w-12 h-12", pos: "left-[90%] bottom-[-20px]", duration: 8, delay: 5 },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Animated Hero Wrapper Container (Middle Section Only) */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-900/40 bg-slate-950 p-8 sm:p-12 lg:p-16 shadow-2xl min-h-[calc(100vh-6rem)] flex items-center">
        
        {/* 1. Dynamic Floating Animated Bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {bubbles.map((b, idx) => (
            <motion.div
              key={idx}
              className={`absolute rounded-full bg-gradient-to-t from-blue-500/20 to-cyan-400/10 border border-blue-400/20 backdrop-blur-[2px] shadow-[0_0_15px_rgba(59,130,246,0.2)] ${b.size} ${b.pos}`}
              animate={{
                y: ["0vh", "-110vh"],
                x: [0, 15, -15, 0],
                opacity: [0, 0.7, 0.7, 0],
                scale: [0.8, 1.1, 0.9, 1],
              }}
              transition={{
                duration: b.duration,
                repeat: Infinity,
                delay: b.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* 2. Animated Radial Glow Orbs */}
        <div 
          className="pointer-events-none absolute -top-24 -left-20 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl animate-pulse" 
          style={{ animationDuration: '6s' }} 
        />
        <div 
          className="pointer-events-none absolute -bottom-20 right-10 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl animate-pulse" 
          style={{ animationDuration: '8s' }} 
        />

        {/* 3. Cyber Dot-Grid Texture Overlay */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-20 z-0" 
          style={{
            backgroundImage: `radial-gradient(rgba(59, 130, 246, 0.4) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }} 
        />

        {/* Main Hero Content Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full relative z-10">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Badge */}
            <motion.div
              custom={0.1}
              variants={fadeUpVariant}
              initial="hidden"
              animate="visible"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-wider uppercase shadow-sm shadow-blue-500/10">
                RENT ANYTHING. YOUR WAY.
              </span>
            </motion.div>

            {/* Headline Reveal */}
            <div className="text-4xl sm:text-5xl lg:text-6xl font-serif leading-tight tracking-tight text-white">
              <MaskedText text="Great gear should feel like a" delay={0.2} />
              <div className="overflow-hidden inline-block py-1">
                <motion.span
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.6,
                    ease: [0.33, 1, 0.68, 1],
                  }}
                  className="inline-block italic font-normal text-blue-400 font-serif underline decoration-blue-500/40 decoration-2"
                >
                  shared event.
                </motion.span>
              </div>
            </div>

            {/* Subtitle Reveal */}
            <MaskedText
              text="Thoughtful rentals, verified listings, and fast local pickups from community members near you."
              className="text-slate-300 text-base sm:text-lg max-w-xl font-normal leading-relaxed"
              delay={0.8}
            />

            {/* Call to Action Buttons */}
            <motion.div
              custom={1.2}
              variants={fadeUpVariant}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-4 pt-2"
            >
              <Link
                to="/browse"
                className="px-7 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Explore listings
              </Link>
              <Link
                to="/register"
                className="px-7 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white font-semibold text-sm hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Create account
              </Link>
            </motion.div>

            {/* Features Bar */}
            <motion.div
              custom={1.4}
              variants={fadeUpVariant}
              initial="hidden"
              animate="visible"
              className="pt-6 border-t border-slate-800/80 flex flex-wrap gap-6 text-xs text-slate-400 font-medium"
            >
              <span className="flex items-center gap-2">★ 4.9 Community Rating</span>
              <span className="text-slate-700">•</span>
              <span>Verified Identity Checks</span>
              <span className="text-slate-700">•</span>
              <span>Instant Local Pickups</span>
            </motion.div>

          </div>

          {/* Right Floating Badge Card */}
          <motion.div
            custom={1.0}
            variants={fadeUpVariant}
            initial="hidden"
            animate="visible"
            className="lg:col-span-5 flex justify-center"
          >
            <div className="group w-72 h-72 sm:w-80 sm:h-80 rounded-full border border-slate-800/80 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center relative shadow-2xl transition-all duration-500 hover:scale-105 hover:border-blue-800/60">
              
              {/* Subtle hover gradient glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="text-5xl sm:text-6xl mb-4 group-hover:scale-110 transition-transform duration-300"
              >
                📦
              </motion.div>
              <h3 className="text-2xl font-serif italic font-semibold text-white mb-2">
                Rent It Local
              </h3>
              <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed">
                Save money, reduce waste, and access top-tier tools on demand.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}