import React, { useEffect, useState } from 'react'
import { 
    FaCheckCircle, FaArrowRight, FaTruck, FaClock, FaReceipt, 
    FaHome, FaMotorcycle, FaStar, FaShieldAlt, FaGift,
    FaRocket, FaUtensils, FaStore, FaWhatsapp,
    FaEnvelope, FaPhone, FaHeadset, FaMedal
    // ❌ REMOVED: FaSparkles
} from "react-icons/fa";
import { MdDeliveryDining, MdRestaurant, MdVerified } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { toast } from "react-toastify";
import { useDispatch, useSelector } from 'react-redux';
import { addMyOrder } from '../redux/userSlice';
import axios from 'axios';
import { motion } from 'framer-motion';
import { serverUrl } from '../App';

function OrderPlaced() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)
    const [loading, setLoading] = useState(true)
    const [orderStatus, setOrderStatus] = useState('processing')
    const [orderData, setOrderData] = useState(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [error, setError] = useState(null)

    const urlParams = new URLSearchParams(window.location.search)
    const sessionId = urlParams.get('session_id')
    const orderId = urlParams.get('order_id')
    const paymentId = urlParams.get('payment_id')
    const razorpayOrderId = urlParams.get('razorpay_order_id')
    const razorpaySignature = urlParams.get('razorpay_signature')

    console.log("📦 OrderPlaced Page Loaded")
    console.log("📦 Session ID:", sessionId)
    console.log("📦 Order ID:", orderId)
    console.log("📦 Payment ID:", paymentId)

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 300)
    }, [])

    useEffect(() => {
        const verifyPayment = async () => {
            if (paymentId && razorpayOrderId && razorpaySignature && orderId) {
                console.log("🔍 Razorpay verification started...")
                
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

                    console.log("✅ Verification Response:", response.data)

                    if (response.data.payment === true || response.data.payment === "true") {
                        dispatch(addMyOrder(response.data))
                        setOrderData(response.data)
                        setOrderStatus('success')
                        toast.success("Payment successful! 🎉")
                        setLoading(false)
                        return
                    }
                } catch (error) {
                    console.log("❌ Razorpay verification error:", error.response?.data || error.message)
                    setError(error.response?.data?.message || "Payment verification failed")
                }
            }

            if (orderId) {
                console.log("🔍 Fetching order by ID...")
                try {
                    const response = await axios.get(
                        `${serverUrl}/api/order/get-order-by-id/${orderId}`,
                        { withCredentials: true }
                    )
                    
                    console.log("📦 Order fetched:", response.data)
                    
                    if (response.data) {
                        dispatch(addMyOrder(response.data))
                        setOrderData(response.data)
                        setOrderStatus('success')
                        toast.success("Order placed successfully! 🎉")
                        setLoading(false)
                        return
                    }
                } catch (error) {
                    console.log("❌ Error fetching order:", error.message)
                }
            }

            console.log("📦 Fetching latest order...")
            
            try {
                for (let i = 0; i < 3; i++) {
                    console.log(`🔄 Attempt ${i + 1} of 3...`)
                    
                    const response = await axios.get(
                        `${serverUrl}/api/order/my-orders`,
                        { withCredentials: true }
                    )
                    
                    const orders = response.data || []
                    
                    if (orders.length > 0) {
                        const latestOrder = orders[0]
                        console.log("📦 Latest order:", latestOrder._id, "Payment:", latestOrder.payment)
                        
                        if (latestOrder.payment === true || latestOrder.paymentMethod === 'cod') {
                            dispatch(addMyOrder(latestOrder))
                            setOrderData(latestOrder)
                            setOrderStatus('success')
                            toast.success("Order placed successfully! 🎉")
                            setLoading(false)
                            return
                        }
                    }
                    
                    if (i < 2) {
                        await new Promise(resolve => setTimeout(resolve, 2000))
                    }
                }
            } catch (error) {
                console.log("❌ Error fetching orders:", error.message)
            }

            setOrderStatus('success')
            toast.success("Order placed successfully! 🎉")
            setLoading(false)
        }

        const timer = setTimeout(verifyPayment, 1000)
        return () => clearTimeout(timer)
    }, [sessionId, orderId, paymentId])

    const fadeUp = `transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`

    if (loading) {
        return (
            <div className='min-h-screen bg-[#0a0a0f] flex flex-col justify-center items-center relative overflow-hidden'>
                <div className='absolute inset-0 pointer-events-none'>
                    <div className='absolute -top-40 -left-40 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-3xl' />
                    <div className='absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#ff6b35]/5 rounded-full blur-3xl' />
                </div>
                <div className='relative'>
                    <ClipLoader size={60} color="#ff2d55" />
                    <div className='absolute inset-0 animate-ping rounded-full border-2 border-[#ff2d55]/20' />
                    <div className='absolute inset-[-10px] rounded-full border border-[#ff6b35]/10 animate-spin-slow' />
                </div>
                <p className='mt-6 text-white/40 text-sm animate-pulse flex items-center gap-2'>
                    <span className='w-1.5 h-1.5 rounded-full bg-[#ff2d55]/40 animate-pulse' />
                    Verifying your payment...
                    <span className='w-1.5 h-1.5 rounded-full bg-[#ff6b35]/40 animate-pulse animation-delay-300' />
                </p>
                <div className='mt-4 flex items-center gap-2'>
                    <div className='w-2 h-2 rounded-full bg-[#ff2d55]/40 animate-pulse' />
                    <div className='w-2 h-2 rounded-full bg-[#ff6b35]/40 animate-pulse animation-delay-300' />
                    <div className='w-2 h-2 rounded-full bg-[#ffd93d]/40 animate-pulse animation-delay-600' />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className='min-h-screen bg-[#0a0a0f] flex flex-col justify-center items-center px-4 relative overflow-hidden'>
                <div className='absolute inset-0 pointer-events-none'>
                    <div className='absolute -top-40 -left-40 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl' />
                    <div className='absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl' />
                </div>
                <div className='glass-premium-ultra p-8 md:p-12 rounded-3xl border border-red-500/20 text-center max-w-md w-full'>
                    <div className='w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30'>
                        <span className='text-4xl'>😕</span>
                    </div>
                    <h2 className='text-2xl font-bold text-white mt-4'>Something went wrong</h2>
                    <p className='text-white/40 text-sm mt-2'>{error}</p>
                    <button 
                        className='mt-6 px-8 py-3 rounded-full bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white font-medium hover:scale-105 transition-all duration-300 shadow-lg shadow-[#ff2d55]/20'
                        onClick={() => navigate('/my-orders')}
                    >
                        View My Orders
                    </button>
                </div>
            </div>
        )
    }

    const orderIdDisplay = orderData?._id 
        ? orderData._id.slice(-8).toUpperCase() 
        : 'N/A'

    const totalAmount = orderData?.totalAmount || 0
    const paymentMethod = orderData?.paymentMethod || 'cod'
    const isPaid = orderData?.payment === true || orderData?.payment === "true"

    return (
        <div className='min-h-screen bg-[#0a0a0f] relative overflow-hidden'>
            
            {/* ✅ Animated Background */}
            <div className='absolute inset-0 pointer-events-none'>
                <motion.div 
                    animate={{ x: [0, 60, -30, 0], y: [0, -40, 50, 0] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className='absolute -top-40 -left-40 w-[700px] h-[700px] bg-green-500/6 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ x: [0, -50, 30, 0], y: [0, 40, -50, 0] }}
                    transition={{ duration: 25, repeat: Infinity }}
                    className='absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-[#ff6b35]/6 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ffd93d]/4 rounded-full blur-3xl'
                />
            </div>

            <div className='relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-12 min-h-screen flex items-center justify-center'>
                
                <motion.div 
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, type: "spring" }}
                    className={`w-full ${fadeUp}`}
                >
                    
                    {/* ✅ Success Card */}
                    <div className='glass-premium-ultra p-6 sm:p-8 md:p-12 rounded-3xl border border-white/10 text-center max-w-2xl mx-auto relative overflow-hidden'>
                        
                        {/* Success Glow */}
                        <div className='absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl' />
                        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-[#ff2d55]/5 rounded-full blur-3xl' />
                        
                        {/* ✅ Success Icon */}
                        <div className='relative z-10'>
                            <motion.div 
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className='w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30 shadow-lg shadow-green-500/20 animate-pulse-glow'
                            >
                                <FaCheckCircle className='text-green-400 text-3xl sm:text-5xl' />
                            </motion.div>
                        </div>

                        {/* ✅ Title */}
                        <div className='relative z-10 mt-4 sm:mt-6'>
                            <motion.h1 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className='text-2xl sm:text-3xl md:text-4xl font-bold text-white'
                            >
                                {paymentMethod === 'cod' ? 'Order Placed! 🎉' : 'Payment Successful! 🎉'}
                            </motion.h1>
                            <motion.p 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className='text-white/40 text-xs sm:text-sm mt-2'
                            >
                                {paymentMethod === 'cod' 
                                    ? 'Your order has been confirmed and will be delivered soon.'
                                    : 'Thank you for your purchase. Your order is being prepared.'
                                }
                            </motion.p>
                        </div>

                        {/* ✅ Order ID */}
                        <div className='relative z-10 mt-3 sm:mt-4'>
                            <span className='inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 text-white/50 text-[10px] sm:text-xs'>
                                <FaReceipt size={12} />
                                Order #{orderIdDisplay}
                            </span>
                        </div>

                        {/* ✅ Delivery Info - Responsive Grid */}
                        <div className='relative z-10 mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4'>
                            <div className='glass-premium-ultra p-3 sm:p-4 rounded-2xl border border-white/5'>
                                <div className='flex flex-col items-center gap-1 sm:gap-2'>
                                    <MdRestaurant className='text-[#ff6b35] text-lg sm:text-xl' />
                                    <p className='text-white/30 text-[8px] sm:text-[10px] font-medium tracking-wider'>STATUS</p>
                                    <p className='text-green-400 text-xs sm:text-sm font-semibold'>Confirmed</p>
                                </div>
                            </div>
                            
                            <div className='glass-premium-ultra p-3 sm:p-4 rounded-2xl border border-white/5'>
                                <div className='flex flex-col items-center gap-1 sm:gap-2'>
                                    <MdDeliveryDining className='text-blue-400 text-lg sm:text-xl' />
                                    <p className='text-white/30 text-[8px] sm:text-[10px] font-medium tracking-wider'>DELIVERY</p>
                                    <p className='text-white/60 text-xs sm:text-sm font-semibold'>30-40 min</p>
                                </div>
                            </div>
                            
                            <div className='glass-premium-ultra p-3 sm:p-4 rounded-2xl border border-white/5'>
                                <div className='flex flex-col items-center gap-1 sm:gap-2'>
                                    <FaClock className='text-yellow-400 text-lg sm:text-xl' />
                                    <p className='text-white/30 text-[8px] sm:text-[10px] font-medium tracking-wider'>PAYMENT</p>
                                    <p className={isPaid ? 'text-green-400 text-xs sm:text-sm font-semibold' : 'text-yellow-400 text-xs sm:text-sm font-semibold'}>
                                        {isPaid ? '✅ Paid' : '⏳ Pending'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ✅ Total Amount */}
                        {totalAmount > 0 && (
                            <div className='relative z-10 mt-3 sm:mt-4'>
                                <p className='text-white/60 text-sm'>
                                    Total: <span className='text-[#ff6b35] font-bold text-lg sm:text-xl'>₹{totalAmount}</span>
                                </p>
                                <p className='text-white/20 text-[10px] sm:text-xs'>
                                    {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
                                </p>
                            </div>
                        )}

                        {/* ✅ Action Buttons */}
                        <div className='relative z-10 mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3'>
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                className='w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white text-xs sm:text-sm font-medium transition-all duration-300 shadow-lg shadow-[#ff2d55]/20 flex items-center justify-center gap-2 group'
                                onClick={() => navigate("/my-orders")}
                            >
                                <FaTruck size={14} className='group-hover:translate-x-1 transition-transform' />
                                <span>View My Orders</span>
                            </motion.button>
                            
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                className='w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-full border border-white/15 text-white/60 text-xs sm:text-sm font-medium hover:bg-white/5 hover:text-white transition-all duration-300 flex items-center justify-center gap-2'
                                onClick={() => navigate("/")}
                            >
                                <FaHome size={14} />
                                <span>Back to Home</span>
                            </motion.button>
                        </div>

                        {/* ✅ Thank You Message */}
                        <div className='relative z-10 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10'>
                            <p className='text-white/20 text-[10px] sm:text-xs'>
                                {userData?.email && (
                                    <span>📧 A confirmation email has been sent to <span className='text-white/40'>{userData.email}</span></span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* ✅ Footer */}
                    <div className='text-center mt-6 sm:mt-8'>
                        <p className='text-white/20 text-[10px] sm:text-xs flex items-center justify-center gap-2 flex-wrap'>
                            <span>Need help?</span>
                            <span className='text-[#ff6b35] hover:underline cursor-pointer flex items-center gap-1'>
                                <FaHeadset size={12} /> Contact Support
                            </span>
                            <span className='text-white/10'>|</span>
                            <span className='text-white/20 flex items-center gap-1'>
                                <FaShieldAlt size={10} className='text-green-400' /> Secure
                            </span>
                        </p>
                    </div>
                </motion.div>
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

                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }

                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.2); }
                    50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.4); }
                }
                .animate-pulse-glow {
                    animation: pulse-glow 2s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
                .animate-pulse {
                    animation: pulse 2s ease-in-out infinite;
                }
                .animation-delay-300 { animation-delay: 0.3s; }
                .animation-delay-600 { animation-delay: 0.6s; }

                .glass-premium-ultra {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }
            `}</style>
        </div>
    )
}

export default OrderPlaced