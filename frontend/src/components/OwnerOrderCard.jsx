import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { updateOrderStatus } from '../redux/userSlice'
import { 
    FaUser, FaClock, FaTruck, FaMapMarkerAlt, 
    FaPhone, FaRupeeSign, FaCheckCircle, FaTimesCircle,
    FaHourglassHalf, FaUtensils, FaWhatsapp, FaEye,
    FaArrowRight, FaStar, FaUserCheck,
    FaMotorcycle, FaCircle,
    FaCheck, FaSpinner, FaUserPlus, FaSync
} from "react-icons/fa";
import { MdDeliveryDining, MdVerified } from "react-icons/md";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

function OwnerOrderCard({ data, onStatusUpdate }) {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [availableBoys, setAvailableBoys] = useState([])
    const [showBoysList, setShowBoysList] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [assigningBoy, setAssigningBoy] = useState(null)
    const [fetchingBoys, setFetchingBoys] = useState(false)

    const status = data.shopOrders?.status || 'pending'
    const subtotal = data.shopOrders?.subtotal || 0
    const orderItems = data.shopOrders?.shopOrderItems || []
    const assignedBoy = data.shopOrders?.assignedDeliveryBoy
    const isPaymentSuccessful = data?.payment === true || data?.payment === "true"
    const shopId = data.shopOrders?.shop?._id || data.shopOrders?.shop

    console.log("📦 Order Data:", data)
    console.log("🏪 Shop ID:", shopId)
    console.log("📊 Status:", status)

    // ✅ Status Config
    const statusConfig = {
        'pending': { 
            label: '⏳ Pending', 
            color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
            icon: <FaHourglassHalf size={14} />,
            next: ['preparing', 'cancelled']
        },
        'preparing': { 
            label: '🔧 Preparing', 
            color: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
            icon: <FaUtensils size={14} />,
            next: ['out of delivery', 'cancelled']
        },
        'out of delivery': { 
            label: '🚚 Out for Delivery', 
            color: 'bg-orange-500/20 text-orange-400 border-orange-500/20',
            icon: <FaTruck size={14} />,
            next: ['delivered']
        },
        'delivered': { 
            label: '✅ Delivered', 
            color: 'bg-green-500/20 text-green-400 border-green-500/20',
            icon: <FaCheckCircle size={14} />,
            next: []
        },
        'cancelled': { 
            label: '❌ Cancelled', 
            color: 'bg-red-500/20 text-red-400 border-red-500/20',
            icon: <FaTimesCircle size={14} />,
            next: []
        }
    }

    const currentStatus = statusConfig[status] || statusConfig['pending']

    // ✅ Fetch Available Delivery Boys
    const fetchAvailableBoys = async () => {
        setFetchingBoys(true)
        setShowBoysList(true)
        
        try {
            const { latitude, longitude } = data.deliveryAddress
            if (!latitude || !longitude) {
                toast.warning('📍 Delivery address location not available')
                setFetchingBoys(false)
                return
            }

            console.log(`🔍 Fetching delivery boys near: ${latitude}, ${longitude}`)

            const response = await axios.get(`${serverUrl}/api/user/delivery-boys/nearby`, {
                params: {
                    lat: latitude,
                    lon: longitude,
                    radius: 15
                },
                withCredentials: true
            })

            console.log("📦 Available Boys Response:", response.data)
            
            setAvailableBoys(response.data || [])
            
            if (response.data?.length === 0) {
                toast.info('No delivery boys available nearby')
            } else {
                toast.success(`Found ${response.data.length} delivery boys nearby!`)
            }
        } catch (error) {
            console.log('❌ Fetch delivery boys error:', error)
            toast.error(error.response?.data?.message || 'Failed to fetch delivery boys')
        } finally {
            setFetchingBoys(false)
        }
    }

    // ✅ Handle Status Update
    const handleUpdateStatus = async (newStatus) => {
        if (isUpdating) return
        
        console.log(`🔄 Updating status to: ${newStatus}`)
        console.log(`📦 Order ID: ${data._id}`)
        console.log(`🏪 Shop ID: ${shopId}`)
        
        setIsUpdating(true)
        setLoading(true)

        try {
            // ✅ If status is "out of delivery", fetch available boys first
            if (newStatus === 'out of delivery') {
                await fetchAvailableBoys()
                setIsUpdating(false)
                setLoading(false)
                return
            }

            // ✅ API Call to update status
            const result = await axios.post(
                `${serverUrl}/api/order/update-status/${data._id}/${shopId}`,
                { status: newStatus },
                { withCredentials: true }
            )

            console.log("✅ Status Update Response:", result.data)
            
            // ✅ Update Redux
            dispatch(updateOrderStatus({ 
                orderId: data._id, 
                shopId: shopId, 
                status: newStatus 
            }))

            if (onStatusUpdate) onStatusUpdate()
            
            toast.success(`✅ Order status updated to ${newStatus}`)
        } catch (error) {
            console.log('❌ Update status error:', error)
            toast.error(error.response?.data?.message || 'Failed to update status')
        } finally {
            setLoading(false)
            setIsUpdating(false)
        }
    }

    // ✅ Handle Assign Delivery Boy
    const handleAssignDeliveryBoy = async (boyId) => {
        if (!boyId) {
            toast.error('Please select a delivery boy')
            return
        }

        console.log(`🚴 Assigning delivery boy: ${boyId}`)
        console.log(`📦 Order ID: ${data._id}`)
        console.log(`🏪 Shop ID: ${shopId}`)

        setAssigningBoy(boyId)
        setLoading(true)

        try {
            // ✅ First update order status to out of delivery
            const result = await axios.post(
                `${serverUrl}/api/order/update-status/${data._id}/${shopId}`,
                { status: 'out of delivery' },
                { withCredentials: true }
            )

            console.log("✅ Status Update Response:", result.data)

            // ✅ Accept order by delivery boy
            if (result.data.assignment) {
                const acceptResult = await axios.get(
                    `${serverUrl}/api/order/accept-order/${result.data.assignment}`,
                    { withCredentials: true }
                )
                console.log("✅ Accept Order Response:", acceptResult.data)
            }

            // ✅ Update Redux
            dispatch(updateOrderStatus({ 
                orderId: data._id, 
                shopId: shopId, 
                status: 'out of delivery' 
            }))

            setShowBoysList(false)
            toast.success('✅ Delivery boy assigned successfully!')
            
            if (onStatusUpdate) onStatusUpdate()
        } catch (error) {
            console.log('❌ Assign delivery boy error:', error)
            toast.error(error.response?.data?.message || 'Failed to assign delivery boy')
        } finally {
            setLoading(false)
            setAssigningBoy(null)
        }
    }

    // ✅ Check delivery boy availability status
    const getBoyStatus = (boy) => {
        if (!boy.isOnline) return { label: 'Offline', color: 'text-gray-400', dot: 'bg-gray-400' }
        if (boy.isBusy) return { label: 'Busy', color: 'text-red-400', dot: 'bg-red-400' }
        return { label: 'Available', color: 'text-green-400', dot: 'bg-green-400 animate-pulse' }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ y: -4 }}
            className='glass-premium-ultra rounded-2xl border border-white/5 
                hover:border-[#ff2d55]/30 transition-all duration-500 
                hover:shadow-2xl hover:shadow-[#ff2d55]/10 overflow-hidden'
        >
            {/* ✅ Header */}
            <div className='p-5 border-b border-white/5 bg-gradient-to-r from-white/[0.03] to-transparent'>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                    <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-full bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center text-white font-bold text-sm'>
                            {data.user?.fullName?.charAt(0) || 'C'}
                        </div>
                        <div>
                            <h3 className='text-white font-semibold text-base flex items-center gap-2'>
                                {data.user?.fullName || 'Customer'}
                                <MdVerified size={14} className='text-blue-400' />
                            </h3>
                            <div className='flex items-center gap-3 text-sm'>
                                <span className='text-white/40 text-xs flex items-center gap-1'>
                                    <FaPhone size={12} /> {data.user?.mobile || 'N/A'}
                                </span>
                                <span className='text-white/20'>|</span>
                                <span className='text-white/40 text-xs'>
                                    #{data._id?.slice(-6) || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ✅ Status Badge */}
                    <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border ${currentStatus.color} backdrop-blur-sm`}>
                        {currentStatus.icon}
                        <span className='text-xs font-medium'>{currentStatus.label}</span>
                    </div>
                </div>
            </div>

            {/* ✅ Body */}
            <div className='p-5 space-y-4'>
                
                {/* ✅ Delivery Address */}
                <div className='flex items-start gap-2 p-3 rounded-xl bg-white/5 border border-white/5'>
                    <FaMapMarkerAlt size={18} className='text-[#ff6b35] flex-shrink-0 mt-0.5' />
                    <div>
                        <p className='text-white/70 text-sm'>{data?.deliveryAddress?.text || 'No address'}</p>
                        <p className='text-white/20 text-[10px]'>
                            📍 Lat: {data?.deliveryAddress?.latitude || 'N/A'}, Lon: {data?.deliveryAddress?.longitude || 'N/A'}
                        </p>
                    </div>
                </div>

                {/* ✅ Payment & Total */}
                <div className='flex flex-wrap items-center gap-4'>
                    <div className='flex items-center gap-2 text-sm'>
                        <span className='text-white/40'>Payment:</span>
                        {data.paymentMethod === "online" ? (
                            <span className={isPaymentSuccessful ? 'text-green-400' : 'text-red-400'}>
                                {isPaymentSuccessful ? '✅ Online - Paid' : '❌ Online - Failed'}
                            </span>
                        ) : (
                            <span className='text-white/60'>💵 Cash on Delivery</span>
                        )}
                    </div>
                    <div className='w-px h-6 bg-white/10' />
                    <div className='flex items-center gap-2'>
                        <span className='text-white/40 text-sm'>Total:</span>
                        <span className='text-[#ff6b35] font-bold text-lg'>₹{subtotal}</span>
                    </div>
                </div>

                {/* ✅ Items */}
                <div className='space-y-2'>
                    <p className='text-white/30 text-xs font-medium uppercase tracking-wider'>Items</p>
                    <div className='flex gap-3 overflow-x-auto pb-2 scrollbar-hide'>
                        {orderItems.map((item, idx) => (
                            <div key={idx} className='flex-shrink-0 w-[120px] bg-white/5 rounded-xl p-2 border border-white/5'>
                                <img 
                                    src={item?.item?.image || 'https://via.placeholder.com/100'} 
                                    alt={item.name} 
                                    className='w-full h-[70px] object-cover rounded-lg'
                                />
                                <p className='text-white text-xs font-medium truncate mt-1'>{item.name}</p>
                                <p className='text-white/30 text-[10px]'>Qty: {item.quantity}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ✅ Actions - Status Update */}
                {status !== 'delivered' && status !== 'cancelled' && (
                    <div className='flex flex-wrap gap-2 pt-3 border-t border-white/5'>
                        <div className='flex items-center gap-2 w-full flex-wrap'>
                            <span className='text-white/40 text-xs font-medium'>Update Status:</span>
                            <div className='flex flex-wrap gap-2'>
                                {currentStatus.next.map((nextStatus) => (
                                    <motion.button
                                        key={nextStatus}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                                            nextStatus === 'cancelled' 
                                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20'
                                                : nextStatus === 'out of delivery'
                                                ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/20'
                                                : nextStatus === 'delivered'
                                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/20'
                                                : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20'
                                        }`}
                                        onClick={() => handleUpdateStatus(nextStatus)}
                                        disabled={loading}
                                    >
                                        {nextStatus === 'out of delivery' ? '🚚 Out for Delivery' : 
                                         nextStatus === 'preparing' ? '🔧 Preparing' :
                                         nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ✅ Delivery Boy Assignment */}
                {(status === 'out of delivery' || showBoysList) && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className='mt-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20'
                    >
                        {assignedBoy ? (
                            // ✅ Assigned Delivery Boy
                            <div className='flex items-center gap-3'>
                                <div className='w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center'>
                                    <FaMotorcycle className='text-orange-400 text-2xl' />
                                </div>
                                <div className='flex-1'>
                                    <p className='text-white font-semibold text-sm flex items-center gap-2'>
                                        {assignedBoy.fullName}
                                        <span className='text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1'>
                                            <FaCircle size={6} className='text-green-400 animate-pulse' /> Assigned
                                        </span>
                                    </p>
                                    <p className='text-white/40 text-xs flex items-center gap-2'>
                                        <FaPhone size={10} /> {assignedBoy.mobile}
                                        <a href={`tel:${assignedBoy.mobile}`} className='text-[#ff6b35] hover:underline text-xs'>Call</a>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            // ✅ Available Delivery Boys
                            <div>
                                <div className='flex items-center justify-between mb-3'>
                                    <p className='text-white/70 text-sm font-medium flex items-center gap-2'>
                                        <FaMotorcycle className='text-orange-400' />
                                        Available Delivery Boys
                                        <span className='text-xs text-white/30'>({availableBoys.length})</span>
                                    </p>
                                    <button
                                        className='text-xs text-[#ff6b35] hover:underline flex items-center gap-1'
                                        onClick={fetchAvailableBoys}
                                        disabled={fetchingBoys}
                                    >
                                        {fetchingBoys ? <FaSpinner className='animate-spin' /> : <FaSync size={12} />} Refresh
                                    </button>
                                </div>
                                
                                {fetchingBoys ? (
                                    <div className='flex items-center justify-center py-4'>
                                        <div className='flex items-center gap-2 text-white/40 text-sm'>
                                            <FaSpinner className='animate-spin' /> Finding delivery boys...
                                        </div>
                                    </div>
                                ) : availableBoys.length > 0 ? (
                                    <div className='space-y-2 max-h-60 overflow-y-auto pr-1'>
                                        {availableBoys.map((boy) => {
                                            const status = getBoyStatus(boy)
                                            return (
                                                <motion.div 
                                                    key={boy._id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className='flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/5'
                                                >
                                                    <div className='flex items-center gap-3'>
                                                        <div className='w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center'>
                                                            <FaUser className='text-orange-400 text-lg' />
                                                        </div>
                                                        <div>
                                                            <p className='text-white text-sm font-medium'>{boy.fullName}</p>
                                                            <p className='text-white/40 text-xs flex items-center gap-2'>
                                                                <FaPhone size={10} /> {boy.mobile}
                                                                <span className={`flex items-center gap-1 text-[10px] ${status.color}`}>
                                                                    <FaCircle size={6} className={status.dot} />
                                                                    {status.label}
                                                                </span>
                                                            </p>
                                                            {boy.deliveryBoyRating?.average > 0 && (
                                                                <p className='text-white/30 text-[10px] flex items-center gap-1'>
                                                                    <FaStar size={10} className='text-yellow-400' />
                                                                    {boy.deliveryBoyRating.average.toFixed(1)} ★
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                                                            assigningBoy === boy._id
                                                                ? 'bg-[#ff2d55] text-white'
                                                                : boy.isOnline && !boy.isBusy
                                                                ? 'bg-[#ff2d55]/20 text-[#ff2d55] hover:bg-[#ff2d55]/30 border border-[#ff2d55]/20'
                                                                : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                        onClick={() => handleAssignDeliveryBoy(boy._id)}
                                                        disabled={!boy.isOnline || boy.isBusy || assigningBoy === boy._id}
                                                    >
                                                        {assigningBoy === boy._id ? (
                                                            <FaSpinner className='animate-spin' />
                                                        ) : (
                                                            'Assign'
                                                        )}
                                                    </motion.button>
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className='text-center py-4'>
                                        <p className='text-white/40 text-sm'>No delivery boys available nearby</p>
                                        <button
                                            className='mt-2 text-xs text-[#ff6b35] hover:underline'
                                            onClick={fetchAvailableBoys}
                                        >
                                            🔄 Try again
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            <style jsx>{`
                .glass-premium-ultra {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
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
                    animation: pulse 1.5s ease-in-out infinite;
                }
            `}</style>
        </motion.div>
    )
}

export default OwnerOrderCard