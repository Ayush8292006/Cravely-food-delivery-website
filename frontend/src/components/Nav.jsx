import React, { useState, useEffect, useRef } from 'react'
import { 
    FaHamburger, FaStore, FaStar, FaClock, FaMapMarkerAlt,
    FaPlus, FaUserCog, FaCrown, FaFire, FaLeaf, FaUtensils,
    FaArrowRight, FaSearch, FaTimes, FaChevronDown, FaChevronUp,
    FaGift, FaHeadset, FaShieldAlt,
    FaShoppingBag, FaUtensilSpoon, FaMotorcycle
} from "react-icons/fa";
import { FiShoppingCart } from "react-icons/fi";
import { IoReceiptOutline, IoLogOut, IoRestaurant, IoFastFood } from "react-icons/io5";
import { MdDeliveryDining, MdRestaurant, MdLocationOn, MdVerified } from "react-icons/md";
import { BiRestaurant } from "react-icons/bi";
import { GiKnifeFork } from "react-icons/gi";
import { useDispatch, useSelector } from 'react-redux';
import { serverUrl } from '../App';
import axios from 'axios';
import { setUserData } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import LocationSelector from './LocationSelector';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

function Nav() {
    const { userData, cartItems, shopsInMyCity, currentCity } = useSelector(state => state.user)
    const { myShopData } = useSelector(state => state.owner)
    const [showInfo, setShowInfo] = useState(false)
    const [showRestaurants, setShowRestaurants] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [scrolled, setScrolled] = useState(false)
    const dropdownRef = useRef(null)
    const restaurantRef = useRef(null)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    // ✅ Scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // ✅ Click outside handlers
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowInfo(false)
            }
            if (restaurantRef.current && !restaurantRef.current.contains(e.target)) {
                setShowRestaurants(false)
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    const handleLogOut = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
            dispatch(setUserData(null))
            setShowInfo(false)
            toast.success('Logged out successfully! 👋')
            navigate("/signin")
        } catch (error) {
            console.log(error)
            toast.error('Logout failed!')
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
            setShowSearch(false)
            setSearchQuery('')
        }
    }

    // ✅ Get role badge
    const getRoleBadge = () => {
        switch(userData?.role) {
            case 'owner': 
                return { label: '👨‍🍳 Owner', color: 'bg-[#ff6b35]/20 text-[#ff6b35]' }
            case 'deliveryBoy': 
                return { label: '🚴 Delivery', color: 'bg-blue-500/20 text-blue-400' }
            case 'superAdmin': 
                return { label: '👑 Admin', color: 'bg-purple-500/20 text-purple-400' }
            default: 
                return { label: '👤 User', color: 'bg-[#ff2d55]/20 text-[#ff2d55]' }
        }
    }

    const roleBadge = getRoleBadge()

    return (
        <nav className={`w-full h-[72px] flex items-center justify-between px-3 sm:px-4 md:px-6 lg:px-10 fixed top-0 z-[9999] transition-all duration-500 ${
            scrolled 
                ? 'bg-[#0a0a0f]/98 backdrop-blur-2xl border-b border-white/10 shadow-2xl shadow-black/50' 
                : 'bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5'
        }`}>

            {/* ✅ Animated Background Glow */}
            <div className='absolute inset-0 pointer-events-none'>
                <div className='absolute -top-20 -left-20 w-80 h-80 bg-[#ff2d55]/8 rounded-full blur-3xl animate-pulse-glow' />
                <div className='absolute -top-20 -right-20 w-80 h-80 bg-[#ff6b35]/8 rounded-full blur-3xl animate-pulse-glow animation-delay-200' />
                <div className='absolute -bottom-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-[#ffd93d]/4 rounded-full blur-3xl animate-pulse-glow animation-delay-400' />
            </div>

           {/* ✅ Logo Section - CRAVELY LOGO (Spoon + Fork) */}
<div className="flex items-center gap-2 sm:gap-3 cursor-pointer group relative z-10" onClick={() => navigate("/")}>
    <div className='relative'>
        <div className='w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center shadow-lg shadow-[#ff2d55]/25 group-hover:scale-110 transition-all duration-300 group-hover:shadow-[#ff2d55]/40 group-hover:rotate-[-5deg]'>
            {/* ✅ Spoon + Fork */}
            <FaUtensilSpoon className="text-white text-base sm:text-lg transform -rotate-12" />
            <FaUtensils className="text-white text-sm sm:text-base transform rotate-12 ml-[-3px]" />
        </div>
        <div className='absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#ffd93d] flex items-center justify-center animate-pulse'>
            <span className='text-[7px] font-bold text-[#0a0a0f]'>★</span>
        </div>
        <div className='absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#0a0a0f] animate-pulse' />
    </div>
    <div className='hidden sm:block'>
        <h1 className='text-lg sm:text-xl font-bold text-white tracking-tight leading-none group-hover:text-gradient transition-all duration-300'>
            Cravely
        </h1>
        <div className='flex items-center gap-1.5'>
            <p className='text-[8px] text-white/30 tracking-[0.2em] uppercase group-hover:text-white/50 transition-all duration-300'>
                🍽️ Food Delivery
            </p>
            <MdVerified size={9} className="text-blue-400" />
        </div>
    </div>
</div>

            {/* ✅ Center - Location + Delivery Info + Restaurants */}
            <div className='hidden lg:flex items-center gap-3 relative z-10'>
                
                {/* ✅ Location Selector */}
                <LocationSelector />

                {/* ✅ Delivery Info */}
                <div className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#ff2d55]/8 to-[#ff6b35]/8 border border-white/5 hover:border-[#ff2d55]/20 transition-all duration-300 group cursor-default'>
                    <div className='relative'>
                        <MdDeliveryDining size={14} className="text-[#ff6b35] group-hover:scale-110 transition-transform duration-300" />
                        <span className='absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse' />
                    </div>
                    <span className='text-white/50 text-[10px] font-medium'>Delivering to</span>
                    <span className='text-white font-semibold text-xs bg-gradient-to-r from-[#ff6b35] to-[#ffd93d] bg-clip-text text-transparent'>
                        {currentCity || 'Select City'}
                    </span>
                </div>

                {/* ✅ Restaurants Button */}
                <div className='relative' ref={restaurantRef}>
                    <button 
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-300 text-sm ${
                            showRestaurants 
                                ? 'bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white shadow-lg shadow-[#ff2d55]/25'
                                : 'bg-white/5 text-white/80 hover:bg-white/10 border border-white/5 hover:border-[#ff2d55]/30'
                        }`}
                        onClick={() => setShowRestaurants(!showRestaurants)}
                    >
                        <BiRestaurant size={16} className={showRestaurants ? 'text-white' : 'text-[#ff6b35]'} />
                        <span className='text-sm font-medium'>Restaurants</span>
                        {showRestaurants ? (
                            <FaChevronUp size={10} className="text-white/60" />
                        ) : (
                            <FaChevronDown size={10} className="text-white/30" />
                        )}
                    </button>

                    {/* ✅ Restaurants Dropdown */}
                    <AnimatePresence>
                        {showRestaurants && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className='absolute top-[48px] left-0 w-[280px] bg-[#1a1a2e]/98 backdrop-blur-2xl rounded-2xl p-3 border border-white/10 shadow-2xl shadow-black/60 max-h-[400px] overflow-y-auto'
                            >
                                <div className='flex items-center justify-between pb-2 border-b border-white/10'>
                                    <div className='flex items-center gap-2'>
                                        <MdRestaurant size={14} className="text-[#ff6b35]" />
                                        <span className='text-[10px] font-semibold text-white/60 uppercase tracking-wider'>All Restaurants</span>
                                    </div>
                                    <span className='text-[9px] text-[#ff6b35] bg-[#ff6b35]/10 px-2 py-0.5 rounded-full'>
                                        {shopsInMyCity?.length || 0} places
                                    </span>
                                </div>
                                
                                {shopsInMyCity && shopsInMyCity.length > 0 ? (
                                    <div className='mt-2 space-y-1'>
                                        {shopsInMyCity.slice(0, 6).map((shop, idx) => (
                                            <motion.div 
                                                key={shop._id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className='flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all duration-200 group'
                                                onClick={() => { navigate(`/shop/${shop._id}`); setShowRestaurants(false) }}
                                            >
                                                <div className='w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-white/10'>
                                                    <img src={shop.image} alt={shop.name} className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300' />
                                                </div>
                                                <div className='flex-1 min-w-0'>
                                                    <p className='text-sm font-medium text-white truncate group-hover:text-[#ff6b35] transition-colors duration-300'>
                                                        {shop.name}
                                                    </p>
                                                    <p className='text-[9px] text-white/40 truncate flex items-center gap-1'>
                                                        <FaMapMarkerAlt size={7} className="text-[#ff6b35]" />
                                                        {shop.address}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className='text-center py-6 text-white/30 text-sm'>
                                        <GiKnifeFork size={32} className="mx-auto mb-2 text-white/15" />
                                        <p className='font-medium'>No restaurants available</p>
                                        <p className='text-[10px] text-white/20'>in {currentCity || 'your city'}</p>
                                    </div>
                                )}
                                
                                <div className='mt-2 pt-2 border-t border-white/5'>
                                    <button 
                                        className='w-full flex items-center justify-center gap-2 text-[10px] text-[#ff6b35] hover:text-white py-2 rounded-xl hover:bg-[#ff6b35]/10 transition-all duration-300 group'
                                        onClick={() => { navigate('/restaurants'); setShowRestaurants(false) }}
                                    >
                                        <span>View All Restaurants</span>
                                        <FaArrowRight size={9} className="group-hover:translate-x-1 transition-transform duration-300" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ✅ Right Section - NOTIFICATION REMOVED */}
            <div className='flex items-center gap-1 sm:gap-2 md:gap-3 relative z-10'>
                
                {/* ✅ Search Button - Mobile */}
                <button 
                    className='lg:hidden text-white/50 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-all duration-300 hover:scale-110'
                    onClick={() => setShowSearch(!showSearch)}
                >
                    <FaSearch size={16} />
                </button>

                {/* ✅ Mobile Search Bar */}
                <AnimatePresence>
                    {showSearch && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            className='absolute top-[72px] left-0 right-0 px-4 py-3 bg-[#0a0a0f]/98 backdrop-blur-xl border-b border-white/10'
                        >
                            <form onSubmit={handleSearch} className='flex items-center gap-2'>
                                <input
                                    type="text"
                                    placeholder='Search restaurants or items...'
                                    className='flex-1 bg-[#18181D] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 text-sm'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                                <button 
                                    type="submit"
                                    className='px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white hover:scale-105 transition-all duration-300'
                                >
                                    <FaSearch size={16} />
                                </button>
                                <button 
                                    className='p-2.5 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all duration-300'
                                    onClick={() => setShowSearch(false)}
                                >
                                    <FaTimes size={16} />
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ✅ Restaurants - Mobile */}
                <button 
                    className='lg:hidden text-white/50 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-all duration-300 hover:scale-110'
                    onClick={() => navigate('/restaurants')}
                >
                    <BiRestaurant size={18} />
                </button>

                {/* ✅ Owner Actions */}
                {userData?.role === "owner" && myShopData && (
                    <>
                        <button 
                            className='hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#ff2d55]/15 to-[#ff6b35]/15 text-[#ff2d55] text-xs font-medium hover:scale-105 transition-all duration-300 border border-[#ff2d55]/20 hover:border-[#ff2d55]/50 hover:shadow-lg hover:shadow-[#ff2d55]/10'
                            onClick={() => navigate("/add-item")}
                        >
                            <FaPlus size={12} />
                            <span className='hidden lg:inline text-xs'>Add Item</span>
                        </button>
                        <button 
                            className='md:hidden p-1.5 rounded-full bg-[#ff2d55]/10 text-[#ff2d55] hover:scale-110 transition-all duration-300'
                            onClick={() => navigate("/add-item")}
                        >
                            <FaPlus size={14} />
                        </button>
                    </>
                )}

                {/* ✅ NOTIFICATIONS - REMOVED */}

                {/* ✅ Orders */}
                <button 
                    className='hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-white/70 text-xs font-medium hover:bg-white/10 hover:text-white transition-all duration-300 border border-white/5 hover:border-[#ff6b35]/30 hover:scale-105 hover:shadow-lg hover:shadow-[#ff6b35]/5'
                    onClick={() => navigate("/my-orders")}
                >
                    <IoReceiptOutline size={16} />
                    <span className='hidden lg:inline text-xs'>Orders</span>
                </button>

                {/* ✅ Cart */}
                <div className='relative cursor-pointer group' onClick={() => navigate("/cart")}>
                    <div className='w-9 h-9 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all duration-300 border border-white/5 group-hover:border-[#ff2d55]/30 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#ff2d55]/10'>
                        <FiShoppingCart size={18} className='text-white/70 group-hover:text-white transition' />
                    </div>
                    {cartItems.length > 0 && (
                        <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className='absolute -top-1 -right-1 text-[9px] font-bold text-white bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-lg shadow-[#ff2d55]/30'
                        >
                            {cartItems.length}
                        </motion.span>
                    )}
                </div>

                {/* ✅ Location Selector - Mobile */}
                <div className='lg:hidden'>
                    <LocationSelector />
                </div>

                {/* ✅ Profile */}
                <div className='relative' ref={dropdownRef}>
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className='w-[36px] h-[36px] rounded-full flex items-center justify-center bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] text-white text-[14px] font-semibold cursor-pointer shadow-lg shadow-[#ff2d55]/20 border border-white/10 hover:shadow-[#ff2d55]/40 transition-all duration-300' 
                        onClick={() => setShowInfo(!showInfo)}
                    >
                        {userData?.profilePhoto ? (
                            <img src={userData.profilePhoto} alt="profile" className='w-full h-full rounded-full object-cover' />
                        ) : (
                            userData?.fullName?.slice(0, 1) || 'U'
                        )}
                    </motion.div>

                    {/* ✅ Premium Dropdown */}
                    <AnimatePresence>
                        {showInfo && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className='absolute top-[48px] right-0 w-[250px] bg-[#1a1a2e]/98 backdrop-blur-2xl rounded-2xl p-4 border border-white/10 shadow-2xl shadow-black/60'
                            >
                                {/* User Info */}
                                <div className='flex items-center gap-3 pb-3 border-b border-white/10'>
                                    <div className='w-11 h-11 rounded-full bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center text-white font-bold text-base'>
                                        {userData?.fullName?.slice(0, 1) || 'U'}
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-sm font-semibold text-white truncate flex items-center gap-1.5'>
                                            {userData?.fullName}
                                            <MdVerified size={11} className="text-blue-400 flex-shrink-0" />
                                        </p>
                                        <p className='text-[9px] text-white/40 truncate'>{userData?.email}</p>
                                        <span className={`text-[7px] font-medium px-2 py-0.5 rounded-full ${roleBadge.color}`}>
                                            {roleBadge.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className='py-1 space-y-0.5'>
                                    <div 
                                        className='flex items-center gap-3 text-white/60 hover:text-white cursor-pointer py-2 px-3 rounded-xl hover:bg-white/5 transition-all duration-200 group'
                                        onClick={() => { navigate("/profile"); setShowInfo(false) }}
                                    >
                                        <FaUserCog size={14} className="group-hover:rotate-12 transition-transform duration-300" />
                                        <span className='text-sm font-medium'>Profile Settings</span>
                                        <FaArrowRight size={9} className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
                                    </div>

                                    {userData?.role === "user" && (
                                        <div 
                                            className='flex items-center gap-3 text-white/60 hover:text-white cursor-pointer py-2 px-3 rounded-xl hover:bg-white/5 transition-all duration-200 group'
                                            onClick={() => { navigate("/my-orders"); setShowInfo(false) }}
                                        >
                                            <IoReceiptOutline size={14} className="group-hover:scale-110 transition-transform duration-300" />
                                            <span className='text-sm font-medium'>My Orders</span>
                                            <FaArrowRight size={9} className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
                                        </div>
                                    )}

                                    {userData?.role === "owner" && (
                                        <>
                                            <div 
                                                className='flex items-center gap-3 text-white/60 hover:text-white cursor-pointer py-2 px-3 rounded-xl hover:bg-white/5 transition-all duration-200 group'
                                                onClick={() => { navigate("/my-orders"); setShowInfo(false) }}
                                            >
                                                <IoReceiptOutline size={14} className="group-hover:scale-110 transition-transform duration-300" />
                                                <span className='text-sm font-medium'>Order Management</span>
                                                <FaArrowRight size={9} className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
                                            </div>
                                            <div 
                                                className='flex items-center gap-3 text-white/60 hover:text-white cursor-pointer py-2 px-3 rounded-xl hover:bg-white/5 transition-all duration-200 group'
                                                onClick={() => { navigate("/create-edit-shop"); setShowInfo(false) }}
                                            >
                                                <MdRestaurant size={14} className="group-hover:scale-110 transition-transform duration-300" />
                                                <span className='text-sm font-medium'>Manage Shop</span>
                                                <FaArrowRight size={9} className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
                                            </div>
                                        </>
                                    )}

                                    {userData?.role === "superAdmin" && (
                                        <div 
                                            className='flex items-center gap-3 text-white/60 hover:text-white cursor-pointer py-2 px-3 rounded-xl hover:bg-white/5 transition-all duration-200 group'
                                            onClick={() => { navigate("/admin/dashboard"); setShowInfo(false) }}
                                        >
                                            <FaCrown size={14} className="text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
                                            <span className='text-sm font-medium'>Admin Dashboard</span>
                                            <FaArrowRight size={9} className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
                                        </div>
                                    )}

                                    <div className='h-px bg-white/5 my-1' />

                                    <div 
                                        className='flex items-center gap-3 text-white/40 hover:text-white cursor-pointer py-2 px-3 rounded-xl hover:bg-white/5 transition-all duration-200 group'
                                        onClick={() => { navigate("/help"); setShowInfo(false) }}
                                    >
                                        <FaHeadset size={14} className="group-hover:scale-110 transition-transform duration-300" />
                                        <span className='text-sm font-medium'>Help & Support</span>
                                    </div>
                                </div>

                                {/* Logout */}
                                <div 
                                    className='flex items-center gap-3 text-red-400/70 hover:text-red-400 cursor-pointer py-2 px-3 rounded-xl hover:bg-red-500/10 transition-all duration-200 border-t border-white/5 pt-3 group'
                                    onClick={handleLogOut}
                                >
                                    <IoLogOut size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                                    <span className='text-sm font-medium'>Logout</span>
                                </div>

                                {/* Footer */}
                                <div className='mt-2 pt-2 border-t border-white/5'>
                                    <p className='text-[8px] text-white/20 text-center'>
                                        Cravely v2.0 • {new Date().getFullYear()}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <style jsx>{`
                @keyframes slide-down {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-down {
                    animation: slide-down 0.5s ease-out forwards;
                }

                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out forwards;
                }

                @keyframes bounce-in {
                    0% { transform: scale(0); }
                    50% { transform: scale(1.3); }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); }
                }
                .animate-bounce-in {
                    animation: bounce-in 0.5s ease-out forwards;
                }

                @keyframes pulse-glow {
                    0%, 100% { transform: scale(1); opacity: 0.4; }
                    50% { transform: scale(1.2); opacity: 0.7; }
                }
                .animate-pulse-glow {
                    animation: pulse-glow 4s ease-in-out infinite;
                }
                .animation-delay-200 { animation-delay: 0.2s; }
                .animation-delay-400 { animation-delay: 0.4s; }

                .text-gradient {
                    background: linear-gradient(135deg, #ff2d55, #ff6b35, #ffd93d);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                .animate-pulse {
                    animation: pulse 2s ease-in-out infinite;
                }

                .overflow-y-auto::-webkit-scrollbar {
                    width: 4px;
                }
                .overflow-y-auto::-webkit-scrollbar-track {
                    background: transparent;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: rgba(255, 45, 85, 0.3);
                    border-radius: 10px;
                }
            `}</style>
        </nav>
    )
}

export default Nav

