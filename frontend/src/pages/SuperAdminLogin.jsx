import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
// ✅ FIXED: serverUrl import
import { serverUrl } from '../../config'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'
import { toast } from 'react-toastify'
import { ClipLoader } from 'react-spinners'
import { 
  FaArrowLeft, FaLock, FaShieldAlt, FaUserShield, 
  FaArrowRight, FaChartLine, FaUsers, FaStore 
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

  const handleLogin = async () => {
    setLoading(true)
    setErr('')
    try {
      const result = await axios.post(`${serverUrl}/api/auth/signin`, {
        email,
        password
      }, { withCredentials: true })
      
      // ✅ Security check
      if (result.data.role !== 'superAdmin') {
        toast.error('Not authorized as Super Admin', {
          position: "top-center",
          autoClose: 2000,
        })
        setLoading(false)
        return
      }
      
      // ✅ Store user data
      dispatch(setUserData(result.data))
      localStorage.setItem('userData', JSON.stringify(result.data))
      
      toast.success('Welcome Super Admin!', {
        position: "top-center",
        autoClose: 2000,
      })
      
      setLoading(false)
      navigate('/admin/dashboard')
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed'
      setErr(errorMsg)
      toast.error(errorMsg, {
        position: "top-center",
        autoClose: 2000,
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Soft ambient glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px]" />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-orange-500/8 rounded-full blur-[120px]" />
      </div>

      {/* Back Button */}
      <motion.button 
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 }}
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.07] transition-all text-sm"
      >
        <FaArrowLeft size={13} />
        <span className="hidden sm:inline">Back to Home</span>
      </motion.button>

      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
        className="w-full max-w-5xl rounded-3xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-black/40 flex flex-col md:flex-row"
      >
        
        {/* ========== LEFT SIDE ========== */}
        <div className="hidden md:flex md:w-[45%] relative flex-col justify-between min-h-[580px] overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=900&fit=crop" 
              alt="Admin" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-transparent mix-blend-overlay" />
          </div>

          {/* Top badges */}
          <div className="relative z-10 p-8 flex gap-3">
            {[
              { icon: <FaLock className="text-orange-400" size={12} />, label: 'Secure' },
              { icon: <MdVerified className="text-blue-400" size={14} />, label: 'Verified' },
              { icon: <FaShieldAlt className="text-emerald-400" size={12} />, label: 'Admin' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-xs"
              >
                {item.icon}
                <span>{item.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Bottom content */}
          <div className="relative z-10 p-8 pb-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-4xl font-bold text-white tracking-tight">
                cravely<span className="text-orange-500">.</span>
              </h1>
              <p className="text-orange-400/90 text-sm tracking-[0.15em] uppercase mt-1 font-medium">
                Super Admin Panel
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mt-8"
            >
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome back, Admin
              </h2>
              <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                Manage users, restaurants, orders and the entire platform from one place.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  { icon: <FaChartLine size={11} />, label: 'Dashboard' },
                  { icon: <FaUsers size={11} />, label: 'Users' },
                  { icon: <FaStore size={11} />, label: 'Restaurants' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/70 text-xs"
                  >
                    {item.icon}
                    {item.label}
                  </div>
                ))}
              </div>
            </motion.div>

            <p className="mt-10 text-white/20 text-[11px]">
              © 2026 Cravely. All rights reserved.
            </p>
          </div>
        </div>

        {/* ========== RIGHT SIDE - FORM ========== */}
        <div className="w-full md:w-[55%] bg-[#0f0f15] p-6 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            
            {/* Mobile back + logo */}
            <div className="md:hidden mb-6">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-4"
              >
                <FaArrowLeft size={12} /> Back
              </button>
              <h1 className="text-2xl font-bold text-white">
                cravely<span className="text-orange-500">.</span>
              </h1>
              <p className="text-white/40 text-sm mt-0.5">Admin Login</p>
            </div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  Admin Login
                </h2>
                <FaUserShield className="text-orange-400" size={20} />
              </div>
              <p className="text-white/40 text-sm mb-8">
                Sign in with your super admin credentials
              </p>
            </motion.div>

            <form 
              onSubmit={(e) => { e.preventDefault(); handleLogin() }} 
              className="space-y-5"
            >
              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <label className="block text-white/50 text-xs mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <MdMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={17} />
                  <input
                    type="email"
                    placeholder="admin@cravely.com"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3.5 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <label className="block text-white/50 text-xs mb-1.5 ml-1">
                  Password
                </label>
                <div className="relative">
                  <RiLockPasswordFill className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={17} />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3.5 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </motion.div>

              {/* Error */}
              {err && (
                <motion.p
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2"
                >
                  {err}
                </motion.p>
              )}

              {/* Submit */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-70 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <ClipLoader size={17} color="white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <FaUserShield size={15} />
                    Login as Super Admin
                    <FaArrowRight size={13} />
                  </>
                )}
              </motion.button>

              {/* Trust indicators */}
              <div className="flex justify-center gap-5 pt-2 text-white/30 text-xs">
                <span className="flex items-center gap-1.5">
                  <FaLock size={10} /> Secure
                </span>
                <span className="flex items-center gap-1.5">
                  <MdVerified size={12} className="text-blue-400/70" /> Verified
                </span>
                <span className="flex items-center gap-1.5">
                  <FaShieldAlt size={10} className="text-emerald-400/70" /> Protected
                </span>
              </div>

              <p className="text-center text-white/35 text-xs pt-1">
                Need help?{' '}
                <span 
                  onClick={() => navigate('/contact')}
                  className="text-orange-400 hover:text-orange-300 cursor-pointer transition"
                >
                  Contact Support
                </span>
              </p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SuperAdminLogin