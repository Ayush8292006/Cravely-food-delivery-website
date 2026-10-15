// src/components/DeliveryBoyNav.js

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../../config'  // ✅ config outside src
import { setUserData } from '../redux/userSlice'
import { 
    FaMotorcycle, FaUserCircle, FaSignOutAlt, FaHome, 
    FaTruck, FaWallet, FaStar, FaChartBar, FaBolt,
    FaShieldAlt, FaGem, FaRocket, FaArrowLeft
} from "react-icons/fa";
import { MdDeliveryDining, MdVerified } from 'react-icons/md'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { clearSessionUser } from '../utils/auth'

function DeliveryBoyNav() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)
    const [showDropdown, setShowDropdown] = useState(false)
    const [isOnline, setIsOnline] = useState(userData?.isOnline || true)
    const [totalEarning, setTotalEarning] = useState(0)
    const [earningLoading, setEarningLoading] = useState(true)
    const [scrolled, setScrolled] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // ✅ Fetch total earning from backend
    useEffect(() => {
        const fetchEarning = async () => {
            setEarningLoading(true)
            try {
                const response = await axios.get(`${serverUrl}/api/user/current`, {
                    withCredentials: true
                })
                const user = response.data
                setTotalEarning(user?.earnings || 0)
                console.log('💰 Total Earnings:', user?.earnings)
            } catch (error) {
                console.log('❌ Fetch earning error:', error)
                setTotalEarning(userData?.earnings || 0)
            } finally {
                setEarningLoading(false)
            }
        }
        fetchEarning()
    }, [userData?.earnings])

    // ✅ Logout
    const handleLogout = useCallback(async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
            clearSessionUser()
            localStorage.removeItem('userData')
            dispatch(setUserData(null))
            toast.success('Logged out successfully! 👋', {
                position: "top-center",
                autoClose: 3000,
            })
            navigate('/signin')
        } catch (error) {
            console.log('❌ Logout error:', error)
            toast.error('Logout failed!', {
                position: "top-center",
                autoClose: 3000,
            })
        }
    }, [dispatch, navigate])

    // ✅ Toggle Online Status
    const toggleOnlineStatus = useCallback(async () => {
        try {
            const newStatus = !isOnline
            await axios.put(`${serverUrl}/api/user/delivery-boy/status`, {
                isOnline: newStatus
            }, { withCredentials: true })
            setIsOnline(newStatus)
            toast.success(`You are now ${newStatus ? '🟢 Online' : '🔴 Offline'}`, {
                position: "top-center",
                autoClose: 2000,
            })
        } catch (error) {
            console.log('❌ Status update error:', error)
            toast.error('Failed to update status', {
                position: "top-center",
                autoClose: 3000,
            })
        }
    }, [isOnline])

    const closeDropdown = useCallback(() => {
        setShowDropdown(false)
    }, [])

    return (
        <nav className={`w-full h-[64px] flex items-center justify-between px-4 sm:px-6 lg:px-10 fixed top-0 z-[9999] transition-all duration-300 ${
            scrolled ? 'bg-[#e85d04] shadow-md' : 'bg-[#e85d04]'
        }`}>

            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/home')}>
                <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <FaMotorcycle className="text-[#e85d04] text-lg" />
                    </div>
                    <div className='absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-400 border-2 border-[#e85d04] flex items-center justify-center'>
                        <span className='text-[5px] font-bold text-white'>★</span>
                    </div>
                </div>
                <div className='hidden sm:block'>
                    <h1 className="text-lg font-bold text-white leading-none tracking-tight">Cravely</h1>
                    <div className='flex items-center gap-1.5'>
                        <p className="text-[7px] text-white/50 tracking-[0.15em] uppercase font-medium">🛵 Delivery Partner</p>
                        <MdVerified size={9} className="text-blue-400" />
                    </div>
                </div>
            </div>

            {/* Center - Online Status & Stats */}
            <div className="hidden md:flex items-center gap-3">
                {/* Online/Offline Toggle */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 transition-all duration-300 ${
                        isOnline 
                            ? 'bg-green-500/20 border-green-400/50 text-green-300 hover:bg-green-500/30' 
                            : 'bg-red-500/20 border-red-400/50 text-red-300 hover:bg-red-500/30'
                    }`}
                    onClick={toggleOnlineStatus}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                    <span className="text-xs font-bold">{isOnline ? '🟢 Online' : '🔴 Offline'}</span>
                </motion.button>

                {/* Total Earning */}
                <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/10 hover:border-white/30 transition-all duration-300"
                >
                    <FaWallet className="text-amber-400 text-sm" />
                    <span className="text-white/50 text-xs font-medium">Total:</span>
                    {earningLoading ? (
                        <div className="w-16 h-4 bg-white/10 rounded animate-pulse" />
                    ) : (
                        <span className="text-white font-bold text-sm">₹{totalEarning}</span>
                    )}
                </motion.div>

                {/* Rating */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/10">
                    <FaStar className="text-amber-400 text-xs" />
                    <span className="text-white/80 text-xs font-bold">
                        {userData?.deliveryBoyRating?.average?.toFixed(1) || '4.8'}
                    </span>
                    <span className="text-white/30 text-[10px] font-medium">
                        ({userData?.deliveryBoyRating?.count || 0})
                    </span>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
               

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-9 h-9 rounded-full bg-white text-[#e85d04] flex items-center justify-center font-bold text-sm shadow-sm hover:shadow-md transition-all duration-300"
                        onClick={() => setShowDropdown(!showDropdown)}
                        aria-label="Profile Menu"
                    >
                        {userData?.profilePhoto ? (
                            <img src={userData.profilePhoto} alt="profile" className='w-full h-full rounded-full object-cover' />
                        ) : (
                            userData?.fullName?.charAt(0) || 'D'
                        )}
                    </motion.button>

                    {/* Dropdown */}
                    <AnimatePresence>
                        {showDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border-2 border-gray-200 shadow-xl overflow-hidden z-50"
                            >
                                {/* User Info */}
                                <div className="p-5 border-b-2 border-gray-100 bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-[#e85d04] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                            {userData?.fullName?.charAt(0) || 'D'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-gray-800 font-bold text-sm truncate flex items-center gap-1.5">
                                                {userData?.fullName}
                                                <MdVerified size={12} className="text-blue-500 flex-shrink-0" />
                                            </p>
                                            <p className="text-gray-400 text-[10px] truncate font-medium">{userData?.email}</p>
                                        </div>
                                    </div>
                                    <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold border-2 ${
                                        isOnline 
                                            ? 'bg-green-50 text-green-700 border-green-200' 
                                            : 'bg-red-50 text-red-700 border-red-200'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                        {isOnline ? '🟢 Online' : '🔴 Offline'}
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="p-2 space-y-0.5">
                                    <button
                                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 text-sm font-medium group"
                                        onClick={() => { navigate('/profile'); closeDropdown() }}
                                    >
                                        <FaUserCircle size={14} className="group-hover:scale-110 transition-transform" />
                                        <span>Profile</span>
                                    </button>
                                    <button
                                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 text-sm font-medium group"
                                        onClick={() => { navigate('/delivery-orders'); closeDropdown() }}
                                    >
                                        <FaTruck size={14} className="group-hover:scale-110 transition-transform" />
                                        <span>My Deliveries</span>
                                    </button>
                                    <button
                                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 text-sm font-medium group"
                                        onClick={() => { navigate('/delivery-dashboard'); closeDropdown() }}
                                    >
                                        <FaHome size={14} className="group-hover:scale-110 transition-transform" />
                                        <span>Dashboard</span>
                                    </button>
                                    
                                    {/* Logout Button */}
                                    <button
                                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 text-sm font-medium group"
                                        onClick={handleLogout}
                                    >
                                        <FaSignOutAlt size={14} className="group-hover:translate-x-1 transition-transform" />
                                        <span>Logout</span>
                                    </button>
                                </div>

                                {/* Footer */}
                                <div className="px-4 py-2 border-t-2 border-gray-100 bg-gray-50">
                                    <p className="text-[8px] text-gray-400 text-center font-medium">
                                        Cravely v2.0 • {new Date().getFullYear()}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#e85d04] px-4 py-2 shadow-lg">
                <div className="flex items-center justify-around">
                    {[
                        { icon: <FaHome size={18} />, label: 'Home', path: '/home' },
                        { icon: <FaTruck size={18} />, label: 'Orders', path: '/delivery-orders' },
                        { icon: <FaUserCircle size={18} />, label: 'Profile', path: '/profile' }
                    ].map((item, idx) => (
                        <motion.button 
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex flex-col items-center gap-0.5 text-white/60 hover:text-white transition group"
                            onClick={() => navigate(item.path)}
                        >
                            <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
                            <span className="text-[8px] font-bold group-hover:text-white transition-colors">{item.label}</span>
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
            `}</style>
        </nav>
    )
}

export default DeliveryBoyNav