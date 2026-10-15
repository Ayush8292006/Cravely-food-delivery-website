// src/components/DeliveryBoy.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../../config'
import { toast } from "react-toastify"
import { ClipLoader } from 'react-spinners'
import { motion, AnimatePresence } from 'framer-motion'
import DeliveryBoyNav from './DeliveryBoyNav.jsx'
import DeliveryBoyTracking from './DeliveryBoyTracking.jsx'
import DeliveryBoyRatingModal from './DeliveryBoyRatingModal.jsx'
import DeliveryBoyOrders from './DeliveryBoyOrders.jsx'
import { setUserData } from '../redux/userSlice.js'
import { 
    FaMotorcycle, FaMapMarkerAlt, FaTruck, FaClock, 
    FaRupeeSign, FaStar, FaShoppingBag, FaUser,
    FaCheckCircle, FaWallet, FaChartBar,
    FaStore, FaBox, FaSync, FaCircle, FaCopy,
    FaWifi, FaExclamationTriangle, FaEye, FaTimes as FaClose,
    FaBell, FaPhone, FaWhatsapp, FaShieldAlt, FaLock,
    FaHourglassHalf, FaSpinner, FaList, FaEnvelope
} from 'react-icons/fa'
import { MdVerified } from 'react-icons/md'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

// ✅ Notification Sound
const playNotificationSound = () => {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        oscillator.frequency.value = 800
        oscillator.type = 'sine'
        gainNode.gain.value = 0.3
        oscillator.start()
        setTimeout(() => {
            oscillator.frequency.value = 1000
        }, 100)
        setTimeout(() => {
            oscillator.stop()
        }, 300)
    } catch (error) {
        console.log('🔊 Notification sound error:', error)
    }
}

function DeliveryBoy() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { userData, socket } = useSelector(state => state.user)
    const { currentCity, currentState } = useSelector(state => state.user)
    
    // ✅ STATES
    const [availableAssignments, setAvailableAssignments] = useState([])
    const [currentOrder, setCurrentOrder] = useState(null)
    const [showOtpBox, setShowOtpBox] = useState(false)
    const [otp, setOtp] = useState("")
    const [todayDeliveries, setTodayDeliveries] = useState([])
    const [otpSentTo, setOtpSentTo] = useState("")
    const [otpSentEmail, setOtpSentEmail] = useState("")
    const [otpExpiry, setOtpExpiry] = useState(null)
    const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null)
    const [locationLoading, setLocationLoading] = useState(true)
    const [locationError, setLocationError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [fetching, setFetching] = useState(false)
    const [isOnline, setIsOnline] = useState(userData?.isOnline || true)
    const [isOffline, setIsOffline] = useState(!navigator.onLine)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showOrderDetail, setShowOrderDetail] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [showRatingModal, setShowRatingModal] = useState(false)
    const [completedOrderId, setCompletedOrderId] = useState(null)
    const [activeTab, setActiveTab] = useState('dashboard')
    const [deliveryStats, setDeliveryStats] = useState({
        totalDeliveries: 0,
        totalEarning: 0,
        rating: 0,
        ratingCount: 0,
        completionRate: 0
    })
    
    const locationUpdateTimeout = useRef(null)
    const lastLocationUpdate = useRef(0)

    // ✅ APPROVAL STATUS
    const isApproved = userData?.isApproved === true

    // ✅ Helper Functions
    const getShopOrderId = (order) => {
        if (!order) return null
        if (order.shopOrder?._id) return order.shopOrder._id
        if (order.shopOrders?.[0]?._id) return order.shopOrders[0]._id
        if (order.shopOrderId) return order.shopOrderId
        return null
    }

    const getShopName = (order) => {
        if (!order) return 'Restaurant'
        if (order.shopOrder?.shop?.name) return order.shopOrder.shop.name
        if (order.shopOrders?.[0]?.shop?.name) return order.shopOrders[0].shop.name
        return 'Restaurant'
    }

    const getSubtotal = (order) => {
        if (!order) return 0
        if (order.shopOrder?.subtotal) return order.shopOrder.subtotal
        if (order.shopOrders?.[0]?.subtotal) return order.shopOrders[0].subtotal
        return 0
    }

    // ✅ EARNINGS & STATS
    const totalEarnings = userData?.earnings || deliveryStats.totalEarning || 0
    const totalDeliveriesCount = userData?.totalDeliveries || deliveryStats.totalDeliveries || 0
    const ratePerDelivery = 50
    const todayEarning = todayDeliveries.reduce((sum, d) => sum + d.count * ratePerDelivery, 0)
    const totalDeliveriesToday = todayDeliveries.reduce((sum, d) => sum + d.count, 0)
    const rating = userData?.deliveryBoyRating?.average || deliveryStats.rating || 0

    // ✅ FETCH DELIVERY STATS
    const fetchDeliveryStats = useCallback(async () => {
        if (isOffline || !userData?._id) return
        
        try {
            console.log("📊 Fetching stats...")
            const response = await axios.get(`${serverUrl}/api/user/delivery-boy/${userData._id}`, {
                withCredentials: true
            })
            
            console.log("✅ Stats:", response.data)
            
            if (response.data?.success) {
                setDeliveryStats({
                    totalDeliveries: response.data.totalDeliveries || 0,
                    totalEarning: response.data.totalEarning || 0,
                    rating: response.data.deliveryBoyRating?.average || 0,
                    ratingCount: response.data.deliveryBoyRating?.count || 0,
                    completionRate: response.data.completionRate || 0
                })
            }
        } catch (error) {
            console.log("❌ Stats error:", error.message)
        }
    }, [userData?._id, isOffline])

    // ✅ FETCH FUNCTIONS
    const fetchAssignments = useCallback(async () => {
        if (isOffline) return []
        try {
            const response = await axios.get(`${serverUrl}/api/order/get-assignments`, { 
                withCredentials: true 
            })
            console.log("📦 Assignments:", response.data?.count || 0)
            
            if (response.data?.assignments && Array.isArray(response.data.assignments)) {
                return response.data.assignments
            }
            if (Array.isArray(response.data)) {
                return response.data
            }
            return []
        } catch (error) {
            console.log('❌ Assignments error:', error.message)
            return []
        }
    }, [isOffline])

    const fetchCurrentOrder = useCallback(async () => {
        if (isOffline) return null
        try {
            const response = await axios.get(`${serverUrl}/api/order/get-current-order`, { 
                withCredentials: true 
            })
            console.log("📦 Current Order:", response.data?.order?._id || 'None')
            
            if (response.data?.order) {
                return response.data.order
            }
            return null
        } catch (error) {
            console.log('❌ Current order error:', error.message)
            return null
        }
    }, [isOffline])

    const fetchTodayDeliveries = useCallback(async () => {
        if (isOffline) return []
        try {
            const response = await axios.get(`${serverUrl}/api/order/get-today-deliveries`, { 
                withCredentials: true 
            })
            
            if (Array.isArray(response.data)) {
                return response.data
            }
            return []
        } catch (error) {
            console.log('❌ Today deliveries error:', error.message)
            return []
        }
    }, [isOffline])

    const fetchAllData = useCallback(async () => {
        if (isOffline) {
            console.log("⏳ Offline, skipping")
            return
        }

        setFetching(true)
        try {
            const [assignments, currentOrderData, deliveries] = await Promise.all([
                fetchAssignments(),
                fetchCurrentOrder(),
                fetchTodayDeliveries()
            ])

            setAvailableAssignments(assignments || [])
            setCurrentOrder(currentOrderData || null)
            setTodayDeliveries(deliveries || [])
            await fetchDeliveryStats()

        } catch (error) {
            console.log('❌ Fetch error:', error)
        } finally {
            setFetching(false)
            setInitialLoading(false)
        }
    }, [isOffline, fetchAssignments, fetchCurrentOrder, fetchTodayDeliveries, fetchDeliveryStats])

    // ✅ REFRESH
    const refreshAll = useCallback(() => {
        fetchAllData()
        toast.info('🔄 Refreshing...')
    }, [fetchAllData])

    // ✅ INITIAL LOAD
    useEffect(() => {
        if (userData?.role === 'deliveryBoy') {
            fetchAllData()
        }
    }, [userData, fetchAllData])

    // ✅ LOCATION TRACKING
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError("Browser doesn't support geolocation")
            setLocationLoading(false)
            return
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const latitude = position.coords.latitude
                const longitude = position.coords.longitude
                setDeliveryBoyLocation({ lat: latitude, lon: longitude })
                setLocationLoading(false)
                setLocationError(null)
            },
            (error) => {
                console.log("❌ Geolocation error:", error.message)
                setLocationLoading(false)
                setLocationError("Location unavailable")
            },
            { enableHighAccuracy: true, timeout: 15000 }
        )

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId)
        }
    }, [])

    // ✅ ONLINE/OFFLINE
    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false)
            toast.info('🟢 Back online!')
            refreshAll()
        }
        const handleOffline = () => {
            setIsOffline(true)
            toast.warning('🔴 You are offline!')
        }
        
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
        
        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [refreshAll])

    // ✅ SOCKET EVENTS
    useEffect(() => {
        if (!socket) return

        socket.on('newAssignment', (data) => {
            if (data.sentTo === userData?._id) {
                setAvailableAssignments(prev => [...prev, data])
                toast.info(`🛵 New delivery from ${data.shopName}`)
                playNotificationSound()
                refreshAll()
            }
        })

        return () => {
            socket.off('newAssignment')
        }
    }, [socket, userData?._id, refreshAll])

    // ✅ ACCEPT ORDER
    const acceptOrder = async (assignmentId) => {
        if (isOffline) {
            toast.error('❌ You are offline.')
            return
        }
        if (!isApproved) {
            toast.warning('⚠️ Pending approval.')
            return
        }
        
        setFetching(true)
        try {
            const response = await axios.get(`${serverUrl}/api/order/accept-order/${assignmentId}`, { 
                withCredentials: true 
            })
            console.log("✅ Accepted:", response.data)
            toast.success('✅ Order accepted!')
            playNotificationSound()
            await fetchAllData()
        } catch (error) {
            console.log('❌ Accept error:', error)
            toast.error(error.response?.data?.message || '❌ Failed to accept')
        } finally {
            setFetching(false)
        }
    }

    // ✅ REJECT ORDER
    const rejectOrder = async (assignmentId) => {
        if (isOffline) {
            toast.error('❌ You are offline.')
            return
        }
        
        setFetching(true)
        try {
            await axios.post(
                `${serverUrl}/api/order/reject-order/${assignmentId}`, 
                {},
                { withCredentials: true }
            )
            toast.info('❌ Order rejected')
            await fetchAllData()
        } catch (error) {
            console.log('❌ Reject error:', error)
            toast.error('❌ Failed to reject')
        } finally {
            setFetching(false)
        }
    }

    // ✅ SEND OTP - OTP SENT TO CUSTOMER ONLY (Delivery Boy DOES NOT see OTP)
    const sendOtp = async () => {
        if (!currentOrder) {
            toast.error('No active order')
            return
        }
        if (isOffline) {
            toast.error('❌ Offline.')
            return
        }
        
        const shopOrderId = getShopOrderId(currentOrder)
        console.log("🔑 ShopOrder ID:", shopOrderId)
        
        if (!shopOrderId) {
            toast.error('❌ Shop order not found')
            return
        }
        
        setLoading(true)
        try {
            const response = await axios.post(`${serverUrl}/api/order/send-delivery-otp`, {
                orderId: currentOrder._id,
                shopOrderId: shopOrderId
            }, { withCredentials: true })
            
            console.log("✅ OTP Response:", response.data)
            
            // ✅ Store customer info but NOT the OTP
            setOtpSentTo(response.data.userName || 'Customer')
            setOtpSentEmail(response.data.userEmail || '')
            setOtpExpiry(new Date(Date.now() + 5 * 60 * 1000))
            setShowOtpBox(true)
            
            toast.success(`📩 OTP sent to ${response.data.userName || 'Customer'}`)
            toast.info(`📧 Check customer's email for OTP`)
            
        } catch (error) {
            console.log('❌ OTP error:', error)
            toast.error(error.response?.data?.message || "❌ Failed to send OTP")
        } finally {
            setLoading(false)
        }
    }

    // ✅ VERIFY OTP - WITH EARNINGS UPDATE
    const verifyOtp = async () => {
        if (!otp || otp.length < 4) {
            toast.error('Enter valid OTP')
            return
        }
        if (isOffline) {
            toast.error('❌ Offline.')
            return
        }
        
        const shopOrderId = getShopOrderId(currentOrder)
        if (!shopOrderId) {
            toast.error('❌ Shop order not found')
            return
        }
        
        setMessage("")
        setLoading(true)
        try {
            const result = await axios.post(`${serverUrl}/api/order/verify-delivery-otp`, {
                orderId: currentOrder._id,
                shopOrderId: shopOrderId,
                otp
            }, { withCredentials: true })
            
            console.log("✅ Verify OTP Response:", result.data)
            
            setMessage("✅ Order delivered! +₹50 earned!")
            toast.success("✅ Order delivered! +₹50 earned!")
            
            // ✅ Update earnings in state
            if (result.data.success) {
                // Update local stats
                setDeliveryStats(prev => ({
                    ...prev,
                    totalDeliveries: (prev.totalDeliveries || 0) + 1,
                    totalEarning: (prev.totalEarning || 0) + 50
                }))
                
                // ✅ Update Redux user data
                if (result.data.deliveryBoy) {
                    const updatedUser = {
                        ...userData,
                        earnings: result.data.deliveryBoy.earnings,
                        totalDeliveries: result.data.deliveryBoy.totalDeliveries
                    }
                    dispatch(setUserData(updatedUser))
                    console.log("💰 Updated earnings in Redux:", updatedUser.earnings)
                }
            }
            
            setCompletedOrderId(currentOrder._id)
            setShowRatingModal(true)
            
            // ✅ Refresh all data
            setTimeout(() => {
                fetchAllData()
                fetchDeliveryStats()
                // ✅ Force refresh user data from backend
                axios.get(`${serverUrl}/api/user/current`, { withCredentials: true })
                    .then(res => {
                        if (res.data) {
                            console.log("🔄 Refreshed user data:", res.data)
                            dispatch(setUserData(res.data))
                        }
                    })
                    .catch(err => console.log("❌ User refresh error:", err))
            }, 500)
            
        } catch (error) {
            console.log('❌ Verify error:', error)
            console.log('❌ Error Response:', error.response?.data)
            toast.error(error.response?.data?.message || "❌ Invalid OTP")
        } finally {
            setLoading(false)
        }
    }

    // ✅ COPY OTP - REMOVED (Delivery Boy doesn't have OTP to copy)
    // const copyOtpToClipboard = () => { ... } // ✅ REMOVED

    // ✅ OPEN ORDER DETAIL
    const openOrderDetail = (order) => {
        setSelectedOrder(order)
        setShowOrderDetail(true)
    }

    // ✅ GET REMAINING TIME
    const getRemainingTime = () => {
        if (!otpExpiry) return null
        const diff = Math.floor((otpExpiry - new Date()) / 1000)
        if (diff <= 0) return null
        return `${Math.floor(diff / 60)}:${(diff % 60).toString().padStart(2, '0')}`
    }

    // ✅ GET STATUS COLOR
    const getStatusColor = (status) => {
        const colors = {
            delivered: 'bg-green-100 text-green-700 border-green-200',
            cancelled: 'bg-red-100 text-red-700 border-red-200',
            pending: 'bg-amber-100 text-amber-700 border-amber-200',
            'out of delivery': 'bg-orange-100 text-orange-700 border-orange-200',
            preparing: 'bg-blue-100 text-blue-700 border-blue-200'
        }
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200'
    }

    // ✅ LOADING
    if (initialLoading) {
        return (
            <div className="min-h-screen bg-[#f8f4f0] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
                    <p className="text-gray-500 text-sm font-medium animate-pulse">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-[#f8f4f0] pt-[70px] pb-[70px] md:pb-0'>
            
            <DeliveryBoyNav />

            {isOffline && (
                <div className='fixed top-[70px] left-0 right-0 z-40 bg-red-500 p-2 text-center'>
                    <div className='flex items-center justify-center gap-2 text-white text-sm font-medium'>
                        <FaExclamationTriangle size={16} />
                        <span>You are offline!</span>
                    </div>
                </div>
            )}

            {!isOffline && (
                <div className='fixed bottom-4 right-4 z-40 flex items-center gap-2 bg-white border-2 border-green-300 px-3 py-1.5 rounded-full shadow-md'>
                    <FaWifi className='text-green-500 text-xs' />
                    <span className='text-green-600 text-[10px] font-bold'>Online</span>
                </div>
            )}

            <div className='relative z-10 max-w-5xl mx-auto px-4 py-6'>
                
                {/* ✅ HEADER */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='bg-white border-2 border-gray-200 p-6 rounded-3xl shadow-sm mb-6'
                >
                    <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                        <div className='flex items-center gap-4'>
                            <div className='w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center shadow-md shadow-orange-200'>
                                <FaMotorcycle className='text-white text-3xl' />
                            </div>
                            <div>
                                <h1 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
                                    Welcome, {userData?.fullName || 'Delivery Boy'}
                                    <MdVerified className='text-blue-500 text-lg' />
                                </h1>
                                <div className='flex items-center gap-3 text-sm flex-wrap'>
                                    <span className={`flex items-center gap-1.5 font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                                        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                        {isOnline ? 'Online' : 'Offline'}
                                    </span>
                                    <span className='text-gray-300'>|</span>
                                    <span className={`flex items-center gap-1.5 font-medium ${isApproved ? 'text-green-600' : 'text-amber-600'}`}>
                                        {isApproved ? '✅ Verified' : '⏳ Pending Approval'}
                                    </span>
                                    <span className='text-gray-300'>|</span>
                                    <span className='text-gray-500 text-xs flex items-center gap-1 font-medium'>
                                        <FaStar className='text-amber-400' />
                                        {rating > 0 ? rating.toFixed(1) : 'No ratings'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className='flex items-center gap-3 flex-wrap'>
                            <div className='bg-gray-50 border-2 border-gray-200 px-4 py-2 rounded-full flex items-center gap-2'>
                                <FaWallet className='text-amber-500' />
                                <span className='text-gray-800 font-bold'>₹{totalEarnings}</span>
                                <span className='text-gray-400 text-xs'>Earnings</span>
                            </div>
                            <button
                                className='px-3 py-2 rounded-full bg-white border-2 border-gray-200 text-gray-600 hover:border-orange-300 transition-all disabled:opacity-50'
                                onClick={refreshAll}
                                disabled={fetching || isOffline}
                            >
                                <FaSync className={fetching ? 'animate-spin' : ''} size={14} />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* ✅ TABS */}
                <div className='flex gap-2 mb-6 overflow-x-auto pb-2'>
                    {[
                        { id: 'dashboard', icon: <FaMotorcycle size={14} />, label: 'Dashboard' },
                        { id: 'orders', icon: <FaList size={14} />, label: 'My Orders' },
                        { id: 'stats', icon: <FaChartBar size={14} />, label: 'Statistics' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 border-2 whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'bg-orange-500 text-white border-orange-600'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'dashboard' && (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {!isApproved && (
                                <div className='bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl mb-6'>
                                    <div className='flex items-center gap-3'>
                                        <FaShieldAlt className='text-amber-600 text-xl' />
                                        <div>
                                            <h3 className='text-amber-800 font-bold text-sm'>⚠️ Pending Approval</h3>
                                            <p className='text-amber-600 text-xs'>Wait for admin approval to accept orders.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STATS */}
                            <div className='grid grid-cols-2 md:grid-cols-5 gap-3 mb-6'>
                                {[
                                    { icon: <FaTruck className='text-orange-500 text-xl' />, label: 'Total', value: totalDeliveriesCount, color: 'text-orange-600' },
                                    { icon: <FaWallet className='text-amber-500 text-xl' />, label: 'Earnings', value: `₹${totalEarnings}`, color: 'text-amber-600' },
                                    { icon: <FaStar className='text-amber-400 text-xl' />, label: 'Rating', value: rating > 0 ? `${rating.toFixed(1)} ★` : 'No ratings', color: 'text-amber-600' },
                                    { icon: <FaCheckCircle className='text-green-500 text-xl' />, label: 'Today', value: totalDeliveriesToday, color: 'text-green-600' },
                                    { icon: <FaClock className='text-blue-500 text-xl' />, label: 'Today ₹', value: `₹${todayEarning}`, color: 'text-blue-600' }
                                ].map((stat, idx) => (
                                    <motion.div
                                        key={idx}
                                        whileHover={{ y: -4 }}
                                        className='bg-white border-2 border-gray-200 p-4 rounded-2xl text-center shadow-sm'
                                    >
                                        <div className='text-2xl mb-1'>{stat.icon}</div>
                                        <div className='text-xl font-bold text-gray-800'>{stat.value}</div>
                                        <div className={`text-[10px] font-bold uppercase tracking-wider ${stat.color}`}>
                                            {stat.label}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* CURRENT ORDER */}
                            {currentOrder ? (
                                <div className='bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm'>
                                    <div className='flex items-center justify-between mb-4'>
                                        <h2 className='text-lg font-bold flex items-center gap-2'>
                                            <FaTruck className='text-orange-500' /> Current Order
                                            <span className='text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full border-2 border-green-200 font-bold'>Active</span>
                                        </h2>
                                        <span className='text-gray-400 text-xs font-mono'>#{currentOrder._id?.slice(-6) || 'N/A'}</span>
                                    </div>

                                    <div className='bg-gray-50 border-2 border-gray-200 p-4 rounded-2xl mb-4'>
                                        <div className='flex items-center gap-3'>
                                            <div className='w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center'>
                                                <FaStore className='text-orange-500' />
                                            </div>
                                            <div className='flex-1'>
                                                <p className='text-gray-800 font-bold'>{getShopName(currentOrder)}</p>
                                                <p className='text-gray-500 text-sm'>{currentOrder?.deliveryAddress?.text || 'Address not available'}</p>
                                            </div>
                                            <div className='text-right'>
                                                <p className='text-orange-600 font-bold'>₹{getSubtotal(currentOrder)}</p>
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

                                    {/* ✅ OTP SECTION - OTP HIDDEN FROM DELIVERY BOY */}
                                    {!showOtpBox ? (
                                        <button 
                                            className='mt-4 w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50'
                                            onClick={sendOtp}
                                            disabled={loading || isOffline}
                                        >
                                            {loading ? <ClipLoader size={20} color='white' /> : <><FaCheckCircle size={18} /> Send OTP to Customer</>}
                                        </button>
                                    ) : (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className='mt-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-200'
                                        >
                                            {/* ✅ OTP NOT SHOWN - Only message that OTP was sent */}
                                            <div className='mb-4 p-4 rounded-xl bg-amber-100 border-2 border-amber-300 text-center'>
                                                <div className='flex items-center justify-center gap-2 mb-2'>
                                                    <FaEnvelope className='text-amber-600 text-xl' />
                                                    <p className='text-amber-700 text-sm font-bold uppercase tracking-wider'>📩 OTP Sent!</p>
                                                </div>
                                                <p className='text-amber-700 text-base font-medium'>
                                                    OTP has been sent to <span className='text-amber-800 font-bold'>{otpSentTo || 'Customer'}</span>
                                                </p>
                                                {otpSentEmail && (
                                                    <p className='text-amber-500 text-xs mt-1 font-medium'>
                                                        📧 Sent to: {otpSentEmail}
                                                    </p>
                                                )}
                                                <div className='mt-2 flex items-center justify-center gap-2'>
                                                    <span className='text-xs text-amber-600 font-bold bg-amber-200/50 px-3 py-1 rounded-full'>
                                                        ⏱️ {getRemainingTime() || 'Expired'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <p className='text-gray-700 text-sm mb-3 flex items-center gap-2 font-medium'>
                                                <FaBell className='text-amber-500' />
                                                Enter OTP received from <span className='text-orange-600 font-bold'>{otpSentTo || 'Customer'}</span>
                                            </p>
                                            <div className='flex gap-2'>
                                                <input 
                                                    type="text" 
                                                    className="flex-1 bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-orange-400 text-sm font-mono tracking-widest"
                                                    placeholder='Enter OTP'
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    value={otp}
                                                    maxLength={6}
                                                />
                                                <button 
                                                    className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold disabled:opacity-50"
                                                    onClick={verifyOtp}
                                                    disabled={isOffline}
                                                >
                                                    Verify
                                                </button>
                                            </div>
                                            {message && <p className='text-green-600 text-sm mt-2 text-center font-bold'>{message}</p>}
                                        </motion.div>
                                    )}
                                </div>
                            ) : (
                                <div className='bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm'>
                                    <div className='flex items-center justify-between mb-4'>
                                        <h2 className='text-lg font-bold flex items-center gap-2'>
                                            <FaShoppingBag className='text-orange-500' /> Available Orders
                                            <span className='text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border-2 border-amber-200 font-bold'>
                                                {availableAssignments.length}
                                            </span>
                                        </h2>
                                        <button 
                                            className='text-xs text-orange-600 hover:underline flex items-center gap-1 font-bold disabled:opacity-50'
                                            onClick={refreshAll}
                                            disabled={fetching || isOffline}
                                        >
                                            <FaSync size={12} className={fetching ? 'animate-spin' : ''} /> Refresh
                                        </button>
                                    </div>

                                    {availableAssignments.length > 0 ? (
                                        <div className='space-y-3 max-h-[400px] overflow-y-auto pr-2'>
                                            {availableAssignments.map((a, index) => (
                                                <motion.div
                                                    key={a._id || index}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`bg-gray-50 border-2 p-4 rounded-2xl ${
                                                        isApproved ? 'border-gray-200 hover:border-orange-300' : 'border-amber-200 opacity-60'
                                                    }`}
                                                >
                                                    <div className='flex items-start justify-between'>
                                                        <div className='flex-1'>
                                                            <p className='text-gray-800 font-bold'>{a?.shop?.name || a?.shopName || 'Restaurant'}</p>
                                                            <p className='text-gray-500 text-sm'>{a?.deliveryAddress?.text || 'Address not available'}</p>
                                                            <p className='text-gray-400 text-xs mt-1'>
                                                                {a?.items?.length || 0} items • ₹{a?.subtotal || 0}
                                                            </p>
                                                        </div>
                                                        
                                                        {isApproved ? (
                                                            <div className='flex flex-col gap-1.5'>
                                                                <button 
                                                                    className='px-4 py-1.5 rounded-full bg-green-500 hover:bg-green-600 text-white text-xs font-bold disabled:opacity-50'
                                                                    onClick={() => acceptOrder(a._id || a.assignmentId)}
                                                                    disabled={fetching || isOffline}
                                                                >
                                                                    {fetching ? <ClipLoader size={14} color='white' /> : '✅ Accept'}
                                                                </button>
                                                                <button 
                                                                    className='px-4 py-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold disabled:opacity-50'
                                                                    onClick={() => rejectOrder(a._id || a.assignmentId)}
                                                                    disabled={fetching || isOffline}
                                                                >
                                                                    ❌ Reject
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className='px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold border-2 border-amber-200'>
                                                                <FaLock className='inline mr-1' /> Pending
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className='text-center py-8'>
                                            <FaMotorcycle className='text-gray-300 text-5xl mx-auto mb-3' />
                                            <p className='text-gray-500 text-sm font-medium'>No orders available</p>
                                            <p className='text-gray-400 text-xs'>Check back later</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'orders' && (
                        <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <DeliveryBoyOrders />
                        </motion.div>
                    )}

                    {activeTab === 'stats' && (
                        <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className='bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm'>
                                <h2 className='text-lg font-bold flex items-center gap-2 mb-4'>
                                    <FaChartBar className='text-orange-500' /> Statistics
                                </h2>
                                
                                {todayDeliveries.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={todayDeliveries}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} stroke="#9ca3af" />
                                            <YAxis allowDecimals={false} stroke="#9ca3af" />
                                            <Tooltip 
                                                contentStyle={{ background: 'white', border: '2px solid #e5e7eb', borderRadius: '12px' }}
                                                formatter={(value) => [`${value} orders`, 'Deliveries']}
                                            />
                                            <Bar dataKey="count" fill="#e85d04" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className='text-center py-8'>
                                        <p className='text-gray-500'>No deliveries today</p>
                                    </div>
                                )}

                                <div className='mt-4 pt-4 border-t-2 border-gray-200 grid grid-cols-2 gap-4'>
                                    <div>
                                        <p className='text-gray-500 text-xs font-bold uppercase'>Today's Earnings</p>
                                        <p className='text-lg font-bold text-amber-600'>₹{todayEarning}</p>
                                    </div>
                                    <div className='text-right'>
                                        <p className='text-gray-500 text-xs font-bold uppercase'>Today's Deliveries</p>
                                        <p className='text-lg font-bold text-orange-600'>{totalDeliveriesToday}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ORDER DETAIL MODAL */}
            <AnimatePresence>
                {showOrderDetail && selectedOrder && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999] p-4'
                        onClick={() => setShowOrderDetail(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className='bg-white max-w-md w-full max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-gray-200 p-6 shadow-xl'
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className='flex items-center justify-between mb-4'>
                                <h2 className='text-xl font-bold flex items-center gap-2'>
                                    <FaBox className='text-orange-500' /> Order Details
                                </h2>
                                <button onClick={() => setShowOrderDetail(false)}>
                                    <FaClose size={20} />
                                </button>
                            </div>

                            <div className='space-y-3'>
                                <div className='p-3 rounded-xl bg-gray-50 border-2 border-gray-200'>
                                    <p className='text-gray-500 text-[10px] font-bold uppercase'>Order ID</p>
                                    <p className='text-gray-800 font-mono font-bold'>#{selectedOrder._id?.slice(-8).toUpperCase()}</p>
                                </div>

                                <div className='p-3 rounded-xl bg-gray-50 border-2 border-gray-200'>
                                    <p className='text-gray-500 text-[10px] font-bold uppercase'>Status</p>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full border-2 ${getStatusColor(selectedOrder.status || 'pending')}`}>
                                        {selectedOrder.status || 'Pending'}
                                    </span>
                                </div>

                                <div className='p-3 rounded-xl bg-gray-50 border-2 border-gray-200'>
                                    <p className='text-gray-500 text-[10px] font-bold uppercase'>Restaurant</p>
                                    <p className='text-gray-800 font-bold'>{selectedOrder.shopOrder?.shop?.name || 'N/A'}</p>
                                </div>

                                <div className='p-3 rounded-xl bg-gray-50 border-2 border-gray-200'>
                                    <p className='text-gray-500 text-[10px] font-bold uppercase'>Customer</p>
                                    <p className='text-gray-800 font-bold'>{selectedOrder.user?.fullName || 'N/A'}</p>
                                    <p className='text-gray-500 text-sm flex items-center gap-2'>
                                        <FaPhone size={10} className="text-orange-500" /> {selectedOrder.user?.mobile || 'N/A'}
                                    </p>
                                    <p className='text-gray-500 text-sm flex items-center gap-2'>
                                        <FaMapMarkerAlt size={10} className="text-orange-500" /> {selectedOrder.deliveryAddress?.text || 'N/A'}
                                    </p>
                                </div>

                                <div className='p-3 rounded-xl bg-gray-50 border-2 border-gray-200'>
                                    <p className='text-gray-500 text-[10px] font-bold uppercase'>Items</p>
                                    {selectedOrder.shopOrder?.shopOrderItems?.map((item, idx) => (
                                        <div key={idx} className='flex justify-between text-sm border-b-2 border-gray-200 py-1 last:border-0'>
                                            <span>{item.name} × {item.quantity}</span>
                                            <span className='font-bold'>₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className='p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200'>
                                    <p className='text-gray-500 text-[10px] font-bold uppercase'>Total</p>
                                    <p className='text-2xl font-bold text-orange-600'>₹{selectedOrder.totalAmount || 0}</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* RATING MODAL */}
            {showRatingModal && completedOrderId && (
                <DeliveryBoyRatingModal 
                    orderId={completedOrderId}
                    onClose={() => {
                        setShowRatingModal(false)
                        setCompletedOrderId(null)
                    }}
                    onRatingSubmitted={() => {
                        toast.success('🌟 Thank you for rating!')
                        refreshAll()
                    }}
                />
            )}
        </div>
    )
}

export default DeliveryBoy