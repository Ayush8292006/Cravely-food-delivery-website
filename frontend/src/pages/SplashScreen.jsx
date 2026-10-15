import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

function SplashScreen() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)

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

  // Food items with refined positions & motion
  const foods = [
    {
      src: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop',
      className: 'w-32 h-32 sm:w-40 sm:h-40 -top-4 left-2 sm:left-12',
      y: [0, -22, 0],
      rotate: [-6, 2, -6],
      delay: 0.1,
    },
    {
      src: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop',
      className: 'w-28 h-28 sm:w-36 sm:h-36 -top-2 right-2 sm:right-14',
      y: [0, 18, 0],
      rotate: [5, 11, 5],
      delay: 0.25,
    },
    {
      src: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a7?w=400&h=400&fit=crop',
      className: 'w-32 h-32 sm:w-40 sm:h-40 bottom-28 -right-2 sm:right-8',
      y: [0, -16, 0],
      rotate: [3, -5, 3],
      delay: 0.4,
    },
    {
      src: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&h=300&fit=crop',
      className: 'w-24 h-24 sm:w-28 sm:h-28 bottom-36 left-2 sm:left-10',
      y: [0, 14, 0],
      rotate: [-4, 6, -4],
      delay: 0.55,
    },
  ]

  const floaters = [
    { emoji: '🌶️', className: 'top-[28%] left-6 sm:left-20 text-2xl', delay: 0.3 },
    { emoji: '🍃', className: 'top-[22%] right-10 sm:right-28 text-xl', delay: 0.6 },
    { emoji: '🍅', className: 'top-[48%] right-5 sm:right-16 text-2xl', delay: 0.9 },
    { emoji: '🌿', className: 'bottom-[38%] left-10 sm:left-24 text-lg', delay: 1.1 },
  ]

  return (
    <div className="fixed inset-0 bg-[#050505] flex items-center justify-center overflow-hidden">
      
      {/* Soft radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-orange-600/[0.07] blur-[140px]" />
      </div>

      {/* Large subtle watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[26rem] sm:text-[34rem] font-black text-white/[0.025] leading-none tracking-tighter">
          C
        </span>
      </div>

      {/* Floating Food Cards */}
      {foods.map((item, i) => (
        <motion.div
          key={i}
          className={`absolute ${item.className} rounded-2xl overflow-hidden z-10`}
          initial={{ opacity: 0, scale: 0.7, y: 30 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: item.y,
            rotate: item.rotate,
          }}
          transition={{
            opacity: { duration: 0.9, delay: item.delay },
            scale: { duration: 0.9, delay: item.delay, type: 'spring', stiffness: 120 },
            y: { duration: 5.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 5.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
          }}
        >
          <img
            src={item.src}
            alt="food"
            className="w-full h-full object-cover"
            draggable={false}
          />
          {/* subtle inner border */}
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
            opacity: [0.45, 0.85, 0.45],
            y: [0, -18, 0],
            rotate: [0, 12, -8, 0],
            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: 4.5 + i * 0.5,
            repeat: Infinity,
            delay: item.delay,
            ease: 'easeInOut',
          }}
        >
          {item.emoji}
        </motion.span>
      ))}

      {/* Rising particles */}
      {[...Array(14)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-orange-500/80"
          style={{
            left: `${8 + Math.random() * 84}%`,
            bottom: `${Math.random() * 20}%`,
          }}
          animate={{
            y: [0, -120 - Math.random() * 80],
            opacity: [0, 0.7, 0],
            scale: [0.5, 1.4, 0],
          }}
          transition={{
            duration: 3.5 + Math.random() * 2.5,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* ================= CENTER CONTENT ================= */}
      <div className="relative z-20 flex flex-col items-center text-center px-6">
        
        {/* Logo Icon */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.2 }}
          className="mb-5"
        >
          <div className="relative">
            {/* soft glow behind icon */}
            <div className="absolute inset-0 blur-xl bg-orange-500/30 rounded-full scale-150" />
            
            <svg
              width="68"
              height="68"
              viewBox="0 0 72 72"
              fill="none"
              className="relative drop-shadow-[0_4px_20px_rgba(249,115,22,0.45)]"
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
            </svg>
          </div>
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white"
        >
          cravely<span className="text-orange-500">.</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="mt-3 text-orange-500/90 text-[15px] sm:text-base font-medium tracking-wide"
        >
          Crave it. We'll deliver it.
        </motion.p>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.6 }}
          className="mt-16 w-60 sm:w-72"
        >
          {/* Track */}
          <div className="h-[3px] w-full bg-white/[0.08] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.08 }}
            />
          </div>

          {/* Status text */}
          <p className="mt-5 text-white/40 text-sm tracking-wide font-medium">
            {progress < 30 && 'Preparing experience...'}
            {progress >= 30 && progress < 65 && 'Loading deliciousness...'}
            {progress >= 65 && progress < 95 && 'Almost ready...'}
            {progress >= 95 && 'Ready to serve'}
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default SplashScreen