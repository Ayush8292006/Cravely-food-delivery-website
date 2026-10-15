import axios from 'axios'
import React, { useEffect, useState } from 'react'
// ✅ FIXED: Correct import
import { serverUrl } from '../../config'
import { useNavigate, useParams } from 'react-router-dom'
import { 
    FaUtensils, FaStore, FaArrowLeft, FaStar, FaClock, 
    FaMapMarkerAlt, FaPhone, FaShoppingBag, FaTag, 
    FaFire, FaLeaf, FaRegClock, FaTruck,
    FaArrowRight, FaSearch, FaFilter, FaHeart,
    FaShareAlt, FaBookmark, FaInfoCircle, FaCopy,
    FaWhatsapp, FaTwitter, FaFacebook, FaLink,
    FaCheck, FaTimes, FaMotorcycle, FaShieldAlt,
    FaAward, FaGem, FaCrown, FaRocket
} from "react-icons/fa";
import { IoIosPin } from "react-icons/io";
import { MdDeliveryDining, MdRestaurant, MdVerified } from "react-icons/md";
import { ClipLoader } from 'react-spinners';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import FoodCard from '../components/FoodCard';

function Shop() {
    const { shopId } = useParams()
    const [items, setItems] = useState([])
    const [shop, setShop] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [activeFilter, setActiveFilter] = useState('all')
    const [showShareModal, setShowShareModal] = useState(false)
    const [copied, setCopied] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 300)
    }, [])

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

    // ✅ Filter items by food type
    const filteredItems = activeFilter === 'all' 
        ? items 
        : items.filter(item => item.foodType === activeFilter)

    // ✅ Count items by type
    const vegCount = items.filter(i => i.foodType === 'veg').length
    const nonVegCount = items.filter(i => i.foodType === 'non veg').length

    const fadeUp = `transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`

    // ✅ Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
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
                duration: 0.5,
                ease: "easeOut"
            }
        }
    }

    // ✅ Share Functions - FIXED: Added missing backtick
    const shareUrl = window.location.href
    const shareTitle = shop ? `Check out ${shop.name} on Cravely! 🍕` : 'Check out this restaurant on Cravely!'

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
            toast.success('Link copied to clipboard! 📋')
        } catch (err) {
            const textArea = document.createElement('textarea')
            textArea.value = shareUrl
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
            toast.success('Link copied to clipboard! 📋')
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

    // ✅ Error State
    if (error && !loading) {
        return (
            <div className='min-h-screen bg-white flex items-center justify-center p-4'>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='text-center max-w-md'
                >
                    <div className='w-24 h-24 mx-auto rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mb-4'>
                        <FaTimes className='text-red-500 text-5xl' />
                    </div>
                    <h2 className='text-2xl font-bold text-gray-800 mb-2'>Oops! Something went wrong</h2>
                    <p className='text-gray-500 text-sm mb-6'>{error}</p>
                    <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleShop}
                            className='px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium flex items-center justify-center gap-2 shadow-sm shadow-orange-200'
                        >
                            Try Again
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/')}
                            className='px-6 py-2.5 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200 transition'
                        >
                            Go Home
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div 
            className='min-h-screen bg-[#f8f4f0] relative'
            style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                
                ::-webkit-scrollbar {
                    width: 4px;
                }
                ::-webkit-scrollbar-track {
                    background: #f0ebe5;
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb {
                    background: #d4845a;
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #c2744a;
                }
            `}</style>

            <div className='relative z-10'>
                
                {/* ✅ Premium Back Button */}
                <motion.button 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className='fixed top-6 left-6 z-50 bg-white/90 backdrop-blur-sm px-5 py-3 rounded-full text-gray-700 hover:text-gray-900 transition-all duration-300 flex items-center gap-2.5 text-sm hover:shadow-md border-2 border-gray-200 hover:border-orange-300'
                    onClick={() => navigate("/")}
                >
                    <FaArrowLeft size={14} />
                    <span className='font-medium hidden sm:inline'>Back to Home</span>
                </motion.button>

                {/* ✅ Share Button */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className='fixed top-6 right-6 z-50'
                >
                    <button 
                        className='bg-white/90 backdrop-blur-sm p-3.5 rounded-full text-gray-600 hover:text-orange-600 transition-all duration-300 hover:shadow-md border-2 border-gray-200 hover:border-orange-300'
                        onClick={handleShareNative}
                        title="Share this restaurant"
                    >
                        <FaShareAlt size={18} />
                    </button>
                </motion.div>

                {/* ✅ Share Modal */}
                <AnimatePresence>
                    {showShareModal && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className='fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm'
                            onClick={() => setShowShareModal(false)}
                        >
                            <motion.div 
                                initial={{ scale: 0.8, y: 30 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.8, y: 30 }}
                                className='bg-white p-8 rounded-3xl border-2 border-gray-200 max-w-md w-full mx-4 shadow-xl'
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className='flex items-center justify-between mb-6'>
                                    <h3 className='text-xl font-bold text-gray-800'>Share Restaurant</h3>
                                    <button 
                                        className='text-gray-400 hover:text-gray-600 transition p-2 rounded-full hover:bg-gray-100'
                                        onClick={() => setShowShareModal(false)}
                                    >
                                        <FaTimes size={20} />
                                    </button>
                                </div>

                                <div className='flex items-center gap-3 mb-6 p-3 rounded-xl bg-gray-50 border-2 border-gray-200'>
                                    <img 
                                        src={shop?.image || 'https://via.placeholder.com/50/f0ebe5/cbb8a8?text=No+Image'} 
                                        alt={shop?.name}
                                        className='w-12 h-12 rounded-lg object-cover'
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/50/f0ebe5/cbb8a8?text=No+Image'
                                        }}
                                    />
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-gray-800 font-semibold truncate'>{shop?.name || 'Restaurant'}</p>
                                        <p className='text-gray-400 text-xs truncate'>{shareUrl}</p>
                                    </div>
                                </div>

                                <div className='grid grid-cols-4 gap-3'>
                                    <button
                                        onClick={handleShareWhatsApp}
                                        className='flex flex-col items-center gap-2 p-3 rounded-xl bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-300 transition-all duration-300 hover:scale-105'
                                    >
                                        <FaWhatsapp size={24} className='text-green-500' />
                                        <span className='text-gray-600 text-[10px] font-medium'>WhatsApp</span>
                                    </button>
                                    <button
                                        onClick={handleShareTwitter}
                                        className='flex flex-col items-center gap-2 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 hover:scale-105'
                                    >
                                        <FaTwitter size={24} className='text-blue-500' />
                                        <span className='text-gray-600 text-[10px] font-medium'>Twitter</span>
                                    </button>
                                    <button
                                        onClick={handleShareFacebook}
                                        className='flex flex-col items-center gap-2 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 hover:scale-105'
                                    >
                                        <FaFacebook size={24} className='text-blue-600' />
                                        <span className='text-gray-600 text-[10px] font-medium'>Facebook</span>
                                    </button>
                                    <button
                                        onClick={handleCopyLink}
                                        className='flex flex-col items-center gap-2 p-3 rounded-xl bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 hover:scale-105'
                                    >
                                        {copied ? <FaCheck size={24} className='text-green-500' /> : <FaLink size={24} className='text-purple-500' />}
                                        <span className='text-gray-600 text-[10px] font-medium'>{copied ? 'Copied!' : 'Copy Link'}</span>
                                    </button>
                                </div>

                                <div className='mt-4 pt-4 border-t border-gray-200'>
                                    <p className='text-gray-400 text-[10px] text-center'>Share this restaurant with your friends and family! 🍕</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ✅ Hero Section */}
                {shop && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className='relative w-full h-[360px] sm:h-[440px] md:h-[500px] lg:h-[540px] overflow-hidden'
                    >
                        {/* Background Image */}
                        <div className='absolute inset-0'>
                            <img 
                                src={shop.image || 'https://via.placeholder.com/1200x600/f0ebe5/cbb8a8?text=Restaurant'} 
                                alt={shop.name} 
                                className='w-full h-full object-cover'
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/1200x600/f0ebe5/cbb8a8?text=Restaurant'
                                }}
                            />
                            <div className='absolute inset-0 bg-gradient-to-t from-[#f8f4f0] via-[#f8f4f0]/60 to-black/30' />
                            <div className='absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5' />
                        </div>

                        {/* Hero Content */}
                        <div className='absolute inset-0 flex flex-col justify-end px-6 sm:px-12 pb-10 sm:pb-16'>
                            <div className='max-w-7xl mx-auto w-full'>
                                <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 ${fadeUp}`}>
                                    
                                    {/* Left - Shop Info */}
                                    <div className='space-y-4'>
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border-2 border-gray-200 shadow-sm'
                                        >
                                            <MdRestaurant className='text-orange-500 text-sm' />
                                            <span className='text-gray-600 text-[10px] font-semibold uppercase tracking-wider'>Verified Restaurant</span>
                                            <MdVerified size={12} className='text-blue-500' />
                                        </motion.div>

                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className='flex items-center gap-4'
                                        >
                                            <div className='w-14 h-14 rounded-2xl bg-white shadow-md border-2 border-gray-200 flex items-center justify-center'>
                                                <MdRestaurant className='text-orange-500 text-3xl' />
                                            </div>
                                            <div>
                                                <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight drop-shadow-sm leading-tight'>
                                                    {shop.name}
                                                </h1>
                                                <div className='flex items-center gap-3 mt-1 flex-wrap'>
                                                    <span className='flex items-center gap-1.5 text-gray-600 text-xs sm:text-sm font-medium'>
                                                        <FaMapMarkerAlt size={13} className='text-orange-500' />
                                                        {shop.address}, {shop.city}
                                                    </span>
                                                    <span className='w-1 h-1 rounded-full bg-gray-300' />
                                                    <span className='flex items-center gap-1.5 text-gray-600 text-xs sm:text-sm font-medium'>
                                                        <FaStar size={13} className='text-amber-400' />
                                                        {shop.rating?.average || 4.5} 
                                                        <span className='text-gray-400'>({shop.rating?.count || 0} reviews)</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>

                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className='flex flex-wrap gap-2 sm:gap-3'
                                        >
                                            <div className='bg-white border-2 border-gray-200 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full flex items-center gap-2 shadow-sm'>
                                                <FaClock size={12} className='text-orange-500' />
                                                <span className='text-gray-700 text-[10px] sm:text-xs font-medium'>30-40 min</span>
                                            </div>
                                            <div className='bg-white border-2 border-gray-200 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full flex items-center gap-2 shadow-sm'>
                                                <FaTruck size={12} className='text-blue-500' />
                                                <span className='text-gray-700 text-[10px] sm:text-xs font-medium'>Free Delivery</span>
                                            </div>
                                            <div className='bg-white border-2 border-gray-200 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full flex items-center gap-2 shadow-sm'>
                                                <MdDeliveryDining size={12} className='text-green-500' />
                                                <span className='text-gray-700 text-[10px] sm:text-xs font-medium'>Veg & Non-Veg</span>
                                            </div>
                                            <div className='bg-white border-2 border-gray-200 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full flex items-center gap-2 shadow-sm'>
                                                <FaFire size={12} className='text-amber-500' />
                                                <span className='text-gray-700 text-[10px] sm:text-xs font-medium'>Popular</span>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* ✅ Right - Stats Cards */}
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className='flex gap-2 sm:gap-4 flex-shrink-0'
                                    >
                                        <div className='bg-white border-2 border-gray-200 px-5 sm:px-7 py-3 sm:py-4 rounded-2xl text-center shadow-sm hover:border-orange-300 transition-all duration-300'>
                                            <p className='text-2xl sm:text-3xl font-bold text-gray-800'>{items.length}</p>
                                            <p className='text-gray-400 text-[8px] sm:text-[10px] uppercase tracking-wider mt-0.5 font-medium'>Items</p>
                                        </div>
                                        <div className='bg-green-50 border-2 border-green-200 px-5 sm:px-7 py-3 sm:py-4 rounded-2xl text-center shadow-sm hover:border-green-300 transition-all duration-300'>
                                            <p className='text-2xl sm:text-3xl font-bold text-green-600'>{vegCount}</p>
                                            <p className='text-green-500 text-[8px] sm:text-[10px] uppercase tracking-wider mt-0.5 font-medium'>Veg</p>
                                        </div>
                                        <div className='bg-red-50 border-2 border-red-200 px-5 sm:px-7 py-3 sm:py-4 rounded-2xl text-center shadow-sm hover:border-red-300 transition-all duration-300'>
                                            <p className='text-2xl sm:text-3xl font-bold text-red-600'>{nonVegCount}</p>
                                            <p className='text-red-500 text-[8px] sm:text-[10px] uppercase tracking-wider mt-0.5 font-medium'>Non-Veg</p>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ✅ Menu Section */}
                <div className='max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16'>
                    
                    {/* ✅ Header with Filter */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10'
                    >
                        <div className='flex items-center gap-3 sm:gap-4'>
                            <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-orange-50 border-2 border-orange-200 flex items-center justify-center'>
                                <FaUtensils size={18} className="sm:text-xl text-orange-500" />
                            </div>
                            <div>
                                <h2 className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight'>Our Menu</h2>
                                <p className='text-gray-500 text-xs sm:text-sm flex items-center gap-2 font-medium'>
                                    <span>Discover delicious items</span>
                                    <span className='w-1 h-1 rounded-full bg-gray-300' />
                                    <span className='text-orange-600 font-bold'>{filteredItems.length} items</span>
                                </p>
                            </div>
                        </div>
                        
                        {/* ✅ Premium Filter Buttons */}
                        <div className='flex gap-1.5 sm:gap-2 p-1 rounded-xl bg-white border-2 border-gray-200 shadow-sm flex-wrap'>
                            <button
                                className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-sm font-semibold transition-all duration-300 ${
                                    activeFilter === 'all' 
                                        ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                                }`}
                                onClick={() => setActiveFilter('all')}
                            >
                                All
                            </button>
                            <button
                                className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-sm font-semibold transition-all duration-300 flex items-center gap-1 ${
                                    activeFilter === 'veg' 
                                        ? 'bg-green-500 text-white shadow-sm shadow-green-200'
                                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                                }`}
                                onClick={() => setActiveFilter('veg')}
                            >
                                <FaLeaf size={11} className="sm:text-sm" /> Veg
                            </button>
                            <button
                                className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-sm font-semibold transition-all duration-300 flex items-center gap-1 ${
                                    activeFilter === 'non veg' 
                                        ? 'bg-red-500 text-white shadow-sm shadow-red-200'
                                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                                }`}
                                onClick={() => setActiveFilter('non veg')}
                            >
                                <span className="text-red-400 text-xs sm:text-sm">🍗</span> Non-Veg
                            </button>
                        </div>
                    </motion.div>

                    {/* ✅ Loading State */}
                    {loading ? (
                        <div className='flex flex-col items-center justify-center py-20 sm:py-28'>
                            <div className='relative'>
                                <ClipLoader size={50} className="sm:w-[60px] sm:h-[60px]" color="#d4845a" />
                                <div className='absolute inset-0 animate-ping rounded-full border-2 border-orange-300/20' />
                            </div>
                            <p className='mt-6 text-gray-500 text-xs sm:text-sm animate-pulse flex items-center gap-2 font-medium'>
                                <span className='w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-orange-400 animate-pulse' />
                                Loading delicious items...
                                <span className='w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-orange-400 animate-pulse animation-delay-300' />
                            </p>
                        </div>
                    ) : filteredItems.length > 0 ? (
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
                        >
                            {filteredItems.map((item, index) => (
                                <motion.div 
                                    key={index} 
                                    variants={itemVariants}
                                    className='animate-float-up' 
                                    style={{ animationDelay: `${0.06 * index}s` }}
                                >
                                    <FoodCard data={item} />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className='bg-white border-2 border-gray-200 p-12 sm:p-20 rounded-3xl text-center shadow-sm'
                        >
                            <div className='relative z-10'>
                                <div className='w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-4 sm:mb-5 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center'>
                                    <FaUtensils size={32} className="sm:text-4xl text-gray-300" />
                                </div>
                                <h3 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2'>No Items Found</h3>
                                <p className='text-gray-500 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed font-medium'>
                                    {activeFilter !== 'all' 
                                        ? `No ${activeFilter} items available at this restaurant right now`
                                        : 'This restaurant hasn\'t added any items to their menu yet'}
                                </p>
                                {activeFilter !== 'all' && (
                                    <button 
                                        className='mt-5 sm:mt-6 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-gray-100 border-2 border-gray-200 text-gray-600 hover:text-gray-800 hover:border-orange-300 transition-all duration-300 flex items-center gap-2 mx-auto text-xs sm:text-sm font-semibold'
                                        onClick={() => setActiveFilter('all')}
                                    >
                                        <FaArrowRight size={11} className="sm:text-sm" /> Show All Items
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            <style jsx>{`
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
            `}</style>
        </div>
    )
}

export default Shop