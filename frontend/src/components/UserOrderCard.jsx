import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { serverUrl } from '../App'
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
    FaStore, FaArrowRight, FaEye, FaCalendar
} from 'react-icons/fa'
import { MdDeliveryDining, MdVerified } from 'react-icons/md'
import { motion } from 'framer-motion'

function UserOrderCard({ data }) {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    
    // ✅ Get ratings from backend data (persists after refresh)
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
        if (!data.payment) return { label: '💰 No Refund (COD)', color: 'text-gray-400' }
        
        const status = data.refundStatus || 'pending'
        const statusMap = {
            pending: { label: '⏳ Refund Pending', color: 'text-yellow-400' },
            processing: { label: '🔄 Processing Refund', color: 'text-blue-400' },
            completed: { label: '✅ Refund Completed', color: 'text-green-400' },
            failed: { label: '❌ Refund Failed', color: 'text-red-400' }
        }
        return statusMap[status] || statusMap.pending
    }

    const isPaymentSuccessful = data?.payment === true || data?.payment === "true"
    const refundStatus = getRefundStatus()

    const statusConfig = {
        pending: { label: '⏳ Pending', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
        preparing: { label: '🟠 Preparing', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
        'out of delivery': { label: '🚚 Out for Delivery', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
        delivered: { label: '✅ Delivered', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
        cancelled: { label: '❌ Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
    }

    const paymentConfig = {
        pending: { label: '⏳ Pending', color: 'bg-yellow-500/20 text-yellow-400' },
        paid: { label: '✅ Paid', color: 'bg-green-500/20 text-green-400' },
        failed: { label: '❌ Failed', color: 'bg-red-500/20 text-red-400' }
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
            whileHover={{ y: -2 }}
            className="group relative overflow-hidden rounded-xl bg-[#18181D] border border-white/8 transition-all duration-300 hover:border-[#ff2d55]/30 hover:shadow-lg hover:shadow-[#ff2d55]/10"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Status Glow */}
            {isActive && <div className="absolute -top-20 -right-20 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl animate-pulse" />}
            {isDelivered && <div className="absolute -top-20 -right-20 w-32 h-32 bg-green-500/5 rounded-full blur-2xl" />}
            {isCancelled && <div className="absolute -top-20 -right-20 w-32 h-32 bg-red-500/5 rounded-full blur-2xl" />}
            
            <div className="relative p-4 sm:p-5">
                
                {/* ===== HEADER ===== */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 relative">
                            {restaurantImage ? (
                                <img
                                    src={restaurantImage}
                                    alt={restaurant?.name || 'Restaurant'}
                                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-white/10 transition-all duration-300 group-hover:scale-105"
                                    loading="lazy"
                                    onError={() => handleImageError('restaurant')}
                                />
                            ) : (
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-[#ff2d55]/20 to-[#ff6b35]/20 flex items-center justify-center border border-white/10">
                                    <FaUtensils className="text-white/30 text-2xl" />
                                </div>
                            )}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base sm:text-lg font-bold text-white truncate">
                                    {restaurant?.name || 'Cravely'}
                                </h3>
                                <span className="text-[8px] bg-white/10 text-white/40 px-2 py-0.5 rounded-full">
                                    #{data._id?.slice(-6) || 'N/A'}
                                </span>
                            </div>
                            
                            <p className="text-white/30 text-xs flex items-center gap-1">
                                <FaCalendar size={10} className="text-white/20" />
                                {formatDate(data.createdAt)}
                            </p>
                            
                            <div className="flex flex-wrap gap-1 mt-1.5">
                                {firstShop?.shopOrderItems?.slice(0, 3).map((item, idx) => (
                                    <span key={idx} className="text-white/40 text-[10px] bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                        {item.quantity}x {item.name}
                                    </span>
                                ))}
                                {firstShop?.shopOrderItems?.length > 3 && (
                                    <span className="text-white/30 text-[10px]">
                                        +{firstShop.shopOrderItems.length - 3}
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-white/30 text-[10px] flex items-center gap-1">
                                    <FaBox size={10} className="text-white/20" />
                                    {firstShop?.shopOrderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0} items
                                </span>
                                <span className="text-white/20">|</span>
                                <span className="text-white/50 text-[10px] flex items-center gap-1">
                                    <FaTag size={10} className="text-white/20" />
                                    ₹{subtotal}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-medium border ${statusConfig[status]?.color || statusConfig.pending.color}`}>
                            {statusConfig[status]?.label || '⏳ Pending'}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-medium ${paymentConfig[paymentStatus]?.color || paymentConfig.pending.color}`}>
                            {paymentConfig[paymentStatus]?.label || '⏳ Pending'}
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
                    <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-[#ff2d55]/10 to-[#ff6b35]/10 border border-[#ff2d55]/20">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center shadow-lg shadow-[#ff2d55]/20 flex-shrink-0">
                                <FaMotorcycle className="text-white text-sm" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-white font-semibold text-sm">{deliveryBoy.fullName}</p>
                                    <span className="text-[8px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                                        Active
                                    </span>
                                </div>
                                {!isDelivered && (
                                    <div className="flex items-center gap-2 text-xs mt-0.5">
                                        <span className="text-white/40 flex items-center gap-1">
                                            <FaPhone size={10} className="text-[#ff6b35]" />
                                            {deliveryBoy.mobile}
                                        </span>
                                        <a href={`tel:${deliveryBoy.mobile}`} className="text-[#ff6b35] hover:underline text-[10px]">Call</a>
                                        <a href={`https://wa.me/${deliveryBoy.mobile}`} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline text-[10px]">
                                            <FaWhatsapp className="inline" size={11} /> WhatsApp
                                        </a>
                                    </div>
                                )}
                            </div>
                            {deliveryBoy.deliveryBoyRating?.average > 0 && (
                                <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-full">
                                    <FaStar className="text-yellow-400 text-[10px]" />
                                    <span className="text-white/60 text-[10px]">{deliveryBoy.deliveryBoyRating.average.toFixed(1)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ✅ Delivery completed message */}
                {isDelivered && (
                    <div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                <FaCheck className="text-green-400 text-sm" />
                            </div>
                            <div>
                                <p className="text-green-400 font-semibold text-sm">✅ Order Delivered</p>
                                <p className="text-white/30 text-xs">Thank you for ordering with Cravely! 🎉</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== ITEMS WITH RATING ===== */}
                <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="flex flex-wrap gap-1.5">
                        {firstShop?.shopOrderItems?.map((item, idx) => {
                            const itemImage = getItemImage(item)
                            const itemKey = item.item?._id || item._id
                            const isRated = isItemRated(itemKey)
                            
                            return (
                                <div 
                                    key={idx}
                                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-lg px-2.5 py-1.5 border border-white/5 transition-all duration-300"
                                >
                                    {itemImage ? (
                                        <img 
                                            src={itemImage}
                                            alt={item.name} 
                                            className="w-6 h-6 sm:w-8 sm:h-8 object-cover rounded-lg border border-white/10"
                                            loading="lazy"
                                            onError={() => handleImageError(`item_${itemKey}`)}
                                        />
                                    ) : (
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                                            <FaUtensils className="text-white/30 text-[10px]" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-white/80 text-[10px] sm:text-xs font-medium truncate max-w-[80px] sm:max-w-none">{item.name}</p>
                                        <p className="text-white/30 text-[8px]">₹{item.price} × {item.quantity}</p>
                                    </div>
                                    {isDelivered && !isCancelled && !isRated && (
                                        <div className="flex items-center gap-0.5 ml-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button 
                                                    key={star}
                                                    className={`cursor-pointer text-[8px] sm:text-[10px] transition-all hover:scale-125 ${
                                                        selectedRating[itemKey] >= star 
                                                            ? 'text-yellow-400' 
                                                            : 'text-white/20 hover:text-yellow-400/50'
                                                    }`}
                                                    onClick={() => handleRating(itemKey, star)}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {isDelivered && isRated && (
                                        <span className="text-[8px] text-green-400 bg-green-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-green-500/20">
                                            <FaCheck size={6} /> Rated
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* ===== BILLING ===== */}
                <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="space-y-0.5 w-full sm:w-auto">
                            <div className="flex items-center justify-between sm:justify-start gap-4 text-[10px] sm:text-xs">
                                <span className="text-white/40">Subtotal</span>
                                <span className="text-white/60 font-medium">₹{subtotal}</span>
                            </div>
                            <div className="flex items-center justify-between sm:justify-start gap-4 text-[10px] sm:text-xs">
                                <span className="text-white/40">Delivery</span>
                                <span className="text-white/60 font-medium">₹{deliveryFee}</span>
                            </div>
                            <div className="h-px w-full bg-white/10 my-0.5" />
                            <div className="flex items-center justify-between sm:justify-start gap-4 text-sm">
                                <span className="text-white/50 font-semibold">Total</span>
                                <span className="text-[#ff6b35] font-bold text-base">₹{data.totalAmount || subtotal + deliveryFee}</span>
                            </div>
                        </div>
                        
                        {isDelivered && !isCancelled && (
                            <button
                                onClick={() => setShowInvoice(true)}
                                className="text-white/30 hover:text-white/60 text-[10px] transition-all duration-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5"
                            >
                                <FaReceipt size={12} />
                                Invoice
                            </button>
                        )}
                    </div>
                </div>

                {/* ===== ACTION BUTTONS - NO CANCEL ===== */}
                <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-1.5">
                    {/* Track Order */}
                    {!isCancelled && !isDelivered && (
                        <button
                            onClick={() => navigate(`/track-order/${data._id}`)}
                            className="flex-1 sm:flex-none px-4 py-1.5 rounded-full bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white text-[10px] sm:text-xs font-medium hover:scale-105 transition-all duration-300 shadow-lg shadow-[#ff2d55]/20 flex items-center justify-center gap-1.5"
                        >
                            <FaTruck size={12} />
                            Track
                        </button>
                    )}
                    
                    {/* Order Again */}
                    {isDelivered && !isCancelled && (
                        <button
                            onClick={handleOrderAgain}
                            className="flex-1 sm:flex-none px-4 py-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] sm:text-xs font-medium hover:scale-105 transition-all duration-300 shadow-lg shadow-green-500/20 flex items-center justify-center gap-1.5"
                        >
                            <FaShoppingBag size={12} />
                            Again
                        </button>
                    )}

                    {/* Write Review */}
                    {shouldShowReview && (
                        <button
                            onClick={() => setShowReviewModal(true)}
                            className="flex-1 sm:flex-none px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] sm:text-xs font-medium hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-1.5"
                        >
                            <FaStar size={12} />
                            Review
                        </button>
                    )}

                    {/* Rate Delivery */}
                    {shouldShowDeliveryRating && (
                        <button
                            onClick={() => setShowDeliveryRating(true)}
                            className="flex-1 sm:flex-none px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] sm:text-xs font-medium hover:scale-105 transition-all duration-300 shadow-lg shadow-purple-500/20 flex items-center justify-center gap-1.5"
                        >
                            <MdDeliveryDining size={12} />
                            Rate
                        </button>
                    )}

                    {/* Status Labels */}
                    {isDelivered && reviewSubmitted && (
                        <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-[8px] font-medium flex items-center gap-1 border border-green-500/30">
                            <FaCheck size={8} /> Reviewed
                        </span>
                    )}

                    {isDelivered && deliveryRatingSubmitted && (
                        <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-[8px] font-medium flex items-center gap-1 border border-purple-500/30">
                            <FaCheck size={8} /> Rated
                        </span>
                    )}

                    {isCancelled && (
                        <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-[8px] font-medium flex items-center gap-1 border border-red-500/30">
                            <FaTimes size={8} /> Cancelled
                        </span>
                    )}
                </div>
            </div>

            {/* ===== MODALS ===== */}
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
        </motion.div>
    )
}

export default UserOrderCard