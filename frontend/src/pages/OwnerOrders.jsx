import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../../config'
import { useDispatch, useSelector } from 'react-redux'  // ✅ FIXED: Added 'from'
import { updateOrderStatus } from '../redux/userSlice'
import { 
    FaUser, FaClock, FaTruck, FaMapMarkerAlt, 
    FaPhone, FaRupeeSign, FaCheckCircle, FaTimesCircle,
    FaHourglassHalf, FaUtensils, FaWhatsapp, FaEye,
    FaArrowRight, FaStar, FaUserCheck,
    FaMotorcycle, FaCircle,
    FaCheck, FaSpinner, FaUserPlus, FaSync,
    FaImage
} from "react-icons/fa";
import { MdDeliveryDining, MdVerified } from "react-icons/md";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

// ✅ Constants
const FALLBACK_IMAGE = 'https://via.placeholder.com/100/f0ebe5/cbb8a8?text=🍽️'

function OwnerOrderCard({ data, onStatusUpdate }) {
    const dispatch = useDispatch()
    const { socket } = useSelector(state => state.user)
    const [loading, setLoading] = useState(false)
    const [availableBoys, setAvailableBoys] = useState([])
    const [showBoysList, setShowBoysList] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [assigningBoy, setAssigningBoy] = useState(null)
    const [fetchingBoys, setFetchingBoys] = useState(false)
    const [isAssigned, setIsAssigned] = useState(false)
    const [imageErrors, setImageErrors] = useState({})
    const [orderStatus, setOrderStatus] = useState('pending')

    const shopOrder = data?.shopOrders?.[0] || data?.shopOrders || {}
    const status = shopOrder?.status || 'pending'
    const subtotal = shopOrder?.subtotal || 0
    const orderItems = shopOrder?.shopOrderItems || []
    const assignedBoy = shopOrder?.assignedDeliveryBoy
    const isPaymentSuccessful = data?.payment === true || data?.payment === "true"
    
    const shopId = shopOrder?.shop?._id || 
                   shopOrder?.shop || 
                   data?.shopOrders?.[0]?.shop?._id || 
                   data?.shopOrders?.[0]?.shop

    const orderLocation = data?.deliveryAddress || {}
    const lat = orderLocation?.latitude || 28.4747
    const lon = orderLocation?.longitude || 77.4916

    // ✅ Get user mobile from multiple possible locations
    const userMobile = data?.user?.mobile || 
                       data?.mobile || 
                       data?.userMobile || 
                       data?.deliveryAddress?.phone || 
                       'Not available'

    // ✅ Get user name from multiple possible locations
    const userName = data?.user?.fullName || 
                     data?.user?.name || 
                     data?.customerName || 
                     'Customer'

    // ✅ Debug log to check data structure
    console.log('📦 Order Data:', data)
    console.log('📱 User Mobile:', userMobile)
    console.log('👤 User Name:', userName)

    useEffect(() => {
        setOrderStatus(status)
    }, [status])

    useEffect(() => {
        if (!socket) return

        const handleStatusUpdate = ({ orderId, shopId: updatedShopId, status: newStatus }) => {
            if (orderId === data?._id && shopId === updatedShopId) {
                console.log(`🔄 Real-time status update: ${newStatus}`)
                setOrderStatus(newStatus)
                if (onStatusUpdate) onStatusUpdate()
                toast.info(`🔄 Order status updated to ${newStatus}`)
            }
        }

        const handleDeliveryBoyAccepted = ({ orderId, deliveryBoy }) => {
            if (orderId === data?._id) {
                setIsAssigned(true)
                setOrderStatus('out of delivery')
                toast.success(`🚴 ${deliveryBoy.fullName} accepted the order!`)
                if (onStatusUpdate) onStatusUpdate()
            }
        }

        socket.on('update-status', handleStatusUpdate)
        socket.on('deliveryBoyAccepted', handleDeliveryBoyAccepted)

        return () => {
            socket.off('update-status', handleStatusUpdate)
            socket.off('deliveryBoyAccepted', handleDeliveryBoyAccepted)
        }
    }, [socket, data?._id, shopId, onStatusUpdate])

    useEffect(() => {
        if (orderStatus === 'out of delivery' && assignedBoy) {
            setIsAssigned(true)
        } else {
            setIsAssigned(false)
        }
    }, [orderStatus, assignedBoy])

    const statusConfig = {
        'pending': { 
            label: 'Pending', 
            color: 'bg-amber-50 text-amber-700 border-amber-200',
            icon: <FaHourglassHalf size={14} className="text-amber-500" />,
            next: ['preparing', 'cancelled']
        },
        'preparing': { 
            label: 'Preparing', 
            color: 'bg-blue-50 text-blue-700 border-blue-200',
            icon: <FaUtensils size={14} className="text-blue-500" />,
            next: ['out of delivery', 'cancelled']
        },
        'out of delivery': { 
            label: 'Out for Delivery', 
            color: 'bg-orange-50 text-orange-700 border-orange-200',
            icon: <FaTruck size={14} className="text-orange-500" />,
            next: ['delivered']
        },
        'delivered': { 
            label: 'Delivered', 
            color: 'bg-green-50 text-green-700 border-green-200',
            icon: <FaCheckCircle size={14} className="text-green-500" />,
            next: []
        },
        'cancelled': { 
            label: 'Cancelled', 
            color: 'bg-red-50 text-red-700 border-red-200',
            icon: <FaTimesCircle size={14} className="text-red-500" />,
            next: []
        }
    }

    const currentStatus = statusConfig[orderStatus] || statusConfig['pending']

    const fetchAvailableBoys = async () => {
        setFetchingBoys(true)
        try {
            console.log("🔍 Fetching delivery boys near:", { lat, lon })
            
            const response = await axios.get(
                `${serverUrl}/api/user/delivery-boys/nearby?lat=${lat}&lon=${lon}&radius=15`,
                { withCredentials: true }
            )
            
            console.log("📦 Available Boys Response:", response.data)
            
            if (response.data?.success && response.data?.deliveryBoys) {
                setAvailableBoys(response.data.deliveryBoys)
                console.log("✅ Set available boys:", response.data.deliveryBoys.length)
            } else {
                setAvailableBoys([])
            }
        } catch (error) {
            console.log("❌ Fetch delivery boys error:", error)
            setAvailableBoys([])
        } finally {
            setFetchingBoys(false)
        }
    }

    const handleUpdateStatus = async (newStatus) => {
        if (isUpdating) return
        
        if (!shopId) {
            toast.error('❌ Shop ID not found! Please refresh and try again.')
            console.error('❌ Shop ID is undefined for order:', data?._id)
            return
        }
        
        console.log(`🔄 Updating status to: ${newStatus}`)
        console.log(`📦 Order ID: ${data?._id}`)
        console.log(`🏪 Shop ID: ${shopId}`)
        
        setIsUpdating(true)
        setLoading(true)

        try {
            if (newStatus === 'out of delivery') {
                await fetchAvailableBoys()
                setShowBoysList(true)
                setIsUpdating(false)
                setLoading(false)
                return
            }

            const result = await axios.post(
                `${serverUrl}/api/order/update-status/${data._id}/${shopId}`,
                { status: newStatus },
                { withCredentials: true }
            )

            console.log("✅ Status Update Response:", result.data)
            
            setOrderStatus(newStatus)
            
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

    const handleAssignDeliveryBoy = async (boyId) => {
        if (!boyId) {
            toast.error('Please select a delivery boy')
            return
        }

        if (!shopId) {
            toast.error('❌ Shop ID not found!')
            return
        }

        console.log(`🚴 Assigning delivery boy: ${boyId}`)
        console.log(`📦 Order ID: ${data?._id}`)
        console.log(`🏪 Shop ID: ${shopId}`)

        setAssigningBoy(boyId)
        setLoading(true)

        try {
            const result = await axios.post(
                `${serverUrl}/api/order/update-status/${data._id}/${shopId}`,
                { status: 'out of delivery' },
                { withCredentials: true }
            )

            console.log("✅ Status Update Response:", result.data)

            if (result.data.assignment) {
                const acceptResult = await axios.get(
                    `${serverUrl}/api/order/accept-order/${result.data.assignment}`,
                    { withCredentials: true }
                )
                console.log("✅ Accept Order Response:", acceptResult.data)
                
                if (acceptResult.data.message === 'order accepted') {
                    setIsAssigned(true)
                    setOrderStatus('out of delivery')
                    toast.success('✅ Delivery boy assigned and order accepted!')
                }
            }

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

    const getBoyStatus = (boy) => {
        if (!boy.isOnline) return { label: 'Offline', color: 'text-gray-500', dot: 'bg-gray-400' }
        if (boy.isBusy) return { label: 'Busy', color: 'text-red-500', dot: 'bg-red-400' }
        return { label: 'Available', color: 'text-green-600', dot: 'bg-green-500 animate-pulse' }
    }

    const getItemImage = (item) => {
        if (imageErrors[item._id]) return FALLBACK_IMAGE
        return item?.item?.image || FALLBACK_IMAGE
    }

    const handleImageError = (itemId) => {
        setImageErrors(prev => ({ ...prev, [itemId]: true }))
    }

    if (!data) return null

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className='bg-white border-2 border-gray-200 rounded-2xl hover:border-orange-300 hover:shadow-md transition-all duration-300 overflow-hidden'
        >
            {/* Header */}
            <div className='p-5 border-b-2 border-gray-200 bg-gray-50'>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                    <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm'>
                            {userName?.charAt(0) || 'C'}
                        </div>
                        <div>
                            <h3 className='text-gray-900 font-bold text-base flex items-center gap-2'>
                                {userName}
                                <MdVerified size={14} className='text-blue-500' />
                            </h3>
                            <div className='flex items-center gap-3 text-sm'>
                                <span className='text-gray-600 text-xs flex items-center gap-1 font-medium'>
                                    <FaPhone size={12} className="text-orange-500" /> 
                                    {userMobile}
                                </span>
                                <span className='text-gray-300'>|</span>
                                <span className='text-gray-400 text-xs font-mono'>
                                    #{data?._id?.slice(-6) || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border-2 ${currentStatus.color}`}>
                        {currentStatus.icon}
                        <span className='text-xs font-bold'>{currentStatus.label}</span>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className='p-5 space-y-4'>
                
                {/* Delivery Address */}
                <div className='flex items-start gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200'>
                    <FaMapMarkerAlt size={18} className='text-orange-500 flex-shrink-0 mt-0.5' />
                    <div>
                        <p className='text-gray-800 text-sm font-medium'>{data?.deliveryAddress?.text || 'No address'}</p>
                        <p className='text-gray-400 text-[10px] font-mono'>
                            📍 Lat: {data?.deliveryAddress?.latitude || 'N/A'}, Lon: {data?.deliveryAddress?.longitude || 'N/A'}
                        </p>
                    </div>
                </div>

                {/* Payment & Total */}
                <div className='flex flex-wrap items-center gap-4'>
                    <div className='flex items-center gap-2 text-sm'>
                        <span className='text-gray-500 font-medium'>Payment:</span>
                        {data?.paymentMethod === "online" ? (
                            <span className={isPaymentSuccessful ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                                {isPaymentSuccessful ? '✅ Online - Paid' : '❌ Online - Failed'}
                            </span>
                        ) : (
                            <span className='text-gray-600 font-medium'>💵 Cash on Delivery</span>
                        )}
                    </div>
                    <div className='w-px h-6 bg-gray-200' />
                    <div className='flex items-center gap-2'>
                        <span className='text-gray-500 font-medium text-sm'>Total:</span>
                        <span className='text-orange-600 font-bold text-xl'>₹{subtotal}</span>
                    </div>
                </div>

                {/* Items */}
                <div className='space-y-2'>
                    <p className='text-gray-500 text-[10px] font-bold uppercase tracking-wider'>Items</p>
                    <div className='flex gap-3 overflow-x-auto pb-2 scrollbar-hide'>
                        {orderItems.map((item, idx) => (
                            <div key={idx} className='flex-shrink-0 w-[120px] bg-gray-50 rounded-xl p-2 border-2 border-gray-200'>
                                <img 
                                    src={getItemImage(item)} 
                                    alt={item?.name || 'Item'} 
                                    className='w-full h-[70px] object-cover rounded-lg'
                                    onError={() => handleImageError(item?._id)}
                                    loading="lazy"
                                />
                                <p className='text-gray-800 text-xs font-bold truncate mt-1'>{item?.name || 'Item'}</p>
                                <p className='text-gray-400 text-[10px] font-medium'>Qty: {item?.quantity || 0}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PENDING STATUS - Show Assign Button */}
                {orderStatus === 'pending' && (
                    <div className='flex flex-wrap gap-2 pt-3 border-t-2 border-gray-200'>
                        <div className='flex items-center gap-2 w-full flex-wrap'>
                            <span className='text-gray-500 text-xs font-bold'>Update Status:</span>
                            <div className='flex flex-wrap gap-2'>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className='px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border-2 bg-blue-50 text-blue-600 border-blue-300 hover:bg-blue-100'
                                    onClick={() => handleUpdateStatus('preparing')}
                                    disabled={loading || isUpdating}
                                >
                                    🔧 Preparing
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className='px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border-2 bg-orange-50 text-orange-600 border-orange-300 hover:bg-orange-100'
                                    onClick={() => handleUpdateStatus('out of delivery')}
                                    disabled={loading || isUpdating}
                                >
                                    🚚 Out for Delivery
                                </motion.button>
                            </div>
                        </div>
                    </div>
                )}

                {/* PREPARING STATUS - Show Assign Button */}
                {orderStatus === 'preparing' && (
                    <div className='flex flex-wrap gap-2 pt-3 border-t-2 border-gray-200'>
                        <div className='flex items-center gap-2 w-full flex-wrap'>
                            <span className='text-gray-500 text-xs font-bold'>Update Status:</span>
                            <div className='flex flex-wrap gap-2'>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className='px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border-2 bg-orange-50 text-orange-600 border-orange-300 hover:bg-orange-100'
                                    onClick={() => handleUpdateStatus('out of delivery')}
                                    disabled={loading || isUpdating}
                                >
                                    🚚 Out for Delivery
                                </motion.button>
                            </div>
                        </div>
                    </div>
                )}

                {/* OUT FOR DELIVERY / ASSIGNED STATUS */}
                {(orderStatus === 'out of delivery' || showBoysList) && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className='mt-3 p-4 rounded-xl bg-orange-50 border-2 border-orange-200'
                    >
                        {isAssigned && assignedBoy ? (
                            // Boy Accepted - Show Assigned
                            <div className='flex items-center gap-3'>
                                <div className='w-12 h-12 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center'>
                                    <FaMotorcycle className='text-green-600 text-2xl' />
                                </div>
                                <div className='flex-1'>
                                    <p className='text-gray-800 font-bold text-sm flex items-center gap-2'>
                                        {assignedBoy.fullName}
                                        <span className='text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 border-2 border-green-300 font-bold'>
                                            <FaCheck size={10} /> Assigned
                                        </span>
                                    </p>
                                    <p className='text-gray-500 text-xs flex items-center gap-2 font-medium'>
                                        <FaPhone size={10} className="text-orange-500" /> {assignedBoy.mobile}
                                        <a href={`tel:${assignedBoy.mobile}`} className='text-orange-600 hover:underline text-xs font-bold'>
                                            Call
                                        </a>
                                        <a 
                                            href={`https://wa.me/${assignedBoy.mobile}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className='text-green-600 hover:underline text-xs font-bold'
                                        >
                                            <FaWhatsapp size={12} className="inline" /> WhatsApp
                                        </a>
                                    </p>
                                </div>
                                {assignedBoy.deliveryBoyRating?.average > 0 && (
                                    <div className='flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full border-2 border-amber-200'>
                                        <FaStar className='text-amber-500 text-[10px]' />
                                        <span className='text-gray-700 text-[10px] font-bold'>{assignedBoy.deliveryBoyRating.average.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // No Boy Assigned - Show Available Boys List
                            <div>
                                <div className='flex items-center justify-between mb-3'>
                                    <p className='text-gray-700 text-sm font-bold flex items-center gap-2'>
                                        <FaMotorcycle className='text-orange-500' />
                                        Available Delivery Boys
                                        <span className='text-xs text-gray-400 font-medium'>({availableBoys.length})</span>
                                    </p>
                                    <button
                                        className='text-xs text-orange-600 hover:underline flex items-center gap-1 font-bold disabled:opacity-50'
                                        onClick={fetchAvailableBoys}
                                        disabled={fetchingBoys}
                                    >
                                        {fetchingBoys ? <FaSpinner className='animate-spin' /> : <FaSync size={12} />} Refresh
                                    </button>
                                </div>
                                
                                {fetchingBoys ? (
                                    <div className='flex items-center justify-center py-4'>
                                        <div className='flex items-center gap-2 text-gray-500 text-sm font-medium'>
                                            <FaSpinner className='animate-spin' /> Finding delivery boys...
                                        </div>
                                    </div>
                                ) : availableBoys.length > 0 ? (
                                    <div className='space-y-2 max-h-60 overflow-y-auto pr-1'>
                                        {availableBoys.map((boy) => {
                                            const boyStatus = getBoyStatus(boy)
                                            return (
                                                <motion.div 
                                                    key={boy._id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className='flex items-center justify-between p-3 bg-white rounded-xl hover:bg-gray-50 transition-all duration-300 border-2 border-gray-200'
                                                >
                                                    <div className='flex items-center gap-3'>
                                                        <div className='w-10 h-10 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center'>
                                                            <FaUser className='text-orange-600 text-lg' />
                                                        </div>
                                                        <div>
                                                            <p className='text-gray-800 text-sm font-bold'>{boy.fullName}</p>
                                                            <p className='text-gray-500 text-xs flex items-center gap-2 font-medium'>
                                                                <FaPhone size={10} className="text-orange-500" /> {boy.mobile}
                                                                <span className={`flex items-center gap-1 text-[10px] font-bold ${boyStatus.color}`}>
                                                                    <FaCircle size={6} className={boyStatus.dot} />
                                                                    {boyStatus.label}
                                                                </span>
                                                            </p>
                                                            {boy.deliveryBoyRating?.average > 0 && (
                                                                <p className='text-gray-400 text-[10px] flex items-center gap-1 font-medium'>
                                                                    <FaStar size={10} className='text-amber-400' />
                                                                    {boy.deliveryBoyRating.average.toFixed(1)} ★
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border-2 ${
                                                            assigningBoy === boy._id
                                                                ? 'bg-orange-500 text-white border-orange-600'
                                                                : boy.isOnline && !boy.isBusy
                                                                ? 'bg-orange-50 text-orange-600 border-orange-300 hover:bg-orange-100'
                                                                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
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
                                        <p className='text-gray-500 text-sm font-medium'>No delivery boys available nearby</p>
                                        <button
                                            className='mt-2 text-xs text-orange-600 hover:underline font-bold'
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

                {/* DELIVERED / CANCELLED - No Actions */}
                {(orderStatus === 'delivered' || orderStatus === 'cancelled') && (
                    <div className='pt-3 border-t-2 border-gray-200'>
                        <p className='text-center text-gray-500 text-sm font-medium'>
                            {orderStatus === 'delivered' ? '✅ Order completed successfully' : '❌ Order cancelled'}
                        </p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .overflow-y-auto::-webkit-scrollbar {
                    width: 4px;
                }
                .overflow-y-auto::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: #d4845a;
                    border-radius: 10px;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                    background: #c2744a;
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