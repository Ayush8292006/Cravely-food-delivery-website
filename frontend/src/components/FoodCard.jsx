import React, { useState, useEffect } from 'react'
import { FaLeaf, FaDrumstickBite, FaCartShopping } from "react-icons/fa6";
import { FaStar, FaRegStar, FaMinus, FaPlus, FaFire, FaClock, FaCheck, FaTimes } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeCartItem, updateQuantity } from '../redux/userSlice';
import { toast } from "react-toastify";
import { motion, AnimatePresence } from 'framer-motion';

function FoodCard({ data }) {
    const [quantity, setQuantity] = useState(0)
    const [isAdded, setIsAdded] = useState(false)
    const [isRemoved, setIsRemoved] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [toastType, setToastType] = useState('add')
    const dispatch = useDispatch()
    const { cartItems } = useSelector(state => state.user)

    // ✅ Check if item is already in cart
    useEffect(() => {
        const existingItem = cartItems.find(i => i.id === data._id)
        if (existingItem) {
            setQuantity(existingItem.quantity || 0)
        } else {
            setQuantity(0)
        }
    }, [cartItems, data._id])

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(<FaStar key={i} className='text-yellow-400 text-sm' />);
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(<FaStar key={i} className='text-yellow-400 text-sm opacity-50' />);
            } else {
                stars.push(<FaRegStar key={i} className='text-yellow-400/30 text-sm' />);
            }
        }
        return stars
    }

    // ✅ Handle Increase - Auto Add to Cart
    const handleIncrease = () => {
        const newQty = quantity + 1
        setQuantity(newQty)
        
        // ✅ Auto add to cart with animation
        dispatch(addToCart({
            id: data._id,
            name: data.name,
            price: data.price,
            image: data.image,
            shop: data.shop,
            quantity: 1,
            foodType: data.foodType,
            category: data.category
        }));
        
        // ✅ Show add animation
        setIsAdded(true)
        setToastType('add')
        setToastMessage(`${data.name} added!`)
        setShowToast(true)
        
        setTimeout(() => {
            setIsAdded(false)
            setShowToast(false)
        }, 800)
    }

    // ✅ Handle Decrease - Auto Remove from Cart
    const handleDecrease = () => {
        if (quantity > 0) {
            const newQty = quantity - 1
            setQuantity(newQty)
            
            // ✅ If quantity becomes 0, remove from cart
            if (newQty === 0) {
                dispatch(removeCartItem(data._id))
                setIsRemoved(true)
                setToastType('remove')
                setToastMessage(`${data.name} removed!`)
                setShowToast(true)
                setTimeout(() => {
                    setIsRemoved(false)
                    setShowToast(false)
                }, 800)
            } else {
                // ✅ Update quantity in cart
                dispatch(updateQuantity({ 
                    id: data._id, 
                    quantity: newQty 
                }))
            }
        }
    }

    // ✅ Check if item is in cart
    const isInCart = cartItems.some(i => i.id === data._id)
    const totalItemsInCart = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className='relative w-full max-w-[280px] rounded-2xl bg-gradient-to-b from-[#1a1a2e] to-[#12121f] border border-white/5 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-[#ff2d55]/20 hover:border-[#ff2d55]/40 transition-all duration-500 group'
        >
            {/* ✅ Premium Glow Effect */}
            <div className='absolute inset-0 pointer-events-none'>
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1 }}
                    className='absolute -top-20 -right-20 w-40 h-40 bg-[#ff2d55]/10 rounded-full blur-2xl group-hover:bg-[#ff2d55]/20 transition-all duration-700'
                />
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className='absolute -bottom-20 -left-20 w-40 h-40 bg-[#ff6b35]/10 rounded-full blur-2xl group-hover:bg-[#ff6b35]/20 transition-all duration-700'
                />
            </div>

            {/* ✅ In Cart Indicator - Premium Ribbon */}
            {isInCart && quantity > 0 && (
                <motion.div 
                    initial={{ x: 100, rotate: 45 }}
                    animate={{ x: 0, rotate: 45 }}
                    className='absolute top-4 right-[-30px] z-20 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[8px] font-bold uppercase px-8 py-1 shadow-lg shadow-green-500/30'
                >
                    In Cart 🛒
                </motion.div>
            )}

            {/* ✅ Image Section */}
            <div className='relative w-full h-[190px] overflow-hidden'>
                <motion.img 
                    whileHover={{ scale: 1.15 }}
                    transition={{ duration: 0.7 }}
                    src={data.image} 
                    alt={data.name} 
                    className='w-full h-full object-cover'
                    loading="lazy"
                />
                
                {/* ✅ Gradient Overlay */}
                <div className='absolute inset-0 bg-gradient-to-t from-[#12121f] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
                
                {/* ✅ Food Type Badge - Animated */}
                <motion.div 
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-xl border ${
                        data.foodType === "veg" 
                            ? 'bg-green-500/30 border-green-400/40 shadow-lg shadow-green-500/20' 
                            : 'bg-red-500/30 border-red-400/40 shadow-lg shadow-red-500/20'
                    }`}
                >
                    {data.foodType === "veg" ? (
                        <>
                            <FaLeaf className='text-green-400 text-sm animate-pulse' />
                            <span className='text-[8px] text-green-300 font-bold uppercase tracking-wider'>Veg</span>
                        </>
                    ) : (
                        <>
                            <FaDrumstickBite className='text-red-400 text-sm animate-pulse' />
                            <span className='text-[8px] text-red-300 font-bold uppercase tracking-wider'>Non-Veg</span>
                        </>
                    )}
                </motion.div>

                {/* ✅ Rating Badge - Animated */}
                <motion.div 
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className='absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 shadow-lg'
                >
                    <FaStar className='text-yellow-400 text-[10px] animate-pulse' />
                    <span className='text-white font-bold text-xs'>
                        {data.rating?.average?.toFixed(1) || '4.5'}
                    </span>
                    <span className='text-white/30 text-[8px]'>({data.rating?.count || 0})</span>
                </motion.div>

                {/* ✅ Delivery Time Badge */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className='absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-xl border border-white/10'
                >
                    <FaClock className='text-[#ff6b35] text-[10px] animate-pulse' />
                    <span className='text-white/80 text-[10px] font-medium'>30-40 min</span>
                </motion.div>

                {/* ✅ Popular Badge */}
                {(data.rating?.count || 0) > 50 && (
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className='absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff2d55]/30 backdrop-blur-xl border border-[#ff2d55]/40 shadow-lg shadow-[#ff2d55]/20'
                    >
                        <FaFire className='text-[#ff2d55] text-[10px] animate-pulse' />
                        <span className='text-[#ff2d55] text-[8px] font-bold uppercase tracking-wider'>Popular</span>
                    </motion.div>
                )}
            </div>

            {/* ✅ Content Section */}
            <div className="relative p-4 space-y-2.5">
                {/* ✅ Name & Category */}
                <div className='flex items-start justify-between gap-2'>
                    <motion.h3 
                        whileHover={{ x: 5 }}
                        className="text-white font-bold text-base truncate flex-1 group-hover:text-[#ff6b35] transition-colors duration-300"
                    >
                        {data.name}
                    </motion.h3>
                    {data.category && (
                        <motion.span 
                            whileHover={{ scale: 1.1 }}
                            className='text-[8px] text-white/40 bg-white/10 px-2.5 py-0.5 rounded-full flex-shrink-0 border border-white/5'
                        >
                            {data.category}
                        </motion.span>
                    )}
                </div>

                {/* ✅ Stars */}
                <div className='flex items-center gap-1.5'>
                    <div className='flex items-center gap-0.5'>
                        {renderStars(data.rating?.average || 0)}
                    </div>
                    <span className='text-[10px] text-white/30'>({data.rating?.count || 0})</span>
                </div>

                {/* ✅ Shop Name */}
                <motion.p 
                    whileHover={{ x: 3 }}
                    className='text-white/40 text-xs truncate flex items-center gap-1.5'
                >
                    <span className='w-1.5 h-1.5 rounded-full bg-[#ff6b35] animate-pulse' />
                    {data?.shop?.name || 'Cravely Kitchen'}
                </motion.p>

                {/* ✅ Price with Discount */}
                <div className='flex items-center justify-between pt-2 border-t border-white/10'>
                    <div>
                        <motion.span 
                            whileHover={{ scale: 1.05 }}
                            className='text-2xl font-extrabold text-white'
                        >
                            ₹{data?.price}
                        </motion.span>
                        <span className='text-[10px] text-white/30 line-through ml-2'>
                            ₹{Math.round(data?.price * 1.15)}
                        </span>
                        <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className='text-[10px] text-green-400 ml-1 bg-green-400/10 px-1.5 py-0.5 rounded-full'
                        >
                            15% OFF
                        </motion.span>
                    </div>
                </div>
            </div>

            {/* ✅ Footer - Quantity Controls + Add to Cart */}
            <div className='p-4 pt-0 border-t border-white/10'>
                <div className='flex items-center justify-between gap-2'>
                    {/* ✅ Quantity Controls - Premium */}
                    <div className='flex items-center gap-1 bg-white/10 rounded-xl p-0.5 border border-white/10 backdrop-blur-sm'>
                        <motion.button 
                            whileTap={{ scale: 0.8 }}
                            whileHover={{ scale: 1.1 }}
                            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300 ${
                                quantity === 0 
                                    ? 'text-white/20 cursor-not-allowed' 
                                    : 'text-white hover:text-white hover:bg-[#ff2d55]/30 hover:shadow-lg hover:shadow-[#ff2d55]/20'
                            }`}
                            onClick={handleDecrease}
                            disabled={quantity === 0}
                        >
                            <FaMinus size={14} />
                        </motion.button>
                        
                        <AnimatePresence mode="wait">
                            <motion.span 
                                key={quantity}
                                initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                exit={{ scale: 0.5, opacity: 0, rotate: 180 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className='w-8 text-center text-white font-bold text-base'
                            >
                                {quantity}
                            </motion.span>
                        </AnimatePresence>
                        
                        <motion.button 
                            whileTap={{ scale: 0.8 }}
                            whileHover={{ scale: 1.1 }}
                            className='w-9 h-9 flex items-center justify-center rounded-lg text-white hover:text-white hover:bg-green-500/30 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300'
                            onClick={handleIncrease}
                        >
                            <FaPlus size={14} />
                        </motion.button>
                    </div>

                    {/* ✅ Add to Cart Button - Animated */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                            isInCart && quantity > 0
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/30 hover:shadow-green-500/50'
                                : 'bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] shadow-lg shadow-[#ff2d55]/30 hover:shadow-[#ff2d55]/50'
                        }`}
                        onClick={() => {
                            if (quantity === 0) {
                                handleIncrease()
                            } else {
                                // Toggle - if in cart, remove, else add
                                if (isInCart) {
                                    // Remove all
                                    dispatch(removeCartItem(data._id))
                                    setQuantity(0)
                                    setIsRemoved(true)
                                    setToastType('remove')
                                    setToastMessage(`${data.name} removed!`)
                                    setShowToast(true)
                                    setTimeout(() => {
                                        setIsRemoved(false)
                                        setShowToast(false)
                                    }, 800)
                                } else {
                                    handleIncrease()
                                }
                            }
                        }}
                    >
                        <AnimatePresence mode="wait">
                            {isInCart && quantity > 0 ? (
                                <motion.span
                                    key="in-cart"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className='flex items-center gap-2'
                                >
                                    <span className='relative'>
                                        <span className='absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-ping' />
                                        <FaCheck size={14} />
                                    </span>
                                    <span>In Cart</span>
                                </motion.span>
                            ) : (
                                <motion.span
                                    key="add-cart"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className='flex items-center gap-2'
                                >
                                    <FaCartShopping size={14} className='group-hover:rotate-[-15deg] transition-transform duration-300' />
                                    <span>Add to Cart</span>
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>

                {/* ✅ Toast Notification Overlay */}
                <AnimatePresence>
                    {showToast && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.8 }}
                            className='absolute -top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl backdrop-blur-xl border shadow-xl z-30 whitespace-nowrap'
                            style={{
                                background: toastType === 'add' 
                                    ? 'rgba(34, 197, 94, 0.2)' 
                                    : 'rgba(239, 68, 68, 0.2)',
                                borderColor: toastType === 'add' 
                                    ? 'rgba(34, 197, 94, 0.3)' 
                                    : 'rgba(239, 68, 68, 0.3)'
                            }}
                        >
                            <div className='flex items-center gap-2'>
                                {toastType === 'add' ? (
                                    <motion.span
                                        initial={{ rotate: 0 }}
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 0.5 }}
                                        className='text-green-400 text-lg'
                                    >
                                        ✅
                                    </motion.span>
                                ) : (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 400 }}
                                        className='text-red-400 text-lg'
                                    >
                                        ❌
                                    </motion.span>
                                )}
                                <span className='text-white text-xs font-medium'>
                                    {toastMessage}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ✅ Added Animation Overlay */}
                <AnimatePresence>
                    {isAdded && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className='absolute inset-0 bg-black/70 backdrop-blur-md rounded-2xl flex items-center justify-center z-40'
                        >
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className='text-center'
                            >
                                <motion.span 
                                    className='text-5xl block'
                                    animate={{ 
                                        y: [0, -10, 0],
                                        rotate: [0, -10, 10, 0]
                                    }}
                                    transition={{ duration: 0.5 }}
                                >
                                    🎉
                                </motion.span>
                                <p className='text-white font-bold text-sm mt-2 animate-pulse'>Added!</p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ✅ Removed Animation Overlay */}
                <AnimatePresence>
                    {isRemoved && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className='absolute inset-0 bg-black/70 backdrop-blur-md rounded-2xl flex items-center justify-center z-40'
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className='text-center'
                            >
                                <motion.span 
                                    className='text-5xl block'
                                    animate={{ 
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 10, -10, 0]
                                    }}
                                    transition={{ duration: 0.5 }}
                                >
                                    🗑️
                                </motion.span>
                                <p className='text-red-400 font-bold text-sm mt-2 animate-pulse'>Removed!</p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ✅ Quantity Badge - Floating */}
            {quantity > 0 && (
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className='absolute -top-1 -right-1 z-10 w-6 h-6 rounded-full bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] flex items-center justify-center shadow-lg shadow-[#ff2d55]/30 border-2 border-[#12121f]'
                >
                    <span className='text-[10px] font-bold text-white'>{quantity}</span>
                </motion.div>
            )}
        </motion.div>
    )
}

export default FoodCard