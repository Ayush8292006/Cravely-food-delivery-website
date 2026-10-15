import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../../config';
import { setUserData } from '../redux/userSlice'
import { 
    FaHamburger, FaStore, FaUtensils, FaShoppingBag, 
    FaUserCircle, FaSignOutAlt, FaCrown, FaHome,
    FaChartLine, FaTruck, FaPlus,
    FaArrowLeft, FaSearch, FaTimes, FaChevronDown, FaChevronUp
} from 'react-icons/fa'
import { MdRestaurant, MdDeliveryDining, MdVerified } from 'react-icons/md'
import { BiRestaurant } from "react-icons/bi";
import { IoReceiptOutline, IoLogOut } from "react-icons/io5";
import { FiShoppingCart } from "react-icons/fi";
import { GiKnifeFork } from "react-icons/gi";
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import LocationSelector from './LocationSelector';

function OwnerNav() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { userData, shopsInMyCity, currentCity } = useSelector(state => state.user)
    const [shopData, setShopData] = useState(null)
    const [notifications, setNotifications] = useState(0)
    const [showDropdown, setShowDropdown] = useState(false)
    const [showRestaurants, setShowRestaurants] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [scrolled, setScrolled] = useState(false)
    const [loading, setLoading] = useState(true)
    const dropdownRef = React.useRef(null)
    const restaurantRef = React.useRef(null)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 30)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false)
            if (restaurantRef.current && !restaurantRef.current.contains(e.target)) setShowRestaurants(false)
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
                console.log('❌ No shop found for owner')
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
                console.log('❌ Error fetching notifications:', error)
            }
        }

        fetchNotifications()
        
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [userData?._id])

    const handleLogout = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
            localStorage.removeItem('userData')
            sessionStorage.removeItem('userData')
            dispatch(setUserData(null))
            toast.success('Logged out successfully! 👋')
            navigate('/signin')
        } catch (error) {
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

    const getRoleBadge = () => {
        switch(userData?.role) {
            case 'owner': return { label: 'Owner', color: 'bg-orange-100 text-orange-700' }
            case 'deliveryBoy': return { label: 'Delivery', color: 'bg-blue-100 text-blue-700' }
            case 'superAdmin': return { label: 'Admin', color: 'bg-purple-100 text-purple-700' }
            default: return { label: 'User', color: 'bg-gray-100 text-gray-600' }
        }
    }

    const roleBadge = getRoleBadge()

    return (
        <nav className={`w-full h-[64px] flex items-center justify-between px-4 sm:px-6 lg:px-10 fixed top-0 z-[9999] transition-all duration-300 ${
            scrolled 
                ? 'bg-[#e85d04] shadow-md' 
                : 'bg-[#e85d04]'
        }`}>

            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/owner-dashboard")}>
                <div className='w-9 h-9 rounded-xl bg-white flex items-center justify-center'>
                    <FaHamburger className="text-[#e85d04] text-lg" />
                </div>
                <div className='hidden sm:block'>
                    <h1 className='text-lg font-bold text-white leading-none tracking-tight'>Cravely</h1>
                    <p className='text-[8px] text-white/50 uppercase tracking-[0.15em]'>Owner Panel</p>
                </div>
            </div>

            {/* Center - Quick Stats */}
            <div className='hidden md:flex items-center gap-3'>
                <div className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15'>
                    <FaStore className="text-white text-xs" />
                    <span className="text-white/80 text-xs font-medium">
                        {shopData?.name || (loading ? 'Loading...' : 'No Shop')}
                    </span>
                </div>
                <div className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15'>
                    <FaUtensils className="text-white text-xs" />
                    <span className="text-white/80 text-xs font-medium">
                        {shopData?.items?.length || 0} Items
                    </span>
                </div>
                {shopData?.isApproved ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-green-300 text-[10px] font-medium">Approved</span>
                    </div>
                ) : shopData && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-amber-300 text-[10px] font-medium">Pending</span>
                    </div>
                )}
            </div>

            {/* Right */}
            <div className='flex items-center gap-1.5 sm:gap-2'>
                <button 
                    className='lg:hidden text-white/90 hover:text-white p-2 rounded-lg hover:bg-white/10'
                    onClick={() => setShowSearch(!showSearch)}
                >
                    <FaSearch size={15} />
                </button>

                <AnimatePresence>
                    {showSearch && (
                        <motion.div 
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className='absolute top-[64px] left-0 right-0 px-4 py-3 bg-white border-b border-gray-200 shadow-sm z-50'
                        >
                            <form onSubmit={handleSearch} className='flex items-center gap-2 max-w-lg mx-auto'>
                                <input
                                    type="text"
                                    placeholder='Search restaurants or items...'
                                    className='flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#e85d04] text-sm'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                                <button type="submit" className='px-3 py-2.5 rounded-lg bg-[#e85d04] text-white'>
                                    <FaSearch size={14} />
                                </button>
                                <button className='p-2.5 rounded-lg text-gray-400' onClick={() => setShowSearch(false)}>
                                    <FaTimes size={14} />
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button 
                    className='lg:hidden text-white/90 p-2 rounded-lg hover:bg-white/10'
                    onClick={() => navigate('/restaurants')}
                >
                    <BiRestaurant size={17} />
                </button>

                {shopData?.isApproved && (
                    <button 
                        className='hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-medium hover:bg-white/30 transition-colors'
                        onClick={() => navigate("/add-item")}
                    >
                        <FaPlus size={11} />
                        <span className='hidden lg:inline'>Add Item</span>
                    </button>
                )}

                <button 
                    className='hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white/90 text-xs font-medium hover:bg-white/15 transition-colors'
                    onClick={() => navigate("/owner-orders")}
                >
                    <IoReceiptOutline size={15} />
                    <span className='hidden lg:inline'>Orders</span>
                    {notifications > 0 && (
                        <span className='w-4 h-4 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center ml-1'>
                            {notifications}
                        </span>
                    )}
                </button>

                {/* Profile Dropdown */}
                <div className='relative' ref={dropdownRef}>
                    <div 
                        className='w-9 h-9 rounded-full flex items-center justify-center bg-white text-[#e85d04] text-sm font-semibold cursor-pointer' 
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        {userData?.profilePhoto ? (
                            <img src={userData.profilePhoto} alt="profile" className='w-full h-full rounded-full object-cover' />
                        ) : (
                            userData?.fullName?.slice(0, 1) || 'O'
                        )}
                    </div>

                    <AnimatePresence>
                        {showDropdown && (
                            <motion.div 
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className='absolute top-[48px] right-0 w-[240px] bg-white rounded-xl p-3.5 border border-gray-100 shadow-xl z-50'
                            >
                                <div className='flex items-center gap-3 pb-3 border-b border-gray-100'>
                                    <div className='w-10 h-10 rounded-full bg-[#e85d04] flex items-center justify-center text-white font-semibold text-sm'>
                                        {userData?.fullName?.slice(0, 1) || 'O'}
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-sm font-semibold text-gray-800 truncate flex items-center gap-1'>
                                            {userData?.fullName}
                                            <MdVerified size={12} className="text-blue-500" />
                                        </p>
                                        <p className='text-[11px] text-gray-400 truncate'>{userData?.email}</p>
                                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${roleBadge.color}`}>
                                            {roleBadge.label}
                                        </span>
                                    </div>
                                </div>

                                <div className='py-1.5 space-y-0.5'>
                                    <div 
                                        className='flex items-center gap-2.5 text-gray-600 hover:text-gray-900 cursor-pointer py-2 px-2.5 rounded-lg hover:bg-gray-50 text-sm'
                                        onClick={() => { navigate("/owner-dashboard"); setShowDropdown(false) }}
                                    >
                                        <FaHome size={13} /> Dashboard
                                    </div>
                                    <div 
                                        className='flex items-center gap-2.5 text-gray-600 hover:text-gray-900 cursor-pointer py-2 px-2.5 rounded-lg hover:bg-gray-50 text-sm'
                                        onClick={() => { navigate("/profile"); setShowDropdown(false) }}
                                    >
                                        <FaUserCircle size={13} /> Profile Settings
                                    </div>
                                    {shopData && (
                                        <div 
                                            className='flex items-center gap-2.5 text-gray-600 hover:text-gray-900 cursor-pointer py-2 px-2.5 rounded-lg hover:bg-gray-50 text-sm'
                                            onClick={() => { navigate("/create-edit-shop"); setShowDropdown(false) }}
                                        >
                                            <FaStore size={13} /> Manage Shop
                                        </div>
                                    )}
                                    <div 
                                        className='flex items-center gap-2.5 text-gray-600 hover:text-gray-900 cursor-pointer py-2 px-2.5 rounded-lg hover:bg-gray-50 text-sm'
                                        onClick={() => { navigate("/owner-orders"); setShowDropdown(false) }}
                                    >
                                        <IoReceiptOutline size={13} /> Order Management
                                    </div>
                                    <div 
                                        className='flex items-center gap-2.5 text-gray-600 hover:text-gray-900 cursor-pointer py-2 px-2.5 rounded-lg hover:bg-gray-50 text-sm'
                                        onClick={() => { navigate("/add-item"); setShowDropdown(false) }}
                                    >
                                        <FaPlus size={13} /> Add Item
                                    </div>
                                </div>

                                <div 
                                    className='flex items-center gap-2.5 text-red-500 hover:text-red-600 cursor-pointer py-2 px-2.5 rounded-lg hover:bg-red-50 text-sm border-t border-gray-100 mt-1 pt-2'
                                    onClick={handleLogout}
                                >
                                    <IoLogOut size={14} /> Logout
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