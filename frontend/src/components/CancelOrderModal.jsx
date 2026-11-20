import React, { useState, useEffect } from 'react'
import axios from 'axios'
// ✅ FIXED: Correct import path
import { serverUrl } from '../../config'
import { toast } from 'react-toastify'
import { ClipLoader } from 'react-spinners'
import { 
    FaTimes, FaExclamationTriangle, FaBan, 
    FaComment, FaInfoCircle, FaArrowRight,
    FaTrashAlt, FaFrown, FaMeh, FaSadCry,
    FaMotorcycle, FaShieldAlt, FaClock, FaHeart,
    FaCheckCircle, FaRocket, FaGem, FaCrown,
    FaSpinner
} from 'react-icons/fa'
import { MdCancel, MdWarning, MdOutlineCancel } from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'

// ✅ Fallback reasons if API fails
const FALLBACK_REASONS = [
    { value: 'changed_mind', label: 'I changed my mind', icon: '🤔' },
    { value: 'long_delivery', label: 'Delivery time is too long', icon: '⏰' },
    { value: 'found_cheaper', label: 'Found a cheaper option', icon: '💰' },
    { value: 'ordered_wrong', label: 'I ordered the wrong item', icon: '😅' },
    { value: 'payment_issue', label: 'Payment issue', icon: '💳' },
    { value: 'other', label: 'Other reason', icon: '📝' }
]

function CancelOrderModal({ isOpen, onClose, orderId, onCancelled }) {
    const { socket } = useSelector(state => state.user)
    const [reasons, setReasons] = useState(FALLBACK_REASONS)
    const [selectedReason, setSelectedReason] = useState('')
    const [note, setNote] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [step, setStep] = useState(1)
    const [isLoaded, setIsLoaded] = useState(false)
    const [reasonsError, setReasonsError] = useState(null)
    const [isRetrying, setIsRetrying] = useState(false)

    // ✅ Validate order data
    const validateOrderData = () => {
        if (!orderId) return null
        if (typeof orderId === 'object') {
            return {
                id: orderId._id || orderId.id || null,
                paymentMethod: orderId.paymentMethod || null,
                shopId: orderId.shopId || orderId.shop?._id || null
            }
        }
        return { id: orderId, paymentMethod: null, shopId: null }
    }

    const orderData = validateOrderData()

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true)
            setIsLoaded(true)
            fetchReasons()
            // ✅ Reset state when modal opens
            setSelectedReason('')
            setNote('')
            setStep(1)
            setReasonsError(null)
        } else {
            setIsVisible(false)
        }
    }, [isOpen])

    const fetchReasons = async () => {
        setLoading(true)
        setReasonsError(null)
        try {
            const result = await axios.get(`${serverUrl}/api/order/cancellation-reasons`, {
                withCredentials: true
            })
            if (result.data && result.data.length > 0) {
                setReasons(result.data)
            } else {
                // ✅ Use fallback if API returns empty
                setReasons(FALLBACK_REASONS)
            }
        } catch (error) {
            console.log('❌ Fetch reasons error:', error)
            setReasonsError(error.response?.data?.message || 'Failed to load reasons')
            // ✅ Use fallback reasons
            setReasons(FALLBACK_REASONS)
            toast.warning('Using default reasons')
        } finally {
            setLoading(false)
        }
    }

    // ✅ Retry fetching reasons
    const handleRetryReasons = () => {
        setIsRetrying(true)
        fetchReasons().finally(() => setIsRetrying(false))
    }

    const handleSubmit = async () => {
        if (!selectedReason) {
            toast.error('Please select a reason')
            return
        }

        if (note && note.length > 500) {
            toast.error('Note should be less than 500 characters')
            return
        }

        setSubmitting(true)
        try {
            const result = await axios.post(
                `${serverUrl}/api/order/cancel/${orderData.id}`,
                {
                    reason: selectedReason,
                    note: note || ''
                },
                { withCredentials: true }
            )
            
            // ✅ Emit socket event for real-time update
            if (socket && socket.connected) {
                socket.emit('order-cancelled', {
                    orderId: orderData.id,
                    shopId: orderData.shopId,
                    userId: result.data.order?.userId
                })
                console.log('📡 Order cancellation emitted via socket')
            }
            
            toast.success('Order cancelled successfully! 🗑️', {
                position: "top-center",
                autoClose: 3000,
            })
            
            if (onCancelled) onCancelled(result.data.order)
            handleClose()
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to cancel order'
            toast.error(errorMsg, {
                position: "top-center",
                autoClose: 3000,
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        setIsVisible(false)
        setTimeout(() => {
            if (onClose) onClose()
        }, 300)
    }

    // ✅ Handle ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) {
                handleClose()
            }
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [isOpen])

    const fadeUp = `transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-2xl flex items-center justify-center z-[99999] p-4"
                    onClick={handleClose}
                >
                    {/* Animated Background Particles */}
                    <div className='absolute inset-0 pointer-events-none overflow-hidden'>
                        <motion.div 
                            animate={{ x: [0, 80, -40, 0], y: [0, -40, 60, 0] }}
                            transition={{ duration: 25, repeat: Infinity }}
                            className='absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl'
                        />
                        <motion.div 
                            animate={{ x: [0, -60, 40, 0], y: [0, 60, -40, 0] }}
                            transition={{ duration: 30, repeat: Infinity }}
                            className='absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl'
                        />
                        <motion.div 
                            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                            transition={{ duration: 15, repeat: Infinity }}
                            className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl'
                        />
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="relative w-full max-w-md bg-[#13121A] rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-[#181722] p-5 sm:p-6 border-b border-white/[0.08]">
                            <button 
                                className="absolute top-4 right-4 text-white/40 hover:text-white transition w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10"
                                onClick={handleClose}
                            >
                                <FaTimes size={15} />
                            </button>

                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-md">
                                    <FaTrashAlt size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white tracking-tight">
                                        Cancel Order
                                    </h2>
                                    <p className="text-gray-400 text-xs">
                                        Order #{orderData.id ? orderData.id.slice(-8).toUpperCase() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                            {/* Content */}
                            <div className='p-4 sm:p-6'>
                                {loading ? (
                                    <div className='flex flex-col items-center justify-center py-8 sm:py-12 gap-4'>
                                        <div className='relative'>
                                            <ClipLoader size={36} className="sm:w-10 sm:h-10" color="#ff2d55" />
                                            <div className='absolute inset-0 animate-ping rounded-full border-2 border-[#ff2d55]/20' />
                                        </div>
                                        <p className='text-white/30 text-xs sm:text-sm'>Loading reasons...</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* ✅ Error state for reasons */}
                                        {reasonsError && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className='bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 flex items-center justify-between'
                                            >
                                                <p className='text-red-400 text-xs'>{reasonsError}</p>
                                                <button
                                                    onClick={handleRetryReasons}
                                                    disabled={isRetrying}
                                                    className='text-red-400 text-xs hover:text-red-300 transition flex items-center gap-1'
                                                >
                                                    {isRetrying ? (
                                                        <FaSpinner className='animate-spin' size={12} />
                                                    ) : (
                                                        'Retry'
                                                    )}
                                                </button>
                                            </motion.div>
                                        )}

                                        {/* Step Indicator */}
                                        <div className='flex items-center gap-2 mb-4 sm:mb-6'>
                                            <div className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                                                step >= 1 ? 'bg-[#FF6B00]' : 'bg-white/10'
                                            }`} />
                                            <div className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                                                step >= 2 ? 'bg-[#FF6B00]' : 'bg-white/10'
                                            }`} />
                                        </div>

                                        {/* Step 1: Confirm */}
                                        {step === 1 && (
                                            <motion.div 
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className='space-y-4'
                                            >
                                                <div className='text-center'>
                                                    <motion.div 
                                                        animate={{ scale: [1, 1.05, 1] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                        className='w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full bg-red-500/10 flex items-center justify-center border-2 border-red-500/30'
                                                    >
                                                        <FaFrown className='text-red-400 text-2xl sm:text-3xl' />
                                                    </motion.div>
                                                    <h3 className='text-base sm:text-lg font-semibold text-white'>
                                                        Are you sure?
                                                    </h3>
                                                    <p className='text-white/40 text-xs sm:text-sm mt-1'>
                                                        This action cannot be undone
                                                    </p>
                                                </div>

                                                {/* Warning Box */}
                                                <div className='bg-amber-500/10 border border-amber-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4'>
                                                    <div className='flex items-start gap-2 sm:gap-3'>
                                                        <div className='w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0'>
                                                            <MdWarning className='text-yellow-400 text-xs sm:text-sm' />
                                                        </div>
                                                        <div>
                                                            <p className='text-yellow-400 text-xs sm:text-sm font-medium'>
                                                                Order will be cancelled
                                                            </p>
                                                            <p className='text-yellow-400/60 text-[10px] sm:text-xs mt-0.5 sm:mt-1'>
                                                                {orderData.paymentMethod === 'online' 
                                                                    ? '💳 Refund will be processed back to your original payment method automatically'
                                                                    : '💰 No refund applicable for COD orders'
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className='flex flex-col gap-2'>
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => setStep(2)}
                                                        className='w-full py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-all duration-300 shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer'
                                                    >
                                                        Continue
                                                        <FaArrowRight size={12} className="sm:text-sm" />
                                                    </motion.button>

                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={handleClose}
                                                        className='w-full py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border border-white/10 text-white/60 font-medium hover:bg-white/5 hover:text-white transition-all duration-300 text-sm sm:text-base cursor-pointer'
                                                    >
                                                        Keep My Order
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Step 2: Reason */}
                                        {step === 2 && (
                                            <motion.div 
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className='space-y-3 sm:space-y-4'
                                            >
                                                <button
                                                    onClick={() => setStep(1)}
                                                    className='text-white/30 hover:text-white/50 text-[10px] sm:text-xs flex items-center gap-1 transition'
                                                >
                                                    ← Back
                                                </button>

                                                <div>
                                                    <label className='block text-white/40 text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-1.5 sm:mb-2'>
                                                        Why are you cancelling?
                                                        <span className='text-red-400'>*</span>
                                                    </label>
                                                    <div className='space-y-1.5 sm:space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar'>
                                                        {reasons.map((reason) => (
                                                            <motion.div
                                                                key={reason.value}
                                                                whileHover={{ scale: 1.01 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                className={`p-2.5 sm:p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                                                                    selectedReason === reason.value
                                                                        ? 'border-red-500/50 bg-red-500/10 shadow-lg shadow-red-500/10'
                                                                        : 'border-white/10 hover:border-white/20 bg-white/5'
                                                                }`}
                                                                onClick={() => setSelectedReason(reason.value)}
                                                            >
                                                                <div className='flex items-center gap-2 sm:gap-3'>
                                                                    <span className='text-lg sm:text-xl'>{reason.icon}</span>
                                                                    <span className='text-white text-xs sm:text-sm'>{reason.label}</span>
                                                                    {selectedReason === reason.value && (
                                                                        <motion.div 
                                                                            initial={{ scale: 0 }}
                                                                            animate={{ scale: 1 }}
                                                                            className='ml-auto w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-500 flex items-center justify-center'
                                                                        >
                                                                            <FaTimes size={8} className="sm:text-[10px] text-white" />
                                                                        </motion.div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className='block text-white/40 text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-1.5'>
                                                        Additional Note <span className='text-white/20'>(Optional)</span>
                                                    </label>
                                                    <div className='relative'>
                                                        <textarea
                                                            className='w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white text-xs sm:text-sm focus:outline-none focus:border-red-500/50 transition-all duration-300 min-h-[60px] sm:min-h-[70px] resize-none placeholder:text-white/20'
                                                            placeholder='Tell us more... (max 500 characters)'
                                                            value={note}
                                                            onChange={(e) => {
                                                                if (e.target.value.length <= 500) {
                                                                    setNote(e.target.value)
                                                                }
                                                            }}
                                                            maxLength={500}
                                                        />
                                                        <div className='flex items-center justify-between mt-1'>
                                                            <FaComment className='text-white/10 text-xs sm:text-sm' />
                                                            <span className={`text-[8px] sm:text-[10px] ${note.length > 450 ? 'text-yellow-400' : 'text-white/20'}`}>
                                                                {note.length}/500
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className='flex gap-2 sm:gap-3'>
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className='flex-1 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-all duration-300 shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-50 text-xs sm:text-sm cursor-pointer'
                                                        onClick={handleSubmit}
                                                        disabled={submitting || !selectedReason}
                                                    >
                                                        {submitting ? (
                                                            <ClipLoader size={16} className="sm:w-5 sm:h-5" color='white' />
                                                        ) : (
                                                            <>
                                                                <FaBan size={12} className="sm:text-sm" />
                                                                Cancel Order
                                                            </>
                                                        )}
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className='px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl border border-white/10 text-white/40 font-medium hover:bg-white/5 hover:text-white/60 transition-all duration-300 text-xs sm:text-sm'
                                                        onClick={handleClose}
                                                    >
                                                        Close
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Footer */}
                            <div className='px-4 sm:px-6 py-2.5 sm:py-3 border-t border-white/5 bg-white/[0.02]'>
                                <p className='text-white/10 text-[8px] sm:text-[10px] flex items-center justify-center gap-1'>
                                    <FaInfoCircle size={8} className="sm:text-[10px]" />
                                    This action is permanent and cannot be reversed
                                </p>
                            </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default CancelOrderModal