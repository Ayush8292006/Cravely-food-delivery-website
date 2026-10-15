import React, { useState, memo, useCallback } from 'react'
import { FaMinus, FaPlus, FaTrashAlt, FaStar, FaClock, FaLeaf, FaDrumstickBite, FaImage } from "react-icons/fa";
import { useDispatch } from 'react-redux';
import { removeCartItem, updateQuantity } from '../redux/userSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

// ✅ Max quantity limit
const MAX_QUANTITY = 99

// ✅ Fallback image
const FALLBACK_IMAGE = 'https://via.placeholder.com/200/ffffff/ff6b35?text=🍽️'

function CartItemcard({ data, index = 0 }) {
    const dispatch = useDispatch()
    const [isHovered, setIsHovered] = useState(false)
    const [isRemoving, setIsRemoving] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageError, setImageError] = useState(false)
    const [quantity, setQuantity] = useState(data?.quantity || 1)

    // ✅ Check if data exists
    if (!data) {
        return null
    }

    // ✅ Get item ID (support both _id and id)
    const itemId = data._id || data.id
    
    // ✅ Check if item has valid ID
    if (!itemId) {
        console.warn('Cart item missing ID:', data)
        return null
    }

    const isVeg = data.foodType === 'veg'
    const price = Number(data.price) || 0
    const total = price * quantity
    const isMaxQuantity = quantity >= MAX_QUANTITY
    const isOutOfStock = data.stock === 0 || data.isOutOfStock

    const handleIncrease = useCallback(() => {
        if (isOutOfStock) {
            toast.warning('This item is out of stock!', {
                position: "top-center",
                autoClose: 2000,
            })
            return
        }
        if (quantity >= MAX_QUANTITY) {
            toast.warning(`Maximum ${MAX_QUANTITY} items allowed!`, {
                position: "top-center",
                autoClose: 2000,
            })
            return
        }
        const newQty = quantity + 1
        setQuantity(newQty)
        dispatch(updateQuantity({ id: itemId, quantity: newQty }))
    }, [dispatch, isOutOfStock, quantity, itemId])

    const handleDecrease = useCallback(() => {
        if (quantity > 1) {
            const newQty = quantity - 1
            setQuantity(newQty)
            dispatch(updateQuantity({ id: itemId, quantity: newQty }))
        }
    }, [dispatch, quantity, itemId])

    const handleRemove = useCallback(() => {
        setIsRemoving(true)
        setTimeout(() => {
            dispatch(removeCartItem(itemId))
            toast.success('Item removed from cart! 🗑️', {
                position: "top-center",
                autoClose: 2000,
            })
        }, 400)
    }, [dispatch, itemId])

    // ✅ Get image source
    const getImageSrc = () => {
        if (imageError) return FALLBACK_IMAGE
        if (data.image) return data.image
        return FALLBACK_IMAGE
    }

    // ✅ Get food type label
    const getFoodTypeLabel = () => {
        if (isVeg) return 'Veg'
        return 'Non-Veg'
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            animate={{ 
                opacity: isRemoving ? 0 : 1, 
                x: isRemoving ? 50 : 0,
                scale: isRemoving ? 0.8 : 1
            }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className='group'
            role="listitem"
            aria-label={`Cart item: ${data.name}`}
        >
            <div 
                className={`bg-white p-4 md:p-5 rounded-2xl border-2 
                    transition-all duration-500 
                    flex flex-col sm:flex-row items-center gap-4 
                    relative overflow-hidden 
                    ${isOutOfStock ? 'opacity-60' : 'hover:border-orange-400 shadow-md hover:shadow-xl'}`}
                style={{
                    borderColor: isOutOfStock ? '#f3f4f6' : '#e5e7eb',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* ✅ Out of Stock Badge */}
                {isOutOfStock && (
                    <div className='absolute top-2 left-2 z-10 bg-red-500 text-white text-[8px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-red-500/30 border-2 border-red-400'>
                        OUT OF STOCK
                    </div>
                )}

                {/* ✅ Image Section */}
                <motion.div 
                    className='relative flex-shrink-0'
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className='w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-md bg-gray-50'>
                        {!imageLoaded && !imageError && (
                            <div className='w-full h-full flex items-center justify-center'>
                                <FaImage className='text-gray-300 text-2xl animate-pulse' />
                            </div>
                        )}
                        <img 
                            src={getImageSrc()} 
                            alt={data.name || 'Food item'} 
                            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
                                imageLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                            loading="lazy"
                            onLoad={() => setImageLoaded(true)}
                            onError={() => {
                                setImageError(true)
                                setImageLoaded(true)
                            }}
                        />
                    </div>
                    
                    {/* ✅ Food Type Badge */}
                    <div 
                        className={`absolute -top-1 -right-1 w-6 h-6 rounded-full 
                            flex items-center justify-center border-2 border-white shadow-sm
                            ${isVeg ? 'bg-green-500' : 'bg-red-500'}`}
                        aria-label={getFoodTypeLabel()}
                    >
                        {isVeg ? (
                            <FaLeaf className='text-white text-[10px]' />
                        ) : (
                            <FaDrumstickBite className='text-white text-[10px]' />
                        )}
                    </div>
                </motion.div>

                {/* ✅ Content Section - CLEARLY VISIBLE */}
                <div className='flex-1 w-full min-w-0'>
                    <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
                        <div className='flex-1 min-w-0'>
                            {/* ✅ Item Name - Dark & Bold */}
                            <h3 className='text-gray-900 font-extrabold text-base md:text-lg truncate'>
                                {data.name || 'Unknown Item'}
                            </h3>
                            
                            {/* ✅ Item Details - Clear Text */}
                            <div className='flex items-center gap-3 mt-1 flex-wrap'>
                                <span className='text-gray-700 font-semibold text-sm flex items-center gap-1'>
                                    ₹{price} × {quantity}
                                </span>
                                {data.rating && (
                                    <span className='text-gray-600 text-xs flex items-center gap-1 font-medium'>
                                        <FaStar size={10} className="text-yellow-500" />
                                        {data.rating}
                                    </span>
                                )}
                                {data.deliveryTime && (
                                    <span className='text-gray-600 text-xs flex items-center gap-1 font-medium'>
                                        <FaClock size={10} className="text-orange-500" />
                                        {data.deliveryTime} min
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* ✅ Total Price - Bright & Visible */}
                        <motion.div 
                            className='flex-shrink-0'
                            animate={{
                                scale: isHovered ? 1.05 : 1
                            }}
                        >
                            <div className='text-right'>
                                <p className='text-2xl font-extrabold text-orange-600'>
                                    ₹{total.toFixed(0)}
                                </p>
                                <p className='text-[10px] text-gray-500 font-medium'>Total</p>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* ✅ Controls Section - CLEARLY VISIBLE */}
                <div className='flex items-center gap-2 md:gap-3 flex-shrink-0'>
                    
                    {/* ✅ Quantity Controls - Dark Background for Contrast */}
                    <div className='flex items-center gap-1 bg-gray-100 rounded-xl p-1 border-2 border-gray-200'>
                        <motion.button 
                            whileTap={{ scale: 0.8 }}
                            whileHover={{ scale: 1.1 }}
                            className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center 
                                rounded-lg transition-all duration-300 font-bold
                                ${quantity <= 1 
                                    ? 'text-gray-300 cursor-not-allowed' 
                                    : 'text-gray-700 hover:text-orange-600 hover:bg-orange-100'
                                }`}
                            onClick={handleDecrease}
                            disabled={quantity <= 1}
                            aria-label="Decrease quantity"
                            title="Decrease quantity"
                        >
                            <FaMinus size={12} />
                        </motion.button>
                        
                        <AnimatePresence mode="wait">
                            <motion.span 
                                key={quantity}
                                initial={{ scale: 0.5, opacity: 0, y: -10 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.5, opacity: 0, y: 10 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className='w-8 text-center text-gray-900 font-extrabold text-base md:text-lg'
                                aria-label={`Quantity: ${quantity}`}
                            >
                                {quantity}
                            </motion.span>
                        </AnimatePresence>
                        
                        <motion.button 
                            whileTap={{ scale: 0.8 }}
                            whileHover={{ scale: 1.1 }}
                            className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center 
                                rounded-lg transition-all duration-300 font-bold
                                ${isOutOfStock || isMaxQuantity
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-white bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-200'
                                }`}
                            onClick={handleIncrease}
                            disabled={isOutOfStock || isMaxQuantity}
                            aria-label="Increase quantity"
                            title={isOutOfStock ? 'Out of stock' : isMaxQuantity ? `Maximum ${MAX_QUANTITY} allowed` : 'Increase quantity'}
                        >
                            <FaPlus size={12} />
                        </motion.button>
                    </div>

                    {/* ✅ Remove Button - CLEARLY VISIBLE */}
                    <motion.button 
                        whileTap={{ scale: 0.8 }}
                        whileHover={{ 
                            scale: 1.15,
                            rotate: 15,
                        }}
                        className='w-9 h-9 md:w-10 md:h-10 flex items-center justify-center 
                            rounded-xl text-gray-500 hover:text-red-600 
                            border-2 border-gray-200 hover:border-red-300
                            bg-white hover:bg-red-50
                            transition-all duration-300 font-bold'
                        onClick={handleRemove}
                        aria-label="Remove item from cart"
                        title="Remove from cart"
                    >
                        <FaTrashAlt size={14} />
                    </motion.button>
                </div>

                {/* ✅ Progress Bar - Orange */}
                <motion.div 
                    className='absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-orange-500 to-orange-400'
                    initial={{ width: '0%' }}
                    animate={{ 
                        width: isHovered ? '100%' : '0%'
                    }}
                    transition={{ duration: 0.5 }}
                />

                {/* ✅ Removing Overlay */}
                <AnimatePresence>
                    {isRemoving && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className='absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl 
                                flex items-center justify-center z-10 border-2 border-red-200'
                        >
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className='text-center'
                            >
                                <motion.span 
                                    className='text-4xl block'
                                    animate={{ 
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 10, -10, 0]
                                    }}
                                    transition={{ duration: 0.5 }}
                                >
                                    🗑️
                                </motion.span>
                                <p className='text-red-600 font-bold text-sm mt-2'>Removing...</p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

// ✅ Memoize component to prevent unnecessary re-renders
export default memo(CartItemcard)