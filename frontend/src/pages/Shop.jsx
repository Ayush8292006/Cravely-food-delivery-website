import axios from 'axios'
import React, { useEffect, useState, useMemo } from 'react'
import { serverUrl } from '../../config'
import { useNavigate, useParams } from 'react-router-dom'
import { 
    FaUtensils, FaStar, FaClock, 
    FaMapMarkerAlt, FaTruck,
    FaArrowRight, FaShareAlt,
    FaWhatsapp, FaTwitter, FaFacebook, FaLink,
    FaCheck, FaTimes, FaCheckCircle, FaSearch,
    FaShoppingBag, FaArrowLeft, FaFire
} from "react-icons/fa";
import { MdDeliveryDining, MdRestaurant } from "react-icons/md";
import { ClipLoader } from 'react-spinners';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import Nav from '../components/Nav';
import FoodCard from '../components/FoodCard';

function Shop() {
    const { shopId } = useParams()
    const { cartItems } = useSelector(state => state.user)
    const [items, setItems] = useState([])
    const [shop, setShop] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeFilter, setActiveFilter] = useState('all')
    const [menuSearch, setMenuSearch] = useState('')
    const [showShareModal, setShowShareModal] = useState(false)
    const [copied, setCopied] = useState(false)
    const navigate = useNavigate()

    const handleShop = async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await axios.get(`${serverUrl}/api/item/get-by-shop/${shopId}`,
                { withCredentials: true })
            
            if (result.data) {
                setShop(result.data.shop)
                setItems(result.data.items || [])
            } else {
                setError('Shop not found')
            }
        } catch (error) {
            console.log('Shop error:', error)
            const errorMsg = error.response?.data?.message || 'Failed to load shop'
            setError(errorMsg)
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        handleShop()
    }, [shopId])

    // Filter items by food type & menu search
    const filteredItems = useMemo(() => {
        let list = items

        if (activeFilter !== 'all') {
            list = list.filter(item => item.foodType === activeFilter)
        }

        if (menuSearch.trim()) {
            const query = menuSearch.toLowerCase()
            list = list.filter(item => 
                item.name?.toLowerCase().includes(query) ||
                item.category?.toLowerCase().includes(query)
            )
        }

        return list
    }, [items, activeFilter, menuSearch])

    const vegCount = items.filter(i => i.foodType === 'veg').length
    const nonVegCount = items.filter(i => i.foodType === 'non veg').length

    // Calculate cart total for floating bar
    const cartTotal = useMemo(() => {
        return (cartItems || []).reduce((acc, curr) => acc + ((curr.price || 0) * (curr.quantity || 1)), 0)
    }, [cartItems])

    // Share Functions
    const shareUrl = window.location.href
    const shareTitle = shop ? `Check out ${shop.name} on Cravely!` : 'Check out this restaurant on Cravely!'

    const handleShareWhatsApp = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareTitle}\n\n${shareUrl}`)}`, '_blank')
        setShowShareModal(false)
    }

    const handleShareTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
        setShowShareModal(false)
    }

    const handleShareFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
        setShowShareModal(false)
    }

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
            toast.success('Link copied to clipboard!')
        } catch (err) {
            const textArea = document.createElement('textarea')
            textArea.value = shareUrl
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
            toast.success('Link copied to clipboard!')
        }
        setShowShareModal(false)
    }

    const handleShareNative = () => {
        if (navigator.share) {
            navigator.share({
                title: shareTitle,
                text: `Check out ${shop?.name} on Cravely!`,
                url: shareUrl,
            }).catch(() => {})
        } else {
            setShowShareModal(true)
        }
    }

    if (error && !loading) {
        return (
            <div className="min-h-screen bg-[#0A090D] text-white flex items-center justify-center p-4">
                <Nav />
                <div className="text-center max-w-md bg-[#13121A] border border-white/10 p-10 rounded-3xl space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                        <FaTimes className="text-red-400 text-3xl" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Oops! Something went wrong</h2>
                    <p className="text-gray-400 text-xs">{error}</p>
                    <div className="flex gap-3 justify-center pt-2">
                        <button
                            onClick={handleShop}
                            className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-orange-600 text-white font-bold text-xs transition"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/restaurants')}
                            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition"
                        >
                            All Restaurants
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div 
            className="min-h-screen bg-[#0A090D] text-white pt-[80px] sm:pt-[76px] pb-28 overflow-x-hidden selection:bg-[#FF6B00] selection:text-white"
            style={{ fontFamily: "'Poppins', 'Segoe UI', system-ui, sans-serif" }}
        >
            <Nav />

            {/* 1. CINEMATIC RESTAURANT STAGE HERO */}
            {shop && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
                    <div className="relative rounded-[28px] sm:rounded-[36px] bg-[#13121A] border border-white/10 overflow-hidden shadow-2xl p-6 sm:p-8 lg:p-10">
                        
                        {/* Top Action Row: Back Link & Share Button */}
                        <div className="flex items-center justify-between pb-6 border-b border-white/[0.06]">
                            <button
                                onClick={() => navigate('/restaurants')}
                                className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition cursor-pointer"
                            >
                                <FaArrowLeft size={11} className="text-[#FF6B00]" />
                                <span>Back to Restaurants</span>
                            </button>

                            <button
                                onClick={handleShareNative}
                                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-medium transition cursor-pointer"
                                title="Share restaurant"
                            >
                                <FaShareAlt size={12} className="text-[#FF6B00]" />
                                <span>Share</span>
                            </button>
                        </div>

                        {/* Main Stage Grid: Left Details + Right Spotlight Photo */}
                        <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                            
                            {/* Left Column: Typography, Ratings, Address & Quick Highlights */}
                            <div className="lg:col-span-7 space-y-4">
                                
                                {/* Status Badges */}
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-extrabold shadow-sm">
                                        <FaCheckCircle size={11} />
                                        <span>Verified Partner</span>
                                    </div>

                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] border border-white/10 text-white text-xs font-bold">
                                        <FaStar className="text-amber-400" size={11} />
                                        <span>{shop.rating?.average ? Number(shop.rating.average).toFixed(1) : '5.0'}</span>
                                        <span className="text-gray-400 font-normal">
                                            {shop.rating?.count ? `(${shop.rating.count} reviews)` : '(New on Cravely)'}
                                        </span>
                                    </div>

                                    {shop.category && (
                                        <span className="px-3 py-1 rounded-full bg-[#FF6B00]/15 text-[#FF8C00] border border-orange-500/30 text-xs font-bold">
                                            {shop.category}
                                        </span>
                                    )}
                                </div>

                                {/* Restaurant Title */}
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                                    {shop.name}
                                </h1>

                                {/* Address */}
                                <p className="text-xs sm:text-sm text-gray-300 flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-[#FF6B00] flex-shrink-0" size={13} />
                                    <span>{shop.address}, {shop.city}</span>
                                </p>

                                {/* Highlights Strip (Solid Clean Boxes, No Gradients) */}
                                <div className="pt-2 grid grid-cols-3 gap-3 max-w-md">
                                    <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center">
                                        <div className="flex items-center justify-center gap-1 text-[#FF6B00] mb-0.5">
                                            <FaClock size={12} />
                                        </div>
                                        <p className="text-xs font-bold text-white">30-40 min</p>
                                        <p className="text-[10px] text-gray-400">Delivery Time</p>
                                    </div>

                                    <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center">
                                        <div className="flex items-center justify-center gap-1 text-emerald-400 mb-0.5">
                                            <FaTruck size={12} />
                                        </div>
                                        <p className="text-xs font-bold text-white">Free</p>
                                        <p className="text-[10px] text-gray-400">Delivery Fee</p>
                                    </div>

                                    <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center">
                                        <div className="flex items-center justify-center gap-1 text-amber-400 mb-0.5">
                                            <FaUtensils size={12} />
                                        </div>
                                        <p className="text-xs font-bold text-white">{items.length}</p>
                                        <p className="text-[10px] text-gray-400">Menu Items</p>
                                    </div>
                                </div>

                                {/* Menu Stats Badges (Items, Veg, Non-Veg) */}
                                <div className="pt-1 flex items-center gap-2.5 flex-wrap">
                                    <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-2">
                                        <span className="text-sm font-black text-white">{items.length}</span>
                                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">ITEMS</span>
                                    </div>
                                    <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2">
                                        <span className="text-sm font-black text-emerald-400">{vegCount}</span>
                                        <span className="text-[10px] uppercase tracking-wider text-emerald-400/90 font-bold">VEG</span>
                                    </div>
                                    <div className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2">
                                        <span className="text-sm font-black text-rose-400">{nonVegCount}</span>
                                        <span className="text-[10px] uppercase tracking-wider text-rose-400/90 font-bold">NON-VEG</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: High-Definition Spotlight Image */}
                            <div className="lg:col-span-5 flex justify-center lg:justify-end">
                                <div className="relative w-full max-w-md aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
                                    <img 
                                        src={shop.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop'} 
                                        alt={shop.name} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                    />
                                    {/* Clean linear vignette at bottom */}
                                    <div className="absolute inset-0 bg-black/25 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. MENU SECTION & FILTER BAR */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-6">
                
                {/* Menu Header with In-Restaurant Search & Filter Pills */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                    
                    {/* Left Title */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#13121A] border border-white/10 flex items-center justify-center text-[#FF6B00]">
                            <FaUtensils size={15} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Our Menu</h2>
                            <p className="text-xs text-gray-400">
                                Freshly prepared dishes • <strong className="text-[#FF8C00]">{filteredItems.length} items</strong>
                            </p>
                        </div>
                    </div>

                    {/* Right Controls: In-Menu Search & Solid Filter Tabs */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Search Input within Menu */}
                        <div className="relative">
                            <FaSearch size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                            <input
                                type="text"
                                placeholder="Search in menu..."
                                value={menuSearch}
                                onChange={(e) => setMenuSearch(e.target.value)}
                                className="bg-[#13121A] border border-white/10 focus:border-[#FF6B00] rounded-full pl-9 pr-8 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none transition w-44 sm:w-56"
                            />
                            {menuSearch && (
                                <button
                                    onClick={() => setMenuSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Solid Filter Tabs (No Gradients) */}
                        <div className="flex items-center gap-1 p-1 bg-[#13121A] border border-white/10 rounded-full">
                            <button
                                onClick={() => setActiveFilter('all')}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                    activeFilter === 'all'
                                        ? 'bg-[#FF6B00] text-white'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                All ({items.length})
                            </button>
                            <button
                                onClick={() => setActiveFilter('veg')}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    activeFilter === 'veg'
                                        ? 'bg-emerald-600 text-white'
                                        : 'text-gray-400 hover:text-emerald-400'
                                }`}
                            >
                                <span>🌿 Veg ({vegCount})</span>
                            </button>
                            <button
                                onClick={() => setActiveFilter('non veg')}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    activeFilter === 'non veg'
                                        ? 'bg-rose-600 text-white'
                                        : 'text-gray-400 hover:text-rose-400'
                                }`}
                            >
                                <span>🍗 Non-Veg ({nonVegCount})</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-3">
                        <ClipLoader size={44} color="#FF6B00" />
                        <p className="text-xs text-gray-400 animate-pulse">Loading culinary items...</p>
                    </div>
                ) : filteredItems.length > 0 ? (
                    /* Food Cards Grid (Using new compact FoodCard with dark theme) */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredItems.map((item, index) => (
                            <FoodCard data={item} key={item._id || index} dark={true} />
                        ))}
                    </div>
                ) : (
                    /* Empty Menu State */
                    <div className="bg-[#13121A] border border-white/10 p-12 rounded-3xl text-center max-w-md mx-auto space-y-3">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                            <FaUtensils size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-white">No Items Found</h3>
                        <p className="text-xs text-gray-400">
                            {menuSearch 
                                ? `No items match "${menuSearch}" in this restaurant.`
                                : activeFilter !== 'all' 
                                    ? `No ${activeFilter} dishes available right now.`
                                    : 'This restaurant has not added any items to their menu yet.'}
                        </p>
                        {(activeFilter !== 'all' || menuSearch) && (
                            <button 
                                onClick={() => {
                                    setActiveFilter('all')
                                    setMenuSearch('')
                                }}
                                className="px-5 py-2 rounded-xl bg-[#FF6B00] hover:bg-orange-600 text-white text-xs font-bold transition"
                            >
                                Reset Menu Filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* 3. NATIVE FLOATING CART STRIP (Appears when items are in cart) */}
            <AnimatePresence>
                {cartItems?.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4"
                    >
                        <div 
                            onClick={() => navigate('/cart')}
                            className="bg-[#FF6B00] hover:bg-orange-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl shadow-black/80 flex items-center justify-between cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                                    <FaShoppingBag size={16} />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider">{cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'} Added</p>
                                    <p className="text-sm font-extrabold">₹{cartTotal}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider bg-white/20 px-3.5 py-1.5 rounded-xl">
                                <span>View Cart</span>
                                <FaArrowRight size={10} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Share Modal */}
            <AnimatePresence>
                {showShareModal && (
                    <div 
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
                        onClick={() => setShowShareModal(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#13121A] border border-white/15 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl text-white"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                <h3 className="text-base font-bold text-white">Share Restaurant</h3>
                                <button 
                                    className="text-gray-400 hover:text-white p-1 text-xs"
                                    onClick={() => setShowShareModal(false)}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                <img 
                                    src={shop?.image || 'https://via.placeholder.com/50'} 
                                    alt={shop?.name} 
                                    className="w-12 h-12 rounded-lg object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{shop?.name}</p>
                                    <p className="text-[11px] text-gray-400 truncate">{shareUrl}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-2.5">
                                <button
                                    onClick={handleShareWhatsApp}
                                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition hover:scale-105"
                                >
                                    <FaWhatsapp size={22} className="text-emerald-400" />
                                    <span className="text-[10px] text-gray-300">WhatsApp</span>
                                </button>
                                <button
                                    onClick={handleShareTwitter}
                                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition hover:scale-105"
                                >
                                    <FaTwitter size={22} className="text-sky-400" />
                                    <span className="text-[10px] text-gray-300">Twitter</span>
                                </button>
                                <button
                                    onClick={handleShareFacebook}
                                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition hover:scale-105"
                                >
                                    <FaFacebook size={22} className="text-blue-500" />
                                    <span className="text-[10px] text-gray-300">Facebook</span>
                                </button>
                                <button
                                    onClick={handleCopyLink}
                                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition hover:scale-105"
                                >
                                    {copied ? <FaCheck size={22} className="text-emerald-400" /> : <FaLink size={22} className="text-[#FF6B00]" />}
                                    <span className="text-[10px] text-gray-300">{copied ? 'Copied!' : 'Copy'}</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Shop
