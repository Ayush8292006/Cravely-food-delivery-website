import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    FaStore, FaStar, FaClock, FaMapMarkerAlt, 
    FaTruck, FaFire, FaTag, FaArrowRight,
    FaHeart, FaShare, FaCheckCircle, FaGem,
    FaRocket, FaCrown, FaAward, FaUtensils,
    FaEye
} from 'react-icons/fa'
import { MdVerified, MdDeliveryDining } from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'

function ShopCard({ shop, index = 0 }) {
    const navigate = useNavigate()
    const [isLiked, setIsLiked] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    // ✅ FIXED: Only use fields that exist in backend
    const isApproved = shop.isApproved !== undefined ? shop.isApproved : true
    const rating = shop.rating?.average || 0
    const reviews = shop.rating?.count || 0
    
    // ❌ REMOVED: isOpen, hasDiscount, discountPercent, deliveryTime - Backend mein nahi hai
    // ✅ DEFAULT VALUES for UI
    const isOpen = true  // Always show open (backend doesn't have this)
    const hasDiscount = false  // No discount field
    const discountPercent = 0  // No discount field
    const deliveryTime = '30-40'  // Default delivery time
    
    const isPopular = reviews > 100

    const getCategoryColor = () => {
        const colors = {
            'Pizza': 'from-red-400 to-orange-400',
            'Burger': 'from-amber-400 to-yellow-400',
            'Snacks': 'from-green-400 to-emerald-400',
            'Main Course': 'from-blue-400 to-indigo-400',
            'Desserts': 'from-pink-400 to-rose-400',
            'South Indian': 'from-yellow-400 to-amber-400',
            'North Indian': 'from-orange-400 to-red-400',
            'Chinese': 'from-red-400 to-pink-400',
            'Fast Food': 'from-yellow-400 to-orange-400',
            'Others': 'from-purple-400 to-violet-400'
        }
        // ✅ FIXED: Use shop.category if exists, else default
        return colors[shop.category] || 'from-[#ff2d55] to-[#ff6b35]'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 200, damping: 22 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className='relative group w-full max-w-[280px]'
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div 
                className='glass-premium-ultra rounded-2xl overflow-hidden border border-white/5 
                    hover:border-[#ff2d55]/40 transition-all duration-500 
                    hover:shadow-2xl hover:shadow-[#ff2d55]/20 
                    bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a] cursor-pointer'
                onClick={() => navigate(`/shop/${shop._id}`)}
            >
                
                {/* ✅ Animated Gradient Border */}
                <motion.div 
                    className='absolute inset-0 rounded-2xl p-[1.5px] bg-gradient-to-r from-[#ff2d55] via-[#ff6b35] to-[#ffd93d] opacity-0 group-hover:opacity-100 transition-opacity duration-500'
                    animate={{ 
                        backgroundSize: isHovered ? '300% 300%' : '100% 100%',
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                />

                <div className='relative bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a] rounded-2xl overflow-hidden'>
                    
                    {/* ✅ Premium Header - Category Color Strip */}
                    <motion.div 
                        className={`h-1 w-full bg-gradient-to-r ${getCategoryColor()}`}
                        animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        style={{ backgroundSize: '200% 100%' }}
                    />

                    {/* ✅ Image Section */}
                    <div className='relative h-[170px] overflow-hidden'>
                        <img 
                            src={shop.image || 'https://via.placeholder.com/400x300/1a1a2e/666?text=Shop+Image'}
                            alt={shop.name}
                            className='w-full h-full object-cover group-hover:scale-110 transition-all duration-700'
                            loading="lazy"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/400x300/1a1a2e/666?text=Shop+Image'
                            }}
                        />
                        
                        <div className='absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent opacity-70' />

                        {/* ✅ Status Badges - Top Left */}
                        <div className='absolute top-3 left-3 flex flex-col gap-1.5'>
                            {isApproved ? (
                                <div className='flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/40 backdrop-blur-xl border border-green-400/50 shadow-lg shadow-green-500/20'>
                                    <FaCheckCircle className='text-green-300 text-[10px]' />
                                    <span className='text-[7px] text-green-200 font-bold uppercase'>Approved</span>
                                </div>
                            ) : (
                                <div className='flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/40 backdrop-blur-xl border border-yellow-400/50 shadow-lg shadow-yellow-500/20'>
                                    <FaClock className='text-yellow-300 text-[10px]' />
                                    <span className='text-[7px] text-yellow-200 font-bold uppercase'>Pending</span>
                                </div>
                            )}
                            
                            {/* ✅ FIXED: Always show Open since backend doesn't have isOpen */}
                            <div className='flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/40 backdrop-blur-xl border border-green-400/50'>
                                <span className='w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse' />
                                <span className='text-[7px] text-green-200 font-bold uppercase'>Open</span>
                            </div>
                        </div>

                        {/* ✅ Rating Badge - Top Right */}
                        <motion.div 
                            initial={{ x: 30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className='absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 shadow-lg'
                        >
                            <FaStar className='text-yellow-400 text-[9px]' />
                            <span className='text-white font-bold text-[10px]'>{rating.toFixed(1)}</span>
                            <span className='text-white/30 text-[6px]'>({reviews})</span>
                        </motion.div>

                        {/* ✅ Discount Badge - FIXED: Only show if hasDiscount */}
                        {hasDiscount && (
                            <motion.div 
                                initial={{ y: 15, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.15 }}
                                className='absolute bottom-3 right-3 flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] backdrop-blur-xl border border-white/20 shadow-lg shadow-[#ff2d55]/30'
                            >
                                <FaTag className='text-white text-[8px]' />
                                <span className='text-white font-bold text-[10px]'>{discountPercent}% OFF</span>
                            </motion.div>
                        )}

                        {/* ✅ Popular Badge - Bottom Left */}
                        {isPopular && (
                            <motion.div 
                                initial={{ y: 15, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className='absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ff2d55]/30 backdrop-blur-xl border border-[#ff2d55]/30'
                            >
                                <FaFire className='text-[#ff2d55] text-[8px] animate-pulse' />
                                <span className='text-[#ff2d55] text-[6px] font-bold uppercase'>Popular</span>
                            </motion.div>
                        )}
                    </div>

                    {/* ✅ Content Section */}
                    <div className='p-4 space-y-2.5'>
                        
                        {/* ✅ Shop Name & Actions */}
                        <div className='flex items-start justify-between gap-2'>
                            <div className='flex-1 min-w-0'>
                                <motion.h3 
                                    className='text-white font-bold text-base truncate group-hover:text-[#ff6b35] transition-colors duration-300'
                                    whileHover={{ x: 3 }}
                                >
                                    {shop.name}
                                </motion.h3>
                                <div className='flex items-center gap-1.5 mt-0.5'>
                                    <span className='text-white/30 text-[8px]'>Owner</span>
                                    <span className='w-1 h-1 rounded-full bg-white/20' />
                                    <p className='text-white/40 text-[8px] truncate'>{shop.owner?.fullName || 'Restaurant'}</p>
                                </div>
                            </div>
                            <div className='flex items-center gap-0.5'>
                                <motion.button 
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.8 }}
                                    className={`p-1.5 rounded-lg transition-all duration-300 ${isLiked ? 'text-[#ff2d55]' : 'text-white/20 hover:text-white/40'}`}
                                    onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked) }}
                                >
                                    <FaHeart size={12} className={isLiked ? 'fill-[#ff2d55]' : ''} />
                                </motion.button>
                                <motion.button 
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.8 }}
                                    className='p-1.5 rounded-lg text-white/20 hover:text-white/40 transition-all duration-300'
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <FaShare size={12} />
                                </motion.button>
                            </div>
                        </div>

                        {/* ✅ Address */}
                        <div className='flex items-center gap-1.5'>
                            <FaMapMarkerAlt size={10} className='text-[#ff6b35] flex-shrink-0' />
                            <p className='text-white/40 text-[9px] truncate'>{shop.address}, {shop.city}</p>
                        </div>

                        {/* ✅ Stats Row - FIXED: Use deliveryTime default */}
                        <div className='grid grid-cols-3 gap-1.5 pt-1'>
                            <div className='flex items-center gap-1 p-1.5 rounded-lg bg-white/5 border border-white/5'>
                                <FaClock size={8} className='text-[#ff6b35]' />
                                <span className='text-white/40 text-[7px] font-medium'>{deliveryTime}m</span>
                            </div>
                            <div className='flex items-center gap-1 p-1.5 rounded-lg bg-white/5 border border-white/5'>
                                <FaUtensils size={8} className='text-white/30' />
                                <span className='text-white/40 text-[7px]'>{shop.items?.length || 0} items</span>
                            </div>
                            <div className='flex items-center gap-1 p-1.5 rounded-lg bg-white/5 border border-white/5'>
                                <MdDeliveryDining size={8} className='text-blue-400' />
                                <span className='text-white/40 text-[7px]'>Delivery</span>
                            </div>
                        </div>
                    </div>

                    {/* ✅ Footer - View Button */}
                    <div className='p-3 pt-0 border-t border-white/5 flex items-center justify-between'>
                        <span className='text-white/20 text-[8px] uppercase tracking-wider'>View Restaurant</span>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className='px-4 py-1.5 rounded-full bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white text-[8px] font-medium shadow-lg shadow-[#ff2d55]/20 flex items-center gap-1.5 group'
                            onClick={() => navigate(`/shop/${shop._id}`)}
                        >
                            <span>Explore</span>
                            <FaArrowRight size={8} className='group-hover:translate-x-1 transition-transform' />
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* ✅ Hover Overlay - Premium */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className='absolute inset-0 bg-black/80 backdrop-blur-xl rounded-2xl flex items-center justify-center z-20'
                    >
                        <div className='text-center space-y-2.5 p-5'>
                            <motion.div
                                initial={{ y: 15, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.05 }}
                            >
                                <motion.div
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <span className='text-5xl block mb-1.5'>🏪</span>
                                </motion.div>
                                <h3 className='text-white font-bold text-base'>{shop.name}</h3>
                                <div className='flex items-center justify-center gap-2 mt-0.5'>
                                    <span className='text-white/40 text-[8px]'>{shop.city}</span>
                                    {isApproved && (
                                        <span className='text-[6px] text-green-400 bg-green-500/20 px-1.5 py-0.5 rounded-full border border-green-500/20'>
                                            ✅ Verified
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                            
                            <motion.div
                                initial={{ y: 15, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className='flex items-center justify-center gap-3 text-white/50 text-[9px]'
                            >
                                <span className='flex items-center gap-0.5'><FaStar className='text-yellow-400' size={8} /> {rating.toFixed(1)}</span>
                                <span className='w-px h-3 bg-white/10' />
                                <span className='flex items-center gap-0.5'><FaClock className='text-[#ff6b35]' size={8} /> {deliveryTime}m</span>
                                <span className='w-px h-3 bg-white/10' />
                                <span className='flex items-center gap-0.5'><FaTag className='text-[#ff6b35]' size={8} /> {shop.items?.length || 0} items</span>
                            </motion.div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ delay: 0.15 }}
                                className='px-6 py-1.5 rounded-full bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white text-[9px] font-medium shadow-lg shadow-[#ff2d55]/30 flex items-center gap-1.5 mx-auto group'
                                onClick={() => navigate(`/shop/${shop._id}`)}
                            >
                                <FaEye size={9} /> View Shop
                                <FaArrowRight size={8} className='group-hover:translate-x-1 transition-transform' />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .glass-premium-ultra {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
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

export default ShopCard