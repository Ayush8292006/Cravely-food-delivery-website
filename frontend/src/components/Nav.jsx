import React, { useState, useEffect, useRef } from 'react'
import { 
    FaUtensils, FaSearch, FaChevronDown, 
    FaHeadset, FaUserCog, FaPlus, FaCrown, FaUtensilSpoon, FaBell, FaTag,
    FaRegHeart, FaCompass
} from "react-icons/fa";
import { FiShoppingCart } from "react-icons/fi";
import { IoReceiptOutline, IoLogOut } from "react-icons/io5";
import { MdDeliveryDining, MdRestaurant, MdVerified } from "react-icons/md";
import { HiHome } from "react-icons/hi2";
import { useDispatch, useSelector } from 'react-redux';
import { serverUrl } from '../../config' 
import axios from 'axios';
import { setUserData } from '../redux/userSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import LocationSelector from './LocationSelector';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { clearSessionUser } from '../utils/auth'

function Nav() {
    const { userData, cartItems } = useSelector(state => state.user)
    const [showInfo, setShowInfo] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [scrolled, setScrolled] = useState(false)
    
    // Notifications
    const [notifications, setNotifications] = useState([])
    const [unreadNotifCount, setUnreadNotifCount] = useState(0)
    const [showNotifDropdown, setShowNotifDropdown] = useState(false)

    const dropdownRef = useRef(null)
    const notifRef = useRef(null)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 15)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        if (userData?._id) {
            fetchNotifications()
        }
    }, [userData])

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/notification/my`, { withCredentials: true })
            setNotifications(res.data.notifications || [])
            setUnreadNotifCount(res.data.unreadCount || 0)
        } catch (e) {}
    }

    const handleMarkAllRead = async () => {
        try {
            await axios.put(`${serverUrl}/api/notification/read-all`, {}, { withCredentials: true })
            setUnreadNotifCount(0)
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        } catch (e) {}
    }

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowInfo(false)
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifDropdown(false)
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    const handleLogOut = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
            clearSessionUser()
            localStorage.removeItem('userData')
            dispatch(setUserData(null))
            setShowInfo(false)
            toast.success('Logged out successfully!')
            navigate("/signin")
        } catch (error) {
            console.log(error)
            toast.error('Logout failed!')
        }
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
        } else {
            navigate('/restaurants')
        }
    }

    const getRoleBadge = () => {
        switch(userData?.role) {
            case 'owner': return { label: 'Restaurant Owner', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' }
            case 'deliveryBoy': return { label: 'Delivery Partner', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
            case 'superAdmin': return { label: 'Super Admin', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' }
            default: return { label: 'Foodie Club', color: 'bg-white/10 text-white/80 border-white/10' }
        }
    }

    const roleBadge = getRoleBadge()

    const navLinks = [
        { label: 'Home', path: '/home', isCurrent: location.pathname === '/home' || location.pathname === '/' },
        { label: 'Restaurants', path: '/restaurants', isCurrent: location.pathname === '/restaurants' },
        { label: 'Offers', path: '/offers', isCurrent: location.pathname === '/offers' },
        { label: 'Orders', path: '/my-orders', isCurrent: location.pathname === '/my-orders' }
    ]

    const mobileBottomTabs = [
        { 
            id: 'home', 
            label: 'Home', 
            path: '/home', 
            icon: HiHome, 
            active: location.pathname === '/home' || location.pathname === '/' 
        },
        { 
            id: 'restaurants', 
            label: 'Restaurants', 
            path: '/restaurants', 
            icon: FaCompass, 
            active: location.pathname === '/restaurants' 
        },
        { 
            id: 'search', 
            label: 'Search', 
            path: '/search', 
            icon: FaSearch, 
            active: location.pathname === '/search' 
        },
        { 
            id: 'offers', 
            label: 'Offers', 
            path: '/offers', 
            icon: FaTag, 
            active: location.pathname === '/offers'
        },
        { 
            id: 'cart', 
            label: 'Cart', 
            path: '/cart', 
            icon: FiShoppingCart, 
            active: location.pathname === '/cart',
            count: cartItems?.length || 0 
        }
    ]

    return (
        <>
            {/* ========================================================
                DESKTOP NAVBAR (lg and up) - BLACK & ORANGE LUXURY THEME
                Preserving Cravely brand identity, real links, real state
               ======================================================== */}
            <header className={`hidden lg:flex w-full h-[76px] items-center justify-between px-6 xl:px-12 fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
                scrolled 
                    ? 'bg-[#0A090D]/98 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.85)]' 
                    : 'bg-[#0A090D]/95 backdrop-blur-xl border-b border-white/[0.06]'
            }`}>
                {/* 1. Left: Cravely Brand Logo & Delivery Location */}
                <div className="flex items-center gap-5 flex-shrink-0">
                    <div 
                        className="flex items-center gap-2.5 cursor-pointer group"
                        onClick={() => navigate(userData ? "/home" : "/")}
                    >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF5200] via-[#FF6B00] to-[#E11D48] flex items-center justify-center shadow-md shadow-orange-500/40 group-hover:scale-105 transition-all duration-300">
                            <FaUtensilSpoon className="text-white text-xs -rotate-12" />
                            <FaUtensils className="text-white text-[10px] rotate-12 -ml-0.5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1">
                                <span className="text-xl font-black text-white tracking-tight leading-none group-hover:text-[#FF6B00] transition-colors">
                                    Cravely
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-pulse" />
                            </div>
                            <span className="text-[8px] font-bold text-white/40 tracking-[0.2em] uppercase block mt-0.5">
                                Gourmet Express
                            </span>
                        </div>
                    </div>

                    <div className="h-5 w-px bg-white/10" />

                    {/* Interactive Location Selector (Dark Theme) */}
                    <div className="flex items-center">
                        <LocationSelector theme="dark" />
                    </div>
                </div>

                {/* 2. Center: Rounded Pill Search Bar */}
                <form 
                    onSubmit={handleSearchSubmit}
                    className="flex-1 max-w-md xl:max-w-lg mx-6"
                >
                    <div className="relative w-full flex items-center bg-[#15141D] hover:bg-[#1A1824] border border-white/10 hover:border-orange-500/40 focus-within:border-[#FF6B00] rounded-full px-4 py-2 transition-all duration-300 shadow-inner group">
                        <FaSearch size={13} className="text-white/40 group-focus-within:text-[#FF6B00] mr-2.5 transition-colors flex-shrink-0" />
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search restaurants, dishes and cuisines..."
                            className="w-full bg-transparent text-xs text-white placeholder:text-white/40 focus:outline-none"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="text-white/40 hover:text-white text-xs ml-1 flex-shrink-0"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </form>

                {/* 3. Right: Navigation Links, Notifications, Cart, Profile */}
                <div className="flex items-center gap-6 xl:gap-8 flex-shrink-0">
                    {/* Navigation Links */}
                    <nav className="flex items-center gap-5 xl:gap-6">
                        {navLinks.map((link) => (
                            <button
                                key={link.path}
                                onClick={() => navigate(link.path)}
                                className={`relative text-sm font-semibold transition-colors duration-200 py-1 ${
                                    link.isCurrent 
                                        ? 'text-[#FF6B00] font-bold' 
                                        : 'text-white/80 hover:text-white'
                                }`}
                            >
                                <span>{link.label}</span>
                                {link.isCurrent && (
                                    <motion.div 
                                        layoutId="desktopNavActiveLine"
                                        className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[#FF6B00] rounded-full shadow-[0_0_8px_#FF6B00]"
                                    />
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* Action Icons */}
                    <div className="flex items-center gap-3.5 pl-2 border-l border-white/10">
                        {/* Notifications (for logged-in user) */}
                        {userData && (
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                                    className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/[0.06] relative transition-all hover:scale-105"
                                    title="Notifications"
                                >
                                    <FaBell size={15} />
                                    {unreadNotifCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-[#FF6B00] to-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg shadow-orange-500/40 animate-pulse">
                                            {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                                        </span>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {showNotifDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                            className="absolute top-[48px] right-0 w-80 bg-[#12111A] border border-white/10 rounded-2xl p-4 shadow-2xl z-50 max-h-[400px] overflow-y-auto"
                                        >
                                            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-2">
                                                <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                                                    <FaBell className="text-[#FF6B00]" size={11} /> Notifications
                                                </h4>
                                                {unreadNotifCount > 0 && (
                                                    <button
                                                        onClick={handleMarkAllRead}
                                                        className="text-[10px] text-[#FF6B00] hover:text-orange-300 font-semibold"
                                                    >
                                                        Mark all read
                                                    </button>
                                                )}
                                            </div>

                                            {notifications.length === 0 ? (
                                                <div className="text-center py-6 text-white/40 text-xs">
                                                    No notifications right now.
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {notifications.map((n) => (
                                                        <div
                                                            key={n._id}
                                                            onClick={() => {
                                                                if (n.link) navigate(n.link)
                                                                setShowNotifDropdown(false)
                                                            }}
                                                            className={`p-2.5 rounded-xl cursor-pointer transition text-left ${
                                                                n.isRead ? 'bg-white/[0.02] hover:bg-white/5' : 'bg-orange-500/10 border border-orange-500/20'
                                                            }`}
                                                        >
                                                            <div className="font-semibold text-xs text-white">{n.title}</div>
                                                            <div className="text-[11px] text-white/60 line-clamp-2 mt-0.5">{n.message}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Wishlist Icon */}
                        <button
                            onClick={() => navigate('/restaurants')}
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-[#FF6B00] hover:bg-white/[0.06] transition-all hover:scale-105"
                            title="Favorites"
                        >
                            <FaRegHeart size={16} />
                        </button>

                        {/* Cart with Live Red Badge */}
                        <div
                            className="relative cursor-pointer group"
                            onClick={() => navigate("/cart")}
                            title="View Cart"
                        >
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 group-hover:text-white group-hover:bg-white/[0.06] transition-all group-hover:scale-105">
                                <FiShoppingCart size={18} />
                            </div>
                            {cartItems?.length > 0 && (
                                <motion.span 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 text-[10px] font-black text-white bg-gradient-to-r from-[#FF5200] to-red-500 rounded-full w-4 h-4 flex items-center justify-center shadow-md shadow-orange-500/40 border border-[#0A090D]"
                                >
                                    {cartItems.length}
                                </motion.span>
                            )}
                        </div>

                        {/* User Profile or Sign In */}
                        {userData ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setShowInfo(!showInfo)}
                                    className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-orange-500/50 transition cursor-pointer"
                                >
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF6B00] to-red-500 text-white font-black text-xs flex items-center justify-center overflow-hidden shadow-md shadow-orange-500/30">
                                        {userData?.profilePhoto ? (
                                            <img src={userData.profilePhoto} alt="profile" className="w-full h-full object-cover" />
                                        ) : (
                                            userData?.fullName?.slice(0, 1) || userData?.name?.slice(0, 1) || 'U'
                                        )}
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {showInfo && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                            className="absolute top-[48px] right-0 w-64 bg-[#12111A] border border-white/10 rounded-2xl p-4 shadow-2xl z-50 text-white"
                                        >
                                            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                                                <div className="w-10 h-10 rounded-xl bg-[#FF6B00] flex items-center justify-center text-white font-bold text-sm">
                                                    {userData?.fullName?.slice(0, 1) || userData?.name?.slice(0, 1) || 'U'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-white truncate flex items-center gap-1">
                                                        {userData?.fullName || userData?.name}
                                                        <MdVerified size={13} className="text-[#FF6B00]" />
                                                    </p>
                                                    <p className="text-[11px] text-white/40 truncate">{userData?.email}</p>
                                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 inline-block border ${roleBadge.color}`}>
                                                        {roleBadge.label}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="py-2 space-y-1 text-xs">
                                                <button 
                                                    className="w-full flex items-center gap-2.5 text-white/70 hover:text-white py-2 px-3 rounded-xl hover:bg-white/5 transition text-left font-medium"
                                                    onClick={() => { navigate("/profile"); setShowInfo(false) }}
                                                >
                                                    <FaUserCog size={13} className="text-[#FF6B00]" /> Profile & Addresses
                                                </button>

                                                <button 
                                                    className="w-full flex items-center gap-2.5 text-white/70 hover:text-white py-2 px-3 rounded-xl hover:bg-white/5 transition text-left font-medium"
                                                    onClick={() => { navigate("/my-orders"); setShowInfo(false) }}
                                                >
                                                    <IoReceiptOutline size={14} className="text-[#FF6B00]" /> My Orders & Tracking
                                                </button>

                                                <button 
                                                    className="w-full flex items-center gap-2.5 text-white/70 hover:text-white py-2 px-3 rounded-xl hover:bg-white/5 transition text-left font-medium"
                                                    onClick={() => { navigate("/offers"); setShowInfo(false) }}
                                                >
                                                    <FaTag size={12} className="text-[#FF6B00]" /> Deals & Offers
                                                </button>

                                                {userData?.role === "owner" && (
                                                    <button 
                                                        className="w-full flex items-center gap-2.5 text-white/70 hover:text-white py-2 px-3 rounded-xl hover:bg-white/5 transition text-left font-medium"
                                                        onClick={() => { navigate("/owner-dashboard"); setShowInfo(false) }}
                                                    >
                                                        <MdRestaurant size={13} className="text-amber-400" /> Owner Dashboard
                                                    </button>
                                                )}

                                                {userData?.role === "superAdmin" && (
                                                    <button 
                                                        className="w-full flex items-center gap-2.5 text-white/70 hover:text-white py-2 px-3 rounded-xl hover:bg-white/5 transition text-left font-medium"
                                                        onClick={() => { navigate("/admin/dashboard"); setShowInfo(false) }}
                                                    >
                                                        <FaCrown size={13} className="text-purple-400" /> Admin Panel
                                                    </button>
                                                )}

                                                {userData?.role === "deliveryBoy" && (
                                                    <button 
                                                        className="w-full flex items-center gap-2.5 text-white/70 hover:text-white py-2 px-3 rounded-xl hover:bg-white/5 transition text-left font-medium"
                                                        onClick={() => { navigate("/delivery-dashboard"); setShowInfo(false) }}
                                                    >
                                                        <MdDeliveryDining size={15} className="text-blue-400" /> Delivery Dashboard
                                                    </button>
                                                )}

                                                <button 
                                                    className="w-full flex items-center gap-2.5 text-white/70 hover:text-white py-2 px-3 rounded-xl hover:bg-white/5 transition text-left font-medium"
                                                    onClick={() => { navigate("/help"); setShowInfo(false) }}
                                                >
                                                    <FaHeadset size={13} className="text-[#FF6B00]" /> Help & Support
                                                </button>
                                            </div>

                                            <div className="pt-2 border-t border-white/10 mt-1">
                                                <button 
                                                    className="w-full flex items-center gap-2.5 text-red-400 hover:text-red-300 py-2 px-3 rounded-xl hover:bg-red-500/10 transition text-xs font-bold"
                                                    onClick={handleLogOut}
                                                >
                                                    <IoLogOut size={15} /> Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigate('/signin')}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-white/80 hover:text-white hover:bg-white/5 transition"
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-[#FF5200] via-[#FF6B00] to-[#E11D48] text-white shadow-md shadow-orange-500/30 hover:scale-105 transition"
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ========================================================
                MOBILE TOP HEADER (lg:hidden) - BLACK & ORANGE LUXURY
               ======================================================== */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0A090D]/95 backdrop-blur-2xl border-b border-white/[0.08] px-4 pt-2.5 pb-2.5 space-y-2 shadow-lg">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div 
                            className="flex items-center gap-2 cursor-pointer flex-shrink-0"
                            onClick={() => navigate(userData ? "/home" : "/")}
                        >
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF5200] to-[#FF6B00] flex items-center justify-center shadow-md shadow-orange-500/40">
                                <FaUtensilSpoon className="text-white text-xs -rotate-12" />
                            </div>
                            <span className="text-base font-black text-white tracking-tight">
                                Cravely<span className="text-[#FF6B00]">.</span>
                            </span>
                        </div>

                        {/* Location Selector */}
                        <div className="min-w-0 flex-1">
                            <LocationSelector theme="dark" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        {userData ? (
                            <button
                                onClick={() => navigate('/profile')}
                                className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF6B00] to-red-500 text-white font-bold text-xs flex items-center justify-center overflow-hidden border border-white/20"
                            >
                                {userData?.profilePhoto ? (
                                    <img src={userData.profilePhoto} alt="profile" className="w-full h-full object-cover" />
                                ) : (
                                    userData?.fullName?.slice(0, 1) || userData?.name?.slice(0, 1) || 'U'
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/signin')}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FF6B00] text-white shadow-sm"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Search Bar */}
                <form 
                    onSubmit={handleSearchSubmit}
                    className="w-full flex items-center bg-[#15141D] border border-white/10 rounded-full px-3.5 py-2 text-white transition-all duration-300 focus-within:border-orange-500"
                >
                    <FaSearch size={12} className="text-[#FF6B00] mr-2.5 flex-shrink-0" />
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search restaurants, dishes and cuisines..."
                        className="w-full bg-transparent text-xs text-white placeholder:text-white/40 focus:outline-none"
                    />
                    {searchQuery && (
                        <button 
                            type="button" 
                            onClick={() => setSearchQuery('')}
                            className="text-white/40 hover:text-white text-xs px-1"
                        >
                            ✕
                        </button>
                    )}
                </form>
            </header>

            {/* ========================================================
                MOBILE FIXED BOTTOM NAVIGATION BAR (lg:hidden)
               ======================================================== */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A090D]/95 backdrop-blur-2xl border-t border-white/[0.08] shadow-[0_-8px_30px_rgba(0,0,0,0.8)] pb-safe">
                <div className="flex items-center justify-around h-16 px-2">
                    {mobileBottomTabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => navigate(tab.path)}
                                className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-200 active:scale-90 ${
                                    tab.active ? 'text-[#FF6B00]' : 'text-white/50 hover:text-white/80'
                                }`}
                            >
                                <div className="relative">
                                    <Icon size={20} className={tab.active ? 'drop-shadow-[0_0_6px_rgba(255,107,0,0.6)]' : ''} />
                                    
                                    {tab.count > 0 && (
                                        <span className="absolute -top-1.5 -right-2.5 text-[9px] font-black text-white bg-gradient-to-r from-[#FF5200] to-red-500 rounded-full w-4 h-4 flex items-center justify-center border border-[#0A090D]">
                                            {tab.count}
                                        </span>
                                    )}
                                </div>

                                <span className={`text-[10px] mt-1 font-semibold tracking-tight ${
                                    tab.active ? 'text-[#FF6B00]' : 'text-white/60'
                                }`}>
                                    {tab.label}
                                </span>

                                {tab.active && (
                                    <motion.div 
                                        layoutId="mobileBottomTabActive"
                                        className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] shadow-[0_0_6px_#FF6B00] mt-0.5"
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>
            </nav>
        </>
    )
}

export default Nav
