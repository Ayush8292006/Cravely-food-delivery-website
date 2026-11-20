import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../../config'
import { toast } from 'react-toastify'
import { ClipLoader } from 'react-spinners'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    FaMapMarkerAlt, FaTruck, FaClock, FaCheckCircle, 
    FaSync, FaHome, FaPhone, FaWhatsapp, FaStore, 
    FaArrowLeft, FaBox, FaRupeeSign, FaInfoCircle, 
    FaStar, FaMotorcycle, FaTimesCircle, FaShieldAlt,
    FaFileInvoice, FaHeadset, FaUtensils, FaBan
} from 'react-icons/fa'
import { MdDeliveryDining, MdRestaurant, MdVerified } from 'react-icons/md'
import { IoArrowBack } from 'react-icons/io5'
import DeliveryBoyTracking from '../components/DeliveryBoyTracking'
import CancelOrderModal from '../components/CancelOrderModal'

function TrackOrderPage() {
    const { orderId } = useParams()
    const navigate = useNavigate()
    const { socket, userData } = useSelector(state => state.user)
    const [liveLocations, setLiveLocations] = useState({})
    const [currentOrder, setCurrentOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [showCancelModal, setShowCancelModal] = useState(false)
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
        } catch (err) {
            console.log('Track order error:', err)
            const errorMsg = err.response?.data?.message || 'Failed to load order'
            setError(errorMsg)
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }, [orderId])

    useEffect(() => {
        if (!socket) return

        const handleLocationUpdate = ({ deliveryBoyId, latitude, longitude }) => {
            setLiveLocations(prev => ({
                ...prev,
                [deliveryBoyId]: { lat: latitude, lon: longitude }
            }))
        }

        const handleOrderStatusUpdate = (data) => {
            if (data.orderId === orderId) {
                toast.info('Order status updated!')
                handleGetOrder()
            }
        }

        socket.on('updateDeliveryLocation', handleLocationUpdate)
        socket.on('update-status', handleOrderStatusUpdate)
        socketListenerRef.current = handleLocationUpdate

        return () => {
            if (socketListenerRef.current) {
                socket.off('updateDeliveryLocation', socketListenerRef.current)
                socket.off('update-status', handleOrderStatusUpdate)
            }
        }
    }, [socket, orderId, handleGetOrder])

    useEffect(() => {
        handleGetOrder()
    }, [handleGetOrder])

    const getTimelineStages = (status, isCancelled) => {
        if (isCancelled || status === 'cancelled') {
            return [
                { key: 'placed', label: 'Order Placed', done: true, icon: FaBox },
                { key: 'cancelled', label: 'Order Cancelled', done: true, current: true, icon: FaTimesCircle, isRed: true }
            ]
        }

        const stages = [
            { key: 'placed', label: 'Order Placed', icon: FaBox },
            { key: 'preparing', label: 'Kitchen Preparing', icon: FaUtensils },
            { key: 'out of delivery', label: 'Out for Delivery', icon: FaMotorcycle },
            { key: 'delivered', label: 'Delivered', icon: FaCheckCircle }
        ]

        let currentIdx = 0
        if (status === 'preparing') currentIdx = 1
        else if (status === 'out of delivery') currentIdx = 2
        else if (status === 'delivered') currentIdx = 3

        return stages.map((st, i) => ({
            ...st,
            done: i <= currentIdx,
            current: i === currentIdx
        }))
    }

    if (loading) {
        return (
            <div className='min-h-screen bg-[#0a0a0f] flex items-center justify-center'>
                <div className='flex flex-col items-center gap-4'>
                    <ClipLoader size={50} color="#ff6b35" />
                    <p className='text-white/40 text-sm animate-pulse'>Fetching live order tracking...</p>
                </div>
            </div>
        )
    }

    if (!currentOrder || error) {
        return (
            <div className='min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center p-4'>
                <FaTimesCircle className='text-red-500 text-5xl mb-4' />
                <h2 className='text-xl font-bold mb-2'>Order not found</h2>
                <p className='text-white/50 text-sm mb-6 max-w-sm text-center'>{error || "We couldn't retrieve tracking information for this order."}</p>
                <button
                    onClick={() => navigate('/my-orders')}
                    className='px-6 py-2.5 rounded-full bg-orange-500 text-white font-semibold text-sm'
                >
                    Back to My Orders
                </button>
            </div>
        )
    }

    const shopOrder = currentOrder.shopOrders?.[0]
    const status = shopOrder?.status || 'pending'
    const isCancelled = currentOrder.isCancelled || status === 'cancelled'
    const isDelivered = status === 'delivered'
    const canCancel = !isCancelled && !isDelivered && status !== 'out of delivery'
    const assignedBoy = shopOrder?.assignedDeliveryBoy
    const timeline = getTimelineStages(status, isCancelled)

    return (
        <div className='min-h-screen bg-[#0a0a0f] text-gray-100 font-sans p-4 sm:p-6 lg:p-10 relative overflow-hidden'>
            {/* Ambient Lighting */}
            <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none' />
            <div className='absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-3xl pointer-events-none' />

            <div className='max-w-4xl mx-auto relative z-10'>
                {/* Header */}
                <div className='flex items-center justify-between mb-8'>
                    <div className='flex items-center gap-4'>
                        <button
                            onClick={() => navigate('/my-orders')}
                            className='w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition'
                        >
                            <IoArrowBack size={20} className='text-white' />
                        </button>
                        <div>
                            <div className='flex items-center gap-2'>
                                <h1 className='text-2xl sm:text-3xl font-extrabold text-white'>
                                    Order Tracking
                                </h1>
                                <span className='font-mono text-xs px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold'>
                                    #{currentOrder._id.slice(-6).toUpperCase()}
                                </span>
                            </div>
                            <p className='text-white/40 text-xs mt-1'>
                                Placed on {new Date(currentOrder.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleGetOrder}
                        className='p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/50 text-white/70 hover:text-white transition'
                        title="Refresh Status"
                    >
                        <FaSync size={14} />
                    </button>
                </div>

                {/* Status Timeline Card */}
                <div className='bg-[#12121c] border border-white/10 rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl'>
                    <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/5 mb-6'>
                        <div>
                            <span className='text-[10px] uppercase font-bold text-orange-400 tracking-wider'>Current Status</span>
                            <h2 className='text-2xl font-black text-white capitalize mt-0.5'>
                                {isCancelled ? 'Order Cancelled' : status.replace('_', ' ')}
                            </h2>
                            <p className='text-xs text-white/50 mt-1'>
                                {isCancelled
                                    ? `Cancelled: ${currentOrder.cancellationReason || currentOrder.cancellationNote || 'By customer'}`
                                    : isDelivered
                                    ? 'Your feast has arrived. Enjoy your meal!'
                                    : 'Estimated delivery in 25-35 minutes'}
                            </p>
                        </div>

                        {/* Cancel Button */}
                        {canCancel && (
                            <button
                                onClick={() => setShowCancelModal(true)}
                                className='px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-semibold text-xs transition flex items-center gap-1.5'
                            >
                                <FaBan size={11} /> Cancel Order
                            </button>
                        )}
                    </div>

                    {/* Timeline Stages */}
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                        {timeline.map((st, i) => {
                            const IconComponent = st.icon
                            return (
                                <div
                                    key={i}
                                    className={`p-4 rounded-2xl border transition relative overflow-hidden ${
                                        st.isRed
                                            ? 'bg-red-500/10 border-red-500/30'
                                            : st.done
                                            ? 'bg-orange-500/10 border-orange-500/30'
                                            : 'bg-white/[0.02] border-white/5 opacity-40'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${
                                        st.isRed
                                            ? 'bg-red-500 text-white'
                                            : st.done
                                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                                            : 'bg-white/10 text-white/40'
                                    }`}>
                                        <IconComponent size={14} />
                                    </div>
                                    <h4 className='text-xs font-bold text-white mb-0.5'>{st.label}</h4>
                                    <span className={`text-[10px] font-semibold ${
                                        st.isRed ? 'text-red-400' : st.done ? 'text-orange-400' : 'text-white/30'
                                    }`}>
                                        {st.done ? (st.isRed ? 'Cancelled' : 'Completed ✓') : 'Pending'}
                                    </span>
                                </div>
                            )
                        })}
                    </div>

                    {/* Refund Banner if Cancelled */}
                    {isCancelled && currentOrder.paymentMethod === 'online' && (
                        <div className='mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
                            <div className='flex items-center gap-3'>
                                <FaShieldAlt className='text-emerald-400 text-xl' />
                                <div>
                                    <div className='text-xs font-bold text-emerald-400'>
                                        Refund Status: {(currentOrder.refundStatus || 'Completed').toUpperCase()}
                                    </div>
                                    <div className='text-[11px] text-white/60'>
                                        Refund of ₹{currentOrder.refundAmount || currentOrder.totalAmount} processed via Razorpay.
                                    </div>
                                    {currentOrder.refundId && (
                                        <div className='text-[10px] text-white/40 font-mono mt-0.5'>Ref ID: {currentOrder.refundId}</div>
                                    )}
                                </div>
                            </div>
                            <span className='px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'>
                                Instant Refund
                            </span>
                        </div>
                    )}
                </div>

                {/* Delivery Boy Information */}
                {assignedBoy && !isCancelled && (
                    <div className='bg-[#12121c] border border-white/10 rounded-3xl p-6 mb-8 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
                        <div className='flex items-center gap-4'>
                            <div className='w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-orange-500/20'>
                                <FaMotorcycle />
                            </div>
                            <div>
                                <span className='text-[10px] uppercase font-bold text-orange-400 tracking-wider'>Your Delivery Partner</span>
                                <h3 className='text-lg font-bold text-white'>{assignedBoy.fullName}</h3>
                                <p className='text-xs text-white/40 flex items-center gap-2 mt-0.5'>
                                    <span>Phone: {assignedBoy.mobile}</span>
                                    <span>•</span>
                                    <span className='text-emerald-400 flex items-center gap-1'>
                                        <FaStar size={10} /> 4.9 Rating
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className='flex items-center gap-2'>
                            <a
                                href={`tel:${assignedBoy.mobile}`}
                                className='px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition'
                            >
                                <FaPhone size={11} className='text-orange-400' /> Call
                            </a>
                            <a
                                href={`https://wa.me/${assignedBoy.mobile}`}
                                target="_blank"
                                rel="noreferrer"
                                className='px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition'
                            >
                                <FaWhatsapp size={13} /> WhatsApp
                            </a>
                        </div>
                    </div>
                )}

                {/* Live Delivery Map if assigned & out for delivery */}
                {assignedBoy && status === 'out of delivery' && (
                    <div className='bg-[#12121c] border border-white/10 rounded-3xl p-6 mb-8 shadow-2xl'>
                        <div className='flex items-center gap-2 text-sm font-bold text-white mb-4'>
                            <div className='w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping' />
                            <span>Live GPS Delivery Map</span>
                        </div>
                        <div className='rounded-2xl overflow-hidden border border-white/5'>
                            <DeliveryBoyTracking
                                data={{
                                    deliveryBoyLocation: liveLocations[assignedBoy._id] || {
                                        lat: assignedBoy.location?.coordinates?.[1] || 28.4744,
                                        lon: assignedBoy.location?.coordinates?.[0] || 77.5040
                                    },
                                    customerLocation: {
                                        lat: currentOrder.deliveryAddress?.latitude || 28.4744,
                                        lon: currentOrder.deliveryAddress?.longitude || 77.5040
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Order Details & Items Card */}
                <div className='bg-[#12121c] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6'>
                    <div className='flex items-center justify-between border-b border-white/5 pb-4'>
                        <div className='flex items-center gap-3'>
                            <FaStore className='text-orange-500 text-xl' />
                            <div>
                                <h3 className='font-bold text-white text-base'>{shopOrder?.shop?.name || 'Restaurant'}</h3>
                                <p className='text-xs text-white/40'>{currentOrder.deliveryAddress?.text}</p>
                            </div>
                        </div>
                        <div className='text-right'>
                            <span className='text-[10px] text-white/40 uppercase block'>Payment</span>
                            <span className='text-xs font-bold text-white capitalize'>
                                {currentOrder.paymentMethod} {currentOrder.payment ? '(Paid ✓)' : '(Unpaid)'}
                            </span>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className='space-y-3'>
                        <h4 className='text-xs uppercase font-bold text-white/40 tracking-wider'>Ordered Items</h4>
                        {shopOrder?.shopOrderItems?.map((item, idx) => (
                            <div key={idx} className='flex items-center justify-between py-2 border-b border-white/5 text-sm'>
                                <div className='flex items-center gap-2'>
                                    <span className='font-medium text-white'>{item.name}</span>
                                    <span className='text-xs text-white/40'>× {item.quantity}</span>
                                </div>
                                <span className='font-bold text-white'>₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>

                    {/* Price Summary */}
                    <div className='pt-4 border-t border-white/5 space-y-2 text-xs'>
                        <div className='flex justify-between text-white/60'>
                            <span>Subtotal</span>
                            <span>₹{shopOrder?.subtotal || 0}</span>
                        </div>
                        <div className='flex justify-between text-white/60'>
                            <span>Delivery Fee</span>
                            <span>{currentOrder.deliveryFee === 0 ? 'FREE' : `₹${currentOrder.deliveryFee || 0}`}</span>
                        </div>
                        <div className='flex justify-between text-white/60'>
                            <span>Taxes & GST</span>
                            <span>₹{currentOrder.taxAmount || 23}</span>
                        </div>
                        {currentOrder.discountAmount > 0 && (
                            <div className='flex justify-between text-emerald-400 font-semibold'>
                                <span>Discount ({currentOrder.couponCode || 'Promo'})</span>
                                <span>- ₹{currentOrder.discountAmount}</span>
                            </div>
                        )}
                        <div className='pt-3 border-t border-white/10 flex justify-between text-base font-extrabold text-white'>
                            <span>Total Paid</span>
                            <span className='text-orange-400'>₹{currentOrder.totalAmount}</span>
                        </div>
                    </div>

                    {/* Quick Action Footer */}
                    <div className='pt-4 border-t border-white/5 flex flex-wrap gap-3 justify-end'>
                        <button
                            onClick={() => navigate('/help')}
                            className='px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-xs font-semibold flex items-center gap-1.5 transition'
                        >
                            <FaHeadset className='text-orange-400' /> Need Help?
                        </button>
                        <button
                            onClick={() => navigate('/restaurants')}
                            className='px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs font-bold transition'
                        >
                            Order More Food
                        </button>
                    </div>
                </div>
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <CancelOrderModal
                    isOpen={showCancelModal}
                    onClose={() => setShowCancelModal(false)}
                    orderId={currentOrder._id}
                    onCancelled={() => {
                        setShowCancelModal(false)
                        handleGetOrder()
                    }}
                />
            )}
        </div>
    )
}

export default TrackOrderPage
