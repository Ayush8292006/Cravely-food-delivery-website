import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    FaStore, FaStar, FaClock, FaMapMarkerAlt, 
    FaTruck, FaFire, FaTag, FaArrowRight,
    FaHeart, FaShare, FaCheckCircle, FaGem,
    FaRocket, FaCrown, FaAward, FaUtensils,
    FaEye, FaRegHeart
} from 'react-icons/fa'
import { MdVerified, MdDeliveryDining } from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'

function ShopCard({ shop, index = 0 }) {
    const navigate = useNavigate()
    const [isLiked, setIsLiked] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [imageError, setImageError] = useState(false)

    const isApproved = shop.isApproved !== undefined ? shop.isApproved : true
    const rating = shop.rating?.average || 0
    const reviews = shop.rating?.count || 0
    
    const isOpen = true
    const hasDiscount = false
    const discountPercent = 0
    const deliveryTime = '30-40'
    
    const isPopular = reviews > 100

    const getCategoryColor = () => {
        const colors = {
            'Pizza': 'bg-red-500',
            'Burger': 'bg-amber-500',
            'Snacks': 'bg-green-500',
            'Main Course': 'bg-blue-500',
            'Desserts': 'bg-pink-500',
            'South Indian': 'bg-yellow-500',
            'North Indian': 'bg-orange-500',
            'Chinese': 'bg-red-500',
            'Fast Food': 'bg-orange-500',
            'Others': 'bg-purple-500'
        }
        return colors[shop.category] || 'bg-orange-500'
    }

    const getImageSrc = () => {
        if (imageError) return 'https://via.placeholder.com/400x300/f0ebe5/cbb8a8?text=🍽️'
        if (shop.image) return shop.image
        return 'https://via.placeholder.com/400x300/f0ebe5/cbb8a8?text=🍽️'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 200, damping: 22 }}
            whileHover={{ y: -6 }}
            className='relative group w-full max-w-[300px]'
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div 
                className='bg-white rounded-2xl overflow-hidden border-2 border-gray-200 
                    hover:border-orange-300 transition-all duration-300 
                    hover:shadow-lg hover:shadow-orange-100/50 
                    cursor-pointer'
                onClick={() => navigate(`/shop/${shop._id}`)}
            >
                {/* Image Section */}
                <div className='relative h-[180px] overflow-hidden bg-gray-100'>
                    <img 
                        src={getImageSrc()}
                        alt={shop.name}
                        className='w-full h-full object-cover group-hover:scale-105 transition-all duration-500'
                        loading="lazy"
                        onError={() => setImageError(true)}
                    />
                    
                    <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent' />

                    {/* Status Badges - Top Left */}
                    <div className='absolute top-3 left-3 flex flex-col gap-1.5'>
                        {isApproved ? (
                            <div className='flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/90 backdrop-blur-sm border border-green-400 shadow-sm'>
                                <FaCheckCircle className='text-white text-[10px]' />
                                <span className='text-[8px] text-white font-bold uppercase'>Verified</span>
                            </div>
                        ) : (
                            <div className='flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-sm border border-amber-400 shadow-sm'>
                                <FaClock className='text-white text-[10px]' />
                                <span className='text-[8px] text-white font-bold uppercase'>Pending</span>
                            </div>
                        )}
                        
                        {isOpen && (
                            <div className='flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/90 backdrop-blur-sm border border-green-400 shadow-sm'>
                                <span className='w-1.5 h-1.5 bg-white rounded-full animate-pulse' />
                                <span className='text-[8px] text-white font-bold uppercase'>Open</span>
                            </div>
                        )}
                    </div>

                    {/* Rating Badge - Top Right */}
                    <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className='absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm border border-gray-200'
                    >
                        <FaStar className='text-amber-400 text-[10px]' />
                        <span className='text-gray-800 font-bold text-xs'>{rating.toFixed(1)}</span>
                        <span className='text-gray-400 text-[8px]'>({reviews})</span>
                    </motion.div>

                    {/* Category Badge */}
                    <div className={`absolute bottom-3 left-3 px-3 py-1 rounded-full ${getCategoryColor()} text-white text-[9px] font-bold uppercase shadow-sm`}>
                        {shop.category || 'Restaurant'}
                    </div>

                    {/* Popular Badge */}
                    {isPopular && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className='absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/90 backdrop-blur-sm border border-orange-400 shadow-sm'
                        >
                            <FaFire className='text-white text-[8px]' />
                            <span className='text-white text-[7px] font-bold uppercase'>Popular</span>
                        </motion.div>
                    )}
                </div>

                {/* Content Section */}
                <div className='p-4 space-y-2.5'>
                    
                    {/* Shop Name & Actions */}
                    <div className='flex items-start justify-between gap-2'>
                        <div className='flex-1 min-w-0'>
                            <h3 className='text-gray-900 font-bold text-base truncate'>
                                {shop.name}
                            </h3>
                            <div className='flex items-center gap-1.5 mt-0.5'>
                                <span className='text-gray-400 text-[8px] font-medium'>Owner</span>
                                <span className='w-1 h-1 rounded-full bg-gray-300' />
                                <p className='text-gray-500 text-[8px] truncate'>{shop.owner?.fullName || 'Restaurant'}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-0.5'>
                            <motion.button 
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.85 }}
                                className={`p-1.5 rounded-lg transition-all duration-300 ${isLiked ? 'text-red-500' : 'text-gray-300 hover:text-gray-500'}`}
                                onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked) }}
                            >
                                {isLiked ? <FaHeart size={13} className="fill-red-500" /> : <FaRegHeart size={13} />}
                            </motion.button>
                            <motion.button 
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.85 }}
                                className='p-1.5 rounded-lg text-gray-300 hover:text-gray-500 transition-all duration-300'
                                onClick={(e) => e.stopPropagation()}
                            >
                                <FaShare size={13} />
                            </motion.button>
                        </div>
                    </div>

                    {/* Address */}
                    <div className='flex items-center gap-1.5'>
                        <FaMapMarkerAlt size={10} className='text-orange-500 flex-shrink-0' />
                        <p className='text-gray-500 text-[10px] truncate'>{shop.address}, {shop.city}</p>
                    </div>

                    {/* Stats Row */}
                    <div className='grid grid-cols-3 gap-1.5 pt-1'>
                        <div className='flex items-center gap-1.5 p-1.5 rounded-lg bg-gray-50 border border-gray-200'>
                            <FaClock size={9} className='text-orange-500' />
                            <span className='text-gray-600 text-[9px] font-medium'>{deliveryTime}m</span>
                        </div>
                        <div className='flex items-center gap-1.5 p-1.5 rounded-lg bg-gray-50 border border-gray-200'>
                            <FaUtensils size={9} className='text-gray-400' />
                            <span className='text-gray-600 text-[9px] font-medium'>{shop.items?.length || 0} items</span>
                        </div>
                        <div className='flex items-center gap-1.5 p-1.5 rounded-lg bg-gray-50 border border-gray-200'>
                            <MdDeliveryDining size={9} className='text-blue-500' />
                            <span className='text-gray-600 text-[9px] font-medium'>Delivery</span>
                        </div>
                    </div>
                </div>

                {/* Footer - View Button */}
                <div className='px-4 pb-4 pt-2 border-t border-gray-100 flex items-center justify-between'>
                    <span className='text-gray-400 text-[8px] uppercase tracking-wider font-medium'>View Restaurant</span>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className='px-4 py-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-[9px] font-medium shadow-sm shadow-orange-200 flex items-center gap-1.5 group'
                        onClick={() => navigate(`/shop/${shop._id}`)}
                    >
                        <span>Explore</span>
                        <FaArrowRight size={8} className='group-hover:translate-x-1 transition-transform' />
                    </motion.button>
                </div>
            </div>

            {/* Hover Overlay - Clean */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className='absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20 border-2 border-orange-300 shadow-lg'
                    >
                        <div className='text-center space-y-3 p-5'>
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                            >
                                <span className='text-5xl block mb-2'>🏪</span>
                                <h3 className='text-gray-900 font-bold text-base'>{shop.name}</h3>
                                <div className='flex items-center justify-center gap-2 mt-1'>
                                    <span className='text-gray-500 text-[10px] font-medium'>{shop.city}</span>
                                    {isApproved && (
                                        <span className='text-[8px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-200 font-medium'>
                                            ✅ Verified
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                            
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.05 }}
                                className='flex items-center justify-center gap-3 text-gray-600 text-[10px] font-medium'
                            >
                                <span className='flex items-center gap-1'><FaStar className='text-amber-400' size={9} /> {rating.toFixed(1)}</span>
                                <span className='w-px h-4 bg-gray-200' />
                                <span className='flex items-center gap-1'><FaClock className='text-orange-500' size={9} /> {deliveryTime}m</span>
                                <span className='w-px h-4 bg-gray-200' />
                                <span className='flex items-center gap-1'><FaUtensils className='text-gray-400' size={9} /> {shop.items?.length || 0} items</span>
                            </motion.div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ delay: 0.1 }}
                                className='px-6 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-semibold shadow-sm shadow-orange-200 flex items-center gap-2 mx-auto group'
                                onClick={() => navigate(`/shop/${shop._id}`)}
                            >
                                <FaEye size={10} /> View Shop
                                <FaArrowRight size={9} className='group-hover:translate-x-1 transition-transform' />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default ShopCard