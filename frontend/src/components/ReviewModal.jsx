import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../../config'
import { toast } from 'react-toastify'
import { ClipLoader } from 'react-spinners'
import { 
    FaStar, FaTimes, FaCheckCircle, FaMotorcycle, 
    FaUtensils, FaComment, FaUser, FaStarHalf,
    FaRegStar, FaFire, FaGem, FaRocket, FaHeart,
    FaSmile, FaThumbsUp, FaMedal, FaCrown,
    FaShieldAlt, FaArrowRight
} from 'react-icons/fa'
import { MdRestaurant, MdVerified } from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'

function ReviewModal({ shopId, orderId, onClose, onReviewSubmitted }) {
    const navigate = useNavigate()
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [selectedEmoji, setSelectedEmoji] = useState(null)

    useEffect(() => {
        setIsVisible(true)
        return () => setIsVisible(false)
    }, [])

    const getRatingLabel = (rating) => {
        const labels = {
            1: 'Poor',
            2: 'Fair',
            3: 'Good',
            4: 'Very Good',
            5: 'Excellent!'
        }
        return labels[rating] || 'Tap a star to rate'
    }

    const getRatingEmoji = (rating) => {
        const emojis = {
            1: '😞',
            2: '😕',
            3: '😐',
            4: '😊',
            5: '🤩'
        }
        return emojis[rating] || '⭐'
    }

    const getRatingColor = (rating) => {
        const colors = {
            1: 'text-red-500',
            2: 'text-orange-500',
            3: 'text-amber-500',
            4: 'text-blue-500',
            5: 'text-green-500'
        }
        return colors[rating] || 'text-gray-400'
    }

    const emojis = [
        { emoji: '🍕', label: 'Delicious' },
        { emoji: '🚀', label: 'Fast' },
        { emoji: '💯', label: 'Perfect' },
        { emoji: '🎉', label: 'Amazing' },
        { emoji: '👌', label: 'Good' },
        { emoji: '😊', label: 'Happy' }
    ]

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Please select a rating', {
                position: "top-center",
                autoClose: 3000,
            })
            return
        }

        setSubmitting(true)
        try {
            const result = await axios.post(`${serverUrl}/api/review/add`, {
                shopId,
                orderId,
                rating,
                comment: comment.trim() || selectedEmoji?.label || ''
            }, { withCredentials: true })
            
            toast.success('⭐ Review submitted successfully!', {
                position: "top-center",
                autoClose: 3000,
            })
            
            if (onReviewSubmitted) onReviewSubmitted(result.data)
            onClose()
        } catch (error) {
            console.log('❌ Review error:', error)
            toast.error(error.response?.data?.message || 'Failed to submit review', {
                position: "top-center",
                autoClose: 3000,
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[99999] p-4'
                    onClick={onClose}
                >
                    <motion.div 
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className='relative w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden'
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top accent bar */}
                        <div className='h-1.5 w-full bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400' />

                        <button 
                            className='absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-all duration-300 w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100'
                            onClick={onClose}
                        >
                            <FaTimes size={18} />
                        </button>

                        <div className='p-6'>
                            {/* Header */}
                            <div className='text-center mb-6'>
                                <motion.div 
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                                    className='w-16 h-16 mx-auto rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center mb-3'
                                >
                                    <FaStar className='text-orange-500 text-2xl' />
                                </motion.div>
                                
                                <h2 className='text-2xl font-bold text-gray-900 tracking-tight'>
                                    Rate Your Experience
                                </h2>
                                <p className='text-gray-500 text-sm mt-1'>
                                    How was your dining experience?
                                </p>
                            </div>

                            {/* Stars */}
                            <div className='flex justify-center gap-2 mb-2'>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <motion.button
                                        key={star}
                                        whileHover={{ scale: 1.3, y: -5 }}
                                        whileTap={{ scale: 0.8 }}
                                        className='text-4xl transition-all duration-200 focus:outline-none'
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                        aria-label={`Rate ${star} stars`}
                                    >
                                        <FaStar 
                                            className={`${(hoverRating || rating) >= star ? 'text-amber-400' : 'text-gray-200'} transition-all duration-200 ${
                                                (hoverRating || rating) >= star ? 'drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]' : ''
                                            }`}
                                        />
                                    </motion.button>
                                ))}
                            </div>

                            {/* Rating Label */}
                            <motion.div 
                                key={rating}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className='text-center mb-4'
                            >
                                {rating > 0 ? (
                                    <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 border border-gray-200'>
                                        <span className={`text-sm font-semibold ${getRatingColor(rating)}`}>
                                            {getRatingEmoji(rating)} {getRatingLabel(rating)}
                                        </span>
                                        <span className='text-gray-400 text-xs'>
                                            {rating} / 5
                                        </span>
                                    </div>
                                ) : (
                                    <span className='text-gray-400 text-sm'>Tap a star to rate</span>
                                )}
                            </motion.div>

                            {/* Emojis */}
                            {rating > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className='flex justify-center gap-2 mb-4 flex-wrap'
                                >
                                    {emojis.map((item, idx) => (
                                        <motion.button
                                            key={idx}
                                            whileHover={{ scale: 1.15, y: -3 }}
                                            whileTap={{ scale: 0.9 }}
                                            className={`px-3 py-1.5 rounded-full text-sm transition-all duration-300 ${
                                                selectedEmoji?.emoji === item.emoji
                                                    ? 'bg-orange-100 border-2 border-orange-300 text-gray-800'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border-2 border-transparent'
                                            }`}
                                            onClick={() => setSelectedEmoji(
                                                selectedEmoji?.emoji === item.emoji ? null : item
                                            )}
                                        >
                                            {item.emoji} {item.label}
                                        </motion.button>
                                    ))}
                                </motion.div>
                            )}

                            {/* Comment */}
                            <div className='mb-4'>
                                <label className='block text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-2'>
                                    <FaComment size={12} className='text-orange-500' />
                                    Your Feedback
                                    <span className='text-gray-300 text-[10px] font-normal'>(Optional)</span>
                                </label>
                                <div className='relative'>
                                    <textarea
                                        placeholder='Tell us about your experience...'
                                        className='w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all duration-300 min-h-[90px] resize-none text-sm'
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        maxLength={500}
                                    />
                                    <span className='absolute bottom-2 right-3 text-gray-300 text-[10px] font-medium'>
                                        {comment.length}/500
                                    </span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                whileHover={rating > 0 ? { scale: 1.02 } : {}}
                                whileTap={rating > 0 ? { scale: 0.98 } : {}}
                                className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                                    rating === 0
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-200 hover:shadow-orange-300'
                                }`}
                                onClick={handleSubmit}
                                disabled={submitting || rating === 0}
                            >
                                {submitting ? (
                                    <>
                                        <ClipLoader size={20} color='white' />
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaCheckCircle size={16} />
                                        <span>Submit Review</span>
                                        {rating >= 4 && (
                                            <motion.span
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 1, repeat: Infinity }}
                                            >
                                                🎉
                                            </motion.span>
                                        )}
                                        <FaArrowRight size={14} />
                                    </>
                                )}
                            </motion.button>

                            {/* Footer */}
                            <div className='mt-4 pt-3 border-t border-gray-200 flex items-center justify-between'>
                                <div className='flex items-center gap-2 text-gray-400 text-[10px] font-medium'>
                                    <FaShieldAlt size={10} className='text-green-500' />
                                    <span>Your feedback matters</span>
                                </div>
                                <div className='flex items-center gap-1.5'>
                                    <span className='text-gray-400 text-[10px] font-medium'>Trusted</span>
                                    <MdVerified size={12} className='text-blue-500' />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default ReviewModal