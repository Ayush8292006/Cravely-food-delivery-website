import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DeliveryBoyNav from '../components/DeliveryBoyNav'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { toast } from "react-toastify"
import { ClipLoader } from 'react-spinners'
import DeliveryBoyTracking from './DeliveryBoyTracking'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { 
    FaMotorcycle, FaMapMarkerAlt, FaTruck, FaClock, 
    FaRupeeSign, FaStar, FaShoppingBag, FaUser,
    FaCheckCircle, FaSpinner, FaLocationArrow,
    FaWallet, FaChartBar, FaMedal, FaRocket,
    FaArrowRight, FaBell, FaPhone, FaWhatsapp,
    FaStore, FaBox, FaSync, FaUserCheck,
    FaCircle, FaCheck, FaTimes, FaInfoCircle,
    FaHourglassHalf, FaShieldAlt, FaLock, FaCopy
} from 'react-icons/fa'
import { MdDeliveryDining, MdVerified } from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'

function DeliveryBoy() {
    const navigate = useNavigate()
    const { userData, socket } = useSelector(state => state.user)
    const { currentCity, currentState } = useSelector(state => state.user)
    const [availableAssignments, setAvailableAssignments] = useState([])
    const [currentOrder, setCurrentOrder] = useState(null)
    const [showOtpBox, setShowOtpBox] = useState(false)
    const [otp, setOtp] = useState("")
    const [todayDeliveries, setTodayDeliveries] = useState([])
    
    // ✅ OTP Display State
    const [otpDisplay, setOtpDisplay] = useState(null)
    const [otpSentTo, setOtpSentTo] = useState("")
    const [otpSentEmail, setOtpSentEmail] = useState("")
    const [otpExpiry, setOtpExpiry] = useState(null)
    
    const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null)
    const [locationLoading, setLocationLoading] = useState(true)
    const [locationError, setLocationError] = useState(null)
    
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [stats, setStats] = useState({
        totalDeliveries: 0,
        totalEarning: 0,
        rating: 0,
        completionRate: 0
    })
    const [fetching, setFetching] = useState(false)
    const [isOnline, setIsOnline] = useState(userData?.isOnline || true)

    // ✅ APPROVAL STATUS
    const isApproved = userData?.isApproved === true
    const isPendingApproval = userData?.isApproved === false || userData?.isApproved === undefined

    // ✅ FIXED: Use fixed rate instead of userData?.ratePerDelivery
    const ratePerDelivery = 50  // Fixed rate per delivery
    const totalEarning = todayDeliveries.reduce((sum, d) => sum + d.count * ratePerDelivery, 0)
    const totalDeliveriesToday = todayDeliveries.reduce((sum, d) => sum + d.count, 0)

    // ✅ LOCATION TRACKING
    useEffect(() => {
        console.log("📍 Location useEffect triggered")
        console.log("📍 userData:", userData)
        console.log("📍 userData.location:", userData?.location)
        console.log("📍 userData.location.coordinates:", userData?.location?.coordinates)
        
        const coords = userData?.location?.coordinates
        const isValidLocation = coords && 
                               coords.length === 2 && 
                               coords[0] !== 0 && 
                               coords[1] !== 0 &&
                               !isNaN(coords[0]) && 
                               !isNaN(coords[1])

        if (isValidLocation) {
            const lat = coords[1]
            const lon = coords[0]
            setDeliveryBoyLocation({ lat, lon })
            setLocationLoading(false)
            setLocationError(null)
            console.log("✅ Valid location from userData:", { lat, lon })
        } else {
            console.log("⚠️ Invalid or missing location in userData, will try geolocation...")
        }

        if (!navigator.geolocation) {
            setLocationError("Browser doesn't support geolocation")
            setLocationLoading(false)
            setDeliveryBoyLocation({ lat: 25.6191, lon: 85.1335 })
            console.log("⚠️ Using default location (Patna)")
            return
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const latitude = position.coords.latitude
                const longitude = position.coords.longitude
                console.log("✅ Live location from geolocation:", { lat: latitude, lon: longitude })
                setDeliveryBoyLocation({ lat: latitude, lon: longitude })
                setLocationLoading(false)
                setLocationError(null)
                
                if (socket && userData?._id) {
                    socket.emit('updateLocation', {
                        latitude,
                        longitude,
                        userId: userData._id
                    })
                    console.log("📍 Location emitted to socket")
                }
            },
            (error) => {
                console.log("❌ Geolocation error:", error.code, error.message)
                setLocationLoading(false)
                
                let errorMsg = "Location not available"
                if (error.code === 1) errorMsg = "📍 Permission denied. Please allow location access."
                else if (error.code === 2) errorMsg = "📍 Location unavailable. Please check GPS."
                else if (error.code === 3) errorMsg = "📍 Location timeout. Please try again."
                setLocationError(errorMsg)
                
                if (isValidLocation) {
                    const lat = userData.location.coordinates[1]
                    const lon = userData.location.coordinates[0]
                    setDeliveryBoyLocation({ lat, lon })
                    console.log("⚠️ Fallback to userData location:", { lat, lon })
                } else {
                    setDeliveryBoyLocation({ lat: 25.6191, lon: 85.1335 })
                    console.log("⚠️ Using default location (Patna, Bihar)")
                }
            },
            { 
                enableHighAccuracy: true, 
                timeout: 15000,
                maximumAge: 60000 
            }
        )

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId)
        }
    }, [socket, userData])

    // ✅ Fetch available assignments
    const getAssignments = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/order/get-assignments`, { 
                withCredentials: true 
            })
            setAvailableAssignments(result.data || [])
            console.log("📦 Available assignments:", result.data)
        } catch (error) {
            console.log('❌ Get assignments error:', error)
        }
    }

    // ✅ Fetch current order
    const getCurrentOrder = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/order/get-current-order`, { 
                withCredentials: true 
            })
            setCurrentOrder(result.data || null)
        } catch (error) {
            if (error.response?.status === 400 || error.response?.status === 404) {
                setCurrentOrder(null)
                return
            }
            console.log('❌ Get current order error:', error)
            setCurrentOrder(null)
        }
    }

    // ✅ Fetch today's deliveries
    const handleTodayDeliveries = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/order/get-today-deliveries`, { 
                withCredentials: true 
            })
            setTodayDeliveries(result.data || [])
        } catch (error) {
            console.log('❌ Today deliveries error:', error)
            setTodayDeliveries([])
        }
    }

    // ✅ Fetch delivery boy stats
    const fetchStats = async () => {
        if (!userData?._id) {
            console.log("⚠️ No user ID, skipping stats fetch")
            return
        }
        
        try {
            const response = await axios.get(`${serverUrl}/api/user/delivery-boy/${userData._id}`, {
                withCredentials: true
            })
            const data = response.data
            setStats({
                totalDeliveries: data.totalDeliveries || 0,
                totalEarning: data.totalEarning || 0,
                rating: data.deliveryBoyRating?.average || 0,
                completionRate: data.completionRate || 0
            })
        } catch (error) {
            if (error.response?.status === 400 || error.response?.status === 404) {
                console.log("ℹ️ No stats available yet")
                setStats({
                    totalDeliveries: 0,
                    totalEarning: 0,
                    rating: 0,
                    completionRate: 0
                })
                return
            }
            console.log('❌ Fetch stats error:', error)
        }
    }

    // ✅ Accept order
    const acceptOrder = async (assignmentId) => {
        if (!isApproved) {
            toast.warning('⚠️ Your account is pending approval. Please wait for admin approval.')
            return
        }
        
        setFetching(true)
        try {
            const response = await axios.get(`${serverUrl}/api/order/accept-order/${assignmentId}`, { 
                withCredentials: true 
            })
            console.log("✅ Accept Order Response:", response.data)
            toast.success('✅ Order accepted successfully!')
            await Promise.all([getCurrentOrder(), getAssignments()])
        } catch (error) {
            console.log('❌ Accept order error:', error)
            toast.error(error.response?.data?.message || '❌ Failed to accept order')
        } finally {
            setFetching(false)
        }
    }

    // ✅ Reject order
    const rejectOrder = async (assignmentId) => {
        if (!isApproved) {
            toast.warning('⚠️ Your account is pending approval.')
            return
        }
        
        setFetching(true)
        try {
            const response = await axios.post(
                `${serverUrl}/api/order/reject-order/${assignmentId}`, 
                {},
                { withCredentials: true }
            )
            console.log("✅ Reject Order Response:", response.data)
            toast.info('❌ Order rejected successfully')
            await getAssignments()
        } catch (error) {
            console.log('❌ Reject order error:', error)
            toast.error(error.response?.data?.message || '❌ Failed to reject order')
        } finally {
            setFetching(false)
        }
    }

    // ✅ Send OTP - Complete with Display
    const sendOtp = async () => {
        if (!currentOrder) {
            toast.error('No active order found')
            return
        }
        
        setLoading(true)
        try {
            const response = await axios.post(`${serverUrl}/api/order/send-delivery-otp`, {
                orderId: currentOrder._id,
                shopOrderId: currentOrder.shopOrder?._id
            }, { withCredentials: true })
            
            console.log("✅ OTP Response:", response.data)
            
            // ✅ Get OTP from response
            const otpCode = response.data.otp
            const userName = response.data.userName || currentOrder?.user?.fullName || 'Customer'
            const userEmail = response.data.userEmail || currentOrder?.user?.email || ''
            
            // ✅ Set OTP Display
            setOtpDisplay(otpCode)
            setOtpSentTo(userName)
            setOtpSentEmail(userEmail)
            setOtpExpiry(new Date(Date.now() + 5 * 60 * 1000)) // 5 minutes expiry
            
            // ✅ Show OTP Box
            setShowOtpBox(true)
            
            // ✅ Toast notifications
            toast.success(`📩 OTP sent to ${userName}`)
            toast.info(`🔑 OTP: ${otpCode}`)
            
            setLoading(false)
        } catch (error) {
            setLoading(false)
            console.log('❌ Send OTP error:', error)
            toast.error(error.response?.data?.message || "❌ Failed to send OTP")
        }
    }

    // ✅ Verify OTP
    const verifyOtp = async () => {
        if (!otp || otp.length < 4) {
            toast.error('Please enter valid OTP')
            return
        }
        
        setMessage("")
        try {
            const result = await axios.post(`${serverUrl}/api/order/verify-delivery-otp`, {
                orderId: currentOrder._id,
                shopOrderId: currentOrder.shopOrder?._id,
                otp
            }, { withCredentials: true })
            setMessage(result.data.message)
            toast.success("✅ Order delivered successfully!")
            setTimeout(() => {
                window.location.reload()
            }, 2000)
        } catch (error) {
            console.log('❌ Verify OTP error:', error)
            toast.error("❌ OTP verification failed")
        }
    }

    // ✅ Copy OTP to clipboard
    const copyOtpToClipboard = () => {
        if (otpDisplay) {
            navigator.clipboard.writeText(otpDisplay)
            toast.success('📋 OTP copied to clipboard!')
        }
    }

    // ✅ Refresh all data
    const refreshAll = async () => {
        setFetching(true)
        await Promise.all([
            getAssignments(),
            getCurrentOrder(),
            handleTodayDeliveries(),
            fetchStats()
        ])
        setFetching(false)
        toast.info('🔄 Data refreshed!')
    }

    // ✅ Socket event for new assignment
    useEffect(() => {
        socket?.on('newAssignment', (data) => {
            if (data.sentTo === userData?._id) {
                setAvailableAssignments(prev => [...prev, data])
                toast.info(`🛵 New delivery from ${data.shopName}`)
            }
        })
        return () => {
            socket?.off('newAssignment')
        }
    }, [socket, userData])

    // ✅ Initial data fetch
    useEffect(() => {
        if (userData?.role === 'deliveryBoy') {
            setIsOnline(userData?.isOnline || true)
            Promise.all([
                getAssignments(),
                getCurrentOrder(),
                handleTodayDeliveries(),
                fetchStats()
            ])
        }
    }, [userData])

    // ✅ OTP Expiry Timer
    useEffect(() => {
        if (otpExpiry) {
            const interval = setInterval(() => {
                const now = new Date()
                if (now > otpExpiry) {
                    toast.warning('⏰ OTP has expired! Please request a new one.')
                    setOtpDisplay(null)
                    setShowOtpBox(false)
                    setOtpExpiry(null)
                }
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [otpExpiry])

    // ✅ CITY NAME - Priority order
    const getLocationDisplay = () => {
        if (currentCity && currentCity !== "Unknown" && currentCity !== "Patna" || currentCity === "Patna") {
            return currentState ? `${currentCity}, ${currentState}` : currentCity
        }
        if (locationLoading) {
            return '🔄 Loading location...'
        }
        if (locationError) {
            return `⚠️ ${locationError}`
        }
        if (deliveryBoyLocation?.lat && deliveryBoyLocation?.lon) {
            return `${deliveryBoyLocation.lat.toFixed(6)}, ${deliveryBoyLocation.lon.toFixed(6)}`
        }
        return '📍 Location not available'
    }

    const locationDisplayText = getLocationDisplay()
    const isCityAvailable = currentCity && currentCity !== "Unknown" && !locationLoading

    // ✅ Calculate remaining time for OTP
    const getRemainingTime = () => {
        if (!otpExpiry) return null
        const now = new Date()
        const diff = Math.floor((otpExpiry - now) / 1000)
        if (diff <= 0) return null
        const mins = Math.floor(diff / 60)
        const secs = diff % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className='min-h-screen bg-[#0a0a0f] relative overflow-hidden pt-[70px] pb-[70px] md:pb-0'>
            
            <DeliveryBoyNav />

            {/* ✅ Animated Background Orbs */}
            <div className='absolute inset-0 pointer-events-none'>
                <motion.div 
                    animate={{ x: [0, 80, -40, 0], y: [0, -40, 60, 0] }}
                    transition={{ duration: 25, repeat: Infinity }}
                    className='absolute -top-40 -left-40 w-[700px] h-[700px] bg-[#ff2d55]/4 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ x: [0, -80, 40, 0], y: [0, 40, -60, 0] }}
                    transition={{ duration: 30, repeat: Infinity }}
                    className='absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-[#ff6b35]/4 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[#ffd93d]/2 rounded-full blur-3xl'
                />
            </div>

            <div className='relative z-10 max-w-5xl mx-auto px-4 py-6'>
                
                {/* ✅ Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='glass-premium-ultra p-6 rounded-3xl border border-white/5 mb-6'
                >
                    <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                        <div className='flex items-center gap-4'>
                            <div className='w-16 h-16 rounded-full bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center shadow-2xl shadow-[#ff2d55]/30'>
                                <FaMotorcycle className='text-white text-3xl' />
                            </div>
                            <div>
                                <h1 className='text-2xl font-bold text-white flex items-center gap-2'>
                                    Welcome, {userData?.fullName || 'Delivery Boy'}
                                    <MdVerified className='text-blue-400 text-lg' />
                                </h1>
                                <div className='flex items-center gap-3 text-sm flex-wrap'>
                                    <span className={`flex items-center gap-1.5 ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                                        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                                        {isOnline ? '🟢 Online' : '🔴 Offline'}
                                    </span>
                                    <span className='text-white/20'>|</span>
                                    <span className={`flex items-center gap-1.5 ${isApproved ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {isApproved ? (
                                            <><FaCheckCircle size={12} className='text-green-400' /> Verified</>
                                        ) : (
                                            <><FaHourglassHalf size={12} className='text-yellow-400 animate-pulse' /> Pending Approval</>
                                        )}
                                    </span>
                                    <span className='text-white/20'>|</span>
                                    <span className={`flex items-center gap-1.5 ${locationError ? 'text-yellow-400' : 'text-white/40'}`}>
                                        <FaMapMarkerAlt size={12} className={locationError ? 'text-yellow-400' : 'text-[#ff6b35]'} />
                                        {isCityAvailable ? (
                                            <span className='text-white/70 font-medium'>
                                                📍 {currentCity}{currentState ? `, ${currentState}` : ''}
                                            </span>
                                        ) : (
                                            <span>{locationDisplayText}</span>
                                        )}
                                    </span>
                                    <span className='text-white/20'>|</span>
                                    <span className='text-white/40 text-xs flex items-center gap-1'>
                                        <FaStar className='text-yellow-400 text-[10px]' />
                                        {stats.rating > 0 ? stats.rating.toFixed(1) : 'No ratings yet'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className='flex items-center gap-3 flex-wrap'>
                            <div className='glass-premium-ultra px-4 py-2 rounded-full border border-white/5 flex items-center gap-2'>
                                <FaWallet className='text-[#ffd93d]' />
                                <span className='text-white font-semibold'>₹{totalEarning || stats.totalEarning}</span>
                                <span className='text-white/30 text-xs'>Today</span>
                            </div>
                            <button
                                className='px-3 py-2 rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 border border-white/5'
                                onClick={refreshAll}
                                disabled={fetching}
                            >
                                <FaSync className={fetching ? 'animate-spin' : ''} size={14} />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* ✅ PENDING APPROVAL BANNER */}
                {!isApproved && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='glass-premium-ultra p-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 mb-6'
                    >
                        <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center'>
                                <FaShieldAlt className='text-yellow-400 text-xl' />
                            </div>
                            <div>
                                <h3 className='text-yellow-400 font-semibold text-sm'>⚠️ Pending Approval</h3>
                                <p className='text-white/50 text-xs'>
                                    Your account is waiting for admin approval. You cannot accept orders until verified.
                                </p>
                            </div>
                            <div className='ml-auto'>
                                <span className='text-yellow-400 text-xs font-medium px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30'>
                                    <FaHourglassHalf className='inline animate-pulse mr-1' /> Pending
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ✅ Stats Cards */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-6'
                >
                    {[
                        { icon: <FaTruck className='text-[#ff6b35]' />, label: 'Today Deliveries', value: totalDeliveriesToday || stats.totalDeliveries, color: 'text-[#ff6b35]' },
                        { icon: <FaWallet className='text-[#ffd93d]' />, label: 'Today Earning', value: `₹${totalEarning || stats.totalEarning}`, color: 'text-[#ffd93d]' },
                        { icon: <FaStar className='text-yellow-400' />, label: 'Rating', value: stats.rating > 0 ? `${stats.rating.toFixed(1)} ★` : 'No ratings', color: 'text-yellow-400' },
                        { icon: <FaCheckCircle className='text-green-400' />, label: 'Completion', value: stats.completionRate > 0 ? `${stats.completionRate}%` : '0%', color: 'text-green-400' }
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -4, scale: 1.02 }}
                            className='glass-premium-ultra p-4 rounded-2xl border border-white/5 text-center'
                        >
                            <div className='text-2xl mb-1'>{stat.icon}</div>
                            <div className={`text-xl font-bold text-white`}>{stat.value}</div>
                            <div className={`text-[10px] font-medium uppercase tracking-wider ${stat.color}`}>
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ✅ Current Order or Available Orders */}
                <AnimatePresence mode="wait">
                    {currentOrder ? (
                        <motion.div
                            key="current-order"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            className='glass-premium-ultra rounded-3xl border border-white/5 p-6 mb-6'
                        >
                            <div className='flex items-center justify-between mb-4'>
                                <h2 className='text-lg font-bold text-white flex items-center gap-2'>
                                    <FaTruck className='text-[#ff6b35]' /> Current Order
                                    <span className='text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full'>Active</span>
                                </h2>
                                <span className='text-white/30 text-xs'>#{currentOrder._id?.slice(-6) || 'N/A'}</span>
                            </div>

                            <div className='glass-premium-ultra p-4 rounded-2xl border border-white/5 mb-4'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-10 h-10 rounded-full bg-[#ff2d55]/20 flex items-center justify-center'>
                                        <FaStore className='text-[#ff6b35]' />
                                    </div>
                                    <div className='flex-1'>
                                        <p className='text-white font-semibold'>
                                            {currentOrder?.shopOrder?.shop?.name || 'Restaurant'}
                                        </p>
                                        <p className='text-white/40 text-sm flex items-center gap-1'>
                                            <FaMapMarkerAlt size={12} className='text-[#ff6b35]' />
                                            {currentOrder?.deliveryAddress?.text || 'Address not available'}
                                        </p>
                                    </div>
                                    <div className='text-right'>
                                        <p className='text-[#ff6b35] font-bold'>₹{currentOrder?.shopOrder?.subtotal || 0}</p>
                                        <p className='text-white/30 text-xs'>{currentOrder?.shopOrder?.shopOrderItems?.length || 0} items</p>
                                    </div>
                                </div>
                            </div>

                            <DeliveryBoyTracking data={{
                                deliveryBoyLocation: deliveryBoyLocation || { lat: 25.6191, lon: 85.1335 },
                                customerLocation: {
                                    lat: currentOrder?.deliveryAddress?.latitude || 25.6191,
                                    lon: currentOrder?.deliveryAddress?.longitude || 85.1335
                                }
                            }} />

                            {/* ✅ OTP Section */}
                            {!showOtpBox ? (
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className='mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50'
                                    onClick={sendOtp}
                                    disabled={loading}
                                >
                                    {loading ? <ClipLoader size={20} color='white' /> : <><FaCheckCircle size={18} /> Mark As Delivered</>}
                                </motion.button>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className='mt-4 p-4 rounded-2xl bg-white/5 border border-white/5'
                                >
                                    {/* ✅ OTP Display Box */}
                                    {otpDisplay && (
                                        <div className='mb-4 p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-center'>
                                            <div className='flex items-center justify-between mb-2'>
                                                <p className='text-white/60 text-xs uppercase tracking-wider'>🔑 Delivery OTP</p>
                                                <div className='flex items-center gap-2'>
                                                    <span className='text-xs text-white/30'>
                                                        ⏱️ {getRemainingTime() || 'Expired'}
                                                    </span>
                                                    <button 
                                                        onClick={copyOtpToClipboard}
                                                        className='text-white/40 hover:text-white transition text-xs p-1 rounded hover:bg-white/10'
                                                    >
                                                        <FaCopy size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className='text-5xl font-bold text-yellow-400 tracking-[0.3em] my-2 font-mono'>
                                                {otpDisplay}
                                            </p>
                                            <p className='text-white/40 text-xs'>
                                                Share this OTP with <span className='text-white font-medium'>{otpSentTo || 'Customer'}</span>
                                            </p>
                                            {otpSentEmail && (
                                                <p className='text-white/20 text-[10px] mt-1'>
                                                    📧 OTP sent to: {otpSentEmail}
                                                </p>
                                            )}
                                            <div className='mt-2 flex items-center justify-center gap-2'>
                                                <span className='text-[10px] text-yellow-400/50'>⏳ Expires in 5 minutes</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <p className='text-white/70 text-sm mb-3 flex items-center gap-2'>
                                        <FaBell className='text-yellow-400' />
                                        Enter OTP received from <span className='text-[#ff6b35] font-semibold'>{otpSentTo || 'Customer'}</span>
                                    </p>
                                    <div className='flex gap-2'>
                                        <input 
                                            type="text" 
                                            className="flex-1 bg-[#18181D] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff2d55]/50 text-sm font-mono tracking-widest"
                                            placeholder='Enter OTP'
                                            onChange={(e) => setOtp(e.target.value)}
                                            value={otp}
                                            maxLength={6}
                                        />
                                        <button 
                                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-[#ff2d55]/25"
                                            onClick={verifyOtp}
                                        >
                                            Verify
                                        </button>
                                    </div>
                                    {message && <p className='text-green-400 text-sm mt-2 text-center'>{message} ✅</p>}
                                    
                                    {/* ✅ Resend OTP Button */}
                                    <button 
                                        className='mt-3 text-xs text-white/40 hover:text-white transition-all duration-300 underline'
                                        onClick={sendOtp}
                                        disabled={loading}
                                    >
                                        {loading ? 'Sending...' : '🔄 Resend OTP'}
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="available-orders"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                            className='glass-premium-ultra rounded-3xl border border-white/5 p-6 mb-6'
                        >
                            <div className='flex items-center justify-between mb-4'>
                                <h2 className='text-lg font-bold text-white flex items-center gap-2'>
                                    <FaShoppingBag className='text-[#ff6b35]' /> Available Orders
                                    <span className='text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full'>
                                        {availableAssignments.length}
                                    </span>
                                </h2>
                                <button 
                                    className='text-xs text-[#ff6b35] hover:underline flex items-center gap-1'
                                    onClick={getAssignments}
                                >
                                    <FaSync size={12} className={fetching ? 'animate-spin' : ''} /> Refresh
                                </button>
                            </div>

                            {availableAssignments.length > 0 ? (
                                <div className='space-y-3 max-h-[400px] overflow-y-auto pr-2'>
                                    {availableAssignments.map((a, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`glass-premium-ultra p-4 rounded-2xl border transition-all duration-300 ${
                                                isApproved 
                                                    ? 'border-white/5 hover:border-[#ff2d55]/30' 
                                                    : 'border-yellow-500/20 opacity-60'
                                            }`}
                                        >
                                            <div className='flex items-start justify-between'>
                                                <div className='flex-1'>
                                                    <p className='text-white font-semibold flex items-center gap-2'>
                                                        {a?.shopName || 'Restaurant'}
                                                        <span className='text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full'>New</span>
                                                    </p>
                                                    <p className='text-white/40 text-sm flex items-center gap-1'>
                                                        <FaMapMarkerAlt size={12} className='text-[#ff6b35]' />
                                                        {a?.deliveryAddress?.text || 'Address not available'}
                                                    </p>
                                                    <p className='text-white/30 text-xs mt-1 flex items-center gap-2'>
                                                        <span>{a?.items?.length || 0} items</span>
                                                        <span className='w-1 h-1 rounded-full bg-white/20' />
                                                        <span className='text-[#ff6b35] font-medium'>₹{a?.subtotal || 0}</span>
                                                    </p>
                                                    <p className='text-white/20 text-[10px] mt-1'>
                                                        Order ID: #{a?.orderId?.slice(-6) || 'N/A'}
                                                    </p>
                                                </div>
                                                
                                                {isApproved ? (
                                                    <div className='flex flex-col gap-1.5'>
                                                        <motion.button 
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            className='px-4 py-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300'
                                                            onClick={() => acceptOrder(a.assignmentId)}
                                                            disabled={fetching}
                                                        >
                                                            {fetching ? <ClipLoader size={14} color='white' /> : '✅ Accept'}
                                                        </motion.button>
                                                        <motion.button 
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            className='px-4 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-medium shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-300'
                                                            onClick={() => rejectOrder(a.assignmentId)}
                                                            disabled={fetching}
                                                        >
                                                            {fetching ? <ClipLoader size={14} color='white' /> : '❌ Reject'}
                                                        </motion.button>
                                                    </div>
                                                ) : (
                                                    <div className='flex items-center gap-1 px-3 py-1.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium border border-yellow-500/20'>
                                                        <FaLock size={10} /> Pending
                                                    </div>
                                                )}
                                            </div>
                                            {!isApproved && (
                                                <div className='mt-2 text-[10px] text-yellow-400/50 flex items-center gap-1'>
                                                    <FaHourglassHalf size={10} /> Wait for admin approval
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className='text-center py-8'>
                                    <FaMotorcycle className='text-white/10 text-5xl mx-auto mb-3' />
                                    <p className='text-white/30 text-sm'>No orders available</p>
                                    <p className='text-white/20 text-xs'>Check back later for new assignments</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ✅ Today's Deliveries Chart */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className='glass-premium-ultra rounded-3xl border border-white/5 p-6'
                >
                    <div className='flex items-center justify-between mb-4'>
                        <h2 className='text-lg font-bold text-white flex items-center gap-2'>
                            <FaChartBar className='text-[#ff6b35]' /> Today's Deliveries
                        </h2>
                        <span className='text-white/30 text-sm'>{totalDeliveriesToday} deliveries</span>
                    </div>
                    
                    {todayDeliveries.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={todayDeliveries}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} stroke="#ffffff40" />
                                <YAxis allowDecimals={false} stroke="#ffffff40" />
                                <Tooltip 
                                    contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    labelStyle={{ color: '#ffffff' }}
                                    formatter={(value) => [`${value} orders`, 'Deliveries']}
                                    labelFormatter={(label) => `${label}:00`}
                                />
                                <Bar dataKey="count" fill="#ff2d55" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className='text-center py-8'>
                            <p className='text-white/30 text-sm'>No deliveries today</p>
                            <p className='text-white/20 text-xs'>Start accepting orders to see your progress</p>
                        </div>
                    )}

                    <div className='mt-4 pt-4 border-t border-white/5 flex items-center justify-between'>
                        <div>
                            <p className='text-white/40 text-xs font-medium uppercase tracking-wider'>Today's Earning</p>
                            <p className='text-2xl font-bold text-[#ffd93d]'>₹{totalEarning || stats.totalEarning}</p>
                        </div>
                        <div className='flex items-center gap-1 text-white/30 text-xs'>
                            <FaMedal className='text-yellow-400' />
                            <span>{totalDeliveriesToday} deliveries</span>
                        </div>
                    </div>
                </motion.div>
            </div>


            <style>{`
                .glass-premium-ultra {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }
                .overflow-y-auto::-webkit-scrollbar {
                    width: 4px;
                }
                .overflow-y-auto::-webkit-scrollbar-track {
                    background: transparent;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: rgba(255, 45, 85, 0.3);
                    border-radius: 10px;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .animate-pulse {
                    animation: pulse 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    )
}

export default DeliveryBoy

otp