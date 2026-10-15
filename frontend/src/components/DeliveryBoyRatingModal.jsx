import React, { useState } from 'react'
import axios from 'axios'
// ✅ FIXED: Correct import path
import { serverUrl } from '../../config'
import { toast } from 'react-toastify'
import { ClipLoader } from 'react-spinners'
import { 
    FaStar, FaTimes, FaClock, FaSmile, FaTruck,
    FaCheckCircle, FaMotorcycle, FaUser, FaArrowRight
} from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

function DeliveryBoyRatingModal({ orderId, onClose, onRatingSubmitted }) {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState('')
    const [deliveryTime, setDeliveryTime] = useState('on-time')
    const [behavior, setBehavior] = useState('professional')
    const [submitting, setSubmitting] = useState(false)
    const [commentError, setCommentError] = useState('')

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Please select a rating', {
                position: "top-center",
                autoClose: 3000,
            })
            return
        }

        if (comment && comment.length > 200) {
            setCommentError('Comment must be less than 200 characters')
            return
        }

        setSubmitting(true)
        setCommentError('')
        try {
            const result = await axios.post(`${serverUrl}/api/delivery-rating/add`, {
                orderId,
                rating,
                comment: comment.trim(),
                deliveryTime,
                behavior
            }, { withCredentials: true })
            
            toast.success('🌟 Delivery rating submitted!', {
                position: "top-center",
                autoClose: 3000,
            })
            
            if (onRatingSubmitted) onRatingSubmitted(result.data)
            onClose()
        } catch (error) {
            console.log('❌ Rating error:', error)
            toast.error(error.response?.data?.message || 'Failed to submit rating', {
                position: "top-center",
                autoClose: 3000,
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[99999] p-4' onClick={onClose}>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className='bg-white rounded-3xl max-w-md w-full p-6 relative border-2 border-gray-200 shadow-xl'
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <motion.button 
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-all duration-300'
                        onClick={onClose}
                    >
                        <FaTimes size={20} />
                    </motion.button>

                    {/* Header */}
                    <div className='text-center mb-6'>
                        <motion.div 
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                            className='w-16 h-16 mx-auto rounded-full bg-orange-500 flex items-center justify-center shadow-md shadow-orange-200 mb-3'
                        >
                            <FaMotorcycle className='text-white text-2xl' />
                        </motion.div>
                        <h2 className='text-xl font-bold text-gray-900'>Rate Your Delivery</h2>
                        <p className='text-gray-500 text-sm font-medium'>How was your delivery experience?</p>
                    </div>

                    {/* Stars */}
                    <div className='flex justify-center gap-2 mb-2'>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button
                                key={star}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                className='text-4xl transition-all duration-200 focus:outline-none'
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                                aria-label={`Rate ${star} stars`}
                            >
                                <FaStar 
                                    className={`${(hoverRating || rating) >= star ? 'text-amber-400' : 'text-gray-300'} transition-colors duration-200 ${(hoverRating || rating) >= star ? 'drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]' : ''}`}
                                />
                            </motion.button>
                        ))}
                    </div>

                    {/* Rating Text */}
                    <p className='text-center text-sm font-medium text-gray-500 mb-4'>
                        {rating > 0 ? (
                            <span className='text-amber-600'>{rating} star{rating > 1 ? 's' : ''} ⭐</span>
                        ) : (
                            'Tap a star to rate'
                        )}
                    </p>

                    {/* Delivery Time */}
                    <div className='mb-3'>
                        <label className='block text-gray-600 text-sm font-bold mb-1.5 flex items-center gap-2'>
                            <FaClock className='text-orange-500' /> Delivery Time
                        </label>
                        <div className='grid grid-cols-3 gap-2'>
                            {[
                                { value: 'early', label: '📈 Early' },
                                { value: 'on-time', label: '⏰ On Time' },
                                { value: 'late', label: '📉 Late' }
                            ].map((option) => (
                                <motion.button
                                    key={option.value}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`py-2 px-3 rounded-xl text-sm font-bold transition-all border-2 ${
                                        deliveryTime === option.value 
                                            ? 'bg-orange-500 text-white border-orange-600 shadow-sm shadow-orange-200' 
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200'
                                    }`}
                                    onClick={() => setDeliveryTime(option.value)}
                                >
                                    {option.label}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Behavior */}
                    <div className='mb-3'>
                        <label className='block text-gray-600 text-sm font-bold mb-1.5 flex items-center gap-2'>
                            <FaSmile className='text-orange-500' /> Delivery Boy Behavior
                        </label>
                        <div className='grid grid-cols-2 gap-2'>
                            {[
                                { value: 'friendly', label: '😊 Friendly' },
                                { value: 'professional', label: '💼 Professional' },
                                { value: 'average', label: '😐 Average' },
                                { value: 'needs-improvement', label: '📈 Needs Improvement' }
                            ].map((option) => (
                                <motion.button
                                    key={option.value}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`py-2 px-3 rounded-xl text-sm font-bold transition-all border-2 ${
                                        behavior === option.value 
                                            ? 'bg-orange-500 text-white border-orange-600 shadow-sm shadow-orange-200' 
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200'
                                    }`}
                                    onClick={() => setBehavior(option.value)}
                                >
                                    {option.label}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Comment */}
                    <div>
                        <label className='block text-gray-600 text-sm font-bold mb-1.5 flex items-center gap-2'>
                            <FaUser className='text-orange-500' /> Your Feedback
                            <span className='text-gray-400 text-xs font-normal'>(Optional)</span>
                        </label>
                        <textarea
                            placeholder='Share your experience (max 200 characters)'
                            className={`w-full bg-gray-50 border-2 rounded-xl px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all duration-300 min-h-[80px] resize-none text-sm ${
                                commentError 
                                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                                    : 'border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                            }`}
                            value={comment}
                            onChange={(e) => {
                                if (e.target.value.length <= 200) {
                                    setComment(e.target.value)
                                    setCommentError('')
                                }
                            }}
                            maxLength={200}
                        />
                        <div className='flex items-center justify-between mt-1'>
                            {commentError ? (
                                <p className='text-red-500 text-xs font-medium'>{commentError}</p>
                            ) : (
                                <p className='text-gray-400 text-xs font-medium'>Share your honest feedback</p>
                            )}
                            <span className={`text-[10px] font-medium ${comment.length > 180 ? 'text-amber-500' : 'text-gray-400'}`}>
                                {comment.length}/200
                            </span>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className='w-full mt-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-sm shadow-orange-200 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50'
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <ClipLoader size={20} color='white' />
                                <span>Submitting...</span>
                            </>
                        ) : (
                            <>
                                <FaCheckCircle size={16} />
                                Submit Rating
                                <FaArrowRight size={14} />
                            </>
                        )}
                    </motion.button>

                    {/* Footer */}
                    <div className='mt-3 pt-3 border-t-2 border-gray-200 flex items-center justify-between'>
                        <div className='flex items-center gap-2 text-gray-400 text-[10px] font-medium'>
                            <FaTruck className='text-orange-500' size={10} />
                            <span>Your feedback helps improve service</span>
                        </div>
                        <span className='text-gray-300 text-[8px] font-medium'>✨ Trusted Rating</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

export default DeliveryBoyRatingModal