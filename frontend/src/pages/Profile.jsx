import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { setUserData } from '../redux/userSlice'
import { toast } from 'react-toastify'
import { ClipLoader } from 'react-spinners'
import { 
    FaCamera, FaEdit, FaArrowLeft, FaUser, FaPhone, FaEnvelope, 
    FaCheckCircle, FaExclamationCircle, FaLock, FaKey, FaUserCircle,
    FaShieldAlt, FaIdCard, FaMobileAlt, FaRegEnvelope, FaPen,
    FaSave, FaTimes, FaGoogle, FaArrowRight, FaRocket,
    FaCrown, FaGem, FaStar, FaHeart
} from 'react-icons/fa'
import { MdDeliveryDining, MdRestaurant, MdVerified } from 'react-icons/md'
import { motion } from 'framer-motion'

function Profile() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)
    
    const [loading, setLoading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [fullName, setFullName] = useState('')
    const [mobile, setMobile] = useState('')
    const [email, setEmail] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 300)
    }, [])

    useEffect(() => {
        if (userData) {
            setFullName(userData.fullName || '')
            const userMobile = userData.mobile || ''
            if (userMobile === '0000000000' || userMobile === '000000000') {
                setMobile('')
            } else {
                setMobile(userMobile)
            }
            setEmail(userData.email || '')
        }
    }, [userData])

    const handleUpdateProfile = async () => {
        setLoading(true)
        try {
            const result = await axios.put(`${serverUrl}/api/user/profile`, {
                fullName,
                mobile,
                email
            }, { withCredentials: true })
            
            dispatch(setUserData(result.data.user))
            toast.success('Profile updated successfully! 🎉')
            setIsEditing(false)
            setLoading(false)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed')
            setLoading(false)
        }
    }

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (newPassword.length < 6) {
            toast.error('Password must have at least 6 characters')
            return
        }

        setLoading(true)
        try {
            await axios.post(`${serverUrl}/api/user/change-password`, {
                currentPassword,
                newPassword
            }, { withCredentials: true })
            
            toast.success('Password changed successfully! 🔒')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setIsChangingPassword(false)
            setLoading(false)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password')
            setLoading(false)
        }
    }

    const handleUploadPhoto = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append('image', file)

        setLoading(true)
        try {
            const result = await axios.post(`${serverUrl}/api/user/upload-photo`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            
            dispatch(setUserData({ ...userData, profilePhoto: result.data.profilePhoto }))
            toast.success('Profile photo updated! 📸')
            setLoading(false)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed')
            setLoading(false)
        }
    }

    const getRoleInfo = () => {
        switch(userData?.role) {
            case 'owner': 
                return { 
                    icon: <MdRestaurant size={20} />, 
                    label: 'Restaurant Owner',
                    color: 'text-[#ff6b35]',
                    bg: 'bg-[#ff6b35]/15',
                    border: 'border-[#ff6b35]/30',
                    gradient: 'from-[#ff6b35] to-[#ffd93d]'
                }
            case 'deliveryBoy': 
                return { 
                    icon: <MdDeliveryDining size={20} />, 
                    label: 'Delivery Partner',
                    color: 'text-blue-400',
                    bg: 'bg-blue-500/15',
                    border: 'border-blue-500/30',
                    gradient: 'from-blue-400 to-cyan-400'
                }
            case 'superAdmin': 
                return { 
                    icon: <FaShieldAlt size={18} />, 
                    label: 'Super Admin',
                    color: 'text-purple-400',
                    bg: 'bg-purple-500/15',
                    border: 'border-purple-500/30',
                    gradient: 'from-purple-400 to-pink-400'
                }
            default: 
                return { 
                    icon: <FaUser size={16} />, 
                    label: 'Customer',
                    color: 'text-[#ff2d55]',
                    bg: 'bg-[#ff2d55]/15',
                    border: 'border-[#ff2d55]/30',
                    gradient: 'from-[#ff2d55] to-[#ff6b35]'
                }
        }
    }

    const roleInfo = getRoleInfo()
    const isGoogleUser = userData?.mobile === '0000000000' || userData?.mobile === '000000000'

    const fadeUp = `transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`

    if (!userData) {
        return (
            <div className='min-h-screen bg-[#0a0a0f] flex items-center justify-center'>
                <div className='flex flex-col items-center gap-4'>
                    <div className='relative'>
                        <ClipLoader size={60} color="#ff2d55" />
                        <div className='absolute inset-0 animate-ping rounded-full border-2 border-[#ff2d55]/20' />
                    </div>
                    <p className='text-white/40 text-sm animate-pulse'>Loading profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-[#0a0a0f] relative overflow-hidden'>
            
            {/* ✅ Animated Background Orbs */}
            <div className='absolute inset-0 pointer-events-none'>
                <motion.div 
                    animate={{ x: [0, 60, -30, 0], y: [0, -40, 50, 0] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className='absolute -top-40 -left-40 w-[700px] h-[700px] bg-[#ff2d55]/4 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ x: [0, -50, 30, 0], y: [0, 40, -50, 0] }}
                    transition={{ duration: 25, repeat: Infinity }}
                    className='absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-[#ff6b35]/4 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[#ffd93d]/2 rounded-full blur-3xl'
                />
            </div>

            <div className='relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8'>
                
                {/* ✅ Header */}
                <div className={`flex items-center gap-4 mb-8 ${fadeUp}`}>
                    <motion.button 
                        whileHover={{ scale: 1.05, rotate: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className='w-11 h-11 rounded-2xl bg-[#18181D] flex items-center justify-center hover:bg-white/10 transition-all duration-300 border border-white/5 group hover:border-[#ff2d55]/30 hover:shadow-lg hover:shadow-[#ff2d55]/10'
                        onClick={() => navigate('/')}
                    >
                        <FaArrowLeft size={18} className='text-white/60 group-hover:text-white transition' />
                    </motion.button>
                    <div>
                        <h1 className='text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2'>
                            My Profile
                            <FaRocket size={18} className='text-[#ff6b35] animate-pulse' />
                        </h1>
                        <p className='text-white/30 text-sm'>Manage your account settings</p>
                    </div>
                </div>

                {/* ✅ Main Profile Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className='glass-premium-ultra rounded-3xl border border-white/5 p-6 sm:p-8 shadow-2xl shadow-[#ff2d55]/5 hover:border-white/10 transition-all duration-500'
                >
                    
                    {/* ✅ Top Section */}
                    <div className='flex flex-col lg:flex-row lg:items-start gap-8'>
                        
                        {/* Left - Profile Photo */}
                        <div className='flex flex-col items-center flex-shrink-0'>
                            <div className='relative group'>
                                <div className='absolute -inset-1 rounded-full bg-gradient-to-r from-[#ff2d55] via-[#ff6b35] to-[#ffd93d] opacity-30 group-hover:opacity-60 blur-xl transition-all duration-500 animate-spin-slow' />
                                <div className='absolute -inset-1 rounded-full bg-gradient-to-r from-[#ff2d55] via-[#ff6b35] to-[#ffd93d] opacity-0 group-hover:opacity-100 blur transition-all duration-500' />
                                
                                <img 
                                    src={userData.profilePhoto || `https://ui-avatars.com/api/?name=${userData.fullName || 'User'}&background=ff2d55&color=fff&size=150&bold=true`} 
                                    alt="Profile" 
                                    className='w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-[#ff2d55]/40 relative z-10 group-hover:scale-105 group-hover:border-[#ff6b35]/60 transition-all duration-500'
                                />
                                <label className='absolute bottom-1 right-1 z-20 bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white p-2.5 rounded-full cursor-pointer hover:scale-110 transition-all duration-300 shadow-lg shadow-[#ff2d55]/40 border border-white/10'>
                                    <FaCamera size={14} />
                                    <input type="file" accept="image/*" className='hidden' onChange={handleUploadPhoto} />
                                </label>
                            </div>
                            
                            <h2 className='text-xl font-bold text-white mt-4 flex items-center gap-2'>
                                {userData.fullName}
                                {userData.isEmailVerified && (
                                    <MdVerified size={18} className='text-green-400' />
                                )}
                            </h2>
                            
                            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full ${roleInfo.bg} ${roleInfo.border} border mt-1`}>
                                <span className={roleInfo.color}>{roleInfo.icon}</span>
                                <span className={`text-xs font-medium ${roleInfo.color}`}>{roleInfo.label}</span>
                            </div>

                            {isGoogleUser && (
                                <div className='flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20'>
                                    <FaGoogle size={12} className='text-blue-400' />
                                    <span className='text-[10px] text-blue-400 font-medium'>Google Account</span>
                                </div>
                            )}
                        </div>

                        {/* Right - Profile Details */}
                        <div className='flex-1 w-full'>
                            {!isEditing ? (
                                <div className='space-y-4'>
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                        {/* Name */}
                                        <motion.div 
                                            whileHover={{ y: -2 }}
                                            className='glass-premium-ultra p-4 rounded-2xl border border-white/5 hover:border-[#ff2d55]/20 transition-all duration-300 group'
                                        >
                                            <div className='flex items-center gap-3'>
                                                <div className='w-10 h-10 rounded-xl bg-[#ff2d55]/15 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300'>
                                                    <FaUser size={16} className='text-[#ff6b35]' />
                                                </div>
                                                <div className='min-w-0'>
                                                    <p className='text-white/30 text-[10px] font-medium tracking-wider uppercase'>Full Name</p>
                                                    <p className='text-white font-semibold truncate text-sm sm:text-base'>{userData.fullName}</p>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Mobile */}
                                        <motion.div 
                                            whileHover={{ y: -2 }}
                                            className='glass-premium-ultra p-4 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-all duration-300 group'
                                        >
                                            <div className='flex items-center gap-3'>
                                                <div className='w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300'>
                                                    <FaMobileAlt size={16} className='text-blue-400' />
                                                </div>
                                                <div className='min-w-0'>
                                                    <p className='text-white/30 text-[10px] font-medium tracking-wider uppercase'>Mobile</p>
                                                    <p className='text-white font-semibold truncate text-sm sm:text-base'>
                                                        {mobile || (
                                                            <span className='text-white/30 italic text-sm font-normal'>
                                                                {isGoogleUser ? 'Add mobile number' : 'Not provided'}
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Email - Full Width */}
                                        <motion.div 
                                            whileHover={{ y: -2 }}
                                            className='sm:col-span-2 glass-premium-ultra p-4 rounded-2xl border border-white/5 hover:border-green-500/20 transition-all duration-300 group'
                                        >
                                            <div className='flex items-center gap-3'>
                                                <div className='w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300'>
                                                    <FaRegEnvelope size={16} className='text-green-400' />
                                                </div>
                                                <div className='flex-1 min-w-0'>
                                                    <p className='text-white/30 text-[10px] font-medium tracking-wider uppercase'>Email</p>
                                                    <p className='text-white font-semibold truncate text-sm sm:text-base'>{userData.email}</p>
                                                </div>
                                                {!userData.isEmailVerified ? (
                                                    <span className='flex items-center gap-1.5 text-yellow-400 text-[10px] bg-yellow-400/10 px-3 py-1.5 rounded-full flex-shrink-0 border border-yellow-400/20'>
                                                        <FaExclamationCircle size={10} />
                                                        Not Verified
                                                    </span>
                                                ) : (
                                                    <span className='flex items-center gap-1.5 text-green-400 text-[10px] bg-green-400/10 px-3 py-1.5 rounded-full flex-shrink-0 border border-green-400/20'>
                                                        <FaCheckCircle size={10} />
                                                        Verified
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Edit Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className='w-full mt-3 py-3.5 rounded-2xl bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white font-semibold transition-all duration-300 shadow-lg shadow-[#ff2d55]/25 flex items-center justify-center gap-3 group'
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <FaEdit size={16} className='group-hover:rotate-12 transition-transform duration-300' />
                                        <span>Edit Profile</span>
                                        <FaArrowRight size={14} className='group-hover:translate-x-1 transition-transform duration-300' />
                                    </motion.button>
                                </div>
                            ) : (
                                <div className='space-y-4'>
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                        <div className='sm:col-span-2'>
                                            <label className='block text-white/40 text-xs font-medium mb-1.5 tracking-wider uppercase'>Full Name</label>
                                            <input
                                                type="text"
                                                className='w-full bg-[#18181D] border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff2d55]/50 focus:ring-2 focus:ring-[#ff2d55]/10 transition-all duration-300 text-sm'
                                                placeholder='Enter your full name'
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className='block text-white/40 text-xs font-medium mb-1.5 tracking-wider uppercase'>Mobile</label>
                                            <input
                                                type="text"
                                                className='w-full bg-[#18181D] border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff2d55]/50 focus:ring-2 focus:ring-[#ff2d55]/10 transition-all duration-300 text-sm'
                                                placeholder={isGoogleUser ? 'Add your mobile number' : 'Enter mobile number'}
                                                value={mobile}
                                                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                                                maxLength={10}
                                            />
                                            {isGoogleUser && (
                                                <p className='text-blue-400/50 text-[10px] mt-1 flex items-center gap-1'>
                                                    <FaGoogle size={10} />
                                                    Add your mobile number for delivery updates
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className='block text-white/40 text-xs font-medium mb-1.5 tracking-wider uppercase'>Email</label>
                                            <input
                                                type="email"
                                                className='w-full bg-[#18181D] border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff2d55]/50 focus:ring-2 focus:ring-[#ff2d55]/10 transition-all duration-300 text-sm'
                                                placeholder='Enter email'
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                            <p className='text-white/20 text-[10px] mt-1'>Changing email will require re-verification</p>
                                        </div>
                                    </div>
                                    
                                    <div className='flex gap-3 mt-2 flex-col sm:flex-row'>
                                        <button
                                            className='flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white font-semibold hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 shadow-lg shadow-[#ff2d55]/20 flex items-center justify-center gap-2'
                                            onClick={handleUpdateProfile}
                                            disabled={loading}
                                        >
                                            {loading ? <ClipLoader size={18} color='white' /> : <><FaSave size={14} /> Save Changes</>}
                                        </button>
                                        <button
                                            className='flex-1 py-3.5 rounded-2xl border border-white/10 text-white/40 hover:bg-white/5 hover:text-white transition-all duration-300 flex items-center justify-center gap-2'
                                            onClick={() => setIsEditing(false)}
                                        >
                                            <FaTimes size={14} /> Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* ✅ Change Password Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className='glass-premium-ultra rounded-3xl border border-white/5 p-6 sm:p-8 mt-6 shadow-2xl shadow-[#ff2d55]/5 hover:border-white/10 transition-all duration-500'
                >
                    <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
                        <div className='flex items-center gap-4'>
                            <div className='w-11 h-11 rounded-2xl bg-yellow-500/15 flex items-center justify-center flex-shrink-0'>
                                <FaLock size={18} className='text-yellow-400' />
                            </div>
                            <div>
                                <h3 className='text-white font-semibold text-lg'>Security Settings</h3>
                                <p className='text-white/30 text-sm'>Manage your password and security</p>
                            </div>
                        </div>

                        {isChangingPassword ? (
                            <div className='flex-1 flex flex-col sm:flex-row gap-3 w-full'>
                                <input
                                    type="password"
                                    placeholder='Current Password'
                                    className='flex-1 bg-[#18181D] border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 text-sm'
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                                <input
                                    type="password"
                                    placeholder='New Password'
                                    className='flex-1 bg-[#18181D] border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 text-sm'
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <input
                                    type="password"
                                    placeholder='Confirm'
                                    className='flex-1 bg-[#18181D] border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 text-sm'
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        ) : null}
                    </div>

                    {isChangingPassword ? (
                        <div className='flex gap-3 mt-4 flex-col sm:flex-row'>
                            <button
                                className='flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white font-semibold hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 shadow-lg shadow-[#ff2d55]/20 flex items-center justify-center gap-2'
                                onClick={handleChangePassword}
                                disabled={loading}
                            >
                                {loading ? <ClipLoader size={18} color='white' /> : <><FaKey size={14} /> Update Password</>}
                            </button>
                            <button
                                className='flex-1 py-3.5 rounded-2xl border border-white/10 text-white/40 hover:bg-white/5 hover:text-white transition-all duration-300 flex items-center justify-center gap-2'
                                onClick={() => setIsChangingPassword(false)}
                            >
                                <FaTimes size={14} /> Cancel
                            </button>
                        </div>
                    ) : (
                        <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
                            <button
                                className='sm:flex-1 py-3.5 rounded-2xl bg-[#18181D] border border-white/10 text-white/60 hover:bg-white/5 hover:text-white hover:border-[#ff2d55]/30 transition-all duration-300 flex items-center justify-center gap-3'
                                onClick={() => setIsChangingPassword(true)}
                            >
                                <FaLock size={16} />
                                <span>Change Password</span>
                            </button>
                            
                            <div className='flex items-center gap-2 justify-center'>
                                <span className='text-white/30 text-sm'>Forgot password?</span>
                                <span 
                                    className='text-sm text-[#ff6b35] cursor-pointer font-medium hover:underline transition flex items-center gap-1'
                                    onClick={() => navigate("/forgot-password")}
                                >
                                    Reset here <FaArrowRight size={10} />
                                </span>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            <style jsx>{`
                @keyframes float-3d {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(40px, -30px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-float-3d {
                    animation: float-3d 15s ease-in-out infinite;
                }

                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 6s linear infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .animate-pulse {
                    animation: pulse 2s ease-in-out infinite;
                }

                .glass-premium-ultra {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }

                ::-webkit-scrollbar {
                    width: 4px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: rgba(255, 45, 85, 0.3);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    )
}

export default Profile