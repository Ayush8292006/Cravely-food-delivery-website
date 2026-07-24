import React, { useState } from 'react'
import { serverUrl } from '../App'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClipLoader } from "react-spinners"
import { MdMail } from "react-icons/md";
import { 
    FaKey, FaLock, FaArrowRight, FaCheckCircle, 
    FaShieldAlt, FaBolt, FaEnvelope, FaMotorcycle,
    FaArrowLeft, FaRocket, FaStar
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

    React.useEffect(() => {
        setTimeout(() => setIsVisible(true), 200)
    }, [])

    const handleSendOtp = async () => {
        setLoading(true)
        try {
            const result = await axios.post(`${serverUrl}/api/auth/send-otp`, { email },
                { withCredentials: true })
            console.log(result)
            setErr("")
            setStep(2)
            setLoading(false)

            toast.success("OTP sent successfully to your email! 📩", {
                position: "top-center",
                autoClose: 2000,
            });
        } catch (error) {
            setErr(error?.response?.data?.message)
            setLoading(false)
            toast.error(error?.response?.data?.message || "Failed to send OTP!", {
                position: "top-center",
                autoClose: 2000,
            });
        }
    }

    const handleVerifyOtp = async () => {
        setLoading(true)
        try {
            const result = await axios.post(`${serverUrl}/api/auth/verify-otp`, { email, otp },
                { withCredentials: true })
            console.log(result)
            setErr("")
            setStep(3)
            setLoading(false)
            toast.success("OTP verified successfully! ✅", {
                position: "top-center",
                autoClose: 2000,
            });
        } catch (error) {
            setErr(error?.response?.data?.message)
            setLoading(false)
            toast.error(error?.response?.data?.message || "Invalid OTP!", {
                position: "top-center",
                autoClose: 2000,
            });
        }
    }

    const handleResetPassword = async () => {
        setLoading(true)
        if (newPassword !== confirmPassword) {
            setLoading(false)
            toast.error("Passwords do not match!", {
                position: "top-center",
                autoClose: 2000,
            });
            return null
        }
        if (newPassword.length < 6) {
            setLoading(false)
            toast.error("Password must have at least 6 characters!", {
                position: "top-center",
                autoClose: 2000,
            });
            return null
        }
        try {
            const result = await axios.post(`${serverUrl}/api/auth/reset-password`, { email, newPassword },
                { withCredentials: true })
            console.log(result)
            setErr("")
            setLoading(false)

            toast.success("Password reset successfully! 🎉", {
                position: "top-center",
                autoClose: 2000,
            });

            setTimeout(() => {
                navigate("/signin");
            }, 2000);
        } catch (error) {
            setErr(error?.response?.data?.message)
            setLoading(false)

            toast.error(error?.response?.data?.message || "Failed to reset password!", {
                position: "top-center",
                autoClose: 2000,
            });
        }
    }

    const fadeUp = `transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`

    return (
        <div className='min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden'>
            
            {/* ✅ Animated Background Orbs */}
            <div className='absolute inset-0 pointer-events-none'>
                <div className='absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#ff2d55]/6 rounded-full blur-3xl animate-float-3d' />
                <div className='absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#ff6b35]/6 rounded-full blur-3xl animate-float-3d animation-delay-300' />
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ffd93d]/4 rounded-full blur-3xl animate-float-3d animation-delay-600' />
            </div>

            {/* ✅ Main Card */}
            <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, type: "spring" }}
                className={`glass-premium-ultra rounded-3xl p-6 sm:p-8 max-w-md w-full border border-white/10 shadow-2xl shadow-[#ff2d55]/10 ${fadeUp}`}
            >
                
                {/* ✅ Logo & Back Button */}
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

                {/* ✅ Step Indicator */}
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

                {/* ✅ Step 1 - Email */}
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
                            className='w-full btn-neon py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300'
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

                {/* ✅ Step 2 - OTP Verification */}
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
                                    className="flex-1 bg-transparent focus:outline-none text-white placeholder:text-white/30 text-center text-2xl tracking-[0.3em] font-mono"
                                    placeholder="Enter 6-digit OTP"
                                    maxLength="6"
                                    onChange={(e) => setOtp(e.target.value)}
                                    value={otp}
                                />
                            </div>
                            <p className='text-white/20 text-[10px] mt-1 text-center'>
                                📧 OTP sent to your email
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
                            className='w-full btn-neon py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300'
                            onClick={handleVerifyOtp}
                            disabled={loading}
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

                        <button
                            className='w-full mt-2 text-white/40 hover:text-white transition-all duration-300 text-xs flex items-center justify-center gap-1'
                            onClick={() => { setStep(1); setErr('') }}
                        >
                            <FaArrowLeft size={10} /> Back to email
                        </button>
                    </motion.div>
                )}

                {/* ✅ Step 3 - Reset Password */}
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
                            className='w-full btn-neon py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300'
                            onClick={handleResetPassword}
                            disabled={loading}
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

                {/* ✅ Divider */}
                <div className='flex items-center gap-3 my-5'>
                    <div className='flex-1 h-px bg-white/10' />
                    <span className='text-white/20 text-[10px]'>Secure</span>
                    <div className='flex-1 h-px bg-white/10' />
                </div>

                {/* ✅ Footer */}
                <div className='text-center'>
                    <span className='text-white/30 text-xs'>Remember your password? </span>
                    <span 
                        className='text-[#ff6b35] font-medium text-xs hover:underline cursor-pointer transition'
                        onClick={() => navigate('/signin')}
                    >
                        Sign In
                    </span>
                </div>

                {/* ✅ Trust Badges */}
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