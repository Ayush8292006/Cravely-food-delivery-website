import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
    FaUtensils, FaFire, FaLeaf, FaStar, FaArrowRight, 
    FaPizzaSlice, FaHamburger, FaIceCream, FaCoffee,
    FaCrown, FaGem, FaRocket, FaGift, FaMagic,
    FaPepperHot, FaFish, FaAppleAlt, FaCarrot,
    FaSeedling, FaDrumstickBite
} from "react-icons/fa";
import { 
    GiKnifeFork, GiBowlOfRice, GiChopsticks, GiNoodles,
    GiDumpling, GiFullPizza, GiBread, GiMeat, GiSaucepan
} from 'react-icons/gi'
import { MdRestaurant, MdEmojiFoodBeverage } from 'react-icons/md'

const categoryIcons = {
    'Pizza': <FaPizzaSlice className="text-[#ff6b35] text-2xl" />,
    'Burger': <FaHamburger className="text-[#ff6b35] text-2xl" />,
    'Snacks': <GiKnifeFork className="text-[#ff6b35] text-2xl" />,
    'Main Course': <GiSaucepan className="text-[#ff6b35] text-2xl" />,
    'Desserts': <FaIceCream className="text-[#ff6b35] text-2xl" />,
    'South Indian': <GiDumpling className="text-[#ff6b35] text-2xl" />,
    'North Indian': <GiSaucepan className="text-[#ff6b35] text-2xl" />,
    'Chinese': <GiChopsticks className="text-[#ff6b35] text-2xl" />,
    'Fast Food': <GiBread className="text-[#ff6b35] text-2xl" />,
    'Others': <FaUtensils className="text-[#ff6b35] text-2xl" />
}

const categoryColors = {
    'Pizza': { primary: '#ff6b35', glow: 'rgba(255,107,53,0.3)' },
    'Burger': { primary: '#ff2d55', glow: 'rgba(255,45,85,0.3)' },
    'Snacks': { primary: '#ffd93d', glow: 'rgba(255,217,61,0.3)' },
    'Main Course': { primary: '#4ade80', glow: 'rgba(74,222,128,0.3)' },
    'Desserts': { primary: '#f472b6', glow: 'rgba(244,114,182,0.3)' },
    'South Indian': { primary: '#60a5fa', glow: 'rgba(96,165,250,0.3)' },
    'North Indian': { primary: '#fb923c', glow: 'rgba(251,146,60,0.3)' },
    'Chinese': { primary: '#a78bfa', glow: 'rgba(167,139,250,0.3)' },
    'Fast Food': { primary: '#34d399', glow: 'rgba(52,211,153,0.3)' },
    'Others': { primary: '#94a3b8', glow: 'rgba(148,163,184,0.3)' }
}

function CategoryCard({ name, image, onClick, index = 0 }) {
    const [isHovered, setIsHovered] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [isClicked, setIsClicked] = useState(false)

    const Icon = categoryIcons[name] || <FaUtensils className="text-[#ff6b35] text-2xl" />
    const colors = categoryColors[name] || categoryColors['Others']
    const primaryColor = colors.primary
    const glowColor = colors.glow

    const rating = (Math.random() * 1.5 + 3.5).toFixed(1)
    const itemCount = Math.floor(Math.random() * 30 + 10)

    const handleClick = () => {
        setIsClicked(true)
        setTimeout(() => setIsClicked(false), 500)
        onClick && onClick()
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            transition={{ 
                duration: 0.6, 
                delay: index * 0.08,
                type: "spring",
                stiffness: 200,
                damping: 15
            }}
            whileHover={{ 
                y: -15, 
                scale: 1.06,
                transition: { duration: 0.3, type: "spring", stiffness: 400 }
            }}
            whileTap={{ scale: 0.92 }}
            className='relative w-[140px] h-[160px] md:w-[220px] md:h-[240px] 
                rounded-3xl overflow-hidden shrink-0 cursor-pointer
                bg-gradient-to-br from-[#1a1a2e] to-[#12121f]
                border-2 border-white/5 hover:border-[#ff2d55]/50
                shadow-2xl hover:shadow-[#ff2d55]/30
                transition-all duration-500 group'
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                boxShadow: isHovered ? `0 25px 60px ${glowColor}` : '0 10px 30px rgba(0,0,0,0.3)'
            }}
        >
            {/* Premium Background */}
            <div className='absolute inset-0 pointer-events-none'>
                <motion.div 
                    className='absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl'
                    animate={{
                        scale: isHovered ? 1.5 : 1,
                        opacity: isHovered ? 0.6 : 0.2
                    }}
                    transition={{ duration: 0.6 }}
                    style={{ background: glowColor }}
                />
                <motion.div 
                    className='absolute -bottom-32 -left-32 w-64 h-64 rounded-full blur-3xl'
                    animate={{
                        scale: isHovered ? 1.3 : 1,
                        opacity: isHovered ? 0.4 : 0.1
                    }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    style={{ background: glowColor }}
                />
                
                {/* Floating Particles */}
                {isHovered && (
                    <>
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                className='absolute w-1.5 h-1.5 rounded-full'
                                style={{ background: primaryColor }}
                                initial={{ 
                                    x: Math.random() * 100 - 50,
                                    y: Math.random() * 100 - 50,
                                    opacity: 0
                                }}
                                animate={{
                                    x: Math.random() * 200 - 100,
                                    y: Math.random() * 200 - 100,
                                    opacity: [0, 1, 0]
                                }}
                                transition={{
                                    duration: 2 + Math.random() * 2,
                                    repeat: Infinity,
                                    delay: Math.random() * 0.5
                                }}
                            />
                        ))}
                    </>
                )}
            </div>

            {/* Image */}
            <motion.div 
                className='relative w-full h-full overflow-hidden'
                animate={{
                    scale: isHovered ? 1.15 : 1,
                    rotate: isHovered ? 2 : 0
                }}
                transition={{ duration: 0.6 }}
            >
                <img
                    src={image}
                    alt={name}
                    className={`w-full h-full object-cover transition-all duration-700 ${
                        isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setIsLoaded(true)}
                    loading="lazy"
                />
                
                {!isLoaded && (
                    <div className='absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#12121f]'>
                        <div className='absolute inset-0 flex items-center justify-center'>
                            <motion.div 
                                className='w-16 h-16 rounded-full border-4 border-white/10 border-t-[#ff2d55]'
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Gradient Overlay */}
            <motion.div 
                className='absolute inset-0 bg-gradient-to-t 
                    from-black/95 via-black/40 to-transparent'
                animate={{
                    from: isHovered ? 'black/95' : 'black/80',
                    via: isHovered ? 'black/50' : 'black/30'
                }}
                transition={{ duration: 0.4 }}
            />

            {/* Category Icon Badge */}
            <motion.div 
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ 
                    scale: 1, 
                    rotate: 0, 
                    opacity: 1,
                    y: isHovered ? -5 : 0
                }}
                transition={{ 
                    delay: 0.2 + (index * 0.05),
                    type: "spring",
                    stiffness: 300,
                    damping: 15
                }}
                className={`absolute top-3 right-3 md:top-4 md:right-4 
                    w-10 h-10 md:w-12 md:h-12 rounded-2xl 
                    bg-black/80 backdrop-blur-xl border-2 border-white/10
                    flex items-center justify-center
                    shadow-2xl shadow-black/50
                    transition-all duration-300
                    ${isHovered ? `border-[${primaryColor}]/50 scale-110` : ''}`}
                style={{
                    boxShadow: isHovered ? `0 0 30px ${glowColor}` : '0 0 15px rgba(0,0,0,0.5)'
                }}
            >
                {Icon}
            </motion.div>

            {/* Rating Badge */}
            <motion.div 
                initial={{ scale: 0, x: 50 }}
                animate={{ scale: 1, x: 0 }}
                transition={{ delay: 0.3 + (index * 0.05), type: "spring" }}
                className='absolute top-3 left-3 md:top-4 md:left-4
                    flex items-center gap-1 px-2 py-1 md:px-3 md:py-1.5
                    rounded-full bg-black/80 backdrop-blur-xl border border-white/10
                    shadow-lg shadow-black/50'
            >
                <FaStar className='text-yellow-400 text-[10px] md:text-sm animate-pulse' />
                <span className='text-[10px] md:text-xs font-bold text-white'>{rating}</span>
                <span className='text-[6px] md:text-[8px] text-white/30'>({itemCount})</span>
            </motion.div>

            {/* Popular Badge */}
            {Math.random() > 0.6 && (
                <motion.div 
                    initial={{ scale: 0, x: -50 }}
                    animate={{ scale: 1, x: 0 }}
                    transition={{ delay: 0.4 + (index * 0.05), type: "spring" }}
                    className='absolute top-12 left-3 md:top-16 md:left-4
                        flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1
                        rounded-full bg-gradient-to-r from-[#ffd93d]/30 to-[#ff6b35]/30
                        backdrop-blur-xl border border-[#ffd93d]/30
                        shadow-lg shadow-[#ffd93d]/20'
                >
                    <FaCrown className='text-yellow-400 text-[8px] md:text-[10px] animate-pulse' />
                    <span className='text-[6px] md:text-[8px] font-bold text-yellow-400 uppercase tracking-wider'>
                        Top Rated
                    </span>
                </motion.div>
            )}

            {/* New Badge */}
            {Math.random() > 0.8 && (
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + (index * 0.05), type: "spring" }}
                    className='absolute bottom-16 left-3 md:bottom-20 md:left-4
                        flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1
                        rounded-full bg-gradient-to-r from-green-500/30 to-emerald-500/30
                        backdrop-blur-xl border border-green-500/30
                        shadow-lg shadow-green-500/20'
                >
                    <FaGift className='text-green-400 text-[8px] md:text-[10px] animate-pulse' />
                    <span className='text-[6px] md:text-[8px] font-bold text-green-400 uppercase tracking-wider'>
                        New
                    </span>
                </motion.div>
            )}

            {/* Content */}
            <div className='absolute bottom-0 left-0 right-0 p-3 md:p-5'>
                <motion.div
                    animate={{ 
                        y: isHovered ? -6 : 0
                    }}
                    transition={{ duration: 0.3, type: "spring" }}
                >
                    <motion.div 
                        className='flex items-center justify-between gap-2'
                        animate={{
                            scale: isHovered ? 1.02 : 1
                        }}
                    >
                        <motion.span 
                            className='text-sm md:text-lg font-extrabold text-white 
                                drop-shadow-2xl truncate flex-1'
                            animate={{
                                x: isHovered ? 4 : 0,
                                color: isHovered ? primaryColor : '#ffffff'
                            }}
                            transition={{ duration: 0.3 }}
                            style={{
                                textShadow: isHovered ? `0 0 30px ${glowColor}` : '0 2px 10px rgba(0,0,0,0.5)'
                            }}
                        >
                            {name}
                        </motion.span>

                        {/* Arrow on Hover */}
                        <motion.div
                            initial={{ opacity: 0, x: -15, scale: 0 }}
                            animate={{ 
                                opacity: isHovered ? 1 : 0,
                                x: isHovered ? 0 : -15,
                                scale: isHovered ? 1 : 0.5
                            }}
                            transition={{ duration: 0.4, type: "spring" }}
                            className='flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full 
                                bg-gradient-to-r from-[#ff2d55] to-[#ff6b35]
                                flex items-center justify-center shadow-lg shadow-[#ff2d55]/30'
                        >
                            <FaArrowRight className='text-white text-xs md:text-sm' />
                        </motion.div>
                    </motion.div>

                    {/* Subtitle */}
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ 
                            opacity: isHovered ? 1 : 0,
                            height: isHovered ? 'auto' : 0
                        }}
                        transition={{ duration: 0.3 }}
                        className='overflow-hidden'
                    >
                        <div className='flex items-center gap-2 mt-1'>
                            <span className='w-1.5 h-1.5 rounded-full' style={{ background: primaryColor }} />
                            <p className='text-[8px] md:text-[10px] text-white/50 flex items-center gap-2'>
                                <span>{itemCount}+ items</span>
                                <span className='w-px h-3 bg-white/10' />
                                <span>Premium quality</span>
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Border Glow */}
            <motion.div 
                className='absolute inset-0 rounded-3xl pointer-events-none'
                initial={{ opacity: 0 }}
                animate={{ 
                    opacity: isHovered ? 1 : 0,
                }}
                transition={{ duration: 0.4 }}
                style={{
                    boxShadow: `inset 0 0 60px ${glowColor}, 0 0 40px ${glowColor}`
                }}
            />

            {/* Top & Bottom Lines */}
            <motion.div 
                className='absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff2d55] to-transparent'
                animate={{
                    width: isHovered ? '100%' : '0%',
                    opacity: isHovered ? 1 : 0
                }}
                transition={{ duration: 0.5 }}
            />
            <motion.div 
                className='absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent'
                animate={{
                    width: isHovered ? '100%' : '0%',
                    opacity: isHovered ? 1 : 0
                }}
                transition={{ duration: 0.5, delay: 0.1 }}
            />

            {/* Click Ripple */}
            {isClicked && (
                <motion.div
                    className='absolute inset-0 rounded-3xl bg-white/20'
                    initial={{ scale: 0, opacity: 0.6 }}
                    animate={{ scale: 3, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                />
            )}

            {/* 3D Hover Effect */}
            <div 
                className='absolute inset-0 rounded-3xl pointer-events-none'
                style={{
                    background: isHovered ? `radial-gradient(circle at ${Math.random() * 100}% ${Math.random() * 100}%, rgba(255,255,255,0.05), transparent 70%)` : 'none'
                }}
            />
        </motion.div>
    )
}

export default CategoryCard