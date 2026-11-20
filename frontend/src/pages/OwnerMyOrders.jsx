import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../../config'
import { 
    FaArrowLeft, FaShoppingBag, FaClock, FaCheckCircle,
    FaTimesCircle, FaSearch, FaSync, FaStore, FaUtensils,
    FaExclamationTriangle
} from "react-icons/fa"
import { MdRestaurant } from "react-icons/md"
import { ClipLoader } from 'react-spinners'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import OwnerNav from '../components/OwnerNav'
import OwnerOrderCard from '../components/OwnerOrderCard'

function OwnerMyOrders() {
    const navigate = useNavigate()
    const { userData, socket } = useSelector(state => state.user)
    const { myShopData } = useSelector(state => state.owner)
    const [orders, setOrders] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeFilter, setActiveFilter] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [refreshing, setRefreshing] = useState(false)

    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        preparing: 0,
        outForDelivery: 0,
        delivered: 0,
        cancelled: 0
    })

    const getOrderStatus = (order) => {
        const so = Array.isArray(order.shopOrders) ? order.shopOrders[0] : order.shopOrders
        return so?.status || 'pending'
    }

    const fetchOrders = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await axios.get(`${serverUrl}/api/order/my-orders?type=owner`, {
                withCredentials: true
            })
            const ordersData = response.data || []
            setOrders(ordersData)
            setFilteredOrders(ordersData)

            const total = ordersData.length
            const pending = ordersData.filter(o => getOrderStatus(o) === 'pending').length
            const preparing = ordersData.filter(o => getOrderStatus(o) === 'preparing').length
            const outForDelivery = ordersData.filter(o => getOrderStatus(o) === 'out of delivery').length
            const delivered = ordersData.filter(o => getOrderStatus(o) === 'delivered').length
            const cancelled = ordersData.filter(o => getOrderStatus(o) === 'cancelled').length

            setStats({ total, pending, preparing, outForDelivery, delivered, cancelled })
        } catch (err) {
            console.error("Fetch orders error:", err)
            setError(err.response?.data?.message || 'Failed to fetch orders')
            toast.error(err.response?.data?.message || 'Failed to fetch orders')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    // Real-time socket listener for incoming kitchen orders
    useEffect(() => {
        if (!socket) return

        const handleNewOrder = () => {
            toast.info(`🔔 New order received in kitchen!`)
            fetchOrders()
        }

        socket.on('newOrder', handleNewOrder)
        socket.on('new-order-placed', handleNewOrder)

        return () => {
            socket.off('newOrder', handleNewOrder)
            socket.off('new-order-placed', handleNewOrder)
        }
    }, [socket])

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchOrders()
        setRefreshing(false)
        toast.info('Orders refreshed')
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
                o.invoiceNumber?.toLowerCase().includes(query)
            )
        }
        setFilteredOrders(filtered)
    }, [activeFilter, searchQuery, orders])

    if (!myShopData && !loading) {
        return (
            <div 
                className="min-h-screen bg-[#0A090D] text-white pt-24 pb-16 px-4 selection:bg-[#FF6B00] selection:text-white"
                style={{ fontFamily: "'Poppins', 'Segoe UI', system-ui, sans-serif" }}
            >
                <OwnerNav />
                <div className="max-w-md mx-auto mt-20 bg-[#13121A] border border-white/10 rounded-3xl p-10 text-center space-y-4 shadow-2xl">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF6B00]">
                        <FaStore size={32} />
                    </div>
                    <h2 className="text-xl font-black text-white">No Restaurant Registered</h2>
                    <p className="text-xs text-gray-400">
                        You must register your restaurant first to view and manage incoming customer orders.
                    </p>
                    <button
                        onClick={() => navigate('/create-edit-shop')}
                        className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                    >
                        Register Restaurant
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div 
            className="min-h-screen bg-[#0A090D] text-white pt-[90px] pb-24 px-4 sm:px-6 lg:px-8 selection:bg-[#FF6B00] selection:text-white"
            style={{ fontFamily: "'Poppins', 'Segoe UI', system-ui, sans-serif" }}
        >
            <OwnerNav />

            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/[0.08]">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/owner-dashboard')}
                            className="w-10 h-10 rounded-xl bg-[#13121A] hover:bg-[#FF6B00] border border-white/10 hover:border-transparent text-white flex items-center justify-center transition cursor-pointer"
                        >
                            <FaArrowLeft size={13} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    Kitchen Order Management
                                </h1>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#FF6B00]/20 text-[#FF8C00]">
                                    {stats.total}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Real-time kitchen order dispatch, status updates & rider coordination
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#13121A] hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                    >
                        <FaSync size={11} className={refreshing ? 'animate-spin text-[#FF6B00]' : 'text-gray-400'} />
                        <span>Refresh Orders</span>
                    </button>
                </div>

                {/* Filter Pills and Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1.5 p-1 bg-[#13121A] border border-white/10 rounded-2xl overflow-x-auto">
                        {[
                            { id: 'all', label: 'All Orders', count: stats.total },
                            { id: 'pending', label: 'Pending', count: stats.pending, alert: stats.pending > 0 },
                            { id: 'preparing', label: 'Cooking', count: stats.preparing },
                            { id: 'out of delivery', label: 'Out for Delivery', count: stats.outForDelivery },
                            { id: 'delivered', label: 'Delivered', count: stats.delivered },
                            { id: 'cancelled', label: 'Cancelled', count: stats.cancelled }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveFilter(tab.id)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                                    activeFilter === tab.id
                                        ? 'bg-[#FF6B00] text-white shadow-md'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeFilter === tab.id ? 'bg-black/30' : 'bg-white/10'} ${tab.alert ? 'bg-rose-600 text-white animate-pulse' : ''}`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <FaSearch size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search by order ID or customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-[#13121A] border border-white/10 focus:border-[#FF6B00] rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none transition w-full md:w-64"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Orders Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-3">
                        <ClipLoader size={46} color="#FF6B00" />
                        <p className="text-xs text-gray-400 animate-pulse">Loading restaurant orders...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-2xl text-center space-y-3 max-w-md mx-auto">
                        <FaExclamationTriangle size={32} className="text-red-400 mx-auto" />
                        <h3 className="text-base font-bold text-white">Error Loading Orders</h3>
                        <p className="text-xs text-gray-400">{error}</p>
                        <button
                            onClick={fetchOrders}
                            className="px-5 py-2 rounded-xl bg-[#FF6B00] hover:bg-orange-600 text-white text-xs font-bold transition cursor-pointer"
                        >
                            Retry
                        </button>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-[#13121A] border border-white/10 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                            <FaShoppingBag size={24} />
                        </div>
                        <h3 className="text-base font-bold text-white">No Orders Found</h3>
                        <p className="text-xs text-gray-400">
                            {searchQuery 
                                ? `No orders matched "${searchQuery}".` 
                                : `No orders currently in "${activeFilter}" status.`}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {filteredOrders.map((order, index) => (
                            <OwnerOrderCard
                                key={order._id || index}
                                order={order}
                                index={index}
                                onStatusUpdate={fetchOrders}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default OwnerMyOrders
