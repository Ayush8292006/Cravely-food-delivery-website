import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { serverUrl } from '../App'
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
        try {
            const result = await axios.get(`${serverUrl}/api/item/get-by-shop/${shopId}`,
                { withCredentials: true })
            setShop(result.data.shop)
            setItems(result.data.items || [])
        } catch (error) {
            console.log(error)
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

    // ✅ Share Functions
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

    return (
        <div className='min-h-screen bg-[#0a0a0f] relative overflow-hidden'>
            
            {/* ✅ Animated Background Orbs */}
            <div className='absolute inset-0 pointer-events-none'>
                <motion.div 
                    animate={{ x: [0, 60, -30, 0], y: [0, -40, 50, 0] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className='absolute -top-40 -left-40 w-[700px] h-[700px] bg-[#ff2d55]/4 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ x: [0, -50, 30, 0], y: [0, 40, -50, 0] }}
                    transition={{ duration: 25, repeat: Infinity }}
                    className='absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-[#ff6b35]/4 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[#ffd93d]/2 rounded-full blur-3xl'
                />
            </div>

            <div className='relative z-10'>
                
                {/* ✅ Premium Back Button */}
                <motion.button 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className='fixed top-6 left-6 z-50 glass-premium-ultra px-5 py-3 rounded-full text-white/80 hover:text-white transition-all duration-300 flex items-center gap-2.5 text-sm hover:scale-105 hover:shadow-lg hover:shadow-[#ff2d55]/20 border border-white/10 hover:border-[#ff2d55]/30 backdrop-blur-xl'
                    onClick={() => navigate("/")}
                >
                    <FaArrowLeft size={14} className='group-hover:-translate-x-1 transition-transform' />
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
                        className='glass-premium-ultra p-3.5 rounded-full text-white/70 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#ff2d55]/20 border border-white/10 hover:border-[#ff2d55]/40 backdrop-blur-xl'
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
                            className='fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md'
                            onClick={() => setShowShareModal(false)}
                        >
                            <motion.div 
                                initial={{ scale: 0.8, y: 30 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.8, y: 30 }}
                                className='glass-premium-ultra p-8 rounded-3xl border border-white/10 max-w-md w-full mx-4 shadow-2xl shadow-[#ff2d55]/10'
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className='flex items-center justify-between mb-6'>
                                    <h3 className='text-xl font-bold text-white'>Share Restaurant</h3>
                                    <button 
                                        className='text-white/40 hover:text-white transition p-2 rounded-full hover:bg-white/5'
                                        onClick={() => setShowShareModal(false)}
                                    >
                                        <FaTimes size={20} />
                                    </button>
                                </div>

                                <div className='flex items-center gap-3 mb-6 p-3 rounded-xl bg-white/5 border border-white/5'>
                                    <img 
                                        src={shop?.image || 'https://via.placeholder.com/50'} 
                                        alt={shop?.name}
                                        className='w-12 h-12 rounded-lg object-cover'
                                    />
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-white font-semibold truncate'>{shop?.name}</p>
                                        <p className='text-white/30 text-xs truncate'>{shareUrl}</p>
                                    </div>
                                </div>

                                <div className='grid grid-cols-4 gap-3'>
                                    <button
                                        onClick={handleShareWhatsApp}
                                        className='flex flex-col items-center gap-2 p-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:scale-105'
                                    >
                                        <FaWhatsapp size={24} className='text-green-400' />
                                        <span className='text-white/60 text-[10px]'>WhatsApp</span>
                                    </button>
                                    <button
                                        onClick={handleShareTwitter}
                                        className='flex flex-col items-center gap-2 p-3 rounded-xl bg-blue-400/10 hover:bg-blue-400/20 border border-blue-400/20 hover:border-blue-400/40 transition-all duration-300 hover:scale-105'
                                    >
                                        <FaTwitter size={24} className='text-blue-400' />
                                        <span className='text-white/60 text-[10px]'>Twitter</span>
                                    </button>
                                    <button
                                        onClick={handleShareFacebook}
                                        className='flex flex-col items-center gap-2 p-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/20 hover:border-blue-600/40 transition-all duration-300 hover:scale-105'
                                    >
                                        <FaFacebook size={24} className='text-blue-500' />
                                        <span className='text-white/60 text-[10px]'>Facebook</span>
                                    </button>
                                    <button
                                        onClick={handleCopyLink}
                                        className='flex flex-col items-center gap-2 p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105'
                                    >
                                        {copied ? <FaCheck size={24} className='text-green-400' /> : <FaLink size={24} className='text-purple-400' />}
                                        <span className='text-white/60 text-[10px]'>{copied ? 'Copied!' : 'Copy Link'}</span>
                                    </button>
                                </div>

                                <div className='mt-4 pt-4 border-t border-white/5'>
                                    <p className='text-white/20 text-[10px] text-center'>Share this restaurant with your friends and family! 🍕</p>
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
                        <div className='absolute inset-0 group'>
                            <img 
                                src={shop.image} 
                                alt={shop.name} 
                                className='w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-all duration-[800ms]'
                            />
                            <div className='absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-black/30' />
                            <div className='absolute inset-0 bg-gradient-to-r from-[#ff2d55]/10 via-transparent to-[#ff6b35]/10' />
                            <div className='absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40' />
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
                                            className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ff2d55]/20 border border-[#ff2d55]/30 backdrop-blur-sm'
                                        >
                                            <MdRestaurant className='text-[#ff6b35] text-sm' />
                                            <span className='text-white/60 text-[10px] font-medium tracking-wider uppercase'>Verified Restaurant</span>
                                            <MdVerified size={12} className='text-blue-400' />
                                        </motion.div>

                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className='flex items-center gap-4'
                                        >
                                            <div className='w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff2d55]/30 to-[#ff6b35]/30 flex items-center justify-center border border-white/10 backdrop-blur-sm shadow-xl shadow-[#ff2d55]/10'>
                                                <MdRestaurant className='text-[#ff6b35] text-3xl' />
                                            </div>
                                            <div>
                                                <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight drop-shadow-2xl leading-tight'>
                                                    {shop.name}
                                                </h1>
                                                <div className='flex items-center gap-3 mt-1 flex-wrap'>
                                                    <span className='flex items-center gap-1.5 text-white/50 text-xs sm:text-sm'>
                                                        <FaMapMarkerAlt size={13} className='text-[#ff6b35]' />
                                                        {shop.address}, {shop.city}
                                                    </span>
                                                    <span className='w-1 h-1 rounded-full bg-white/20' />
                                                    <span className='flex items-center gap-1.5 text-white/50 text-xs sm:text-sm'>
                                                        <FaStar size={13} className='text-yellow-400' />
                                                        {shop.rating?.average || 4.5} 
                                                        <span className='text-white/30'>({shop.rating?.count || 0} reviews)</span>
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
                                            <div className='glass-premium-ultra px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border border-white/5 flex items-center gap-2 hover:border-[#ff6b35]/30 transition-all duration-300'>
                                                <FaClock size={12} className='text-[#ff6b35]' />
                                                <span className='text-white/70 text-[10px] sm:text-xs font-medium'>30-40 min</span>
                                            </div>
                                            <div className='glass-premium-ultra px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border border-white/5 flex items-center gap-2 hover:border-blue-400/30 transition-all duration-300'>
                                                <FaTruck size={12} className='text-blue-400' />
                                                <span className='text-white/70 text-[10px] sm:text-xs font-medium'>Free Delivery</span>
                                            </div>
                                            <div className='glass-premium-ultra px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border border-white/5 flex items-center gap-2 hover:border-green-400/30 transition-all duration-300'>
                                                <MdDeliveryDining size={12} className='text-green-400' />
                                                <span className='text-white/70 text-[10px] sm:text-xs font-medium'>Veg & Non-Veg</span>
                                            </div>
                                            <div className='glass-premium-ultra px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border border-white/5 flex items-center gap-2 hover:border-yellow-400/30 transition-all duration-300'>
                                                <FaFire size={12} className='text-yellow-400' />
                                                <span className='text-white/70 text-[10px] sm:text-xs font-medium'>Popular</span>
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
                                        <div className='glass-premium-ultra px-5 sm:px-7 py-3 sm:py-4 rounded-2xl border border-white/5 text-center hover:border-[#ff2d55]/30 transition-all duration-300 hover:scale-105'>
                                            <p className='text-2xl sm:text-3xl font-bold text-white'>{items.length}</p>
                                            <p className='text-white/30 text-[8px] sm:text-[10px] uppercase tracking-wider mt-0.5'>Items</p>
                                        </div>
                                        <div className='glass-premium-ultra px-5 sm:px-7 py-3 sm:py-4 rounded-2xl border border-white/5 text-center hover:border-green-400/30 transition-all duration-300 hover:scale-105'>
                                            <p className='text-2xl sm:text-3xl font-bold text-green-400'>{vegCount}</p>
                                            <p className='text-white/30 text-[8px] sm:text-[10px] uppercase tracking-wider mt-0.5'>Veg</p>
                                        </div>
                                        <div className='glass-premium-ultra px-5 sm:px-7 py-3 sm:py-4 rounded-2xl border border-white/5 text-center hover:border-red-400/30 transition-all duration-300 hover:scale-105'>
                                            <p className='text-2xl sm:text-3xl font-bold text-red-400'>{nonVegCount}</p>
                                            <p className='text-white/30 text-[8px] sm:text-[10px] uppercase tracking-wider mt-0.5'>Non-Veg</p>
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
                            <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#ff2d55]/20 to-[#ff6b35]/20 flex items-center justify-center border border-white/10'>
                                <FaUtensils size={18} className="sm:text-xl text-[#ff6b35]" />
                            </div>
                            <div>
                                <h2 className='text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight'>Our Menu</h2>
                                <p className='text-white/30 text-xs sm:text-sm flex items-center gap-2'>
                                    <span>Discover delicious items</span>
                                    <span className='w-1 h-1 rounded-full bg-white/20' />
                                    <span className='text-[#ff6b35] font-medium'>{filteredItems.length} items</span>
                                </p>
                            </div>
                        </div>
                        
                        {/* ✅ Premium Filter Buttons - Responsive */}
                        <div className='flex gap-1.5 sm:gap-2 p-1 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm flex-wrap'>
                            <button
                                className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-sm font-medium transition-all duration-300 ${
                                    activeFilter === 'all' 
                                        ? 'bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white shadow-lg shadow-[#ff2d55]/25'
                                        : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                                onClick={() => setActiveFilter('all')}
                            >
                                All
                            </button>
                            <button
                                className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
                                    activeFilter === 'veg' 
                                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                                        : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                                onClick={() => setActiveFilter('veg')}
                            >
                                <FaLeaf size={11} className="sm:text-sm" /> Veg
                            </button>
                            <button
                                className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
                                    activeFilter === 'non veg' 
                                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                                        : 'text-white/40 hover:text-white hover:bg-white/5'
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
                                <ClipLoader size={50} className="sm:w-[60px] sm:h-[60px]" color="#ff2d55" />
                                <div className='absolute inset-0 animate-ping rounded-full border-2 border-[#ff2d55]/20' />
                            </div>
                            <p className='mt-6 text-white/40 text-xs sm:text-sm animate-pulse flex items-center gap-2'>
                                <span className='w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#ff2d55]/40 animate-pulse' />
                                Loading delicious items...
                                <span className='w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#ff6b35]/40 animate-pulse animation-delay-300' />
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
                            className='glass-premium-ultra p-12 sm:p-20 rounded-3xl border border-white/5 text-center relative overflow-hidden group'
                        >
                            <div className='absolute inset-0 bg-gradient-to-r from-[#ff2d55]/8 to-[#ff6b35]/8 opacity-0 group-hover:opacity-100 transition-opacity duration-700' />
                            <div className='relative z-10'>
                                <div className='w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-4 sm:mb-5 rounded-full bg-gradient-to-br from-[#ff2d55]/10 to-[#ff6b35]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-white/10'>
                                    <FaUtensils size={32} className="sm:text-4xl text-white/20" />
                                </div>
                                <h3 className='text-xl sm:text-2xl font-semibold text-white mb-2'>No Items Found</h3>
                                <p className='text-white/30 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed'>
                                    {activeFilter !== 'all' 
                                        ? `No ${activeFilter} items available at this restaurant right now`
                                        : 'This restaurant hasn\'t added any items to their menu yet'}
                                </p>
                                {activeFilter !== 'all' && (
                                    <button 
                                        className='mt-5 sm:mt-6 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl glass-premium-ultra text-white/70 hover:text-white transition-all duration-300 border border-white/10 hover:border-[#ff2d55]/30 flex items-center gap-2 mx-auto text-xs sm:text-sm'
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
                @keyframes float-3d {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(40px, -30px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-float-3d {
                    animation: float-3d 15s ease-in-out infinite;
                }
                .animation-delay-300 { animation-delay: 0.3s; }

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
                    background: rgba(255, 255, 255, 0.04);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
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

export default Shop