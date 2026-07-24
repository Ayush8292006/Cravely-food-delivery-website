import React, { useState, useEffect } from 'react'
import { 
    FaTimes, FaTruck, FaClock, FaMapMarkerAlt, 
    FaRupeeSign, FaUtensils, FaStore, FaUser,
    FaPhone, FaWhatsapp, FaCreditCard, FaCheckCircle,
    FaTimesCircle, FaMotorcycle, FaCalendar, FaTag,
    FaTrashAlt, FaArrowRight, FaReceipt, FaBox,
    FaGift, FaShieldAlt, FaStar, FaAward,
    FaDownload, FaPrint, FaShareAlt, FaHeart,
    FaCopy, FaCheck, FaRocket, FaGem, FaCrown,
    FaMedal, FaFire, FaLeaf, FaDrumstickBite,
    FaImage, FaCamera, FaEye, FaCartPlus,
    FaShoppingBag, FaStoreAlt, FaUtensilSpoon,
    FaShoppingCart, FaKey, FaLock
} from 'react-icons/fa'
import { MdDeliveryDining, MdVerified, MdRestaurant } from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../redux/userSlice'
import Invoice from './Invoice'
import ReviewModal from './ReviewModal'
import DeliveryBoyRatingModal from './DeliveryBoyRatingModal'
import { toast } from 'react-toastify'
// ✅ ADD THIS IMPORT
import { serverUrl } from '../App'

function OrderDetailModal({ isOpen, onClose, order, onCancelOrder }) {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { socket } = useSelector(state => state.user)
    const [imageErrors, setImageErrors] = useState({})
    const [showInvoice, setShowInvoice] = useState(false)
    const [copied, setCopied] = useState(false)
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [showDeliveryRating, setShowDeliveryRating] = useState(false)
    const [reviewSubmitted, setReviewSubmitted] = useState(false)
    const [deliveryRatingSubmitted, setDeliveryRatingSubmitted] = useState(false)
    const [liveOtp, setLiveOtp] = useState(null)
    const [otpExpiry, setOtpExpiry] = useState(null)

    // ✅ ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURN
    useEffect(() => {
        if (!socket || !isOpen) return

        socket.on('delivery-otp', ({ otp, orderId }) => {
            if (orderId === order?._id) {
                setLiveOtp(otp)
                setOtpExpiry(Date.now() + 5 * 60 * 1000)
                toast.info(`🔑 OTP: ${otp} - Share with delivery boy`, {
                    position: "top-center",
                    autoClose: 5000,
                })
            }
        })

        return () => {
            socket.off('delivery-otp')
        }
    }, [socket, isOpen, order?._id])

    // ✅ HOOKS COMPLETE - NOW CONDITIONAL RETURN
    if (!isOpen || !order) return null

    const firstShop = order.shopOrders?.[0]
    const restaurant = firstShop?.shop
    const status = firstShop?.status || 'pending'
    const isDelivered = status === 'delivered'
    const isCancelled = status === 'cancelled'
    const isOutForDelivery = status === 'out of delivery'
    const deliveryBoy = firstShop?.assignedDeliveryBoy
    const deliveryOtp = firstShop?.deliveryOtp

    const hasReviewed = order?.userReview?.submitted || order?.hasReviewed || false
    const hasRatedDelivery = order?.deliveryRating?.submitted || false

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString('en-GB', {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    const getStatusColor = () => {
        switch(status) {
            case 'pending': return 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30'
            case 'preparing': return 'text-blue-400 bg-blue-500/15 border-blue-500/30'
            case 'out of delivery': return 'text-orange-400 bg-orange-500/15 border-orange-500/30'
            case 'delivered': return 'text-green-400 bg-green-500/15 border-green-500/30'
            case 'cancelled': return 'text-red-400 bg-red-500/15 border-red-500/30'
            default: return 'text-white/40 bg-white/5 border-white/10'
        }
    }

    const getStatusLabel = () => {
        switch(status) {
            case 'pending': return '⏳ Pending'
            case 'preparing': return '🔧 Preparing'
            case 'out of delivery': return '🚚 Out for Delivery'
            case 'delivered': return '✅ Delivered'
            case 'cancelled': return '❌ Cancelled'
            default: return 'Pending'
        }
    }

    const getStatusIcon = () => {
        switch(status) {
            case 'pending': return <FaClock className="text-yellow-400" />
            case 'preparing': return <FaUtensils className="text-blue-400" />
            case 'out of delivery': return <FaTruck className="text-orange-400" />
            case 'delivered': return <FaCheckCircle className="text-green-400" />
            case 'cancelled': return <FaTimesCircle className="text-red-400" />
            default: return null
        }
    }

    const handleOrderAgain = () => {
        const items = []
        order.shopOrders.forEach(shopOrder => {
            shopOrder.shopOrderItems.forEach(item => {
                items.push({
                    id: item.item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    shop: shopOrder.shop,
                    image: item.item.image,
                    foodType: item.item.foodType || 'veg'
                })
            })
        })

        items.forEach(item => {
            dispatch(addToCart(item))
        })

        toast.success(`🛒 ${items.length} items added to cart!`)
        onClose()
        navigate('/cart')
    }

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `Order #${order._id?.slice(-6)}`,
                text: `My order from ${restaurant?.name} on Cravely!`,
                url: window.location.href,
            }).catch(() => {})
        } else {
            navigator.clipboard.writeText(`Order #${order._id?.slice(-6)} - ${restaurant?.name} - ₹${order.totalAmount}`)
            toast.success('📋 Order details copied!')
        }
    }

    const copyOrderId = () => {
        navigator.clipboard.writeText(order._id)
        setCopied(true)
        toast.success('📋 Order ID copied!')
        setTimeout(() => setCopied(false), 2000)
    }

    const handleReviewSubmitted = () => {
        setReviewSubmitted(true)
        toast.success('📝 Thank you for your review!')
    }

    const handleDeliveryRatingSubmitted = () => {
        setDeliveryRatingSubmitted(true)
        toast.success('🚴 Thank you for rating your delivery!')
    }

    const copyOtp = () => {
        if (liveOtp || deliveryOtp) {
            const otpToCopy = liveOtp || deliveryOtp
            navigator.clipboard.writeText(otpToCopy)
            toast.success('🔑 OTP copied to clipboard!')
        }
    }

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath
        }
        if (imagePath.startsWith('/')) {
            return `${serverUrl}${imagePath}`
        }
        return `${serverUrl}/uploads/${imagePath}`
    }

    const handleImageError = (key) => {
        setImageErrors(prev => ({ ...prev, [key]: true }))
    }

    const shopImage = restaurant?.image ? getImageUrl(restaurant.image) : null
    const showShopImage = shopImage && !imageErrors['shop']

    const shouldShowReview = isDelivered && !isCancelled && !reviewSubmitted && !hasReviewed
    const shouldShowDeliveryRating = isDelivered && !isCancelled && !deliveryRatingSubmitted && !hasRatedDelivery
    const otpToShow = liveOtp || deliveryOtp

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='fixed inset-0 bg-black/85 backdrop-blur-3xl flex items-center justify-center z-[99999] p-4'
                    onClick={onClose}
                >
                    <motion.div 
                        initial={{ scale: 0.8, y: 30, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.8, y: 30, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className='relative bg-gradient-to-b from-[#1a1a2e] to-[#12121a] rounded-3xl border border-white/10 max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl shadow-black/50'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className='absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff2d55] to-transparent' />
                        <div className='absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent' />

                        <motion.button 
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            className='absolute top-4 right-4 z-10 text-white/40 hover:text-white transition-all duration-300 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 backdrop-blur-sm border border-white/5'
                            onClick={onClose}
                        >
                            <FaTimes size={18} />
                        </motion.button>

                        <div className='p-6'>
                            {/* Header */}
                            <div className='flex items-start gap-4 mb-5 pb-5 border-b border-white/5'>
                                <div className='flex-shrink-0 relative'>
                                    {showShopImage ? (
                                        <img 
                                            src={shopImage}
                                            alt={restaurant?.name || 'Restaurant'}
                                            className='w-20 h-20 rounded-2xl object-cover border-2 border-white/10 shadow-xl'
                                            onError={() => handleImageError('shop')}
                                        />
                                    ) : (
                                        <div className='w-20 h-20 rounded-2xl bg-gradient-to-br from-[#ff2d55]/20 to-[#ff6b35]/20 flex items-center justify-center border-2 border-white/10'>
                                            <MdRestaurant className='text-white/30 text-3xl' />
                                        </div>
                                    )}
                                    <div className='absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center shadow-lg shadow-[#ff2d55]/30 border-2 border-[#0a0a0f]'>
                                        <MdVerified size={12} className="text-white" />
                                    </div>
                                </div>
                                <div className='flex-1 min-w-0'>
                                    <div className='flex items-center gap-2 flex-wrap'>
                                        <h2 className='text-xl font-bold text-white truncate'>
                                            {restaurant?.name || 'Cravely'}
                                        </h2>
                                        <button 
                                            onClick={copyOrderId}
                                            className='text-white/30 hover:text-white/60 transition-all duration-300'
                                        >
                                            {copied ? <FaCheck size={12} className="text-green-400" /> : <FaCopy size={12} />}
                                        </button>
                                    </div>
                                    <div className='flex items-center gap-2 mt-1 flex-wrap'>
                                        <span className={`text-[10px] px-3 py-1 rounded-full font-medium border flex items-center gap-1.5 ${getStatusColor()}`}>
                                            {getStatusIcon()} {getStatusLabel()}
                                        </span>
                                        {isDelivered && (
                                            <span className='text-[10px] text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20 flex items-center gap-1'>
                                                <FaCheckCircle size={10} /> Delivered
                                            </span>
                                        )}
                                        {isOutForDelivery && (
                                            <span className='text-[10px] text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20 flex items-center gap-1 animate-pulse'>
                                                <FaTruck size={10} /> On the way
                                            </span>
                                        )}
                                    </div>
                                    <p className='text-white/30 text-xs flex items-center gap-1.5 mt-1'>
                                        <FaCalendar size={10} className="text-white/20" />
                                        {formatDate(order.createdAt)}
                                    </p>
                                    <p className='text-white/20 text-[10px] font-mono'>
                                        ID: {order._id}
                                    </p>
                                </div>
                            </div>

                            {/* ✅ OTP Display - Show only when out for delivery and not delivered */}
                            {otpToShow && !isDelivered && !isCancelled && (
                                <div className='mb-5 p-4 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30'>
                                    <div className='flex items-center gap-3'>
                                        <div className='w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center'>
                                            <FaKey className='text-yellow-400 text-lg' />
                                        </div>
                                        <div className='flex-1'>
                                            <p className='text-white/60 text-[10px] font-medium uppercase tracking-wider'>Delivery OTP</p>
                                            <div className='flex items-center gap-2'>
                                                <p className='text-3xl font-bold text-yellow-400 tracking-[0.2em] font-mono'>
                                                    {otpToShow}
                                                </p>
                                                <button 
                                                    onClick={copyOtp}
                                                    className='text-white/30 hover:text-white/60 transition-all duration-300'
                                                >
                                                    <FaCopy size={14} />
                                                </button>
                                            </div>
                                            <p className='text-white/20 text-[10px]'>Share this OTP with the delivery boy</p>
                                        </div>
                                        <div className='text-right'>
                                            <span className='text-[10px] text-green-400 bg-green-500/20 px-2 py-1 rounded-full border border-green-500/20 flex items-center gap-1'>
                                                <span className='w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse' />
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Status Timeline */}
                            <div className='mb-5 p-4 rounded-2xl bg-white/5 border border-white/5'>
                                <div className='flex items-center justify-between relative'>
                                    {[
                                        { label: 'Ordered', icon: <FaClock size={12} />, active: true },
                                        { label: 'Preparing', icon: <FaUtensils size={12} />, active: status === 'preparing' || status === 'out of delivery' || status === 'delivered' },
                                        { label: 'Delivering', icon: <FaTruck size={12} />, active: status === 'out of delivery' || status === 'delivered' },
                                        { label: 'Delivered', icon: <FaCheckCircle size={12} />, active: status === 'delivered' }
                                    ].map((step, idx) => (
                                        <div key={idx} className='flex flex-col items-center gap-1 flex-1'>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                                                step.active 
                                                    ? 'bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white shadow-lg shadow-[#ff2d55]/30 scale-110' 
                                                    : 'bg-white/10 text-white/30'
                                            }`}>
                                                {step.icon}
                                            </div>
                                            <p className={`text-[8px] font-medium ${step.active ? 'text-white/70' : 'text-white/30'}`}>
                                                {step.label}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className='mb-4'>
                                <div className='flex items-center justify-between mb-3'>
                                    <h3 className='text-white/60 text-xs font-medium uppercase tracking-wider flex items-center gap-2'>
                                        <FaBox size={12} className="text-[#ff6b35]" /> Items
                                    </h3>
                                    <span className='text-white/30 text-[10px] bg-white/5 px-2.5 py-1 rounded-full border border-white/5'>
                                        {firstShop?.shopOrderItems?.length || 0} items
                                    </span>
                                </div>
                                <div className='space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar'>
                                    {firstShop?.shopOrderItems?.map((item, idx) => {
                                        const itemImage = item.item?.image ? getImageUrl(item.item.image) : null
                                        const itemKey = `item_${idx}`
                                        const showItemImage = itemImage && !imageErrors[itemKey]
                                        
                                        return (
                                            <motion.div 
                                                key={idx} 
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className='flex items-center gap-3 bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-[#ff2d55]/20'
                                            >
                                                {showItemImage ? (
                                                    <img 
                                                        src={itemImage}
                                                        alt={item.name}
                                                        className='w-12 h-12 rounded-xl object-cover border border-white/10'
                                                        onError={() => handleImageError(itemKey)}
                                                    />
                                                ) : (
                                                    <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff2d55]/20 to-[#ff6b35]/20 flex items-center justify-center border border-white/10'>
                                                        <FaUtensils className='text-white/30 text-lg' />
                                                    </div>
                                                )}
                                                <div className='flex-1'>
                                                    <p className='text-white text-sm font-medium'>{item.name}</p>
                                                    <p className='text-white/30 text-xs flex items-center gap-2'>
                                                        <span>₹{item.price} × {item.quantity}</span>
                                                        {item.item?.foodType === 'veg' ? (
                                                            <span className='text-green-400 text-[10px] bg-green-500/10 px-1.5 py-0.5 rounded-full border border-green-500/20'>Veg</span>
                                                        ) : item.item?.foodType === 'non veg' ? (
                                                            <span className='text-red-400 text-[10px] bg-red-500/10 px-1.5 py-0.5 rounded-full border border-red-500/20'>Non-Veg</span>
                                                        ) : null}
                                                    </p>
                                                </div>
                                                <div className='text-right'>
                                                    <p className='text-white font-semibold text-sm'>₹{item.price * item.quantity}</p>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* ✅ Delivery Boy - Show number only BEFORE delivery */}
                            {deliveryBoy && !isCancelled && (
                                <div className='mb-4 p-4 rounded-2xl bg-gradient-to-r from-[#ff2d55]/10 to-[#ff6b35]/10 border border-[#ff2d55]/20'>
                                    <h3 className='text-white/60 text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2'>
                                        <FaMotorcycle size={12} className="text-[#ff6b35]" /> Delivery Partner
                                    </h3>
                                    <div className='flex items-center gap-3'>
                                        <div className='w-12 h-12 rounded-full bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center shadow-lg shadow-[#ff2d55]/20 flex-shrink-0'>
                                            <FaMotorcycle className='text-white text-xl' />
                                        </div>
                                        <div className='flex-1'>
                                            <div className='flex items-center gap-2'>
                                                <p className='text-white font-semibold text-sm'>{deliveryBoy.fullName}</p>
                                                <span className='text-[8px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1 border border-green-500/20'>
                                                    <span className='w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse' />
                                                    Live
                                                </span>
                                            </div>
                                            {/* ✅ Show Mobile ONLY if NOT delivered */}
                                            {!isDelivered && (
                                                <div className='flex items-center gap-2 text-xs mt-1'>
                                                    <span className='text-white/40 flex items-center gap-1'>
                                                        <FaPhone size={10} className="text-[#ff6b35]" />
                                                        {deliveryBoy.mobile}
                                                    </span>
                                                    <a href={`tel:${deliveryBoy.mobile}`} className='text-[#ff6b35] hover:underline text-[10px] font-medium'>Call</a>
                                                    <a href={`https://wa.me/${deliveryBoy.mobile}`} target="_blank" rel="noopener noreferrer" className='text-green-400 hover:underline text-[10px] font-medium'>
                                                        <FaWhatsapp size={11} className="inline" /> WhatsApp
                                                    </a>
                                                </div>
                                            )}
                                            {/* ✅ After delivery - Show "Delivered" message */}
                                            {isDelivered && (
                                                <p className='text-green-400 text-xs font-medium flex items-center gap-1'>
                                                    <FaCheckCircle size={10} /> Order delivered successfully
                                                </p>
                                            )}
                                        </div>
                                        {deliveryBoy.deliveryBoyRating?.average > 0 && (
                                            <div className='flex items-center gap-1 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20'>
                                                <FaStar className='text-yellow-400 text-[10px]' />
                                                <span className='text-white/60 text-[10px] font-medium'>{deliveryBoy.deliveryBoyRating.average.toFixed(1)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Delivery Address & Payment */}
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4'>
                                <div className='p-4 rounded-2xl bg-white/5 border border-white/5'>
                                    <h3 className='text-white/40 text-[10px] font-medium uppercase tracking-wider mb-2 flex items-center gap-2'>
                                        <FaMapMarkerAlt size={12} className="text-[#ff6b35]" /> Address
                                    </h3>
                                    <p className='text-white/70 text-sm leading-relaxed'>
                                        {order.deliveryAddress?.text || 'Address not available'}
                                    </p>
                                </div>
                                <div className='p-4 rounded-2xl bg-white/5 border border-white/5'>
                                    <h3 className='text-white/40 text-[10px] font-medium uppercase tracking-wider mb-2 flex items-center gap-2'>
                                        <FaCreditCard size={12} className="text-[#ff6b35]" /> Payment
                                    </h3>
                                    <p className='text-white text-sm capitalize'>{order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Online'}</p>
                                    <p className={order.payment ? 'text-green-400 text-xs font-medium' : 'text-yellow-400 text-xs font-medium'}>
                                        {order.payment ? '✅ Payment Successful' : '⏳ Payment Pending'}
                                    </p>
                                </div>
                            </div>

                            {/* Total */}
                            <div className='mb-4 p-4 rounded-2xl bg-gradient-to-r from-[#ff2d55]/10 to-[#ff6b35]/10 border border-[#ff2d55]/20'>
                                <div className='flex items-center justify-between'>
                                    <span className='text-white/60 text-sm font-medium'>Total Amount</span>
                                    <div className='text-right'>
                                        <span className='text-[#ff6b35] font-bold text-2xl'>₹{order.totalAmount || firstShop?.subtotal || 0}</span>
                                        <p className='text-white/20 text-[10px]'>Inclusive of all taxes</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className='flex flex-wrap gap-2 pt-3 border-t border-white/10'>
                                {/* Track Order */}
                                {!isCancelled && !isDelivered && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            navigate(`/track-order/${order._id}`)
                                            onClose()
                                        }}
                                        className='flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white text-xs font-medium hover:scale-105 transition-all duration-300 shadow-lg shadow-[#ff2d55]/20 flex items-center justify-center gap-2'
                                    >
                                        <FaTruck size={14} /> Track Order
                                    </motion.button>
                                )}
                                
                                {/* Cancel */}
                                {!isCancelled && !isDelivered && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            onCancelOrder(order._id)
                                            onClose()
                                        }}
                                        className='flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-white/15 text-white/40 text-xs font-medium hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all duration-300 flex items-center justify-center gap-2'
                                    >
                                        <FaTrashAlt size={14} /> Cancel
                                    </motion.button>
                                )}
                                
                                {/* Order Again */}
                                {!isCancelled && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleOrderAgain}
                                        className='flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium hover:scale-105 transition-all duration-300 shadow-lg shadow-green-500/20 flex items-center justify-center gap-2'
                                    >
                                        <FaShoppingCart size={14} /> Order Again
                                    </motion.button>
                                )}

                                {/* Review */}
                                {shouldShowReview && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowReviewModal(true)}
                                        className='flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-medium hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2'
                                    >
                                        <FaStar size={14} /> Review
                                    </motion.button>
                                )}

                                {/* Rate Delivery */}
                                {shouldShowDeliveryRating && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowDeliveryRating(true)}
                                        className='flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium hover:scale-105 transition-all duration-300 shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2'
                                    >
                                        <MdDeliveryDining size={14} /> Rate Delivery
                                    </motion.button>
                                )}

                                {/* Invoice */}
                                {isDelivered && !isCancelled && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowInvoice(true)}
                                        className='flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-white/5 text-white/60 text-xs font-medium hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 border border-white/10'
                                    >
                                        <FaReceipt size={14} /> Invoice
                                    </motion.button>
                                )}

                                {/* Share */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleShare}
                                    className='flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-white/5 text-white/40 text-xs font-medium hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 border border-white/10'
                                >
                                    <FaShareAlt size={14} /> Share
                                </motion.button>

                                {/* Review Submitted Badge */}
                                {(isDelivered && (reviewSubmitted || hasReviewed)) && (
                                    <span className='px-3 py-2 rounded-xl bg-green-500/20 text-green-400 text-xs font-medium flex items-center gap-1.5 border border-green-500/30'>
                                        <FaCheck size={12} /> Reviewed
                                    </span>
                                )}

                                {/* Delivery Rating Submitted Badge */}
                                {(isDelivered && (deliveryRatingSubmitted || hasRatedDelivery)) && (
                                    <span className='px-3 py-2 rounded-xl bg-purple-500/20 text-purple-400 text-xs font-medium flex items-center gap-1.5 border border-purple-500/30'>
                                        <FaCheck size={12} /> Rated
                                    </span>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Invoice Modal */}
                    {showInvoice && (
                        <Invoice 
                            order={order}
                            onClose={() => setShowInvoice(false)}
                        />
                    )}

                    {/* Review Modal */}
                    {showReviewModal && (
                        <ReviewModal
                            shopId={firstShop?.shop?._id}
                            orderId={order._id}
                            onClose={() => setShowReviewModal(false)}
                            onReviewSubmitted={handleReviewSubmitted}
                        />
                    )}

                    {/* Delivery Rating Modal */}
                    {showDeliveryRating && (
                        <DeliveryBoyRatingModal
                            orderId={order._id}
                            onClose={() => setShowDeliveryRating(false)}
                            onRatingSubmitted={handleDeliveryRatingSubmitted}
                        />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default OrderDetailModal