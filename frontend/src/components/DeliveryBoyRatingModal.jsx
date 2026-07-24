import React, { useState } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'
import { toast } from 'react-toastify'
import { ClipLoader } from 'react-spinners'
import { 
    FaStar, FaTimes, FaClock, FaSmile, FaTruck,
    FaCheckCircle, FaMotorcycle, FaUser
} from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

function DeliveryBoyRatingModal({ orderId, onClose, onRatingSubmitted }) {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState('')
    const [deliveryTime, setDeliveryTime] = useState('on-time')
    const [behavior, setBehavior] = useState('professional')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Please select a rating')
            return
        }

        setSubmitting(true)
        try {
            const result = await axios.post(`${serverUrl}/api/delivery-rating/add`, {
                orderId,
                rating,
                comment,
                deliveryTime,
                behavior
            }, { withCredentials: true })
            
            toast.success('🌟 Delivery rating submitted!')
            onRatingSubmitted(result.data)
            onClose()
            setSubmitting(false)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit rating')
            setSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[99999] p-4'>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className='glass-premium-ultra rounded-3xl max-w-md w-full p-6 relative border border-white/10 shadow-2xl shadow-black/50'
                >
                    {/* Close Button */}
                    <button 
                        className='absolute top-4 right-4 text-white/40 hover:text-white transition-all duration-300 hover:rotate-90'
                        onClick={onClose}
                    >
                        <FaTimes size={20} />
                    </button>

                    {/* Header */}
                    <div className='text-center mb-6'>
                        <div className='w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center shadow-2xl shadow-[#ff2d55]/30 mb-3'>
                            <FaMotorcycle className='text-white text-2xl' />
                        </div>
                        <h2 className='text-xl font-bold text-white'>Rate Your Delivery</h2>
                        <p className='text-white/40 text-sm'>How was your delivery experience?</p>
                    </div>

                    {/* Stars */}
                    <div className='flex justify-center gap-2 mb-2'>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button
                                key={star}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                className='text-4xl transition-all duration-200'
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                            >
                                <FaStar 
                                    className={`${(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-white/20'} transition-colors duration-200`}
                                />
                            </motion.button>
                        ))}
                    </div>

                    {/* Rating Text */}
                    <p className='text-center text-sm text-white/40 mb-4'>
                        {rating > 0 ? (
                            <span className='text-yellow-400'>{rating} star{rating > 1 ? 's' : ''} ⭐</span>
                        ) : (
                            'Tap a star to rate'
                        )}
                    </p>

                    {/* Delivery Time */}
                    <div className='mb-3'>
                        <label className='block text-white/60 text-sm font-medium mb-1.5 flex items-center gap-2'>
                            <FaClock className='text-[#ff6b35]' /> Delivery Time
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
                                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                                        deliveryTime === option.value 
                                            ? 'bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white shadow-lg shadow-[#ff2d55]/20' 
                                            : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/5'
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
                        <label className='block text-white/60 text-sm font-medium mb-1.5 flex items-center gap-2'>
                            <FaSmile className='text-[#ff6b35]' /> Delivery Boy Behavior
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
                                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                                        behavior === option.value 
                                            ? 'bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white shadow-lg shadow-[#ff2d55]/20' 
                                            : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/5'
                                    }`}
                                    onClick={() => setBehavior(option.value)}
                                >
                                    {option.label}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Comment */}
                    <textarea
                        placeholder='Share your experience (optional)'
                        className='w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 min-h-[80px] resize-none text-sm'
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />

                    {/* Submit Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className='w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white font-semibold shadow-lg shadow-[#ff2d55]/25 hover:shadow-[#ff2d55]/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50'
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ClipLoader size={20} color='white' />
                        ) : (
                            <><FaCheckCircle size={16} /> Submit Rating</>
                        )}
                    </motion.button>

                    <style jsx>{`
                        .glass-premium-ultra {
                            background: rgba(255, 255, 255, 0.04);
                            backdrop-filter: blur(24px);
                            -webkit-backdrop-filter: blur(24px);
                            border: 1px solid rgba(255, 255, 255, 0.06);
                        }
                    `}</style>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

export default DeliveryBoyRatingModal