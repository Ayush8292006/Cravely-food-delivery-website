import React, { useEffect, useState } from 'react'
import { 
    FaCheckCircle, FaArrowRight, FaTruck, FaClock, FaReceipt, 
    FaHome, FaMotorcycle, FaStar, FaShieldAlt, FaGift,
    FaRocket, FaUtensils, FaStore, FaWhatsapp,
    FaEnvelope, FaPhone, FaHeadset, FaMedal,
    FaExclamationTriangle, FaHeart
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
    const [isLoaded, setIsLoaded] = useState(false)
    const [error, setError] = useState(null)
    const [retryCount, setRetryCount] = useState(0)

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
        if (orderData && socket) {
            socket.emit('new-order-placed', {
                orderId: orderData._id,
                userId: userData?._id
            })
        }
    }, [orderData, socket, userData])

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
                    if (response.data._id) {
                        dispatch(addMyOrder(response.data))
                        setOrderData(response.data)
                        setOrderStatus('success')
                        toast.success("Payment successful! 🎉")
                        setLoading(false)
                        return
                    }
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
                
                if (response.data && response.data._id) {
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
            for (let i = 0; i < 5; i++) {
                console.log(`🔄 Attempt ${i + 1} of 5...`)
                
                const response = await axios.get(
                    `${serverUrl}/api/order/my-orders`,
                    { withCredentials: true }
                )
                
                const orders = response.data || []
                
                if (orders.length > 0) {
                    const latestOrder = orders[0]
                    console.log("📦 Latest order:", latestOrder._id, "Payment:", latestOrder.payment)
                    
                    if (latestOrder.payment === true || latestOrder.paymentMethod === 'cod') {
                        if (latestOrder._id) {
                            dispatch(addMyOrder(latestOrder))
                            setOrderData(latestOrder)
                            setOrderStatus('success')
                            toast.success("Order placed successfully! 🎉")
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
        } catch (error) {
            console.log("❌ Error fetching orders:", error.message)
        }

        setOrderStatus('success')
        toast.warning("Order placed! Please check your orders page for details.")
        setLoading(false)
    }

    useEffect(() => {
        const timer = setTimeout(verifyPayment, 1500)
        return () => clearTimeout(timer)
    }, [sessionId, orderId, paymentId])

    const fadeUp = `transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`

    if (loading) {
        return (
            <div className='min-h-screen bg-white flex flex-col justify-center items-center'>
                <div className='relative'>
                    <div className='w-16 h-16 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin' />
                    <div className='absolute inset-0 animate-ping rounded-full border-2 border-orange-300/20' />
                </div>
                <p className='mt-6 text-gray-500 text-sm font-medium flex items-center gap-2'>
                    <span className='w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse' />
                    Verifying your payment...
                    <span className='w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse animation-delay-300' />
                </p>
                {retryCount > 0 && (
                    <p className='mt-2 text-gray-400 text-xs font-medium'>
                        Attempt {retryCount} of 5...
                    </p>
                )}
                <div className='mt-4 flex items-center gap-2'>
                    <div className='w-2 h-2 rounded-full bg-orange-400 animate-pulse' />
                    <div className='w-2 h-2 rounded-full bg-orange-400 animate-pulse animation-delay-300' />
                    <div className='w-2 h-2 rounded-full bg-amber-400 animate-pulse animation-delay-600' />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className='min-h-screen bg-white flex flex-col justify-center items-center px-4'>
                <div className='bg-white border-2 border-red-200 p-8 md:p-12 rounded-3xl text-center max-w-md w-full shadow-lg'>
                    <div className='w-20 h-20 mx-auto rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center'>
                        <FaExclamationTriangle className='text-red-500 text-4xl' />
                    </div>
                    <h2 className='text-2xl font-bold text-gray-800 mt-4'>Something went wrong</h2>
                    <p className='text-gray-500 text-sm mt-2'>{error}</p>
                    <div className='flex flex-col sm:flex-row gap-3 justify-center mt-6'>
                        <button 
                            className='px-6 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-medium transition shadow-sm shadow-orange-200'
                            onClick={() => {
                                setError(null)
                                setLoading(true)
                                verifyPayment()
                            }}
                        >
                            Retry
                        </button>
                        <button 
                            className='px-6 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition font-medium'
                            onClick={() => navigate('/my-orders')}
                        >
                            View My Orders
                        </button>
                    </div>
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
        <div 
            className='min-h-screen bg-[#f8f4f0] relative'
            style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                
                .glass-premium-ultra {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(0, 0, 0, 0.06);
                }

                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.15); }
                    50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.3); }
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
            `}</style>

            <div className='relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-12 min-h-screen flex items-center justify-center'>
                
                <motion.div 
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, type: "spring" }}
                    className={`w-full ${fadeUp}`}
                >
                    
                    {/* Success Card */}
                    <div className='bg-white border-2 border-gray-200 p-6 sm:p-8 md:p-12 rounded-3xl text-center max-w-2xl mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden'>
                        
                        {/* Decorative Elements */}
                        <div className='absolute -top-40 -right-40 w-80 h-80 bg-orange-100/30 rounded-full blur-3xl' />
                        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl' />
                        
                        {/* Top accent bar */}
                        <div className='absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400' />
                        
                        {/* Success Icon */}
                        <div className='relative z-10'>
                            <motion.div 
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className='w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center animate-pulse-glow'
                            >
                                <FaCheckCircle className='text-green-500 text-3xl sm:text-5xl' />
                            </motion.div>
                        </div>

                        {/* Title */}
                        <div className='relative z-10 mt-4 sm:mt-6'>
                            <motion.h1 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900'
                            >
                                {paymentMethod === 'cod' ? 'Order Placed! 🎉' : 'Payment Successful! 🎉'}
                            </motion.h1>
                            <motion.p 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className='text-gray-500 text-xs sm:text-sm mt-2 font-medium'
                            >
                                {paymentMethod === 'cod' 
                                    ? 'Your order has been confirmed and will be delivered soon.'
                                    : 'Thank you for your purchase. Your order is being prepared.'
                                }
                            </motion.p>
                        </div>

                        {/* Order ID */}
                        <div className='relative z-10 mt-3 sm:mt-4'>
                            <span className='inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gray-100 border border-gray-200 text-gray-600 text-[10px] sm:text-xs font-medium'>
                                <FaReceipt size={12} />
                                Order #{orderIdDisplay}
                            </span>
                        </div>

                        {/* Delivery Info */}
                        <div className='relative z-10 mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4'>
                            <div className='bg-gray-50 border border-gray-200 p-3 sm:p-4 rounded-2xl hover:border-orange-200 transition-colors'>
                                <div className='flex flex-col items-center gap-1 sm:gap-2'>
                                    <MdRestaurant className='text-orange-500 text-lg sm:text-xl' />
                                    <p className='text-gray-400 text-[8px] sm:text-[10px] font-semibold tracking-wider'>STATUS</p>
                                    <p className='text-green-600 text-xs sm:text-sm font-bold'>Confirmed</p>
                                </div>
                            </div>
                            
                            <div className='bg-gray-50 border border-gray-200 p-3 sm:p-4 rounded-2xl hover:border-orange-200 transition-colors'>
                                <div className='flex flex-col items-center gap-1 sm:gap-2'>
                                    <MdDeliveryDining className='text-blue-500 text-lg sm:text-xl' />
                                    <p className='text-gray-400 text-[8px] sm:text-[10px] font-semibold tracking-wider'>DELIVERY</p>
                                    <p className='text-gray-700 text-xs sm:text-sm font-bold'>30-40 min</p>
                                </div>
                            </div>
                            
                            <div className='bg-gray-50 border border-gray-200 p-3 sm:p-4 rounded-2xl hover:border-orange-200 transition-colors'>
                                <div className='flex flex-col items-center gap-1 sm:gap-2'>
                                    <FaClock className='text-amber-500 text-lg sm:text-xl' />
                                    <p className='text-gray-400 text-[8px] sm:text-[10px] font-semibold tracking-wider'>PAYMENT</p>
                                    <p className={isPaid ? 'text-green-600 text-xs sm:text-sm font-bold' : 'text-amber-600 text-xs sm:text-sm font-bold'}>
                                        {isPaid ? '✅ Paid' : '⏳ Pending'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Total Amount */}
                        {totalAmount > 0 && (
                            <div className='relative z-10 mt-3 sm:mt-4'>
                                <div className='inline-block bg-orange-50 border-2 border-orange-200 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl'>
                                    <p className='text-gray-600 text-sm'>
                                        Total: <span className='text-orange-600 font-bold text-lg sm:text-2xl'>₹{totalAmount}</span>
                                    </p>
                                    <p className='text-gray-400 text-[10px] sm:text-xs font-medium'>
                                        {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className='relative z-10 mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3'>
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                className='w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-semibold transition shadow-sm shadow-orange-200 flex items-center justify-center gap-2 group'
                                onClick={() => navigate("/my-orders")}
                            >
                                <FaTruck size={14} className='group-hover:translate-x-1 transition-transform' />
                                <span>View My Orders</span>
                            </motion.button>
                            
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                className='w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-full border-2 border-gray-200 text-gray-600 text-xs sm:text-sm font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2'
                                onClick={() => navigate("/")}
                            >
                                <FaHome size={14} />
                                <span>Back to Home</span>
                            </motion.button>
                        </div>

                        {/* Thank You Message */}
                        <div className='relative z-10 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200'>
                            <p className='text-gray-400 text-[10px] sm:text-xs font-medium'>
                                {userData?.email && (
                                    <span>📧 A confirmation email has been sent to <span className='text-gray-600'>{userData.email}</span></span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className='text-center mt-6 sm:mt-8'>
                        <p className='text-gray-400 text-[10px] sm:text-xs flex items-center justify-center gap-2 flex-wrap font-medium'>
                            <span>Need help?</span>
                            <span className='text-orange-500 hover:underline cursor-pointer flex items-center gap-1 font-semibold'>
                                <FaHeadset size={12} /> Contact Support
                            </span>
                            <span className='text-gray-300'>|</span>
                            <span className='text-gray-400 flex items-center gap-1'>
                                <FaShieldAlt size={10} className='text-green-500' /> Secure
                            </span>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default OrderPlaced