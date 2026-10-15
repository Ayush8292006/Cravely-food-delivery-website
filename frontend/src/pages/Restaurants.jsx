import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
// ✅ FIXED: Correct import
import { serverUrl } from '../../config'
import { 
    FaStore, FaStar, FaClock, FaMapMarkerAlt, 
    FaArrowLeft, FaSearch, FaFilter, FaUtensils,
    FaFire, FaTruck, FaLeaf,
    FaArrowRight, FaTimes, FaHeart, FaShareAlt,
    FaTag, FaAward, FaShieldAlt, FaExclamationTriangle
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
    const [error, setError] = useState(null)
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
        setError(null)
        try {
            if (!currentCity) {
                setRestaurants([])
                setFilteredRestaurants([])
                setLoading(false)
                return
            }
            const result = await axios.get(
                `${serverUrl}/api/shop/get-by-city/${encodeURIComponent(currentCity)}`,
                { withCredentials: true }
            )
            setRestaurants(result.data || [])
            setFilteredRestaurants(result.data || [])
        } catch (error) {
            console.log("Error fetching restaurants:", error)
            const errorMsg = error.response?.data?.message || 'Failed to load restaurants'
            setError(errorMsg)
            toast.error(errorMsg)
            setRestaurants([])
            setFilteredRestaurants([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let filtered = restaurants

        // ✅ Search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(restaurant =>
                restaurant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                restaurant.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                restaurant.city?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // ✅ Category filters
        if (activeFilter === 'high-rated') {
            filtered = filtered.filter(r => (r.rating?.average || 0) >= 4.0)
        } else if (activeFilter === 'popular') {
            filtered = filtered.filter(r => (r.rating?.count || 0) >= 30)
        } else if (activeFilter === 'veg') {
            filtered = filtered.filter(r => r.items?.some(item => item.foodType === 'veg'))
        } else if (activeFilter === 'non-veg') {
            filtered = filtered.filter(r => r.items?.some(item => item.foodType === 'non veg'))
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

    // ✅ Get filter count
    const getFilterCount = () => {
        if (activeFilter === 'all') return 0
        return 1
    }

    return (
        <div 
            className='min-h-screen bg-white relative overflow-hidden pt-20'
            style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
        >
            {/* Google Font */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                
                .glass-premium-ultra {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(0, 0, 0, 0.06);
                }

                .text-gradient-animated {
                    background: linear-gradient(135deg, #e85d04, #f48c06, #ffba08, #e85d04);
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
                    background: rgba(232, 93, 4, 0.3);
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: rgba(232, 93, 4, 0.5);
                }
            `}</style>

            <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6'>
                
                {/* ✅ Premium Header */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 ${fadeUp}`}>
                    <div className='flex items-center gap-4'>
                        <motion.button 
                            whileHover={{ scale: 1.05, rotate: -5 }}
                            whileTap={{ scale: 0.95 }}
                            className='w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md'
                            onClick={() => navigate('/')}
                        >
                            <FaArrowLeft size={18} className='text-gray-600' />
                        </motion.button>
                        <div>
                            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3'>
                                <span className='text-gradient-animated'>Restaurants</span>
                                <span className='text-xs bg-orange-100 text-orange-600 px-2.5 py-0.5 rounded-full font-medium'>
                                    {filteredRestaurants.length}
                                </span>
                            </h1>
                            <p className='text-gray-400 text-sm flex items-center gap-2 flex-wrap'>
                                <span>Discover best restaurants in</span>
                                <span className='text-orange-500 font-medium bg-orange-50 px-2.5 py-0.5 rounded-full'>
                                    {currentCity || 'your city'}
                                </span>
                            </p>
                        </div>
                    </div>
                    
                    <div className='flex items-center gap-3'>
                        <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200'>
                            <FaStore size={12} className='text-orange-500' />
                            <span className='text-gray-500 text-xs'>
                                {filteredRestaurants.length} found
                            </span>
                        </div>
                        {getFilterCount() > 0 && (
                            <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200'>
                                <span className='text-orange-600 text-xs'>Filter: {activeFilter}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ✅ Premium Search & Filter Bar */}
                <div className={`flex flex-col sm:flex-row gap-3 mb-8 ${fadeUp}`}>
                    <div className='flex-1 relative group'>
                        <FaSearch size={16} className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300' />
                        <input
                            type="text"
                            placeholder='Search restaurants by name or location...'
                            className='w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:bg-white transition-all duration-300 text-sm'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <motion.button 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition z-10'
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
                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                                : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-800 hover:border-orange-300 hover:shadow-md'
                        }`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FaFilter size={14} className={showFilters ? 'animate-pulse' : ''} />
                        <span className='text-sm font-medium'>Filters</span>
                        {activeFilter !== 'all' && (
                            <span className='w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse' />
                        )}
                    </motion.button>
                </div>

                {/* ✅ Premium Filter Chips */}
                {showFilters && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className='flex flex-wrap gap-2 mb-6 p-2 rounded-xl bg-gray-50 border border-gray-200'
                    >
                        {[
                            { id: 'all', label: 'All', icon: '✦' },
                            { id: 'high-rated', label: 'High Rated (4.0+)', icon: '⭐' },
                            { id: 'popular', label: 'Popular', icon: '🔥' },
                            { id: 'veg', label: '🌿 Veg', icon: '' },
                            { id: 'non-veg', label: '🍗 Non-Veg', icon: '' }
                        ].map((filter) => (
                            <motion.button
                                key={filter.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
                                    activeFilter === filter.id 
                                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                                onClick={() => setActiveFilter(filter.id)}
                            >
                                <span>{filter.icon}</span>
                                {filter.label}
                            </motion.button>
                        ))}
                    </motion.div>
                )}

                {/* ✅ Error State */}
                {error && !loading && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='bg-red-50 border border-red-200 p-8 rounded-2xl text-center mb-6'
                    >
                        <FaExclamationTriangle size={32} className='text-red-400 mx-auto mb-3' />
                        <h3 className='text-lg font-semibold text-gray-800 mb-1'>Something went wrong</h3>
                        <p className='text-gray-500 text-sm'>{error}</p>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={fetchRestaurants}
                            className='mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium text-sm flex items-center gap-2 mx-auto'
                        >
                            Try Again
                        </motion.button>
                    </motion.div>
                )}

                {/* ✅ Premium Loading State */}
                {loading ? (
                    <div className='flex flex-col items-center justify-center py-32'>
                        <div className='relative'>
                            <ClipLoader size={60} color="#e85d04" />
                            <div className='absolute inset-0 animate-ping rounded-full border-2 border-orange-500/20' />
                            <div className='absolute inset-[-10px] rounded-full border border-orange-500/10 animate-spin-slow' />
                        </div>
                        <p className='mt-6 text-gray-400 text-sm animate-pulse flex items-center gap-2'>
                            <span className='w-1.5 h-1.5 rounded-full bg-orange-500/40 animate-pulse' />
                            Finding restaurants near you...
                            <span className='w-1.5 h-1.5 rounded-full bg-orange-500/40 animate-pulse animation-delay-300' />
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
                        className='bg-white border border-gray-200 p-12 sm:p-20 rounded-3xl text-center relative overflow-hidden group shadow-sm'
                    >
                        <div className='absolute inset-0 bg-gradient-to-r from-orange-50/50 to-amber-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700' />
                        <div className='relative z-10'>
                            <div className='w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-4 sm:mb-5 rounded-full bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-orange-100 shadow-sm'>
                                <MdRestaurant size={32} className="sm:text-4xl text-orange-300" />
                            </div>
                            <h3 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2'>
                                {!currentCity ? '📍 Select Your City First' : 'No Restaurants Found'}
                            </h3>
                            <p className='text-gray-400 text-sm max-w-sm mx-auto leading-relaxed'>
                                {!currentCity 
                                    ? 'Please select your city to see restaurants near you.'
                                    : searchQuery 
                                        ? `No restaurants match "${searchQuery}" in ${currentCity}`
                                        : `No restaurants available in ${currentCity} yet`}
                            </p>
                            {!currentCity ? (
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    className='mt-5 sm:mt-6 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium flex items-center gap-2 mx-auto text-xs sm:text-sm shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all'
                                    onClick={() => navigate('/')}
                                >
                                    Go to Home <FaArrowRight size={12} />
                                </motion.button>
                            ) : searchQuery && (
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    className='mt-5 sm:mt-6 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-gray-50 text-gray-600 hover:text-gray-800 transition-all duration-300 border border-gray-200 hover:border-gray-300 flex items-center gap-2 mx-auto text-xs sm:text-sm'
                                    onClick={() => setSearchQuery('')}
                                >
                                    <FaTimes size={12} /> Clear Search
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default Restaurants