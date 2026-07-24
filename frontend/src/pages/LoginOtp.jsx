import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'
import { toast } from 'react-toastify'
import { ClipLoader } from 'react-spinners'
import { 
    FaHamburger, FaMotorcycle, FaArrowLeft, FaArrowRight,
    FaEnvelope, FaKey, FaShieldAlt, FaCheckCircle,
    FaLock, FaMailBulk, FaRocket, FaStar, FaBolt
} from "react-icons/fa"
import { MdMail, MdVerified } from "react-icons/md"
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'
import { motion } from 'framer-motion'

function LoginOtp() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState('')
    const [isVisible, setIsVisible] = useState(false)

    useState(() => {
        setTimeout(() => setIsVisible(true), 200)
    }, [])

    const handleSendOtp = async () => {
        if (!email) {
            setErr('Email is required')
            return
        }

        setLoading(true)
        setErr('')
        
        try {
            const result = await axios.post(`${serverUrl}/api/auth/send-login-otp`, {
                email
            }, { withCredentials: true })
            
            toast.success(result.data.message)
            setStep(2)
            setLoading(false)
        } catch (error) {
            setErr(error.response?.data?.message || 'Failed to send OTP')
            setLoading(false)
            toast.error(error.response?.data?.message || 'Failed to send OTP')
        }
    }

    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            setErr('Please enter a valid 6-digit OTP')
            return
        }

        setLoading(true)
        setErr('')

        try {
            const result = await axios.post(`${serverUrl}/api/auth/verify-login-otp`, {
                email,
                otp
            }, { withCredentials: true })
            
            dispatch(setUserData(result.data.user))
            toast.success('Login successful! 🎉')
            setLoading(false)
            navigate('/')
        } catch (error) {
            setErr(error.response?.data?.message || 'Invalid OTP')
            setLoading(false)
            toast.error(error.response?.data?.message || 'Invalid OTP')
        }
    }

    const fadeUp = `transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`

    return (
        <div className='min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden'>
            
            {/* ✅ Animated Background Orbs */}
            <div className='absolute inset-0 pointer-events-none'>
                <div className='absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#ff2d55]/6 rounded-full blur-3xl animate-float-3d' />
                <div className='absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#ff6b35]/6 rounded-full blur-3xl animate-float-3d animation-delay-300' />
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ffd93d]/4 rounded-full blur-3xl animate-float-3d animation-delay-600' />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, type: "spring" }}
                className={`glass-premium-ultra rounded-3xl p-8 max-w-md w-full border border-white/10 shadow-2xl shadow-[#ff2d55]/10 ${fadeUp}`}
            >
                {/* ✅ Logo */}
                <div className='flex items-center gap-3 mb-6'>
                    <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center shadow-lg shadow-[#ff2d55]/25'>
                        <FaMotorcycle className='text-white text-2xl' />
                    </div>
                    <div>
                        <h1 className='text-2xl font-bold text-white tracking-tight'>Cravely</h1>
                        <p className='text-[8px] text-white/30 tracking-[0.2em] uppercase'>🔐 Secure Login</p>
                    </div>
                </div>

                <h2 className='text-xl font-bold text-white mb-1'>
                    {step === 1 ? 'Login with OTP' : 'Enter OTP'}
                </h2>
                <p className='text-white/40 text-sm mb-5'>
                    {step === 1 
                        ? 'Enter your email and we\'ll send you a login OTP'
                        : `OTP sent to ${email}`
                    }
                </p>

                {step === 1 ? (
                    <>
                        <div className="mb-4">
                            <label className="block text-white/50 text-xs font-medium mb-1.5 tracking-wider">EMAIL</label>
                            <div className="flex items-center glass-input rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-[#ff6b35]/50 transition-all duration-300">
                                <MdMail className="text-white/30 mr-3 group-focus-within:text-[#ff6b35]" />
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
                    </>
                ) : (
                    <>
                        <div className="mb-4">
                            <label className="block text-white/50 text-xs font-medium mb-1.5 tracking-wider">OTP CODE</label>
                            <div className="flex items-center glass-input rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-[#ff6b35]/50 transition-all duration-300">
                                <FaKey className="text-white/30 mr-3" />
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
                                📧 OTP sent to <span className='text-[#ff6b35]'>{email}</span>
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
                                    Verify & Login
                                    <FaArrowRight size={14} className='group-hover:translate-x-1 transition-transform duration-300' />
                                </>
                            )}
                        </motion.button>
                        
                        <button
                            className='w-full mt-2 text-white/40 hover:text-white transition-all duration-300 text-xs flex items-center justify-center gap-1'
                            onClick={() => { setStep(1); setOtp(''); setErr('') }}
                        >
                            <FaArrowLeft size={10} /> Back to email
                        </button>
                    </>
                )}

                {/* ✅ Divider */}
                <div className='flex items-center gap-3 my-5'>
                    <div className='flex-1 h-px bg-white/10' />
                    <span className='text-white/20 text-[10px]'>or</span>
                    <div className='flex-1 h-px bg-white/10' />
                </div>

                {/* ✅ Footer */}
                <div className='text-center'>
                    <span className='text-white/30 text-xs'>Have a password? </span>
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
                        <MdVerified size={10} className='text-blue-400' /> Verified
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

export default LoginOtp

