import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBolt, FaShieldAlt, FaUtensils, FaArrowRight } from 'react-icons/fa'

function SplashScreen() {
  const navigate = useNavigate()
  const { userData } = useSelector((state) => state.user)
  const [progress, setProgress] = useState(0)
  const [statusIndex, setStatusIndex] = useState(0)

  const statusMessages = [
    'Connecting to local gourmet kitchens...',
    'Syncing chef menus & exclusive offers...',
    'Calibrating rapid 30-min delivery...',
    'Welcome to Cravely',
  ]

  const handleComplete = () => {
    if (userData) {
      navigate('/home')
    } else {
      navigate('/landing')
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 45)

    const timer = setTimeout(() => {
      handleComplete()
    }, 2800)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [userData])

  // Sync status text with progress
  useEffect(() => {
    if (progress < 30) setStatusIndex(0)
    else if (progress < 65) setStatusIndex(1)
    else if (progress < 95) setStatusIndex(2)
    else setStatusIndex(3)
  }, [progress])

  return (
    <div 
      className="fixed inset-0 bg-[#0A090D] flex flex-col items-center justify-between py-10 px-6 overflow-hidden select-none"
      style={{ fontFamily: "'Poppins', 'Segoe UI', system-ui, sans-serif" }}
    >
      {/* 1. Subtle Architectural Concentric Rings (Zero Gradients, Minimal Tech Lines) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] rounded-full border border-white/[0.03] absolute" />
        <div className="w-[520px] h-[520px] sm:w-[740px] sm:h-[740px] rounded-full border border-white/[0.02] absolute" />
        <div className="w-[720px] h-[720px] sm:w-[1020px] sm:h-[1020px] rounded-full border border-white/[0.015] absolute" />
        {/* Subtle dot matrix grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* 2. Top Header Bar: Skip Button */}
      <div className="relative z-20 w-full max-w-5xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Live Kitchens Online
          </span>
        </div>

        <button
          onClick={handleComplete}
          className="px-4 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
        >
          <span>Skip</span>
          <FaArrowRight size={10} className="text-[#FF6B00]" />
        </button>
      </div>

      {/* 3. Center Brand Stage */}
      <div className="relative z-20 flex flex-col items-center text-center my-auto max-w-md w-full">
        {/* Emblem Squircle Card */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 16 }}
          className="relative mb-6"
        >
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#13121A] border border-white/10 shadow-2xl flex items-center justify-center relative overflow-hidden group">
            {/* Cloche & Wings Icon */}
            <motion.svg
              width="58"
              height="58"
              viewBox="0 0 72 72"
              fill="none"
              className="text-[#FF6B00]"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Delivery Speed Lines */}
              <path d="M8 26h10" stroke="#FF6B00" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M4 36h14" stroke="#FF6B00" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M8 46h10" stroke="#FF6B00" strokeWidth="3.5" strokeLinecap="round" />

              {/* Cloche Dome & Handle */}
              <circle cx="48" cy="18" r="3.5" fill="#FF6B00" />
              <path
                d="M24 44c0-12 10-20 24-20s24 8 24 20"
                stroke="#FF6B00"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Platter Base */}
              <path d="M20 50h48" stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" />
            </motion.svg>
          </div>
        </motion.div>

        {/* Wordmark */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl sm:text-5xl font-black text-white tracking-tight flex items-center justify-center"
        >
          <span>cravely</span>
          <span className="text-[#FF6B00] ml-0.5">.</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-2 text-xs sm:text-sm font-bold uppercase tracking-[0.28em] text-[#FF8C00]"
        >
          Crave it. We'll deliver it.
        </motion.p>

        {/* Progress & Live Loader */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-10 w-full max-w-xs space-y-3"
        >
          {/* Progress Bar Container */}
          <div className="relative h-2 w-full bg-[#13121A] border border-white/10 rounded-full overflow-hidden p-[1px]">
            <motion.div
              className="h-full bg-[#FF6B00] rounded-full transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Status Message & Percent */}
          <div className="flex items-center justify-between text-xs px-1">
            <div className="h-4 relative flex-1 text-left">
              <AnimatePresence mode="wait">
                <motion.p
                  key={statusIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="text-gray-400 text-[11px] font-medium truncate"
                >
                  {statusMessages[statusIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
            <span className="text-white/60 font-mono text-[11px] font-bold ml-2">
              {Math.min(100, Math.round(progress))}%
            </span>
          </div>
        </motion.div>
      </div>

      {/* 4. Bottom Feature Badges Strip (Solid Clean Boxes, Zero Gradients) */}
      <div className="relative z-20 w-full max-w-xl flex items-center justify-center gap-2 sm:gap-4 flex-wrap text-center">
        <div className="px-3.5 py-1.5 rounded-xl bg-[#13121A] border border-white/[0.08] flex items-center gap-1.5">
          <FaBolt size={10} className="text-[#FF6B00]" />
          <span className="text-[11px] font-bold text-gray-300">30-Min Fast Delivery</span>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-[#13121A] border border-white/[0.08] flex items-center gap-1.5">
          <FaShieldAlt size={10} className="text-emerald-400" />
          <span className="text-[11px] font-bold text-gray-300">Verified Kitchens</span>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-[#13121A] border border-white/[0.08] flex items-center gap-1.5">
          <FaUtensils size={10} className="text-amber-400" />
          <span className="text-[11px] font-bold text-gray-300">Artisan Menus</span>
        </div>
      </div>
    </div>
  )
}

export default SplashScreen
