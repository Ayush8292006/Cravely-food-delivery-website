import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../../../config'
import AdminLayout from './AdminLayout'
import { FaShieldAlt, FaSearch, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaSync, FaRupeeSign } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'

function AdminRefunds() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [statusUpdating, setStatusUpdating] = useState(false)
    const [newStatus, setNewStatus] = useState('completed')

    useEffect(() => {
        fetchRefunds()
    }, [])

    const fetchRefunds = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`${serverUrl}/api/super-admin/orders?limit=50`, { withCredentials: true })
            const allOrders = res.data.orders || []
            // Filter orders with refundStatus or isCancelled
            const refundList = allOrders.filter(o => o.refundStatus || o.isCancelled || o.shopOrders?.some(so => so.status === 'cancelled'))
            setOrders(refundList)
        } catch (error) {
            toast.error('Failed to load refund requests')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (orderId) => {
        setStatusUpdating(true)
        try {
            await axios.put(`${serverUrl}/api/super-admin/refund/${orderId}`, {
                refundStatus: newStatus
            }, { withCredentials: true })
            toast.success(`Refund marked as ${newStatus}`)
            setSelectedOrder(null)
            fetchRefunds()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update refund')
        } finally {
            setStatusUpdating(false)
        }
    }

    const filtered = orders.filter(o => {
        if (filter === 'all') return true
        return (o.refundStatus || 'pending') === filter
    })

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <FaShieldAlt className="text-orange-500" /> Refund & Cancellation Management
                        </h1>
                        <p className="text-white/40 text-sm mt-1">
                            Review cancellations, process Razorpay test-mode refunds, and monitor status.
                        </p>
                    </div>
                    <button
                        onClick={fetchRefunds}
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/50 text-white text-sm flex items-center gap-2 transition"
                    >
                        <FaSync size={12} /> Refresh
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 border-b border-white/5 pb-2 overflow-x-auto">
                    {['all', 'pending', 'processing', 'completed', 'failed'].map((st) => (
                        <button
                            key={st}
                            onClick={() => setFilter(st)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition ${
                                filter === st
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20'
                                    : 'bg-white/5 text-white/50 hover:text-white'
                            }`}
                        >
                            {st} ({st === 'all' ? orders.length : orders.filter(o => (o.refundStatus || 'pending') === st).length})
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-[#12121c] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-white/70">
                            <thead className="bg-white/5 text-xs text-white/40 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Payment</th>
                                    <th className="px-6 py-4">Reason</th>
                                    <th className="px-6 py-4">Refund Status</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-12 text-white/40">
                                            Loading refund records...
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-12 text-white/40">
                                            No cancellation or refund records found in this view.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((order) => {
                                        const rStatus = order.refundStatus || (order.paymentMethod === 'online' && order.payment ? 'processing' : 'N/A')
                                        return (
                                            <tr key={order._id} className="hover:bg-white/[0.02] transition">
                                                <td className="px-6 py-4 font-mono font-medium text-white">
                                                    #{order._id.slice(-6).toUpperCase()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-white font-medium">{order.customerName || order.user?.fullName || 'Customer'}</div>
                                                    <div className="text-xs text-white/40">{order.mobile || order.user?.email}</div>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-white">
                                                    ₹{order.refundAmount || order.totalAmount}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                        order.paymentMethod === 'online' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'
                                                    }`}>
                                                        {order.paymentMethod?.toUpperCase()} {order.payment ? '✓ Paid' : ''}
                                                    </span>
                                                    {order.razorpayPaymentId && (
                                                        <div className="text-[10px] text-white/30 font-mono mt-0.5">{order.razorpayPaymentId}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-xs text-white/60 max-w-[180px] truncate">
                                                    {order.cancellationReason || order.cancellationNote || 'Customer cancellation'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                                                        rStatus === 'completed'
                                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                            : rStatus === 'processing'
                                                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                    }`}>
                                                        {rStatus}
                                                    </span>
                                                    {order.refundId && (
                                                        <div className="text-[10px] text-emerald-400/70 font-mono mt-1">Ref ID: {order.refundId}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOrder(order)
                                                            setNewStatus(order.refundStatus === 'completed' ? 'completed' : 'completed')
                                                        }}
                                                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-orange-500 hover:text-white text-xs font-medium text-white/80 transition"
                                                    >
                                                        Update Status
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Status Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#181824] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                    >
                        <h3 className="text-lg font-bold text-white mb-2">Update Refund Status</h3>
                        <p className="text-white/60 text-xs mb-4">
                            Order #{selectedOrder._id.slice(-6).toUpperCase()} • Amount ₹{selectedOrder.totalAmount}
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-white/60 mb-1">Select Status</label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500"
                                >
                                    <option value="pending" className="bg-[#181824]">Pending</option>
                                    <option value="processing" className="bg-[#181824]">Processing</option>
                                    <option value="completed" className="bg-[#181824]">Completed (Approve & Trigger Refund)</option>
                                    <option value="failed" className="bg-[#181824]">Failed</option>
                                    <option value="rejected" className="bg-[#181824]">Rejected</option>
                                </select>
                            </div>

                            <div className="flex gap-3 justify-end pt-2">
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="px-4 py-2 rounded-xl bg-white/5 text-white/60 hover:text-white text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(selectedOrder._id)}
                                    disabled={statusUpdating}
                                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-sm shadow-lg shadow-orange-500/20 disabled:opacity-50"
                                >
                                    {statusUpdating ? 'Updating...' : 'Save Status'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AdminLayout>
    )
}

export default AdminRefunds

