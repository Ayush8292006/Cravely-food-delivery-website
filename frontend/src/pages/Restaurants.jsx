import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../../config'
import { 
    FaStore, FaStar, FaClock, FaMapMarkerAlt, 
    FaArrowLeft, FaSearch, FaFilter, FaUtensils,
    FaFire, FaTruck, FaLeaf, FaDrumstickBite,
    FaArrowRight, FaTimes, FaHeart, FaExclamationTriangle
} from "react-icons/fa";
import { MdDeliveryDining, MdRestaurant } from "react-icons/md";
import { ClipLoader } from 'react-spinners';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Nav from '../components/Nav';
import ShopCard from '../components/ShopCard';
import ComingSoonLocation from '../components/ComingSoonLocation';

function Restaurants() {
    const navigate = useNavigate()
    const { currentCity } = useSelector(state => state.user)
    const [restaurants, setRestaurants] = useState([])
    const [filteredRestaurants, setFilteredRestaurants] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState('all')
    const [showFilters, setShowFilters] = useState(false)

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

    const fetchAllRestaurants = async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await axios.get(
                `${serverUrl}/api/shop/get-by-city/all`,
                { withCredentials: true }
            )
            setRestaurants(result.data || [])
            setFilteredRestaurants(result.data || [])
            toast.info('Viewing all operational kitchens across all hubs')
        } catch {
            toast.error('Failed to load all restaurants')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let filtered = restaurants

        // Search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(restaurant =>
                restaurant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                restaurant.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                restaurant.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                restaurant.category?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Category filters
        if (activeFilter === 'high-rated') {
            filtered = filtered.filter(r => (r.rating?.average || 0) >= 4.0)
        } else if (activeFilter === 'popular') {
            filtered = filtered.filter(r => (r.rating?.count || 0) >= 30)
        } else if (activeFilter === 'veg') {
            filtered = filtered.filter(r => r.items?.some(item => item.foodType === 'veg'))
        } else if (activeFilter === 'non-veg') {
            filtered = filtered.filter(r => r.items?.some(item => item.foodType === 'non veg'))
        } else if (activeFilter === 'fast') {
            filtered = filtered.filter(r => (r.deliveryTime || '30-40 mins').includes('20') || (r.deliveryTime || '').includes('25') || (r.deliveryTime || '').includes('30'))
        }

        setFilteredRestaurants(filtered)
    }, [searchQuery, activeFilter, restaurants])

    const filterChips = [
        { id: 'all', label: 'All Kitchens' },
        { id: 'high-rated', label: 'Top Rated 4.0+ ⭐' },
        { id: 'popular', label: 'Popular 🔥' },
        { id: 'veg', label: 'Pure Veg 🌿' },
        { id: 'non-veg', label: 'Non-Veg 🍗' },
        { id: 'fast', label: 'Fast Delivery ⚡' }
    ]

    return (
        <div 
            className="min-h-screen bg-[#0A090D] text-white pt-[90px] sm:pt-[84px] pb-24 overflow-x-hidden selection:bg-[#FF6B00] selection:text-white"
            style={{ fontFamily: "'Poppins', 'Segoe UI', system-ui, sans-serif" }}
        >
            <Nav />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
                
                {/* 1. Header with Breadcrumb, Back Button, Titles & Counter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3.5">
                        <button 
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-xl bg-white/[0.06] hover:bg-[#FF6B00] border border-white/10 hover:border-transparent text-white/80 hover:text-white flex items-center justify-center transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                            title="Go Back"
                        >
                            <FaArrowLeft size={14} />
                        </button>
                        
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    Restaurants
                                </h1>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#FF6B00]/20 text-[#FF8C00] border border-orange-500/30">
                                    {filteredRestaurants.length}
                                </span>
                            </div>
                            
                            <p className="text-xs sm:text-sm text-gray-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                                <span>Discover best dining spots & cloud kitchens in</span>
                                <span className="text-[#FF8C00] font-bold">
                                    {currentCity || 'your city'}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-start sm:self-auto">
                        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs font-medium text-gray-300">
                            <FaStore size={12} className="text-[#FF6B00]" />
                            <span>{filteredRestaurants.length} available</span>
                        </div>
                    </div>
                </div>

                {/* 2. Search & Filters Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search Input */}
                    <div className="flex-1 relative group">
                        <FaSearch size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#FF6B00] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search restaurants by name, cuisine, or location..."
                            className="w-full bg-[#13121A] hover:bg-[#181722] border border-white/10 focus:border-[#FF6B00] rounded-full pl-11 pr-10 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none transition-all duration-300 shadow-inner"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button 
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs"
                                onClick={() => setSearchQuery('')}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    
                    {/* Filter Toggle Button */}
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-5 py-3 rounded-full transition-all duration-300 flex items-center gap-2 text-xs font-bold cursor-pointer ${
                            showFilters || activeFilter !== 'all'
                                ? 'bg-[#FF6B00] text-white shadow-lg shadow-orange-500/30'
                                : 'bg-[#13121A] hover:bg-white/[0.08] border border-white/10 text-white/80 hover:text-white'
                        }`}
                    >
                        <FaFilter size={12} />
                        <span>Filters</span>
                        {activeFilter !== 'all' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        )}
                    </button>
                </div>

                {/* 3. Quick Filter Chips Bar */}
                <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
                    {filterChips.map((chip) => (
                        <button
                            key={chip.id}
                            onClick={() => setActiveFilter(chip.id)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                                activeFilter === chip.id
                                    ? 'bg-[#FF6B00] text-white shadow-md shadow-orange-500/30 border border-orange-400'
                                    : 'bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-gray-300 hover:text-white'
                            }`}
                        >
                            {chip.label}
                        </button>
                    ))}
                </div>

                {/* 4. Error State */}
                {error && !loading && (
                    <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-2xl text-center space-y-3">
                        <FaExclamationTriangle size={32} className="text-red-400 mx-auto" />
                        <h3 className="text-base font-bold text-white">Something went wrong</h3>
                        <p className="text-xs text-gray-400">{error}</p>
                        <button
                            onClick={fetchRestaurants}
                            className="px-5 py-2 rounded-xl bg-[#FF6B00] hover:bg-orange-600 text-white text-xs font-bold transition"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* 5. Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-28 space-y-4">
                        <ClipLoader size={48} color="#FF6B00" />
                        <p className="text-xs text-gray-400 animate-pulse">
                            Finding top-rated restaurants near {currentCity || 'you'}...
                        </p>
                    </div>
                ) : filteredRestaurants.length > 0 ? (
                    /* 6. Restaurants Grid (Using new compact ShopCard) */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredRestaurants.map((restaurant, index) => (
                            <ShopCard 
                                key={restaurant._id} 
                                shop={restaurant} 
                                index={index} 
                                dark={true}
                            />
                        ))}
                    </div>
                ) : searchQuery ? (
                    /* Search Empty State */
                    <div className="bg-[#13121A] border border-white/10 p-12 sm:p-16 rounded-3xl text-center max-w-lg mx-auto space-y-4">
                        <div className="w-20 h-20 mx-auto rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF6B00]">
                            <MdRestaurant size={36} />
                        </div>
                        <h3 className="text-xl font-black text-white">No Matching Kitchens</h3>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            No restaurants match "{searchQuery}" in {currentCity || 'your area'}. Try a different cuisine or landmark.
                        </p>
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition"
                        >
                            Clear Search
                        </button>
                    </div>
                ) : (
                    /* 7. Professional Coming Soon & Active Hubs Showcase */
                    <ComingSoonLocation 
                        requestedCity={currentCity} 
                        onBrowseAll={fetchAllRestaurants} 
                    />
                )}
            </div>
        </div>
    )
}

export default Restaurants
