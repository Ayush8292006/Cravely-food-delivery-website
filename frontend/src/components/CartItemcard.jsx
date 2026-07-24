import React, { useState } from 'react'
import { FaMinus, FaPlus, FaTrashAlt, FaStar, FaClock, FaLeaf, FaDrumstickBite } from "react-icons/fa";
import { useDispatch } from 'react-redux';
import { removeCartItem, updateQuantity } from '../redux/userSlice';
import { motion, AnimatePresence } from 'framer-motion';

function CartItemcard({ data, index = 0 }) {
    const dispatch = useDispatch()
    const [isHovered, setIsHovered] = useState(false)
    const [isRemoving, setIsRemoving] = useState(false)
    const [quantity, setQuantity] = useState(data.quantity || 1)

    const handleIncrease = (id, currentQty) => {
        const newQty = currentQty + 1
        setQuantity(newQty)
        dispatch(updateQuantity({ id, quantity: newQty }))
    }

    const handleDecrease = (id, currentQty) => {
        if (currentQty > 1) {
            const newQty = currentQty - 1
            setQuantity(newQty)
            dispatch(updateQuantity({ id, quantity: newQty }))
        }
    }

    const handleRemove = (id) => {
        setIsRemoving(true)
        setTimeout(() => {
            dispatch(removeCartItem(id))
        }, 400)
    }

    const isVeg = data.foodType === 'veg'
    const total = data.price * quantity

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
        >
            <div 
                className='glass-premium-ultra p-4 md:p-5 rounded-2xl border border-white/5 
                    hover:border-[#ff2d55]/30 transition-all duration-500 
                    flex flex-col sm:flex-row items-center gap-4 
                    relative overflow-hidden hover:shadow-2xl hover:shadow-[#ff2d55]/10'
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* ✅ Glow Effect */}
                <div className='absolute inset-0 pointer-events-none'>
                    <motion.div 
                        className='absolute -top-20 -right-20 w-40 h-40 bg-[#ff2d55]/5 rounded-full blur-2xl'
                        animate={{
                            scale: isHovered ? 1.5 : 1,
                            opacity: isHovered ? 0.3 : 0
                        }}
                        transition={{ duration: 0.6 }}
                    />
                </div>

                {/* ✅ Image Section */}
                <motion.div 
                    className='relative flex-shrink-0'
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className='w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg'>
                        <img 
                            src={data.image || 'https://via.placeholder.com/100'} 
                            alt={data.name} 
                            className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                            loading="lazy"
                        />
                    </div>
                    
                    {/* ✅ Food Type Badge */}
                    <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full 
                        flex items-center justify-center border-2 border-[#1a1a2e]
                        ${isVeg ? 'bg-green-500' : 'bg-red-500'}`}
                    >
                        {isVeg ? (
                            <FaLeaf className='text-white text-[10px]' />
                        ) : (
                            <FaDrumstickBite className='text-white text-[10px]' />
                        )}
                    </div>
                </motion.div>

                {/* ✅ Content Section */}
                <div className='flex-1 w-full min-w-0'>
                    <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
                        <div className='flex-1 min-w-0'>
                            <h3 className='text-white font-bold text-base md:text-lg truncate group-hover:text-[#ff6b35] transition-colors duration-300'>
                                {data.name}
                            </h3>
                            
                            <div className='flex items-center gap-3 mt-1 flex-wrap'>
                                <span className='text-white/40 text-xs flex items-center gap-1'>
                                    ₹{data.price} × {quantity}
                                </span>
                                <span className='text-white/30 text-xs flex items-center gap-1'>
                                    <FaStar size={10} className="text-yellow-400" />
                                    4.5
                                </span>
                                <span className='text-white/30 text-xs flex items-center gap-1'>
                                    <FaClock size={10} className="text-[#ff6b35]" />
                                    30 min
                                </span>
                            </div>
                        </div>

                        {/* ✅ Total Price */}
                        <motion.div 
                            className='flex-shrink-0'
                            animate={{
                                scale: isHovered ? 1.05 : 1
                            }}
                        >
                            <div className='text-right'>
                                <p className='text-2xl font-bold text-[#ff6b35]'>
                                    ₹{total.toFixed(0)}
                                </p>
                                <p className='text-[10px] text-white/30'>Total</p>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* ✅ Controls Section */}
                <div className='flex items-center gap-2 md:gap-3 flex-shrink-0'>
                    
                    {/* ✅ Quantity Controls */}
                    <div className='flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/5'>
                        <motion.button 
                            whileTap={{ scale: 0.8 }}
                            whileHover={{ scale: 1.1 }}
                            className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center 
                                rounded-lg transition-all duration-300
                                ${quantity <= 1 
                                    ? 'text-white/20 cursor-not-allowed' 
                                    : 'text-white hover:text-white hover:bg-[#ff2d55]/30 hover:shadow-lg hover:shadow-[#ff2d55]/20'
                                }`}
                            onClick={() => handleDecrease(data.id, quantity)}
                            disabled={quantity <= 1}
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
                                className='w-8 text-center text-white font-bold text-base md:text-lg'
                            >
                                {quantity}
                            </motion.span>
                        </AnimatePresence>
                        
                        <motion.button 
                            whileTap={{ scale: 0.8 }}
                            whileHover={{ scale: 1.1 }}
                            className='w-8 h-8 md:w-9 md:h-9 flex items-center justify-center 
                                rounded-lg text-white hover:text-white hover:bg-green-500/30 
                                hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300'
                            onClick={() => handleIncrease(data.id, quantity)}
                        >
                            <FaPlus size={12} />
                        </motion.button>
                    </div>

                    {/* ✅ Remove Button */}
                    <motion.button 
                        whileTap={{ scale: 0.8 }}
                        whileHover={{ 
                            scale: 1.15,
                            rotate: 15,
                            backgroundColor: 'rgba(239, 68, 68, 0.2)'
                        }}
                        className='w-9 h-9 md:w-10 md:h-10 flex items-center justify-center 
                            rounded-xl text-white/40 hover:text-red-400 
                            border border-white/5 hover:border-red-400/30
                            transition-all duration-300'
                        onClick={() => handleRemove(data.id)}
                    >
                        <FaTrashAlt size={14} />
                    </motion.button>
                </div>

                {/* ✅ Progress Bar */}
                <motion.div 
                    className='absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#ff2d55] to-[#ff6b35]'
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
                            className='absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl 
                                flex items-center justify-center z-10'
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
                                <p className='text-white font-bold text-sm mt-2 animate-pulse'>Removing...</p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style jsx>{`
                .glass-premium-ultra {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .animate-pulse {
                    animation: pulse 1.5s ease-in-out infinite;
                }
            `}</style>
        </motion.div>
    )
}

export default CartItemcard