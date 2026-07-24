import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { 
    FaStore, FaStar, FaClock, FaMapMarkerAlt, 
    FaArrowLeft, FaSearch, FaFilter, FaUtensils,
    FaFire, FaTruck, FaLeaf,
    FaArrowRight, FaTimes, FaHeart, FaShareAlt,
    FaTag, FaAward, FaShieldAlt
} from "react-icons/fa";
import { MdDeliveryDining, MdRestaurant, MdVerified } from "react-icons/md";
import { ClipLoader } from 'react-spinners';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ShopCard from '../components/ShopCard';

function Restaurants() {
    const navigate = useNavigate()
    const { currentCity } = useSelector(state => state.user)
    const [restaurants, setRestaurants] = useState([])
    const [filteredRestaurants, setFilteredRestaurants] = useState([])
    const [loading, setLoading] = useState(true)
    const [isLoaded, setIsLoaded] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState('all')
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 300)
    }, [])

    useEffect(() => {
        fetchRestaurants()
    }, [currentCity])

    const fetchRestaurants = async () => {
        setLoading(true)
        try {
            if (!currentCity) {
                setRestaurants([])
                setFilteredRestaurants([])
                setLoading(false)
                return
            }
            const result = await axios.get(
                `${serverUrl}/api/shop/get-by-city/${currentCity}`,
                { withCredentials: true }
            )
            setRestaurants(result.data || [])
            setFilteredRestaurants(result.data || [])
        } catch (error) {
            console.log("Error fetching restaurants:", error)
            setRestaurants([])
            setFilteredRestaurants([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let filtered = restaurants

        if (searchQuery.trim()) {
            filtered = filtered.filter(restaurant =>
                restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                restaurant.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                restaurant.city.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        if (activeFilter === 'high-rated') {
            filtered = filtered.filter(r => (r.rating?.average || 0) >= 4.5)
        } else if (activeFilter === 'popular') {
            filtered = filtered.filter(r => (r.rating?.count || 0) >= 50)
        } else if (activeFilter === 'new') {
            filtered = filtered.slice(0, 10)
        }

        setFilteredRestaurants(filtered)
    }, [searchQuery, activeFilter, restaurants])

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

    return (
        <div className='min-h-screen bg-[#0a0a0f] relative overflow-hidden pt-20'>
            
            {/* ✅ Premium Animated Background Orbs */}
            <div className='absolute inset-0 pointer-events-none'>
                <motion.div 
                    animate={{ x: [0, 60, -30, 0], y: [0, -40, 50, 0] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className='absolute -top-40 -left-40 w-[700px] h-[700px] bg-[#ff2d55]/5 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ x: [0, -50, 30, 0], y: [0, 40, -50, 0] }}
                    transition={{ duration: 25, repeat: Infinity }}
                    className='absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-[#ff6b35]/5 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[#ffd93d]/3 rounded-full blur-3xl'
                />
            </div>

            <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6'>
                
                {/* ✅ Premium Header */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 ${fadeUp}`}>
                    <div className='flex items-center gap-4'>
                        <motion.button 
                            whileHover={{ scale: 1.05, rotate: -5 }}
                            whileTap={{ scale: 0.95 }}
                            className='w-11 h-11 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#12121f] flex items-center justify-center hover:bg-white/10 transition-all duration-300 border border-white/10 group shadow-lg shadow-black/20'
                            onClick={() => navigate('/')}
                        >
                            <FaArrowLeft size={18} className='text-white/60 group-hover:text-white transition' />
                        </motion.button>
                        <div>
                            <h1 className='text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3'>
                                <span className='text-gradient-animated'>Restaurants</span>
                                <span className='text-xs bg-gradient-to-r from-[#ff2d55]/20 to-[#ff6b35]/20 px-2.5 py-0.5 rounded-full text-[#ff6b35] border border-[#ff6b35]/20'>
                                    {filteredRestaurants.length}
                                </span>
                            </h1>
                            <p className='text-white/30 text-sm flex items-center gap-2 flex-wrap'>
                                <span>Discover best restaurants in</span>
                                <span className='text-[#ff6b35] font-medium bg-[#ff6b35]/10 px-2.5 py-0.5 rounded-full'>
                                    {currentCity || 'your city'}
                                </span>
                            </p>
                        </div>
                    </div>
                    
                    <div className='flex items-center gap-3'>
                        <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5'>
                            <FaStore size={12} className='text-[#ff6b35]' />
                            <span className='text-white/40 text-xs'>
                                {filteredRestaurants.length} found
                            </span>
                        </div>
                    </div>
                </div>

                {/* ✅ Premium Search & Filter Bar */}
                <div className={`flex flex-col sm:flex-row gap-3 mb-8 ${fadeUp}`}>
                    <div className='flex-1 relative group'>
                        <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-[#ff2d55]/5 to-[#ff6b35]/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500' />
                        <FaSearch size={16} className='absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#ff6b35] transition-colors duration-300' />
                        <input
                            type="text"
                            placeholder='Search restaurants by name or location...'
                            className='w-full bg-[#18181D] border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 text-sm relative z-10'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <motion.button 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className='absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition z-10'
                                onClick={() => setSearchQuery('')}
                            >
                                <FaTimes size={14} />
                            </motion.button>
                        )}
                    </div>
                    
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-5 py-3.5 rounded-2xl transition-all duration-300 flex items-center gap-2 ${
                            showFilters 
                                ? 'bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white shadow-lg shadow-[#ff2d55]/30'
                                : 'bg-[#18181D] border border-white/10 text-white/60 hover:text-white hover:border-[#ff6b35]/30 hover:shadow-lg hover:shadow-[#ff6b35]/5'
                        }`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FaFilter size={14} className={showFilters ? 'animate-pulse' : ''} />
                        <span className='text-sm font-medium'>Filters</span>
                        {activeFilter !== 'all' && (
                            <span className='w-1.5 h-1.5 rounded-full bg-[#ff2d55] animate-pulse' />
                        )}
                    </motion.button>
                </div>

                {/* ✅ Premium Filter Chips */}
                {showFilters && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className='flex flex-wrap gap-2 mb-6 p-1.5 rounded-xl bg-white/5 border border-white/5'
                    >
                        {[
                            { id: 'all', label: 'All', icon: '✦' },
                            { id: 'high-rated', label: 'High Rated (4.5+)', icon: '⭐' },
                            { id: 'popular', label: 'Popular', icon: '🔥' },
                            { id: 'new', label: 'New', icon: '🆕' }
                        ].map((filter) => (
                            <motion.button
                                key={filter.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
                                    activeFilter === filter.id 
                                        ? 'bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white shadow-lg shadow-[#ff2d55]/20'
                                        : 'text-white/50 hover:text-white hover:bg-white/5'
                                }`}
                                onClick={() => setActiveFilter(filter.id)}
                            >
                                <span>{filter.icon}</span>
                                {filter.label}
                            </motion.button>
                        ))}
                    </motion.div>
                )}

                {/* ✅ Premium Loading State */}
                {loading ? (
                    <div className='flex flex-col items-center justify-center py-32'>
                        <div className='relative'>
                            <ClipLoader size={60} color="#ff2d55" />
                            <div className='absolute inset-0 animate-ping rounded-full border-2 border-[#ff2d55]/20' />
                            <div className='absolute inset-[-10px] rounded-full border border-[#ff6b35]/10 animate-spin-slow' />
                        </div>
                        <p className='mt-6 text-white/40 text-sm animate-pulse flex items-center gap-2'>
                            <span className='w-1.5 h-1.5 rounded-full bg-[#ff2d55]/40 animate-pulse' />
                            Finding restaurants near you...
                            <span className='w-1.5 h-1.5 rounded-full bg-[#ff6b35]/40 animate-pulse animation-delay-300' />
                        </p>
                    </div>
                ) : filteredRestaurants.length > 0 ? (
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5'
                    >
                        {filteredRestaurants.map((restaurant, index) => (
                            <ShopCard 
                                key={restaurant._id} 
                                shop={restaurant} 
                                index={index} 
                            />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className='glass-premium-ultra p-12 sm:p-20 rounded-3xl border border-white/5 text-center relative overflow-hidden group'
                    >
                        <div className='absolute inset-0 bg-gradient-to-r from-[#ff2d55]/10 to-[#ff6b35]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700' />
                        <div className='relative z-10'>
                            <div className='w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-4 sm:mb-5 rounded-full bg-gradient-to-br from-[#ff2d55]/10 to-[#ff6b35]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-white/10 shadow-xl shadow-[#ff2d55]/5'>
                                <MdRestaurant size={32} className="sm:text-4xl text-white/20" />
                            </div>
                            <h3 className='text-xl sm:text-2xl font-bold text-white mb-2'>No Restaurants Found</h3>
                            <p className='text-white/30 text-sm max-w-sm mx-auto leading-relaxed'>
                                {searchQuery 
                                    ? `No restaurants match "${searchQuery}" in ${currentCity || 'your city'}`
                                    : `No restaurants available in ${currentCity || 'your city'} yet`}
                            </p>
                            {searchQuery && (
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    className='mt-5 sm:mt-6 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl glass-premium-ultra text-white/70 hover:text-white transition-all duration-300 border border-white/10 hover:border-[#ff2d55]/30 flex items-center gap-2 mx-auto text-xs sm:text-sm'
                                    onClick={() => setSearchQuery('')}
                                >
                                    <FaTimes size={12} /> Clear Search
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
                .animation-delay-300 { animation-delay: 0.3s; }

                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
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
                ::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 45, 85, 0.5);
                }
            `}</style>
        </div>
    )
}

export default Restaurants