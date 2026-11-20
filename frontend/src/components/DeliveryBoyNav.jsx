import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../../config'
import { setUserData } from '../redux/userSlice'
import { 
    FaMotorcycle, FaUserCircle, FaSignOutAlt, FaHome, 
    FaTruck, FaWallet, FaStar, FaChartBar, FaBolt,
    FaShieldAlt
} from "react-icons/fa"
import { MdDeliveryDining, MdVerified } from 'react-icons/md'
import { IoReceiptOutline, IoLogOut } from "react-icons/io5"
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { clearSessionUser } from '../utils/auth'

function DeliveryBoyNav() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)
    const [showDropdown, setShowDropdown] = useState(false)
    const [isOnline, setIsOnline] = useState(userData?.isOnline !== false)
    const [totalEarning, setTotalEarning] = useState(userData?.earnings || 0)
    const [scrolled, setScrolled] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
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

    useEffect(() => {
        const fetchEarning = async () => {
            try {
                const response = await axios.get(`${serverUrl}/api/user/current`, {
                    withCredentials: true
                })
                if (response.data) {
                    setTotalEarning(response.data.earnings || 0)
                    setIsOnline(response.data.isOnline !== false)
                }
            } catch (error) {
                console.log('Fetch earning error:', error)
            }
        }
        fetchEarning()
    }, [])

    const handleLogout = useCallback(async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
            clearSessionUser()
            localStorage.removeItem('userData')
            dispatch(setUserData(null))
            toast.success('Logged out successfully! 👋')
            navigate('/signin')
        } catch (error) {
            toast.error('Logout failed!')
        }
    }, [dispatch, navigate])

    const toggleOnlineStatus = useCallback(async () => {
        try {
            const newStatus = !isOnline
            await axios.put(`${serverUrl}/api/user/delivery-boy/status`, {
                isOnline: newStatus
            }, { withCredentials: true })
            setIsOnline(newStatus)
            toast.success(`You are now ${newStatus ? '🟢 Online' : '🔴 Offline'}`)
        } catch (error) {
            console.log('Status update error:', error)
            toast.error('Failed to update status')
        }
    }, [isOnline])

    return (
        <nav 
            className={`w-full h-[68px] flex items-center justify-between px-4 sm:px-6 lg:px-8 fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
                scrolled 
                    ? 'bg-[#0A090D]/95 backdrop-blur-md border-white/10 shadow-xl shadow-black/50' 
                    : 'bg-[#0A090D] border-white/[0.08]'
            }`}
            style={{ fontFamily: "'Poppins', 'Segoe UI', system-ui, sans-serif" }}
        >
            {/* Left: Brand & Rider Badge */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/delivery-dashboard")}>
                <div className="w-10 h-10 rounded-xl bg-[#13121A] border border-white/10 flex items-center justify-center text-[#FF6B00]">
                    <FaMotorcycle size={18} />
                </div>
                <div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-lg font-black text-white tracking-tight">CRAVELY</span>
                        <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                            Rider
                        </span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium">Fleet Portal</p>
                </div>
            </div>

            {/* Center: Online/Offline Toggle & Real-time Earnings */}
            <div className="flex items-center gap-2.5">
                {/* Online Toggle Button */}
                <button
                    onClick={toggleOnlineStatus}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition border cursor-pointer ${
                        isOnline
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                            : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                    }`}
                >
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                    <span>{isOnline ? 'Active Online' : 'Duty Offline'}</span>
                </button>

                {/* Earnings Pill */}
                <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#13121A] border border-white/10 text-xs text-white font-mono font-bold">
                    <FaWallet size={11} className="text-amber-400" />
                    <span>₹{totalEarning}</span>
                    <span className="text-gray-400 text-[10px] font-normal font-sans">earned</span>
                </div>
            </div>

            {/* Right: Actions & User Dropdown */}
            <div className="flex items-center gap-2.5">
                <button
                    onClick={() => navigate('/delivery-orders')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#13121A] hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition cursor-pointer"
                >
                    <IoReceiptOutline size={14} className="text-[#FF6B00]" />
                    <span className="hidden sm:inline">Deliveries</span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="w-10 h-10 rounded-xl bg-[#13121A] border border-white/10 hover:border-[#FF6B00]/40 flex items-center justify-center text-white font-black text-sm transition cursor-pointer overflow-hidden"
                    >
                        {userData?.profilePhoto ? (
                            <img src={userData.profilePhoto} alt="Rider" className="w-full h-full object-cover" />
                        ) : (
                            userData?.fullName?.slice(0, 1).toUpperCase() || 'R'
                        )}
                    </button>

                    <AnimatePresence>
                        {showDropdown && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-12 w-64 bg-[#13121A] border border-white/10 rounded-2xl p-4 shadow-2xl z-50 text-white space-y-3"
                            >
                                <div className="pb-3 border-b border-white/[0.08]">
                                    <p className="text-sm font-black text-white truncate">{userData?.fullName || 'Delivery Partner'}</p>
                                    <p className="text-xs text-gray-400 truncate mt-0.5">{userData?.email}</p>
                                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                                        Verified Rider • ₹50/delivery
                                    </span>
                                </div>

                                <div className="space-y-1 text-xs">
                                    <button
                                        onClick={() => { navigate('/delivery-dashboard'); setShowDropdown(false); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition text-left cursor-pointer"
                                    >
                                        <FaHome size={13} className="text-[#FF6B00]" />
                                        <span>Rider Dashboard</span>
                                    </button>

                                    <button
                                        onClick={() => { navigate('/delivery-orders'); setShowDropdown(false); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition text-left cursor-pointer"
                                    >
                                        <FaTruck size={13} className="text-amber-400" />
                                        <span>Assigned Deliveries</span>
                                    </button>

                                    <button
                                        onClick={() => { navigate('/delivery-profile'); setShowDropdown(false); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition text-left cursor-pointer"
                                    >
                                        <FaUserCircle size={13} className="text-sky-400" />
                                        <span>Rider Profile</span>
                                    </button>
                                </div>

                                <div className="pt-2 border-t border-white/[0.08]">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition text-left cursor-pointer"
                                    >
                                        <IoLogOut size={15} />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </nav>
    )
}

export default DeliveryBoyNav
