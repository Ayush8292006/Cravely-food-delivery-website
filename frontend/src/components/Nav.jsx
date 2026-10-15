import React, { useState, useEffect, useRef } from 'react'
import { 
    FaUtensils, FaArrowRight, FaSearch, FaTimes, FaChevronDown, FaChevronUp,
    FaHeadset, FaUserCog, FaPlus, FaCrown, FaUtensilSpoon
} from "react-icons/fa";
import { FiShoppingCart } from "react-icons/fi";
import { IoReceiptOutline, IoLogOut } from "react-icons/io5";
import { MdDeliveryDining, MdRestaurant, MdVerified } from "react-icons/md";
import { BiRestaurant } from "react-icons/bi";
import { GiKnifeFork } from "react-icons/gi";
import { useDispatch, useSelector } from 'react-redux';
import { serverUrl } from '../../config' 
import axios from 'axios';
import { setUserData } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import LocationSelector from './LocationSelector';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { clearSessionUser } from '../utils/auth'

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

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 30)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowInfo(false)
            if (restaurantRef.current && !restaurantRef.current.contains(e.target)) setShowRestaurants(false)
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
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
                <div className='w-9 h-9 rounded-xl bg-white flex items-center justify-center'>
                    <FaUtensilSpoon className="text-[#e85d04] text-sm -rotate-12" />
                    <FaUtensils className="text-[#e85d04] text-xs rotate-12 -ml-1" />
                </div>
                <div className='hidden sm:block'>
                    <h1 className='text-lg font-bold text-white leading-none tracking-tight'>Cravely</h1>
                </div>
            </div>

            {/* Center */}
            <div className='hidden lg:flex items-center gap-3'>
                <LocationSelector />

                <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 text-sm'>
                    <MdDeliveryDining size={15} className="text-white" />
                    <span className='text-white/80 text-xs'>Delivering to</span>
                    <span className='text-white font-semibold text-xs'>{currentCity || 'Select City'}</span>
                </div>

                {/* Restaurants Button */}
                <div className='relative' ref={restaurantRef}>
                    <button 
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm transition-colors ${
                            showRestaurants 
                                ? 'bg-white text-[#e85d04]'
                                : 'bg-white/15 text-white hover:bg-white/25'
                        }`}
                        onClick={(e) => {
                            e.stopPropagation()
                            setShowRestaurants(!showRestaurants)
                            setShowInfo(false)
                        }}
                    >
                        <BiRestaurant size={15} />
                        <span className='font-medium'>Restaurants</span>
                        {showRestaurants ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                    </button>

                    <AnimatePresence>
                        {showRestaurants && (
                            <motion.div 
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className='absolute top-[44px] left-0 w-[280px] bg-white rounded-xl p-3 border border-gray-100 shadow-xl max-h-[380px] overflow-y-auto z-50'
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className='flex items-center justify-between pb-2 border-b border-gray-100'>
                                    <span className='text-xs font-medium text-gray-500'>All Restaurants</span>
                                    <span className='text-[10px] text-[#e85d04] bg-orange-50 px-2 py-0.5 rounded-full'>
                                        {shopsInMyCity?.length || 0}
                                    </span>
                                </div>
                                
                                {shopsInMyCity && shopsInMyCity.length > 0 ? (
                                    <div className='mt-2 space-y-0.5'>
                                        {shopsInMyCity.slice(0, 6).map((shop) => (
                                            <div 
                                                key={shop._id}
                                                className='flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer'
                                                onClick={() => { 
                                                    navigate(`/shop/${shop._id}`)
                                                    setShowRestaurants(false)
                                                }}
                                            >
                                                <div className='w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100'>
                                                    <img 
                                                        src={shop.image || 'https://via.placeholder.com/40/f0ebe5/cbb8a8?text=Shop'} 
                                                        alt={shop.name} 
                                                        className='w-full h-full object-cover'
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/40/f0ebe5/cbb8a8?text=Shop'
                                                        }}
                                                    />
                                                </div>
                                                <div className='flex-1 min-w-0'>
                                                    <p className='text-sm font-medium text-gray-800 truncate'>{shop.name}</p>
                                                    <p className='text-[11px] text-gray-400 truncate'>{shop.address}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className='text-center py-6 text-gray-400 text-sm'>
                                        <GiKnifeFork size={28} className="mx-auto mb-2 text-gray-300" />
                                        <p>No restaurants available</p>
                                    </div>
                                )}
                                
                                <div className='mt-2 pt-2 border-t border-gray-100'>
                                    <button 
                                        className='w-full flex items-center justify-center gap-1.5 text-xs text-[#e85d04] hover:bg-orange-50 py-2 rounded-lg transition-colors'
                                        onClick={() => { 
                                            navigate('/restaurants')
                                            setShowRestaurants(false)
                                        }}
                                    >
                                        View All <FaArrowRight size={9} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
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

                {userData?.role === "owner" && myShopData && (
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
                    onClick={() => navigate("/my-orders")}
                >
                    <IoReceiptOutline size={15} />
                    <span className='hidden lg:inline'>Orders</span>
                </button>

                <div className='relative cursor-pointer' onClick={() => navigate("/cart")}>
                    <div className='w-9 h-9 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors'>
                        <FiShoppingCart size={17} className='text-white' />
                    </div>
                    {cartItems.length > 0 && (
                        <span className='absolute -top-0.5 -right-0.5 text-[10px] font-bold text-[#e85d04] bg-white rounded-full w-5 h-5 flex items-center justify-center'>
                            {cartItems.length}
                        </span>
                    )}
                </div>

                <div className='lg:hidden'>
                    <LocationSelector />
                </div>

                <div className='relative' ref={dropdownRef}>
                    <div 
                        className='w-9 h-9 rounded-full flex items-center justify-center bg-white text-[#e85d04] text-sm font-semibold cursor-pointer' 
                        onClick={() => setShowInfo(!showInfo)}
                    >
                        {userData?.profilePhoto ? (
                            <img src={userData.profilePhoto} alt="profile" className='w-full h-full rounded-full object-cover' />
                        ) : (
                            userData?.fullName?.slice(0, 1) || 'U'
                        )}
                    </div>

                    <AnimatePresence>
                        {showInfo && (
                            <motion.div 
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className='absolute top-[48px] right-0 w-[240px] bg-white rounded-xl p-3.5 border border-gray-100 shadow-xl z-50'
                            >
                                <div className='flex items-center gap-3 pb-3 border-b border-gray-100'>
                                    <div className='w-10 h-10 rounded-full bg-[#e85d04] flex items-center justify-center text-white font-semibold text-sm'>
                                        {userData?.fullName?.slice(0, 1) || 'U'}
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
                                        onClick={() => { navigate("/profile"); setShowInfo(false) }}
                                    >
                                        <FaUserCog size={13} /> Profile Settings
                                    </div>

                                    {userData?.role === "user" && (
                                        <div 
                                            className='flex items-center gap-2.5 text-gray-600 hover:text-gray-900 cursor-pointer py-2 px-2.5 rounded-lg hover:bg-gray-50 text-sm'
                                            onClick={() => { navigate("/my-orders"); setShowInfo(false) }}
                                        >
                                            <IoReceiptOutline size={13} /> My Orders
                                        </div>
                                    )}

                                    {userData?.role === "owner" && (
                                        <>
                                            <div 
                                                className='flex items-center gap-2.5 text-gray-600 hover:text-gray-900 cursor-pointer py-2 px-2.5 rounded-lg hover:bg-gray-50 text-sm'
                                                onClick={() => { navigate("/my-orders"); setShowInfo(false) }}
                                            >
                                                <IoReceiptOutline size={13} /> Order Management
                                            </div>
                                            <div 
                                                className='flex items-center gap-2.5 text-gray-600 hover:text-gray-900 cursor-pointer py-2 px-2.5 rounded-lg hover:bg-gray-50 text-sm'
                                                onClick={() => { navigate("/create-edit-shop"); setShowInfo(false) }}
                                            >
                                                <MdRestaurant size={13} /> Manage Shop
                                            </div>
                                        </>
                                    )}

                                    {userData?.role === "superAdmin" && (
                                        <div 
                                            className='flex items-center gap-2.5 text-gray-600 hover:text-gray-900 cursor-pointer py-2 px-2.5 rounded-lg hover:bg-gray-50 text-sm'
                                            onClick={() => { navigate("/admin/dashboard"); setShowInfo(false) }}
                                        >
                                            <FaCrown size={13} className="text-amber-500" /> Admin Dashboard
                                        </div>
                                    )}

                                    <div 
                                        className='flex items-center gap-2.5 text-gray-500 hover:text-gray-800 cursor-pointer py-2 px-2.5 rounded-lg hover:bg-gray-50 text-sm'
                                        onClick={() => { navigate("/help"); setShowInfo(false) }}
                                    >
                                        <FaHeadset size={13} /> Help & Support
                                    </div>
                                </div>

                                <div 
                                    className='flex items-center gap-2.5 text-red-500 hover:text-red-600 cursor-pointer py-2 px-2.5 rounded-lg hover:bg-red-50 text-sm border-t border-gray-100 mt-1 pt-2'
                                    onClick={handleLogOut}
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

export default Nav