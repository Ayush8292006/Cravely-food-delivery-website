import React, { useState, useEffect } from 'react'
import { FaLeaf, FaDrumstickBite, FaCartShopping } from "react-icons/fa6";
import { FaMinus, FaPlus, FaFire, FaClock, FaCheck, FaTag, FaTruck } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeCartItem, updateQuantity } from '../redux/userSlice';
import { toast } from "react-toastify";
import { motion, AnimatePresence } from 'framer-motion';

// ✅ Constants
const MAX_QUANTITY = 99
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'

function FoodCard({ data }) {
    const [quantity, setQuantity] = useState(0)
    const [isAdded, setIsAdded] = useState(false)
    const [isRemoved, setIsRemoved] = useState(false)
    const [imageError, setImageError] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const dispatch = useDispatch()
    const { cartItems } = useSelector(state => state.user)

    // ✅ Check if item is already in cart
    useEffect(() => {
        const existingItem = cartItems.find(i => i.id === data._id)
        if (existingItem) {
            if (existingItem.quantity !== quantity) {
                setQuantity(existingItem.quantity || 0)
            }
        } else {
            if (quantity !== 0) {
                setQuantity(0)
            }
        }
    }, [cartItems, data._id, quantity])

    // ✅ Check if item is out of stock
    const isOutOfStock = data?.isOutOfStock === true || data?.stock === 0

    // ✅ Handle Increase
    const handleIncrease = () => {
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
        
        setIsAdded(true)
        setTimeout(() => setIsAdded(false), 600)
        
        toast.success(`${data.name} added to cart!`, {
            position: "top-center",
            autoClose: 1500,
        })
    }

    // ✅ Handle Decrease
    const handleDecrease = () => {
        if (quantity > 0) {
            const newQty = quantity - 1
            setQuantity(newQty)
            
            if (newQty === 0) {
                dispatch(removeCartItem(data._id))
                setIsRemoved(true)
                setTimeout(() => setIsRemoved(false), 600)
                
                toast.info(`${data.name} removed from cart!`, {
                    position: "top-center",
                    autoClose: 1500,
                })
            } else {
                dispatch(updateQuantity({ 
                    id: data._id, 
                    quantity: newQty 
                }))
            }
        }
    }

    // ✅ Get image source
    const getImageSrc = () => {
        if (imageError) return FALLBACK_IMAGE
        if (data?.image) return data.image
        return FALLBACK_IMAGE
    }

    // ✅ Check if item is in cart
    const isInCart = cartItems.some(i => i.id === data._id)

    // ✅ Handle main button click
    const handleMainButtonClick = () => {
        if (isOutOfStock) {
            toast.warning('This item is out of stock!')
            return
        }
        
        if (isInCart && quantity > 0) {
            dispatch(removeCartItem(data._id))
            setQuantity(0)
            setIsRemoved(true)
            setTimeout(() => setIsRemoved(false), 600)
            toast.info(`${data.name} removed from cart!`, {
                position: "top-center",
                autoClose: 1500,
            })
        } else {
            handleIncrease()
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, transition: { duration: 0.3 } }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className={`relative w-full max-w-[320px] rounded-2xl bg-white border-2 border-gray-200 overflow-hidden transition-all duration-300 ${
                isOutOfStock ? 'opacity-60' : ''
            } ${isHovered ? 'shadow-lg shadow-orange-100/50 border-orange-300' : 'shadow-sm'}`}
            role="article"
        >
            {/* ✅ Top Border */}
            <div className='absolute top-0 left-0 right-0 h-1 z-20 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400' />

            {/* ✅ Out of Stock Overlay */}
            {isOutOfStock && (
                <div className='absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-30'>
                    <div className='text-center'>
                        <span className='text-gray-800 font-bold text-sm bg-red-100 px-5 py-2.5 rounded-full border-2 border-red-200'>
                            Out of Stock
                        </span>
                    </div>
                </div>
            )}

            {/* ✅ In Cart Badge */}
            {isInCart && quantity > 0 && !isOutOfStock && (
                <div className='absolute top-4 right-[-30px] z-20 bg-green-500 text-white text-[8px] font-bold uppercase px-8 py-1 shadow-lg shadow-green-500/30 rotate-45'>
                    In Cart 🛒
                </div>
            )}

            {/* ✅ Image Section */}
            <div className='relative w-full h-[200px] overflow-hidden bg-gray-100'>
                <img 
                    src={getImageSrc()} 
                    alt={data?.name || 'Food item'} 
                    className='w-full h-full object-cover'
                    loading="lazy"
                    onError={() => setImageError(true)}
                />
                
                {/* ✅ Gradient Overlay */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent' />
                
                {/* ✅ Food Type Badge */}
                <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white shadow-md border-2 ${
                    data?.foodType === "veg" ? 'border-green-200' : 'border-red-200'
                }`}>
                    {data?.foodType === "veg" ? (
                        <>
                            <FaLeaf className='text-green-500 text-[10px]' />
                            <span className='text-[7px] text-green-600 font-bold uppercase'>Veg</span>
                        </>
                    ) : (
                        <>
                            <FaDrumstickBite className='text-red-500 text-[10px]' />
                            <span className='text-[7px] text-red-600 font-bold uppercase'>Non-Veg</span>
                        </>
                    )}
                </div>

                {/* ✅ Delivery Time */}
                <div className='absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white shadow-md border border-gray-200'>
                    <FaClock className='text-orange-500 text-[9px]' />
                    <span className='text-gray-700 text-[9px] font-medium'>30-40 min</span>
                </div>

                {/* ✅ Popular Badge */}
                {(data?.rating?.count || 0) > 50 && (
                    <div className='absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 border-2 border-orange-200 shadow-sm'>
                        <FaFire className='text-orange-500 text-[9px] animate-pulse' />
                        <span className='text-orange-600 text-[6px] font-bold uppercase'>Popular</span>
                    </div>
                )}
            </div>

            {/* ✅ Content Section */}
            <div className="p-4 space-y-2">
                {/* Name & Category */}
                <div className='flex items-start justify-between gap-2'>
                    <h3 className="text-gray-800 font-bold text-base truncate flex-1">
                        {data?.name || 'Unknown Item'}
                    </h3>
                    {data?.category && (
                        <span className='text-[8px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200 flex-shrink-0 font-medium'>
                            {data.category}
                        </span>
                    )}
                </div>

                {/* Shop Name */}
                <div className='flex items-center justify-between'>
                    <p className='text-gray-400 text-[10px] flex items-center gap-1.5'>
                        <span className='w-1 h-1 rounded-full bg-orange-400' />
                        {data?.shop?.name || 'Cravely Kitchen'}
                    </p>
                    {!isOutOfStock && (
                        <div className='flex items-center gap-1 text-[9px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-200 font-medium'>
                            <FaTruck className='text-[7px]' />
                            <span>Free Delivery</span>
                        </div>
                    )}
                </div>

                {/* Price */}
                <div className='flex items-center gap-2 pt-2 border-t border-gray-200'>
                    <span className='text-xl font-extrabold text-gray-800'>
                        ₹{data?.price || 0}
                    </span>
                    <span className='text-[10px] text-gray-400 line-through'>
                        ₹{Math.round((data?.price || 0) * 1.15)}
                    </span>
                    <span className='text-[9px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-200 font-medium'>
                        15% OFF
                    </span>
                </div>
            </div>

            {/* ✅ Footer - Quantity Controls */}
            <div className='px-4 pb-4 pt-1'>
                <div className='flex items-center gap-2'>
                    {/* Quantity Controls */}
                   

                    {/* Main Button */}
                    <button
                        className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                            isOutOfStock
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : isInCart && quantity > 0
                                    ? 'bg-green-500 hover:bg-green-600 shadow-md shadow-green-200'
                                    : 'bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-200'
                        }`}
                        onClick={handleMainButtonClick}
                        disabled={isOutOfStock}
                    >
                        {isInCart && quantity > 0 ? (
                            <>
                                <FaCheck size={13} />
                                <span>In Cart</span>
                            </>
                        ) : (
                            <>
                                <FaCartShopping size={13} />
                                <span>Add to Cart</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* ✅ Quantity Badge */}
            {quantity > 0 && !isOutOfStock && (
                <div className='absolute -top-0.5 -right-0.5 z-10 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shadow-md border-2 border-white'>
                    <span className='text-[9px] font-bold text-white'>{quantity}</span>
                </div>
            )}

            {/* ✅ Add Animation Overlay */}
            <AnimatePresence>
                {isAdded && (
                    <div className='absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center z-40'>
                        <div className='text-center'>
                            <span className='text-5xl block mb-1'>✅</span>
                            <p className='text-green-600 font-bold text-sm'>Added!</p>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* ✅ Remove Animation Overlay */}
            <AnimatePresence>
                {isRemoved && (
                    <div className='absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center z-40'>
                        <div className='text-center'>
                            <span className='text-5xl block mb-1'>🗑️</span>
                            <p className='text-red-500 font-bold text-sm'>Removed!</p>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default FoodCard