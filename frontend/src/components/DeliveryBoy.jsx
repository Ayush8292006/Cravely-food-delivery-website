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
import { 
    FaMotorcycle, FaMapMarkerAlt, FaTruck, FaClock, 
    FaRupeeSign, FaStar, FaShoppingBag, FaUser,
    FaCheckCircle, FaWallet, FaChartBar,
    FaStore, FaBox, FaSync, FaShieldAlt, FaLock,
    FaPhone, FaEnvelope, FaList, FaExclamationTriangle
} from 'react-icons/fa'
import { MdVerified } from 'react-icons/md'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function DeliveryBoy() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { userData, socket } = useSelector(state => state.user)
    
    const [availableAssignments, setAvailableAssignments] = useState([])
    const [currentOrder, setCurrentOrder] = useState(null)
    const [showOtpBox, setShowOtpBox] = useState(false)
    const [otp, setOtp] = useState("")
    const [todayDeliveries, setTodayDeliveries] = useState([])
    const [otpSentTo, setOtpSentTo] = useState("")
    const [otpSentEmail, setOtpSentEmail] = useState("")
    const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [fetching, setFetching] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard', 'orders', 'stats'
    const [showRatingModal, setShowRatingModal] = useState(false)
    const [completedOrderId, setCompletedOrderId] = useState(null)

    const [deliveryStats, setDeliveryStats] = useState({
        totalDeliveries: 0,
        totalEarning: 0,
        rating: 0,
        ratingCount: 0
    })

    const isApproved = userData?.isApproved === true

    // Fetch Delivery Boy Stats
    const fetchDeliveryStats = useCallback(async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/order/delivery-stats`, {
                withCredentials: true
            })
            if (res.data) {
                setDeliveryStats(res.data)
            }
        } catch (err) {
            console.log('Error fetching rider stats:', err)
        }
    }, [])

    // Fetch Current Active Delivery
    const fetchCurrentOrder = useCallback(async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/order/get-current-order`, {
                withCredentials: true
            })
            if (res.data && res.data._id) {
                setCurrentOrder(res.data)
                return res.data
            }
            setCurrentOrder(null)
            return null
        } catch (err) {
            console.log('Error fetching current delivery:', err)
            setCurrentOrder(null)
            return null
        }
    }, [])

    // Fetch Broadcast Assignments
    const fetchAssignments = useCallback(async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/order/get-assignments`, {
                withCredentials: true
            })
            const list = res.data?.assignments || res.data || []
            setAvailableAssignments(Array.isArray(list) ? list : [])
            return list
        } catch (err) {
            console.log('Error fetching broadcast assignments:', err)
            setAvailableAssignments([])
            return []
        }
    }, [])

    // Fetch Today's Deliveries for Chart
    const fetchTodayDeliveries = useCallback(async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/order/get-today-deliveries`, {
                withCredentials: true
            })
            const data = res.data || []
            setTodayDeliveries(Array.isArray(data) ? data : [])
            return data
        } catch (err) {
            console.log('Error fetching today deliveries:', err)
            return []
        }
    }, [])

    const fetchAllData = useCallback(async () => {
        setFetching(true)
        try {
            await Promise.all([
                fetchAssignments(),
                fetchCurrentOrder(),
                fetchTodayDeliveries(),
                fetchDeliveryStats()
            ])
        } finally {
            setFetching(false)
            setInitialLoading(false)
        }
    }, [fetchAssignments, fetchCurrentOrder, fetchTodayDeliveries, fetchDeliveryStats])

    useEffect(() => {
        fetchAllData()
    }, [fetchAllData])

    // Real-time Socket Listener for incoming orders & assignments
    useEffect(() => {
        if (!socket) return

        const handleNewAssignment = (data) => {
            if (data.sentTo === userData?._id || !data.sentTo) {
                toast.info(`🛵 New delivery available from ${data.shopName || 'Restaurant'}!`)
                fetchAllData()
            }
        }

        socket.on('newAssignment', handleNewAssignment)
        return () => {
            socket.off('newAssignment', handleNewAssignment)
        }
    }, [socket, userData?._id, fetchAllData])

    // Watch Geolocation
    useEffect(() => {
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    setDeliveryBoyLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude })
                },
                (err) => console.log('Location error:', err.message),
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            )
            return () => navigator.geolocation.clearWatch(watchId)
        }
    }, [])

    // Accept Order
    const handleAcceptOrder = async (assignmentId) => {
        setFetching(true)
        try {
            await axios.get(`${serverUrl}/api/order/accept-order/${assignmentId}`, {
                withCredentials: true
            })
            toast.success('Order accepted! Head over to the restaurant.')
            fetchAllData()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to accept order')
        } finally {
            setFetching(false)
        }
    }

    // Reject Order
    const handleRejectOrder = async (assignmentId) => {
        setFetching(true)
        try {
            await axios.post(`${serverUrl}/api/order/reject-order/${assignmentId}`, {}, {
                withCredentials: true
            })
            toast.info('Order skipped')
            fetchAllData()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reject order')
        } finally {
            setFetching(false)
        }
    }

    // Send OTP to Customer
    const handleSendOtp = async () => {
        if (!currentOrder) return
        const shopOrder = currentOrder.shopOrders?.[0] || currentOrder.shopOrder
        const shopOrderId = shopOrder?._id

        setLoading(true)
        try {
            const res = await axios.post(`${serverUrl}/api/order/send-delivery-otp`, {
                orderId: currentOrder._id,
                shopOrderId: shopOrderId
            }, { withCredentials: true })

            setOtpSentTo(res.data.userName || 'Customer')
            setOtpSentEmail(res.data.userEmail || '')
            setShowOtpBox(true)
            toast.success(`OTP sent to customer (${res.data.userName || 'Customer'})`)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP')
        } finally {
            setLoading(false)
        }
    }

    // Verify OTP & Complete Delivery
    const handleVerifyOtp = async () => {
        if (!otp || otp.length < 4) {
            toast.warning('Please enter the 6-digit OTP provided by customer')
            return
        }
        const shopOrder = currentOrder.shopOrders?.[0] || currentOrder.shopOrder
        const shopOrderId = shopOrder?._id

        setLoading(true)
        try {
            const res = await axios.post(`${serverUrl}/api/order/verify-delivery-otp`, {
                orderId: currentOrder._id,
                shopOrderId,
                otp
            }, { withCredentials: true })

            toast.success('🎉 Delivery completed successfully! +₹50 credited to your wallet.')
            setShowOtpBox(false)
            setOtp('')
            setCompletedOrderId(currentOrder._id)
            setShowRatingModal(true)
            fetchAllData()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid delivery OTP')
        } finally {
            setLoading(false)
        }
    }

    const totalEarnings = userData?.earnings ?? deliveryStats.totalEarning ?? 0
    const totalDeliveries = userData?.totalDeliveries ?? deliveryStats.totalDeliveries ?? 0
    const rating = deliveryStats.rating || 4.9

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-[#0A090D] text-white flex flex-col items-center justify-center">
                <ClipLoader size={50} color="#FF6B00" />
                <p className="mt-4 text-xs text-gray-400 animate-pulse">Loading rider fleet portal...</p>
            </div>
        )
    }

    return (
        <div 
            className="min-h-screen bg-[#0A090D] text-white pt-[90px] pb-24 px-4 sm:px-6 lg:px-8 selection:bg-[#FF6B00] selection:text-white"
            style={{ fontFamily: "'Poppins', 'Segoe UI', system-ui, sans-serif" }}
        >
            <DeliveryBoyNav />

            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* 1. Header Profile Banner */}
                <div className="bg-[#13121A] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                                <FaMotorcycle size={28} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl sm:text-2xl font-black text-white">
                                        {userData?.fullName || 'Delivery Partner'}
                                    </h1>
                                    <MdVerified className="text-emerald-400 text-lg" />
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
                                    <span>Active Cravely Rider</span>
                                    <span>•</span>
                                    <span className="text-emerald-400 font-bold">₹50/order earning rate</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                                        <FaStar size={10} />
                                        <span>{Number(rating).toFixed(1)}</span>
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={fetchAllData}
                            disabled={fetching}
                            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#0A090D] hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                        >
                            <FaSync size={11} className={fetching ? 'animate-spin text-[#FF6B00]' : 'text-gray-400'} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* 2. Navigation Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-[#13121A] border border-white/10 rounded-2xl w-fit">
                    {[
                        { id: 'dashboard', label: 'Rider Console', icon: FaMotorcycle },
                        { id: 'orders', label: 'Assigned Orders', icon: FaList },
                        { id: 'stats', label: 'Earnings & Analytics', icon: FaChartBar }
                    ].map(tab => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                    activeTab === tab.id
                                        ? 'bg-[#FF6B00] text-white shadow-md'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <Icon size={12} />
                                <span>{tab.label}</span>
                            </button>
                        )
                    })}
                </div>

                {/* 3. Tab Contents */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        
                        {/* 4 Metric Cards (Solid Dark Surfaces, No Gradients) */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-4 rounded-2xl bg-[#13121A] border border-white/[0.08] space-y-1 shadow-md">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Deliveries</p>
                                <p className="text-2xl font-black text-white font-mono">{totalDeliveries}</p>
                                <p className="text-[10px] text-gray-500">Fulfilled orders</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-[#13121A] border border-white/[0.08] space-y-1 shadow-md">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Payouts</p>
                                <p className="text-2xl font-black text-emerald-400 font-mono">₹{totalEarnings}</p>
                                <p className="text-[10px] text-gray-500">Credited to wallet</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-[#13121A] border border-white/[0.08] space-y-1 shadow-md">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Today's Trips</p>
                                <p className="text-2xl font-black text-[#FF8C00] font-mono">{todayDeliveries.length}</p>
                                <p className="text-[10px] text-gray-500">Completed today</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-[#13121A] border border-white/[0.08] space-y-1 shadow-md">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer Rating</p>
                                <p className="text-2xl font-black text-amber-400 font-mono">{Number(rating).toFixed(1)} ★</p>
                                <p className="text-[10px] text-gray-500">Average rider score</p>
                            </div>
                        </div>

                        {/* Active Order Card (If any) */}
                        {currentOrder ? (
                            <div className="bg-[#13121A] border border-emerald-500/30 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl">
                                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                                    <div className="flex items-center gap-2.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <h2 className="text-base font-black text-white uppercase tracking-wider">
                                            Current Active Delivery
                                        </h2>
                                    </div>
                                    <span className="font-mono text-xs text-gray-400">
                                        #{currentOrder._id?.slice(-8).toUpperCase()}
                                    </span>
                                </div>

                                {/* Restaurant & Drop Details */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-[#0A090D] border border-white/[0.06] space-y-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                            <FaStore size={10} className="text-[#FF6B00]" />
                                            <span>Pickup Kitchen</span>
                                        </p>
                                        <p className="text-sm font-bold text-white">
                                            {currentOrder.shopOrders?.[0]?.shop?.name || 'Restaurant'}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {currentOrder.shopOrders?.[0]?.shop?.address || 'Pickup location'}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-[#0A090D] border border-white/[0.06] space-y-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                            <FaMapMarkerAlt size={10} className="text-emerald-400" />
                                            <span>Delivery Address & Customer</span>
                                        </p>
                                        <p className="text-sm font-bold text-white">
                                            {currentOrder.user?.fullName || 'Customer'}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {currentOrder.deliveryAddress?.text || currentOrder.deliveryAddress?.street || 'Customer address'}
                                        </p>
                                    </div>
                                </div>

                                {/* Leaflet Live Tracking Map */}
                                <DeliveryBoyTracking data={{
                                    deliveryBoyLocation: deliveryBoyLocation || { lat: 28.4747, lon: 77.4916 },
                                    customerLocation: {
                                        lat: currentOrder.deliveryAddress?.latitude || 28.4747,
                                        lon: currentOrder.deliveryAddress?.longitude || 77.4916
                                    }
                                }} />

                                {/* OTP Verification Box */}
                                {!showOtpBox ? (
                                    <button
                                        onClick={handleSendOtp}
                                        disabled={loading}
                                        className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        {loading ? <ClipLoader size={16} color="#fff" /> : (
                                            <>
                                                <FaCheckCircle size={14} />
                                                <span>Arrived at Customer • Send Delivery OTP</span>
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <div className="p-5 rounded-2xl bg-[#0A090D] border border-white/10 space-y-3">
                                        <p className="text-xs text-gray-300 flex items-center gap-1.5">
                                            <FaEnvelope size={12} className="text-[#FF6B00]" />
                                            <span>OTP has been sent to customer (<strong>{otpSentTo}</strong>). Ask customer for the 6-digit code:</span>
                                        </p>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                maxLength={6}
                                                placeholder="Enter 6-digit OTP"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className="flex-1 bg-[#13121A] border border-white/10 focus:border-[#FF6B00] rounded-xl px-4 py-2.5 text-sm font-mono text-white text-center tracking-widest focus:outline-none"
                                            />
                                            <button
                                                onClick={handleVerifyOtp}
                                                disabled={loading}
                                                className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                                            >
                                                {loading ? <ClipLoader size={14} color="#fff" /> : 'Confirm Delivery'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Available Broadcast Orders */
                            <div className="bg-[#13121A] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
                                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                        <FaTruck size={14} className="text-[#FF6B00]" />
                                        <span>Available Broadcast Orders</span>
                                        <span className="px-2 py-0.2 rounded-full text-xs font-black bg-[#FF6B00]/20 text-[#FF8C00]">
                                            {availableAssignments.length}
                                        </span>
                                    </h3>
                                </div>

                                {availableAssignments.length === 0 ? (
                                    <div className="text-center py-12 space-y-2">
                                        <FaMotorcycle size={36} className="text-gray-500 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm font-bold text-white">No pending broadcast orders</p>
                                        <p className="text-xs text-gray-400">New delivery assignments will appear here automatically via live radar.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {availableAssignments.map((a, idx) => (
                                            <div 
                                                key={a._id || idx}
                                                className="p-4 rounded-2xl bg-[#0A090D] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                            >
                                                <div className="space-y-1">
                                                    <p className="text-sm font-bold text-white">{a.shop?.name || a.shopName || 'Restaurant'}</p>
                                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                                        <FaMapMarkerAlt size={10} className="text-[#FF6B00]" />
                                                        <span>{a.deliveryAddress?.text || a.deliveryAddress?.street || 'Delivery Address'}</span>
                                                    </p>
                                                    <p className="text-[11px] text-emerald-400 font-bold">
                                                        Payout: +₹50 for this trip
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2 self-start sm:self-auto">
                                                    <button
                                                        onClick={() => handleAcceptOrder(a._id || a.assignmentId)}
                                                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectOrder(a._id || a.assignmentId)}
                                                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold transition cursor-pointer"
                                                    >
                                                        Skip
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <DeliveryBoyOrders />
                )}

                {/* Stats Tab */}
                {activeTab === 'stats' && (
                    <div className="bg-[#13121A] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
                        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                            <h3 className="text-base font-black text-white">Daily Trip Analytics</h3>
                            <span className="text-xs text-emerald-400 font-bold font-mono">Total Earned: ₹{totalEarnings}</span>
                        </div>

                        {todayDeliveries.length > 0 ? (
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={todayDeliveries}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#252433" />
                                        <XAxis dataKey="hour" stroke="#888" tickFormatter={(h) => `${h}:00`} />
                                        <YAxis stroke="#888" allowDecimals={false} />
                                        <Tooltip 
                                            contentStyle={{ background: '#13121A', borderColor: '#333', borderRadius: '12px', color: '#fff' }}
                                        />
                                        <Bar dataKey="count" fill="#FF6B00" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-xs text-gray-400">
                                No deliveries completed today yet. Start accepting orders to build your chart!
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Rating Modal */}
            {showRatingModal && completedOrderId && (
                <DeliveryBoyRatingModal 
                    orderId={completedOrderId}
                    onClose={() => {
                        setShowRatingModal(false)
                        setCompletedOrderId(null)
                    }}
                    onRatingSubmitted={() => {
                        toast.success('Rating submitted!')
                        fetchAllData()
                    }}
                />
            )}
        </div>
    )
}

export default DeliveryBoy
