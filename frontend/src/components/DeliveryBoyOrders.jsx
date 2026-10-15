// src/components/DeliveryBoyOrders.jsx

import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../../config'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    FaTruck, FaClock, FaRupeeSign, FaMapMarkerAlt, 
    FaCheckCircle, FaTimes, FaEye, FaSearch,
    FaStar, FaWallet, FaSpinner, FaStore,
    FaMotorcycle, FaSync, FaBox,
    FaPhone, FaUser, FaShoppingBag, FaCircle,
    FaCalendarAlt, FaClipboardList, FaWhatsapp
} from 'react-icons/fa'
import { MdVerified } from 'react-icons/md'

function DeliveryBoyOrders() {
    const { userData } = useSelector(state => state.user)
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showDetail, setShowDetail] = useState(false)
    const [error, setError] = useState(null)
    const [stats, setStats] = useState({
        total: 0,
        delivered: 0,
        cancelled: 0,
        pending: 0,
        totalEarning: 0
    })

    // ✅ Helper: Get Order Status
    const getOrderStatus = (order) => {
        if (!order) return 'pending'
        return order.status || 
               order.shopOrder?.status ||
               order.shopOrders?.[0]?.status ||
               'pending'
    }

    // ✅ Helper: Get Mobile Number
    const getMobileNumber = (order) => {
        if (!order) return 'N/A'
        
        const mobile = 
            order.mobile ||
            order.user?.mobile ||
            order.userMobile ||
            order.customerMobile ||
            order.deliveryAddress?.phone ||
            order.deliveryAddress?.mobile ||
            order.shopOrders?.[0]?.userMobile ||
            order.shopOrders?.[0]?.mobile ||
            order.phone ||
            null
        
        if (mobile) {
            let cleaned = String(mobile).replace(/\s/g, '').replace(/[^0-9+]/g, '')
            if (cleaned.startsWith('+91')) cleaned = cleaned.slice(3)
            if (cleaned.startsWith('91') && cleaned.length === 12) cleaned = cleaned.slice(2)
            if (cleaned.length === 10 && /^\d+$/.test(cleaned)) return cleaned
            if (cleaned.length > 10 && /^\d+$/.test(cleaned)) return cleaned.slice(-10)
            return cleaned
        }
        return 'N/A'
    }

    // ✅ Helper: Get Customer Name
    const getCustomerName = (order) => {
        if (!order) return 'Customer'
        return order.user?.fullName || 
               order.user?.name || 
               order.customerName || 
               order.customer?.fullName ||
               'Customer'
    }

    // ✅ Helper: Get Restaurant Name
    const getRestaurantName = (order) => {
        if (!order) return 'Restaurant'
        return order.shopOrder?.shop?.name || 
               order.restaurant || 
               order.shopOrders?.[0]?.shop?.name ||
               'Restaurant'
    }

    // ✅ Helper: Get Total Amount
    const getTotalAmount = (order) => {
        if (!order) return 0
        return order.totalAmount || 
               order.amount || 
               order.shopOrder?.subtotal ||
               order.shopOrders?.[0]?.subtotal ||
               0
    }

    // ✅ Helper: Get Items Count
    const getItemsCount = (order) => {
        if (!order) return 0
        return order.shopOrder?.shopOrderItems?.length || 
               order.shopOrders?.[0]?.shopOrderItems?.length ||
               order.items?.length ||
               0
    }

    // ✅ Helper: Get Address
    const getAddress = (order) => {
        if (!order) return 'Address not available'
        return order.deliveryAddress?.text || 
               order.deliveryAddress || 
               order.address || 
               'Address not available'
    }

    // ✅ Helper: Get Order ID
    const getOrderId = (order) => {
        if (!order) return 'N/A'
        return order._id || order.id || 'N/A'
    }

    // ✅ FETCH ORDERS
    const fetchOrders = useCallback(async () => {
        console.log("🔄 ===== START FETCHING ORDERS =====")
        
        setLoading(true)
        setError(null)
        try {
            let ordersData = []
            
            if (userData?.role === 'deliveryBoy') {
                const response = await axios.get(`${serverUrl}/api/order/assigned-orders`, {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                })
                
                if (response.data?.orders && Array.isArray(response.data.orders)) {
                    ordersData = response.data.orders
                } else if (Array.isArray(response.data)) {
                    ordersData = response.data
                }
            } else {
                const response = await axios.get(`${serverUrl}/api/order/my-orders`, {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                })
                
                if (Array.isArray(response.data)) {
                    ordersData = response.data
                } else if (response.data?.orders && Array.isArray(response.data.orders)) {
                    ordersData = response.data.orders
                }
            }
            
            setOrders(ordersData)
            
            const delivered = ordersData.filter(o => getOrderStatus(o) === 'delivered').length
            const cancelled = ordersData.filter(o => getOrderStatus(o) === 'cancelled').length
const pending = ordersData.filter(o => {
    const status = getOrderStatus(o)
    return status === 'pending' || status === 'out of delivery' || status === 'preparing'
}).length

// ✅ ₹50 per delivery (FIXED)
const totalEarning = delivered * 50

console.log("📊 Stats:", { delivered, cancelled, pending, totalEarning })

setStats({
    total: ordersData.length,
    delivered,
    cancelled,
    pending,
    totalEarning
})
            
            if (ordersData.length > 0) {
                toast.success(`✅ ${ordersData.length} orders loaded`)
            }
            
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch orders')
            toast.error('Failed to fetch orders')
        } finally {
            setLoading(false)
        }
    }, [userData])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    // ✅ Filter Orders - ONLY 3 FILTERS
    const getFilteredOrders = () => {
        let filtered = orders
        
        // ✅ Only filter by 'all', 'delivered', or 'out of delivery'
        if (filterStatus === 'delivered') {
            filtered = filtered.filter(o => getOrderStatus(o) === 'delivered')
        } else if (filterStatus === 'out of delivery') {
            filtered = filtered.filter(o => getOrderStatus(o) === 'out of delivery')
        }
        // 'all' shows everything
        
        if (searchTerm) {
            filtered = filtered.filter(o => {
                const search = searchTerm.toLowerCase()
                return (
                    getOrderId(o).toLowerCase().includes(search) ||
                    getCustomerName(o).toLowerCase().includes(search) ||
                    getRestaurantName(o).toLowerCase().includes(search) ||
                    getAddress(o).toLowerCase().includes(search) ||
                    getMobileNumber(o).toLowerCase().includes(search)
                )
            })
        }
        return filtered
    }

    const filteredOrders = getFilteredOrders()

    // ✅ Get Status Config
    const getStatusConfig = (status) => {
        const configs = {
            delivered: { 
                color: 'bg-green-50 text-green-700 border-green-300', 
                dot: 'bg-green-500',
                icon: <FaCheckCircle className="text-green-500" size={14} />,
                label: 'Delivered'
            },
            cancelled: { 
                color: 'bg-red-50 text-red-700 border-red-300', 
                dot: 'bg-red-500',
                icon: <FaTimes className="text-red-500" size={14} />,
                label: 'Cancelled'
            },
            pending: { 
                color: 'bg-amber-50 text-amber-700 border-amber-300', 
                dot: 'bg-amber-500 animate-pulse',
                icon: <FaClock className="text-amber-500" size={14} />,
                label: 'Pending'
            },
            'out of delivery': { 
                color: 'bg-orange-50 text-orange-700 border-orange-300', 
                dot: 'bg-orange-500 animate-pulse',
                icon: <FaTruck className="text-orange-500" size={14} />,
                label: 'Out for Delivery'
            },
            preparing: { 
                color: 'bg-blue-50 text-blue-700 border-blue-300', 
                dot: 'bg-blue-500 animate-pulse',
                icon: <FaSpinner className="text-blue-500 animate-spin" size={14} />,
                label: 'Preparing'
            }
        }
        return configs[status] || configs.pending
    }

    // ✅ Format Currency
    const formatCurrency = (amount) => {
        return `₹${Number(amount || 0).toLocaleString('en-IN')}`
    }

    // ✅ Format Date
    const formatDate = (date) => {
        if (!date) return 'N/A'
        try {
            const d = new Date(date)
            return d.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch {
            return 'Invalid Date'
        }
    }

    // ✅ Open Order Detail
    const openOrderDetail = (order) => {
        setSelectedOrder(order)
        setShowDetail(true)
        document.body.style.overflow = 'hidden'
    }

    // ✅ Close Order Detail
    const closeOrderDetail = () => {
        setShowDetail(false)
        document.body.style.overflow = 'auto'
        setTimeout(() => setSelectedOrder(null), 300)
    }

    // ✅ Loading State
    if (loading) {
        return (
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 flex items-center justify-center min-h-[280px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
                    <p className="text-gray-400 text-sm font-medium">Loading orders...</p>
                </div>
            </div>
        )
    }

    // ✅ Error State
    if (error) {
        return (
            <div className="bg-white border-2 border-red-200 rounded-2xl p-8 text-center min-h-[280px] flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mb-3">
                    <FaTimes className="text-red-400 text-2xl" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Failed to Load Orders</h3>
                <p className="text-gray-400 text-sm mb-3">{error}</p>
                <button 
                    onClick={fetchOrders}
                    className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold flex items-center gap-2 transition-all duration-300"
                >
                    <FaSync size={12} /> Retry
                </button>
            </div>
        )
    }

    // ✅ No Orders State
    if (orders.length === 0) {
        return (
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center min-h-[280px] flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-orange-50 border-2 border-orange-200 flex items-center justify-center mb-3">
                    <FaMotorcycle className="text-orange-300 text-3xl" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">No Orders Found</h3>
                <p className="text-gray-400 text-sm mb-3">No deliveries completed yet</p>
                <button 
                    onClick={fetchOrders}
                    className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold flex items-center gap-2 transition-all duration-300"
                >
                    <FaSync size={12} /> Refresh
                </button>
            </div>
        )
    }

    return (
        <>
            {/* ✅ Main Container */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-sm">
                
                {/* ✅ Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center">
                            <FaTruck className="text-white text-sm" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                My Orders
                                <span className="text-[11px] bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full border border-orange-200 font-bold">
                                    {orders.length}
                                </span>
                            </h2>
                        </div>
                    </div>
                    <button 
                        onClick={fetchOrders}
                        className="text-xs text-orange-500 hover:text-orange-600 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-all duration-300"
                    >
                        <FaSync size={11} /> Refresh
                    </button>
                </div>

                {/* ✅ Stats Cards */}
                <div className="grid grid-cols-5 gap-2.5 mb-4">
                    {[
                        { icon: <FaShoppingBag size={13} className="text-orange-500" />, label: 'Total', value: stats.total, color: 'text-orange-600' },
                        { icon: <FaCheckCircle size={13} className="text-green-500" />, label: 'Delivered', value: stats.delivered, color: 'text-green-600' },
                        { icon: <FaTimes size={13} className="text-red-500" />, label: 'Cancelled', value: stats.cancelled, color: 'text-red-600' },
                        { icon: <FaClock size={13} className="text-amber-500" />, label: 'Pending', value: stats.pending, color: 'text-amber-600' },
                        { icon: <FaWallet size={13} className="text-amber-500" />, label: 'Earnings', value: formatCurrency(stats.totalEarning), color: 'text-amber-600' }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-center">
                            <div className="flex items-center justify-center gap-1.5">
                                {stat.icon}
                                <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
                            </div>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* ✅ Filters - ONLY 3 FILTERS */}
                <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
                    <div className="flex-1 relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm outline-none transition-all bg-gray-50 hover:bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 flex-nowrap">
                        {[
                            { id: 'all', label: '📋 All' },
                            { id: 'delivered', label: '✅ Delivered' },
                            { id: 'out of delivery', label: '🚚 Out for Delivery' }
                        ].map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setFilterStatus(filter.id)}
                                className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all duration-300 border-2 whitespace-nowrap ${
                                    filterStatus === filter.id
                                        ? 'bg-orange-500 text-white border-orange-600 shadow-sm shadow-orange-200'
                                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-orange-300 hover:text-orange-600'
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ✅ Orders List */}
                {filteredOrders.length > 0 ? (
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                        {filteredOrders.map((order, index) => {
                            const status = getOrderStatus(order)
                            const statusConfig = getStatusConfig(status)
                            const shopName = getRestaurantName(order)
                            const customerName = getCustomerName(order)
                            const totalAmount = getTotalAmount(order)
                            const address = getAddress(order)
                            const orderId = getOrderId(order)
                            const itemsCount = getItemsCount(order)
                            const mobile = getMobileNumber(order)
                            
                            return (
                                <motion.div
                                    key={order._id || index}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    whileHover={{ scale: 1.005 }}
                                    className="bg-gray-50 border-2 border-gray-200 rounded-xl p-3 hover:border-orange-300 hover:shadow-sm transition-all duration-300 cursor-pointer group"
                                    onClick={() => openOrderDetail(order)}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Status Dot */}
                                        <div className={`w-2.5 h-2.5 rounded-full ${statusConfig.dot} flex-shrink-0`} />
                                        
                                        {/* Main Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-[10px] font-mono text-gray-400 font-bold bg-white px-2 py-0.5 rounded border border-gray-200">
                                                    #{orderId.slice(-6).toUpperCase()}
                                                </span>
                                                <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${statusConfig.color} flex items-center gap-1`}>
                                                    {statusConfig.icon}
                                                    {statusConfig.label}
                                                </span>
                                                {order.paymentMethod === "online" && (
                                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-500">
                                                        💳 Online
                                                    </span>
                                                )}
                                                {order.paymentMethod === "cod" && (
                                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-green-200 bg-green-50 text-green-500">
                                                        💵 COD
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <span className="text-gray-700 font-bold text-sm flex items-center gap-1">
                                                    <FaStore size={10} className="text-orange-400" />
                                                    {shopName}
                                                </span>
                                                <span className="text-gray-300 text-[10px]">•</span>
                                                <span className="text-gray-500 text-xs flex items-center gap-1">
                                                    <FaUser size={9} className="text-orange-300" />
                                                    {customerName}
                                                </span>
                                                {mobile !== 'N/A' && (
                                                    <>
                                                        <span className="text-gray-300 text-[10px]">•</span>
                                                        <span className="text-gray-400 text-[10px] flex items-center gap-1">
                                                            <FaPhone size={9} className="text-orange-300" />
                                                            {mobile}
                                                            <a 
                                                                href={`tel:${mobile}`} 
                                                                className="text-orange-500 hover:text-orange-600 text-[10px] font-bold underline"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                Call
                                                            </a>
                                                            <a 
                                                                href={`https://wa.me/${mobile}`} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-green-500 hover:text-green-600 text-[10px] font-bold"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <FaWhatsapp size={11} className="inline" />
                                                            </a>
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center gap-2 mt-1 text-[9px] text-gray-400 flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <FaMapMarkerAlt size={8} className="text-orange-300" />
                                                    {address}
                                                </span>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-orange-500 font-bold text-sm">{formatCurrency(totalAmount)}</span>
                                                <span className="text-gray-300">•</span>
                                                <span>{itemsCount} items</span>
                                                <span className="text-gray-300">•</span>
                                                <span className="flex items-center gap-1">
                                                    <FaCalendarAlt size={8} />
                                                    {formatDate(order.createdAt).split(',')[0]}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* View Button */}
                                        <button 
                                            className="p-2 rounded-lg bg-white border-2 border-gray-200 text-gray-300 hover:text-orange-500 hover:border-orange-300 transition-all duration-300 flex-shrink-0"
                                            onClick={(e) => { e.stopPropagation(); openOrderDetail(order); }}
                                        >
                                            <FaEye size={12} />
                                        </button>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <FaMotorcycle className="text-gray-200 text-3xl mx-auto mb-2" />
                        <p className="text-gray-400 text-xs font-medium">No matching orders</p>
                    </div>
                )}
            </div>

            {/* ✅ Order Detail Modal */}
            <AnimatePresence>
                {showDetail && selectedOrder && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-[99999]"
                        onClick={closeOrderDetail}
                    >
                        <motion.div
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-white w-full max-w-2xl max-h-[92vh] rounded-t-3xl shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white border-b-2 border-gray-100 px-5 py-4 flex items-center justify-between z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200">
                                        <FaBox className="text-white text-lg" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Order Details</h2>
                                        <p className="text-[10px] text-gray-400 font-mono">
                                            #{getOrderId(selectedOrder).slice(-8).toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300 flex items-center justify-center text-gray-400 hover:text-gray-600"
                                    onClick={closeOrderDetail}
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="overflow-y-auto max-h-[calc(92vh-70px)] p-5 space-y-4">
                                
                                {/* Status Badge */}
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                                    <div className={`w-3 h-3 rounded-full ${getStatusConfig(getOrderStatus(selectedOrder)).dot}`} />
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusConfig(getOrderStatus(selectedOrder)).color} flex items-center gap-1.5`}>
                                        {getStatusConfig(getOrderStatus(selectedOrder)).icon}
                                        {getStatusConfig(getOrderStatus(selectedOrder)).label}
                                    </span>
                                    <span className="text-[10px] text-gray-400 ml-auto flex items-center gap-1">
                                        <FaCalendarAlt size={10} />
                                        {formatDate(selectedOrder.createdAt)}
                                    </span>
                                </div>

                                {/* Two Column Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                            <FaStore size={10} /> Restaurant
                                        </p>
                                        <p className="text-gray-800 font-bold text-sm mt-0.5">
                                            {getRestaurantName(selectedOrder)}
                                        </p>
                                    </div>

                                    <div className="p-3 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200">
                                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                            <FaRupeeSign size={10} /> Total
                                        </p>
                                        <p className="text-xl font-bold text-orange-600 mt-0.5">
                                            {formatCurrency(getTotalAmount(selectedOrder))}
                                        </p>
                                    </div>
                                </div>

                                {/* Customer */}
                                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                        <FaUser size={10} /> Customer
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-gray-800 font-bold text-sm flex items-center gap-1">
                                            {getCustomerName(selectedOrder)}
                                            <MdVerified className="text-blue-500 text-sm" />
                                        </p>
                                    </div>
                                    {getMobileNumber(selectedOrder) !== 'N/A' && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-gray-500 text-xs flex items-center gap-1">
                                                <FaPhone size={10} className="text-orange-400" />
                                                {getMobileNumber(selectedOrder)}
                                            </p>
                                            <a 
                                                href={`tel:${getMobileNumber(selectedOrder)}`} 
                                                className="text-orange-500 hover:text-orange-600 text-[10px] font-bold underline"
                                            >
                                                Call
                                            </a>
                                            <a 
                                                href={`https://wa.me/${getMobileNumber(selectedOrder)}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-green-500 hover:text-green-600 text-[10px] font-bold flex items-center gap-0.5"
                                            >
                                                <FaWhatsapp size={11} /> WhatsApp
                                            </a>
                                        </div>
                                    )}
                                    <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                                        <FaMapMarkerAlt size={10} className="text-orange-400" />
                                        {getAddress(selectedOrder)}
                                    </p>
                                </div>

                                {/* Payment */}
                                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Payment</p>
                                    <p className="text-gray-800 font-bold text-sm mt-0.5">
                                        {selectedOrder.paymentMethod === "online" ? (
                                            <span className={selectedOrder.payment === true ? 'text-green-600' : 'text-red-500'}>
                                                {selectedOrder.payment === true ? '✅ Online - Paid' : '❌ Online - Failed'}
                                            </span>
                                        ) : (
                                            <span className="text-gray-600">💵 Cash on Delivery</span>
                                        )}
                                    </p>
                                </div>

                                {/* Items */}
                                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-2">
                                        <FaShoppingBag size={10} /> Items ({getItemsCount(selectedOrder)})
                                    </p>
                                    <div className="space-y-1.5">
                                        {selectedOrder.shopOrder?.shopOrderItems?.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-sm border-b border-gray-200 pb-1.5 last:border-0 last:pb-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-600 text-xs font-medium">{item.name}</span>
                                                    <span className="text-gray-300 text-[9px]">× {item.quantity}</span>
                                                </div>
                                                <span className="text-gray-700 font-bold text-xs">{formatCurrency(item.price * item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Rating */}
                                {getOrderStatus(selectedOrder) === 'delivered' && selectedOrder.deliveryBoyRating && (
                                    <div className="p-3 rounded-xl bg-amber-50 border-2 border-amber-200">
                                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                            <FaStar size={10} className="text-amber-400" /> Customer Rating
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xl font-bold text-amber-600">
                                                {selectedOrder.deliveryBoyRating.average?.toFixed(1) || 'N/A'}
                                            </span>
                                            <div className="flex items-center gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <FaStar 
                                                        key={i} 
                                                        className={`text-sm ${i < Math.round(selectedOrder.deliveryBoyRating.average || 0) ? 'text-amber-400' : 'text-gray-300'}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-gray-400 text-[10px] font-medium ml-1">
                                                ({selectedOrder.deliveryBoyRating.count || 0})
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={closeOrderDetail}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-200 transition-all duration-300"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .overflow-y-auto::-webkit-scrollbar {
                    width: 3px;
                }
                .overflow-y-auto::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: #d4845a;
                    border-radius: 10px;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                    background: #c2744a;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .animate-pulse {
                    animation: pulse 1.5s ease-in-out infinite;
                }
            `}</style>
        </>
    )
}

export default DeliveryBoyOrders