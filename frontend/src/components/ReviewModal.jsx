import React, { useState } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'
import { toast } from 'react-toastify'
import { ClipLoader } from 'react-spinners'
import { FaStar, FaTimes } from 'react-icons/fa'

function ReviewModal({ shopId, orderId, onClose, onReviewSubmitted }) {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Please select a rating')
            return
        }

        setSubmitting(true)
        try {
            const result = await axios.post(`${serverUrl}/api/review/add`, {
                shopId,
                orderId,
                rating,
                comment
            }, { withCredentials: true })
            
            toast.success('Review submitted!')
            onReviewSubmitted(result.data)
            onClose()
            setSubmitting(false)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review')
            setSubmitting(false)
        }
    }

    return (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4'>
            <div className='bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative'>
                {/* Close Button */}
                <button 
                    className='absolute top-4 right-4 text-gray-400 hover:text-gray-600'
                    onClick={onClose}
                >
                    <FaTimes size={20} />
                </button>

                <h2 className='text-xl font-bold text-center text-gray-800 mb-4'>
                    Rate Your Experience
                </h2>

                {/* Stars */}
                <div className='flex justify-center gap-2 mb-4'>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            className='text-4xl transition-all duration-200'
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                        >
                            <FaStar 
                                className={`${(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'} transition-colors duration-200`}
                            />
                        </button>
                    ))}
                </div>

                {/* Rating Text */}
                <p className='text-center text-sm text-gray-500 mb-4'>
                    {rating > 0 ? `You rated ${rating} star${rating > 1 ? 's' : ''}` : 'Tap a star to rate'}
                </p>

                {/* Comment */}
                <textarea
                    placeholder='Write your review (optional)'
                    className='w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8B1A2A] min-h-[100px] resize-none'
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />

                {/* Submit Button */}
                <button
                    className='w-full bg-[#8B1A2A] text-white py-3 rounded-lg font-semibold hover:bg-[#6b1520] disabled:opacity-50 transition mt-4'
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? <ClipLoader size={20} color='white' /> : 'Submit Review'}
                </button>
            </div>
        </div>
    )
}

export default ReviewModal