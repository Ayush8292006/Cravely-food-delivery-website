import React, { useEffect, useState } from 'react'
import { IoArrowBack } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { setMyOrders, updateRealtimeOrderStatus } from '../redux/userSlice';
import axios from 'axios';
import { serverUrl } from '../../config';
import { ClipLoader } from 'react-spinners';
import { 
    FaFilter, FaTimes, FaShoppingBag, FaBox, FaClock, 
    FaCheckCircle, FaTruck, FaUtensils, FaMotorcycle,
    FaCalendar, FaTag, FaStore, FaRupeeSign, FaChevronRight,
    FaExclamationTriangle, FaCrown
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import CancelOrderModal from '../components/CancelOrderModal';
import OrderDetailModal from '../components/OrderDetailModal';

function MyOrders() {
    const { userData, myOrders, socket } = useSelector(state => state.user)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isLoaded, setIsLoaded] = useState(false)
    
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

    const getOrderStatus = (order) => {
        if (!order?.shopOrders) return 'pending'
        if (Array.isArray(order.shopOrders)) {
            return order.shopOrders[0]?.status || 'pending'
        }
        return order.shopOrders.status || 'pending'
    }

    const getStatusInfo = (status) => {
        const map = {
            'pending': { 
                label: 'Pending', 
                color: 'text-amber-600', 
                bg: 'bg-amber-50', 
                border: 'border-amber-200',
                dot: 'bg-amber-500'
            },
            'preparing': { 
                label: 'Preparing', 
                color: 'text-blue-600', 
                bg: 'bg-blue-50', 
                border: 'border-blue-200',
                dot: 'bg-blue-500'
            },
            'out of delivery': { 
                label: 'Out for Delivery', 
                color: 'text-orange-600', 
                bg: 'bg-orange-50', 
                border: 'border-orange-200',
                dot: 'bg-orange-500'
            },
            'delivered': { 
                label: 'Delivered', 
                color: 'text-emerald-600', 
                bg: 'bg-emerald-50', 
                border: 'border-emerald-200',
                dot: 'bg-emerald-500'
            },
            'cancelled': { 
                label: 'Cancelled', 
                color: 'text-red-600', 
                bg: 'bg-red-50', 
                border: 'border-red-200',
                dot: 'bg-red-500'
            }
        }
        return map[status] || map['pending']
    }

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 250)
    }, [])

    useEffect(() => {
        fetchOrders()
    }, [filters])

    useEffect(() => {
        if (!socket) return

        const handleNewOrder = (data) => {
            if (data.shopOrders?.owner?._id == userData?._id) {
                dispatch(setMyOrders([data, ...myOrders]))
                fetchOrders()
            }
        }

        const handleStatusUpdate = ({ orderId, shopId, status, userId }) => {
            if (userId == userData?._id) {
                dispatch(updateRealtimeOrderStatus({ orderId, shopId, status }))
                fetchOrders()
            }
        }

        socket.on('newOrder', handleNewOrder)
        socket.on('update-status', handleStatusUpdate)

        return () => {
            socket.off('newOrder', handleNewOrder)
            socket.off('update-status', handleStatusUpdate)
        }
    }, [socket, userData, myOrders, dispatch])

    const fetchOrders = async () => {
        setLoading(true)
        setError(null)
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
            
            setFilteredOrders(result.data.orders || [])
            setLoading(false)
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to fetch orders'
            setError(errorMsg)
            toast.error(errorMsg)
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

    const handleCancelled = () => {
        fetchOrders()
        toast.success('Order cancelled successfully!')
    }

    const openDetailModal = (order) => {
        setSelectedOrder(order)
        setDetailModalOpen(true)
    }

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath
        if (imagePath.startsWith('/')) return `${serverUrl}${imagePath}`
        return `${serverUrl}/uploads/${imagePath}`
    }

    const handleImageError = (key) => {
        setImageErrors(prev => ({ ...prev, [key]: true }))
    }

    const totalOrders = filteredOrders.length
    const pendingOrders = filteredOrders.filter(o => getOrderStatus(o) === 'pending').length
    const preparingOrders = filteredOrders.filter(o => getOrderStatus(o) === 'preparing').length
    const outForDeliveryOrders = filteredOrders.filter(o => getOrderStatus(o) === 'out of delivery').length
    const deliveredOrders = filteredOrders.filter(o => getOrderStatus(o) === 'delivered').length

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleString('en-GB', {
            day: "2-digit",
            month: "short",
            year: "numeric"
        })
    }

    if (loading) {
        return (
            <div className='min-h-screen bg-[#fafafa] flex items-center justify-center'>
                <div className='flex flex-col items-center gap-5'>
                    <div className='relative'>
                        <ClipLoader size={42} color="#d97706" />
                    </div>
                    <p className='text-gray-500 text-sm font-medium tracking-wide'>Loading your orders...</p>
                </div>
            </div>
        )
    }

    return (
        <div 
            className='min-h-screen bg-[#fafafa] relative'
            style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-track { background: #f1f1f1; }
                ::-webkit-scrollbar-thumb { 
                    background: #d97706; 
                    border-radius: 10px; 
                }
            `}</style>

            {/* Premium top bar */}
            <div className='h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500' />

            <div className='relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-7 sm:py-9'>
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className='flex items-center gap-4 mb-8'
                >
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className='w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:border-orange-300 hover:shadow-md transition-all shadow-sm'
                        onClick={() => navigate("/")}
                    >
                        <IoArrowBack size={18} className='text-gray-600' />
                    </motion.button>
                    
                    <div className='flex-1'>
                        <div className='flex items-center gap-3'>
                            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight'>
                                My Orders
                            </h1>
                            <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 400, delay: 0.15 }}
                                className='text-xs bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2.5 py-1 rounded-full font-semibold shadow-sm shadow-orange-200'
                            >
                                {totalOrders}
                            </motion.span>
                        </div>
                        <p className='text-gray-500 text-sm mt-0.5 flex items-center gap-2'>
                            Track & manage all your orders
                            {outForDeliveryOrders > 0 && (
                                <span className='inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100'>
                                    <span className='w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse' />
                                    {outForDeliveryOrders} active
                                </span>
                            )}
                        </p>
                    </div>
                </motion.div>

                {/* Error */}
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='bg-amber-100 border border-red-200 p-4 rounded-2xl text-center mb-5'
                    >
                        <FaExclamationTriangle size={20} className='text-red-500 mx-auto mb-2' />
                        <p className='text-gray-700 text-sm'>{error}</p>
                        <button 
                            onClick={fetchOrders}
                            className='mt-3 px-4 py-1.5 rounded-lg bg-red-100 text-red-600 text-sm font-medium hover:bg-red-200 transition'
                        >
                            Try Again
                        </button>
                    </motion.div>
                )}

                {/* Stats */}
                <motion.div 
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6'
                >
                    {[
                        { label: 'Total', value: totalOrders, icon: <FaShoppingBag size={13} />, color: 'text-gray-800', bg: 'bg-white' },
                        { label: 'Pending', value: pendingOrders, icon: <FaClock size={13} />, color: 'text-amber-600', bg: 'bg-amber-50/80' },
                        { label: 'Preparing', value: preparingOrders, icon: <FaUtensils size={13} />, color: 'text-blue-600', bg: 'bg-blue-50/80' },
                        { label: 'On the Way', value: outForDeliveryOrders, icon: <FaTruck size={13} />, color: 'text-orange-600', bg: 'bg-orange-50/80' },
                        { label: 'Delivered', value: deliveredOrders, icon: <FaCheckCircle size={13} />, color: 'text-emerald-600', bg: 'bg-emerald-50/80' }
                    ].map((stat, idx) => (
                        <motion.div 
                            key={idx}
                            whileHover={{ y: -4 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                            className={`${stat.bg} border border-gray-200/80 rounded-2xl p-4 text-center hover:border-orange-200 hover:shadow-md transition-all`}
                        >
                            <div className={`${stat.color} mb-2 flex justify-center opacity-80`}>
                                {stat.icon}
                            </div>
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                            <p className='text-gray-400 text-[10px] uppercase tracking-wider font-medium mt-1'>{stat.label}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Filters */}
                <motion.div 
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className='bg-amber-100 border border-gray-200 rounded-2xl p-4 mb-5 shadow-sm'
                >
                    <div className='flex flex-wrap items-center justify-between gap-3'>
                        <button
                            className='flex items-center gap-2 text-gray-600 hover:text-gray-900 transition text-sm font-medium'
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <div className={`p-2 rounded-lg transition-all ${showFilters ? 'bg-amber-100 text-orange-600' : 'bg-black text-gray-500'}`}>
                                <FaFilter size={12} />
                            </div>
                            <span>{showFilters ? 'Hide Filters' : 'Filter Orders'}</span>
                        </button>
                        
                        <div className='flex items-center gap-3'>
                            {(filters.status !== 'all' || filters.paymentMethod !== 'all' || filters.startDate || filters.endDate) && (
                                <button
                                    className='flex items-center gap-1.5 text-black hover:text-red-500 transition text-xs font-medium px-2.5 py-1 rounded-full bg-gray-50'
                                    onClick={clearFilters}
                                >
                                    <FaTimes size={10} /> Clear
                                </button>
                            )}
                            <span className='text-black text-xs font-medium'>
                                {totalOrders} {totalOrders === 1 ? 'order' : 'orders'}
                            </span>
                        </div>
                    </div>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                className='overflow-hidden'
                            >
                                <div className='mt-4 pt-4 border-t bg-amber-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
                                    <div>
                                        <label className='block text-gray-400 text-[10px] font-semibold mb-1.5 tracking-wider uppercase'>Status</label>
                                        <select
                                            name="status"
                                            value={filters.status}
                                            onChange={handleFilterChange}
                                            className='w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 text-sm focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition cursor-pointer'
                                        >
                                            <option value="all">All Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="preparing">Preparing</option>
                                            <option value="out of delivery">Out for Delivery</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className='block text-gray-400 text-[10px] font-semibold mb-1.5 tracking-wider uppercase'>Payment</label>
                                        <select
                                            name="paymentMethod"
                                            value={filters.paymentMethod}
                                            onChange={handleFilterChange}
                                            className='w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 text-sm focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition cursor-pointer'
                                        >
                                            <option value="all">All</option>
                                            <option value="cod">Cash on Delivery</option>
                                            <option value="online">Online</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className='block text-gray-400 text-[10px] font-semibold mb-1.5 tracking-wider uppercase'>From</label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={filters.startDate}
                                            onChange={handleFilterChange}
                                            className='w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 text-sm focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition'
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-gray-400 text-[10px] font-semibold mb-1.5 tracking-wider uppercase'>To</label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={filters.endDate}
                                            onChange={handleFilterChange}
                                            className='w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 text-sm focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition'
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Orders List */}
                <div className='space-y-3'>
                    {filteredOrders.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className='bg-amber-100 border border-gray-200 rounded-2xl p-14 text-center shadow-sm'
                        >
                            <div className='w-20 h-20 mx-auto mb-4 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center'>
                                <FaUtensils size={28} className='text-gray-300' />
                            </div>
                            <h3 className='text-xl font-bold text-gray-800 mb-1.5'>No orders found</h3>
                            <p className='text-gray-400 text-sm max-w-xs mx-auto'>Try changing filters or explore restaurants</p>
                            <motion.button 
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className='mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold transition shadow-md shadow-orange-200'
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
                            const firstShop = order.shopOrders?.[0] || order.shopOrders
                            const restaurant = firstShop?.shop
                            const deliveryBoy = firstShop?.assignedDeliveryBoy
                            
                            const shopImage = restaurant?.image ? getImageUrl(restaurant.image) : null
                            const imageKey = `shop_${restaurant?._id || index}`
                            const showImage = shopImage && !imageErrors[imageKey]
                            
                            return (
                                <motion.div 
                                    key={order._id || index} 
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.04, type: 'spring', stiffness: 280 }}
                                    whileHover={{ y: -3 }}
                                    className='bg-gray-200 border border-amber-100 rounded-2xl p-4 sm:p-5 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-50 transition-all cursor-pointer group'
                                    onClick={() => openDetailModal(order)}
                                >
                                    <div className='flex items-center gap-4'>
                                        {/* Image */}
                                        <div className='flex-shrink-0 relative'>
                                            {showImage ? (
                                                <img 
                                                    src={shopImage}
                                                    alt={restaurant?.name || 'Restaurant'}
                                                    className='w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-gray-200 group-hover:border-orange-200 transition-all'
                                                    onError={() => handleImageError(imageKey)}
                                                />
                                            ) : (
                                                <div className='w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center'>
                                                    <FaStore className='text-gray-400 text-xl' />
                                                </div>
                                            )}
                                            {(isOutForDelivery || isDelivered || isCancelled) && (
                                                <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${statusInfo.dot} ${isOutForDelivery ? 'animate-pulse' : ''}`} />
                                            )}
                                        </div>
                                        
                                        {/* Info */}
                                        <div className='flex-1 min-w-0'>
                                            <div className='flex items-center gap-2 flex-wrap mb-1'>
                                                <h4 className='text-gray-900 font-semibold text-sm sm:text-base truncate'>
                                                    {restaurant?.name || 'Cravely'}
                                                </h4>
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.color} border ${statusInfo.border}`}>
                                                    {statusInfo.label}
                                                </span>
                                                {deliveryBoy && !isCancelled && !isDelivered && (
                                                    <span className='text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200'>
                                                        <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
                                                        Live
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className='flex items-center gap-2 text-xs text-gray-500 flex-wrap'>
                                                <span className='flex items-center gap-1'>
                                                    <FaCalendar size={9} className="text-gray-400" />
                                                    {formatDate(order.createdAt)}
                                                </span>
                                                <span className='w-1 h-1 rounded-full bg-gray-300' />
                                                <span className='flex items-center gap-1'>
                                                    <FaBox size={9} className="text-gray-400" />
                                                    {firstShop?.shopOrderItems?.length || 0} items
                                                </span>
                                                <span className='w-1 h-1 rounded-full bg-gray-300' />
                                                <span className='flex items-center gap-1 font-semibold text-gray-800'>
                                                    <FaRupeeSign size={9} />
                                                    {order.totalAmount || firstShop?.subtotal || 0}
                                                </span>
                                            </div>
                                            
                                            <div className='flex items-center gap-2 mt-1 text-xs text-gray-400 flex-wrap'>
                                                <span className='flex items-center gap-1'>
                                                    <FaTag size={9} />
                                                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                                                </span>
                                                {deliveryBoy && !isCancelled && !isDelivered && (
                                                    <>
                                                        <span className='w-1 h-1 rounded-full bg-gray-300' />
                                                        <span className='flex items-center gap-1 text-gray-500'>
                                                            <FaMotorcycle size={9} className="text-orange-500" />
                                                            {deliveryBoy.fullName}
                                                        </span>
                                                    </>
                                                )}
                                                {isOutForDelivery && (
                                                    <>
                                                        <span className='w-1 h-1 rounded-full bg-gray-300' />
                                                        <span className='text-orange-600 flex items-center gap-1 font-medium animate-pulse'>
                                                            <FaTruck size={9} /> On the way
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className='text-gray-300 group-hover:text-orange-500 transition-colors'>
                                            <FaChevronRight size={16} />
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })
                    )}
                </div>

                {/* Footer */}
                <div className='mt-10 text-center'>
                    <p className='text-gray-400 text-xs font-medium flex items-center justify-center gap-2'>
                        <span className='w-8 h-px bg-gray-200' />
                        <FaCrown size={10} className='text-amber-400' />
                        <span>Orders Management</span>
                        <FaCrown size={10} className='text-amber-400' />
                        <span className='w-8 h-px bg-gray-200' />
                    </p>
                </div>
            </div>

            <CancelOrderModal
                isOpen={cancelModalOpen}
                onClose={() => {
                    setCancelModalOpen(false)
                    setSelectedOrderId(null)
                }}
                orderId={selectedOrderId}
                onCancelled={handleCancelled}
            />

            <OrderDetailModal
                isOpen={detailModalOpen}
                onClose={() => {
                    setDetailModalOpen(false)
                    setSelectedOrder(null)
                }}
                order={selectedOrder}
                onCancelOrder={handleCancelOrder}
            />
        </div>
    )
}

export default MyOrders