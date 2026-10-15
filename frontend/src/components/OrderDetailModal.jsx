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
import { serverUrl } from '../../config'

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

    // ✅ Calculate bill breakdown
    const calculatedSubtotal = 
        order.subtotal || 
        firstShop?.subtotal || 
        order.shopOrders?.reduce((sum, so) => sum + (so.subtotal || 0), 0) || 
        0
    const calculatedDeliveryFee = order.deliveryFee ?? 0
    const calculatedTax = order.taxAmount ?? 23
    const calculatedTotal = 
        order.totalAmount || 
        (calculatedSubtotal + calculatedDeliveryFee + calculatedTax)

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
            case 'pending': return 'text-amber-700 bg-amber-50 border-amber-200'
            case 'preparing': return 'text-blue-700 bg-blue-50 border-blue-200'
            case 'out of delivery': return 'text-orange-700 bg-orange-50 border-orange-200'
            case 'delivered': return 'text-green-700 bg-green-50 border-green-200'
            case 'cancelled': return 'text-red-700 bg-red-50 border-red-200'
            default: return 'text-gray-600 bg-gray-50 border-gray-200'
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
                    className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999] p-4'
                    onClick={onClose}
                >
                    <motion.div 
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className='relative bg-white rounded-3xl border border-gray-200 max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl'
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top accent bar */}
                        <div className='h-1.5 w-full bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400' />

                        <button 
                            className='absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-all duration-300 w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100'
                            onClick={onClose}
                        >
                            <FaTimes size={18} />
                        </button>

                        <div className='p-6'>
                            {/* Header */}
                            <div className='flex items-start gap-4 mb-5 pb-5 border-b border-gray-200'>
                                <div className='flex-shrink-0 relative'>
                                    {showShopImage ? (
                                        <img 
                                            src={shopImage}
                                            alt={restaurant?.name || 'Restaurant'}
                                            className='w-20 h-20 rounded-2xl object-cover border-2 border-gray-200 shadow-sm'
                                            onError={() => handleImageError('shop')}
                                        />
                                    ) : (
                                        <div className='w-20 h-20 rounded-2xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center'>
                                            <MdRestaurant className='text-gray-400 text-3xl' />
                                        </div>
                                    )}
                                    <div className='absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shadow-sm border-2 border-white'>
                                        <MdVerified size={12} className="text-white" />
                                    </div>
                                </div>
                                <div className='flex-1 min-w-0'>
                                    <div className='flex items-center gap-2 flex-wrap'>
                                        <h2 className='text-xl font-bold text-gray-900 truncate'>
                                            {restaurant?.name || 'Cravely'}
                                        </h2>
                                        <button 
                                            onClick={copyOrderId}
                                            className='text-gray-400 hover:text-gray-600 transition-all'
                                        >
                                            {copied ? <FaCheck size={12} className="text-green-500" /> : <FaCopy size={12} />}
                                        </button>
                                    </div>
                                    <div className='flex items-center gap-2 mt-1 flex-wrap'>
                                        <span className={`text-[10px] px-3 py-1 rounded-full font-medium border flex items-center gap-1.5 ${getStatusColor()}`}>
                                            {getStatusLabel()}
                                        </span>
                                        {isDelivered && (
                                            <span className='text-[10px] text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200 flex items-center gap-1'>
                                                <FaCheckCircle size={10} /> Delivered
                                            </span>
                                        )}
                                        {isOutForDelivery && (
                                            <span className='text-[10px] text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200 flex items-center gap-1 animate-pulse'>
                                                <FaTruck size={10} /> On the way
                                            </span>
                                        )}
                                    </div>
                                    <p className='text-gray-400 text-xs flex items-center gap-1.5 mt-1'>
                                        <FaCalendar size={10} className="text-gray-300" />
                                        {formatDate(order.createdAt)}
                                    </p>
                                    <p className='text-gray-300 text-[10px] font-mono'>
                                        ID: {order._id}
                                    </p>
                                </div>
                            </div>

                            {/* OTP Display */}
                            {otpToShow && !isDelivered && !isCancelled && (
                                <div className='mb-5 p-4 rounded-2xl bg-amber-50 border-2 border-amber-200'>
                                    <div className='flex items-center gap-3'>
                                        <div className='w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center'>
                                            <FaKey className='text-amber-600 text-lg' />
                                        </div>
                                        <div className='flex-1'>
                                            <p className='text-gray-500 text-[10px] font-medium uppercase tracking-wider'>Delivery OTP</p>
                                            <div className='flex items-center gap-2'>
                                                <p className='text-2xl font-bold text-amber-700 tracking-[0.2em] font-mono'>
                                                    {otpToShow}
                                                </p>
                                                <button 
                                                    onClick={copyOtp}
                                                    className='text-gray-400 hover:text-gray-600 transition'
                                                >
                                                    <FaCopy size={14} />
                                                </button>
                                            </div>
                                            <p className='text-gray-400 text-[10px]'>Share this OTP with the delivery boy</p>
                                        </div>
                                        <div className='text-right'>
                                            <span className='text-[10px] text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200 flex items-center gap-1'>
                                                <span className='w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse' />
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Status Timeline */}
                            <div className='mb-5 p-4 rounded-2xl bg-gray-50 border border-gray-200'>
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
                                                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200 scale-110' 
                                                    : 'bg-gray-200 text-gray-400'
                                            }`}>
                                                {step.icon}
                                            </div>
                                            <p className={`text-[8px] font-medium ${step.active ? 'text-gray-700' : 'text-gray-400'}`}>
                                                {step.label}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className='mb-4'>
                                <div className='flex items-center justify-between mb-3'>
                                    <h3 className='text-gray-500 text-xs font-medium uppercase tracking-wider flex items-center gap-2'>
                                        <FaBox size={12} className="text-orange-500" /> Items
                                    </h3>
                                    <span className='text-gray-400 text-[10px] bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200'>
                                        {firstShop?.shopOrderItems?.length || 0} items
                                    </span>
                                </div>
                                <div className='space-y-2 max-h-52 overflow-y-auto pr-1'>
                                    {firstShop?.shopOrderItems?.map((item, idx) => {
                                        const itemImage = item.item?.image ? getImageUrl(item.item.image) : null
                                        const itemKey = `item_${idx}`
                                        const showItemImage = itemImage && !imageErrors[itemKey]
                                        
                                        return (
                                            <div 
                                                key={idx} 
                                                className='flex items-center gap-3 bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-all duration-300 border border-gray-200'
                                            >
                                                {showItemImage ? (
                                                    <img 
                                                        src={itemImage}
                                                        alt={item.name}
                                                        className='w-12 h-12 rounded-xl object-cover border border-gray-200'
                                                        onError={() => handleImageError(itemKey)}
                                                    />
                                                ) : (
                                                    <div className='w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center border border-gray-300'>
                                                        <FaUtensils className='text-gray-400 text-lg' />
                                                    </div>
                                                )}
                                                <div className='flex-1'>
                                                    <p className='text-gray-800 text-sm font-medium'>{item.name}</p>
                                                    <p className='text-gray-400 text-xs flex items-center gap-2'>
                                                        <span>₹{item.price} × {item.quantity}</span>
                                                        {item.item?.foodType === 'veg' ? (
                                                            <span className='text-green-600 text-[10px] bg-green-50 px-1.5 py-0.5 rounded-full border border-green-200'>Veg</span>
                                                        ) : item.item?.foodType === 'non veg' ? (
                                                            <span className='text-red-600 text-[10px] bg-red-50 px-1.5 py-0.5 rounded-full border border-red-200'>Non-Veg</span>
                                                        ) : null}
                                                    </p>
                                                </div>
                                                <div className='text-right'>
                                                    <p className='text-gray-800 font-semibold text-sm'>₹{item.price * item.quantity}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Delivery Boy */}
                            {deliveryBoy && !isCancelled && (
                                <div className='mb-4 p-4 rounded-2xl bg-orange-50 border-2 border-orange-200'>
                                    <h3 className='text-gray-500 text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2'>
                                        <FaMotorcycle size={12} className="text-orange-500" /> Delivery Partner
                                    </h3>
                                    <div className='flex items-center gap-3'>
                                        <div className='w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center shadow-sm flex-shrink-0'>
                                            <FaMotorcycle className='text-white text-xl' />
                                        </div>
                                        <div className='flex-1'>
                                            <div className='flex items-center gap-2'>
                                                <p className='text-gray-800 font-semibold text-sm'>{deliveryBoy.fullName}</p>
                                                <span className='text-[8px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 border border-green-200'>
                                                    <span className='w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse' />
                                                    Live
                                                </span>
                                            </div>
                                            {!isDelivered && (
                                                <div className='flex items-center gap-2 text-xs mt-1'>
                                                    <span className='text-gray-500 flex items-center gap-1'>
                                                        <FaPhone size={10} className="text-orange-500" />
                                                        {deliveryBoy.mobile}
                                                    </span>
                                                    <a href={`tel:${deliveryBoy.mobile}`} className='text-orange-500 hover:underline text-[10px] font-medium'>Call</a>
                                                    <a href={`https://wa.me/${deliveryBoy.mobile}`} target="_blank" rel="noopener noreferrer" className='text-green-600 hover:underline text-[10px] font-medium'>
                                                        <FaWhatsapp size={11} className="inline" /> WhatsApp
                                                    </a>
                                                </div>
                                            )}
                                            {isDelivered && (
                                                <p className='text-green-600 text-xs font-medium flex items-center gap-1'>
                                                    <FaCheckCircle size={10} /> Order delivered successfully
                                                </p>
                                            )}
                                        </div>
                                        {deliveryBoy.deliveryBoyRating?.average > 0 && (
                                            <div className='flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200'>
                                                <FaStar className='text-amber-500 text-[10px]' />
                                                <span className='text-gray-600 text-[10px] font-medium'>{deliveryBoy.deliveryBoyRating.average.toFixed(1)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Delivery Address & Payment */}
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4'>
                                <div className='p-4 rounded-2xl bg-gray-50 border border-gray-200'>
                                    <h3 className='text-gray-400 text-[10px] font-medium uppercase tracking-wider mb-2 flex items-center gap-2'>
                                        <FaMapMarkerAlt size={12} className="text-orange-500" /> Address
                                    </h3>
                                    <p className='text-gray-700 text-sm leading-relaxed'>
                                        {order.deliveryAddress?.text || 'Address not available'}
                                    </p>
                                </div>
                                <div className='p-4 rounded-2xl bg-gray-50 border border-gray-200'>
                                    <h3 className='text-gray-400 text-[10px] font-medium uppercase tracking-wider mb-2 flex items-center gap-2'>
                                        <FaCreditCard size={12} className="text-orange-500" /> Payment
                                    </h3>
                                    <p className='text-gray-800 text-sm capitalize'>{order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Online'}</p>
                                    <p className={order.payment ? 'text-green-600 text-xs font-medium' : 'text-amber-600 text-xs font-medium'}>
                                        {order.payment ? '✅ Payment Successful' : '⏳ Payment Pending'}
                                    </p>
                                </div>
                            </div>

                            {/* ✅ BILL BREAKDOWN - WITH TAX */}
                            <div className='mb-4 p-4 rounded-2xl bg-orange-50 border-2 border-orange-200'>
                                <h3 className='text-gray-500 text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2'>
                                    <FaReceipt size={12} className="text-orange-500" /> Bill Details
                                </h3>
                                
                                <div className='space-y-2'>
                                    {/* Subtotal */}
                                    <div className='flex justify-between items-center text-sm'>
                                        <span className='text-gray-600 font-medium flex items-center gap-2'>
                                            <FaUtensils size={11} className="text-gray-400" />
                                            Item Total
                                        </span>
                                        <span className='text-gray-800 font-semibold'>
                                            ₹{calculatedSubtotal}
                                        </span>
                                    </div>

                                    {/* Delivery Fee */}
                                    <div className='flex justify-between items-center text-sm'>
                                        <span className='text-gray-600 font-medium flex items-center gap-2'>
                                            <FaTruck size={11} className="text-gray-400" />
                                            Delivery Fee
                                        </span>
                                        <span className={
                                            calculatedDeliveryFee === 0 
                                                ? 'text-green-600 font-semibold' 
                                                : 'text-gray-800 font-semibold'
                                        }>
                                            {calculatedDeliveryFee === 0 ? 'FREE' : `₹${calculatedDeliveryFee}`}
                                        </span>
                                    </div>

                                    {/* Tax */}
                                    <div className='flex justify-between items-center text-sm'>
                                        <span className='text-gray-600 font-medium flex items-center gap-2'>
                                            <FaRupeeSign size={11} className="text-gray-400" />
                                            Tax (GST)
                                        </span>
                                        <span className='text-gray-800 font-semibold'>
                                            ₹{calculatedTax}
                                        </span>
                                    </div>

                                    {/* Divider + Total */}
                                    <div className='border-t-2 border-orange-200 pt-2 mt-2'>
                                        <div className='flex justify-between items-center'>
                                            <span className='text-gray-800 text-base font-bold'>Total</span>
                                            <div className='text-right'>
                                                <span className='text-orange-600 font-bold text-2xl'>
                                                    ₹{calculatedTotal}
                                                </span>
                                                <p className='text-gray-400 text-[10px]'>Inclusive of all taxes</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className='flex flex-wrap gap-2 pt-3 border-t border-gray-200'>
                                {!isCancelled && !isDelivered && (
                                    <button
                                        onClick={() => {
                                            navigate(`/track-order/${order._id}`)
                                            onClose()
                                        }}
                                        className='flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium transition shadow-sm flex items-center justify-center gap-2'
                                    >
                                        <FaTruck size={14} /> Track Order
                                    </button>
                                )}
                                
                                {!isCancelled && !isDelivered && (
                                    <button
                                        onClick={() => {
                                            onCancelOrder(order._id)
                                            onClose()
                                        }}
                                        className='flex-1 sm:flex-none px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-500 text-xs font-medium hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition flex items-center justify-center gap-2'
                                    >
                                        <FaTrashAlt size={14} /> Cancel
                                    </button>
                                )}
                                
                                {!isCancelled && (
                                    <button
                                        onClick={handleOrderAgain}
                                        className='flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-medium transition shadow-sm flex items-center justify-center gap-2'
                                    >
                                        <FaShoppingCart size={14} /> Order Again
                                    </button>
                                )}

                                {shouldShowReview && (
                                    <button
                                        onClick={() => setShowReviewModal(true)}
                                        className='flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition shadow-sm flex items-center justify-center gap-2'
                                    >
                                        <FaStar size={14} /> Review
                                    </button>
                                )}

                                {shouldShowDeliveryRating && (
                                    <button
                                        onClick={() => setShowDeliveryRating(true)}
                                        className='flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-medium transition shadow-sm flex items-center justify-center gap-2'
                                    >
                                        <MdDeliveryDining size={14} /> Rate Delivery
                                    </button>
                                )}

                                {isDelivered && !isCancelled && (
                                    <button
                                        onClick={() => setShowInvoice(true)}
                                        className='flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2 border border-gray-200'
                                    >
                                        <FaReceipt size={14} /> Invoice
                                    </button>
                                )}

                                <button
                                    onClick={handleShare}
                                    className='flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gray-100 text-gray-500 text-xs font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2 border border-gray-200'
                                >
                                    <FaShareAlt size={14} /> Share
                                </button>

                                {(isDelivered && (reviewSubmitted || hasReviewed)) && (
                                    <span className='px-3 py-2 rounded-xl bg-green-50 text-green-700 text-xs font-medium flex items-center gap-1.5 border border-green-200'>
                                        <FaCheck size={12} /> Reviewed
                                    </span>
                                )}

                                {(isDelivered && (deliveryRatingSubmitted || hasRatedDelivery)) && (
                                    <span className='px-3 py-2 rounded-xl bg-purple-50 text-purple-700 text-xs font-medium flex items-center gap-1.5 border border-purple-200'>
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