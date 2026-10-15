import React, { useEffect, useRef, useState } from 'react'
import Nav from './Nav'
import { categories } from '../category'
import ShopCard from '../components/ShopCard'
import { 
    FaChevronLeft, FaChevronRight,
    FaFire, FaArrowRight, FaUtensils, FaMapMarkerAlt
} from "react-icons/fa";
import { useSelector } from 'react-redux';
import FoodCard from './FoodCard';
import { useNavigate } from 'react-router-dom';
import { FaStoreSlash } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';

function UserDashboard() {
    const { currentCity, shopsInMyCity, itemsInMyCity, searchItems, userData } = useSelector(state => state.user)
    const cateScrollRef = useRef()
    const shopScrollRef = useRef()
    const navigate = useNavigate()

    const [showLeftCateButton, setShowLeftCateButton] = useState(false)
    const [showRightCateButton, setShowRightCateButton] = useState(false)
    const [showLeftShopButton, setShowLeftShopButton] = useState(false)
    const [showRightShopButton, setShowRightShopButton] = useState(false)
    const [updatedItemsList, setUpdatedItemsList] = useState([])
    const [showScrollTop, setShowScrollTop] = useState(false)

    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 500)
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
            setRightButton(element.scrollLeft + element.clientWidth < element.scrollWidth - 5)
        }
    }

    const scrollHandler = (ref, direction) => {
        if (ref.current) {
            ref.current.scrollBy({
                left: direction === "left" ? -280 : 280,
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
            className='min-h-screen bg-white overflow-x-hidden'
            style={{ fontFamily: "'Poppins', 'Segoe UI', system-ui, sans-serif" }}
        >
            {/* Google Font */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
                
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                
                .card-3d {
                    transform-style: preserve-3d;
                    perspective: 1000px;
                }
                .card-3d-inner {
                    transition: transform 0.4s ease, box-shadow 0.4s ease;
                }
                .card-3d:hover .card-3d-inner {
                    transform: translateY(-10px) rotateX(4deg) rotateY(-3deg) scale(1.02);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }
            `}</style>

            <Nav />

            {/* ========== FULL WIDTH ORANGE HERO ========== */}
            <section className='w-full bg-[#e85d04] pt-[64px] pb-8 h-[700px]'>
                <div className='max-w-5xl mx-auto px-4 pt-8 sm:pt-10 pb-4 text-center'>
                    <motion.h1 
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                        className='text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight'
                    >
                        Craving something delicious?
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.12 }}
                        className='text-white/85 text-sm sm:text-base mt-2'
                    >
                        Hey {userData?.name || 'there'} — your favourite food, delivered fresh & fast
                    </motion.p>

                    {/* Location only (no search) */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className='flex justify-center mt-4'
                    >
                        <div className='inline-flex items-center gap-2.5 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20'>
                            <FaMapMarkerAlt className='text-white' size={13} />
                            <span className='text-white text-sm font-medium'>
                                {currentCity || 'Select your location'}
                            </span>
                        </div>
                    </motion.div>
                </div>

                {/* 3D Animated Cards — MODERATE HEIGHT */}
                <div className='max-w-5xl mx-auto px-4 pb-6'>
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5'>
                        {heroCards.map((card, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + idx * 0.12, duration: 0.55, type: "spring", stiffness: 90 }}
                                className='card-3d h-full'
                            >
                                <div className='card-3d-inner relative bg-white rounded-2xl overflow-hidden shadow-lg border border-white/50 h-full flex flex-col'>
                                    {/* Image - MODERATE HEIGHT */}
                                    <div className='relative h-48 sm:h-52 md:h-56 overflow-hidden flex-shrink-0'>
                                        <img 
                                            src={card.image} 
                                            alt={card.title}
                                            className='w-full h-full object-cover'
                                        />
                                        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent' />
                                        
                                        {/* Floating emoji */}
                                        <motion.span 
                                            animate={{ y: [0, -6, 0] }}
                                            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: idx * 0.3 }}
                                            className='absolute top-3 right-3 text-2xl drop-shadow-lg'
                                        >
                                            {card.emoji}
                                        </motion.span>

                                        {/* Tag */}
                                        <span className='absolute bottom-3 left-3 text-[10px] font-semibold text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full'>
                                            {card.tag}
                                        </span>
                                    </div>

                                    {/* Text - Moderate padding */}
                                    <div className='p-4 sm:p-5 flex-1 flex flex-col'>
                                        <h3 className='font-bold text-gray-900 text-base sm:text-lg tracking-tight'>
                                            {card.title}
                                        </h3>
                                        <p className='text-gray-500 text-xs sm:text-sm mt-1.5 leading-relaxed flex-1'>
                                            {card.sub}
                                        </p>
                                    </div>

                                    {/* Soft bottom accent line */}
                                    <div className='h-1 w-full bg-gradient-to-r from-[#e85d04] via-orange-400 to-amber-300 flex-shrink-0' />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== MAIN CONTENT ========== */}
            <div className='max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12'>

                {/* Search Results (backend se aaye to) */}
                {searchItems && searchItems.length > 0 && (
                    <section>
                        <h2 className='text-xl font-bold text-gray-900 mb-5 flex items-center gap-2'>
                            <FaFire className='text-[#e85d04]' /> 
                            Search Results
                            <span className='text-sm text-gray-400 font-normal'>({searchItems.length})</span>
                        </h2>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                            {searchItems.map((item) => (
                                <FoodCard data={item} key={item._id} />
                            ))}
                        </div>
                    </section>
                )}

                {shopsInMyCity && shopsInMyCity.length > 0 ? (
                    <>
                        {/* Categories */}
                        <section>
                            <div className='flex items-center justify-between mb-6'>
                                <h2 className='text-xl font-bold text-gray-900 tracking-tight'>
                                    What's on your mind?
                                </h2>
                                <div className='flex gap-2'>
                                    <button 
                                        onClick={() => scrollHandler(cateScrollRef, "left")}
                                        disabled={!showLeftCateButton}
                                        className={`w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center transition ${
                                            showLeftCateButton 
                                                ? 'bg-white text-gray-700 hover:bg-gray-50' 
                                                : 'bg-gray-50 text-gray-300 cursor-default'
                                        }`}
                                    >
                                        <FaChevronLeft size={13} />
                                    </button>
                                    <button 
                                        onClick={() => scrollHandler(cateScrollRef, "right")}
                                        disabled={!showRightCateButton}
                                        className={`w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center transition ${
                                            showRightCateButton 
                                                ? 'bg-white text-gray-700 hover:bg-gray-50' 
                                                : 'bg-gray-50 text-gray-300 cursor-default'
                                        }`}
                                    >
                                        <FaChevronRight size={13} />
                                    </button>
                                </div>
                            </div>
                            <div className='flex overflow-x-auto gap-5 sm:gap-6 pb-2 scrollbar-hide' ref={cateScrollRef}>
                                {categories.map((cate, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleCategoryClick(cate.category)}
                                        className='flex flex-col items-center gap-2.5 min-w-[90px] sm:min-w-[100px] group'
                                    >
                                        <div className='w-[90px] h-[90px] sm:w-[100px] sm:h-[100px] rounded-full overflow-hidden border border-gray-100 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300'>
                                            <img 
                                                src={cate.image} 
                                                alt={cate.category}
                                                className='w-full h-full object-cover'
                                            />
                                        </div>
                                        <span className='text-sm font-medium text-gray-700 group-hover:text-[#e85d04] transition-colors text-center'>
                                            {cate.category}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Nearby Restaurants */}
                        <section>
                            <div className='flex items-center justify-between mb-6'>
                                <h2 className='text-xl font-bold text-gray-900 tracking-tight'>
                                    Restaurants near you
                                    <span className='text-sm text-gray-400 font-normal ml-2'>({shopsInMyCity.length})</span>
                                </h2>
                                <div className='flex items-center gap-3'>
                                    <button 
                                        className='text-[#e85d04] text-sm font-medium hover:underline hidden sm:block'
                                        onClick={() => navigate('/restaurants')}
                                    >
                                        View All
                                    </button>
                                    <div className='flex gap-2'>
                                        <button 
                                            onClick={() => scrollHandler(shopScrollRef, "left")}
                                            disabled={!showLeftShopButton}
                                            className={`w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center transition ${
                                                showLeftShopButton 
                                                    ? 'bg-white text-gray-700 hover:bg-gray-50' 
                                                    : 'bg-gray-50 text-gray-300 cursor-default'
                                            }`}
                                        >
                                            <FaChevronLeft size={13} />
                                        </button>
                                        <button 
                                            onClick={() => scrollHandler(shopScrollRef, "right")}
                                            disabled={!showRightShopButton}
                                            className={`w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center transition ${
                                                showRightShopButton 
                                                    ? 'bg-white text-gray-700 hover:bg-gray-50' 
                                                    : 'bg-gray-50 text-gray-300 cursor-default'
                                            }`}
                                        >
                                            <FaChevronRight size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className='flex overflow-x-auto gap-4 pb-2 scrollbar-hide' ref={shopScrollRef}>
                                {shopsInMyCity?.map((shop, index) => (
                                    <div key={shop._id} className='min-w-[280px] sm:min-w-[300px]'>
                                        <ShopCard shop={shop} index={index} />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Recommended */}
                        <section>
                            <div className='flex items-center justify-between mb-6'>
                                <h2 className='text-xl font-bold text-gray-900 tracking-tight'>
                                    Recommended for you
                                </h2>
                                <button 
                                    className='text-[#e85d04] text-sm font-medium hover:underline flex items-center gap-1'
                                    onClick={() => navigate('/category/All')}
                                >
                                    View All <FaArrowRight size={11} />
                                </button>
                            </div>
                            {updatedItemsList && updatedItemsList.length > 0 ? (
                                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                                    {updatedItemsList.slice(0, 8).map((item, index) => (
                                        <FoodCard data={item} key={item._id || index} />
                                    ))}
                                </div>
                            ) : (
                                <div className='bg-gray-50 border border-gray-100 rounded-2xl p-12 text-center'>
                                    <FaUtensils size={40} className="text-gray-300 mx-auto mb-3" />
                                    <h3 className='text-gray-700 font-medium mb-1'>No items yet</h3>
                                    <p className='text-gray-400 text-sm'>We're adding delicious options for you</p>
                                </div>
                            )}
                        </section>
                    </>
                ) : (
                    <div className='bg-gray-50 border border-gray-100 rounded-2xl p-14 text-center'>
                        <FaStoreSlash size={48} className="text-gray-300 mx-auto mb-4" />
                        <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                            No Restaurants in {currentCity}
                        </h2>
                        <p className='text-gray-400 text-sm mb-5'>We're coming soon!</p>
                        <button
                            onClick={() => navigate('/')}
                            className='px-5 py-2.5 rounded-lg bg-[#e85d04] hover:bg-[#d54d00] text-white text-sm font-medium transition-colors'
                        >
                            Go Back Home
                        </button>
                    </div>
                )}

                {/* Bottom banner */}
                <section className='rounded-2xl overflow-hidden bg-[#1a1a1a]'>
                    <div className='flex flex-col md:flex-row items-center'>
                        <div className='flex-1 p-8 sm:p-10 md:p-12'>
                            <div className='flex items-center gap-2 mb-4'>
                                <div className='w-8 h-8 rounded-lg bg-[#e85d04] flex items-center justify-center'>
                                    <FaUtensils className='text-white text-sm' />
                                </div>
                                <span className='text-white font-semibold tracking-tight'>Cravely</span>
                            </div>
                            <h2 className='text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight'>
                                Hungry? Order something delicious
                            </h2>
                            <p className='text-gray-400 text-sm mb-6 max-w-md'>
                                Fresh food from your favourite restaurants, delivered to your door.
                            </p>
                            <button 
                                onClick={() => navigate('/restaurants')}
                                className='inline-flex items-center gap-2 bg-[#e85d04] hover:bg-[#d54d00] text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors'
                            >
                                Explore Restaurants
                                <FaArrowRight size={12} />
                            </button>
                        </div>
                        <div className='relative w-full md:w-[42%] h-48 md:h-60'>
                            <img 
                                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop"
                                alt="Delicious food"
                                className='w-full h-full object-cover'
                            />
                            <div className='absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-transparent to-transparent hidden md:block' />
                        </div>
                    </div>
                </section>
            </div>

            {/* Scroll to Top */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className='fixed bottom-6 right-5 z-50 w-11 h-11 rounded-full bg-[#e85d04] hover:bg-[#d54d00] text-white shadow-lg flex items-center justify-center transition-colors'
                        onClick={scrollToTop}
                    >
                        <FaArrowRight size={14} className="rotate-[-90deg]" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    )
}

export default UserDashboard