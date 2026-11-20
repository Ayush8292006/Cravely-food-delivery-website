import React, { useState, useEffect } from 'react'
import { FaMinus, FaPlus, FaStar } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeCartItem, updateQuantity } from '../redux/userSlice';
import { toast } from "react-toastify";
import { motion } from 'framer-motion';

const MAX_QUANTITY = 99
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=350&fit=crop'

function FoodCard({ data, item, dark = true }) {
    const itemData = data || item
    if (!itemData || !itemData._id) return null

    const [quantity, setQuantity] = useState(0)
    const [imageError, setImageError] = useState(false)
    const dispatch = useDispatch()
    const { cartItems } = useSelector(state => state.user)

    // Sync quantity with Redux cart state
    useEffect(() => {
        const existingItem = (cartItems || []).find(i => i.id === itemData._id)
        if (existingItem) {
            if (existingItem.quantity !== quantity) {
                setQuantity(existingItem.quantity || 0)
            }
        } else {
            if (quantity !== 0) {
                setQuantity(0)
            }
        }
    }, [cartItems, itemData._id, quantity])

    const isOutOfStock = itemData?.isOutOfStock === true || itemData?.stock === 0
    const isInCart = quantity > 0

    const handleIncrease = (e) => {
        if (e) e.stopPropagation()
        if (isOutOfStock) {
            toast.warning('This item is out of stock!')
            return
        }
        if (quantity >= MAX_QUANTITY) {
            toast.warning(`Maximum ${MAX_QUANTITY} items allowed!`)
            return
        }
        
        const newQty = quantity + 1
        setQuantity(newQty)
        
        dispatch(addToCart({
            id: itemData._id,
            name: itemData.name,
            price: itemData.price,
            image: itemData.image,
            shop: itemData.shop,
            quantity: 1,
            foodType: itemData.foodType,
            category: itemData.category
        }))
        
        toast.success(`${itemData.name} added to cart!`, { autoClose: 1200 })
    }

    const handleDecrease = (e) => {
        if (e) e.stopPropagation()
        if (quantity > 0) {
            const newQty = quantity - 1
            setQuantity(newQty)
            
            if (newQty === 0) {
                dispatch(removeCartItem(itemData._id))
                toast.info(`${itemData.name} removed from cart!`, { autoClose: 1200 })
            } else {
                dispatch(updateQuantity({ 
                    id: itemData._id, 
                    quantity: newQty 
                }))
            }
        }
    }

    const getImageSrc = () => {
        if (imageError) return FALLBACK_IMAGE
        return itemData?.image || FALLBACK_IMAGE
    }

    const isVeg = itemData?.foodType === "veg"
    const originalPrice = Math.round((itemData?.price || 0) * 1.15)
    const ratingValue = itemData?.rating?.average ? Number(itemData.rating.average).toFixed(1) : '5.0'

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`group relative w-full rounded-2xl overflow-hidden transition-all duration-300 bg-[#13121A] border border-white/[0.08] hover:border-[#FF6B00]/50 shadow-lg hover:shadow-black/60 flex flex-col justify-between ${isOutOfStock ? 'opacity-60' : ''}`}
        >
            {/* 1. MOUTH-WATERING FOOD PHOTOGRAPHY (Aspect ~16:10, Height: 140px, Solid Dark Backdrop) */}
            <div className="relative w-full h-[140px] overflow-hidden bg-[#0A090D]">
                <img 
                    src={getImageSrc()} 
                    alt={itemData?.name || 'Food item'} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                    onError={() => setImageError(true)}
                />

                {/* Top-Left: Standard Veg / Non-Veg Indicator (FSSAI Standard) */}
                <div className="absolute top-2.5 left-2.5">
                    <span 
                        className={`w-4 h-4 rounded-sm border flex items-center justify-center bg-[#0A090D]/90 shadow-sm ${
                            isVeg ? 'border-emerald-500' : 'border-rose-500'
                        }`}
                        title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                    >
                        <span className={`w-2 h-2 rounded-full ${isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    </span>
                </div>

                {/* Top-Right: Clean Rating Badge */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0A090D]/90 border border-white/10 text-white text-[11px] font-bold shadow-sm">
                    <FaStar size={10} className="text-amber-400" />
                    <span>{Number(ratingValue).toFixed(1)}</span>
                </div>

                {/* Bottom-Left: Category Tag */}
                {itemData?.category && (
                    <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#0A090D]/90 text-[10px] font-semibold text-white/90 border border-white/10">
                        {itemData.category}
                    </span>
                )}

                {/* Out of Stock Notice */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-[#0A090D]/85 flex items-center justify-center z-10">
                        <span className="px-3.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            {/* 2. REFINED INFORMATION & ACTION AREA */}
            <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                    {/* Dish Name */}
                    <h4 
                        className="text-[15px] font-black text-white group-hover:text-[#FF6B00] transition-colors truncate leading-tight"
                        title={itemData?.name}
                    >
                        {itemData?.name || 'Delicious Dish'}
                    </h4>

                    {/* Restaurant Source */}
                    <p className="text-xs text-gray-400 truncate mt-1">
                        {itemData?.shop?.name || 'Cravely Kitchen'}
                    </p>
                </div>

                {/* Price & Add to Cart Row */}
                <div className="pt-2.5 mt-2 flex items-center justify-between border-t border-white/[0.08]">
                    {/* Price and discount */}
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-black text-white">
                            ₹{itemData?.price || 0}
                        </span>
                        {originalPrice > (itemData?.price || 0) && (
                            <span className="text-xs text-gray-500 line-through">
                                ₹{originalPrice}
                            </span>
                        )}
                    </div>

                    {/* Compact Interactive Add or Quantity Control */}
                    <div>
                        {isInCart && !isOutOfStock ? (
                            <div className="flex items-center bg-[#FF6B00] text-white rounded-full px-2 py-0.5 shadow-md shadow-orange-500/30 gap-2">
                                <button
                                    onClick={handleDecrease}
                                    className="w-5 h-5 rounded-full hover:bg-black/20 flex items-center justify-center transition active:scale-90"
                                    title="Decrease quantity"
                                >
                                    <FaMinus size={8} />
                                </button>
                                <span className="text-xs font-black min-w-[14px] text-center">
                                    {quantity}
                                </span>
                                <button
                                    onClick={handleIncrease}
                                    className="w-5 h-5 rounded-full hover:bg-black/20 flex items-center justify-center transition active:scale-90"
                                    title="Increase quantity"
                                >
                                    <FaPlus size={8} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleIncrease}
                                disabled={isOutOfStock}
                                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 shadow-sm ${
                                    isOutOfStock 
                                        ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5' 
                                        : 'bg-[#FF6B00] hover:bg-orange-600 text-white hover:scale-105 active:scale-95 cursor-pointer'
                                }`}
                                title="Add to cart"
                            >
                                <span>Add</span>
                                <FaPlus size={9} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default FoodCard
