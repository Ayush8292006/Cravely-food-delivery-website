import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'
import { toast } from 'react-toastify'
import { ClipLoader } from 'react-spinners'
import { 
    FaArrowLeft, FaLock, FaEnvelope, FaBolt, FaArrowRight,
    FaShieldAlt, FaCrown, FaUserShield, FaDatabase,
    FaChartLine, FaUsers, FaStore, FaUtensils, FaMotorcycle
} from "react-icons/fa"
import { MdMail, MdVerified } from "react-icons/md"
import { RiLockPasswordFill } from "react-icons/ri"
import { motion } from 'framer-motion'

function SuperAdminLogin() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [email, setEmail] = useState('contact.cravely@gmail.com')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState('')
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        setIsVisible(true)
    }, [])

    const handleLogin = async () => {
        setLoading(true)
        setErr('')
        try {
            const result = await axios.post(`${serverUrl}/api/auth/signin`, {
                email,
                password
            }, { withCredentials: true })
            
            if (result.data.role !== 'superAdmin') {
                toast.error('Not authorized as Super Admin')
                setLoading(false)
                return
            }
            
            dispatch(setUserData(result.data))
            toast.success('Super Admin logged in! 🎉')
            setLoading(false)
            navigate('/admin/dashboard')
        } catch (error) {
            setErr(error.response?.data?.message || 'Login failed')
            toast.error(error.response?.data?.message || 'Login failed')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
            
            {/* ✅ Animated Background Orbs */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-[#ff2d55]/8 rounded-full blur-3xl animate-float-3d" />
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#ff6b35]/10 rounded-full blur-3xl animate-float-3d animation-delay-300" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ffd93d]/5 rounded-full blur-3xl animate-float-3d animation-delay-600" />
                <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-[#ff2d55]/5 rounded-full blur-2xl animate-float-3d animation-delay-900" />
                <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-[#ff6b35]/5 rounded-full blur-2xl animate-float-3d animation-delay-1200" />
            </div>

            {/* ✅ Back Button - Premium */}
            <motion.button 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => navigate('/')}
                className="fixed top-6 left-6 z-50 glass-premium px-4 py-2.5 rounded-full text-white/70 hover:text-white transition-all duration-300 flex items-center gap-2 text-sm hover:scale-105 hover:shadow-lg hover:shadow-[#ff2d55]/10 border border-white/5"
            >
                <FaArrowLeft size={14} />
                <span className="hidden sm:inline">Back to Home</span>
            </motion.button>

            {/* ✅ Main Container */}
            <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, type: "spring" }}
                className={`w-full max-w-5xl min-h-[550px] rounded-3xl overflow-hidden shadow-2xl shadow-[#ff2d55]/10 flex flex-col md:flex-row relative transition-all duration-700 ease-out ${
                    isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
                }`}
            >
                
                {/* ✅ Left Side - Admin Image */}
                <div className="hidden md:flex md:w-1/2 relative flex-col justify-between min-h-[550px] group overflow-hidden">
                    <div className="absolute inset-0 transition-transform duration-700 ease-in-out group-hover:scale-105">
                        <img 
                            src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=800&fit=crop" 
                            alt="Admin Dashboard" 
                            className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/35 to-black/60" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#ff2d55]/10 to-[#ff6b35]/10 mix-blend-overlay" />
                    </div>

                    {/* ✅ Floating Badges */}
                    <div className="absolute top-4 left-6 right-6 flex justify-between z-10">
                        {[
                            { icon: <FaLock className="text-[#ff6b35]" />, label: 'Secure' },
                            { icon: <FaEnvelope className="text-yellow-400" />, label: 'Verified' },
                            { icon: <FaBolt className="text-[#ff2d55]" />, label: 'Admin' }
                        ].map((item, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (idx * 0.1) }}
                                className="glass-premium px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl flex items-center gap-1.5 sm:gap-2 text-white text-[10px] sm:text-sm border border-white/10 animate-float"
                                style={{ animationDelay: `${idx * 0.2}s` }}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* ✅ Content */}
                    <div className="relative z-10 p-8 sm:p-10 flex flex-col justify-end min-h-[550px] pb-12 sm:pb-16">
                        <div className="absolute top-10 sm:top-12 left-8 sm:left-10">
                            <motion.h1 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-3xl sm:text-5xl font-bold text-white mb-0.5"
                            >
                                Cravely
                            </motion.h1>
                            <motion.p 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="text-gradient-hero text-base sm:text-lg tracking-wider uppercase"
                            >
                                Admin Panel
                            </motion.p>
                        </div>
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mb-4"
                        >
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3 leading-tight flex items-center gap-2">
                                Welcome Admin! 👑
                            </h2>
                            <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-xs">
                                Manage users, restaurants, orders, and everything else from one place.
                            </p>
                            <div className="mt-4 sm:mt-5 flex gap-2 sm:gap-3 flex-wrap">
                                {[
                                    { icon: <FaChartLine size={12} />, label: 'Dashboard' },
                                    { icon: <FaUsers size={12} />, label: 'Users' },
                                    { icon: <FaStore size={12} />, label: 'Shops' }
                                ].map((item, idx) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.7 + (idx * 0.1) }}
                                        className="glass-premium px-3 py-1 rounded-xl text-white text-[10px] sm:text-xs font-medium border border-white/10 flex items-center gap-1.5"
                                    >
                                        {item.icon} {item.label}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                        
                        <div className="absolute bottom-4 left-5 right-10">
                            <p className="text-white/20 text-[10px] sm:text-[11px]">© 2026 Cravely. All rights reserved.</p>
                        </div>
                    </div>
                </div>

                {/* ✅ Right Side - Admin Login Form */}
                <div className="w-full md:w-1/2 glass-form p-6 sm:p-8 md:p-10 overflow-y-auto max-h-[95vh] md:max-h-none">
                    <div className="max-w-md mx-auto">
                        
                        {/* ✅ Back Button - Inside Form (Mobile) */}
                        <div className="flex items-center justify-between mb-4">
                            <button 
                                onClick={() => navigate('/')}
                                className="md:hidden glass-premium px-3 py-1.5 rounded-full text-white/60 hover:text-white transition-all duration-300 flex items-center gap-1.5 text-xs hover:scale-105 border border-white/5"
                            >
                                <FaArrowLeft size={11} />
                                Back
                            </button>
                            <span className="text-[10px] text-white/20 flex items-center gap-1">
                                <FaShieldAlt size={10} className="text-green-400" /> Secure
                            </span>
                        </div>

                        {/* ✅ Mobile Logo */}
                        <div className="md:hidden text-center mb-4">
                            <h1 className="text-2xl font-bold text-gradient">Cravely</h1>
                            <p className="text-white/40 text-sm">Admin Login</p>
                        </div>

                        {/* ✅ Form Header */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 flex items-center gap-2">
                                👑 Admin Login
                                <FaCrown size={18} className="text-yellow-400" />
                            </h2>
                            <p className="text-white/40 text-sm mb-6">
                                Manage your platform with full control.
                            </p>
                        </motion.div>

                        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
                            
                            {/* ✅ Email */}
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="relative group"
                            >
                                <MdMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#ff6b35] transition-colors duration-300" size={18} />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    className="w-full glass-input pl-12 pr-4 py-3.5 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/50 transition-all duration-300 text-sm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </motion.div>

                            {/* ✅ Password */}
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="relative group"
                            >
                                <RiLockPasswordFill className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#ff6b35] transition-colors duration-300" size={18} />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full glass-input pl-12 pr-4 py-3.5 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/50 transition-all duration-300 text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </motion.div>

                            {err && (
                                <motion.p 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-red-400 text-xs text-center bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20"
                                >
                                    {err}
                                </motion.p>
                            )}

                            {/* ✅ Login Button */}
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                type="submit"
                                className="w-full btn-neon py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold group transition-all duration-300"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <ClipLoader size={18} color="white" />
                                        <span>Logging in...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaUserShield size={16} />
                                        Login as Admin
                                        <FaArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                                    </>
                                )}
                            </motion.button>

                            {/* ✅ Trust Section */}
                            <div className="flex justify-center gap-3 sm:gap-4 text-white/30 text-[10px] sm:text-xs py-1 flex-wrap">
                                <span className="flex items-center gap-1"><FaLock size={10} /> Secure</span>
                                <span className="flex items-center gap-1"><MdVerified size={10} className="text-blue-400" /> Verified</span>
                                <span className="flex items-center gap-1"><FaBolt size={10} className="text-yellow-400" /> Instant</span>
                            </div>

                            {/* ✅ Footer */}
                            <p className="text-center text-white/40 text-[10px] sm:text-xs">
                                Need help?{' '}
                                <span className="text-gradient cursor-pointer hover:opacity-80 transition" onClick={() => navigate('/contact')}>
                                    Contact Support
                                </span>
                            </p>
                        </form>
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
                .animation-delay-900 { animation-delay: 0.9s; }
                .animation-delay-1200 { animation-delay: 1.2s; }

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                }
                .animate-pulse {
                    animation: pulse 4s ease-in-out infinite;
                }

                .glass-form {
                    background: rgba(255, 255, 255, 0.04);
                    backdrop-filter: blur(18px);
                    -webkit-backdrop-filter: blur(18px);
                    border-left: 1px solid rgba(255, 255, 255, 0.06);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
                }

                .glass-premium {
                    background: rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }

                .glass-input {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    transition: all 0.3s ease;
                }
                .glass-input:focus {
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

                .text-gradient {
                    background: linear-gradient(135deg, #ff2d55, #ff6b35);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .text-gradient-hero {
                    background: linear-gradient(135deg, #ff6b35, #ffd93d);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
            `}</style>
        </div>
    )
}

export default SuperAdminLogin