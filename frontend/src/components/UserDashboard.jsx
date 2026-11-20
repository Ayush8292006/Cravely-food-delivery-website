import React, { useEffect, useRef, useState } from 'react'
import Nav from './Nav'
import { categories } from '../category'
import ShopCard from '../components/ShopCard'
import FoodCard from './FoodCard'
import ComingSoonLocation from './ComingSoonLocation'
import { 
    FaChevronLeft, FaChevronRight,
    FaFire, FaArrowRight, FaUtensils, FaMapMarkerAlt,
    FaStoreSlash
} from "react-icons/fa";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function UserDashboard() {
    const { currentCity, shopsInMyCity, itemsInMyCity, searchItems, userData } = useSelector(state => state.user)
    const cateScrollRef = useRef(null)
    const shopScrollRef = useRef(null)
    const navigate = useNavigate()

    const [showLeftCateButton, setShowLeftCateButton] = useState(false)
    const [showRightCateButton, setShowRightCateButton] = useState(false)
    const [showLeftShopButton, setShowLeftShopButton] = useState(false)
    const [showRightShopButton, setShowRightShopButton] = useState(false)
    const [updatedItemsList, setUpdatedItemsList] = useState([])
    const [showScrollTop, setShowScrollTop] = useState(false)

    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 450)
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
            setLeftButton(element.scrollLeft > 5)
            setRightButton(element.scrollLeft + element.clientWidth < element.scrollWidth - 10)
        }
    }

    const scrollHandler = (ref, direction) => {
        if (ref.current) {
            ref.current.scrollBy({
                left: direction === "left" ? -300 : 300,
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

        if (cateEl) {
            updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
            cateEl.addEventListener('scroll', handleCateScroll)
        }
        if (shopEl) {
            updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
            shopEl.addEventListener('scroll', handleShopScroll)
        }

        return () => {
            if (cateEl) cateEl.removeEventListener('scroll', handleCateScroll)
            if (shopEl) shopEl.removeEventListener('scroll', handleShopScroll)
        }
    }, [shopsInMyCity])

    // Existing Original Hero Cards Content (100% Preserved)
    const heroCards = [
        { 
            title: 'Hot & Fresh', 
            sub: 'Straight from the kitchen to your door. Made with love and finest ingredients.', 
            tag: 'Sizzling now',
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
            emoji: '🔥'
        },
        { 
            title: 'Sweet Cravings', 
            sub: 'Irresistible desserts crafted to perfection. Every bite feels like heaven.', 
            tag: 'Indulgent',
            image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop',
            emoji: '🍰'
        },
        { 
            title: 'Fresh & Light', 
            sub: 'Wholesome, nutritious meals that taste amazing and make you feel great.', 
            tag: 'Feel good',
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
            emoji: '🥗'
        },
    ]

    return (
        <div 
            className="min-h-screen bg-[#0A090D] text-white pt-[105px] sm:pt-[76px] pb-20 overflow-x-hidden selection:bg-[#FF6B00] selection:text-white"
            style={{ fontFamily: "'Poppins', 'Segoe UI', system-ui, sans-serif" }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
                
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                
                .card-3d {
                    transform-style: preserve-3d;
                    perspective: 1000px;
                }
                .card-3d-inner {
                    transition: transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease;
                }
                .card-3d:hover .card-3d-inner {
                    transform: translateY(-8px) rotateX(3deg) scale(1.02);
                    box-shadow: 0 20px 40px -10px rgba(255, 107, 0, 0.25);
                }
            `}</style>

            <Nav />

            {/* ========================================================
                SECTION 1: HERO SECTION
                Black & Orange Theme with 100% Original Authentic Text
               ======================================================== */}
            <section className="relative w-full pt-4 pb-10 overflow-hidden">
                <div className="max-w-5xl mx-auto px-4 pt-6 sm:pt-8 pb-6 text-center relative z-10">
                    <motion.h1 
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                        className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight"
                    >
                        Craving something <span className="text-[#FF6B00]">delicious?</span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.12 }}
                        className="text-white/80 text-sm sm:text-base mt-2 max-w-xl mx-auto"
                    >
                        Hey {userData?.fullName || userData?.name || 'there'} — your favourite food, delivered fresh & fast
                    </motion.p>

                    {/* Delivery Location Pill */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-center mt-4"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 backdrop-blur-md transition-all shadow-inner">
                            <FaMapMarkerAlt className="text-[#FF6B00]" size={13} />
                            <span className="text-white/95 text-xs sm:text-sm font-semibold">
                                {currentCity || 'Greater Noida'}
                            </span>
                        </div>
                    </motion.div>
                </div>

                {/* 3D Animated Hero Cards (Original 3 Cards, Enhanced Design) */}
                <div className="max-w-5xl mx-auto px-4 pb-4 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
                        {heroCards.map((card, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 35 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + idx * 0.12, duration: 0.5, type: "spring", stiffness: 90 }}
                                className="card-3d h-full"
                            >
                                <div className="card-3d-inner relative bg-[#13121A] rounded-2xl overflow-hidden shadow-xl border border-white/10 hover:border-orange-500/50 h-full flex flex-col group">
                                    {/* Image */}
                                    <div className="relative h-48 sm:h-52 overflow-hidden flex-shrink-0 bg-black/50">
                                        <img 
                                            src={card.image} 
                                            alt={card.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#13121A] via-black/20 to-transparent" />
                                        
                                        {/* Floating Emoji */}
                                        <motion.span 
                                            animate={{ y: [0, -5, 0] }}
                                            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: idx * 0.3 }}
                                            className="absolute top-3 right-3 text-2xl drop-shadow-md"
                                        >
                                            {card.emoji}
                                        </motion.span>

                                        {/* Tag */}
                                        <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-wider text-white bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-sm">
                                            {card.tag}
                                        </span>
                                    </div>

                                    {/* Text Body */}
                                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-extrabold text-white text-base sm:text-lg tracking-tight group-hover:text-[#FF6B00] transition-colors">
                                                {card.title}
                                            </h3>
                                            <p className="text-gray-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                                                {card.sub}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Bottom Orange Accent Line */}
                                    <div className="h-1 w-full bg-[#FF6B00] flex-shrink-0" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========================================================
                SECTION 2: "WHAT'S ON YOUR MIND?" FOOD CATEGORIES
                Standalone White Rounded Container as requested
               ======================================================== */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <div className="bg-white text-gray-900 rounded-[32px] sm:rounded-[38px] p-6 sm:p-8 shadow-2xl relative">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                                What's on your mind?
                            </h2>
                        </div>

                        {/* Navigation Arrows */}
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => scrollHandler(cateScrollRef, "left")}
                                disabled={!showLeftCateButton}
                                className={`w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center transition-all ${
                                    showLeftCateButton 
                                        ? 'bg-white text-gray-700 hover:bg-[#FF6B00] hover:text-white cursor-pointer shadow-sm' 
                                        : 'bg-gray-100 text-gray-300 cursor-default'
                                }`}
                                title="Scroll left"
                            >
                                <FaChevronLeft size={12} />
                            </button>
                            <button 
                                onClick={() => scrollHandler(cateScrollRef, "right")}
                                disabled={!showRightCateButton}
                                className={`w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center transition-all ${
                                    showRightCateButton 
                                        ? 'bg-white text-gray-700 hover:bg-[#FF6B00] hover:text-white cursor-pointer shadow-sm' 
                                        : 'bg-gray-100 text-gray-300 cursor-default'
                                }`}
                                title="Scroll right"
                            >
                                <FaChevronRight size={12} />
                            </button>
                        </div>
                    </div>

                    {/* Circular Categories Row */}
                    <div 
                        className="flex overflow-x-auto gap-5 sm:gap-6 pb-2 scrollbar-hide scroll-smooth snap-x" 
                        ref={cateScrollRef}
                    >
                        {categories.map((cate, index) => (
                            <button
                                key={index}
                                onClick={() => handleCategoryClick(cate.category)}
                                className="flex flex-col items-center gap-2.5 min-w-[90px] sm:min-w-[100px] group cursor-pointer snap-start"
                            >
                                <div className="w-[85px] h-[85px] sm:w-[95px] sm:h-[95px] rounded-full overflow-hidden border border-gray-200 group-hover:border-[#FF6B00] shadow-sm group-hover:shadow-md group-hover:shadow-orange-500/20 group-hover:scale-105 transition-all duration-300">
                                    <img 
                                        src={cate.image} 
                                        alt={cate.category}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-[#FF6B00] transition-colors text-center truncate max-w-[90px] sm:max-w-[100px]">
                                    {cate.category}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========================================================
                MAIN CONTENT AREA: BACKEND DRIVEN DATA (100% PRESERVED)
               ======================================================== */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

                {/* 1. Search Results (Rendered via FoodCard when searchItems has data) */}
                {searchItems && searchItems.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2 tracking-tight">
                            <FaFire className="text-[#FF6B00]" /> 
                            <span>Search Results</span>
                            <span className="text-sm text-gray-400 font-normal">({searchItems.length})</span>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {searchItems.map((item) => (
                                <FoodCard data={item} key={item._id} dark={true} />
                            ))}
                        </div>
                    </section>
                )}

                {/* 2. Restaurants Near You Section (Real backend shops via ShopCard) */}
                {shopsInMyCity && shopsInMyCity.length > 0 ? (
                    <>
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                        Restaurants near you
                                        <span className="text-sm text-gray-400 font-normal ml-2">({shopsInMyCity.length})</span>
                                    </h2>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button 
                                        className="text-[#FF6B00] hover:text-orange-400 text-sm font-semibold hover:underline hidden sm:block transition cursor-pointer"
                                        onClick={() => navigate('/restaurants')}
                                    >
                                        View All
                                    </button>

                                    {/* Desktop Carousel Arrows */}
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => scrollHandler(shopScrollRef, "left")}
                                            disabled={!showLeftShopButton}
                                            className={`w-9 h-9 rounded-full border border-white/10 flex items-center justify-center transition-all ${
                                                showLeftShopButton 
                                                    ? 'bg-white/10 text-white hover:bg-[#FF6B00] cursor-pointer' 
                                                    : 'bg-white/5 text-white/30 cursor-default'
                                            }`}
                                            title="Scroll left"
                                        >
                                            <FaChevronLeft size={12} />
                                        </button>
                                        <button 
                                            onClick={() => scrollHandler(shopScrollRef, "right")}
                                            disabled={!showRightShopButton}
                                            className={`w-9 h-9 rounded-full border border-white/10 flex items-center justify-center transition-all ${
                                                showRightShopButton 
                                                    ? 'bg-white/10 text-white hover:bg-[#FF6B00] cursor-pointer' 
                                                    : 'bg-white/5 text-white/30 cursor-default'
                                            }`}
                                            title="Scroll right"
                                        >
                                            <FaChevronRight size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Real backend shops slider */}
                            <div 
                                className="flex overflow-x-auto gap-5 pb-3 scrollbar-hide scroll-smooth snap-x snap-mandatory" 
                                ref={shopScrollRef}
                            >
                                {shopsInMyCity?.map((shop, index) => (
                                    <div key={shop._id} className="min-w-[280px] sm:min-w-[310px] max-w-[310px] flex-shrink-0 snap-start">
                                        <ShopCard shop={shop} index={index} dark={true} />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 3. Recommended for you (Real backend dishes via FoodCard) */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    Recommended for you
                                </h2>
                                <button 
                                    className="text-[#FF6B00] hover:text-orange-400 text-sm font-semibold hover:underline flex items-center gap-1.5 transition cursor-pointer"
                                    onClick={() => navigate('/category/All')}
                                >
                                    <span>View All</span>
                                    <FaArrowRight size={11} />
                                </button>
                            </div>

                            {updatedItemsList && updatedItemsList.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                    {updatedItemsList.slice(0, 8).map((item, index) => (
                                        <FoodCard data={item} key={item._id || index} dark={true} />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-[#13121A] border border-white/10 rounded-2xl p-12 text-center">
                                    <FaUtensils size={36} className="text-gray-500 mx-auto mb-3" />
                                    <h3 className="text-white font-semibold mb-1">No items yet</h3>
                                    <p className="text-gray-400 text-sm">We're adding delicious options for you</p>
                                </div>
                            )}
                        </section>
                    </>
                ) : (
                    /* World-Class Coming Soon & Active Hubs Showcase */
                    <ComingSoonLocation 
                        requestedCity={currentCity} 
                        onBrowseAll={() => navigate('/restaurants')} 
                    />
                )}

                {/* ========================================================
                    SECTION 4: BOTTOM BANNER
                    100% Original Content Preserved, Dark Luxury Redesign
                   ======================================================== */}
                <section className="rounded-3xl overflow-hidden bg-[#13121A] border border-white/10 shadow-2xl">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="flex-1 p-8 sm:p-10 md:p-12 space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-[#FF6B00] flex items-center justify-center shadow-md">
                                    <FaUtensils className="text-white text-xs" />
                                </div>
                                <span className="text-white font-black tracking-tight text-lg">Cravely</span>
                            </div>

                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                                Hungry? Order something delicious
                            </h2>

                            <p className="text-gray-300 text-xs sm:text-sm max-w-md leading-relaxed">
                                Fresh food from your favourite restaurants, delivered to your door.
                            </p>

                            <div className="pt-2">
                                <button 
                                    onClick={() => navigate('/restaurants')}
                                    className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-orange-600 text-white px-7 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all hover:scale-105 cursor-pointer shadow-md"
                                >
                                    <span>Explore Restaurants</span>
                                    <FaArrowRight size={12} />
                                </button>
                            </div>
                        </div>

                        <div className="relative w-full md:w-[44%] h-56 md:h-72">
                            <img 
                                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop"
                                alt="Delicious food"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </section>
            </div>

            {/* Scroll to Top Floating Button */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed bottom-20 lg:bottom-8 right-5 z-40 w-11 h-11 rounded-full bg-gradient-to-tr from-[#FF5200] to-[#FF6B00] text-white shadow-xl shadow-orange-500/40 flex items-center justify-center transition-transform hover:scale-110"
                        onClick={scrollToTop}
                        title="Scroll to top"
                    >
                        <FaArrowRight size={14} className="-rotate-90" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    )
}

export default UserDashboard
