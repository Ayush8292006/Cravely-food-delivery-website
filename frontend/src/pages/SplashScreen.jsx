import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
    FaUtensils, FaUtensilSpoon, FaStar, FaCrown,
    FaBolt, FaShieldAlt, FaAward, FaHeart
} from 'react-icons/fa'
import { MdVerified } from 'react-icons/md'

function SplashScreen() {
    const navigate = useNavigate()
    const [progress, setProgress] = useState(0)
    const [currentEmoji, setCurrentEmoji] = useState(0)
    const emojis = ['🍕', '🍔', '🌮', '🍣', '🥗', '🍰']

    useEffect(() => {
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval)
                    return 100
                }
                return prev + 3
            })
        }, 50)

        const emojiInterval = setInterval(() => {
            setCurrentEmoji(prev => (prev + 1) % emojis.length)
        }, 400)

        const timer = setTimeout(() => {
            navigate('/landing')
        }, 3500)

        return () => {
            clearTimeout(timer)
            clearInterval(progressInterval)
            clearInterval(emojiInterval)
        }
    }, [navigate])

    return (
        <div className='fixed inset-0 bg-[#0a0a0f] flex items-center justify-center overflow-hidden'>
            
            {/* Background Orbs */}
            <div className='absolute inset-0'>
                <div className='absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0f0a18] to-[#1a0808]' />
                <motion.div 
                    animate={{ x: [0, 200, -100, 0], y: [0, -100, 150, 0], scale: [1, 1.3, 0.8, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className='absolute -top-1/4 -left-1/4 w-[900px] h-[900px] bg-[#ff2d55]/10 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ x: [0, -180, 120, 0], y: [0, 120, -80, 0], scale: [1, 0.8, 1.3, 1] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className='absolute -bottom-1/4 -right-1/4 w-[900px] h-[900px] bg-[#ff6b35]/10 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#ffd93d]/6 rounded-full blur-3xl'
                />

                {/* Floating Particles */}
                <div className='absolute inset-0 pointer-events-none'>
                    {[...Array(30)].map((_, i) => {
                        const colors = ['#ff2d55', '#ff6b35', '#ffd93d', '#4facfe', '#a18cd1']
                        return (
                            <motion.div
                                key={i}
                                className='absolute rounded-full'
                                animate={{
                                    y: ['110%', '-10%'],
                                    x: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
                                    opacity: [0, 0.8, 0],
                                    scale: [0, Math.random() * 2 + 0.5, 0]
                                }}
                                transition={{
                                    duration: 10 + Math.random() * 15,
                                    repeat: Infinity,
                                    delay: Math.random() * 8,
                                    ease: "linear"
                                }}
                                style={{
                                    left: Math.random() * 100 + '%',
                                    width: Math.random() * 8 + 2 + 'px',
                                    height: Math.random() * 8 + 2 + 'px',
                                    background: `radial-gradient(circle, ${colors[i % colors.length]}, transparent)`
                                }}
                            />
                        )
                    })}
                </div>

                {/* Grid Pattern */}
                <div className='absolute inset-0 opacity-[0.03]' style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px'
                }} />
            </div>

            {/* Main Content */}
            <div className='relative z-10 w-full max-w-5xl mx-auto px-4 flex flex-col items-center justify-center min-h-screen py-8'>
                
                {/* Big Emoji */}
                <motion.div
                    initial={{ scale: 0, opacity: 0, y: -50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                    className='text-6xl sm:text-7xl md:text-8xl mb-2'
                >
                    <motion.span
                        key={emojis[currentEmoji]}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 400 }}
                    >
                        {emojis[currentEmoji]}
                    </motion.span>
                </motion.div>

                {/* Logo */}
                <motion.div 
                    initial={{ scale: 0, rotate: -180, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                    className='relative mb-4'
                >
                    <div className='relative'>
                        <motion.div 
                            className='absolute -inset-12 rounded-full bg-gradient-to-r from-[#ff2d55]/30 to-[#ff6b35]/30 blur-3xl'
                            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />
                        
                        <motion.div 
                            className='relative w-40 h-40 sm:w-52 sm:h-52 rounded-3xl bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center shadow-2xl shadow-[#ff2d55]/50 border border-white/15'
                            animate={{ rotateY: [0, 12, -12, 0], rotateX: [0, 6, -6, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <motion.div 
                                className='absolute inset-[-6px] rounded-3xl border-2 border-white/10'
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            />
                            
                            <div className='flex items-center gap-1'>
                                <motion.div animate={{ rotate: [-12, -6, -12] }} transition={{ duration: 2, repeat: Infinity }}>
                                    <FaUtensilSpoon className='text-white text-5xl sm:text-6xl transform -rotate-12' />
                                </motion.div>
                                <motion.div animate={{ rotate: [12, 6, 12] }} transition={{ duration: 2, repeat: Infinity }}>
                                    <FaUtensils className='text-white text-4xl sm:text-5xl transform rotate-12' />
                                </motion.div>
                            </div>

                            <motion.div 
                                className='absolute -top-4 -right-4 w-11 h-11 rounded-full bg-[#ffd93d] flex items-center justify-center shadow-2xl shadow-[#ffd93d]/50'
                                animate={{ scale: [1, 1.25, 1], rotate: [0, 25, -25, 0], y: [0, -8, 0] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <FaCrown className='text-[#0a0a0f] text-lg' />
                            </motion.div>

                            <motion.div 
                                className='absolute -top-2 -left-2 w-8 h-8 rounded-full bg-[#ffd93d] flex items-center justify-center shadow-lg shadow-[#ffd93d]/30'
                                animate={{ scale: [1, 1.3, 1], rotate: [0, 360, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <FaStar className='text-[#0a0a0f] text-sm' />
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Brand Name */}
                <motion.div 
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className='text-center'
                >
                    <motion.h1 
                        className='text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tight leading-none'
                        animate={{ textShadow: ['0 0 40px rgba(255,45,85,0.2)', '0 0 80px rgba(255,107,53,0.4)', '0 0 40px rgba(255,45,85,0.2)'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <span className='bg-gradient-to-r from-[#ff2d55] via-[#ff6b35] to-[#ffd93d] bg-clip-text text-transparent'>
                            Cravely
                        </span>
                    </motion.h1>
                    
                    <motion.div 
                        className='flex items-center justify-center gap-2 mt-1'
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <p className='text-white/30 text-xs sm:text-sm tracking-[0.25em] uppercase font-medium'>
                            🍽️ Food Delivery
                        </p>
                        <MdVerified size={18} className='text-blue-400' />
                    </motion.div>
                </motion.div>

                {/* Tagline */}
                <motion.div 
                    initial={{ y: 30, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className='text-center mt-3'
                >
                    <motion.h2 
                        className='text-2xl sm:text-3xl md:text-4xl font-bold'
                        animate={{ y: [0, -4, 0], scale: [1, 1.02, 1] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <span className='bg-gradient-to-r from-[#ff6b35] via-[#ffd93d] to-[#ff6b35] bg-clip-text text-transparent'>
                            Savor Every Bite
                        </span>
                    </motion.h2>
                    
                    <motion.p 
                        className='text-white/40 text-sm sm:text-base mt-2 max-w-md mx-auto leading-relaxed'
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <span className='text-[#ff6b35] font-semibold'>Lightning Fast</span> Delivery
                        <br />
                        <span className='text-white/20 text-xs'>🚀 From Kitchen to Your Doorstep</span>
                    </motion.p>
                </motion.div>

                {/* Badges */}
                <motion.div className='flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4'>
                    {[
                        { icon: <FaBolt className='text-yellow-400' />, label: 'Fast Delivery', color: 'border-yellow-400/30' },
                        { icon: <FaShieldAlt className='text-green-400' />, label: '100% Safe', color: 'border-green-400/30' },
                        { icon: <FaAward className='text-purple-400' />, label: 'Top Rated', color: 'border-purple-400/30' },
                        { icon: <FaHeart className='text-pink-400' />, label: 'Made with ❤️', color: 'border-pink-400/30' }
                    ].map((badge, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 1 + (i * 0.1) }}
                            className={`glass-premium px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border ${badge.color} flex items-center gap-1.5 sm:gap-2`}
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                        >
                            <span className='text-sm sm:text-base'>{badge.icon}</span>
                            <span className='text-white/50 text-[10px] sm:text-xs font-medium'>{badge.label}</span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Progress Bar */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className='w-72 sm:w-96 mt-6'
                >
                    <div className='relative'>
                        <div className='w-full h-2 bg-white/10 rounded-full overflow-hidden'>
                            <motion.div 
                                className='h-full bg-gradient-to-r from-[#ff2d55] via-[#ff6b35] to-[#ffd93d] rounded-full'
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.05 }}
                                style={{ boxShadow: '0 0 30px rgba(255,45,85,0.4)' }}
                            />
                        </div>
                    </div>
                    
                    <motion.div 
                        className='flex items-center justify-between mt-2 px-1'
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <p className='text-white/20 text-[10px] sm:text-xs tracking-wider font-medium'>
                            {progress < 30 && '🔄 Preparing Experience...'}
                            {progress >= 30 && progress < 60 && '🔥 Almost Ready...'}
                            {progress >= 60 && progress < 90 && '✨ Adding Magic...'}
                            {progress >= 90 && progress < 100 && '🎯 Final Touches...'}
                            {progress >= 100 && '🚀 Ready to Serve!'}
                        </p>
                        <p className='text-white/20 text-[10px] sm:text-xs font-mono font-bold'>
                            {progress}%
                        </p>
                    </motion.div>
                </motion.div>

                {/* Footer */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className='absolute bottom-6 left-0 right-0 text-center'
                >
                    <div className='flex items-center justify-center gap-3 text-white/10 text-[10px] sm:text-xs'>
                        <span className='w-6 h-px bg-gradient-to-r from-transparent to-white/10' />
                        <span className='flex items-center gap-1.5'>
                            <span className='text-[#ff2d55]'>✦</span> v2.0 <span className='text-[#ff2d55]'>✦</span>
                        </span>
                        <span className='w-6 h-px bg-gradient-to-l from-transparent to-white/10' />
                    </div>
                    <p className='text-white/[0.03] text-[8px] mt-1 tracking-[0.3em] font-light'>
                        © 2026 Cravely • All Rights Reserved
                    </p>
                </motion.div>
            </div>

            <style jsx>{`
                .glass-premium {
                    background: rgba(255, 255, 255, 0.04);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }
            `}</style>
        </div>
    )
}

export default SplashScreen