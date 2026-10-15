import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
// ✅ FIXED: Correct import
import { serverUrl } from '../../config'
import { 
    FaArrowLeft, FaShoppingBag, FaClock, FaCheckCircle,
    FaTimesCircle, FaHourglassHalf, FaSearch,
    FaTruck, FaUtensils, FaFire, FaArrowRight,
    FaSync, FaStore, FaUser, FaTag, FaRocket,
    FaCrown, FaStar, FaMedal, FaAward,
    FaFilter, FaChartLine, FaBox, FaClipboardList,
    FaExclamationTriangle
} from "react-icons/fa";
import { MdRestaurant, MdVerified } from "react-icons/md";
import { ClipLoader } from 'react-spinners'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import OwnerNav from '../components/OwnerNav'
import OwnerOrderCard from '../components/OwnerOrderCard'

function OwnerMyOrders() {
    const navigate = useNavigate()
    const { userData } = useSelector(state => state.user)
    const { myShopData } = useSelector(state => state.owner)
    const { socket } = useSelector(state => state.user)
    const [orders, setOrders] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeFilter, setActiveFilter] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoaded, setIsLoaded] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        preparing: 0,
        outForDelivery: 0,
        delivered: 0,
        cancelled: 0
    })

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 300)
    }, [])

    useEffect(() => {
        fetchOrders()
    }, [])

    // ✅ Socket listener for new orders
    useEffect(() => {
        if (!socket) return

        const handleNewOrder = (newOrder) => {
            toast.info(`📦 New order received!`, {
                position: "top-center",
                autoClose: 3000,
            })
            fetchOrders()
        }

        socket.on('newOrder', handleNewOrder)

        return () => {
            socket.off('newOrder', handleNewOrder)
        }
    }, [socket])

    // ✅ Helper: Get order status
    const getOrderStatus = (order) => {
        return order.shopOrders?.[0]?.status || 'pending'
    }

    const fetchOrders = async () => {
        setLoading(true)
        setError(null)
        try {
            console.log("🔍 Fetching owner orders...")
            const response = await axios.get(`${serverUrl}/api/order/my-orders`, {
                withCredentials: true
            })
            
            console.log("📦 Orders Response:", response.data)
            
            const ordersData = response.data || []
            setOrders(ordersData)
            setFilteredOrders(ordersData)

            // ✅ Fix: Calculate stats correctly
            const total = ordersData.length
            const pending = ordersData.filter(o => getOrderStatus(o) === 'pending').length
            const preparing = ordersData.filter(o => getOrderStatus(o) === 'preparing').length
            const outForDelivery = ordersData.filter(o => getOrderStatus(o) === 'out of delivery').length
            const delivered = ordersData.filter(o => getOrderStatus(o) === 'delivered').length
            const cancelled = ordersData.filter(o => getOrderStatus(o) === 'cancelled').length

            setStats({ total, pending, preparing, outForDelivery, delivered, cancelled })
            
            if (ordersData.length === 0) {
                console.log("⚠️ No orders found")
            }
        } catch (error) {
            console.log("❌ Fetch orders error:", error)
            const errorMsg = error.response?.data?.message || 'Failed to fetch orders'
            setError(errorMsg)
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchOrders()
        setRefreshing(false)
        toast.info('🔄 Orders refreshed!')
    }

    useEffect(() => {
        let filtered = orders
        if (activeFilter !== 'all') {
            filtered = filtered.filter(o => getOrderStatus(o) === activeFilter)
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(o => 
                o._id?.toLowerCase().includes(query) ||
                o.user?.fullName?.toLowerCase().includes(query) ||
                o.user?.email?.toLowerCase().includes(query)
            )
        }
        setFilteredOrders(filtered)
    }, [activeFilter, searchQuery, orders])

    const handleStatusUpdate = () => {
        fetchOrders()
    }

    const fadeUp = `transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`

    // ✅ Check if owner has a shop
    if (!myShopData && !loading) {
        return (
            <div className='min-h-screen bg-white'>
                <OwnerNav />
                <div className='flex items-center justify-center h-[calc(100vh-70px)] px-4'>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='text-center max-w-md'
                    >
                        <div className='w-24 h-24 mx-auto rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mb-4'>
                            <FaStore className='text-amber-500 text-5xl' />
                        </div>
                        <h2 className='text-2xl font-bold text-gray-800 mb-2'>No Shop Found</h2>
                        <p className='text-gray-500 text-sm mb-6'>
                            You need to create a shop first to view and manage orders.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/create-edit-shop')}
                            className='px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium flex items-center justify-center gap-2 mx-auto shadow-sm shadow-orange-200'
                        >
                            Create Your Shop
                        </motion.button>
                    </motion.div>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className='min-h-screen bg-white'>
                <OwnerNav />
                <div className='flex items-center justify-center h-[calc(100vh-70px)]'>
                    <div className='flex flex-col items-center gap-4'>
                        <div className='relative'>
                            <div className='w-16 h-16 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin' />
                            <div className='absolute inset-0 animate-ping rounded-full border-2 border-orange-300/20' />
                        </div>
                        <p className='text-gray-500 text-sm font-medium animate-pulse flex items-center gap-2'>
                            <span className='w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse' />
                            Loading orders...
                            <span className='w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse animation-delay-300' />
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-[#f8f4f0] relative overflow-hidden pt-[70px] pb-[70px] md:pb-0'>
            <OwnerNav />

            <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8'>
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 ${fadeUp}`}
                >
                    <div className='flex items-center gap-4'>
                        <motion.button
                            whileHover={{ scale: 1.05, rotate: -5 }}
                            whileTap={{ scale: 0.95 }}
                            className='w-11 h-11 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center hover:border-orange-300 hover:shadow-md transition-all duration-300 shadow-sm'
                            onClick={() => navigate('/owner-dashboard')}
                        >
                            <FaArrowLeft size={18} className='text-gray-600' />
                        </motion.button>
                        <div>
                            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3'>
                                📦 My Orders
                                <span className='text-[10px] bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full font-bold border border-orange-200'>
                                    {stats.total} orders
                                </span>
                            </h1>
                            <p className='text-gray-500 text-sm flex items-center gap-2 flex-wrap font-medium'>
                                <span>Manage all your orders</span>
                                {myShopData?.name && (
                                    <>
                                        <span className='w-1 h-1 rounded-full bg-gray-300' />
                                        <span className='text-orange-600 font-semibold text-xs bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200'>
                                            <FaStore size={10} className='inline mr-1' />
                                            {myShopData.name}
                                        </span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                    
                    <div className='flex items-center gap-3'>
                        <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border-2 border-gray-200 shadow-sm'>
                            <FaFire size={12} className='text-orange-500' />
                            <span className='text-gray-600 text-xs font-medium'>
                                {stats.pending} pending
                            </span>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className='px-3 py-1.5 rounded-full bg-white border-2 border-gray-200 text-gray-600 hover:text-gray-800 hover:border-orange-300 transition-all duration-300 flex items-center gap-1.5 text-xs font-medium shadow-sm'
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <FaSync className={refreshing ? 'animate-spin' : ''} size={12} />
                            Refresh
                        </motion.button>
                    </div>
                </motion.div>

                {/* ✅ Error State */}
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='bg-red-50 border-2 border-red-200 p-4 rounded-2xl text-center mb-6'
                    >
                        <FaExclamationTriangle size={24} className='text-red-500 mx-auto mb-2' />
                        <p className='text-gray-700 text-sm font-medium'>{error}</p>
                        <button 
                            onClick={fetchOrders}
                            className='mt-2 px-4 py-1.5 rounded-lg bg-red-100 text-red-600 text-sm font-semibold hover:bg-red-200 transition'
                        >
                            Try Again
                        </button>
                    </motion.div>
                )}

                {/* Stats Cards */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8 ${fadeUp}`}
                >
                    {[
                        { label: 'Total', value: stats.total, icon: <FaShoppingBag size={14} />, color: 'text-gray-800', bg: 'bg-gray-50' },
                        { label: 'Pending', value: stats.pending, icon: <FaHourglassHalf size={14} />, color: 'text-amber-600', bg: 'bg-amber-50' },
                        { label: 'Preparing', value: stats.preparing, icon: <FaUtensils size={14} />, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Out for Delivery', value: stats.outForDelivery, icon: <FaTruck size={14} />, color: 'text-orange-600', bg: 'bg-orange-50' },
                        { label: 'Delivered', value: stats.delivered, icon: <FaCheckCircle size={14} />, color: 'text-green-600', bg: 'bg-green-50' },
                        { label: 'Cancelled', value: stats.cancelled, icon: <FaTimesCircle size={14} />, color: 'text-red-600', bg: 'bg-red-50' }
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -4, scale: 1.02 }}
                            className={`bg-white border-2 border-gray-200 p-3 rounded-2xl text-center transition-all duration-300 hover:border-orange-300 shadow-sm`}
                        >
                            <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                            <div className={`text-[8px] font-semibold uppercase tracking-wider ${stat.color}`}>
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Search & Filter */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`flex flex-col sm:flex-row gap-3 mb-6 ${fadeUp}`}
                >
                    <div className='flex-1 relative'>
                        <FaSearch size={16} className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
                        <input
                            type="text"
                            placeholder='Search orders by ID or customer...'
                            className='w-full bg-white border-2 border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all duration-300 text-sm'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className='flex gap-2 overflow-x-auto pb-1 scrollbar-hide'>
                        {[
                            { id: 'all', label: 'All', icon: '📋' },
                            { id: 'pending', label: 'Pending', icon: '⏳' },
                            { id: 'preparing', label: 'Preparing', icon: '🔧' },
                            { id: 'out of delivery', label: 'Out for Delivery', icon: '🚚' },
                            { id: 'delivered', label: 'Delivered', icon: '✅' },
                            { id: 'cancelled', label: 'Cancelled', icon: '❌' }
                        ].map((filter) => (
                            <motion.button
                                key={filter.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                                    activeFilter === filter.id 
                                        ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                                        : 'bg-white text-gray-600 hover:text-gray-800 hover:border-orange-300 border-2 border-gray-200'
                                }`}
                                onClick={() => setActiveFilter(filter.id)}
                            >
                                {filter.icon} {filter.label}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Orders List */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`space-y-4 ${fadeUp}`}
                >
                    {filteredOrders.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className='bg-white border-2 border-gray-200 p-16 rounded-3xl text-center shadow-sm'
                        >
                            <div className='relative z-10'>
                                <div className='w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center'>
                                    <FaShoppingBag size={36} className='text-gray-300' />
                                </div>
                                <h3 className='text-2xl font-bold text-gray-800 mb-2'>No Orders Found</h3>
                                <p className='text-gray-500 text-sm max-w-sm mx-auto font-medium'>
                                    {activeFilter !== 'all' 
                                        ? `No orders with status "${activeFilter}"`
                                        : 'No orders yet. Wait for customers!'}
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        filteredOrders.map((order, index) => (
                            <motion.div 
                                key={order._id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * index }}
                            >
                                <OwnerOrderCard 
                                    key={order._id || index} 
                                    data={order} 
                                    onStatusUpdate={handleStatusUpdate}
                                />
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
                .animate-pulse {
                    animation: pulse 2s ease-in-out infinite;
                }
                .animation-delay-300 { animation-delay: 0.3s; }

                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    )
}

export default OwnerMyOrders