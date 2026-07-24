import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { 
    FaArrowLeft, FaShoppingBag, FaClock, FaCheckCircle,
    FaTimesCircle, FaHourglassHalf, FaSearch, FaFilter,
    FaTruck, FaUtensils, FaChartLine, FaFire, FaSync,
    FaStore, FaUser, FaTag, FaRocket, FaCrown,
    FaStar, FaMedal, FaAward, FaTrendUp
} from 'react-icons/fa'
import { MdRestaurant, MdVerified } from 'react-icons/md'
import { ClipLoader } from 'react-spinners'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import OwnerOrderCard from '../components/OwnerOrderCard'
import OwnerNav from '../components/OwnerNav'

function OwnerOrders() {
    const navigate = useNavigate()
    const { userData } = useSelector(state => state.user)
    const { myShopData } = useSelector(state => state.owner)
    const [orders, setOrders] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])
    const [loading, setLoading] = useState(true)
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

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const response = await axios.get(`${serverUrl}/api/order/my-orders`, {
                withCredentials: true
            })
            
            const ordersData = response.data || []
            setOrders(ordersData)
            setFilteredOrders(ordersData)

            const total = ordersData.length
            const pending = ordersData.filter(o => o.shopOrders?.status === 'pending').length
            const preparing = ordersData.filter(o => o.shopOrders?.status === 'preparing').length
            const outForDelivery = ordersData.filter(o => o.shopOrders?.status === 'out of delivery').length
            const delivered = ordersData.filter(o => o.shopOrders?.status === 'delivered').length
            const cancelled = ordersData.filter(o => o.shopOrders?.status === 'cancelled').length

            setStats({ total, pending, preparing, outForDelivery, delivered, cancelled })
        } catch (error) {
            console.log('Fetch orders error:', error)
            toast.error('Failed to fetch orders')
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
            filtered = filtered.filter(o => o.shopOrders?.status === activeFilter)
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

    if (loading) {
        return (
            <div className='min-h-screen bg-[#0a0a0f]'>
                <OwnerNav />
                <div className='flex items-center justify-center h-screen pt-[70px]'>
                    <div className='flex flex-col items-center gap-4'>
                        <div className='relative'>
                            <ClipLoader size={60} color="#ff2d55" />
                            <div className='absolute inset-0 animate-ping rounded-full border-2 border-[#ff2d55]/20' />
                            <div className='absolute inset-[-10px] rounded-full border border-[#ff6b35]/10 animate-spin-slow' />
                        </div>
                        <p className='text-white/40 text-sm animate-pulse flex items-center gap-2'>
                            <span className='w-1.5 h-1.5 rounded-full bg-[#ff2d55]/40 animate-pulse' />
                            Loading orders...
                            <span className='w-1.5 h-1.5 rounded-full bg-[#ff6b35]/40 animate-pulse animation-delay-300' />
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-[#0a0a0f] relative overflow-hidden pt-[70px] pb-[70px] md:pb-0'>
            
            {/* ✅ OwnerNav */}
            <OwnerNav />

            {/* ✅ Animated Background */}
            <div className='absolute inset-0 pointer-events-none'>
                <motion.div 
                    animate={{ x: [0, 80, -40, 0], y: [0, -40, 60, 0] }}
                    transition={{ duration: 25, repeat: Infinity }}
                    className='absolute -top-40 -left-40 w-[700px] h-[700px] bg-[#ff2d55]/5 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ x: [0, -80, 40, 0], y: [0, 40, -60, 0] }}
                    transition={{ duration: 30, repeat: Infinity }}
                    className='absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-[#ff6b35]/5 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ffd93d]/3 rounded-full blur-3xl'
                />
            </div>

            <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8'>
                
                {/* ✅ Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 ${fadeUp}`}
                >
                    <div className='flex items-center gap-4'>
                        <motion.button
                            whileHover={{ scale: 1.05, rotate: -5 }}
                            whileTap={{ scale: 0.95 }}
                            className='w-11 h-11 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#12121f] flex items-center justify-center hover:bg-white/10 transition-all duration-300 border border-white/10 shadow-lg shadow-black/20 group'
                            onClick={() => navigate('/owner-dashboard')}
                        >
                            <FaArrowLeft size={18} className='text-white/60 group-hover:text-white transition' />
                        </motion.button>
                        <div>
                            <h1 className='text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3'>
                                <span className='text-gradient-animated'>📦 Order Management</span>
                                <span className='text-xs bg-gradient-to-r from-[#ff2d55]/20 to-[#ff6b35]/20 px-2.5 py-0.5 rounded-full text-[#ff6b35] border border-[#ff6b35]/20'>
                                    {stats.total} orders
                                </span>
                            </h1>
                            <p className='text-white/30 text-sm flex items-center gap-2 flex-wrap'>
                                <span>Manage all your restaurant orders</span>
                                {myShopData?.name && (
                                    <>
                                        <span className='w-1 h-1 rounded-full bg-white/20' />
                                        <span className='text-[#ff6b35] font-medium text-xs bg-[#ff6b35]/10 px-2 py-0.5 rounded-full'>
                                            <FaStore size={10} className='inline mr-1' />
                                            {myShopData.name}
                                        </span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                    
                    <div className='flex items-center gap-3'>
                        <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5'>
                            <FaFire size={12} className='text-[#ff2d55]' />
                            <span className='text-white/40 text-xs'>
                                {stats.pending} pending
                            </span>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className='px-3 py-1.5 rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 border border-white/5 flex items-center gap-1.5 text-xs'
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <FaSync className={refreshing ? 'animate-spin' : ''} size={12} />
                            Refresh
                        </motion.button>
                    </div>
                </motion.div>

                {/* ✅ Stats Cards - Premium */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4 mb-8 ${fadeUp}`}
                    style={{ animationDelay: '0.1s' }}
                >
                    {[
                        { label: 'Total', value: stats.total, icon: <FaShoppingBag size={14} />, color: 'text-white/60', bg: 'bg-white/5' },
                        { label: 'Pending', value: stats.pending, icon: <FaHourglassHalf size={14} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                        { label: 'Preparing', value: stats.preparing, icon: <FaUtensils size={14} />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                        { label: 'Out for Delivery', value: stats.outForDelivery, icon: <FaTruck size={14} />, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                        { label: 'Delivered', value: stats.delivered, icon: <FaCheckCircle size={14} />, color: 'text-green-400', bg: 'bg-green-500/10' },
                        { label: 'Cancelled', value: stats.cancelled, icon: <FaTimesCircle size={14} />, color: 'text-red-400', bg: 'bg-red-500/10' }
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -4, scale: 1.02 }}
                            className={`glass-premium p-3 rounded-2xl border border-white/5 text-center transition-all duration-300 hover:border-${stat.color.replace('text-', '')}/30`}
                        >
                            <div className={`text-lg font-bold text-white`}>{stat.value}</div>
                            <div className={`text-[8px] font-medium uppercase tracking-wider ${stat.color}`}>
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ✅ Search & Filter - Premium */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`flex flex-col sm:flex-row gap-3 mb-6 ${fadeUp}`}
                    style={{ animationDelay: '0.2s' }}
                >
                    <div className='flex-1 relative group'>
                        <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-[#ff2d55]/5 to-[#ff6b35]/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500' />
                        <FaSearch size={16} className='absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#ff6b35] transition-colors duration-300' />
                        <input
                            type="text"
                            placeholder='Search orders by ID or customer...'
                            className='w-full bg-[#18181D] border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 text-sm relative z-10'
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
                                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                                    activeFilter === filter.id 
                                        ? 'bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white shadow-lg shadow-[#ff2d55]/20'
                                        : 'text-white/50 hover:text-white bg-white/5 hover:bg-white/10'
                                }`}
                                onClick={() => setActiveFilter(filter.id)}
                            >
                                {filter.icon} {filter.label}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* ✅ Orders List */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`space-y-4 ${fadeUp}`}
                    style={{ animationDelay: '0.3s' }}
                >
                    {filteredOrders.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className='glass-premium p-16 rounded-3xl border border-white/5 text-center relative overflow-hidden group'
                        >
                            <div className='absolute inset-0 bg-gradient-to-r from-[#ff2d55]/5 to-[#ff6b35]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700' />
                            <div className='relative z-10'>
                                <div className='w-24 h-24 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500'>
                                    <FaShoppingBag size={36} className='text-white/20' />
                                </div>
                                <h3 className='text-2xl font-semibold text-white mb-2'>No Orders Found</h3>
                                <p className='text-white/30 text-sm max-w-sm mx-auto'>
                                    {activeFilter !== 'all' 
                                        ? `No orders with status "${activeFilter}"`
                                        : 'No orders yet. Wait for customers to place orders!'}
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
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
                .animate-pulse {
                    animation: pulse 2s ease-in-out infinite;
                }
                .animation-delay-300 { animation-delay: 0.3s; }

                .glass-premium {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
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

                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    )
}

export default OwnerOrders