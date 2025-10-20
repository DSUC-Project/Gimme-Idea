"use client"

import Link from "next/link"
import { useState } from "react"

export default function HomePage() {
  return (
    <div className="relative min-h-screen gradient-purple overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large circle top left */}
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full border-2 border-white/20" />

        {/* Glowing orb top right */}
        <div className="absolute top-10 right-20 w-32 h-32 rounded-full bg-white/30 blur-3xl animate-[float_6s_ease-in-out_infinite]" />

        {/* Small crosses */}
        <div className="absolute top-1/4 left-1/4 text-white/30 text-4xl rotate-45">+</div>
        <div className="absolute top-2/3 right-1/4 text-white/30 text-5xl rotate-12">+</div>
        <div className="absolute bottom-20 left-1/3 text-white/30 text-3xl -rotate-12">+</div>

        {/* Curved lines */}
        <svg className="absolute top-0 right-0 w-1/2 h-full opacity-20" viewBox="0 0 400 800">
          <path d="M 400 100 Q 300 200 350 400 Q 400 600 300 800" stroke="white" strokeWidth="2" fill="none"/>
        </svg>
        <svg className="absolute bottom-0 left-0 w-1/2 h-full opacity-20" viewBox="0 0 400 800">
          <path d="M 0 700 Q 100 600 50 400 Q 0 200 100 0" stroke="white" strokeWidth="2" fill="none"/>
        </svg>

        {/* Dots pattern */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute flex gap-2" style={{
            top: `${20 + i * 15}%`,
            left: `${10 + i * 20}%`,
          }}>
            {[...Array(3)].map((_, j) => (
              <div key={j} className="w-1.5 h-1.5 rounded-full bg-white/40" />
            ))}
          </div>
        ))}
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 glassmorphism rounded-3xl max-w-7xl mx-auto my-12 p-12 md:p-16 min-h-[calc(100vh-6rem)] flex flex-col">
        {/* Header Navigation */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl border-2 border-white/40 flex items-center justify-center">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <span className="text-white font-semibold text-lg">GIMME IDEA</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-white font-medium">
            <Link href="/" className="hover:text-white/80 transition-colors">HOME</Link>
            <Link href="/browse" className="hover:text-white/80 transition-colors">BROWSE</Link>
            <Link href="/login" className="hover:text-white/80 transition-colors">LOGIN</Link>
          </nav>

          <button className="md:hidden text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
            GIMME IDEA
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-4 font-light max-w-2xl">
            Share Your Projects, Get Valuable Feedback
          </p>
          <p className="text-base md:text-lg text-white/70 mb-12 max-w-3xl px-4">
            Connect with builders and reviewers. Upload your projects, receive quality feedback,
            and earn rewards in our decentralized feedback marketplace.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/register"
              className="px-10 py-4 bg-white/90 text-purple-600 rounded-full font-semibold text-lg hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              GET STARTED
            </Link>
            <Link
              href="/browse"
              className="px-10 py-4 bg-white/20 text-white rounded-full font-semibold text-lg hover:bg-white/30 transition-all duration-300 border-2 border-white/40"
            >
              EXPLORE PROJECTS
            </Link>
          </div>
        </div>

        {/* Bottom decorative dots */}
        <div className="flex justify-center gap-2 mt-12">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${i === 3 ? 'bg-white' : 'bg-white/40'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
