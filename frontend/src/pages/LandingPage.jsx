import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
    FaRocket, FaTruck, FaMedal, FaStar, FaArrowRight, FaBars, FaTimes, 
    FaUtensils, FaMotorcycle, FaShieldAlt, FaClock, FaCheckCircle,
    FaHeart, FaFire, FaCrown, FaGem, FaBolt
} from 'react-icons/fa'
import { MdDeliveryDining, MdHome, MdInfo, MdContactSupport, MdVerified } from 'react-icons/md'
import { motion } from 'framer-motion'

function LandingPage() {
    const navigate = useNavigate()
    const { userData } = useSelector(state => state.user)
    const [mobileMenu, setMobileMenu] = useState(false)
    const [showLanding, setShowLanding] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowLanding(true)
        }, 300)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (showLanding && userData && userData._id) {
            navigate('/home')
        }
    }, [showLanding, userData, navigate])

    if (!showLanding) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#ff2d55] border-t-transparent rounded-full animate-spin" />
                    <p className="text-white/40 text-sm animate-pulse">Loading...</p>
                </div>
            </div>
        )
    }

    if (userData && userData._id) {
        return null
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#0a0a0f]">
            <div className="fixed inset-0 pointer-events-none">
                <motion.div 
                    animate={{ x: [0, 60, -30, 0], y: [0, -40, 50, 0] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#ff2d55]/6 rounded-full blur-3xl"
                />
                <motion.div 
                    animate={{ x: [0, -50, 30, 0], y: [0, 40, -50, 0] }}
                    transition={{ duration: 25, repeat: Infinity }}
                    className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#ff6b35]/6 rounded-full blur-3xl"
                />
                <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ffd93d]/4 rounded-full blur-3xl"
                />
            </div>

            <nav className="relative z-30 max-w-7xl mx-auto px-4 pt-6">
                <div className="glass-premium px-4 sm:px-6 py-3 sm:py-4 rounded-2xl flex items-center justify-between backdrop-blur-2xl border border-white/5">
                    <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center shadow-lg shadow-[#ff2d55]/20 group-hover:scale-110 transition-all duration-300">
                            <FaMotorcycle className="text-white text-xl" />
                        </div>
                        <div>
                            <span className="text-xl sm:text-2xl font-bold text-gradient">Cravely</span>
                            <p className="text-[6px] sm:text-[8px] text-white/30 tracking-[0.2em] uppercase">🍽️ Food Delivery</p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-4 lg:gap-6 text-white/70">
                        {[
                            { label: 'Home', icon: <MdHome size={18} />, href: '/' },
                            { label: 'About', icon: <MdInfo size={18} />, href: '/about' },
                            { label: 'Contact', icon: <MdContactSupport size={18} />, href: '/contact' },
                        ].map((item) => (
                            <a 
                                key={item.label}
                                href={item.href} 
                                className="flex items-center gap-2 hover:text-white transition-all duration-300 hover:scale-105 px-3 py-1.5 rounded-lg hover:bg-white/5 text-sm"
                                onClick={(e) => { e.preventDefault(); navigate(item.href) }}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button 
                            className="hidden md:block glass px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 border border-white/5"
                            onClick={() => navigate('/signin')}
                        >
                            Login
                        </button>
                        <button 
                            className="btn-neon text-xs sm:text-sm py-2 px-4 sm:px-5"
                            onClick={() => navigate('/signup')}
                        >
                            Sign Up
                        </button>
                        <button 
                            className="md:hidden text-white/70 hover:text-white transition"
                            onClick={() => setMobileMenu(!mobileMenu)}
                        >
                            {mobileMenu ? <FaTimes size={22} /> : <FaBars size={22} />}
                        </button>
                    </div>
                </div>

                {mobileMenu && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="md:hidden mt-3 glass-premium p-4 rounded-2xl space-y-3 border border-white/5"
                    >
                        {[
                            { label: 'Home', icon: <MdHome size={18} />, href: '/' },
                            { label: 'About', icon: <MdInfo size={18} />, href: '/about' },
                            { label: 'Contact', icon: <MdContactSupport size={18} />, href: '/contact' },
                        ].map((item) => (
                            <a 
                                key={item.label}
                                href="#"
                                className="flex items-center gap-3 text-white/70 hover:text-white transition px-3 py-2 rounded-lg hover:bg-white/5 text-sm"
                                onClick={(e) => { e.preventDefault(); navigate(item.href); setMobileMenu(false) }}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </a>
                        ))}
                        <div className="border-t border-white/10 pt-3 flex gap-3">
                            <button 
                                className="flex-1 glass py-2 rounded-lg text-xs sm:text-sm text-white hover:bg-white/10 transition border border-white/5"
                                onClick={() => { navigate('/signin'); setMobileMenu(false) }}
                            >
                                Login
                            </button>
                            <button 
                                className="flex-1 btn-neon text-xs sm:text-sm py-2"
                                onClick={() => { navigate('/signup'); setMobileMenu(false) }}
                            >
                                Sign Up
                            </button>
                        </div>
                    </motion.div>
                )}
            </nav>

            <div className="relative z-10 max-w-7xl mx-auto px-4 pt-10 sm:pt-12 pb-12 sm:pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[60vh] lg:min-h-[70vh]">
                    <div className="space-y-4 sm:space-y-6">
                        <div className="inline-flex items-center gap-3 glass px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm text-white/80 border border-white/5">
                            <span className="w-2 h-2 rounded-full bg-[#ff2d55] animate-pulse shadow-lg shadow-[#ff2d55]/50" />
                            🔥 5,000+ Happy Customers
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1]">
                            <span className="text-white">Delivering</span>
                            <br />
                            <span className="text-gradient-hero">Happiness</span>
                            <br />
                            <span className="text-white">to Your Doorstep</span>
                        </h1>

                        <p className="text-sm sm:text-base md:text-lg text-white/50 max-w-md lg:max-w-lg leading-relaxed">
                            Experience the finest culinary journey with <span className="text-[#ff6b35] font-medium">Cravely</span>. 
                            Quick, reliable, and delicious food delivery at your fingertips.
                        </p>

                        <div className="flex flex-wrap gap-3 sm:gap-4">
                            <button 
                                className="btn-neon flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base"
                                onClick={() => navigate('/signup')}
                            >
                                Explore Now <FaArrowRight size={14} className="sm:text-base" />
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-4 sm:gap-8 lg:gap-10 pt-3 sm:pt-4">
                            <div>
                                <div className="stat-number text-2xl sm:text-3xl lg:text-4xl font-bold text-white">5K+</div>
                                <p className="text-white/40 text-[10px] sm:text-xs lg:text-sm">Orders Delivered</p>
                            </div>
                            <div className="w-px h-8 sm:h-10 lg:h-12 bg-white/10" />
                            <div>
                                <div className="stat-number text-2xl sm:text-3xl lg:text-4xl font-bold text-white">30<small className="text-lg sm:text-xl lg:text-2xl">min</small></div>
                                <p className="text-white/40 text-[10px] sm:text-xs lg:text-sm">Avg Delivery Time</p>
                            </div>
                            <div className="w-px h-8 sm:h-10 lg:h-12 bg-white/10" />
                            <div>
                                <div className="stat-number text-2xl sm:text-3xl lg:text-4xl font-bold text-white">4.9★</div>
                                <p className="text-white/40 text-[10px] sm:text-xs lg:text-sm">Customer Rating</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#ff2d55]/20 to-[#ff6b35]/20 rounded-3xl blur-3xl" />
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-[#ff2d55]/10">
                            <img 
                                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=500&fit=crop" 
                                alt="Burger" 
                                className="w-full object-cover h-[220px] sm:h-[300px] md:h-[350px] lg:h-[400px] xl:h-[450px]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0a0f]/60 via-transparent to-transparent" />
                        </div>

                        <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 glass-premium p-2 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl shadow-2xl shadow-[#ff2d55]/10 border border-white/5">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center shadow-lg shadow-[#ff2d55]/30">
                                    <FaTruck className="text-white text-sm sm:text-base lg:text-xl" />
                                </div>
                                <div>
                                    <p className="text-[10px] sm:text-xs lg:text-sm font-semibold text-white">Fastest Delivery</p>
                                    <p className="text-[8px] sm:text-[10px] lg:text-xs text-white/50">30 min guarantee</p>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 glass-premium p-2 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl shadow-2xl shadow-[#ff6b35]/10 border border-white/5">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#ffd93d] flex items-center justify-center shadow-lg shadow-[#ff6b35]/30">
                                    <FaMedal className="text-white text-sm sm:text-base lg:text-xl" />
                                </div>
                                <div>
                                    <p className="text-[10px] sm:text-xs lg:text-sm font-semibold text-white">Best Quality</p>
                                    <p className="text-[8px] sm:text-[10px] lg:text-xs text-white/50">Premium ingredients</p>
                                </div>
                            </div>
                        </div>

                        <div className="absolute top-1/2 -right-1 sm:-right-2 lg:-right-4 glass-premium p-1.5 sm:p-2 lg:p-3 rounded-xl sm:rounded-2xl shadow-2xl shadow-[#ffd93d]/10 border border-white/5">
                            <div className="flex items-center gap-1 sm:gap-2">
                                <FaStar className="text-[#ffd93d] text-sm sm:text-base lg:text-xl" />
                                <span className="text-[10px] sm:text-xs lg:text-sm font-semibold text-white">4.9 ★</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-10 sm:mt-16 lg:mt-20">
                    <div className="card-premium text-center p-4 sm:p-6 rounded-2xl glass-premium border border-white/5 transition-all duration-300 hover:border-[#ff2d55]/30 hover:scale-[1.02]">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-2 sm:mb-3 lg:mb-4 rounded-2xl glass flex items-center justify-center">
                            <FaRocket className="text-lg sm:text-xl lg:text-2xl text-[#ff2d55]" />
                        </div>
                        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-1">Lightning Fast</h3>
                        <p className="text-white/50 text-xs sm:text-sm">Delivered in under 30 minutes, guaranteed</p>
                    </div>

                    <div className="card-premium text-center p-4 sm:p-6 rounded-2xl glass-premium border border-white/5 transition-all duration-300 hover:border-[#ff6b35]/30 hover:scale-[1.02]">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-2 sm:mb-3 lg:mb-4 rounded-2xl glass flex items-center justify-center">
                            <MdDeliveryDining className="text-lg sm:text-xl lg:text-2xl text-[#ff6b35]" />
                        </div>
                        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-1">Premium Quality</h3>
                        <p className="text-white/50 text-xs sm:text-sm">Handpicked ingredients from top chefs</p>
                    </div>

                    <div className="card-premium text-center p-4 sm:p-6 rounded-2xl glass-premium border border-white/5 transition-all duration-300 hover:border-[#ffd93d]/30 hover:scale-[1.02]">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-2 sm:mb-3 lg:mb-4 rounded-2xl glass flex items-center justify-center">
                            <FaMedal className="text-lg sm:text-xl lg:text-2xl text-[#ffd93d]" />
                        </div>
                        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-1">100% Satisfaction</h3>
                        <p className="text-white/50 text-xs sm:text-sm">Love your meal or get a full refund</p>
                    </div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mt-12 sm:mt-16 lg:mt-20 glass-premium p-6 sm:p-8 lg:p-12 rounded-3xl border border-white/10 text-center relative overflow-hidden"
                >
                    <motion.div 
                        animate={{ x: [0, 100, -100, 0], y: [0, -50, 50, 0] }}
                        transition={{ duration: 20, repeat: Infinity }}
                        className="absolute -top-40 -right-40 w-80 h-80 bg-[#ff2d55]/10 rounded-full blur-3xl"
                    />
                    <motion.div 
                        animate={{ x: [0, -100, 100, 0], y: [0, 50, -50, 0] }}
                        transition={{ duration: 25, repeat: Infinity }}
                        className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#ff6b35]/10 rounded-full blur-3xl"
                    />
                    
                    <div className="relative z-10">
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white"
                        >
                            Ready to <span className="text-gradient-hero">Taste</span> the Difference?
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-white/50 text-sm sm:text-base mt-2 max-w-2xl mx-auto"
                        >
                            Join 5,000+ happy customers and experience the best food delivery service.
                        </motion.p>
                        <motion.button 
                            whileHover={{ scale: 1.05, boxShadow: "0 0 60px rgba(255,45,85,0.4)" }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mt-6 btn-neon px-8 py-4 rounded-full text-sm sm:text-base font-semibold inline-flex items-center gap-3"
                            onClick={() => navigate('/signup')}
                        >
                            Get Started
                            <motion.span 
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <FaArrowRight />
                            </motion.span>
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            <style jsx>{`
                .btn-neon {
                    background: linear-gradient(135deg, #ff2d55, #ff6b35);
                    color: white;
                    padding: 12px 28px;
                    border-radius: 50px;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 0 40px rgba(255, 45, 85, 0.25);
                    position: relative;
                    overflow: hidden;
                }
                .btn-neon:hover {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 0 60px rgba(255, 45, 85, 0.4);
                }

                .glass-premium {
                    background: rgba(255, 255, 255, 0.04);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }

                .text-gradient {
                    background: linear-gradient(135deg, #ff2d55, #ff6b35);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .text-gradient-hero {
                    background: linear-gradient(135deg, #ff6b35, #ffd93d);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
            `}</style>
        </div>
    )
}

export default LandingPage