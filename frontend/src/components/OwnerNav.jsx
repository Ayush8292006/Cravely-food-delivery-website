import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { setUserData } from '../redux/userSlice'
import { clearSessionUser } from '../utils/auth'  // ✅ TOP PAR LAAO
import { 
    FaHamburger, FaStore, FaUtensils, FaShoppingBag, 
    FaUserCircle, FaSignOutAlt, FaCrown, FaHome,
    FaBell, FaChartLine, FaTruck, FaPlus
} from 'react-icons/fa'
import { MdRestaurant, MdDeliveryDining } from 'react-icons/md'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'

function OwnerNav() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)
    const { myShopData } = useSelector(state => state.owner)
    const [showDropdown, setShowDropdown] = useState(false)
    const [notifications] = useState(3)

    const handleLogout = async () => {
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
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-2xl border-b border-white/5 shadow-2xl shadow-black/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-[70px]">
                    
                    {/* Logo */}
                    <div 
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => navigate('/owner-dashboard')}
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center shadow-lg shadow-[#ff2d55]/25 group-hover:scale-110 transition-all duration-300">
                            <FaHamburger className="text-white text-xl" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight">
                                Cravely
                            </h1>
                            <p className="text-[9px] text-white/30 uppercase tracking-[0.15em]">
                                🍽️ Owner Panel
                            </p>
                        </div>
                    </div>

                    {/* Center - Quick Stats */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/5">
                            <FaStore className="text-[#ff6b35] text-sm" />
                            <span className="text-white/60 text-xs">{myShopData?.name || 'No Shop'}</span>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/5">
                            <FaUtensils className="text-[#ff6b35] text-sm" />
                            <span className="text-white/60 text-xs">{myShopData?.items?.length || 0} Items</span>
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        
                        {myShopData?.isApproved && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white text-xs font-medium shadow-lg shadow-[#ff2d55]/20 hover:shadow-[#ff2d55]/40 transition-all duration-300"
                                onClick={() => navigate('/add-item')}
                            >
                                <FaPlus size={12} /> Add Item
                            </motion.button>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-white/50 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all duration-300"
                            onClick={() => navigate('/owner-orders')}
                        >
                            <FaShoppingBag size={18} />
                        </motion.button>

                        <div className="relative">
                            <button className="text-white/50 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all duration-300">
                                <FaBell size={18} />
                                {notifications > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#ff2d55] rounded-full text-[8px] text-white flex items-center justify-center animate-pulse">
                                        {notifications}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#ff2d55]/20 hover:shadow-[#ff2d55]/40 transition-all duration-300"
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                {userData?.fullName?.charAt(0) || 'O'}
                            </motion.button>

                            {showDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-56 bg-[#1a1a2e]/98 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl shadow-black/60 overflow-hidden z-50"
                                >
                                    <div className="p-4 border-b border-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center text-white font-bold text-sm">
                                                {userData?.fullName?.charAt(0) || 'O'}
                                            </div>
                                            <div>
                                                <p className="text-white font-semibold text-sm">{userData?.fullName}</p>
                                                <p className="text-white/30 text-[10px]">{userData?.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-2 space-y-1">
                                        <button
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm"
                                            onClick={() => { navigate('/owner-dashboard'); setShowDropdown(false) }}
                                        >
                                            <FaHome size={14} /> Dashboard
                                        </button>
                                        <button
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm"
                                            onClick={() => { navigate('/profile'); setShowDropdown(false) }}
                                        >
                                            <FaUserCircle size={14} /> Profile
                                        </button>
                                        {myShopData && (
                                            <button
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm"
                                                onClick={() => { navigate('/create-edit-shop'); setShowDropdown(false) }}
                                            >
                                                <FaStore size={14} /> Edit Shop
                                            </button>
                                        )}
                                        <button
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm"
                                            onClick={() => { navigate('/owner-orders'); setShowDropdown(false) }}
                                        >
                                            <FaShoppingBag size={14} /> My Orders
                                        </button>
                                        <div className="h-px bg-white/5 my-1" />
                                        <button
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm"
                                            onClick={handleLogout}
                                        >
                                            <FaSignOutAlt size={14} /> Logout
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-2xl border-t border-white/5 px-4 py-2">
                <div className="flex items-center justify-around">
                    <button className="flex flex-col items-center gap-0.5 text-white/40 hover:text-white transition" onClick={() => navigate('/owner-dashboard')}><FaHome size={18} /><span className="text-[8px]">Home</span></button>
                    <button className="flex flex-col items-center gap-0.5 text-white/40 hover:text-white transition" onClick={() => navigate('/add-item')}><FaPlus size={18} /><span className="text-[8px]">Add</span></button>
                    <button className="flex flex-col items-center gap-0.5 text-white/40 hover:text-white transition" onClick={() => navigate('/owner-orders')}><FaShoppingBag size={18} /><span className="text-[8px]">Orders</span></button>
                    <button className="flex flex-col items-center gap-0.5 text-white/40 hover:text-white transition" onClick={() => navigate('/profile')}><FaUserCircle size={18} /><span className="text-[8px]">Profile</span></button>
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
                .animate-pulse { animation: pulse 2s ease-in-out infinite; }
            `}</style>
        </nav>
    )
}

export default OwnerNav