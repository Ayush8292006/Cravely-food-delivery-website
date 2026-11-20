import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../../config'
import { setUserData } from '../redux/userSlice'
import { 
    FaHamburger, FaStore, FaUtensils, FaShoppingBag, 
    FaUserCircle, FaSignOutAlt, FaHome,
    FaChartLine, FaTruck, FaPlus,
    FaSearch, FaTimes, FaReceipt
} from 'react-icons/fa'
import { MdRestaurant, MdVerified } from 'react-icons/md'
import { IoReceiptOutline, IoLogOut } from "react-icons/io5"
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'

function OwnerNav() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)
    const [shopData, setShopData] = useState(null)
    const [notifications, setNotifications] = useState(0)
    const [showDropdown, setShowDropdown] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [loading, setLoading] = useState(true)
    const dropdownRef = useRef(null)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    useEffect(() => {
        const fetchShop = async () => {
            if (!userData?._id) {
                setLoading(false)
                return
            }

            try {
                const response = await axios.get(
                    `${serverUrl}/api/shop/my-shop`,
                    { withCredentials: true }
                )
                if (response.data.shop) {
                    setShopData(response.data.shop)
                }
            } catch (error) {
                console.log('No shop found for owner')
            } finally {
                setLoading(false)
            }
        }

        fetchShop()
    }, [userData?._id])

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!userData?._id) return

            try {
                const response = await axios.get(
                    `${serverUrl}/api/order/pending-count`,
                    { withCredentials: true }
                )
                setNotifications(response.data.count || 0)
            } catch (error) {
                console.log('Error fetching pending orders count:', error)
            }
        }

        fetchNotifications()
        const interval = setInterval(fetchNotifications, 25000)
        return () => clearInterval(interval)
    }, [userData?._id])

    const handleLogout = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
            dispatch(setUserData(null))
            toast.success("Logged out successfully")
            navigate("/signin")
        } catch (error) {
            toast.error("Logout failed")
        }
    }

    return (
        <nav 
            className={`w-full h-[68px] flex items-center justify-between px-4 sm:px-6 lg:px-8 fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
                scrolled 
                    ? 'bg-[#0A090D]/95 backdrop-blur-md border-white/10 shadow-xl shadow-black/50' 
                    : 'bg-[#0A090D] border-white/[0.08]'
            }`}
            style={{ fontFamily: "'Poppins', 'Segoe UI', system-ui, sans-serif" }}
        >
            {/* Left: Brand & Owner Badge */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/owner-dashboard")}>
                <div className="w-10 h-10 rounded-xl bg-[#13121A] border border-white/10 flex items-center justify-center text-[#FF6B00]">
                    <FaHamburger size={18} />
                </div>
                <div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-lg font-black text-white tracking-tight">CRAVELY</span>
                        <span className="text-[9px] font-black uppercase tracking-wider bg-[#FF6B00] text-white px-2 py-0.5 rounded-full">
                            Partner
                        </span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium">Merchant Portal</p>
                </div>
            </div>

            {/* Center: Live Restaurant Status & Quick Metric */}
            <div className="hidden md:flex items-center gap-2.5">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#13121A] border border-white/10 text-xs text-gray-300 font-medium">
                    <FaStore size={12} className="text-[#FF6B00]" />
                    <span className="truncate max-w-[150px] font-bold text-white">
                        {shopData?.name || (loading ? 'Loading...' : 'No Shop Setup')}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#13121A] border border-white/10 text-xs text-gray-300">
                    <FaUtensils size={11} className="text-amber-400" />
                    <span>{shopData?.items?.length || 0} Dishes</span>
                </div>

                {shopData?.isApproved ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Live on Cravely</span>
                    </div>
                ) : shopData ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span>Pending Approval</span>
                    </div>
                ) : null}
            </div>

            {/* Right: Actions & User Dropdown */}
            <div className="flex items-center gap-2.5">
                
                {/* Action: Add Item */}
                <button
                    onClick={() => navigate('/add-item')}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FF6B00] hover:bg-orange-600 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                    <FaPlus size={10} />
                    <span>Add Dish</span>
                </button>

                {/* Action: Orders (with live pending count badge) */}
                <button
                    onClick={() => navigate('/owner-orders')}
                    className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#13121A] hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition cursor-pointer"
                >
                    <IoReceiptOutline size={15} className="text-[#FF6B00]" />
                    <span className="hidden sm:inline">Orders</span>
                    {notifications > 0 && (
                        <span className="w-5 h-5 rounded-full bg-rose-600 text-[10px] font-black text-white flex items-center justify-center animate-pulse ml-0.5">
                            {notifications}
                        </span>
                    )}
                </button>

                {/* Profile Avatar & Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="w-10 h-10 rounded-xl bg-[#13121A] border border-white/10 hover:border-[#FF6B00]/40 flex items-center justify-center text-white font-black text-sm transition cursor-pointer overflow-hidden"
                    >
                        {userData?.profilePhoto ? (
                            <img src={userData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            userData?.fullName?.slice(0, 1).toUpperCase() || 'O'
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
                                    <p className="text-sm font-black text-white truncate">{userData?.fullName || 'Restaurant Partner'}</p>
                                    <p className="text-xs text-gray-400 truncate mt-0.5">{userData?.email}</p>
                                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6B00]/15 border border-orange-500/30 text-[#FF8C00]">
                                        Verified Restaurant Owner
                                    </span>
                                </div>

                                <div className="space-y-1 text-xs">
                                    <button
                                        onClick={() => { navigate('/owner-dashboard'); setShowDropdown(false); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition text-left cursor-pointer"
                                    >
                                        <FaHome size={13} className="text-[#FF6B00]" />
                                        <span>Owner Dashboard</span>
                                    </button>

                                    <button
                                        onClick={() => { navigate('/owner-orders'); setShowDropdown(false); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition text-left cursor-pointer"
                                    >
                                        <FaReceipt size={13} className="text-amber-400" />
                                        <span>Order Management</span>
                                    </button>

                                    <button
                                        onClick={() => { navigate('/create-edit-shop'); setShowDropdown(false); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition text-left cursor-pointer"
                                    >
                                        <FaStore size={13} className="text-sky-400" />
                                        <span>Restaurant Settings</span>
                                    </button>

                                    <button
                                        onClick={() => { navigate('/add-item'); setShowDropdown(false); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition text-left cursor-pointer"
                                    >
                                        <FaPlus size={13} className="text-emerald-400" />
                                        <span>Add Menu Item</span>
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

export default OwnerNav
