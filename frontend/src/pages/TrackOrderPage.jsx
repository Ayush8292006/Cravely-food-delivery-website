import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../../config'
import { toast } from 'react-toastify'
import { ClipLoader } from 'react-spinners'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    FaMapMarkerAlt, 
    FaTruck, 
    FaClock, 
    FaCheckCircle, 
    FaSync,        // ✅ Changed from FaRefresh
    FaHome,
    FaPhone,
    FaWhatsapp,
    FaStore,
    FaArrowLeft,
    FaBox,
    FaRupeeSign,
    FaInfoCircle,
    FaStar,
    FaMotorcycle,
    FaTimesCircle
} from 'react-icons/fa'
import { MdDeliveryDining } from 'react-icons/md'


function TrackOrderPage() {
    const { orderId } = useParams()
    const navigate = useNavigate()
    const { socket } = useSelector(state => state.user)
    const [liveLocations, setLiveLocations] = useState({})
    const [currentOrder, setCurrentOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const socketListenerRef = useRef(null)

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 300)
    }, [])

    const handleGetOrder = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const result = await axios.get(`${serverUrl}/api/order/get-order-by-id/${orderId}`, { withCredentials: true })
            setCurrentOrder(result.data)
        } catch (error) {
            console.log('Track order error:', error)
            const errorMsg = error.response?.data?.message || 'Failed to load order'
            setError(errorMsg)
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }, [orderId])

    // ✅ Socket listener with ref
    useEffect(() => {
        if (!socket) return

        const handleLocationUpdate = ({ deliveryBoyId, latitude, longitude }) => {
            setLiveLocations(prev => ({
                ...prev,
                [deliveryBoyId]: { lat: latitude, lon: longitude }
            }))
        }

        socket.on('updateDeliveryLocation', handleLocationUpdate)
        socketListenerRef.current = handleLocationUpdate

        return () => {
            if (socketListenerRef.current) {
                socket.off('updateDeliveryLocation', socketListenerRef.current)
            }
        }
    }, [socket])

    useEffect(() => {
        handleGetOrder()
    }, [handleGetOrder])

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
            case 'preparing': return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
            case 'out of delivery': return 'text-orange-400 bg-orange-500/10 border-orange-500/20'
            case 'delivered': return 'text-green-400 bg-green-500/10 border-green-500/20'
            case 'cancelled': return 'text-red-400 bg-red-500/10 border-red-500/20'
            default: return 'text-white/40 bg-white/5 border-white/5'
        }
    }

    const getStatusIcon = (status) => {
        switch(status) {
            case 'pending': return <FaClock className="text-yellow-400" />
            case 'preparing': return <FaUtensils className="text-blue-400" />
            case 'out of delivery': return <FaTruck className="text-orange-400" />
            case 'delivered': return <FaCheckCircle className="text-green-400" />
            case 'cancelled': return <FaTimesCircle className="text-red-400" />
            default: return null
        }
    }

    // ✅ Get status label for display
    const getStatusLabel = (status) => {
        switch(status) {
            case 'pending': return 'Pending'
            case 'preparing': return 'Preparing'
            case 'out of delivery': return 'Out for Delivery'
            case 'delivered': return 'Delivered'
            case 'cancelled': return 'Cancelled'
            default: return status || 'Unknown'
        }
    }

    const fadeUp = `transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`

    if (loading) {
        return (
            <div className='min-h-screen bg-[#0a0a0f] flex items-center justify-center'>
                <div className='flex flex-col items-center gap-4'>
                    <div className='relative'>
                        <ClipLoader size={60} color="#ff2d55" />
                        <div className='absolute inset-0 animate-ping rounded-full border-2 border-[#ff2d55]/20' />
                        <div className='absolute inset-[-10px] rounded-full border border-[#ff6b35]/10 animate-spin-slow' />
                    </div>
                    <p className='text-white/40 text-sm animate-pulse flex items-center gap-2'>
                        <span className='w-1.5 h-1.5 rounded-full bg-[#ff2d55]/40 animate-pulse' />
                        Loading your order...
                        <span className='w-1.5 h-1.5 rounded-full bg-[#ff6b35]/40 animate-pulse animation-delay-300' />
                    </p>
                </div>
            </div>
        )
    }

    // ✅ Show error state
    if (error || !currentOrder) {
        return (
            <div className='min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4'>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='text-center max-w-md'
                >
                    <div className='w-24 h-24 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4'>
                        <FaTimesCircle className='text-red-400 text-5xl' />
                    </div>
                    <h2 className='text-2xl font-bold text-white mb-2'>Order Not Found</h2>
                    <p className='text-white/40 text-sm mb-6'>
                        {error || "We couldn't find this order. It may have been removed or the ID is incorrect."}
                    </p>
                    <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleGetOrder}
                            className='px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white font-medium flex items-center justify-center gap-2'
                        >
                            <FaRefresh size={14} />
                            Retry
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/my-orders')}
                            className='px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white transition'
                        >
                            View My Orders
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-[#0a0a0f] relative overflow-hidden'>
            
            {/* Animated Background Orbs */}
            <div className='absolute inset-0 pointer-events-none'>
                <div className='absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#ff2d55]/5 rounded-full blur-3xl animate-float-3d' />
                <div className='absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#ff6b35]/5 rounded-full blur-3xl animate-float-3d animation-delay-300' />
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ffd93d]/3 rounded-full blur-3xl animate-float-3d animation-delay-600' />
            </div>

            <div className='relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-6'>
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`flex items-center justify-between gap-4 mb-6 ${fadeUp}`}
                >
                    <div className='flex items-center gap-4'>
                        <motion.button 
                            whileHover={{ scale: 1.05, rotate: -5 }}
                            whileTap={{ scale: 0.95 }}
                            className='w-11 h-11 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#12121f] flex items-center justify-center hover:bg-white/10 transition-all duration-300 border border-white/10 group shadow-lg shadow-black/20'
                            onClick={() => navigate("/my-orders")}
                        >
                            <IoArrowBack size={22} className='text-white/60 group-hover:text-white transition' />
                        </motion.button>
                        <div>
                            <h1 className='text-2xl sm:text-3xl font-bold text-white flex items-center gap-3'>
                                <span className='text-gradient-animated'>Track Order</span>
                                <span className='text-xs bg-gradient-to-r from-[#ff2d55]/20 to-[#ff6b35]/20 px-2.5 py-0.5 rounded-full text-[#ff6b35] border border-[#ff6b35]/20'>
                                    #{orderId?.slice(-6)}
                                </span>
                            </h1>
                            <p className='text-white/30 text-sm flex items-center gap-2'>
                                <FaLocationArrow size={12} className='text-[#ff6b35]' />
                                Real-time tracking of your order
                            </p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05, rotate: 45 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleGetOrder}
                        className='p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white/70 transition'
                        title="Refresh"
                    >
                        <FaRefresh size={16} />
                    </motion.button>
                </motion.div>

                {/* Order Cards */}
                {currentOrder?.shopOrders?.map((shopOrder, index) => {
                    const status = shopOrder.status || 'pending'
                    const statusInfo = getStatusColor(status)
                    const isDelivered = status === 'delivered'
                    const assignedBoy = shopOrder.assignedDeliveryBoy
                    const isOutForDelivery = status === 'out of delivery'

                    return (
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={index}
                            className={`glass-premium-ultra rounded-2xl border border-white/5 p-6 mb-6 ${fadeUp}`}
                        >
                            {/* Shop Header */}
                            <div className='flex items-start justify-between mb-4 pb-4 border-b border-white/5'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff2d55]/20 to-[#ff6b35]/20 flex items-center justify-center'>
                                        <FaStore className='text-[#ff6b35] text-xl' />
                                    </div>
                                    <div>
                                        <h2 className='text-xl font-bold text-white'>
                                            {shopOrder.shop?.name || 'Restaurant'}
                                            <MdVerified size={14} className='inline ml-1 text-blue-400' />
                                        </h2>
                                        <p className='text-white/30 text-xs flex items-center gap-1'>
                                            <FaClock size={10} className='text-[#ff6b35]' />
                                            Order #{currentOrder._id?.slice(-6)}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Status Badge */}
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${statusInfo}`}>
                                    {getStatusIcon(status)}
                                    <span className='text-xs font-medium capitalize'>{getStatusLabel(status)}</span>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className='mb-4'>
                                <p className='text-white/40 text-xs font-medium uppercase tracking-wider mb-2'>Items</p>
                                <div className='flex flex-wrap gap-2'>
                                    {shopOrder.shopOrderItems?.map((item, idx) => (
                                        <span key={idx} className='text-white/70 text-sm bg-white/5 px-3 py-1 rounded-full border border-white/5'>
                                            {item.name} 
                                            <span className='text-white/30 text-[10px] ml-1'>x{item.quantity}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Order Details Grid */}
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 p-3 rounded-xl bg-white/5 border border-white/5'>
                                <div className='flex items-center gap-2 text-sm'>
                                    <FaRupeeSign className='text-[#ff6b35]' />
                                    <span className='text-white/40'>Subtotal:</span>
                                    <span className='text-white font-semibold'>₹{shopOrder.subtotal}</span>
                                </div>
                                <div className='flex items-center gap-2 text-sm'>
                                    <FaMapMarkerAlt className='text-[#ff6b35]' />
                                    <span className='text-white/40'>Delivery:</span>
                                    <span className='text-white/70 text-xs truncate'>{currentOrder.deliveryAddress?.text}</span>
                                </div>
                                {currentOrder.deliveryFee > 0 && (
                                    <div className='flex items-center gap-2 text-sm'>
                                        <FaTruck className='text-[#ff6b35]' />
                                        <span className='text-white/40'>Delivery Fee:</span>
                                        <span className='text-white/70 text-xs'>₹{currentOrder.deliveryFee}</span>
                                    </div>
                                )}
                            </div>

                            {/* Delivery Boy Section */}
                            {!isDelivered && status !== 'cancelled' ? (
                                <div className='mt-4 p-4 rounded-xl bg-gradient-to-r from-[#ff2d55]/5 to-[#ff6b35]/5 border border-white/5'>
                                    {assignedBoy ? (
                                        <div className='flex flex-col sm:flex-row sm:items-center gap-3'>
                                            <div className='flex items-center gap-3 flex-1'>
                                                <div className='w-12 h-12 rounded-full bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center shadow-lg shadow-[#ff2d55]/20'>
                                                    <FaMotorcycle className='text-white text-xl' />
                                                </div>
                                                <div>
                                                    <p className='text-white font-semibold flex items-center gap-2'>
                                                        {assignedBoy.fullName}
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                                            isOutForDelivery 
                                                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20 animate-pulse' 
                                                                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
                                                        }`}>
                                                            {isOutForDelivery ? '🟡 On the way' : '⏳ Assigned'}
                                                        </span>
                                                    </p>
                                                    <div className='flex items-center gap-3 text-xs'>
                                                        <span className='text-white/40 flex items-center gap-1'>
                                                            <FaPhone size={10} className='text-[#ff6b35]' />
                                                            {assignedBoy.mobile}
                                                        </span>
                                                        <a href={`tel:${assignedBoy.mobile}`} className='text-[#ff6b35] hover:underline'>
                                                            Call
                                                        </a>
                                                        <a href={`https://wa.me/${assignedBoy.mobile}`} target="_blank" rel="noopener noreferrer" className='text-green-400 hover:underline'>
                                                            WhatsApp
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                            {isOutForDelivery && (
                                                <div className='flex items-center gap-1 text-xs text-orange-400/60'>
                                                    <div className='w-2 h-2 rounded-full bg-orange-400 animate-pulse' />
                                                    Live Tracking
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className='flex items-center gap-3'>
                                            <div className='w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center'>
                                                <FaSpinner className='text-yellow-400 text-xl animate-spin' />
                                            </div>
                                            <div>
                                                <p className='text-yellow-400 font-semibold'>Finding Delivery Boy</p>
                                                <p className='text-white/30 text-xs'>A delivery partner will be assigned shortly</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : status === 'cancelled' ? (
                                <div className='mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20'>
                                    <div className='flex items-center gap-3'>
                                        <div className='w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center'>
                                            <FaTimesCircle className='text-red-400 text-2xl' />
                                        </div>
                                        <div>
                                            <p className='text-red-400 font-semibold text-lg'>❌ Order Cancelled</p>
                                            <p className='text-white/30 text-xs'>This order has been cancelled</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className='mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20'>
                                    <div className='flex items-center gap-3'>
                                        <div className='w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center'>
                                            <FaCheckCircle className='text-green-400 text-2xl' />
                                        </div>
                                        <div>
                                            <p className='text-green-400 font-semibold text-lg'>✅ Delivered!</p>
                                            <p className='text-white/30 text-xs'>Your order has been delivered successfully</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tracking Map */}
                            {assignedBoy && !isDelivered && status !== 'cancelled' && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    transition={{ duration: 0.5 }}
                                    className='mt-4'
                                >
                                    <div className='rounded-2xl overflow-hidden border border-white/5 shadow-xl shadow-black/20'>
                                        <DeliveryBoyTracking 
                                            data={{
                                                deliveryBoyLocation: liveLocations[assignedBoy._id] || {
                                                    lat: assignedBoy.location?.coordinates?.[1] || 25.6191,
                                                    lon: assignedBoy.location?.coordinates?.[0] || 85.1335
                                                },
                                                customerLocation: {
                                                    lat: currentOrder.deliveryAddress?.latitude || 25.6191,
                                                    lon: currentOrder.deliveryAddress?.longitude || 85.1335
                                                }
                                            }} 
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )
                })}
            </div>

            <style jsx>{`
                @keyframes float-3d {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(40px, -30px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-float-3d {
                    animation: float-3d 15s ease-in-out infinite;
                }
                .animation-delay-300 { animation-delay: 0.3s; }
                .animation-delay-600 { animation-delay: 0.6s; }

                .glass-premium-ultra {
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
            `}</style>
        </div>
    )
}

export default TrackOrderPage