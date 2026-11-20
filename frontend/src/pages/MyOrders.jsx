import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../../config'
import { ClipLoader } from 'react-spinners'
import { 
    FaArrowLeft, FaReceipt, FaTruck, FaClock, 
    FaCheckCircle, FaTimesCircle, FaUtensils, FaMotorcycle,
    FaCalendar, FaTag, FaStore, FaRupeeSign, FaRedo,
    FaExclamationTriangle, FaDownload, FaQuestionCircle,
    FaCreditCard, FaMapMarkerAlt, FaKey, FaChevronRight,
    FaBox, FaSearch, FaFilter, FaTimes
} from 'react-icons/fa'
import { MdDeliveryDining, MdRestaurant } from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { addToCart } from '../redux/userSlice'
import Nav from '../components/Nav'
import Invoice from '../components/Invoice'
import CancelOrderModal from '../components/CancelOrderModal'

function MyOrders() {
    const { userData, socket } = useSelector(state => state.user)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('all') // 'all', 'active', 'delivered', 'cancelled'
    const [searchQuery, setSearchQuery] = useState('')
    
    // Modals
    const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null)
    const [selectedOrderForCancel, setSelectedOrderForCancel] = useState(null)
    const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null)
    const [refundModalOrder, setRefundModalOrder] = useState(null)
    const [refundReason, setRefundReason] = useState('')
    const [refundSubmitting, setRefundSubmitting] = useState(false)

    useEffect(() => {
        fetchOrders()
    }, [])

    // Real-time socket listener for order status & OTP updates
    useEffect(() => {
        if (!socket) return

        const handleStatusUpdate = (data) => {
            setOrders(prev => prev.map(ord => {
                if (ord._id === data.orderId) {
                    const updatedShopOrders = (ord.shopOrders || []).map(so => ({
                        ...so,
                        status: data.status || so.status
                    }))
                    return { ...ord, shopOrders: updatedShopOrders }
                }
                return ord
            }))
            toast.info(`Order #${data.orderId?.slice(-6)} status updated: ${data.status}`)
        }

        const handleOtp = ({ otp, orderId }) => {
            setOrders(prev => prev.map(ord => {
                if (ord._id === orderId) {
                    const updatedShopOrders = (ord.shopOrders || []).map(so => ({
                        ...so,
                        deliveryOtp: otp
                    }))
                    return { ...ord, shopOrders: updatedShopOrders }
                }
                return ord
            }))
            toast.info(`🔑 Delivery OTP for order #${orderId?.slice(-6)} is ${otp}`)
        }

        socket.on('order-status-update', handleStatusUpdate)
        socket.on('delivery-otp', handleOtp)

        return () => {
            socket.off('order-status-update', handleStatusUpdate)
            socket.off('delivery-otp', handleOtp)
        }
    }, [socket])

    const fetchOrders = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await axios.get(`${serverUrl}/api/order/my-orders?type=customer`, {
                withCredentials: true
            })
            setOrders(res.data || [])
        } catch (err) {
            console.error('Failed to load orders:', err)
            setError(err.response?.data?.message || 'Failed to load your orders')
        } finally {
            setLoading(false)
        }
    }

    const getOrderStatus = (order) => {
        if (!order?.shopOrders) return 'pending'
        if (Array.isArray(order.shopOrders)) {
            return order.shopOrders[0]?.status || 'pending'
        }
        return order.shopOrders.status || 'pending'
    }

    // Filter & Search Logic
    const filteredOrders = useMemo(() => {
        let list = orders

        // Tab filter
        if (activeTab === 'active') {
            list = list.filter(ord => {
                const s = getOrderStatus(ord)
                return ['pending', 'preparing', 'out of delivery'].includes(s)
            })
        } else if (activeTab === 'delivered') {
            list = list.filter(ord => getOrderStatus(ord) === 'delivered')
        } else if (activeTab === 'cancelled') {
            list = list.filter(ord => getOrderStatus(ord) === 'cancelled')
        }

        // Search Query (Order ID, Restaurant Name, Food Name)
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            list = list.filter(ord => {
                const idMatch = ord._id?.toLowerCase().includes(q) || ord.invoiceNumber?.toLowerCase().includes(q)
                const restMatch = ord.shopOrders?.some(so => so.shop?.name?.toLowerCase().includes(q))
                const itemMatch = ord.shopOrders?.some(so => 
                    so.shopOrderItems?.some(it => it.name?.toLowerCase().includes(q))
                )
                return idMatch || restMatch || itemMatch
            })
        }

        return list
    }, [orders, activeTab, searchQuery])

    // Order Actions
    const handleReorder = (order) => {
        const items = []
        ;(order.shopOrders || []).forEach(so => {
            ;(so.shopOrderItems || []).forEach(it => {
                items.push({
                    id: it.item?._id || it.item || it._id,
                    name: it.name,
                    price: it.price,
                    quantity: it.quantity || 1,
                    shop: so.shop?._id || so.shop,
                    image: it.item?.image || '',
                    foodType: it.item?.foodType || 'veg'
                })
            })
        })

        if (items.length === 0) {
            toast.error('Unable to reorder items from this order')
            return
        }

        items.forEach(it => dispatch(addToCart(it)))
        toast.success(`Added ${items.length} dishes to cart!`)
        navigate('/cart')
    }

    const handleRequestRefundSubmit = async () => {
        if (!refundReason.trim()) {
            toast.warning('Please describe the reason for your refund request')
            return
        }
        setRefundSubmitting(true)
        try {
            await axios.post(
                `${serverUrl}/api/order/refund-request/${refundModalOrder._id}`,
                { reason: refundReason },
                { withCredentials: true }
            )
            toast.success('Refund request submitted successfully! Support will review it shortly.')
            setRefundModalOrder(null)
            setRefundReason('')
            fetchOrders()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit refund request')
        } finally {
            setRefundSubmitting(false)
        }
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A'
        return new Date(dateStr).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'delivered':
                return { label: 'Delivered', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
            case 'out of delivery':
                return { label: 'Out for Delivery', color: 'text-[#FF8C00] bg-orange-500/10 border-orange-500/20' }
            case 'preparing':
                return { label: 'Food Preparing', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' }
            case 'cancelled':
                return { label: 'Cancelled', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' }
            default:
                return { label: 'Order Placed', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' }
        }
    }

    // 5-Stage Stepper calculation
    const getStepperActiveIndex = (status) => {
        switch (status) {
            case 'cancelled': return -1
            case 'pending': return 0 // Placed & Accepted
            case 'preparing': return 1 // Food Preparing
            case 'out of delivery': return 2 // Out for Delivery
            case 'delivered': return 3 // Delivered
            default: return 0
        }
    }

    return (
        <div 
            className="min-h-screen bg-[#0A090D] text-white pt-[90px] sm:pt-[84px] pb-24 overflow-x-hidden selection:bg-[#FF6B00] selection:text-white"
            style={{ fontFamily: "'Poppins', 'Segoe UI', system-ui, sans-serif" }}
        >
            <Nav />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
                
                {/* 1. Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3.5">
                        <button 
                            onClick={() => navigate('/home')}
                            className="w-10 h-10 rounded-xl bg-[#13121A] hover:bg-[#FF6B00] border border-white/10 hover:border-transparent text-white/80 hover:text-white flex items-center justify-center transition-all shadow-sm cursor-pointer"
                            title="Go to Home"
                        >
                            <FaArrowLeft size={14} />
                        </button>
                        
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    My Orders
                                </h1>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#FF6B00]/20 text-[#FF8C00] border border-orange-500/30">
                                    {orders.length}
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                                Authoritative records of your food orders, invoices & live tracking
                            </p>
                        </div>
                    </div>

                    {/* Quick Support Link */}
                    <button
                        onClick={() => navigate('/help')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#13121A] hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition cursor-pointer self-start sm:self-auto"
                    >
                        <FaQuestionCircle size={13} className="text-[#FF6B00]" />
                        <span>Order Help & Support</span>
                    </button>
                </div>

                {/* 2. Controls Bar: Tabs & Search */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1 p-1 bg-[#13121A] border border-white/10 rounded-2xl overflow-x-auto">
                        {[
                            { id: 'all', label: 'All Orders', count: orders.length },
                            { 
                                id: 'active', 
                                label: 'Active', 
                                count: orders.filter(o => ['pending', 'preparing', 'out of delivery'].includes(getOrderStatus(o))).length 
                            },
                            { 
                                id: 'delivered', 
                                label: 'Delivered', 
                                count: orders.filter(o => getOrderStatus(o) === 'delivered').length 
                            },
                            { 
                                id: 'cancelled', 
                                label: 'Cancelled', 
                                count: orders.filter(o => getOrderStatus(o) === 'cancelled').length 
                            }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                                    activeTab === tab.id
                                        ? 'bg-[#FF6B00] text-white shadow-md'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === tab.id ? 'bg-black/30' : 'bg-white/10'}`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative flex-1 md:max-w-xs">
                        <FaSearch size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search by order ID, restaurant, dish..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#13121A] border border-white/10 focus:border-[#FF6B00] rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none transition"
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

                {/* 3. Orders Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-28 space-y-3">
                        <ClipLoader size={46} color="#FF6B00" />
                        <p className="text-xs text-gray-400 animate-pulse">Loading authoritative order ledger...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-2xl text-center space-y-3 max-w-md mx-auto">
                        <FaExclamationTriangle size={32} className="text-red-400 mx-auto" />
                        <h3 className="text-base font-bold text-white">Failed to load orders</h3>
                        <p className="text-xs text-gray-400">{error}</p>
                        <button
                            onClick={fetchOrders}
                            className="px-5 py-2 rounded-xl bg-[#FF6B00] hover:bg-orange-600 text-white text-xs font-bold transition cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-[#13121A] border border-white/10 p-12 sm:p-16 rounded-3xl text-center max-w-md mx-auto space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF6B00]">
                            <FaReceipt size={28} />
                        </div>
                        <h3 className="text-lg font-black text-white">
                            {searchQuery ? 'No matching orders' : 'No orders in this view'}
                        </h3>
                        <p className="text-xs text-gray-400">
                            {searchQuery 
                                ? `No orders matched "${searchQuery}". Clear your search query to see all records.`
                                : 'You have not placed any orders matching this filter yet.'}
                        </p>
                        <button
                            onClick={() => navigate('/restaurants')}
                            className="px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-orange-600 text-white text-xs font-bold transition shadow-md cursor-pointer"
                        >
                            Explore Restaurants
                        </button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {filteredOrders.map((order, idx) => {
                            const status = getOrderStatus(order)
                            const statusBadge = getStatusBadge(status)
                            const isCancelled = status === 'cancelled'
                            const isDelivered = status === 'delivered'
                            const isOutForDelivery = status === 'out of delivery'
                            const canCancel = ['pending', 'preparing'].includes(status)
                            const stepperIdx = getStepperActiveIndex(status)

                            const firstShopOrder = order.shopOrders?.[0]
                            const restaurant = firstShopOrder?.shop
                            const deliveryBoy = firstShopOrder?.assignedDeliveryBoy
                            const deliveryOtp = firstShopOrder?.deliveryOtp

                            // Financial calculations (authoritative)
                            const subtotal = order.subtotal || firstShopOrder?.subtotal || 0
                            const discount = order.discountAmount || 0
                            const deliveryFee = order.deliveryFee ?? 0
                            const tax = order.taxAmount ?? 23
                            const total = order.totalAmount || 0

                            return (
                                <motion.div
                                    key={order._id || idx}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                                    className="bg-[#13121A] border border-white/[0.08] hover:border-white/20 rounded-2xl overflow-hidden shadow-xl transition-all"
                                >
                                    {/* Top Card Banner: ID, Date, Status & Payment Badge */}
                                    <div className="p-4 sm:p-5 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161520]">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            {/* Order ID */}
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Order ID</p>
                                                <p className="text-sm font-black text-white font-mono">
                                                    #{order._id?.slice(-8).toUpperCase()}
                                                </p>
                                            </div>

                                            {/* Invoice Number */}
                                            {order.invoiceNumber && (
                                                <div className="hidden sm:block border-l border-white/10 pl-3">
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Invoice</p>
                                                    <p className="text-xs font-mono text-gray-300">{order.invoiceNumber}</p>
                                                </div>
                                            )}

                                            {/* Date */}
                                            <div className="border-l border-white/10 pl-3">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Placed On</p>
                                                <p className="text-xs text-gray-300 flex items-center gap-1">
                                                    <FaCalendar size={10} className="text-[#FF6B00]" />
                                                    <span>{formatDate(order.createdAt)}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status & Payment Badges */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {/* Order Status Badge */}
                                            <span className={`px-3 py-1 rounded-full text-xs font-black border ${statusBadge.color}`}>
                                                {statusBadge.label}
                                            </span>

                                            {/* Payment Badge */}
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                order.paymentStatus === 'paid' || order.payment === true
                                                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                                                    : order.paymentStatus === 'refunded'
                                                        ? 'text-purple-400 bg-purple-500/10 border-purple-500/30'
                                                        : order.paymentMethod === 'cod'
                                                            ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                                                            : 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                                            }`}>
                                                {order.paymentStatus === 'refunded'
                                                    ? 'REFUNDED'
                                                    : order.payment === true || order.paymentStatus === 'paid'
                                                        ? 'ONLINE - PAID'
                                                        : order.paymentMethod === 'cod'
                                                            ? 'CASH ON DELIVERY'
                                                            : 'PAYMENT PENDING'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Main Card Body */}
                                    <div className="p-4 sm:p-5 space-y-5">
                                        
                                        {/* Restaurant Info & Ordered Items Strip */}
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                                            
                                            {/* Left: Restaurant Details */}
                                            <div className="lg:col-span-5 flex items-start gap-3.5">
                                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                                                    <img 
                                                        src={restaurant?.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop'} 
                                                        alt={restaurant?.name || 'Restaurant'}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                <div className="min-w-0">
                                                    <h3 className="text-base font-black text-white truncate">
                                                        {restaurant?.name || 'Cravely Kitchen'}
                                                    </h3>
                                                    <p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5">
                                                        <FaMapMarkerAlt size={10} className="text-[#FF6B00] flex-shrink-0" />
                                                        <span className="truncate">{restaurant?.address || 'Central Street'}, {restaurant?.city}</span>
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 mt-1">
                                                        Delivery to: <strong className="text-gray-300">{order.deliveryAddress?.street || order.address?.street || 'Delivery Address'}</strong>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Right: Itemized List Preview */}
                                            <div className="lg:col-span-7 bg-[#0A090D] p-3.5 rounded-xl border border-white/[0.06] space-y-2">
                                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                                                    <span>Ordered Items ({firstShopOrder?.shopOrderItems?.length || 0})</span>
                                                    <span className="text-gray-500">Unit Price</span>
                                                </p>
                                                
                                                <div className="divide-y divide-white/[0.04] max-h-32 overflow-y-auto pr-1">
                                                    {(firstShopOrder?.shopOrderItems || []).map((it, iIdx) => (
                                                        <div key={iIdx} className="py-1.5 flex items-center justify-between text-xs">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-4 h-4 rounded-full bg-white/10 text-[10px] font-black flex items-center justify-center text-white">
                                                                    {it.quantity}x
                                                                </span>
                                                                <span className="text-white font-medium truncate max-w-[200px] sm:max-w-xs">
                                                                    {it.name}
                                                                </span>
                                                            </div>
                                                            <span className="text-gray-300 font-mono font-semibold">
                                                                ₹{it.price * (it.quantity || 1)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Live Progress Stepper (Only for active / non-cancelled orders) */}
                                        {!isCancelled && (
                                            <div className="bg-[#0A090D] p-3.5 sm:p-4 rounded-xl border border-white/[0.06]">
                                                <div className="grid grid-cols-4 gap-2 text-center relative">
                                                    {[
                                                        { step: 'Placed', label: 'Order Placed', icon: FaReceipt },
                                                        { step: 'Preparing', label: 'Food Preparing', icon: FaUtensils },
                                                        { step: 'Out for Delivery', label: 'On The Way', icon: FaMotorcycle },
                                                        { step: 'Delivered', label: 'Delivered', icon: FaCheckCircle }
                                                    ].map((st, sIdx) => {
                                                        const isDone = stepperIdx >= sIdx
                                                        const isCurrent = stepperIdx === sIdx
                                                        const Icon = st.icon

                                                        return (
                                                            <div key={sIdx} className="flex flex-col items-center space-y-1 relative z-10">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                                                    isDone 
                                                                        ? 'bg-[#FF6B00] text-white shadow-md' 
                                                                        : 'bg-[#181722] text-gray-500 border border-white/10'
                                                                } ${isCurrent ? 'ring-2 ring-orange-500/50' : ''}`}>
                                                                    <Icon size={12} />
                                                                </div>
                                                                <p className={`text-[11px] font-bold ${isDone ? 'text-white' : 'text-gray-500'}`}>
                                                                    {st.label}
                                                                </p>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Rider & Live OTP Strip (if assigned) */}
                                        {deliveryBoy && !isCancelled && !isDelivered && (
                                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                                        <FaMotorcycle size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-white flex items-center gap-2">
                                                            <span>Delivery Partner: {deliveryBoy.fullName || 'Rider Assigned'}</span>
                                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                                        </p>
                                                        <p className="text-[11px] text-gray-400">Phone: {deliveryBoy.mobile || 'Confidential'}</p>
                                                    </div>
                                                </div>

                                                {deliveryOtp && isOutForDelivery && (
                                                    <div className="bg-[#0A090D] px-3.5 py-1.5 rounded-xl border border-emerald-500/40 flex items-center gap-2 self-start sm:self-auto">
                                                        <FaKey size={12} className="text-amber-400" />
                                                        <span className="text-xs text-gray-400">Delivery OTP:</span>
                                                        <span className="text-sm font-black font-mono text-emerald-400 tracking-widest">{deliveryOtp}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Authoritative Financial Breakdown Bar */}
                                        <div className="pt-2 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
                                            <div className="flex items-center gap-3 sm:gap-6 flex-wrap text-gray-400">
                                                <span>Subtotal: <strong className="text-white font-mono">₹{subtotal}</strong></span>
                                                {discount > 0 && (
                                                    <span className="text-emerald-400">Coupon Discount: <strong className="font-mono">-₹{discount}</strong></span>
                                                )}
                                                <span>Delivery: <strong className="text-white font-mono">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</strong></span>
                                                <span>GST Taxes: <strong className="text-white font-mono">₹{tax}</strong></span>
                                            </div>

                                            <div className="flex items-center gap-2 text-base font-black text-white">
                                                <span>Total Bill:</span>
                                                <span className="text-[#FF8C00] font-mono">₹{total}</span>
                                            </div>
                                        </div>

                                        {/* 8 Order Actions Row */}
                                        <div className="pt-3 border-t border-white/[0.08] flex flex-wrap items-center gap-2">
                                            
                                            {/* Action 1: Track Order (if active) */}
                                            {!isDelivered && !isCancelled && (
                                                <button
                                                    onClick={() => navigate(`/track-order/${order._id}`)}
                                                    className="px-3.5 py-2 rounded-xl bg-[#FF6B00] hover:bg-orange-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                                                >
                                                    <FaTruck size={11} />
                                                    <span>Track Order</span>
                                                </button>
                                            )}

                                            {/* Action 2: Download Invoice */}
                                            <button
                                                onClick={() => setSelectedOrderForInvoice(order)}
                                                className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <FaDownload size={11} className="text-[#FF6B00]" />
                                                <span>Invoice</span>
                                            </button>

                                            {/* Action 3: Reorder */}
                                            <button
                                                onClick={() => handleReorder(order)}
                                                className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <FaRedo size={10} className="text-amber-400" />
                                                <span>Reorder</span>
                                            </button>

                                            {/* Action 4: View Payment Details */}
                                            <button
                                                onClick={() => setSelectedOrderForPayment(order)}
                                                className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <FaCreditCard size={11} className="text-sky-400" />
                                                <span>Payment Details</span>
                                            </button>

                                            {/* Action 5: Contact Support */}
                                            <button
                                                onClick={() => navigate('/help')}
                                                className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <FaQuestionCircle size={11} className="text-gray-400" />
                                                <span>Support</span>
                                            </button>

                                            {/* Action 6: Cancel Order (if eligible) */}
                                            {canCancel && (
                                                <button
                                                    onClick={() => setSelectedOrderForCancel(order)}
                                                    className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ml-auto"
                                                >
                                                    <FaTimesCircle size={11} />
                                                    <span>Cancel Order</span>
                                                </button>
                                            )}

                                            {/* Action 7: Request Refund (if delivered or disputed) */}
                                            {isDelivered && (
                                                <button
                                                    onClick={() => setRefundModalOrder(order)}
                                                    className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-gray-300 hover:text-rose-400 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ml-auto"
                                                >
                                                    <span>Request Refund</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* 1. Authoritative Invoice Modal */}
            {selectedOrderForInvoice && (
                <Invoice 
                    order={selectedOrderForInvoice} 
                    onClose={() => setSelectedOrderForInvoice(null)} 
                />
            )}

            {/* 2. Cancel Order Modal */}
            {selectedOrderForCancel && (
                <CancelOrderModal
                    isOpen={Boolean(selectedOrderForCancel)}
                    orderId={selectedOrderForCancel}
                    onClose={() => setSelectedOrderForCancel(null)}
                    onCancelled={() => {
                        setSelectedOrderForCancel(null)
                        fetchOrders()
                    }}
                />
            )}

            {/* 3. Payment Details Modal */}
            <AnimatePresence>
                {selectedOrderForPayment && (
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setSelectedOrderForPayment(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#13121A] border border-white/15 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl text-white"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <FaCreditCard className="text-[#FF6B00]" size={16} />
                                    <h3 className="text-base font-black text-white">Payment & Settlement Details</h3>
                                </div>
                                <button 
                                    onClick={() => setSelectedOrderForPayment(null)}
                                    className="text-gray-400 hover:text-white text-xs cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-2.5 text-xs">
                                <div className="flex justify-between py-1 border-b border-white/5">
                                    <span className="text-gray-400">Transaction ID / Razorpay ID</span>
                                    <span className="font-mono text-gray-200">{selectedOrderForPayment.transactionId || 'N/A (Cash on Delivery)'}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-white/5">
                                    <span className="text-gray-400">Payment Method</span>
                                    <span className="font-bold text-white uppercase">{selectedOrderForPayment.paymentMethod || 'Online'}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-white/5">
                                    <span className="text-gray-400">Payment Status</span>
                                    <span className="font-bold text-emerald-400 uppercase">{selectedOrderForPayment.paymentStatus || 'Paid'}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-white/5">
                                    <span className="text-gray-400">Amount Paid</span>
                                    <span className="font-mono font-bold text-white">₹{selectedOrderForPayment.amountPaid ?? selectedOrderForPayment.totalAmount}</span>
                                </div>
                                {selectedOrderForPayment.amountRefunded > 0 && (
                                    <div className="flex justify-between py-1 border-b border-white/5">
                                        <span className="text-gray-400">Amount Refunded</span>
                                        <span className="font-mono font-bold text-purple-400">₹{selectedOrderForPayment.amountRefunded}</span>
                                    </div>
                                )}
                                <div className="flex justify-between py-1 border-b border-white/5">
                                    <span className="text-gray-400">Invoice Number</span>
                                    <span className="font-mono text-gray-300">{selectedOrderForPayment.invoiceNumber || 'N/A'}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedOrderForPayment(null)}
                                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer"
                            >
                                Close
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 4. Request Refund Modal */}
            <AnimatePresence>
                {refundModalOrder && (
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setRefundModalOrder(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#13121A] border border-white/15 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl text-white"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-white/10">
                                <h3 className="text-base font-black text-white">Request Refund for Order</h3>
                                <button 
                                    onClick={() => setRefundModalOrder(null)}
                                    className="text-gray-400 hover:text-white text-xs cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            <p className="text-xs text-gray-400">
                                Order #{refundModalOrder._id?.slice(-8).toUpperCase()} • Total: <strong className="text-white">₹{refundModalOrder.totalAmount}</strong>
                            </p>

                            <div>
                                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                                    Reason for Refund:
                                </label>
                                <textarea
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    placeholder="Please provide details (e.g., missing items, spoiled food, wrong dish)..."
                                    rows={4}
                                    className="w-full bg-[#0A090D] border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF6B00]"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <button
                                    onClick={() => setRefundModalOrder(null)}
                                    className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRequestRefundSubmit}
                                    disabled={refundSubmitting}
                                    className="flex-1 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    {refundSubmitting ? <ClipLoader size={12} color="#fff" /> : 'Submit Request'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default MyOrders
