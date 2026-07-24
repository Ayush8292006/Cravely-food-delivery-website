import React, { useEffect, useState } from 'react'
import { IoArrowBack } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import UserOrderCard from '../components/UserOrderCard';
import OwnerOrderCard from '../components/OwnerOrderCard';
import { setMyOrders, updateRealtimeOrderStatus } from '../redux/userSlice';
import axios from 'axios';
import { serverUrl } from '../App';
import { ClipLoader } from 'react-spinners';
import { 
    FaFilter, FaTimes, FaShoppingBag, FaBox, FaClock, 
    FaCheckCircle, FaTimesCircle, FaArrowRight, FaCrown,
    FaStar, FaTruck, FaUtensils, FaFire, FaMotorcycle,
    FaUser, FaPhone, FaWhatsapp, FaUserCheck, FaSearch,
    FaInfoCircle, FaRocket, FaEye, FaList,
    FaThLarge, FaBars, FaSortAmountDown, FaSortAmountUp,
    FaTrashAlt, FaChevronRight, FaCalendar, FaTag,
    FaStore, FaCreditCard, FaRupeeSign, FaMapMarkerAlt,
    FaGift, FaGem, FaShieldAlt, FaHeart, FaAward,
    FaImage, FaCamera
} from 'react-icons/fa';
import { MdDeliveryDining, MdVerified } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import CancelOrderModal from '../components/CancelOrderModal';
import OrderDetailModal from '../components/OrderDetailModal';

function MyOrders() {
    const { userData, myOrders, socket } = useSelector(state => state.user)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(true)
    const [isLoaded, setIsLoaded] = useState(false)
    const [activeTab, setActiveTab] = useState('all')
    
    const [filters, setFilters] = useState({
        status: 'all',
        paymentMethod: 'all',
        startDate: '',
        endDate: ''
    })
    const [filteredOrders, setFilteredOrders] = useState([])
    const [showFilters, setShowFilters] = useState(false)
    const [cancelModalOpen, setCancelModalOpen] = useState(false)
    const [selectedOrderId, setSelectedOrderId] = useState(null)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [detailModalOpen, setDetailModalOpen] = useState(false)
    const [imageErrors, setImageErrors] = useState({})

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 400)
    }, [])

    useEffect(() => {
        fetchOrders()
    }, [filters])

    useEffect(() => {
        socket?.on('newOrder', (data) => {
            if (data.shopOrders?.owner._id == userData._id) {
                dispatch(setMyOrders([data, ...myOrders]))
                fetchOrders()
            }
        })

        socket?.on('update-status', ({ orderId, shopId, status, userId }) => {
            if (userId == userData._id) {
                dispatch(updateRealtimeOrderStatus({ orderId, shopId, status }))
                fetchOrders()
            }
        })

        return () => {
            socket?.off('newOrder'),
            socket?.off('update-status')
        }
    }, [socket])

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const queryParams = new URLSearchParams()
            if (filters.status !== 'all') queryParams.append('status', filters.status)
            if (filters.paymentMethod !== 'all') queryParams.append('paymentMethod', filters.paymentMethod)
            if (filters.startDate) queryParams.append('startDate', filters.startDate)
            if (filters.endDate) queryParams.append('endDate', filters.endDate)

            const result = await axios.get(
                `${serverUrl}/api/order/my-orders-filtered?${queryParams.toString()}`,
                { withCredentials: true }
            )
            setFilteredOrders(result.data.orders)
            setLoading(false)
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }

    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFilters(prev => ({ ...prev, [name]: value }))
    }

    const clearFilters = () => {
        setFilters({
            status: 'all',
            paymentMethod: 'all',
            startDate: '',
            endDate: ''
        })
    }

    const handleCancelOrder = (orderId) => {
        setSelectedOrderId(orderId)
        setCancelModalOpen(true)
    }

    const handleCancelled = (updatedOrder) => {
        fetchOrders()
        toast.success('Order cancelled successfully! 🗑️')
    }

    const openDetailModal = (order) => {
        setSelectedOrder(order)
        setDetailModalOpen(true)
    }

    // ✅ Fix image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath
        }
        if (imagePath.startsWith('/')) {
            return `${serverUrl}${imagePath}`
        }
        return `${serverUrl}/uploads/${imagePath}`
    }

    const handleImageError = (key) => {
        setImageErrors(prev => ({ ...prev, [key]: true }))
    }

    const totalOrders = filteredOrders.length
    const pendingOrders = filteredOrders.filter(o => o.shopOrders?.status === 'pending' || o.shopOrders?.[0]?.status === 'pending').length
    const preparingOrders = filteredOrders.filter(o => o.shopOrders?.status === 'preparing' || o.shopOrders?.[0]?.status === 'preparing').length
    const outForDeliveryOrders = filteredOrders.filter(o => o.shopOrders?.status === 'out of delivery' || o.shopOrders?.[0]?.status === 'out of delivery').length
    const deliveredOrders = filteredOrders.filter(o => o.shopOrders?.status === 'delivered' || o.shopOrders?.[0]?.status === 'delivered').length
    const cancelledOrders = filteredOrders.filter(o => o.shopOrders?.status === 'cancelled' || o.shopOrders?.[0]?.status === 'cancelled').length

    const fadeUp = `transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`

    const getOrderStatus = (order) => {
        return order?.shopOrders?.status || order?.shopOrders?.[0]?.status || 'pending'
    }

    const getStatusInfo = (status) => {
        const map = {
            'pending': { label: '⏳ Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30' },
            'preparing': { label: '🔧 Preparing', color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30' },
            'out of delivery': { label: '🚚 Out for Delivery', color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30' },
            'delivered': { label: '✅ Delivered', color: 'text-green-400', bg: 'bg-green-500/15', border: 'border-green-500/30' },
            'cancelled': { label: '❌ Cancelled', color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30' }
        }
        return map[status] || map['pending']
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString('en-GB', {
            day: "2-digit",
            month: "short",
            year: "numeric"
        })
    }

    if (loading) {
        return (
            <div className='min-h-screen bg-[#0a0a0f] flex items-center justify-center'>
                <div className='flex flex-col items-center gap-4'>
                    <div className='relative'>
                        <ClipLoader size={60} color="#ff2d55" />
                        <div className='absolute inset-0 animate-ping rounded-full border-2 border-[#ff2d55]/20' />
                    </div>
                    <p className='text-white/40 text-sm animate-pulse'>Loading your orders...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-[#0a0a0f] relative overflow-hidden'>
            
            {/* Animated Background */}
            <div className='absolute inset-0 pointer-events-none'>
                <motion.div 
                    animate={{ x: [0, 80, -40, 0], y: [0, -40, 60, 0] }}
                    transition={{ duration: 25, repeat: Infinity }}
                    className='absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#ff2d55]/6 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ x: [0, -80, 40, 0], y: [0, 40, -60, 0] }}
                    transition={{ duration: 30, repeat: Infinity }}
                    className='absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#ff6b35]/6 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ffd93d]/4 rounded-full blur-3xl'
                />
            </div>

            <div className='relative z-10 max-w-6xl mx-auto px-4 py-6'>
                
                {/* Header - Premium */}
                <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 ${fadeUp}`}>
                    <div className='flex items-center gap-4'>
                        <motion.button 
                            whileHover={{ scale: 1.05, rotate: -5 }}
                            whileTap={{ scale: 0.95 }}
                            className='w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#12121f] flex items-center justify-center hover:bg-white/10 transition-all duration-300 border border-white/10 group shadow-lg shadow-black/20'
                            onClick={() => navigate("/")}
                        >
                            <IoArrowBack size={20} className='text-white/60 group-hover:text-white transition' />
                        </motion.button>
                        <div>
                            <h1 className='text-2xl md:text-3xl font-bold text-white flex items-center gap-3'>
                                <span className='text-gradient-animated'>My Orders</span>
                                <motion.span 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className='text-[9px] bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] px-2.5 py-0.5 rounded-full text-white font-medium shadow-lg shadow-[#ff2d55]/20'
                                >
                                    {totalOrders}
                                </motion.span>
                            </h1>
                            <p className='text-white/40 text-xs md:text-sm flex items-center gap-2 flex-wrap'>
                                <span>Track and manage all your orders</span>
                                <span className='w-1 h-1 rounded-full bg-white/20' />
                                <span className='text-[#ff6b35] font-medium text-[10px] bg-[#ff6b35]/10 px-2 py-0.5 rounded-full'>
                                    <FaTruck size={8} className='inline mr-1' /> {outForDeliveryOrders} active
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards - Premium */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`grid grid-cols-3 md:grid-cols-5 gap-2 mb-6 ${fadeUp}`}
                >
                    {[
                        { label: 'Total', value: totalOrders, color: 'text-white', icon: <FaShoppingBag size={12} /> },
                        { label: 'Pending', value: pendingOrders, color: 'text-yellow-400', icon: <FaClock size={12} /> },
                        { label: 'Preparing', value: preparingOrders, color: 'text-blue-400', icon: <FaUtensils size={12} /> },
                        { label: 'Out for Delivery', value: outForDeliveryOrders, color: 'text-orange-400', icon: <FaTruck size={12} /> },
                        { label: 'Delivered', value: deliveredOrders, color: 'text-green-400', icon: <FaCheckCircle size={12} /> }
                    ].map((stat, idx) => (
                        <motion.div 
                            key={idx}
                            whileHover={{ y: -3, scale: 1.03 }}
                            className='glass-premium p-2 rounded-xl border border-white/5 text-center hover:border-[#ff2d55]/30 transition-all duration-300 group'
                        >
                            <div className='text-white/30 mb-0.5 group-hover:scale-110 transition-transform'>
                                {stat.icon}
                            </div>
                            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                            <p className='text-white/30 text-[8px] uppercase tracking-wider'>{stat.label}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Filter Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`glass-premium p-3 rounded-xl border border-white/5 mb-4 ${fadeUp}`}
                >
                    <div className='flex flex-wrap items-center justify-between gap-2'>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            className='flex items-center gap-1.5 text-white/60 hover:text-white transition-all duration-300 group text-xs'
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <div className={`p-1.5 rounded-lg transition-all duration-300 ${showFilters ? 'bg-[#ff2d55]/20 text-[#ff2d55]' : 'bg-white/5 text-white/40'}`}>
                                <FaFilter size={12} className='group-hover:rotate-12 transition-transform duration-300' />
                            </div>
                            <span className='text-xs font-medium'>{showFilters ? 'Hide Filters' : 'Filter Orders'}</span>
                        </motion.button>
                        
                        <div className='flex items-center gap-2'>
                            {(filters.status !== 'all' || filters.paymentMethod !== 'all' || filters.startDate || filters.endDate) && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    className='flex items-center gap-1 text-white/40 hover:text-red-400 transition-all duration-300 text-[10px] px-2 py-1 rounded-full bg-white/5 hover:bg-red-500/10'
                                    onClick={clearFilters}
                                >
                                    <FaTimes size={10} /> Clear
                                </motion.button>
                            )}
                            <div className='text-white/20 text-[10px]'>|</div>
                            <div className='text-white/30 text-[10px]'>
                                {totalOrders} {totalOrders === 1 ? 'order' : 'orders'}
                            </div>
                        </div>
                    </div>

                    {showFilters && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className='mt-3 pt-3 border-t border-white/10'
                        >
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2'>
                                <div>
                                    <label className='block text-white/40 text-[10px] font-medium mb-1 tracking-wider'>STATUS</label>
                                    <select
                                        name="status"
                                        value={filters.status}
                                        onChange={handleFilterChange}
                                        className='w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 cursor-pointer'
                                    >
                                        <option value="all" className='bg-[#1a1a2e]'>All Status</option>
                                        <option value="pending" className='bg-[#1a1a2e]'>⏳ Pending</option>
                                        <option value="preparing" className='bg-[#1a1a2e]'>🔧 Preparing</option>
                                        <option value="out of delivery" className='bg-[#1a1a2e]'>🚚 Out for Delivery</option>
                                        <option value="delivered" className='bg-[#1a1a2e]'>✅ Delivered</option>
                                        <option value="cancelled" className='bg-[#1a1a2e]'>❌ Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className='block text-white/40 text-[10px] font-medium mb-1 tracking-wider'>PAYMENT</label>
                                    <select
                                        name="paymentMethod"
                                        value={filters.paymentMethod}
                                        onChange={handleFilterChange}
                                        className='w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 cursor-pointer'
                                    >
                                        <option value="all" className='bg-[#1a1a2e]'>All</option>
                                        <option value="cod" className='bg-[#1a1a2e]'>💵 Cash on Delivery</option>
                                        <option value="online" className='bg-[#1a1a2e]'>💳 Online</option>
                                    </select>
                                </div>
                                <div>
                                    <label className='block text-white/40 text-[10px] font-medium mb-1 tracking-wider'>FROM</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={filters.startDate}
                                        onChange={handleFilterChange}
                                        className='w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 [color-scheme:dark]'
                                    />
                                </div>
                                <div>
                                    <label className='block text-white/40 text-[10px] font-medium mb-1 tracking-wider'>TO</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={filters.endDate}
                                        onChange={handleFilterChange}
                                        className='w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 [color-scheme:dark]'
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* ✅ Orders List - Premium Cards with Image Fix */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`space-y-2 ${fadeUp}`}
                >
                    {filteredOrders.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className='glass-premium p-12 rounded-2xl border border-white/5 text-center relative overflow-hidden group'
                        >
                            <div className='absolute inset-0 bg-gradient-to-r from-[#ff2d55]/5 to-[#ff6b35]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700' />
                            <div className='w-20 h-20 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500'>
                                <FaUtensils size={30} className='text-white/20' />
                            </div>
                            <h3 className='text-xl font-semibold text-white mb-1'>No orders found</h3>
                            <p className='text-white/30 text-xs max-w-sm mx-auto'>Try changing your filters or explore restaurants</p>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className='mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white text-xs font-medium hover:scale-105 transition-all duration-300 shadow-lg shadow-[#ff2d55]/20'
                                onClick={() => navigate('/')}
                            >
                                Browse Restaurants
                            </motion.button>
                        </motion.div>
                    ) : (
                        filteredOrders.map((order, index) => {
                            const status = getOrderStatus(order)
                            const statusInfo = getStatusInfo(status)
                            const isCancelled = status === 'cancelled'
                            const isDelivered = status === 'delivered'
                            const isOutForDelivery = status === 'out of delivery'
                            const firstShop = order.shopOrders?.[0]
                            const restaurant = firstShop?.shop
                            const deliveryBoy = firstShop?.assignedDeliveryBoy
                            
                            // ✅ Fix shop image
                            const shopImage = restaurant?.image ? getImageUrl(restaurant.image) : null
                            const imageKey = `shop_${restaurant?._id || index}`
                            const showImage = shopImage && !imageErrors[imageKey]
                            
                            return (
                                <motion.div 
                                    key={index} 
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.03 * index }}
                                    className='glass-premium rounded-xl border border-white/5 p-3 hover:border-[#ff2d55]/40 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-[#ff2d55]/10'
                                    onClick={() => openDetailModal(order)}
                                >
                                    <div className='flex items-center gap-3'>
                                        {/* ✅ Shop Image - Fixed */}
                                        <div className='flex-shrink-0 relative'>
                                            {showImage ? (
                                                <img 
                                                    src={shopImage}
                                                    alt={restaurant?.name || 'Restaurant'}
                                                    className='w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-white/10 group-hover:scale-105 transition-transform duration-300 group-hover:border-[#ff2d55]/30'
                                                    onError={() => handleImageError(imageKey)}
                                                />
                                            ) : (
                                                <div className='w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[#ff2d55]/20 to-[#ff6b35]/20 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform duration-300'>
                                                    <FaStore className='text-white/30 text-lg' />
                                                </div>
                                            )}
                                            {isOutForDelivery && (
                                                <div className='absolute -top-1 -right-1 w-3 h-3 rounded-full bg-orange-400 animate-pulse border-2 border-[#0a0a0f]' />
                                            )}
                                            {isDelivered && (
                                                <div className='absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-[#0a0a0f]' />
                                            )}
                                            {isCancelled && (
                                                <div className='absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-400 border-2 border-[#0a0a0f]' />
                                            )}
                                        </div>
                                        
                                        {/* ✅ Order Info - Enhanced */}
                                        <div className='flex-1 min-w-0'>
                                            <div className='flex items-center gap-2 flex-wrap'>
                                                <h4 className='text-white font-semibold text-sm truncate group-hover:text-[#ff6b35] transition-colors duration-300'>
                                                    {restaurant?.name || 'Cravely'}
                                                </h4>
                                                <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.color} border ${statusInfo.border}`}>
                                                    {statusInfo.label}
                                                </span>
                                                {deliveryBoy && !isCancelled && !isDelivered && (
                                                    <span className='text-[8px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-1 border border-green-500/20'>
                                                        <span className='w-1 h-1 rounded-full bg-green-400 animate-pulse' />
                                                        Live
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className='flex items-center gap-2 text-[10px] text-white/40 flex-wrap'>
                                                <span className='flex items-center gap-1'>
                                                    <FaCalendar size={8} className="text-white/20" />
                                                    {formatDate(order.createdAt)}
                                                </span>
                                                <span className='w-1 h-1 rounded-full bg-white/20' />
                                                <span className='flex items-center gap-1'>
                                                    <FaBox size={8} className="text-white/20" />
                                                    {firstShop?.shopOrderItems?.length || 0} items
                                                </span>
                                                <span className='w-1 h-1 rounded-full bg-white/20' />
                                                <span className='flex items-center gap-1'>
                                                    <FaRupeeSign size={8} className="text-white/20" />
                                                    ₹{order.totalAmount || firstShop?.subtotal || 0}
                                                </span>
                                            </div>
                                            
                                            <div className='flex items-center gap-2 mt-0.5 text-[10px] text-white/40 flex-wrap'>
                                                <span className='flex items-center gap-1'>
                                                    <FaTag size={8} className="text-white/20" />
                                                    {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                                                </span>
                                                {deliveryBoy && !isCancelled && !isDelivered && (
                                                    <>
                                                        <span className='w-1 h-1 rounded-full bg-white/20' />
                                                        <span className='flex items-center gap-1 text-white/50'>
                                                            <FaMotorcycle size={8} className="text-[#ff6b35]" />
                                                            {deliveryBoy.fullName}
                                                        </span>
                                                    </>
                                                )}
                                                {isOutForDelivery && (
                                                    <>
                                                        <span className='w-1 h-1 rounded-full bg-white/20' />
                                                        <span className='text-orange-400 flex items-center gap-1 animate-pulse'>
                                                            <FaTruck size={8} /> On the way
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* ✅ Arrow */}
                                        <motion.div 
                                            whileHover={{ x: 3 }}
                                            className='text-white/20 group-hover:text-[#ff6b35] transition-all duration-300'
                                        >
                                            <FaChevronRight size={14} />
                                        </motion.div>
                                    </div>
                                </motion.div>
                            )
                        })
                    )}
                </motion.div>
            </div>

            {/* ✅ Cancel Order Modal */}
            <CancelOrderModal
                isOpen={cancelModalOpen}
                onClose={() => {
                    setCancelModalOpen(false)
                    setSelectedOrderId(null)
                }}
                orderId={selectedOrderId}
                onCancelled={handleCancelled}
            />

            {/* ✅ Order Detail Modal */}
            <OrderDetailModal
                isOpen={detailModalOpen}
                onClose={() => {
                    setDetailModalOpen(false)
                    setSelectedOrder(null)
                }}
                order={selectedOrder}
                onCancelOrder={handleCancelOrder}
            />

            <style jsx>{`
                .glass-premium {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }

                .text-gradient-animated {
                    background: linear-gradient(135deg, #ff2d55, #ff6b35, #ffd93d, #ff2d55);
                    background-size: 300% 300%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: gradient-shift 4s ease-in-out infinite;
                }
                @keyframes gradient-shift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }

                [color-scheme="dark"]::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    cursor: pointer;
                }
            `}</style>
        </div>
    )
}

export default MyOrders