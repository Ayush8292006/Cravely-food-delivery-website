import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../../config';
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
    const itemImage = data.image || 'https://via.placeholder.com/400x300/f0ebe5/cbb8a8?text=No+Image'
    const itemCategory = data.category || 'Other'
    const itemId = data._id
    const shopId = data.shop?._id || data.shop
    
    const isInStock = true
    const deliveryTime = '30-40'
    
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
        return colors[itemCategory] || 'bg-orange-500'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 180, damping: 20 }}
            whileHover={{ y: -6 }}
            className='relative group'
        >
            <div 
                className='relative bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-orange-300 hover:shadow-md transition-all duration-300'
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* ✅ Category Color Strip */}
                <div className={`h-1 w-full ${getCategoryColor()}`} />

                {/* ✅ Image Section */}
                <div className='relative h-[200px] overflow-hidden bg-gray-100'>
                    <img 
                        src={itemImage}
                        alt={itemName}
                        className='w-full h-full object-cover group-hover:scale-105 transition-all duration-500'
                        loading="lazy"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x300/f0ebe5/cbb8a8?text=No+Image'
                        }}
                    />
                    
                    <div className='absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent' />

                    {/* ✅ Food Type Badge */}
                    <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white shadow-md border-2 ${
                            isVeg ? 'border-green-200' : 'border-red-200'
                        }`}
                    >
                        {isVeg ? (
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
                    </motion.div>

                    {/* ✅ Rating Badge */}
                    <motion.div 
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className='absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white shadow-md border border-gray-200'
                    >
                        <FaStar className='text-amber-400 text-[10px]' />
                        <span className='text-gray-800 font-bold text-xs'>{rating.toFixed(1)}</span>
                        <span className='text-gray-400 text-[8px]'>({reviews})</span>
                    </motion.div>

                    {/* ✅ Price Tag */}
                    <motion.div 
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className='absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white shadow-md border border-gray-200'
                    >
                        <FaTag className='text-orange-500 text-[10px]' />
                        <span className='text-gray-800 font-bold text-base'>₹{itemPrice}</span>
                    </motion.div>

                    {/* ✅ Popular Badge */}
                    {isPopular && (
                        <motion.div 
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.35 }}
                            className='absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 border-2 border-orange-200 shadow-sm'
                        >
                            <FaFire className='text-orange-500 text-[9px] animate-pulse' />
                            <span className='text-orange-600 text-[6px] font-bold uppercase'>Popular</span>
                        </motion.div>
                    )}
                </div>

                {/* ✅ Content Section */}
                <div className='p-4 space-y-3'>
                    
                    {/* ✅ Name & Category */}
                    <div className='flex items-start justify-between gap-2'>
                        <div>
                            <h3 className='text-gray-900 font-bold text-base truncate'>
                                {itemName}
                            </h3>
                            <div className='flex items-center gap-2 mt-0.5 flex-wrap'>
                                <span className='w-1.5 h-1.5 rounded-full bg-orange-500' />
                                <p className='text-gray-500 text-xs font-medium'>{itemCategory}</p>
                                <span className='text-[8px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1 font-medium'>
                                    <span className='w-1 h-1 bg-green-500 rounded-full animate-pulse' /> In Stock
                                </span>
                            </div>
                        </div>
                        <div className='flex items-center gap-1'>
                            <button 
                                className={`p-1.5 rounded-lg transition-all duration-300 ${isLiked ? 'text-red-500' : 'text-gray-300 hover:text-gray-500'}`}
                                onClick={() => setIsLiked(!isLiked)}
                            >
                                <FaHeart size={14} className={isLiked ? 'fill-red-500' : ''} />
                            </button>
                            <button 
                                className={`p-1.5 rounded-lg transition-all duration-300 ${isBookmarked ? 'text-amber-500' : 'text-gray-300 hover:text-gray-500'}`}
                                onClick={() => setIsBookmarked(!isBookmarked)}
                            >
                                <FaBookmark size={14} className={isBookmarked ? 'fill-amber-500' : ''} />
                            </button>
                        </div>
                    </div>

                    {/* ✅ Stats Row */}
                    <div className='grid grid-cols-3 gap-2'>
                        <div className='flex items-center gap-1.5 p-1.5 rounded-lg bg-gray-50 border border-gray-200'>
                            <FaClock size={11} className='text-orange-500' />
                            <span className='text-gray-600 text-[10px] font-medium'>{deliveryTime}m</span>
                        </div>
                        <div className='flex items-center gap-1.5 p-1.5 rounded-lg bg-gray-50 border border-gray-200'>
                            <FaUtensils size={11} className='text-gray-400' />
                            <span className='text-gray-600 text-[10px] font-medium'>{reviews} reviews</span>
                        </div>
                        <div className='flex items-center gap-1.5 p-1.5 rounded-lg bg-gray-50 border border-gray-200'>
                            <FaShoppingBag size={11} className='text-green-500' />
                            <span className='text-gray-600 text-[10px] font-medium'>Available</span>
                        </div>
                    </div>
                </div>

                {/* ✅ Action Buttons */}
                <div className='px-4 pb-4 pt-2 border-t border-gray-200 flex items-center gap-2'>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        className='flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium shadow-sm shadow-orange-200 transition-all duration-300 flex items-center justify-center gap-2 group'
                        onClick={() => navigate(`/edit-item/${itemId}`)}
                    >
                        <FaEdit size={14} /> 
                        <span className='hidden sm:inline'>Edit</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                            showDeleteConfirm 
                                ? 'bg-red-500 text-white shadow-sm shadow-red-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 border-2 border-transparent hover:border-red-200'
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
                                <span>⚠️ Confirm</span>
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

            {/* ✅ Hover Overlay - Clean */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className='absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20 border-2 border-orange-300 shadow-lg'
                    >
                        <div className='text-center space-y-3 p-6'>
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                            >
                                <span className='text-5xl block mb-2'>🍽️</span>
                                <h3 className='text-gray-900 font-bold text-xl'>{itemName}</h3>
                                <p className='text-gray-500 text-sm'>{itemCategory}</p>
                            </motion.div>
                            
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.05 }}
                                className='flex items-center justify-center gap-3 text-gray-600 text-xs font-medium'
                            >
                                <div className='flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 border border-gray-200'>
                                    <FaStar className='text-amber-400' size={12} />
                                    {rating.toFixed(1)}
                                </div>
                                <div className='flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 border border-gray-200'>
                                    <FaClock className='text-orange-500' size={12} />
                                    {deliveryTime}m
                                </div>
                                <div className='flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 border border-gray-200'>
                                    <FaTag className='text-orange-500' size={12} />
                                    ₹{itemPrice}
                                </div>
                            </motion.div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ delay: 0.1 }}
                                className='px-6 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium shadow-sm shadow-orange-200 flex items-center gap-2 mx-auto group'
                                onClick={() => navigate(`/shop/${shopId}`)}
                            >
                                <FaEye size={14} /> View Details
                                <FaArrowRight size={12} className='group-hover:translate-x-1 transition-transform' />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ✅ Deleting Overlay */}
            <AnimatePresence>
                {isDeleting && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center z-30'
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className='text-center'
                        >
                            <div className='w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto animate-spin' />
                            <p className='text-gray-700 font-semibold text-sm mt-3 animate-pulse'>Deleting...</p>
                            <p className='text-gray-400 text-xs'>Please wait</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
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

export default OwnerItemCard