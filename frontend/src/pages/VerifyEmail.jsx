import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ClipLoader } from 'react-spinners'
import { 
    FaCheckCircle, FaTimesCircle, FaEnvelope, FaArrowRight,
    FaRocket, FaShieldAlt, FaStar, FaHome, FaSignInAlt
} from 'react-icons/fa'
import { motion } from 'framer-motion'
// ✅ ADD THIS IMPORT
import { serverUrl } from '../App'

function VerifyEmail() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setMessage('No verification token found')
                setLoading(false)
                return
            }

            try {
                // ✅ FIXED: Use serverUrl instead of hardcoded URL
                const response = await axios.get(
                    `${serverUrl}/api/auth/verify-email/${token}`,
                    { withCredentials: true }
                )
                setMessage(response.data.message)
                setSuccess(true)
            } catch (error) {
                setMessage(error.response?.data?.message || 'Verification failed')
                setSuccess(false)
            } finally {
                setLoading(false)
            }
        }

        verifyEmail()
    }, [token])

    if (loading) {
        return (
            <div className='min-h-screen bg-[#0a0a0f] flex flex-col justify-center items-center relative overflow-hidden'>
                {/* Background Orbs */}
                <div className='absolute inset-0 pointer-events-none'>
                    <div className='absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#ff2d55]/5 rounded-full blur-3xl' />
                    <div className='absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#ff6b35]/5 rounded-full blur-3xl' />
                </div>
                <div className='relative z-10 flex flex-col items-center gap-6'>
                    <div className='relative'>
                        <ClipLoader size={60} color="#ff2d55" />
                        <div className='absolute inset-0 animate-ping rounded-full border-2 border-[#ff2d55]/20' />
                        <div className='absolute inset-[-10px] rounded-full border border-[#ff6b35]/10 animate-spin-slow' />
                    </div>
                    <p className='text-white/60 text-sm animate-pulse flex items-center gap-2'>
                        <span className='w-1.5 h-1.5 rounded-full bg-[#ff2d55]/40 animate-pulse' />
                        Verifying your email...
                        <span className='w-1.5 h-1.5 rounded-full bg-[#ff6b35]/40 animate-pulse animation-delay-300' />
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-[#0a0a0f] flex flex-col justify-center items-center px-4 relative overflow-hidden'>
            
            {/* ✅ Background Orbs */}
            <div className='absolute inset-0 pointer-events-none'>
                <div className='absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#ff2d55]/5 rounded-full blur-3xl animate-float-3d' />
                <div className='absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#ff6b35]/5 rounded-full blur-3xl animate-float-3d animation-delay-300' />
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#ffd93d]/3 rounded-full blur-3xl animate-float-3d animation-delay-600' />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, type: "spring" }}
                className='relative z-10 w-full max-w-md'
            >
                <div className='glass-premium-ultra rounded-3xl p-8 border border-white/5 shadow-2xl shadow-black/50 relative overflow-hidden'>
                    
                    {/* ✅ Glow Effect */}
                    <div className='absolute -top-40 -right-40 w-60 h-60 bg-[#ff2d55]/10 rounded-full blur-3xl' />
                    <div className='absolute -bottom-40 -left-40 w-60 h-60 bg-[#ff6b35]/10 rounded-full blur-3xl' />
                    
                    {/* ✅ Icon & Header */}
                    <div className='relative z-10 text-center'>
                        <motion.div 
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className='mb-5'
                        >
                            {success ? (
                                <div className='w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center shadow-xl shadow-green-500/20'>
                                    <FaCheckCircle className='text-green-400 text-6xl' />
                                </div>
                            ) : (
                                <div className='w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30 flex items-center justify-center shadow-xl shadow-red-500/20'>
                                    <FaTimesCircle className='text-red-400 text-6xl' />
                                </div>
                            )}
                        </motion.div>

                        {success ? (
                            <>
                                <motion.h1 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className='text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2'
                                >
                                    ✅ Email Verified!
                                    <FaShieldAlt className='text-green-400 text-xl' />
                                </motion.h1>
                                <motion.p 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className='text-white/60 text-sm mb-2'
                                >
                                    {message}
                                </motion.p>
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className='flex items-center justify-center gap-2 text-xs text-white/30 mt-1'
                                >
                                    <FaEnvelope className='text-[#ff6b35]' />
                                    <span>Email verified successfully</span>
                                </motion.div>
                            </>
                        ) : (
                            <>
                                <motion.h1 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className='text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2'
                                >
                                    ❌ Verification Failed
                                </motion.h1>
                                <motion.p 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className='text-white/60 text-sm mb-2'
                                >
                                    {message}
                                </motion.p>
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className='flex items-center justify-center gap-2 text-xs text-white/30 mt-1'
                                >
                                    <FaTimesCircle className='text-red-400' />
                                    <span>Please try again or contact support</span>
                                </motion.div>
                            </>
                        )}
                    </div>

                    {/* ✅ Decorative Line */}
                    <div className='relative z-10 my-6'>
                        <div className='h-px bg-gradient-to-r from-transparent via-white/10 to-transparent' />
                        {success && (
                            <div className='absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center'>
                                <div className='w-2 h-2 rounded-full bg-green-400 animate-pulse' />
                            </div>
                        )}
                    </div>

                    {/* ✅ Action Buttons */}
                    <div className='relative z-10 flex flex-col gap-3'>
                        {success ? (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/signin')}
                                className='w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white font-semibold shadow-lg shadow-[#ff2d55]/25 hover:shadow-[#ff2d55]/40 transition-all duration-300 flex items-center justify-center gap-2 group'
                            >
                                <FaSignInAlt size={16} className="group-hover:rotate-12 transition-transform duration-300" />
                                <span>Go to Login</span>
                                <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                            </motion.button>
                        ) : (
                            <>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/')}
                                    className='w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white font-semibold shadow-lg shadow-[#ff2d55]/25 hover:shadow-[#ff2d55]/40 transition-all duration-300 flex items-center justify-center gap-2 group'
                                >
                                    <FaHome size={16} className="group-hover:rotate-12 transition-transform duration-300" />
                                    <span>Go to Home</span>
                                    <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/signin')}
                                    className='w-full py-3 rounded-2xl bg-white/5 text-white/60 hover:text-white font-medium transition-all duration-300 border border-white/10 hover:border-[#ff2d55]/30 flex items-center justify-center gap-2 group'
                                >
                                    <FaSignInAlt size={14} />
                                    <span>Try Login Again</span>
                                </motion.button>
                            </>
                        )}
                    </div>

                    {/* ✅ Footer */}
                    <div className='relative z-10 mt-6 pt-4 border-t border-white/5'>
                        <p className='text-[10px] text-white/20 text-center flex items-center justify-center gap-2'>
                            <span className='w-1 h-1 rounded-full bg-white/20' />
                            Cravely • Secure Verification
                            <span className='w-1 h-1 rounded-full bg-white/20' />
                            <FaStar className='text-yellow-400/30 text-[8px]' />
                        </p>
                    </div>
                </div>
            </motion.div>

            <style jsx>{`
                @keyframes float-3d {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(40px, -30px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-float-3d {
                    animation: float-3d 15s ease-in-out infinite;
                }
                .animation-delay-300 { animation-delay: 0.3s; }
                .animation-delay-600 { animation-delay: 0.6s; }

                .glass-premium-ultra {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }

                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
                .animate-pulse {
                    animation: pulse 2s ease-in-out infinite;
                }
                .animation-delay-300 { animation-delay: 0.3s; }
            `}</style>
        </div>
    )
}

export default VerifyEmail