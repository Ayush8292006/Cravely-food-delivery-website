import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { 
    FaEdit, FaTrash, FaStar, FaLeaf, FaDrumstickBite,
    FaClock, FaTag, FaUtensils, FaFire, FaEye,
    FaArrowRight, FaShoppingBag, FaHeart, FaRegClock,
    FaStore, FaMapMarkerAlt, FaPhone, FaGlobe,
    FaShare, FaBookmark, FaThumbsUp, FaComment,
    FaMagic, FaGem, FaRocket
} from "react-icons/fa";
import { MdDeliveryDining, MdRestaurant, MdVerified } from "react-icons/md";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

function OwnerItemCard({ data, index = 0, onDelete }) {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [isHovered, setIsHovered] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [isLiked, setIsLiked] = useState(false)
    const [isBookmarked, setIsBookmarked] = useState(false)

    const isVeg = data.foodType === 'veg'
    const rating = data.rating?.average || 0
    const reviews = data.rating?.count || 0
    const itemName = data.name || 'Unnamed Item'
    const itemPrice = data.price || 0
    const itemImage = data.image || 'https://via.placeholder.com/400x300/1a1a2e/666?text=No+Image'
    const itemCategory = data.category || 'Other'
    const itemId = data._id
    const shopId = data.shop?._id || data.shop
    
    // ✅ FIXED: Remove isInStock and deliveryTime - Backend mein nahi hai
    // ✅ Default values for UI
    const isInStock = true  // Always show in stock
    const deliveryTime = '30-40'  // Default delivery time
    
    const isPopular = reviews > 50

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await axios.get(`${serverUrl}/api/item/delete/${itemId}`, {
                withCredentials: true
            })
            toast.success(`${itemName} deleted successfully! 🗑️`)
            if (onDelete) {
                onDelete(itemId)
            } else {
                window.location.reload()
            }
        } catch (error) {
            console.log('Delete error:', error)
            toast.error(error.response?.data?.message || 'Failed to delete item')
            setIsDeleting(false)
        }
    }

    const getCategoryColor = () => {
        const colors = {
            'Pizza': 'from-red-500 to-orange-500',
            'Burger': 'from-amber-500 to-yellow-500',
            'Snacks': 'from-green-500 to-emerald-500',
            'Main Course': 'from-blue-500 to-indigo-500',
            'Desserts': 'from-pink-500 to-rose-500',
            'South Indian': 'from-yellow-500 to-amber-500',
            'North Indian': 'from-orange-500 to-red-500',
            'Chinese': 'from-red-500 to-pink-500',
            'Fast Food': 'from-yellow-500 to-orange-500',
            'Others': 'from-purple-500 to-violet-500'
        }
        return colors[itemCategory] || 'from-[#ff2d55] to-[#ff6b35]'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.85, rotate: -2 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 180, damping: 20 }}
            whileHover={{ y: -10, scale: 1.03 }}
            className='relative group'
        >
            {/* ✅ 3D Floating Shadow */}
            <motion.div 
                className='absolute inset-0 rounded-2xl bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] opacity-0 group-hover:opacity-30 blur-2xl transition-all duration-500'
                animate={{ scale: isHovered ? 1.05 : 0.95 }}
            />

            <div 
                className='relative glass-premium-ultra rounded-2xl overflow-hidden border border-white/5 
                    hover:border-[#ff2d55]/50 transition-all duration-500 
                    hover:shadow-2xl hover:shadow-[#ff2d55]/30 
                    bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a]'
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                
                {/* ✅ Animated Gradient Border */}
                <motion.div 
                    className='absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-r from-[#ff2d55] via-[#ff6b35] to-[#ffd93d] opacity-0 group-hover:opacity-100 transition-opacity duration-500'
                    animate={{ 
                        background: isHovered ? 'linear-gradient(135deg, #ff2d55, #ff6b35, #ffd93d, #ff2d55)' : 'linear-gradient(135deg, #ff2d55, #ff6b35, #ffd93d, #ff2d55)',
                        backgroundSize: isHovered ? '300% 300%' : '100% 100%',
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                />

                {/* ✅ Inner Content */}
                <div className='relative bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a] rounded-2xl overflow-hidden'>
                    
                    {/* ✅ Category Color Strip with Animation */}
                    <motion.div 
                        className={`h-1 w-full bg-gradient-to-r ${getCategoryColor()}`}
                        animate={{ 
                            backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        style={{ backgroundSize: '200% 100%' }}
                    />

                    {/* ✅ Image Section - Premium */}
                    <div className='relative h-[230px] overflow-hidden'>
                        <img 
                            src={itemImage}
                            alt={itemName}
                            className='w-full h-full object-cover group-hover:scale-110 transition-all duration-700'
                            loading="lazy"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/400x300/1a1a2e/666?text=No+Image'
                            }}
                        />
                        
                        {/* ✅ Premium Overlay */}
                        <div className='absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent opacity-70' />
                        <div className='absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.04"%3E%3Cpath d="M20 0v40M0 20h40"/%3E%3C/g%3E%3C/svg%3E")] opacity-50' />

                        {/* ✅ Glow Ring */}
                        <motion.div 
                            className='absolute inset-0 rounded-full bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] opacity-0 group-hover:opacity-20 blur-2xl transition-all duration-500'
                            animate={{ scale: isHovered ? 1.2 : 1 }}
                        />

                        {/* ✅ Food Type Badge - Premium */}
                        <motion.div 
                            initial={{ x: -60, opacity: 0, rotate: -10 }}
                            animate={{ x: 0, opacity: 1, rotate: 0 }}
                            transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                            className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-2xl border ${
                                isVeg 
                                    ? 'bg-green-500/40 border-green-400/50 shadow-lg shadow-green-500/30' 
                                    : 'bg-red-500/40 border-red-400/50 shadow-lg shadow-red-500/30'
                            }`}
                        >
                            {isVeg ? (
                                <>
                                    <FaLeaf className='text-green-300 text-sm animate-pulse' />
                                    <span className='text-[8px] text-green-200 font-bold uppercase tracking-wider'>Veg</span>
                                </>
                            ) : (
                                <>
                                    <FaDrumstickBite className='text-red-300 text-sm animate-pulse' />
                                    <span className='text-[8px] text-red-200 font-bold uppercase tracking-wider'>Non-Veg</span>
                                </>
                            )}
                        </motion.div>

                        {/* ✅ Rating Badge - Premium */}
                        <motion.div 
                            initial={{ x: 60, opacity: 0, rotate: 10 }}
                            animate={{ x: 0, opacity: 1, rotate: 0 }}
                            transition={{ delay: 0.25, type: "spring", stiffness: 200 }}
                            className='absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-2xl border border-white/10 shadow-lg'
                        >
                            <FaStar className='text-yellow-400 text-[10px] animate-pulse' />
                            <span className='text-white font-bold text-sm'>{rating.toFixed(1)}</span>
                            <span className='text-white/30 text-[8px]'>({reviews})</span>
                        </motion.div>

                        {/* ✅ Price Tag - Premium */}
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.35 }}
                            className='absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-2xl border border-white/10 shadow-lg'
                        >
                            <FaTag className='text-[#ff6b35] text-[10px] animate-pulse' />
                            <span className='text-white font-bold text-lg'>₹{itemPrice}</span>
                        </motion.div>

                        {/* ✅ Popular Badge - Premium */}
                        {isPopular && (
                            <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.45 }}
                                className='absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff2d55]/40 backdrop-blur-2xl border border-[#ff2d55]/50 shadow-lg shadow-[#ff2d55]/30'
                            >
                                <FaFire className='text-[#ff2d55] text-[10px] animate-pulse' />
                                <span className='text-[#ff2d55] text-[8px] font-bold uppercase tracking-wider'>🔥 Popular</span>
                            </motion.div>
                        )}
                    </div>

                    {/* ✅ Content Section - Premium */}
                    <div className='p-5 space-y-3'>
                        
                        {/* ✅ Name & Category */}
                        <div className='flex items-start justify-between gap-2'>
                            <div>
                                <motion.h3 
                                    className='text-white font-bold text-lg truncate group-hover:text-[#ff6b35] transition-colors duration-300'
                                    whileHover={{ x: 3 }}
                                >
                                    {itemName}
                                </motion.h3>
                                <div className='flex items-center gap-2 mt-0.5 flex-wrap'>
                                    <span className='w-1.5 h-1.5 rounded-full bg-[#ff6b35]' />
                                    <p className='text-white/40 text-xs'>{itemCategory}</p>
                                    {/* ✅ FIXED: Always show in stock */}
                                    <span className='text-[8px] text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full border border-green-500/20 flex items-center gap-1'>
                                        <span className='w-1 h-1 bg-green-400 rounded-full animate-pulse' /> In Stock
                                    </span>
                                </div>
                            </div>
                            <div className='flex items-center gap-1'>
                                <motion.button 
                                    whileHover={{ scale: 1.2, rotate: 10 }}
                                    whileTap={{ scale: 0.8 }}
                                    className={`p-1.5 rounded-lg transition-all duration-300 ${isLiked ? 'text-[#ff2d55]' : 'text-white/20 hover:text-white/50'}`}
                                    onClick={() => setIsLiked(!isLiked)}
                                >
                                    <FaHeart size={14} className={isLiked ? 'fill-[#ff2d55]' : ''} />
                                </motion.button>
                                <motion.button 
                                    whileHover={{ scale: 1.2, rotate: -10 }}
                                    whileTap={{ scale: 0.8 }}
                                    className={`p-1.5 rounded-lg transition-all duration-300 ${isBookmarked ? 'text-[#ffd93d]' : 'text-white/20 hover:text-white/50'}`}
                                    onClick={() => setIsBookmarked(!isBookmarked)}
                                >
                                    <FaBookmark size={14} className={isBookmarked ? 'fill-[#ffd93d]' : ''} />
                                </motion.button>
                            </div>
                        </div>

                        {/* ✅ Stats Row - Premium */}
                        <div className='grid grid-cols-3 gap-2'>
                            {[
                                { icon: <FaClock size={11} className='text-[#ff6b35]' />, label: deliveryTime + 'm', color: 'border-[#ff6b35]/20' },
                                { icon: <FaUtensils size={11} className='text-white/30' />, label: reviews + ' reviews', color: 'border-white/10' },
                                { icon: <FaShoppingBag size={11} className='text-green-400' />, label: 'Available', color: 'border-green-500/20' }
                            ].map((stat, idx) => (
                                <motion.div 
                                    key={idx}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    className={`flex items-center gap-1.5 p-2 rounded-lg bg-white/5 border ${stat.color} transition-all duration-300`}
                                >
                                    {stat.icon}
                                    <span className='text-white/40 text-[10px] font-medium'>{stat.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* ✅ Action Buttons - Premium */}
                    <div className='p-4 pt-0 border-t border-white/5 flex items-center gap-2'>
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className='flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white text-sm font-medium shadow-lg shadow-[#ff2d55]/25 hover:shadow-[#ff2d55]/50 transition-all duration-300 flex items-center justify-center gap-2 group'
                            onClick={() => navigate(`/edit-item/${itemId}`)}
                        >
                            <FaEdit size={14} className='group-hover:rotate-12 transition-transform' /> 
                            <span className='hidden sm:inline'>Edit</span>
                            <FaArrowRight size={10} className='group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100' />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                                showDeleteConfirm 
                                    ? 'bg-gradient-to-r from-red-600 to-red-500 shadow-lg shadow-red-500/40 animate-pulse'
                                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20'
                            }`}
                            onClick={() => {
                                if (showDeleteConfirm) {
                                    handleDelete()
                                } else {
                                    setShowDeleteConfirm(true)
                                    setTimeout(() => setShowDeleteConfirm(false), 3000)
                                }
                            }}
                        >
                            {showDeleteConfirm ? (
                                <>
                                    <motion.span 
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 0.8, repeat: Infinity }}
                                    >
                                        ⚠️
                                    </motion.span>
                                    <span className='hidden sm:inline'>Confirm</span>
                                </>
                            ) : (
                                <>
                                    <FaTrash size={14} /> 
                                    <span className='hidden sm:inline'>Delete</span>
                                </>
                            )}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* ✅ Hover Overlay - Ultra Premium */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, scale: 1, backdropFilter: 'blur(20px)' }}
                        exit={{ opacity: 0, scale: 0.8, backdropFilter: 'blur(0px)' }}
                        className='absolute inset-0 bg-black/80 backdrop-blur-2xl rounded-2xl flex items-center justify-center z-20'
                    >
                        <div className='text-center space-y-4 p-8'>
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                            >
                                <motion.div
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <span className='text-7xl block mb-3'>🍽️</span>
                                </motion.div>
                                <motion.h3 
                                    className='text-white font-bold text-2xl'
                                    animate={{ y: [0, -3, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    {itemName}
                                </motion.h3>
                                <p className='text-white/40 text-sm'>{itemCategory}</p>
                            </motion.div>
                            
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className='flex items-center justify-center gap-6 text-white/60 text-sm'
                            >
                                <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5'>
                                    <FaStar className='text-yellow-400' size={12} />
                                    {rating.toFixed(1)}
                                </div>
                                <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5'>
                                    <FaClock className='text-[#ff6b35]' size={12} />
                                    {deliveryTime}m
                                </div>
                                <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5'>
                                    <FaTag className='text-[#ff6b35]' size={12} />
                                    ₹{itemPrice}
                                </div>
                            </motion.div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ delay: 0.3 }}
                                className='px-8 py-3 rounded-full bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white font-medium shadow-2xl shadow-[#ff2d55]/40 flex items-center gap-2 mx-auto group'
                                onClick={() => navigate(`/shop/${shopId}`)}
                            >
                                <FaEye size={16} className='group-hover:scale-110 transition-transform' /> 
                                View Details
                                <FaArrowRight size={14} className='group-hover:translate-x-2 transition-transform duration-300' />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ✅ Deleting Overlay - Premium */}
            <AnimatePresence>
                {isDeleting && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='absolute inset-0 bg-black/90 backdrop-blur-2xl rounded-2xl flex items-center justify-center z-30'
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className='text-center'
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                className='w-16 h-16 border-4 border-[#ff2d55] border-t-transparent rounded-full mx-auto'
                            />
                            <p className='text-white font-semibold text-sm mt-4 animate-pulse'>Deleting...</p>
                            <p className='text-white/30 text-xs'>Please wait</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                @keyframes float-3d {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(40px, -30px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
            `}</style>
        </motion.div>
    )
}

export default OwnerItemCard