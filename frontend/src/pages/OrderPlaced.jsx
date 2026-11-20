import React, { useEffect, useState } from 'react'
import { 
    FaCheckCircle, FaArrowRight, FaTruck, FaClock, FaReceipt, 
    FaHome, FaMotorcycle, FaStar, FaShieldAlt, FaGift,
    FaRocket, FaUtensils, FaStore, FaWhatsapp,
    FaEnvelope, FaPhone, FaHeadset, FaMedal,
    FaExclamationTriangle, FaHeart, FaMapMarkerAlt, FaCreditCard
} from "react-icons/fa";
import { MdDeliveryDining, MdRestaurant, MdVerified } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { toast } from "react-toastify";
import { useDispatch, useSelector } from 'react-redux';
import { addMyOrder } from '../redux/userSlice';
import axios from 'axios';
import { motion } from 'framer-motion';
import { serverUrl } from '../../config';

function OrderPlaced() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { userData, socket } = useSelector(state => state.user)
    const [loading, setLoading] = useState(true)
    const [orderStatus, setOrderStatus] = useState('processing')
    const [orderData, setOrderData] = useState(null)
    const [error, setError] = useState(null)
    const [retryCount, setRetryCount] = useState(0)

    const urlParams = new URLSearchParams(window.location.search)
    const sessionId = urlParams.get('session_id')
    const orderId = urlParams.get('order_id')
    const paymentId = urlParams.get('payment_id')
    const razorpayOrderId = urlParams.get('razorpay_order_id')
    const razorpaySignature = urlParams.get('razorpay_signature')

    useEffect(() => {
        if (orderData && socket) {
            socket.emit('new-order-placed', {
                orderId: orderData._id,
                userId: userData?._id
            })
        }
    }, [orderData, socket, userData])

    const verifyPayment = async () => {
        if (paymentId && razorpayOrderId && razorpaySignature && orderId) {
            try {
                const response = await axios.post(
                    `${serverUrl}/api/order/verify-payment`,
                    {
                        razorpay_payment_id: paymentId,
                        razorpay_order_id: razorpayOrderId,
                        razorpay_signature: razorpaySignature,
                        orderId: orderId
                    },
                    { withCredentials: true }
                )

                if (response.data.payment === true || response.data.payment === "true") {
                    if (response.data._id) {
                        dispatch(addMyOrder(response.data))
                        setOrderData(response.data)
                        setOrderStatus('success')
                        toast.success("Payment verified! 🎉")
                        setLoading(false)
                        return
                    }
                }
            } catch (err) {
                console.error("Razorpay verification error:", err.response?.data || err.message)
                setError(err.response?.data?.message || "Payment verification failed")
            }
        }

        if (orderId) {
            try {
                const response = await axios.get(
                    `${serverUrl}/api/order/get-order-by-id/${orderId}`,
                    { withCredentials: true }
                )
                if (response.data && response.data._id) {
                    dispatch(addMyOrder(response.data))
                    setOrderData(response.data)
                    setOrderStatus('success')
                    toast.success("Order confirmed! 🎉")
                    setLoading(false)
                    return
                }
            } catch (err) {
                console.error("Error fetching order:", err.message)
            }
        }

        // Fallback: poll recent orders
        try {
            for (let i = 0; i < 5; i++) {
                const response = await axios.get(
                    `${serverUrl}/api/order/my-orders`,
                    { withCredentials: true }
                )
                const orders = response.data || []
                if (orders.length > 0) {
                    const latestOrder = orders[0]
                    if (latestOrder.payment === true || latestOrder.paymentMethod === 'cod') {
                        if (latestOrder._id) {
                            dispatch(addMyOrder(latestOrder))
                            setOrderData(latestOrder)
                            setOrderStatus('success')
                            toast.success("Order confirmed! 🎉")
                            setLoading(false)
                            return
                        }
                    }
                }
                if (i < 4) {
                    await new Promise(resolve => setTimeout(resolve, 1500))
                }
                setRetryCount(i + 1)
            }
        } catch (err) {
            console.error("Error fetching orders:", err.message)
        }

        setOrderStatus('success')
        toast.info("Order recorded! Check your orders page for live status.")
        setLoading(false)
    }

    useEffect(() => {
        const timer = setTimeout(verifyPayment, 1200)
        return () => clearTimeout(timer)
    }, [sessionId, orderId, paymentId])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A090D] text-white flex flex-col justify-center items-center px-4">
                <div className="relative">
                    <ClipLoader size={54} color="#FF6B00" />
                </div>
                <h3 className="mt-6 text-lg font-black text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse" />
                    Confirming Your Feast Order...
                </h3>
                <p className="mt-1 text-xs text-gray-400">
                    Securing payment verification & notifying kitchen
                </p>
                {retryCount > 0 && (
                    <p className="mt-2 text-[11px] text-gray-500 font-mono">
                        Verification attempt {retryCount} of 5...
                    </p>
                )}
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0A090D] text-white flex flex-col justify-center items-center px-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#13121A] border border-red-500/30 p-8 sm:p-10 rounded-3xl text-center max-w-md w-full shadow-2xl space-y-4"
                >
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                        <FaExclamationTriangle size={30} />
                    </div>
                    <h2 className="text-xl font-black text-white">Verification Notice</h2>
                    <p className="text-xs text-gray-400">{error}</p>
                    <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
                        <button 
                            className="px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-orange-600 text-white font-bold text-xs transition shadow-md cursor-pointer"
                            onClick={() => {
                                setError(null)
                                setLoading(true)
                                verifyPayment()
                            }}
                        >
                            Retry Verification
                        </button>
                        <button 
                            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer"
                            onClick={() => navigate('/my-orders')}
                        >
                            View Orders
                        </button>
                    </div>
                </motion.div>
            </div>
        )
    }

    const orderIdDisplay = orderData?._id 
        ? orderData._id.slice(-8).toUpperCase() 
        : 'CONFIRMED'

    const totalAmount = orderData?.totalAmount || 0
    const paymentMethod = orderData?.paymentMethod || 'cod'
    const isPaid = orderData?.payment === true || orderData?.payment === "true"
    const firstShop = orderData?.shopOrders?.[0]
    const restaurant = firstShop?.shop
    const items = firstShop?.shopOrderItems || []

    return (
        <div 
            className="min-h-screen bg-[#0A090D] text-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center selection:bg-[#FF6B00] selection:text-white"
            style={{ fontFamily: "'Poppins', 'Segoe UI', system-ui, sans-serif" }}
        >
            <motion.div 
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-2xl space-y-6"
            >
                {/* 1. Celebratory Success Hero Card */}
                <div className="bg-[#13121A] border border-white/10 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
                    
                    {/* Animated Checkmark Icon (Solid Emerald, Zero Gradients) */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 shadow-lg"
                    >
                        <FaCheckCircle size={40} />
                    </motion.div>

                    <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                        Order Placed Successfully!
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-md mx-auto">
                        Your culinary cravings are officially confirmed and the kitchen is getting ready to cook.
                    </p>

                    {/* Order Meta Pills */}
                    <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
                        <span className="px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono font-bold text-gray-300">
                            ID: #{orderIdDisplay}
                        </span>
                        <span className={`px-3.5 py-1 rounded-full text-xs font-bold border ${
                            isPaid 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        }`}>
                            {isPaid ? 'PAID ONLINE' : 'CASH ON DELIVERY'}
                        </span>
                        <span className="px-3.5 py-1 rounded-full bg-[#FF6B00]/15 border border-orange-500/30 text-xs font-bold text-[#FF8C00]">
                            ⚡ Est: 30-40 Mins
                        </span>
                    </div>
                </div>

                {/* 2. Order Summary Card */}
                <div className="bg-[#13121A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
                    <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#0A090D] border border-white/10 flex items-center justify-center text-[#FF6B00]">
                                <FaStore size={16} />
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-base font-black text-white truncate">
                                    {restaurant?.name || 'Cravely Kitchen'}
                                </h3>
                                <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                                    <FaMapMarkerAlt size={10} className="text-[#FF6B00]" />
                                    <span>{restaurant?.address || 'Restaurant Address'}</span>
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-xs text-gray-400">Total Paid</p>
                            <p className="text-base sm:text-lg font-black text-white font-mono">₹{totalAmount}</p>
                        </div>
                    </div>

                    {/* Items List Preview */}
                    {items.length > 0 && (
                        <div className="bg-[#0A090D] rounded-2xl p-4 border border-white/[0.06] space-y-2">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Ordered Delicacies ({items.length})
                            </p>
                            <div className="divide-y divide-white/[0.04] max-h-36 overflow-y-auto pr-1">
                                {items.map((it, idx) => (
                                    <div key={idx} className="py-2 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="w-4 h-4 rounded-full bg-white/10 text-[10px] font-black flex items-center justify-center text-white">
                                                {it.quantity}x
                                            </span>
                                            <span className="text-gray-200 font-medium truncate max-w-xs">{it.name}</span>
                                        </div>
                                        <span className="text-white font-mono font-semibold">₹{it.price * (it.quantity || 1)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Progress Step Strip */}
                    <div className="pt-2 grid grid-cols-3 gap-3 text-center">
                        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                            <FaReceipt size={14} className="text-[#FF6B00] mx-auto mb-1" />
                            <p className="text-xs font-bold text-white">Confirmed</p>
                            <p className="text-[10px] text-gray-400">Kitchen notified</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                            <FaUtensils size={14} className="text-sky-400 mx-auto mb-1" />
                            <p className="text-xs font-bold text-white">Preparing</p>
                            <p className="text-[10px] text-gray-400">Fresh cooking</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                            <FaMotorcycle size={14} className="text-emerald-400 mx-auto mb-1" />
                            <p className="text-xs font-bold text-white">Delivery</p>
                            <p className="text-[10px] text-gray-400">Rider assigned</p>
                        </div>
                    </div>
                </div>

                {/* 3. Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                        onClick={() => navigate(orderData?._id ? `/track-order/${orderData._id}` : '/my-orders')}
                        className="flex-1 py-3.5 rounded-2xl bg-[#FF6B00] hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <FaTruck size={13} />
                        <span>Track Order Live</span>
                        <FaArrowRight size={10} />
                    </button>

                    <button
                        onClick={() => navigate('/my-orders')}
                        className="flex-1 py-3.5 rounded-2xl bg-[#13121A] hover:bg-white/10 border border-white/10 text-white font-black text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <FaReceipt size={13} className="text-gray-400" />
                        <span>View My Orders</span>
                    </button>
                </div>

                <div className="text-center pt-2">
                    <button
                        onClick={() => navigate('/restaurants')}
                        className="text-xs text-gray-400 hover:text-white transition font-medium cursor-pointer"
                    >
                        ← Continue exploring restaurants
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

export default OrderPlaced
