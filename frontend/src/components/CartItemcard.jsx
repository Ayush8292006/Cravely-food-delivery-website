import React, { useState, memo, useCallback } from 'react';
import { FaMinus, FaPlus, FaTrashAlt, FaStar, FaClock, FaImage } from "react-icons/fa";
import { useDispatch } from 'react-redux';
import { removeCartItem, updateQuantity } from '../redux/userSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const MAX_QUANTITY = 99;
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';

function CartItemcard({ data, index = 0 }) {
    const dispatch = useDispatch();
    const [isRemoving, setIsRemoving] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const quantity = data?.quantity || 1;

    if (!data) return null;

    const itemId = data._id || data.id;
    if (!itemId) return null;

    const isVeg = data.foodType === 'veg';
    const price = Number(data.price) || 0;
    const total = price * quantity;
    const isOutOfStock = data.stock === 0 || data.isOutOfStock;

    const handleIncrease = useCallback(() => {
        if (isOutOfStock) {
            toast.warning('This item is out of stock!');
            return;
        }
        if (quantity >= MAX_QUANTITY) {
            toast.warning(`Maximum ${MAX_QUANTITY} items allowed!`);
            return;
        }
        const newQty = quantity + 1;
        dispatch(updateQuantity({ id: itemId, quantity: newQty }));
    }, [dispatch, isOutOfStock, quantity, itemId]);

    const handleDecrease = useCallback(() => {
        if (quantity > 1) {
            const newQty = quantity - 1;
            dispatch(updateQuantity({ id: itemId, quantity: newQty }));
        } else {
            handleRemove();
        }
    }, [dispatch, quantity, itemId]);

    const handleRemove = useCallback(() => {
        setIsRemoving(true);
        setTimeout(() => {
            dispatch(removeCartItem(itemId));
            toast.info('Item removed from cart');
        }, 250);
    }, [dispatch, itemId]);

    const getImageSrc = () => {
        if (imageError || !data.image) return FALLBACK_IMAGE;
        return data.image;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ 
                opacity: isRemoving ? 0 : 1, 
                scale: isRemoving ? 0.95 : 1,
                y: isRemoving ? -10 : 0 
            }}
            transition={{ duration: 0.25 }}
            className="group relative bg-[#13121A] border border-white/10 hover:border-white/20 rounded-2xl p-3 sm:p-4 text-white transition-all duration-200"
        >
            <div className="flex items-center gap-3.5 sm:gap-4">
                {/* Dish Thumbnail */}
                <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-black/50 border border-white/10 shrink-0">
                    {!imageLoaded && !imageError && (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                            <FaImage className="text-zinc-600 text-lg animate-pulse" />
                        </div>
                    )}
                    <img 
                        src={getImageSrc()} 
                        alt={data.name || 'Dish'} 
                        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        loading="lazy"
                        onLoad={() => setImageLoaded(true)}
                        onError={() => {
                            setImageError(true);
                            setImageLoaded(true);
                        }}
                    />

                    {/* Veg / Non-Veg Indicator */}
                    <div className="absolute top-1.5 left-1.5 bg-black/80 backdrop-blur-sm p-1 rounded-md border border-white/10">
                        <div className={`w-3 h-3 border flex items-center justify-center ${
                            isVeg ? 'border-emerald-500' : 'border-red-500'
                        }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                                isVeg ? 'bg-emerald-500' : 'bg-red-500'
                            }`} />
                        </div>
                    </div>

                    {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-[10px] font-bold text-red-400 text-center px-1">
                            OUT OF STOCK
                        </div>
                    )}
                </div>

                {/* Dish Details */}
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm sm:text-base text-white truncate group-hover:text-[#FF6B00] transition-colors">
                        {data.name || 'Dish item'}
                    </h4>

                    <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400 flex-wrap">
                        <span className="text-zinc-300 font-medium">₹{price}</span>
                        <span>•</span>
                        {data.rating && (
                            <span className="flex items-center gap-1 text-amber-400">
                                <FaStar size={10} />
                                {data.rating}
                            </span>
                        )}
                        {data.deliveryTime && (
                            <span className="flex items-center gap-1 text-zinc-400">
                                <FaClock size={10} />
                                {data.deliveryTime}m
                            </span>
                        )}
                    </div>

                    {/* Item Total Price */}
                    <div className="mt-2 text-sm sm:text-base font-bold text-white">
                        ₹{total.toFixed(0)}
                    </div>
                </div>

                {/* Quantity Controls & Delete */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Compact Quantity Pill */}
                    <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 rounded-xl p-1">
                        <button
                            type="button"
                            onClick={handleDecrease}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                            aria-label="Decrease quantity"
                        >
                            <FaMinus size={10} />
                        </button>
                        <span className="w-6 text-center font-bold text-xs sm:text-sm text-white">
                            {quantity}
                        </span>
                        <button
                            type="button"
                            onClick={handleIncrease}
                            disabled={isOutOfStock || quantity >= MAX_QUANTITY}
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#FF6B00] hover:bg-[#E55A00] text-white transition-colors disabled:opacity-40"
                            aria-label="Increase quantity"
                        >
                            <FaPlus size={10} />
                        </button>
                    </div>

                    {/* Remove Action */}
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                        aria-label="Remove item"
                        title="Remove item"
                    >
                        <FaTrashAlt size={12} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

export default memo(CartItemcard);
