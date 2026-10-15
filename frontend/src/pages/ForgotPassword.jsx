import React, { useState, useEffect } from 'react'
// ✅ FIXED: Correct import
import { serverUrl } from '../../config'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClipLoader } from "react-spinners"
import { MdMail } from "react-icons/md";
import { 
    FaKey, FaLock, FaArrowRight, FaCheckCircle, 
    FaShieldAlt, FaBolt, FaEnvelope, FaMotorcycle,
    FaArrowLeft, FaRocket, FaStar, FaSync
} from "react-icons/fa";
import { toast } from "react-toastify";
import { motion } from 'framer-motion';

function ForgotPassword() {
    const [step, setStep] = useState(1)
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const navigate = useNavigate()
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [err, setErr] = useState("")
    const [loading, setLoading] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [timer, setTimer] = useState(0)
    const [canResend, setCanResend] = useState(true)

    // ✅ OTP LENGTH - Change from 6 to 4
    const OTP_LENGTH = 4  // ✅ Changed from 6 to 4

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 200)
    }, [])

    // ✅ Countdown timer for resend
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => prev - 1)
            }, 1000)
            return () => clearInterval(interval)
        } else {
            setCanResend(true)
        }
    }, [timer])

    // ✅ Auto-submit OTP when correct length is entered
    useEffect(() => {
        if (otp.length === OTP_LENGTH && step === 2) {
            handleVerifyOtp()
        }
    }, [otp, step])

    // ✅ Password strength checker
    const getPasswordStrength = (pass) => {
        if (!pass) return { score: 0, label: '', color: '', bar: '' }
        let score = 0
        if (pass.length >= 6) score++
        if (pass.length >= 10) score++
        if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++
        if (/\d/.test(pass)) score++
        if (/[^A-Za-z0-9]/.test(pass)) score++
        
        const map = {
            0: { label: 'Weak', color: 'text-red-400', bar: 'bg-red-400' },
            1: { label: 'Weak', color: 'text-red-400', bar: 'bg-red-400' },
            2: { label: 'Fair', color: 'text-yellow-400', bar: 'bg-yellow-400' },
            3: { label: 'Good', color: 'text-blue-400', bar: 'bg-blue-400' },
            4: { label: 'Strong', color: 'text-green-400', bar: 'bg-green-400' },
            5: { label: 'Very Strong', color: 'text-emerald-400', bar: 'bg-emerald-400' }
        }
        return { score, ...map[score] }
    }

    const strength = getPasswordStrength(newPassword)

    const handleSendOtp = async () => {
        if (!email) {
            setErr('Email is required')
            return
        }

        setLoading(true)
        setErr('')
        
        try {
            await axios.post(`${serverUrl}/api/auth/send-otp`, { email },
                { withCredentials: true })
            
            setErr("")
            setStep(2)
            setTimer(60)
            setCanResend(false)
            setLoading(false)

            toast.success("OTP sent successfully to your email! 📩", {
                position: "top-center",
                autoClose: 3000,
            })
        } catch (error) {
            setErr(error?.response?.data?.message || "Failed to send OTP")
            setLoading(false)
            toast.error(error?.response?.data?.message || "Failed to send OTP!", {
                position: "top-center",
                autoClose: 3000,
            })
        }
    }

    const handleVerifyOtp = async () => {
        // ✅ Changed from 6 to OTP_LENGTH
        if (!otp || otp.length !== OTP_LENGTH) {
            setErr(`Please enter a valid ${OTP_LENGTH}-digit OTP`)
            return
        }

        setLoading(true)
        try {
            await axios.post(`${serverUrl}/api/auth/verify-otp`, { email, otp },
                { withCredentials: true })
            
            setErr("")
            setStep(3)
            setLoading(false)
            
            toast.success("OTP verified successfully! ✅", {
                position: "top-center",
                autoClose: 3000,
            })
        } catch (error) {
            setErr(error?.response?.data?.message || "Invalid OTP")
            setLoading(false)
            toast.error(error?.response?.data?.message || "Invalid OTP!", {
                position: "top-center",
                autoClose: 3000,
            })
        }
    }

    const handleResendOtp = async () => {
        if (!canResend) return
        setLoading(true)
        setErr('')
        setOtp('')
        
        try {
            await axios.post(`${serverUrl}/api/auth/send-otp`, { email },
                { withCredentials: true })
            
            toast.success("OTP resent successfully! 📩", {
                position: "top-center",
                autoClose: 3000,
            })
            setTimer(60)
            setCanResend(false)
            setLoading(false)
        } catch (error) {
            setErr(error?.response?.data?.message || "Failed to resend OTP")
            setLoading(false)
            toast.error(error?.response?.data?.message || "Failed to resend OTP!", {
                position: "top-center",
                autoClose: 3000,
            })
        }
    }

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match!", {
                position: "top-center",
                autoClose: 3000,
            })
            return
        }
        if (newPassword.length < 6) {
            toast.error("Password must have at least 6 characters!", {
                position: "top-center",
                autoClose: 3000,
            })
            return
        }

        setLoading(true)
        try {
            await axios.post(`${serverUrl}/api/auth/reset-password`, { email, newPassword },
                { withCredentials: true })
            
            setErr("")
            setLoading(false)

            toast.success("Password reset successfully! 🎉", {
                position: "top-center",
                autoClose: 3000,
            })

            setTimeout(() => {
                navigate("/signin")
            }, 2000)
        } catch (error) {
            setErr(error?.response?.data?.message || "Failed to reset password!")
            setLoading(false)
            toast.error(error?.response?.data?.message || "Failed to reset password!", {
                position: "top-center",
                autoClose: 3000,
            })
        }
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const fadeUp = `transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`

    return (
        <div className='min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden'>
            
            {/* Animated Background Orbs */}
            <div className='absolute inset-0 pointer-events-none'>
                <div className='absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#ff2d55]/6 rounded-full blur-3xl animate-float-3d' />
                <div className='absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#ff6b35]/6 rounded-full blur-3xl animate-float-3d animation-delay-300' />
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ffd93d]/4 rounded-full blur-3xl animate-float-3d animation-delay-600' />
            </div>

            {/* Main Card */}
            <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, type: "spring" }}
                className={`glass-premium-ultra rounded-3xl p-6 sm:p-8 max-w-md w-full border border-white/10 shadow-2xl shadow-[#ff2d55]/10 ${fadeUp}`}
            >
                
                {/* Logo & Back Button */}
                <div className='flex items-center gap-3 mb-6'>
                    <motion.button 
                        whileHover={{ scale: 1.05, rotate: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className='w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all duration-300 border border-white/10 group'
                        onClick={() => navigate("/signin")}
                    >
                        <IoIosArrowRoundBack size={28} className='text-white/60 group-hover:text-white transition' />
                    </motion.button>
                    <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center shadow-lg shadow-[#ff2d55]/25'>
                            <FaMotorcycle className='text-white text-xl' />
                        </div>
                        <div>
                            <h1 className='text-xl font-bold text-white tracking-tight'>Cravely</h1>
                            <p className='text-[7px] text-white/30 tracking-[0.2em] uppercase'>🔐 Reset Password</p>
                        </div>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className='flex items-center gap-2 mb-6'>
                    {[1, 2, 3].map((s) => (
                        <div key={s} className='flex items-center gap-2'>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                s === step 
                                    ? 'bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white shadow-lg shadow-[#ff2d55]/30 scale-110' 
                                    : s < step 
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                    : 'bg-white/5 text-white/30 border border-white/10'
                            }`}>
                                {s < step ? <FaCheckCircle size={14} /> : s}
                            </div>
                            {s < 3 && (
                                <div className={`w-8 h-0.5 rounded-full ${
                                    s < step ? 'bg-green-500/30' : 'bg-white/10'
                                }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step 1 - Email */}
                {step === 1 && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <h2 className='text-xl font-bold text-white mb-1'>Forgot Password</h2>
                        <p className='text-white/40 text-sm mb-5'>
                            Enter your email and we'll send you a password reset OTP
                        </p>

                        <div className="mb-4">
                            <label className="block text-white/50 text-xs font-medium mb-1.5 tracking-wider">EMAIL</label>
                            <div className="flex items-center glass-input rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-[#ff6b35]/50 transition-all duration-300">
                                <MdMail className="text-white/30 mr-3 text-lg" />
                                <input
                                    type="email"
                                    className="flex-1 bg-transparent focus:outline-none text-white placeholder:text-white/30 text-sm"
                                    placeholder="Enter your email"
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                    required
                                />
                            </div>
                        </div>

                        {err && (
                            <motion.p 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className='text-red-400 text-xs bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20 mb-3'
                            >
                                *{err}
                            </motion.p>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            className='w-full btn-neon py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 group'
                            onClick={handleSendOtp}
                            disabled={loading}
                        >
                            {loading ? (
                                <ClipLoader size={20} color='white' />
                            ) : (
                                <>
                                    <FaEnvelope size={14} />
                                    Send OTP
                                    <FaArrowRight size={14} className='group-hover:translate-x-1 transition-transform duration-300' />
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                )}

                {/* Step 2 - OTP Verification - FIXED for 4-digit OTP */}
                {step === 2 && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <h2 className='text-xl font-bold text-white mb-1'>Enter OTP</h2>
                        <p className='text-white/40 text-sm mb-5'>
                            OTP sent to <span className='text-[#ff6b35] font-medium'>{email}</span>
                        </p>

                        <div className="mb-4">
                            <label className="block text-white/50 text-xs font-medium mb-1.5 tracking-wider">OTP CODE</label>
                            <div className="flex items-center glass-input rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-[#ff6b35]/50 transition-all duration-300">
                                <FaKey className="text-white/30 mr-3 text-lg" />
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    className="flex-1 bg-transparent focus:outline-none text-white placeholder:text-white/30 text-center text-2xl tracking-[0.3em] font-mono"
                                    // ✅ Changed placeholder to 4-digit
                                    placeholder={`Enter ${OTP_LENGTH}-digit OTP`}
                                    // ✅ Changed maxLength to 4
                                    maxLength={OTP_LENGTH}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    value={otp}
                                    autoFocus
                                />
                            </div>
                            <p className='text-white/20 text-[10px] mt-1 text-center'>
                                📧 {OTP_LENGTH}-digit OTP sent to your email
                            </p>
                        </div>

                        {err && (
                            <motion.p 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className='text-red-400 text-xs bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20 mb-3'
                            >
                                *{err}
                            </motion.p>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            className='w-full btn-neon py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 group'
                            onClick={handleVerifyOtp}
                            // ✅ Changed condition to OTP_LENGTH
                            disabled={loading || otp.length < OTP_LENGTH}
                        >
                            {loading ? (
                                <ClipLoader size={20} color='white' />
                            ) : (
                                <>
                                    <FaCheckCircle size={14} />
                                    Verify OTP
                                    <FaArrowRight size={14} className='group-hover:translate-x-1 transition-transform duration-300' />
                                </>
                            )}
                        </motion.button>

                        {/* Resend OTP with Timer */}
                        <div className='flex items-center justify-between mt-3'>
                            <button
                                className='text-white/40 hover:text-white transition-all duration-300 text-xs flex items-center gap-1'
                                onClick={() => { setStep(1); setErr('') }}
                            >
                                <FaArrowLeft size={10} /> Back to email
                            </button>
                            
                            <button
                                className={`text-xs flex items-center gap-1 transition-all duration-300 ${
                                    canResend 
                                        ? 'text-[#ff6b35] hover:text-[#ff7a45] hover:scale-105' 
                                        : 'text-white/30 cursor-not-allowed'
                                }`}
                                onClick={handleResendOtp}
                                disabled={!canResend || loading}
                            >
                                {!canResend ? (
                                    <>
                                        <FaSync size={10} className={loading ? 'animate-spin' : ''} />
                                        Resend in {formatTime(timer)}
                                    </>
                                ) : (
                                    <>
                                        <FaSync size={10} />
                                        Resend OTP
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 3 - Reset Password */}
                {step === 3 && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <h2 className='text-xl font-bold text-white mb-1'>Reset Password</h2>
                        <p className='text-white/40 text-sm mb-5'>
                            Enter your new password
                        </p>

                        <div className="mb-4">
                            <label className="block text-white/50 text-xs font-medium mb-1.5 tracking-wider">NEW PASSWORD</label>
                            <div className="flex items-center glass-input rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-[#ff6b35]/50 transition-all duration-300">
                                <FaLock className="text-white/30 mr-3 text-lg" />
                                <input
                                    type="password"
                                    className="flex-1 bg-transparent focus:outline-none text-white placeholder:text-white/30 text-sm"
                                    placeholder="Enter new password"
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    value={newPassword}
                                    required
                                />
                            </div>
                            {newPassword && (
                                <div className='mt-2 space-y-1'>
                                    <div className='flex gap-1 h-1'>
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div 
                                                key={i}
                                                className={`flex-1 rounded-full transition-all duration-500 ${
                                                    i <= strength.score ? strength.bar : 'bg-white/10'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <p className={`text-[10px] ${strength.color}`}>{strength.label}</p>
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-white/50 text-xs font-medium mb-1.5 tracking-wider">CONFIRM PASSWORD</label>
                            <div className="flex items-center glass-input rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-[#ff6b35]/50 transition-all duration-300">
                                <FaLock className="text-white/30 mr-3 text-lg" />
                                <input
                                    type="password"
                                    className="flex-1 bg-transparent focus:outline-none text-white placeholder:text-white/30 text-sm"
                                    placeholder="Confirm new password"
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    value={confirmPassword}
                                    required
                                />
                            </div>
                            {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                <p className='text-red-400 text-[10px] mt-1'>❌ Passwords do not match</p>
                            )}
                            {newPassword && confirmPassword && newPassword === confirmPassword && (
                                <p className='text-green-400 text-[10px] mt-1'>✅ Passwords match</p>
                            )}
                        </div>

                        {err && (
                            <motion.p 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className='text-red-400 text-xs bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20 mb-3'
                            >
                                *{err}
                            </motion.p>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            className='w-full btn-neon py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 group'
                            onClick={handleResetPassword}
                            disabled={loading || !newPassword || newPassword !== confirmPassword}
                        >
                            {loading ? (
                                <ClipLoader size={20} color='white' />
                            ) : (
                                <>
                                    <FaRocket size={14} />
                                    Reset Password
                                    <FaArrowRight size={14} className='group-hover:translate-x-1 transition-transform duration-300' />
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                )}

                {/* Divider */}
                <div className='flex items-center gap-3 my-5'>
                    <div className='flex-1 h-px bg-white/10' />
                    <span className='text-white/20 text-[10px]'>Secure</span>
                    <div className='flex-1 h-px bg-white/10' />
                </div>

                {/* Footer */}
                <div className='text-center'>
                    <span className='text-white/30 text-xs'>Remember your password? </span>
                    <span 
                        className='text-[#ff6b35] font-medium text-xs hover:underline cursor-pointer transition'
                        onClick={() => navigate('/signin')}
                    >
                        Sign In
                    </span>
                </div>

                {/* Trust Badges */}
                <div className='flex justify-center gap-4 mt-4 text-white/20 text-[10px]'>
                    <span className='flex items-center gap-1'>
                        <FaShieldAlt size={10} className='text-green-400' /> Secure
                    </span>
                    <span className='flex items-center gap-1'>
                        <FaBolt size={10} className='text-yellow-400' /> Fast
                    </span>
                    <span className='flex items-center gap-1'>
                        <FaStar size={10} className='text-yellow-400' /> Trusted
                    </span>
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
                    background: rgba(255, 255, 255, 0.04);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }

                .glass-input {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    transition: all 0.3s ease;
                }
                .glass-input:focus-within {
                    border-color: rgba(255, 107, 53, 0.3);
                    box-shadow: 0 0 25px rgba(255, 107, 53, 0.15);
                }

                .btn-neon {
                    background: linear-gradient(135deg, #ff2d55, #ff6b35);
                    color: white;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 0 30px rgba(255, 45, 85, 0.15);
                }
                .btn-neon:hover {
                    transform: translateY(-2px) scale(1.01);
                    box-shadow: 0 0 50px rgba(255, 45, 85, 0.25);
                }
                .btn-neon:disabled {
                    opacity: 0.7;
                    transform: none;
                }
            `}</style>
        </div>
    )
}

export default ForgotPassword