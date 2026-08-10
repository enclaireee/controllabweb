"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative bg-bg text-text-body min-h-screen pt-28 pb-16 px-6 md:px-12 flex flex-col justify-between overflow-hidden">
      
      {/* Background Image / Overlay Alat Lab */}
      <div 
        className="absolute inset-0 z-0 opacity-15 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: "url('/images/lab-instrument-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-transparent z-0 pointer-events-none" />

      {/* Hero Body Content */}
      <div className="relative z-10 max-w-(--container-content) mx-auto w-full my-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Kolom Teks Utama */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 space-y-6"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-highlight animate-pulse" />
            <span className="text-meta text-highlight font-mono uppercase tracking-wider">
              Laboratorium Kontrol & Otomasi
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-display font-bold text-text leading-tight tracking-tight">
            Advancing Excellence in Control Systems, Signal Processing & Digital Simulation.
          </h1>

          <p className="text-sm md:text-base text-text-muted max-w-xl">
            Pusat kegiatan praktikum, analisis sinyal, dan eksperimen sistem kontrol berbasis perangkat keras serta simulasi interaktif.
          </p>

          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              href="/materi"
              className="border border-border bg-surface/50 hover:border-accent text-text px-6 py-3 rounded-button font-medium text-sm transition-all flex items-center gap-2 group"
            >
              <span>Learn More</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
            <Link
              href="/about#contacts"
              className="border border-border bg-surface/50 hover:border-accent text-text px-6 py-3 rounded-button font-medium text-sm transition-all flex items-center gap-2 group"
            >
              <span>Contacts</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>
        </motion.div>

        {/* Kolom Visual / Foto Tim Asisten (Seperti di Slide 2) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 relative"
        >
          <div className="relative border border-border rounded-card overflow-hidden bg-surface shadow-2xl group">
            <img 
              src="/images/assistants-photo.jpg" 
              alt="Tim Asisten Laboratorium" 
              className="w-full h-[380px] object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-4 left-4 right-4 p-4 bg-surface/90 backdrop-blur-md rounded-button border border-border">
              <p className="text-meta font-mono text-highlight">TIM ASISTEN 2025/2026</p>
              <p className="text-sm font-bold text-text">Laboratorium Kontrol & Otomasi</p>
            </div>
          </div>
        </motion.div>

      </div>

      {/* News Release Bar (Pita Bawah) */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative z-10 max-w-(--container-content) mx-auto w-full pt-8 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-meta text-accent font-mono">NEWS RELEASE</span>
            <span className="text-meta text-text-muted">06/26/2026</span>
          </div>
          <p className="text-sm font-semibold text-text hover:text-highlight cursor-pointer transition-colors">
            We're Recruiting New Assistants!
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-meta text-accent font-mono">EVENT RELEASE</span>
            <span className="text-meta text-text-muted">05/23/2026</span>
          </div>
          <p className="text-sm font-semibold text-text hover:text-highlight cursor-pointer transition-colors">
            Open House & Lab Tour 2026
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-meta text-accent font-mono">NEWS RELEASE</span>
            <span className="text-meta text-text-muted">05/17/2026</span>
          </div>
          <p className="text-sm font-semibold text-text hover:text-highlight cursor-pointer transition-colors">
            Modul Baru Simulasi Root Locus & PID Released!
          </p>
        </div>
      </motion.div>

    </section>
  );
}
