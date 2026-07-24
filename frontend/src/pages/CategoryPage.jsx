import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
    FaArrowLeft, FaUtensils, FaFire, FaStar, FaClock,
    FaArrowRight, FaTimes, FaFilter, FaTag, FaLeaf,
    FaDrumstickBite, FaMotorcycle, FaSearch, FaHeart,
    FaShoppingBag, FaRocket, FaGem, FaCrown
} from "react-icons/fa";
import { motion } from 'framer-motion';
import FoodCard from '../components/FoodCard';
import Nav from '../components/Nav';

function CategoryPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { categoryName } = useParams()
    const { itemsInMyCity } = useSelector(state => state.user)
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [isLoaded, setIsLoaded] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const decodedCategory = decodeURIComponent(categoryName || '')

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 300)
    }, [])

    useEffect(() => {
        if (itemsInMyCity && decodedCategory) {
            let filteredItems = []
            if (decodedCategory === 'All') {
                filteredItems = itemsInMyCity
            } else {
                filteredItems = itemsInMyCity.filter(item => item.category === decodedCategory)
            }
            setItems(filteredItems)
            setLoading(false)
        }
    }, [itemsInMyCity, decodedCategory])

    // ✅ Search filter
    const filteredItems = items.filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const fadeUp = `transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`
    
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.06
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        }
    }

    // ✅ Get category icon
    const getCategoryIcon = () => {
        const icons = {
            'Pizza': '🍕',
            'Burgers': '🍔',
            'Sandwiches': '🥪',
            'South Indian': '🥞',
            'North Indian': '🍛',
            'Chinese': '🥢',
            'Desserts': '🍰',
            'Snacks': '🍿',
            'Fast Food': '🌭',
            'All': '🍽️'
        }
        return icons[decodedCategory] || '🍽️'
    }

    return (
        <div className='min-h-screen bg-[#0a0a0f] relative overflow-hidden'>
            
            {/* ✅ Premium Animated Background Orbs */}
            <div className='absolute inset-0 pointer-events-none'>
                <motion.div 
                    animate={{ x: [0, 80, -40, 0], y: [0, -40, 60, 0] }}
                    transition={{ duration: 25, repeat: Infinity }}
                    className='absolute -top-40 -left-40 w-[700px] h-[700px] bg-[#ff2d55]/5 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ x: [0, -80, 40, 0], y: [0, 40, -60, 0] }}
                    transition={{ duration: 30, repeat: Infinity }}
                    className='absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-[#ff6b35]/5 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[#ffd93d]/3 rounded-full blur-3xl'
                />
            </div>

            <Nav />

            <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pt-[80px] sm:pt-[90px]'>
                
                {/* ✅ Premium Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 ${fadeUp}`}
                >
                    <div className='flex items-center gap-3 sm:gap-4'>
                        <motion.button
                            whileHover={{ scale: 1.05, rotate: -5 }}
                            whileTap={{ scale: 0.95 }}
                            className='w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#12121f] flex items-center justify-center hover:bg-white/10 transition-all duration-300 border border-white/10 group shadow-lg shadow-black/20'
                            onClick={() => navigate('/home')}
                        >
                            <FaArrowLeft size={16} className="sm:text-lg text-white/60 group-hover:text-white transition" />
                        </motion.button>
                        <div>
                            <h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2 sm:gap-3'>
                                <span className='text-2xl sm:text-3xl'>{getCategoryIcon()}</span>
                                <span className='text-gradient-animated'>{decodedCategory}</span>
                                <span className='text-[10px] sm:text-xs bg-gradient-to-r from-[#ff2d55]/20 to-[#ff6b35]/20 px-2 sm:px-2.5 py-0.5 rounded-full text-[#ff6b35] border border-[#ff6b35]/20'>
                                    {filteredItems.length} items
                                </span>
                            </h1>
                            <p className='text-white/30 text-xs sm:text-sm flex items-center gap-2'>
                                <span>Discover delicious {decodedCategory} items</span>
                            </p>
                        </div>
                    </div>
                    
                    <div className='flex items-center gap-2 sm:gap-3'>
                        <div className='flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full bg-white/5 border border-white/5'>
                            <FaStar size={11} className="sm:text-sm text-yellow-400" />
                            <span className='text-white/40 text-[10px] sm:text-xs'>
                                {filteredItems.length} items
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* ✅ Search Bar - Premium */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`relative group mb-6 sm:mb-8 ${fadeUp}`}
                >
                    <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-[#ff2d55]/5 to-[#ff6b35]/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500' />
                    <FaSearch size={16} className='absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#ff6b35] transition-colors duration-300' />
                    <input
                        type="text"
                        placeholder={`Search ${decodedCategory} items...`}
                        className='w-full bg-[#18181D] border border-white/10 rounded-2xl pl-11 pr-4 py-3 sm:py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 text-sm relative z-10'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <motion.button 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className='absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition z-10'
                            onClick={() => setSearchTerm('')}
                        >
                            <FaTimes size={14} />
                        </motion.button>
                    )}
                </motion.div>

                {/* ✅ Loading State */}
                {loading ? (
                    <div className='flex flex-col items-center justify-center py-24 sm:py-32'>
                        <div className='relative'>
                            <div className='w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#ff2d55] border-t-transparent rounded-full animate-spin' />
                            <div className='absolute inset-[-8px] sm:inset-[-10px] rounded-full border border-[#ff6b35]/10 animate-spin-slow' />
                        </div>
                        <p className='mt-4 sm:mt-6 text-white/40 text-xs sm:text-sm animate-pulse flex items-center gap-2'>
                            <span className='w-1.5 h-1.5 rounded-full bg-[#ff2d55]/40 animate-pulse' />
                            Loading {decodedCategory} items...
                            <span className='w-1.5 h-1.5 rounded-full bg-[#ff6b35]/40 animate-pulse animation-delay-300' />
                        </p>
                    </div>
                ) : filteredItems.length > 0 ? (
                    /* ✅ Premium Items Grid - NO HOVER RATING CHANGE */
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5'
                    >
                        {filteredItems.map((item, index) => (
                            <motion.div
                                key={item._id || index}
                                variants={itemVariants}
                                className='animate-float-up'
                                style={{ animationDelay: `${0.05 * index}s` }}
                            >
                                {/* ✅ FoodCard - Rating is FIXED, no hover change */}
                                <FoodCard data={item} />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    /* ✅ Premium Empty State */
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className='glass-premium-ultra p-12 sm:p-20 rounded-3xl border border-white/5 text-center relative overflow-hidden group'
                    >
                        <div className='absolute inset-0 bg-gradient-to-r from-[#ff2d55]/10 to-[#ff6b35]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700' />
                        <div className='absolute -top-40 -right-40 w-60 h-60 bg-[#ff2d55]/5 rounded-full blur-3xl' />
                        <div className='absolute -bottom-40 -left-40 w-60 h-60 bg-[#ff6b35]/5 rounded-full blur-3xl' />
                        
                        <div className='relative z-10'>
                            <div className='w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-4 sm:mb-5 rounded-full bg-gradient-to-br from-[#ff2d55]/10 to-[#ff6b35]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-white/10 shadow-xl shadow-[#ff2d55]/5'>
                                <FaUtensils size={30} className="sm:text-4xl text-white/20" />
                            </div>
                            <h3 className='text-xl sm:text-2xl font-bold text-white mb-2'>
                                {searchTerm ? 'No Items Found' : 'No Items Available'}
                            </h3>
                            <p className='text-white/30 text-sm max-w-sm mx-auto leading-relaxed'>
                                {searchTerm 
                                    ? `No "${searchTerm}" in ${decodedCategory} category`
                                    : `No items available in ${decodedCategory} category yet`
                                }
                            </p>
                            {searchTerm ? (
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    className='mt-5 sm:mt-6 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl glass-premium-ultra text-white/70 hover:text-white transition-all duration-300 border border-white/10 hover:border-[#ff2d55]/30 flex items-center gap-2 mx-auto text-xs sm:text-sm'
                                    onClick={() => setSearchTerm('')}
                                >
                                    <FaTimes size={12} /> Clear Search
                                </motion.button>
                            ) : (
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    className='mt-5 sm:mt-6 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl glass-premium-ultra text-white/70 hover:text-white transition-all duration-300 border border-white/10 hover:border-[#ff2d55]/30 flex items-center gap-2 mx-auto text-xs sm:text-sm'
                                    onClick={() => navigate('/home')}
                                >
                                    <FaArrowLeft size={12} /> Back to Home
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>

            <style jsx>{`
                @keyframes float-3d {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(40px, -30px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-float-3d {
                    animation: float-3d 15s ease-in-out infinite;
                }

                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }

                @keyframes float-up {
                    from { opacity: 0; transform: translateY(30px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-float-up {
                    animation: float-up 0.5s ease-out forwards;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
                .animate-pulse {
                    animation: pulse 2s ease-in-out infinite;
                }
                .animation-delay-300 { animation-delay: 0.3s; }

                .glass-premium-ultra {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }

                .text-gradient-animated {
                    background: linear-gradient(135deg, #ff2d55, #ff6b35, #ffd93d, #ff2d55);
                    background-size: 300% 300%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: gradient-shift 4s ease-in-out infinite;
                }
                @keyframes gradient-shift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }

                ::-webkit-scrollbar {
                    width: 4px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: rgba(255, 45, 85, 0.3);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    )
}

export default CategoryPage