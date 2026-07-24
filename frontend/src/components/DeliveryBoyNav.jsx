import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { setUserData } from '../redux/userSlice'
import { 
    FaHamburger, FaMotorcycle, FaUserCircle, 
    FaSignOutAlt, FaHome, FaTruck,
    FaWallet, FaStar, FaCrown, FaBolt,
    FaShieldAlt, FaGem, FaRocket
} from "react-icons/fa";
import { MdDeliveryDining, MdVerified } from 'react-icons/md'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'

function DeliveryBoyNav() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)
    const [showDropdown, setShowDropdown] = useState(false)
    const [isOnline, setIsOnline] = useState(userData?.isOnline || true)
    const [todayEarning, setTodayEarning] = useState(0)
    const [scrolled, setScrolled] = useState(false)

    // ✅ Scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // ✅ Fetch today's earning
    useEffect(() => {
        const fetchEarning = async () => {
            try {
                const response = await axios.get(`${serverUrl}/api/order/get-today-deliveries`, {
                    withCredentials: true
                })
                const deliveries = response.data || []
                // ✅ FIXED: Use fixed rate instead of userData?.ratePerDelivery
                const ratePerDelivery = 50  // Fixed rate per delivery
                const total = deliveries.reduce((sum, d) => sum + d.count * ratePerDelivery, 0)
                setTodayEarning(total)
            } catch (error) {
                console.log('❌ Fetch earning error:', error)
            }
        }
        fetchEarning()
    }, [userData])

    const handleLogout = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
            dispatch(setUserData(null))
            localStorage.removeItem('userData')
            toast.success('Logged out successfully! 👋')
            navigate('/signin')
        } catch (error) {
            toast.error('Logout failed!')
        }
    }

    const toggleOnlineStatus = async () => {
        try {
            const newStatus = !isOnline
            await axios.put(`${serverUrl}/api/user/delivery-boy/status`, {
                isOnline: newStatus
            }, { withCredentials: true })
            setIsOnline(newStatus)
            toast.success(`You are now ${newStatus ? '🟢 Online' : '🔴 Offline'}`)
        } catch (error) {
            toast.error('Failed to update status')
        }
    }

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
            scrolled 
                ? 'bg-[#0a0a0f]/98 backdrop-blur-2xl border-b border-white/10 shadow-2xl shadow-black/50' 
                : 'bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5'
        }`}>
            
            {/* ✅ Animated Background Glow */}
            <div className='absolute inset-0 pointer-events-none'>
                <div className='absolute -top-20 -left-20 w-80 h-80 bg-[#ff2d55]/6 rounded-full blur-3xl animate-pulse-glow' />
                <div className='absolute -top-20 -right-20 w-80 h-80 bg-[#ff6b35]/6 rounded-full blur-3xl animate-pulse-glow animation-delay-200' />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex items-center justify-between h-[70px]">
                    
                    {/* ✅ Logo */}
                    <div 
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => navigate('/home')}
                    >
                        <div className="relative">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center shadow-lg shadow-[#ff2d55]/25 group-hover:scale-110 transition-all duration-300 group-hover:shadow-[#ff2d55]/40 group-hover:rotate-[-5deg]">
                                <FaMotorcycle className="text-white text-xl" />
                            </div>
                            <div className='absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#ffd93d] flex items-center justify-center animate-pulse'>
                                <span className='text-[6px] font-bold text-[#0a0a0f]'>★</span>
                            </div>
                            <div className='absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#0a0a0f] animate-pulse' />
                        </div>
                        <div className='hidden sm:block'>
                            <h1 className="text-xl font-bold text-white tracking-tight leading-none group-hover:text-gradient transition-all duration-300">
                                Cravely
                            </h1>
                            <div className='flex items-center gap-1.5'>
                                <p className="text-[8px] text-white/30 tracking-[0.2em] uppercase group-hover:text-white/50 transition-all duration-300">
                                    🛵 Delivery Partner
                                </p>
                                <MdVerified size={9} className="text-blue-400" />
                            </div>
                        </div>
                    </div>

                    {/* ✅ Center - Online Status & Stats */}
                    <div className="hidden md:flex items-center gap-4">
                        
                        {/* ✅ Online/Offline Toggle - KEEP IN NAVBAR */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-300 ${
                                isOnline 
                                    ? 'bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30 shadow-lg shadow-green-500/10' 
                                    : 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30 shadow-lg shadow-red-500/10'
                            }`}
                            onClick={toggleOnlineStatus}
                        >
                            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                            <span className="text-xs font-medium">{isOnline ? '🟢 Online' : '🔴 Offline'}</span>
                            <FaBolt size={10} className={isOnline ? 'text-green-400' : 'text-red-400'} />
                        </motion.button>

                        {/* ✅ Today's Earning */}
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#ffd93d]/10 to-[#ff6b35]/10 border border-white/5 hover:border-[#ffd93d]/30 transition-all duration-300"
                        >
                            <FaWallet className="text-[#ffd93d] text-sm" />
                            <span className="text-white/50 text-xs font-medium">Today:</span>
                            <span className="text-white font-bold text-sm bg-gradient-to-r from-[#ffd93d] to-[#ff6b35] bg-clip-text text-transparent">
                                ₹{todayEarning}
                            </span>
                        </motion.div>

                        {/* ✅ Rating */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                            <FaStar className="text-yellow-400 text-xs" />
                            <span className="text-white/60 text-xs font-medium">
                                {userData?.deliveryBoyRating?.average?.toFixed(1) || '4.8'}
                            </span>
                            <span className="text-white/20 text-[10px]">
                                ({userData?.deliveryBoyRating?.count || 0})
                            </span>
                        </div>
                    </div>

                    {/* ✅ Right Actions */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        
                        {/* ✅ Orders */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-white/50 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all duration-300"
                            onClick={() => navigate('/my-orders')}
                        >
                            <FaTruck size={18} />
                        </motion.button>

                        {/* ✅ Profile Dropdown */}
                        <div className="relative">
                            <motion.button
                                whileHover={{ scale: 1.08, rotate: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#ff2d55]/20 hover:shadow-[#ff2d55]/40 transition-all duration-300 border border-white/10"
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                {userData?.profilePhoto ? (
                                    <img src={userData.profilePhoto} alt="profile" className='w-full h-full rounded-full object-cover' />
                                ) : (
                                    userData?.fullName?.charAt(0) || 'D'
                                )}
                            </motion.button>

                            {/* ✅ Premium Dropdown */}
                            <AnimatePresence>
                                {showDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                        className="absolute right-0 mt-2 w-64 bg-[#1a1a2e]/98 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl shadow-black/60 overflow-hidden z-50"
                                    >
                                        {/* ✅ User Info */}
                                        <div className="p-5 border-b border-white/10 bg-gradient-to-r from-white/[0.03] to-transparent">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#ff2d55]/20">
                                                    {userData?.fullName?.charAt(0) || 'D'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-semibold text-sm truncate flex items-center gap-1.5">
                                                        {userData?.fullName}
                                                        <MdVerified size={12} className="text-blue-400 flex-shrink-0" />
                                                    </p>
                                                    <p className="text-white/30 text-[10px] truncate">{userData?.email}</p>
                                                </div>
                                            </div>
                                            <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-medium border ${
                                                isOnline 
                                                    ? 'bg-green-500/20 text-green-400 border-green-500/20' 
                                                    : 'bg-red-500/20 text-red-400 border-red-500/20'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                                                {isOnline ? '🟢 Online' : '🔴 Offline'}
                                            </div>
                                        </div>

                                        {/* ✅ Menu Items - REMOVED Go Offline */}
                                        <div className="p-2 space-y-0.5">
                                            <button
                                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm group"
                                                onClick={() => { navigate('/profile'); setShowDropdown(false) }}
                                            >
                                                <FaUserCircle size={14} className="group-hover:scale-110 transition-transform" />
                                                <span>Profile</span>
                                                <FaRocket size={10} className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                                            </button>
                                            <button
                                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm group"
                                                onClick={() => { navigate('/my-orders'); setShowDropdown(false) }}
                                            >
                                                <FaTruck size={14} className="group-hover:scale-110 transition-transform" />
                                                <span>My Deliveries</span>
                                                <FaRocket size={10} className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                                            </button>
                                            
                                            {/* ✅ REMOVED: Go Offline/Online Toggle from Dropdown */}
                                            
                                            {/* ✅ Logout Button */}
                                            <button
                                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm group"
                                                onClick={handleLogout}
                                            >
                                                <FaSignOutAlt size={14} className="group-hover:translate-x-1 transition-transform" />
                                                <span>Logout</span>
                                                <FaRocket size={10} className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                                            </button>
                                        </div>

                                        {/* ✅ Footer */}
                                        <div className="px-4 py-2 border-t border-white/5">
                                            <p className="text-[8px] text-white/20 text-center">
                                                Cravely v2.0 • {new Date().getFullYear()}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-2xl border-t border-white/5 px-4 py-2">
                <div className="flex items-center justify-around">
                    {[
                        { icon: <FaHome size={18} />, label: 'Home', path: '/home' },
                        { icon: <FaTruck size={18} />, label: 'Orders', path: '/my-orders' },
                        { icon: <FaUserCircle size={18} />, label: 'Profile', path: '/profile' }
                    ].map((item, idx) => (
                        <motion.button 
                            key={idx}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="flex flex-col items-center gap-0.5 text-white/40 hover:text-white transition group"
                            onClick={() => navigate(item.path)}
                        >
                            <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
                            <span className="text-[8px] font-medium group-hover:text-[#ff6b35] transition-colors">{item.label}</span>
                        </motion.button>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                .animate-pulse {
                    animation: pulse 2s ease-in-out infinite;
                }

                @keyframes pulse-glow {
                    0%, 100% { transform: scale(1); opacity: 0.4; }
                    50% { transform: scale(1.2); opacity: 0.7; }
                }
                .animate-pulse-glow {
                    animation: pulse-glow 4s ease-in-out infinite;
                }
                .animation-delay-200 { animation-delay: 0.2s; }

                .text-gradient {
                    background: linear-gradient(135deg, #ff2d55, #ff6b35, #ffd93d);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
            `}</style>
        </nav>
    )
}

export default DeliveryBoyNav