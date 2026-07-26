import React, { useEffect, useRef, useState } from 'react'
import Nav from './Nav'
import { categories } from '../category'
import CategoryCard from './CategoryCard'
import ShopCard from '../components/ShopCard'
import { 
    FaChevronCircleLeft, FaChevronCircleRight, FaStar, FaClock, 
    FaTruck, FaStore, FaShieldAlt, FaHeadset, FaFire, FaArrowRight, 
    FaUtensils, FaCrown, FaRocket, FaGem, FaInfinity, FaAward,
    FaHeart, FaSmile, FaBolt, FaMagic,
    FaShoppingBag, FaTag, FaGift, FaBell, FaArrowLeft
} from "react-icons/fa";
import { useSelector } from 'react-redux';
import FoodCard from './FoodCard';
import { useNavigate } from 'react-router-dom';
import { FaStoreSlash } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';

// ✅ Hero Images
const heroImages = [
    { id: 1, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop", title: "Delicious Pizza", subtitle: "Freshly baked with love" },
    { id: 2, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop", title: "Juicy Burger", subtitle: "100% premium beef" },
    { id: 3, image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800&h=600&fit=crop", title: "Tasty Pancakes", subtitle: "With maple syrup" },
    { id: 4, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop", title: "Exquisite Platter", subtitle: "Fine dining experience" },
    { id: 5, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop", title: "Healthy Salad", subtitle: "Fresh & organic" }
]

function UserDashboard() {
    const { currentCity, shopsInMyCity, itemsInMyCity, searchItems } = useSelector(state => state.user)
    const cateScrollRef = useRef()
    const shopScrollRef = useRef()
    const navigate = useNavigate()
    const [showLeftCateButton, setShowLeftCateButton] = useState(false)
    const [showRightCateButton, setShowRightCateButton] = useState(false)
    const [showLeftShopButton, setShowLeftShopButton] = useState(false)
    const [showRightShopButton, setShowRightShopButton] = useState(false)
    const [updatedItemsList, setUpdatedItemsList] = useState([])
    const [isLoaded, setIsLoaded] = useState(false)
    const [activeCategory, setActiveCategory] = useState('All')
    const [showScrollTop, setShowScrollTop] = useState(false)
    const [showCategoryView, setShowCategoryView] = useState(false)
    const [selectedCategoryItems, setSelectedCategoryItems] = useState([])
    const [selectedCategoryName, setSelectedCategoryName] = useState('')
    
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [direction, setDirection] = useState(1)

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 300)
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setDirection(1)
            setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
        }, 4000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 500)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleCategoryClick = (category) => {
        navigate(`/category/${encodeURIComponent(category)}`)
    }

    useEffect(() => {
        setUpdatedItemsList(itemsInMyCity)
    }, [itemsInMyCity])

    const updateButton = (ref, setLeftButton, setRightButton) => {
        const element = ref.current
        if (element) {
            setLeftButton(element.scrollLeft > 0)
            setRightButton(element.scrollLeft + element.clientWidth < element.scrollWidth)
        }
    }

    const scrollHandler = (ref, direction) => {
        if (ref.current) {
            ref.current.scrollBy({
                left: direction === "left" ? -200 : 200,
                behavior: "smooth"
            })
        }
    }

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    useEffect(() => {
        const cateEl = cateScrollRef.current
        const shopEl = shopScrollRef.current

        const handleCateScroll = () => updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
        const handleShopScroll = () => updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)

        if (cateEl && shopEl) {
            updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
            updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
            cateEl.addEventListener('scroll', handleCateScroll)
            shopEl.addEventListener('scroll', handleShopScroll)
        }

        return () => {
            if (cateEl) cateEl.removeEventListener('scroll', handleCateScroll)
            if (shopEl) shopEl.removeEventListener('scroll', handleShopScroll)
        }
    }, [])

    const fadeUp = `transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`
    const fadeUpDelay = `transition-all duration-700 ease-out delay-150 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`
    const fadeUpDelay2 = `transition-all duration-700 ease-out delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`
    const fadeUpDelay3 = `transition-all duration-700 ease-out delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`
    const scaleIn = `transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0,
            scale: 0.8
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            transition: { duration: 0.8, ease: "easeInOut" }
        },
        exit: (direction) => ({
            x: direction > 0 ? '-100%' : '100%',
            opacity: 0,
            scale: 0.8,
            transition: { duration: 0.8, ease: "easeInOut" }
        })
    }

    return (
        <div className='min-h-screen bg-[#0a0a0f] overflow-x-hidden'>
            <Nav />

            <div className='relative pt-[80px] px-3 sm:px-4'>
                <div className='max-w-7xl mx-auto'>
                    {/* Background Orbs */}
                    <div className='absolute inset-0 pointer-events-none'>
                        <div className={`absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#ff2d55]/8 rounded-full blur-3xl transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} />
                        <div className={`absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#ff6b35]/8 rounded-full blur-3xl transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} />
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ffd93d]/5 rounded-full blur-3xl transition-all duration-1000 delay-600 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} />
                    </div>

                    {/* Hero Section - Responsive */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className={`relative group perspective-1500 max-w-7xl mx-auto ${scaleIn}`}
                    >
                        <div className='relative glass-premium-ultra rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-white/5 shadow-2xl shadow-[#ff2d55]/10 transform transition-all duration-700 hover:rotate-y-2 hover:scale-[1.02] hover:shadow-[#ff2d55]/25 overflow-hidden min-h-[400px] sm:min-h-[500px] md:min-h-[600px]'>
                            
                            <div className='absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#ff2d55] via-[#ff6b35] to-[#ffd93d] opacity-0 group-hover:opacity-15 transition-all duration-1000' />

                            <div className='absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl'>
                                <AnimatePresence initial={false} custom={direction}>
                                    <motion.div
                                        key={currentImageIndex}
                                        custom={direction}
                                        variants={slideVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        className='absolute inset-0'
                                    >
                                        <img 
                                            src={heroImages[currentImageIndex].image} 
                                            alt={heroImages[currentImageIndex].title}
                                            className='w-full h-full object-cover'
                                        />
                                        <div className='absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/90 via-[#0a0a0f]/70 to-transparent' />
                                        <div className='absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/80 to-transparent' />
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Floating Emojis - Hidden on mobile */}
                            <div className={`absolute top-4 sm:top-8 right-4 sm:right-12 text-4xl sm:text-6xl md:text-7xl animate-float-3d opacity-80 hidden sm:block ${fadeUp}`}>
                                {heroImages[currentImageIndex].id === 1 ? '🍕' : 
                                 heroImages[currentImageIndex].id === 2 ? '🍔' :
                                 heroImages[currentImageIndex].id === 3 ? '🥞' :
                                 heroImages[currentImageIndex].id === 4 ? '🍽️' : '🥗'}
                            </div>

                            {/* Slide Indicators */}
                            <div className='absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 sm:gap-2'>
                                {heroImages.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                                            index === currentImageIndex 
                                                ? 'bg-[#ff6b35] w-5 sm:w-8 shadow-lg shadow-[#ff6b35]/50' 
                                                : 'bg-white/30 hover:bg-white/50'
                                        }`}
                                        onClick={() => {
                                            setDirection(index > currentImageIndex ? 1 : -1)
                                            setCurrentImageIndex(index)
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Content - Responsive */}
                            <div className='relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 min-h-[300px] sm:min-h-[400px] md:min-h-[500px]'>
                                <div className='flex-1 space-y-4 sm:space-y-6 w-full'>
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className={`inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-white text-xs sm:text-sm font-medium shadow-lg shadow-[#ff2d55]/30 animate-pulse-glow ${fadeUp}`}
                                    >
                                        <FaCrown className='text-yellow-300 text-base sm:text-lg' />
                                        <span className='tracking-wider text-[10px] sm:text-xs'>FAST DELIVERY</span>
                                        <FaInfinity className='text-white/60 text-xs sm:text-sm' />
                                    </motion.div>

                                    <motion.h1 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className={`text-2xl sm:text-4xl md:text-6xl font-bold leading-tight ${fadeUpDelay}`}
                                    >
                                        <span className='text-gradient-animated'>Cravely</span>
                                        <br />
                                        <span className='text-white/90 text-xl sm:text-3xl md:text-5xl'>Delivers</span>
                                        <span className='text-[#ff2d55] text-xl sm:text-3xl md:text-5xl'> Happiness</span>
                                    </motion.h1>

                                    <motion.p 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className={`text-white/60 text-sm sm:text-base md:text-lg max-w-md leading-relaxed ${fadeUpDelay2}`}
                                    >
                                        Order your favorite food with <span className='text-[#ff6b35] font-semibold'>lightning fast</span> delivery.
                                    </motion.p>

                                    <div className={`flex flex-wrap gap-3 sm:gap-4 pt-2 ${fadeUpDelay3}`}>
                                        <button 
                                            className='group relative overflow-hidden bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full font-semibold shadow-xl shadow-[#ff2d55]/30 transition-all duration-300 hover:scale-105 text-sm sm:text-base'
                                            onClick={() => navigate('/restaurants')}
                                        >
                                            <span className='relative z-10 flex items-center gap-2'>
                                                Order Now
                                                <FaArrowRight size={14} className='group-hover:translate-x-2 transition-transform duration-300' />
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* Stats Cards - Responsive Grid */}
                                <div className={`grid grid-cols-2 sm:flex sm:flex-col gap-3 sm:gap-4 w-full sm:w-auto min-w-[140px] sm:min-w-[180px] ${fadeUpDelay2}`}>
                                    {[
                                        { icon: '🚀', label: 'Avg. Delivery Time', value: '30', sub: 'min' },
                                        { icon: '⭐', label: 'Customer Rating', value: '4.9', sub: '★' },
                                        { icon: '🏆', label: 'Happy Customers', value: '10K+', sub: '' }
                                    ].map((stat, idx) => (
                                        <motion.div 
                                            key={idx}
                                            initial={{ opacity: 0, x: 30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + (idx * 0.1) }}
                                            className='relative group-card glass-premium-ultra p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border border-white/5 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-[#ff2d55]/20 cursor-default overflow-hidden'
                                        >
                                            <div className='absolute inset-0 bg-gradient-to-r from-[#ff2d55]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
                                            <div className='flex items-center gap-2 sm:gap-3 md:gap-4 relative z-10'>
                                                <div className='w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center text-xl sm:text-2xl shadow-lg shadow-[#ff2d55]/20 group-hover:scale-110 transition-transform duration-500'>
                                                    {stat.icon}
                                                </div>
                                                <div>
                                                    <p className='text-base sm:text-xl md:text-2xl font-bold text-white'>{stat.value} <span className='text-xs sm:text-sm font-normal text-white/50'>{stat.sub}</span></p>
                                                    <p className='text-white/40 text-[10px] sm:text-xs md:text-sm'>{stat.label}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Features Strip - Responsive */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className={`mt-6 sm:mt-8 max-w-7xl mx-auto ${fadeUpDelay3}`}
                    >
                        <div className='glass-premium-ultra p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-white/5'>
                            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4'>
                                {[
                                    { icon: <FaTruck className='text-[#ff6b35] text-base sm:text-xl' />, label: 'Free Delivery', sub: 'Above ₹199' },
                                    { icon: <FaShieldAlt className='text-green-400 text-base sm:text-xl' />, label: '100% Safe', sub: 'Secure Payments' },
                                    { icon: <FaStore className='text-yellow-400 text-base sm:text-xl' />, label: 'Best Quality', sub: 'Fresh Ingredients' },
                                    { icon: <FaHeadset className='text-[#ff6b35] text-base sm:text-xl' />, label: '24/7 Support', sub: "We're Here" }
                                ].map((feature, idx) => (
                                    <motion.div 
                                        key={idx}
                                        whileHover={{ scale: 1.05 }}
                                        className='flex items-center gap-2 sm:gap-3 transition-all duration-300 group'
                                    >
                                        <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#ff2d55]/20 to-[#ff6b35]/20 flex items-center justify-center text-lg sm:text-xl group-hover:scale-110 transition-transform'>
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <p className='text-white font-semibold text-xs sm:text-sm'>{feature.label}</p>
                                            <p className='text-white/30 text-[10px] sm:text-xs'>{feature.sub}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                   
                </div>
            </div>

            {/* ✅ Main Content - Responsive */}
            <div className={`px-3 sm:px-4 pb-8 max-w-7xl mx-auto mt-6 sm:mt-8 ${fadeUpDelay3}`}>
                
                {/* ✅ Search Results */}
                {searchItems && searchItems.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='glass-premium-ultra p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/5 mb-6 sm:mb-8'
                    >
                        <h2 className='text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2'>
                            <FaFire className='text-[#ff2d55]' /> Search Results
                            <span className='text-xs text-white/30 font-normal'>({searchItems.length} items)</span>
                        </h2>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5'>
                            {searchItems.map((item) => (
                                <FoodCard data={item} key={item._id} />
                            ))}
                        </div>
                    </motion.div>
                )}

                {shopsInMyCity && shopsInMyCity.length > 0 ? (
                    <>
                        {/* ✅ Categories Section - Responsive */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className='mb-8 sm:mb-10'
                        >
                            <div className='flex items-center justify-between mb-3 sm:mb-5'>
                                <h2 className='text-lg sm:text-2xl font-bold text-white flex items-center gap-2'>
                                    <span className='text-[#ff2d55]'>✦</span> Explore Categories
                                    <span className='text-xs text-white/30 font-normal ml-1 sm:ml-2'>({categories.length})</span>
                                </h2>
                            </div>
                            <div className='relative'>
                                {showLeftCateButton && (
                                    <button className='absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff2d55] text-white p-1.5 sm:p-2.5 rounded-full shadow-lg hover:bg-[#ff6b35] z-10 transition hover:scale-110' onClick={() => scrollHandler(cateScrollRef, "left")}>
                                        <FaChevronCircleLeft size={18} className="sm:w-6 sm:h-6" />
                                    </button>
                                )}
                                <div className='flex overflow-x-auto gap-3 sm:gap-5 pb-3 scrollbar-hide' ref={cateScrollRef}>
                                    {categories.map((cate, index) => (
                                        <CategoryCard 
                                            key={index} 
                                            name={cate.category} 
                                            image={cate.image} 
                                            index={index}
                                            onClick={() => handleCategoryClick(cate.category)} 
                                        />
                                    ))}
                                </div>
                                {showRightCateButton && (
                                    <button className='absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff2d55] text-white p-1.5 sm:p-2.5 rounded-full shadow-lg hover:bg-[#ff6b35] z-10 transition hover:scale-110' onClick={() => scrollHandler(cateScrollRef, "right")}>
                                        <FaChevronCircleRight size={18} className="sm:w-6 sm:h-6" />
                                    </button>
                                )}
                            </div>
                        </motion.div>

                        {/* ✅ Top Restaurants - Responsive */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className='mb-8 sm:mb-10'
                        >
                            <div className='flex items-center justify-between mb-3 sm:mb-5'>
                                <h2 className='text-lg sm:text-2xl font-bold text-white flex items-center gap-2'>
                                    <FaStore className='text-[#ff6b35]' /> Top Restaurants
                                    <span className='text-xs text-white/30 font-normal ml-1 sm:ml-2'>({shopsInMyCity.length})</span>
                                </h2>
                                <button 
                                    className='text-[#ff6b35] text-xs sm:text-sm font-medium hover:underline flex items-center gap-1 group'
                                    onClick={() => navigate('/restaurants')}
                                >
                                    View All 
                                    <FaArrowRight size={10} className="sm:w-3 sm:h-3 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                            <div className='relative'>
                                {showLeftShopButton && (
                                    <button className='absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff2d55] text-white p-1.5 sm:p-2.5 rounded-full shadow-lg hover:bg-[#ff6b35] z-10 transition hover:scale-110' onClick={() => scrollHandler(shopScrollRef, "left")}>
                                        <FaChevronCircleLeft size={18} className="sm:w-6 sm:h-6" />
                                    </button>
                                )}
                                <div className='flex overflow-x-auto gap-3 sm:gap-5 pb-3 scrollbar-hide' ref={shopScrollRef}>
                                    {shopsInMyCity?.map((shop, index) => (
                                        <ShopCard 
                                            key={shop._id} 
                                            shop={shop} 
                                            index={index} 
                                        />
                                    ))}
                                </div>
                                {showRightShopButton && (
                                    <button className='absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff2d55] text-white p-1.5 sm:p-2.5 rounded-full shadow-lg hover:bg-[#ff6b35] z-10 transition hover:scale-110' onClick={() => scrollHandler(shopScrollRef, "right")}>
                                        <FaChevronCircleRight size={18} className="sm:w-6 sm:h-6" />
                                    </button>
                                )}
                            </div>
                        </motion.div>

                        {/* ✅ Recommended Items - Responsive */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className='flex items-center justify-between mb-3 sm:mb-5'>
                                <h2 className='text-lg sm:text-2xl font-bold text-white flex items-center gap-2'>
                                    <span className='text-yellow-400'>⭐</span> Recommended for You
                                    <span className='text-xs text-white/30 font-normal ml-1 sm:ml-2'>({Math.min(updatedItemsList?.length || 0, 4)} items)</span>
                                </h2>
                                <button 
                                    className='text-[#ff6b35] text-xs sm:text-sm font-medium hover:underline flex items-center gap-1 group'
                                    onClick={() => navigate('/category/All')}
                                >
                                    View All 
                                    <FaArrowRight size={10} className="sm:w-3 sm:h-3 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                            {updatedItemsList && updatedItemsList.length > 0 ? (
                                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5'>
                                    {updatedItemsList.slice(0, 4).map((item, index) => (
                                        <FoodCard data={item} key={index} />
                                    ))}
                                </div>
                            ) : (
                                <div className='glass-premium-ultra p-8 sm:p-12 text-center border border-white/5 rounded-xl sm:rounded-2xl'>
                                    <FaUtensils size={35} className="sm:w-[45px] sm:h-[45px] text-white/20 mx-auto mb-3" />
                                    <h3 className='text-white font-semibold text-base sm:text-lg mb-1'>No items yet</h3>
                                    <p className='text-white/30 text-xs sm:text-sm'>We're adding delicious options for you!</p>
                                </div>
                            )}
                        </motion.div>

                        {/* ✅ Bottom Banner - Responsive */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className='mt-8 sm:mt-12'
                        >
                            <div className='glass-premium-ultra p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/5 bg-gradient-to-r from-[#ff2d55]/10 to-[#ff6b35]/10 relative overflow-hidden group'>
                                <div className='absolute inset-0 bg-gradient-to-r from-[#ff2d55]/5 via-transparent to-[#ff6b35]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700' />
                                <div className='relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6'>
                                    {[
                                        { icon: '🍕', label: '100+ Restaurants', sub: 'Top quality food' },
                                        { icon: '🚀', label: 'Fast Delivery', sub: '30 min avg' },
                                        { icon: '⭐', label: '4.9 Rating', sub: '10K+ reviews' },
                                        { icon: '🎉', label: 'Best Offers', sub: 'Daily deals' }
                                    ].map((item, idx) => (
                                        <motion.div 
                                            key={idx}
                                            whileHover={{ scale: 1.05 }}
                                            className='text-center transition-all duration-300'
                                        >
                                            <div className='text-2xl sm:text-4xl mb-1 sm:mb-2 animate-float-3d' style={{ animationDelay: `${idx * 0.2}s` }}>
                                                {item.icon}
                                            </div>
                                            <p className='text-white font-semibold text-xs sm:text-sm'>{item.label}</p>
                                            <p className='text-white/30 text-[10px] sm:text-sm'>{item.sub}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className='glass-premium-ultra p-12 sm:p-16 text-center border border-white/5 rounded-2xl'
                    >
                        <FaStoreSlash size={50} className="sm:w-[60px] sm:h-[60px] text-[#ff2d55] mx-auto mb-4" />
                        <h2 className='text-xl sm:text-2xl font-bold text-white mb-2'>No Restaurants in {currentCity}</h2>
                        <p className='text-white/40 text-sm sm:text-base'>We're coming soon! 🚀</p>
                    </motion.div>
                )}
            </div>

            {/* Scroll to Top - Responsive */}
            {showScrollTop && (
                <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className='fixed bottom-6 sm:bottom-8 right-4 sm:right-8 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white shadow-lg shadow-[#ff2d55]/30 hover:scale-110 transition-all duration-300 flex items-center justify-center'
                    onClick={scrollToTop}
                >
                    <FaArrowRight size={16} className="sm:w-5 sm:h-5 rotate-[-90deg]" />
                </motion.button>
            )}

            <style jsx>{`
                @keyframes float-3d {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    33% { transform: translateY(-12px) rotate(2deg); }
                    66% { transform: translateY(6px) rotate(-1deg); }
                }
                .animate-float-3d {
                    animation: float-3d 4s ease-in-out infinite;
                }
                .animation-delay-200 { animation-delay: 0.2s; }
                .animation-delay-300 { animation-delay: 0.3s; }
                .animation-delay-400 { animation-delay: 0.4s; }
                .animation-delay-600 { animation-delay: 0.6s; }
                .animation-delay-900 { animation-delay: 0.9s; }

                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 25px rgba(255, 45, 85, 0.2); }
                    50% { box-shadow: 0 0 50px rgba(255, 45, 85, 0.4); }
                }
                .animate-pulse-glow {
                    animation: pulse-glow 3s ease-in-out infinite;
                }

                .perspective-1500 {
                    perspective: 1500px;
                }
                .rotate-y-2 {
                    transform: rotateY(2deg);
                }

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

                .group-card {
                    position: relative;
                    overflow: hidden;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                }
                .animate-pulse {
                    animation: pulse 4s ease-in-out infinite;
                }

                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    )
}

export default UserDashboard

