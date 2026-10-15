import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
// ✅ FIXED: Correct import path
import { serverUrl } from '../../../config'
import { 
    FaSearch, FaEye, FaChevronLeft, FaChevronRight,
    FaShoppingCart, FaUser, FaStore, FaClock,
    FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaGem,
    FaTimes, FaDownload, FaExclamationTriangle, FaSync,
    FaTruck, FaUtensils, FaSpinner, FaEdit
} from "react-icons/fa";
import { ClipLoader } from 'react-spinners'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import AdminLayout from './AdminLayout'

function AdminOrders() {
    const { socket } = useSelector(state => state.user)  // ✅ Get socket
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalOrders, setTotalOrders] = useState(0)
    const [statusCounts, setStatusCounts] = useState({})
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [updatingStatus, setUpdatingStatus] = useState(null)
    const [refreshing, setRefreshing] = useState(false)

    // ✅ Socket listener for new orders
    useEffect(() => {
        if (!socket) return

        const handleNewOrder = () => {
            toast.info('📦 New order received!', {
                position: "top-center",
                autoClose: 3000,
            })
            fetchOrders()
        }

        const handleStatusUpdate = () => {
            toast.info('🔄 Order status updated!', {
                position: "top-center",
                autoClose: 2000,
            })
            fetchOrders()
        }

        socket.on('newOrder', handleNewOrder)
        socket.on('update-status', handleStatusUpdate)

        return () => {
            socket.off('newOrder', handleNewOrder)
            socket.off('update-status', handleStatusUpdate)
        }
    }, [socket])

    useEffect(() => {
        fetchOrders()
    }, [page, filterStatus])

    const fetchOrders = async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await axios.get(`${serverUrl}/api/super-admin/orders`, {
                params: { status: filterStatus, page, limit: 10 },
                withCredentials: true
            })
            setOrders(result.data.orders || [])
            setTotalPages(result.data.totalPages || 1)
            setTotalOrders(result.data.total || 0)
            setStatusCounts(result.data.statusCounts || {})
        } catch (error) {
            console.log('❌ Fetch orders error:', error)
            const errorMsg = error.response?.data?.message || 'Failed to fetch orders'
            setError(errorMsg)
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    // ✅ Update order status
    const updateOrderStatus = async (orderId, newStatus) => {
        setUpdatingStatus(orderId)
        try {
            await axios.put(
                `${serverUrl}/api/super-admin/orders/${orderId}/status`,
                { status: newStatus },
                { withCredentials: true }
            )
            toast.success(`✅ Order status updated to ${newStatus}!`, {
                position: "top-center",
                autoClose: 3000,
            })
            await fetchOrders()
            if (selectedOrder?._id === orderId) {
                // Update selected order if modal is open
                const updatedOrder = orders.find(o => o._id === orderId)
                setSelectedOrder(updatedOrder)
            }
        } catch (error) {
            console.log('❌ Status update error:', error)
            toast.error(error.response?.data?.message || 'Failed to update status')
        } finally {
            setUpdatingStatus(null)
        }
    }

    // ✅ Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchOrders()
        setRefreshing(false)
        toast.info('🔄 Orders refreshed!', {
            position: "top-center",
            autoClose: 2000,
        })
    }

    // ✅ Export to CSV
    const exportToCSV = () => {
        const headers = ['Order ID', 'Customer', 'Email', 'Amount', 'Status', 'Date', 'Items']
        const rows = filteredOrders.map(order => {
            const status = order.shopOrders?.[0]?.status || 'pending'
            const items = order.shopOrders?.[0]?.shopOrderItems?.map(i => i.name).join(', ') || ''
            return [
                order._id?.slice(-8) || 'N/A',
                order.user?.fullName || 'Unknown',
                order.user?.email || '',
                `₹${order.totalAmount || 0}`,
                status,
                new Date(order.createdAt).toLocaleDateString(),
                items
            ]
        })
        
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success('📥 Export successful!')
    }

    // ✅ Open order detail
    const openOrderDetail = (order) => {
        setSelectedOrder(order)
        setShowDetailModal(true)
    }

    // Filter orders
    const filteredOrders = useMemo(() => {
        if (!searchQuery.trim()) return orders
        const search = searchQuery.toLowerCase()
        return orders.filter(order => 
            order._id?.toLowerCase().includes(search) ||
            order.user?.fullName?.toLowerCase().includes(search) ||
            order.user?.email?.toLowerCase().includes(search)
        )
    }, [orders, searchQuery])

    // ✅ Clear search
    const clearSearch = () => {
        setSearchQuery('')
    }

    const getStatusColor = (status) => {
        const colors = {
            delivered: 'bg-green-500/20 text-green-400 border-green-500/20',
            cancelled: 'bg-red-500/20 text-red-400 border-red-500/20',
            pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
            'out of delivery': 'bg-blue-500/20 text-blue-400 border-blue-500/20',
            preparing: 'bg-purple-500/20 text-purple-400 border-purple-500/20'
        }
        return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/20'
    }

    const getStatusIcon = (status) => {
        const icons = {
            delivered: <FaCheckCircle className="text-green-400" />,
            cancelled: <FaTimesCircle className="text-red-400" />,
            pending: <FaHourglassHalf className="text-yellow-400" />,
            'out of delivery': <FaTruck className="text-blue-400" />,
            preparing: <FaUtensils className="text-purple-400" />
        }
        return icons[status] || <FaClock className="text-gray-400" />
    }

    const statusOptions = [
        { value: 'pending', label: '⏳ Pending' },
        { value: 'preparing', label: '🔧 Preparing' },
        { value: 'out of delivery', label: '🚚 Out for Delivery' },
        { value: 'delivered', label: '✅ Delivered' },
        { value: 'cancelled', label: '❌ Cancelled' }
    ]

    // ✅ Status stats cards
    const statusStats = [
        { key: 'total', label: 'Total', value: totalOrders, color: 'text-white', bg: 'bg-white/5' },
        { key: 'pending', label: 'Pending', value: statusCounts.pending || 0, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        { key: 'preparing', label: 'Preparing', value: statusCounts.preparing || 0, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { key: 'out of delivery', label: 'Out for Delivery', value: statusCounts['out of delivery'] || 0, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { key: 'delivered', label: 'Delivered', value: statusCounts.delivered || 0, color: 'text-green-400', bg: 'bg-green-500/10' },
        { key: 'cancelled', label: 'Cancelled', value: statusCounts.cancelled || 0, color: 'text-red-400', bg: 'bg-red-500/10' }
    ]

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-[70vh]">
                    <div className="flex flex-col items-center gap-4">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                            <ClipLoader size={50} color="#ffd700" />
                        </motion.div>
                        <motion.p 
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-white/40 text-sm"
                        >
                            Loading orders...
                        </motion.p>
                    </div>
                </div>
            </AdminLayout>
        )
    }

    // ✅ Error State
    if (error) {
        return (
            <AdminLayout>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center h-[70vh]"
                >
                    <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                        <FaExclamationTriangle className="text-red-400 text-5xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Failed to Load Orders</h2>
                    <p className="text-white/40 text-sm mb-6">{error}</p>
                    <div className="flex gap-3">
                        <button 
                            onClick={fetchOrders}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white font-medium flex items-center gap-2"
                        >
                            <FaSync className={refreshing ? 'animate-spin' : ''} />
                            Try Again
                        </button>
                    </div>
                </motion.div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
            >
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        📦 Orders Management
                        <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        >
                            <span className="text-[#ffd93d] text-sm">✨</span>
                        </motion.span>
                    </h1>
                    <p className="text-white/40 text-sm">View and manage all orders</p>
                </div>
                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={exportToCSV}
                        className="px-4 py-2 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all duration-300 border border-green-500/20 flex items-center gap-2 text-sm"
                    >
                        <FaDownload size={14} />
                        Export
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="px-4 py-2 rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 border border-white/5 flex items-center gap-2 text-sm disabled:opacity-50"
                    >
                        <FaSync className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </motion.button>
                </div>
            </motion.div>

            {/* ✅ Status Stats */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6"
            >
                {statusStats.map((stat, idx) => (
                    <motion.div
                        key={stat.key}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -3, scale: 1.02 }}
                        className={`${stat.bg} rounded-xl p-3 text-center border border-white/5 hover:border-white/10 transition-all duration-300`}
                    >
                        <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-white/30 text-[8px] uppercase tracking-wider">{stat.label}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Filters */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col sm:flex-row gap-4 mb-6"
            >
                <div className="flex-1 relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                    <input
                        type="text"
                        placeholder="Search by order ID or customer name..."
                        className="w-full bg-[#18181D] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition"
                            onClick={clearSearch}
                        >
                            <FaTimes size={14} />
                        </motion.button>
                    )}
                </div>
                <select
                    className="bg-[#18181D] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 cursor-pointer"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="pending">⏳ Pending</option>
                    <option value="preparing">🔧 Preparing</option>
                    <option value="out of delivery">🚚 Out for Delivery</option>
                    <option value="delivered">✅ Delivered</option>
                    <option value="cancelled">❌ Cancelled</option>
                </select>
            </motion.div>

            {/* Orders Table */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-premium rounded-2xl border border-white/5 overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-[#ff2d55]/10 to-[#ff6b35]/10 border-b border-white/5">
                            <tr>
                                <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-4 py-3">Order</th>
                                <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-4 py-3 hidden md:table-cell">Customer</th>
                                <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Amount</th>
                                <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Status</th>
                                <th className="text-center text-white/40 text-xs font-medium uppercase tracking-wider px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order, idx) => {
                                const status = order.shopOrders?.[0]?.status || 'pending'
                                return (
                                    <motion.tr 
                                        key={order._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                                        className="border-b border-white/5 transition-all duration-300"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <motion.div 
                                                    whileHover={{ rotate: 15 }}
                                                    className="w-10 h-10 rounded-lg bg-[#ffd700]/20 flex items-center justify-center flex-shrink-0"
                                                >
                                                    <FaShoppingCart className="text-[#ffd700] text-sm" />
                                                </motion.div>
                                                <div>
                                                    <p className="text-white font-medium text-sm">#{order._id?.slice(-8) || 'N/A'}</p>
                                                    <p className="text-white/30 text-[10px] flex items-center gap-1">
                                                        <FaClock size={10} /> 
                                                        {new Date(order.createdAt).toLocaleDateString('en-GB', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <p className="text-white/60 text-sm">{order.user?.fullName || 'Unknown'}</p>
                                            <p className="text-white/30 text-[10px] truncate max-w-[150px]">{order.user?.email || ''}</p>
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            <span className="text-[#ffd700] font-bold text-sm">₹{order.totalAmount || 0}</span>
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <span className={`text-[10px] px-3 py-1 rounded-full border flex items-center gap-1 w-fit ${getStatusColor(status)}`}>
                                                {getStatusIcon(status)}
                                                {status === 'out of delivery' ? 'Out for Delivery' : status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* ✅ Status Update Dropdown */}
                                                <select
                                                    className="bg-[#18181D] border border-white/10 rounded-lg px-2 py-1.5 text-white text-[10px] focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 cursor-pointer"
                                                    value={status}
                                                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                    disabled={updatingStatus === order._id}
                                                >
                                                    {statusOptions.map(opt => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                
                                                <motion.button 
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all duration-300"
                                                    title="View Order Details"
                                                    onClick={() => openOrderDetail(order)}
                                                >
                                                    <FaEye size={14} />
                                                </motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                        <FaShoppingCart className="text-white/10 text-5xl mx-auto mb-3" />
                        <p className="text-white/30 text-sm">No orders found</p>
                    </div>
                )}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-3 mt-6"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2.5 rounded-xl bg-white/5 text-white/40 disabled:opacity-30 hover:bg-white/10 transition-all duration-300 border border-white/5 disabled:hover:bg-white/5"
                    >
                        <FaChevronLeft size={14} />
                    </motion.button>
                    <span className="text-white/40 text-sm font-medium">
                        Page {page} of {totalPages}
                    </span>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2.5 rounded-xl bg-white/5 text-white/40 disabled:opacity-30 hover:bg-white/10 transition-all duration-300 border border-white/5 disabled:hover:bg-white/5"
                    >
                        <FaChevronRight size={14} />
                    </motion.button>
                </motion.div>
            )}

            {/* ✅ Order Detail Modal */}
            <AnimatePresence>
                {showDetailModal && selectedOrder && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4"
                        onClick={() => setShowDetailModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 20 }}
                            className="glass-premium max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <FaShoppingCart className="text-[#ffd700]" />
                                    Order #{selectedOrder._id?.slice(-8)}
                                </h2>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 rounded-lg hover:bg-white/10 transition"
                                    onClick={() => setShowDetailModal(false)}
                                >
                                    <FaTimes className="text-white/60" />
                                </motion.button>
                            </div>

                            {/* Order Info */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-white/30 text-[10px] uppercase tracking-wider">Customer</p>
                                        <p className="text-white font-medium">{selectedOrder.user?.fullName || 'Unknown'}</p>
                                        <p className="text-white/40 text-sm">{selectedOrder.user?.email || ''}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-white/30 text-[10px] uppercase tracking-wider">Total Amount</p>
                                        <p className="text-[#ffd700] font-bold text-xl">₹{selectedOrder.totalAmount || 0}</p>
                                    </div>
                                </div>

                                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                    <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Payment Method</p>
                                    <p className="text-white">{selectedOrder.paymentMethod || 'N/A'}</p>
                                </div>

                                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                    <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Delivery Address</p>
                                    <p className="text-white/60 text-sm">{selectedOrder.deliveryAddress?.text || 'N/A'}</p>
                                </div>

                                {/* Items */}
                                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                    <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Items</p>
                                    <div className="space-y-2">
                                        {selectedOrder.shopOrders?.[0]?.shopOrderItems?.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-sm border-b border-white/5 pb-2 last:border-0">
                                                <span className="text-white/60">{item.name} × {item.quantity}</span>
                                                <span className="text-white font-medium">₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Status Update */}
                                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                    <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Update Status</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {statusOptions.map(opt => (
                                            <motion.button
                                                key={opt.value}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                                                    selectedOrder.shopOrders?.[0]?.status === opt.value
                                                        ? 'bg-[#ff2d55] text-white shadow-lg shadow-[#ff2d55]/30'
                                                        : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                                                }`}
                                                onClick={() => updateOrderStatus(selectedOrder._id, opt.value)}
                                                disabled={updatingStatus === selectedOrder._id}
                                            >
                                                {updatingStatus === selectedOrder._id ? (
                                                    <ClipLoader size={12} color="white" />
                                                ) : (
                                                    opt.label
                                                )}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .glass-premium {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }
                .overflow-y-auto::-webkit-scrollbar {
                    width: 4px;
                }
                .overflow-y-auto::-webkit-scrollbar-track {
                    background: transparent;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: rgba(255, 45, 85, 0.3);
                    border-radius: 10px;
                }
            `}</style>
        </AdminLayout>
    )
}

export default AdminOrders