import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
    FaHome, FaUsers, FaStore, FaShoppingCart, FaTruck, 
    FaChartLine, FaCrown, FaSignOutAlt, FaBars, FaTimes,
    FaUserCircle, FaCog, FaSearch, FaBell,
    FaShieldAlt, FaGem, FaRocket
} from 'react-icons/fa'
import { MdVerified } from 'react-icons/md'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
// ✅ FIXED: Correct import path
import { serverUrl } from '../../../config'
import { setUserData } from '../../redux/userSlice'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { clearSessionUser } from '../../utils/auth'

function AdminLayout({ children }) {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()
    const { socket, userData } = useSelector(state => state.user)  // ✅ Get socket & userData
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [hoveredItem, setHoveredItem] = useState(null)
    const [scrolled, setScrolled] = useState(false)
    const [isLargeScreen, setIsLargeScreen] = useState(false)
    const [logoutLoading, setLogoutLoading] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [showNotifications, setShowNotifications] = useState(false)
    const notificationRef = useRef(null)

    // ✅ Handle window resize for sidebar
    useEffect(() => {
        const handleResize = () => {
            setIsLargeScreen(window.innerWidth >= 1024)
            if (window.innerWidth >= 1024) {
                setSidebarOpen(true)
            }
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // ✅ Handle scroll
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // ✅ Socket listeners for real-time notifications
    useEffect(() => {
        if (!socket) return

        const handleNewOrder = (data) => {
            const notification = {
                id: Date.now(),
                type: 'order',
                title: '📦 New Order Received!',
                message: `Order #${data.orderId?.slice(-6) || 'NEW'}`,
                timestamp: new Date().toISOString(),
                read: false,
                link: '/admin/orders'
            }
            setNotifications(prev => [notification, ...prev])
            setUnreadCount(prev => prev + 1)
            toast.info('📦 New order received!', {
                position: "top-center",
                autoClose: 3000,
            })
        }

        const handleNewDeliveryBoy = (data) => {
            const notification = {
                id: Date.now(),
                type: 'delivery',
                title: '🛵 New Delivery Boy Registered!',
                message: `${data.fullName || 'A new delivery boy'} has registered`,
                timestamp: new Date().toISOString(),
                read: false,
                link: '/admin/delivery-boys'
            }
            setNotifications(prev => [notification, ...prev])
            setUnreadCount(prev => prev + 1)
            toast.info('🛵 New delivery boy registered!', {
                position: "top-center",
                autoClose: 3000,
            })
        }

        const handleNewShop = (data) => {
            const notification = {
                id: Date.now(),
                type: 'shop',
                title: '🏪 New Shop Registered!',
                message: `${data.shopName || 'A new shop'} is waiting for approval`,
                timestamp: new Date().toISOString(),
                read: false,
                link: '/admin/shops'
            }
            setNotifications(prev => [notification, ...prev])
            setUnreadCount(prev => prev + 1)
            toast.info('🏪 New shop registered!', {
                position: "top-center",
                autoClose: 3000,
            })
        }

        socket.on('newOrder', handleNewOrder)
        socket.on('newDeliveryBoy', handleNewDeliveryBoy)
        socket.on('newShop', handleNewShop)

        return () => {
            socket.off('newOrder', handleNewOrder)
            socket.off('newDeliveryBoy', handleNewDeliveryBoy)
            socket.off('newShop', handleNewShop)
        }
    }, [socket])

    // ✅ Close notifications on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const menuItems = [
        { path: '/admin/dashboard', icon: <FaHome />, label: 'Dashboard', color: 'from-[#ff2d55] to-[#ff6b35]' },
        { path: '/admin/users', icon: <FaUsers />, label: 'Users', color: 'from-[#4facfe] to-[#00f2fe]' },
        { path: '/admin/shops', icon: <FaStore />, label: 'Shops', color: 'from-[#ff6b35] to-[#f7931e]' },
        { path: '/admin/orders', icon: <FaShoppingCart />, label: 'Orders', color: 'from-[#ffd93d] to-[#ff6b35]' },
        { path: '/admin/delivery-boys', icon: <FaTruck />, label: 'Delivery Boys', color: 'from-[#a18cd1] to-[#fbc2eb]' },
        { path: '/admin/refunds', icon: <FaShieldAlt />, label: 'Refunds', color: 'from-[#f12711] to-[#f5af19]' },
        { path: '/admin/tickets', icon: <FaCog />, label: 'Support Tickets', color: 'from-[#8e2de2] to-[#4a00e0]' },
        { path: '/admin/coupons', icon: <FaGem />, label: 'Coupons', color: 'from-[#ff0844] to-[#ffb199]' },
        { path: '/admin/revenue', icon: <FaChartLine />, label: 'Revenue', color: 'from-[#2ecc71] to-[#1abc9c]' },
    ]

    // ✅ Handle notification click
    const handleNotificationClick = (notification) => {
        setNotifications(prev => 
            prev.map(n => 
                n.id === notification.id ? { ...n, read: true } : n
            )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
        if (notification.link) {
            navigate(notification.link)
        }
        setShowNotifications(false)
    }

    // ✅ Mark all as read
    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
    }

    const handleLogout = async () => {
        setLogoutLoading(true)
        try {
            await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
            
            clearSessionUser()
            localStorage.removeItem('userData')
            
            dispatch(setUserData(null))
            toast.success('Logged out successfully! 👋', {
                position: "top-center",
                autoClose: 3000,
            })
            navigate('/admin/login')
        } catch (error) {
            console.log('Logout error:', error)
            toast.error('Logout failed!', {
                position: "top-center",
                autoClose: 3000,
            })
        } finally {
            setLogoutLoading(false)
        }
    }

    // ✅ Get admin info from userData
    const adminName = userData?.fullName || 'Super Admin'
    const adminEmail = userData?.email || 'admin@cravely.com'
    const adminInitial = adminName?.charAt(0) || 'S'

    // ✅ 3D Animation Variants
    const sidebarVariants = {
        open: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
        closed: { x: -300, opacity: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
    }

    const menuItemVariants = {
        hover: { 
            scale: 1.05,
            x: 10,
            transition: { type: "spring", stiffness: 400 }
        },
        tap: { scale: 0.95 }
    }

    const iconVariants = {
        hover: { 
            rotate: [0, -10, 10, -5, 5, 0],
            transition: { duration: 0.5 }
        }
    }

    // ✅ Check if route is active (including nested)
    const isActiveRoute = (path) => {
        if (path === '/admin/dashboard') {
            return location.pathname === '/admin/dashboard'
        }
        return location.pathname.startsWith(path)
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex relative overflow-hidden">
            
            {/* ✅ 3D Animated Background Orbs */}
            <div className='absolute inset-0 pointer-events-none'>
                <motion.div 
                    animate={{ 
                        x: [0, 100, -50, 0],
                        y: [0, -50, 100, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className='absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#ff2d55]/5 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ 
                        x: [0, -100, 50, 0],
                        y: [0, 50, -100, 0],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className='absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#ff6b35]/5 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ffd93d]/3 rounded-full blur-3xl'
                />
            </div>

            {/* ✅ Mobile Sidebar Toggle */}
            <motion.button 
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f] border border-white/10 text-white shadow-2xl shadow-[#ff2d55]/10"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </motion.button>

            {/* ✅ Premium 3D Sidebar */}
            <AnimatePresence mode="wait">
                {(sidebarOpen || isLargeScreen) && (
                    <motion.div 
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={sidebarVariants}
                        className={`fixed lg:relative inset-y-0 left-0 z-40 w-[280px] bg-gradient-to-b from-[#0a0a0f] via-[#1a0a0f] to-[#1a0505] backdrop-blur-2xl border-r border-white/5 shadow-2xl shadow-black/50 ${
                            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                        }`}
                    >
                        {/* Sidebar Glow Effect */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ff2d55]/50 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ff2d55]/50 to-transparent" />
                            <div className="absolute top-20 -left-20 w-40 h-40 bg-[#ff2d55]/8 rounded-full blur-3xl" />
                            <div className="absolute bottom-20 -right-20 w-40 h-40 bg-[#ff2d55]/8 rounded-full blur-3xl" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#ff2d55]/5 rounded-full blur-3xl" />
                        </div>

                        {/* Logo Section */}
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center gap-3 p-6 border-b border-white/5 relative"
                        >
                            <motion.div 
                                animate={{ 
                                    rotate: [0, 5, -5, 0],
                                }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center shadow-2xl shadow-[#ff2d55]/40"
                            >
                                <FaCrown className="text-white text-xl" />
                            </motion.div>
                            <div>
                                <motion.h1 
                                    whileHover={{ scale: 1.05 }}
                                    className="text-2xl font-bold text-white bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] bg-clip-text text-transparent"
                                >
                                    Cravely
                                </motion.h1>
                                <p className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1">
                                    <FaShieldAlt size={10} className="text-[#ff2d55]" />
                                    Admin Panel
                                </p>
                            </div>
                            <motion.div 
                                animate={{ 
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 1, 0.5]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -top-1 -right-1"
                            >
                                <span className="text-[#ff2d55] text-xs">✦</span>
                            </motion.div>
                        </motion.div>

                        {/* Admin Info - ✅ Dynamic from Redux */}
                        <motion.div 
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="p-4 border-b border-white/5 mx-3 mt-3 rounded-2xl bg-gradient-to-br from-[#ff2d55]/10 to-[#ff6b35]/5 border border-[#ff2d55]/10"
                        >
                            <div className="flex items-center gap-3">
                                <motion.div 
                                    animate={{ 
                                        scale: [1, 1.05, 1],
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#ff2d55]/30"
                                >
                                    {adminInitial}
                                </motion.div>
                                <div>
                                    <p className="text-white font-semibold text-sm flex items-center gap-1">
                                        {adminName}
                                        <MdVerified size={14} className="text-[#ff2d55]" />
                                    </p>
                                    <p className="text-white/30 text-[10px] truncate max-w-[150px]">{adminEmail}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Menu Items */}
                        <nav className="p-4 space-y-1.5 overflow-y-auto flex-1">
                            {menuItems.map((item) => {
                                const isActive = isActiveRoute(item.path)
                                return (
                                    <motion.button
                                        key={item.path}
                                        variants={menuItemVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                        onHoverStart={() => setHoveredItem(item.path)}
                                        onHoverEnd={() => setHoveredItem(null)}
                                        onClick={() => {
                                            navigate(item.path)
                                            setSidebarOpen(false)
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 relative overflow-hidden ${
                                            isActive
                                                ? 'text-white'
                                                : 'text-white/50 hover:text-white'
                                        }`}
                                    >
                                        {isActive && (
                                            <motion.div 
                                                layoutId="activeBackground"
                                                className="absolute inset-0 bg-gradient-to-r from-[#ff2d55]/20 to-[#ff6b35]/20 rounded-xl"
                                                transition={{ type: "spring", stiffness: 300 }}
                                            />
                                        )}
                                        
                                        {hoveredItem === item.path && !isActive && (
                                            <motion.div 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="absolute inset-0 bg-white/5 rounded-xl"
                                            />
                                        )}

                                        <motion.span 
                                            variants={iconVariants}
                                            whileHover="hover"
                                            className={`text-lg relative z-10 ${
                                                isActive ? 'text-[#ff2d55]' : 'text-white/40'
                                            }`}
                                        >
                                            {item.icon}
                                        </motion.span>
                                        
                                        <span className="relative z-10 font-medium">{item.label}</span>
                                        
                                        {isActive && (
                                            <motion.div 
                                                layoutId="activeIndicator"
                                                className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] shadow-lg shadow-[#ff2d55]/50"
                                                transition={{ type: "spring", stiffness: 300 }}
                                            />
                                        )}

                                        {hoveredItem === item.path && (
                                            <motion.span 
                                                initial={{ x: -10, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                className="ml-auto text-[#ff2d55] text-xs relative z-10"
                                            >
                                                →
                                            </motion.span>
                                        )}
                                    </motion.button>
                                )
                            })}
                        </nav>

                        {/* Logout Button */}
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="p-4 border-t border-white/5 bg-gradient-to-t from-[#1a0505]/80 to-transparent"
                        >
                            <motion.button
                                whileHover={{ x: 5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleLogout}
                                disabled={logoutLoading}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 text-sm group disabled:opacity-50"
                            >
                                <motion.span 
                                    animate={{ 
                                        x: [0, 3, 0],
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="group-hover:translate-x-1 transition-transform"
                                >
                                    {logoutLoading ? (
                                        <div className="w-4 h-4 border-2 border-red-400/60 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <FaSignOutAlt size={18} />
                                    )}
                                </motion.span>
                                {logoutLoading ? 'Logging out...' : 'Logout'}
                                <motion.span 
                                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    →
                                </motion.span>
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
                
                {/* Top Bar */}
                <motion.header 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`sticky top-0 z-30 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 transition-all duration-300 ${
                        scrolled ? 'shadow-2xl shadow-black/50' : ''
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <motion.h2 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-xl font-bold text-white hidden lg:block bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] bg-clip-text text-transparent"
                        >
                            {menuItems.find(item => isActiveRoute(item.path))?.label || 'Dashboard'}
                        </motion.h2>
                        
                        <div className="flex items-center gap-4 ml-auto">
                            {/* Search Bar */}
                            <motion.div 
                                whileHover={{ scale: 1.02 }}
                                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:border-[#ff2d55]/30 transition-all duration-300"
                            >
                                <FaSearch size={14} className="text-white/30" />
                                <input 
                                    type="text" 
                                    placeholder="Search..."
                                    className="bg-transparent border-none text-white text-sm placeholder:text-white/30 focus:outline-none w-40"
                                />
                            </motion.div>

                            {/* ✅ Notification Bell with Badge */}
                            <div className="relative" ref={notificationRef}>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 15 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="relative p-2 rounded-full hover:bg-white/10 transition-all duration-300"
                                    onClick={() => setShowNotifications(!showNotifications)}
                                >
                                    <FaBell size={18} className="text-white/60 hover:text-white transition" />
                                    {unreadCount > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 w-5 h-5 text-[10px] bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-[#ff2d55]/40"
                                        >
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </motion.span>
                                    )}
                                </motion.button>

                                {/* ✅ Notifications Dropdown */}
                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl bg-[#1a1a2e] border border-white/10 shadow-2xl shadow-black/50 z-50"
                                        >
                                            <div className="sticky top-0 bg-[#1a1a2e] p-3 border-b border-white/5 flex items-center justify-between">
                                                <span className="text-white font-semibold text-sm">Notifications</span>
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={markAllAsRead}
                                                        className="text-[10px] text-[#ff6b35] hover:text-[#ff7a45] transition"
                                                    >
                                                        Mark all as read
                                                    </button>
                                                )}
                                            </div>
                                            <div className="p-2">
                                                {notifications.length === 0 ? (
                                                    <div className="text-center py-8">
                                                        <FaBell className="text-white/10 text-3xl mx-auto mb-2" />
                                                        <p className="text-white/30 text-sm">No notifications</p>
                                                    </div>
                                                ) : (
                                                    notifications.map((notif) => (
                                                        <motion.div
                                                            key={notif.id}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className={`p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                                                                notif.read 
                                                                    ? 'hover:bg-white/5' 
                                                                    : 'bg-[#ff2d55]/10 hover:bg-[#ff2d55]/20 border border-[#ff2d55]/20'
                                                            }`}
                                                            onClick={() => handleNotificationClick(notif)}
                                                        >
                                                            <p className="text-white text-sm font-medium">{notif.title}</p>
                                                            <p className="text-white/40 text-xs">{notif.message}</p>
                                                            <p className="text-white/20 text-[10px] mt-1">
                                                                {new Date(notif.timestamp).toLocaleTimeString()}
                                                            </p>
                                                        </motion.div>
                                                    ))
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Profile */}
                            <motion.button 
                                whileHover={{ scale: 1.1, rotate: -5 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#ff2d55]/30 hover:shadow-[#ff2d55]/50 transition-all duration-300"
                            >
                                {adminInitial}
                            </motion.button>
                        </div>
                    </div>
                </motion.header>

                {/* Page Content */}
                <motion.main 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex-1 p-4 lg:p-6"
                >
                    {children}
                </motion.main>
            </div>

            {/* Sidebar Overlay (Mobile) */}
            <AnimatePresence>
                {sidebarOpen && !isLargeScreen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-30"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            <style jsx>{`
                .glass-premium {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }
                .animate-float-3d {
                    animation: float-3d 15s ease-in-out infinite;
                }
                @keyframes float-3d {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(40px, -30px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                /* Custom scrollbar for notifications */
                .overflow-y-auto::-webkit-scrollbar {
                    width: 3px;
                }
                .overflow-y-auto::-webkit-scrollbar-track {
                    background: transparent;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: rgba(255, 45, 85, 0.3);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    )
}

export default AdminLayout