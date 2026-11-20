import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

function SplashScreen() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)
  const [statusIndex, setStatusIndex] = useState(0)

  const statusMessages = [
    'Preparing experience...',
    'Loading deliciousness...',
    'Almost ready...',
    'Ready to serve',
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 1.6
      })
    }, 45)

    const timer = setTimeout(() => {
      navigate('/landing')
    }, 4500)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [navigate])

  // Sync status text with progress
  useEffect(() => {
    if (progress < 30) setStatusIndex(0)
    else if (progress < 65) setStatusIndex(1)
    else if (progress < 95) setStatusIndex(2)
    else setStatusIndex(3)
  }, [progress])

  // Food items with richer motion
  const foods = [
    {
      src: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop',
      className: 'w-32 h-32 sm:w-40 sm:h-40 -top-4 left-2 sm:left-12',
      y: [0, -26, 0],
      x: [0, 8, 0],
      rotate: [-8, 4, -8],
      delay: 0.15,
    },
    {
      src: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop',
      className: 'w-28 h-28 sm:w-36 sm:h-36 -top-2 right-2 sm:right-14',
      y: [0, 22, 0],
      x: [0, -6, 0],
      rotate: [6, 14, 6],
      delay: 0.3,
    },
    {
      src: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a7?w=400&h=400&fit=crop',
      className: 'w-32 h-32 sm:w-40 sm:h-40 bottom-28 -right-2 sm:right-8',
      y: [0, -20, 0],
      x: [0, -10, 0],
      rotate: [4, -7, 4],
      delay: 0.45,
    },
    {
      src: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&h=300&fit=crop',
      className: 'w-24 h-24 sm:w-28 sm:h-28 bottom-36 left-2 sm:left-10',
      y: [0, 16, 0],
      x: [0, 7, 0],
      rotate: [-5, 8, -5],
      delay: 0.6,
    },
  ]

  const floaters = [
    { emoji: '🌶️', className: 'top-[28%] left-6 sm:left-20 text-2xl', delay: 0.4 },
    { emoji: '🍃', className: 'top-[22%] right-10 sm:right-28 text-xl', delay: 0.7 },
    { emoji: '🍅', className: 'top-[48%] right-5 sm:right-16 text-2xl', delay: 1.0 },
    { emoji: '🌿', className: 'bottom-[38%] left-10 sm:left-24 text-lg', delay: 1.2 },
    { emoji: '✨', className: 'top-[38%] left-[18%] text-sm', delay: 0.9 },
    { emoji: '✨', className: 'bottom-[42%] right-[22%] text-sm', delay: 1.4 },
  ]

  return (
    <div className="fixed inset-0 bg-[#050505] flex items-center justify-center overflow-hidden">
      
      {/* Animated soft radial glows */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full bg-orange-600/[0.08] blur-[150px]"
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-[30%] left-[20%] w-[300px] h-[300px] rounded-full bg-orange-500/[0.05] blur-[100px]"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[25%] right-[15%] w-[280px] h-[280px] rounded-full bg-amber-500/[0.04] blur-[90px]"
          animate={{ x: [0, -25, 0], y: [0, 15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Large subtle watermark with gentle pulse */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <motion.span
          className="text-[26rem] sm:text-[34rem] font-black text-white/[0.025] leading-none tracking-tighter"
          animate={{ opacity: [0.02, 0.035, 0.02], scale: [1, 1.02, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          C
        </motion.span>
      </div>

      {/* Floating Food Cards */}
      {foods.map((item, i) => (
        <motion.div
          key={i}
          className={`absolute ${item.className} rounded-2xl overflow-hidden z-10`}
          initial={{ opacity: 0, scale: 0.65, y: 40 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: item.y,
            x: item.x,
            rotate: item.rotate,
          }}
          transition={{
            opacity: { duration: 1, delay: item.delay },
            scale: { duration: 1, delay: item.delay, type: 'spring', stiffness: 140, damping: 14 },
            y: { duration: 5.8 + i * 0.35, repeat: Infinity, ease: 'easeInOut' },
            x: { duration: 6.2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 5.8 + i * 0.35, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.06)',
          }}
        >
          <img
            src={item.src}
            alt="food"
            className="w-full h-full object-cover"
            draggable={false}
          />
          {/* soft gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none" />
        </motion.div>
      ))}

      {/* Small floating elements */}
      {floaters.map((item, i) => (
        <motion.span
          key={i}
          className={`absolute ${item.className} z-10 select-none`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0.4, 0.9, 0.4],
            y: [0, -20, 0],
            rotate: [0, 14, -10, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 4.8 + i * 0.4,
            repeat: Infinity,
            delay: item.delay,
            ease: 'easeInOut',
          }}
        >
          {item.emoji}
        </motion.span>
      ))}

      {/* Rising particles (more organic) */}
      {[...Array(18)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${6 + Math.random() * 88}%`,
            bottom: `${Math.random() * 15}%`,
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            background:
              i % 3 === 0
                ? 'rgba(249, 115, 22, 0.85)'
                : i % 3 === 1
                ? 'rgba(251, 146, 60, 0.7)'
                : 'rgba(253, 186, 116, 0.6)',
          }}
          animate={{
            y: [0, -140 - Math.random() * 90],
            opacity: [0, 0.8, 0],
            scale: [0.4, 1.3, 0.2],
            x: [0, (Math.random() - 0.5) * 40],
          }}
          transition={{
            duration: 3.8 + Math.random() * 2.8,
            repeat: Infinity,
            delay: Math.random() * 3.5,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* ================= CENTER CONTENT ================= */}
      <div className="relative z-20 flex flex-col items-center text-center px-6">
        
        {/* Logo Icon with breathing glow */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 170, damping: 15, delay: 0.15 }}
          className="mb-6"
        >
          <div className="relative">
            {/* soft pulsing glow */}
            <motion.div
              className="absolute inset-0 blur-2xl bg-orange-500/35 rounded-full scale-[1.8]"
              animate={{ opacity: [0.35, 0.55, 0.35], scale: [1.7, 1.9, 1.7] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            
            <motion.svg
              width="72"
              height="72"
              viewBox="0 0 72 72"
              fill="none"
              className="relative drop-shadow-[0_6px_24px_rgba(249,115,22,0.5)]"
              animate={{ rotate: [0, 2, -2, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Speed lines */}
              <path d="M6 26h12" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M4 36h14" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M6 46h12" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />
              
              {/* Cloche */}
              <path
                d="M22 44c0-12 10-20 26-20s26 8 26 20"
                stroke="#f97316"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path d="M20 50h52" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
              <circle cx="48" cy="16" r="3.2" fill="#f97316" />
            </motion.svg>
          </div>
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.75 }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white"
        >
          cravely
          <motion.span
            className="text-orange-500"
            animate={{ opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            .
          </motion.span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.65 }}
          className="mt-3 text-orange-400/90 text-[15px] sm:text-base font-medium tracking-wide"
        >
          Crave it. We'll deliver it.
        </motion.p>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.65 }}
          className="mt-16 w-60 sm:w-72"
        >
          {/* Track */}
          <div className="relative h-[3px] w-full bg-white/[0.08] rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-600 via-orange-400 to-amber-300 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.08 }}
            />
            {/* glowing tip */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-orange-300 shadow-[0_0_12px_4px_rgba(249,115,22,0.6)]"
              style={{ left: `calc(${progress}% - 6px)` }}
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Status text with fade */}
          <div className="mt-5 h-5 relative">
            <AnimatePresence mode="wait">
              <motion.p
                key={statusIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 text-white/45 text-sm tracking-wide font-medium"
              >
                {statusMessages[statusIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default SplashScreen