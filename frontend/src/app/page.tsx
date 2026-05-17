'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Leaf, TrendingUp, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-neutral-950">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-green-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/20 blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <div className="z-10 container mx-auto px-4 flex flex-col items-center text-center mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 mb-8 text-sm font-medium"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          AgriFlow Beta is Live
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
        >
          Digital Agriculture <br className="hidden md:block" />
          <span className="gradient-text">Intelligence & Commerce</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-neutral-400 max-w-2xl mb-10"
        >
          Empowering farmers and buyers through AI-driven disease detection, precise yield forecasting, and a transparent, real-time marketplace.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Link href="/auth/signup" className="group relative inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-neutral-950 font-bold py-3 px-8 rounded-full transition-all duration-300 overflow-hidden">
            <span className="relative z-10">Get Started</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
          </Link>
          <Link href="/dashboard/market" className="inline-flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-3 px-8 rounded-full border border-neutral-700 transition-colors">
            Explore Market
          </Link>
        </motion.div>
      </div>

      {/* Features Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        className="z-10 container mx-auto px-4 mt-32 mb-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Leaf, title: "AI Disease Diagnosis", desc: "Instantly detect crop diseases from photos using our advanced Deep Learning models." },
            { icon: TrendingUp, title: "Yield Analytics", desc: "Data-driven historical analytics and future crop yield predictions tailored to your region." },
            { icon: ShieldCheck, title: "Secure Marketplace", desc: "Direct farmer-to-buyer transactions with secure Razorpay integration and real-time alerts." }
          ].map((feature, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl hover:bg-white/5 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-neutral-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </main>
  );
}
