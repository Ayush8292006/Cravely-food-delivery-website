import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../../App'
import { 
    FaSearch, FaEye, FaChevronLeft, FaChevronRight,
    FaShoppingCart, FaUser, FaStore, FaClock,
    FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaGem
} from "react-icons/fa";
import { ClipLoader } from 'react-spinners'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import AdminLayout from './AdminLayout'



function AdminOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        fetchOrders()
    }, [page, filterStatus])

    const fetchOrders = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/super-admin/orders`, {
                params: { status: filterStatus, page, limit: 10 },
                withCredentials: true
            })
            setOrders(result.data.orders || [])
            setTotalPages(result.data.totalPages || 1)
        } catch (error) {
            toast.error('Failed to fetch orders')
        } finally {
            setLoading(false)
        }
    }

    const filteredOrders = orders.filter(order => {
        const search = searchQuery.toLowerCase()
        return order._id?.toLowerCase().includes(search) ||
               order.user?.fullName?.toLowerCase().includes(search)
    })

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

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-[70vh]">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <ClipLoader size={50} color="#ffd700" />
                    </motion.div>
                </div>
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
                <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="text-white/30 text-sm bg-white/5 px-4 py-2 rounded-full border border-white/5"
                >
                    {filteredOrders.length} orders found
                </motion.div>
            </motion.div>

            {/* Filters */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col sm:flex-row gap-4 mb-6"
            >
                <div className="flex-1 relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        className="w-full bg-[#18181D] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="bg-[#18181D] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ff2d55]/50"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="out of delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
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
                                <th className="text-right text-white/40 text-xs font-medium uppercase tracking-wider px-4 py-3">Actions</th>
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
                                                    className="w-10 h-10 rounded-lg bg-[#ffd700]/20 flex items-center justify-center"
                                                >
                                                    <FaShoppingCart className="text-[#ffd700] text-sm" />
                                                </motion.div>
                                                <div>
                                                    <p className="text-white font-medium text-sm">#{order._id?.slice(-6) || 'N/A'}</p>
                                                    <p className="text-white/30 text-[10px] flex items-center gap-1">
                                                        <FaClock size={10} /> {new Date(order.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <p className="text-white/60 text-sm">{order.user?.fullName || 'Unknown'}</p>
                                            <p className="text-white/30 text-[10px]">{order.user?.email || ''}</p>
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            <span className="text-[#ffd700] font-bold text-sm">₹{order.totalAmount || 0}</span>
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <span className={`text-[10px] px-2 py-1 rounded-full border ${getStatusColor(status)}`}>
                                                {status === 'out of delivery' ? 'Out for Delivery' : status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <motion.button 
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all duration-300"
                                                    title="View Order"
                                                    onClick={() => window.open(`/track-order/${order._id}`, '_blank')}
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
                <div className="flex items-center justify-center gap-2 mt-6">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-lg bg-white/5 text-white/40 disabled:opacity-30 hover:bg-white/10 transition-all duration-300"
                    >
                        <FaChevronLeft size={14} />
                    </motion.button>
                    <span className="text-white/40 text-sm">
                        Page {page} of {totalPages}
                    </span>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded-lg bg-white/5 text-white/40 disabled:opacity-30 hover:bg-white/10 transition-all duration-300"
                    >
                        <FaChevronRight size={14} />
                    </motion.button>
                </div>
            )}

            <style jsx>{`
                .glass-premium {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }
            `}</style>
        </AdminLayout>
    )
}

export default AdminOrders