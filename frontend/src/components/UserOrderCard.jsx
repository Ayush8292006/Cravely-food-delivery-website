import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { serverUrl } from '../../config'
import { addToCart } from '../redux/userSlice'
import { toast } from 'react-toastify'
import ReviewModal from './ReviewModal'
import DeliveryBoyRatingModal from './DeliveryBoyRatingModal'
import Invoice from './Invoice'
import { 
    FaStar, FaClock, FaTruck, 
    FaCreditCard, FaReceipt, FaShoppingBag, 
    FaTimes, FaCheck, FaBox, FaTag, FaUtensils,
    FaMotorcycle, FaPhone, FaWhatsapp, FaMapMarkerAlt,
    FaStore, FaArrowRight, FaEye, FaCalendar,
    FaCheckCircle, FaGem, FaRocket, FaHeart,
    FaRegStar, FaRegHeart
} from 'react-icons/fa'
import { MdDeliveryDining, MdVerified } from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'


function UserOrderCard({ data }) {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    
    const [selectedRating, setSelectedRating] = useState(() => {
        const initialRatings = {}
        if (data.shopOrders && Array.isArray(data.shopOrders)) {
            data.shopOrders.forEach(shopOrder => {
                if (shopOrder.shopOrderItems && Array.isArray(shopOrder.shopOrderItems)) {
                    shopOrder.shopOrderItems.forEach(item => {
                        const itemId = item.item?._id || item._id
                        if (item.item?.userRating && item.item.userRating > 0) {
                            initialRatings[itemId] = item.item.userRating
                        }
                        if (item.userRating && item.userRating > 0) {
                            initialRatings[itemId] = item.userRating
                        }
                    })
                }
            })
        }
        return initialRatings
    })

    const [reviewSubmitted, setReviewSubmitted] = useState(() => {
        return data?.userReview?.submitted || data?.hasReviewed || false
    })

    const [deliveryRatingSubmitted, setDeliveryRatingSubmitted] = useState(() => {
        return data?.deliveryRating?.submitted || false
    })

    const [showReviewModal, setShowReviewModal] = useState(false)
    const [showDeliveryRating, setShowDeliveryRating] = useState(false)
    const [showInvoice, setShowInvoice] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [imageErrors, setImageErrors] = useState({})
    const [isLiked, setIsLiked] = useState(false)

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString('en-GB', {
            day: "2-digit",
            month: "short",
            year: "numeric"
        })
    }

    const handleRating = async (itemId, rating) => {
        if (selectedRating[itemId] && selectedRating[itemId] > 0) {
            toast.info('⭐ You already rated this item!')
            return
        }

        try {
            await axios.post(`${serverUrl}/api/item/rating`, {
                itemId,
                rating
            }, { withCredentials: true })
            
            setSelectedRating(prev => ({
                ...prev, [itemId]: rating
            }))
            
            toast.success('⭐ Rating submitted!')
        } catch (error) {
            console.log(error)
            toast.error('Failed to submit rating')
        }
    }

    const handleOrderAgain = () => {
        const items = []
        data.shopOrders.forEach(shopOrder => {
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
        navigate("/cart")
    }

    const handleReviewSubmitted = () => {
        setReviewSubmitted(true)
        toast.success('📝 Thank you for your review!')
    }

    const handleDeliveryRatingSubmitted = () => {
        setDeliveryRatingSubmitted(true)
        toast.success('🚴 Thank you for rating your delivery!')
    }

    const isItemRated = (itemId) => {
        return selectedRating[itemId] && selectedRating[itemId] > 0
    }

    const getDeliveryBoy = () => {
        const shopOrder = data.shopOrders?.[0]
        return shopOrder?.assignedDeliveryBoy || null
    }

    const isCancelled = data.isCancelled || data.shopOrders?.[0]?.status === 'cancelled'
    const isDelivered = data.shopOrders?.[0]?.status === 'delivered' && !isCancelled
    const status = isCancelled ? 'cancelled' : (data.shopOrders?.[0]?.status || 'pending')
    const isActive = !isCancelled && !isDelivered
    const deliveryBoy = getDeliveryBoy()

    const getRefundStatus = () => {
        if (!isCancelled) return null
        if (data.paymentMethod !== 'online') return null
        if (!data.payment) return { label: 'No Refund (COD)', color: 'text-gray-400' }
        
        const status = data.refundStatus || 'pending'
        const statusMap = {
            pending: { label: 'Refund Pending', color: 'text-amber-600' },
            processing: { label: 'Processing Refund', color: 'text-blue-600' },
            completed: { label: 'Refund Completed', color: 'text-green-600' },
            failed: { label: 'Refund Failed', color: 'text-red-600' }
        }
        return statusMap[status] || statusMap.pending
    }

    const isPaymentSuccessful = data?.payment === true || data?.payment === "true"
    const refundStatus = getRefundStatus()

    const statusConfig = {
        pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200' },
        preparing: { label: 'Preparing', color: 'bg-blue-50 text-blue-700 border-blue-200' },
        'out of delivery': { label: 'Out for Delivery', color: 'bg-orange-50 text-orange-700 border-orange-200' },
        delivered: { label: 'Delivered', color: 'bg-green-50 text-green-700 border-green-200' },
        cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200' }
    }

    const paymentConfig = {
        pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700' },
        paid: { label: 'Paid', color: 'bg-green-50 text-green-700' },
        failed: { label: 'Failed', color: 'bg-red-50 text-red-700' }
    }
    const paymentStatus = isPaymentSuccessful ? 'paid' : (data?.payment === false ? 'failed' : 'pending')

    const firstShop = data.shopOrders?.[0]
    const restaurant = firstShop?.shop
    const subtotal = firstShop?.subtotal || data.totalAmount || 0
    const deliveryFee = data.deliveryFee || 30

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

    const getRestaurantImage = () => {
        const img = restaurant?.image
        if (!img || imageErrors['restaurant']) return null
        return getImageUrl(img)
    }

    const getItemImage = (item) => {
        const img = item?.item?.image || item?.image
        const key = `item_${item.item?._id || item._id}`
        if (!img || imageErrors[key]) return null
        return getImageUrl(img)
    }

    const handleImageError = (key) => {
        setImageErrors(prev => ({ ...prev, [key]: true }))
    }

    const restaurantImage = getRestaurantImage()
    
    const shouldShowReview = isDelivered && !isCancelled && !reviewSubmitted
    const shouldShowDeliveryRating = isDelivered && !isCancelled && !deliveryRatingSubmitted

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            whileHover={{ y: -4 }}
            className="group relative bg-white rounded-2xl border-2 border-gray-200 transition-all duration-300 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100/50"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative rounded-2xl overflow-hidden">
                
                {/* Top accent bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400" />

                <div className="relative p-4 sm:p-5">
                    
                    {/* ===== HEADER ===== */}
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Restaurant Image */}
                            <div className="flex-shrink-0 relative">
                                {restaurantImage ? (
                                    <img
                                        src={restaurantImage}
                                        alt={restaurant?.name || 'Restaurant'}
                                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border-2 border-gray-200 transition-all duration-300 group-hover:border-orange-300"
                                        loading="lazy"
                                        onError={() => handleImageError('restaurant')}
                                    />
                                ) : (
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                                        <FaUtensils className="text-gray-400 text-2xl" />
                                    </div>
                                )}
                                {/* Status Indicator */}
                                <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${
                                    isDelivered ? 'bg-green-500' : 
                                    isCancelled ? 'bg-red-500' : 
                                    isActive ? 'bg-orange-500 animate-pulse' : 'bg-gray-300'
                                }`} />
                            </div>
                            
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                                        {restaurant?.name || 'Cravely'}
                                    </h3>
                                    <span className="text-[8px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200 font-medium">
                                        #{data._id?.slice(-6) || 'N/A'}
                                    </span>
                                    {isDelivered && (
                                        <span className="text-[8px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1 font-medium">
                                            <FaCheckCircle size={8} /> Completed
                                        </span>
                                    )}
                                </div>
                                
                                <p className="text-gray-400 text-xs flex items-center gap-1">
                                    <FaCalendar size={10} className="text-gray-300" />
                                    {formatDate(data.createdAt)}
                                </p>
                                
                                {/* Items Tags */}
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                    {firstShop?.shopOrderItems?.slice(0, 3).map((item, idx) => (
                                        <span 
                                            key={idx}
                                            className="text-gray-500 text-[10px] bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200"
                                        >
                                            {item.quantity}x {item.name}
                                        </span>
                                    ))}
                                    {firstShop?.shopOrderItems?.length > 3 && (
                                        <span className="text-gray-400 text-[10px] bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                                            +{firstShop.shopOrderItems.length - 3}
                                        </span>
                                    )}
                                </div>
                                
                                {/* Stats */}
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-gray-500 text-[10px] flex items-center gap-1 font-medium">
                                        <FaBox size={10} className="text-gray-400" />
                                        {firstShop?.shopOrderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0} items
                                    </span>
                                    <span className="text-gray-300">|</span>
                                    <span className="text-gray-600 text-[10px] flex items-center gap-1 font-medium">
                                        <FaTag size={10} className="text-gray-400" />
                                        ₹{subtotal}
                                    </span>
                                    <span className="text-gray-300">|</span>
                                    <span className="text-gray-500 text-[10px] flex items-center gap-1 font-medium">
                                        <FaClock size={10} className="text-gray-400" />
                                        {data.deliveryTime || '30-40'} min
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Status Badges - Right */}
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-semibold border ${statusConfig[status]?.color || statusConfig.pending.color}`}>
                                {statusConfig[status]?.label || 'Pending'}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-semibold ${paymentConfig[paymentStatus]?.color || paymentConfig.pending.color}`}>
                                {paymentConfig[paymentStatus]?.label || 'Pending'}
                            </span>
                            {refundStatus && (
                                <span className={`text-[8px] font-medium ${refundStatus.color}`}>
                                    {refundStatus.label}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* ===== DELIVERY BOY ===== */}
                    {deliveryBoy && !isDelivered && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 p-3 rounded-xl bg-orange-50 border-2 border-orange-200"
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="relative w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center shadow-sm flex-shrink-0">
                                        <FaMotorcycle className="text-white text-sm" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-gray-800 font-semibold text-sm">{deliveryBoy.fullName}</p>
                                        <span className="text-[8px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full flex items-center gap-1 border border-green-200 font-medium">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            Active
                                        </span>
                                        <span className="text-[8px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full border border-gray-200 font-medium">
                                            #{deliveryBoy.deliveryBoyId?.slice(-4) || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs mt-0.5">
                                        <span className="text-gray-500 flex items-center gap-1">
                                            <FaPhone size={10} className="text-orange-500" />
                                            {deliveryBoy.mobile}
                                        </span>
                                        <a href={`tel:${deliveryBoy.mobile}`} className="text-orange-500 hover:underline text-[10px] font-medium">Call</a>
                                        <a href={`https://wa.me/${deliveryBoy.mobile}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline text-[10px] font-medium">
                                            <FaWhatsapp className="inline" size={11} /> WhatsApp
                                        </a>
                                    </div>
                                </div>
                                {deliveryBoy.deliveryBoyRating?.average > 0 && (
                                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                                        <FaStar className="text-amber-500 text-[10px]" />
                                        <span className="text-gray-700 text-[10px] font-medium">{deliveryBoy.deliveryBoyRating.average.toFixed(1)}</span>
                                        <span className="text-gray-400 text-[8px]">({deliveryBoy.deliveryBoyRating.count})</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ===== Delivery completed message ===== */}
                    {isDelivered && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-3 p-3 rounded-xl bg-green-50 border-2 border-green-200"
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="relative w-8 h-8 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-200">
                                        <FaCheck className="text-green-600 text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-green-700 font-semibold text-sm flex items-center gap-2">
                                        🎉 Order Delivered
                                        <span className="text-[8px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full border border-green-200 font-medium">
                                            {formatDate(data.updatedAt || data.createdAt)}
                                        </span>
                                    </p>
                                    <p className="text-gray-500 text-xs">Thank you for ordering with Cravely! 🌟</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ===== ITEMS WITH RATING ===== */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex flex-wrap gap-1.5">
                            {firstShop?.shopOrderItems?.map((item, idx) => {
                                const itemImage = getItemImage(item)
                                const itemKey = item.item?._id || item._id
                                const isRated = isItemRated(itemKey)
                                
                                return (
                                    <div 
                                        key={idx}
                                        className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-xl px-3 py-2 border border-gray-200 hover:border-orange-200 transition-all duration-300"
                                    >
                                        {itemImage ? (
                                            <img 
                                                src={itemImage}
                                                alt={item.name} 
                                                className="w-7 h-7 sm:w-9 sm:h-9 object-cover rounded-lg border border-gray-200"
                                                loading="lazy"
                                                onError={() => handleImageError(`item_${itemKey}`)}
                                            />
                                        ) : (
                                            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-gray-200 flex items-center justify-center border border-gray-300">
                                                <FaUtensils className="text-gray-400 text-[10px]" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-gray-800 text-[10px] sm:text-xs font-medium truncate max-w-[80px] sm:max-w-none">{item.name}</p>
                                            <p className="text-gray-400 text-[8px]">₹{item.price} × {item.quantity}</p>
                                        </div>
                                        {isDelivered && !isCancelled && !isRated && (
                                            <div className="flex items-center gap-0.5 ml-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button 
                                                        key={star}
                                                        className={`cursor-pointer text-[8px] sm:text-[10px] transition-all ${
                                                            selectedRating[itemKey] >= star 
                                                                ? 'text-amber-400' 
                                                                : 'text-gray-300 hover:text-amber-300'
                                                        }`}
                                                        onClick={() => handleRating(itemKey, star)}
                                                    >
                                                        ★
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {isDelivered && isRated && (
                                            <span className="text-[8px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full flex items-center gap-1 border border-green-200 font-medium">
                                                <FaCheck size={6} /> Rated
                                            </span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* ===== BILLING ===== */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div className="space-y-0.5 w-full sm:w-auto">
                                <div className="flex items-center justify-between sm:justify-start gap-4 text-[10px] sm:text-xs">
                                    <span className="text-gray-500 font-medium">Subtotal</span>
                                    <span className="text-gray-700 font-semibold">₹{subtotal}</span>
                                </div>
                                <div className="flex items-center justify-between sm:justify-start gap-4 text-[10px] sm:text-xs">
                                    <span className="text-gray-500 font-medium">Delivery Fee</span>
                                    <span className="text-gray-700 font-semibold">₹{deliveryFee}</span>
                                </div>
                                <div className="flex items-center justify-between sm:justify-start gap-4 text-[10px] sm:text-xs">
                                    <span className="text-gray-500 font-medium">Payment</span>
                                    <span className={`font-semibold ${paymentStatus === 'paid' ? 'text-green-600' : paymentStatus === 'failed' ? 'text-red-600' : 'text-amber-600'}`}>
                                        {data.paymentMethod || 'COD'}
                                    </span>
                                </div>
                                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent my-0.5" />
                                <div className="flex items-center justify-between sm:justify-start gap-4 text-sm">
                                    <span className="text-gray-700 font-bold">Total</span>
                                    <span className="text-orange-600 font-bold text-base">₹{data.totalAmount || subtotal + deliveryFee}</span>
                                </div>
                            </div>
                            
                            {isDelivered && !isCancelled && (
                                <button
                                    onClick={() => setShowInvoice(true)}
                                    className="text-gray-500 hover:text-gray-700 text-[10px] transition-all duration-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-200 font-medium"
                                >
                                    <FaReceipt size={12} />
                                    Invoice
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ===== ACTION BUTTONS ===== */}
                    <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap items-center gap-1.5">
                        {/* Track Order */}
                        {!isCancelled && !isDelivered && (
                            <button
                                onClick={() => navigate(`/track-order/${data._id}`)}
                                className="flex-1 sm:flex-none px-4 py-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-[10px] sm:text-xs font-semibold transition shadow-sm shadow-orange-200 flex items-center justify-center gap-1.5"
                            >
                                <FaTruck size={12} />
                                Track
                            </button>
                        )}
                        
                        {/* Order Again */}
                        {isDelivered && !isCancelled && (
                            <button
                                onClick={handleOrderAgain}
                                className="flex-1 sm:flex-none px-4 py-1.5 rounded-full bg-green-500 hover:bg-green-600 text-white text-[10px] sm:text-xs font-semibold transition shadow-sm shadow-green-200 flex items-center justify-center gap-1.5"
                            >
                                <FaShoppingBag size={12} />
                                Order Again
                            </button>
                        )}

                        {/* Write Review */}
                        {shouldShowReview && (
                            <button
                                onClick={() => setShowReviewModal(true)}
                                className="flex-1 sm:flex-none px-4 py-1.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-[10px] sm:text-xs font-semibold transition shadow-sm shadow-blue-200 flex items-center justify-center gap-1.5"
                            >
                                <FaStar size={12} />
                                Review
                            </button>
                        )}

                        {/* Rate Delivery */}
                        {shouldShowDeliveryRating && (
                            <button
                                onClick={() => setShowDeliveryRating(true)}
                                className="flex-1 sm:flex-none px-4 py-1.5 rounded-full bg-purple-500 hover:bg-purple-600 text-white text-[10px] sm:text-xs font-semibold transition shadow-sm shadow-purple-200 flex items-center justify-center gap-1.5"
                            >
                                <MdDeliveryDining size={12} />
                                Rate Delivery
                            </button>
                        )}

                        {/* Status Labels */}
                        {isDelivered && reviewSubmitted && (
                            <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 text-[8px] font-semibold flex items-center gap-1 border border-green-200">
                                <FaCheck size={8} /> Reviewed
                            </span>
                        )}

                        {isDelivered && deliveryRatingSubmitted && (
                            <span className="px-2 py-1 rounded-full bg-purple-50 text-purple-700 text-[8px] font-semibold flex items-center gap-1 border border-purple-200">
                                <FaCheck size={8} /> Rated Delivery
                            </span>
                        )}

                        {isCancelled && (
                            <span className="px-2 py-1 rounded-full bg-red-50 text-red-700 text-[8px] font-semibold flex items-center gap-1 border border-red-200">
                                <FaTimes size={8} /> Cancelled
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ===== MODALS ===== */}
            <AnimatePresence>
                {showReviewModal && (
                    <ReviewModal
                        shopId={data.shopOrders[0]?.shop._id}
                        orderId={data._id}
                        onClose={() => setShowReviewModal(false)}
                        onReviewSubmitted={handleReviewSubmitted}
                    />
                )}

                {showDeliveryRating && (
                    <DeliveryBoyRatingModal
                        orderId={data._id}
                        onClose={() => setShowDeliveryRating(false)}
                        onRatingSubmitted={handleDeliveryRatingSubmitted}
                    />
                )}

                {showInvoice && (
                    <Invoice 
                        order={data}
                        onClose={() => setShowInvoice(false)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default UserOrderCard