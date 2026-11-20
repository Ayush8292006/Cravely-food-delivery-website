// src/components/DeliveryBoyProfile.jsx

import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../../config'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { 
    FaUser, FaMotorcycle, FaStar, FaTruck, FaWallet,
    FaMapMarkerAlt, FaPhone, FaEnvelope, FaCheckCircle,
    FaClock, FaCamera, FaShieldAlt, FaMedal,
    FaCalendarAlt, FaAward, FaExclamationTriangle,
    FaSync
} from 'react-icons/fa'
import { MdVerified } from 'react-icons/md'

function DeliveryBoyProfile() {
    const { userData } = useSelector(state => state.user)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [profileData, setProfileData] = useState(null)
    const [retryCount, setRetryCount] = useState(0)

    const fetchProfile = async () => {
        setLoading(true)
        setError(null)
        try {
            console.log("🔄 Fetching profile from:", `${serverUrl}/api/user/current`)
            
            const response = await axios.get(`${serverUrl}/api/user/current`, {
                withCredentials: true,
                timeout: 10000
            })
            
            console.log("✅ Profile data received:", response.data)
            setProfileData(response.data)
            
        } catch (error) {
            console.log('❌ Fetch profile error:', error)
            
            // ✅ Fallback to userData from Redux
            if (userData) {
                console.log("📱 Using Redux userData as fallback")
                setProfileData(userData)
                setError('Using cached data - Backend not connected')
            } else {
                setError('Failed to load profile. Please try again.')
                toast.error('Failed to load profile')
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [retryCount])

    const handleRetry = () => {
        setRetryCount(prev => prev + 1)
        toast.info('🔄 Retrying...')
    }

    // ✅ Loading State
    if (loading) {
        return (
            <div className='min-h-screen bg-[#0A090D] text-white flex items-center justify-center'>
                <div className='flex flex-col items-center gap-4'>
                    <div className='w-12 h-12 rounded-full border-4 border-orange-500/20 border-t-[#FF6B00] animate-spin' />
                    <p className='text-gray-400 text-sm font-medium animate-pulse'>Loading profile...</p>
                </div>
            </div>
        )
    }

    // ✅ Error State
    if (error && !profileData) {
        return (
            <div className='min-h-screen bg-[#0A090D] text-white flex items-center justify-center p-4'>
                <div className='bg-[#13121A] border border-red-500/20 rounded-3xl p-8 max-w-md w-full text-center shadow-xl'>
                    <div className='w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4'>
                        <FaExclamationTriangle className='text-red-400 text-2xl' />
                    </div>
                    <h2 className='text-lg font-bold text-white mb-2'>Failed to Load Profile</h2>
                    <p className='text-gray-400 text-sm mb-4'>{error}</p>
                    <button 
                        onClick={handleRetry}
                        className='px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-orange-600 text-white font-bold flex items-center gap-2 mx-auto transition cursor-pointer'
                    >
                        <FaSync className={loading ? 'animate-spin' : ''} />
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    // ✅ No Data State
    if (!profileData) {
        return (
            <div className='min-h-screen bg-[#0A090D] text-white flex items-center justify-center p-4'>
                <div className='bg-[#13121A] border border-white/10 rounded-3xl p-8 max-w-md w-full text-center shadow-xl'>
                    <FaMotorcycle className='text-white/20 text-5xl mx-auto mb-4' />
                    <h2 className='text-lg font-bold text-white mb-2'>No Profile Data</h2>
                    <p className='text-gray-400 text-sm'>Please login again to load your profile.</p>
                    <button 
                        onClick={() => window.location.href = '/signin'}
                        className='mt-4 px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-orange-600 text-white font-bold transition cursor-pointer'
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        )
    }

    const isApproved = profileData?.isApproved === true
    const rating = profileData?.deliveryBoyRating?.average || 0
    const ratingCount = profileData?.deliveryBoyRating?.count || 0
    const totalEarnings = profileData?.earnings || 0
    const totalDeliveries = profileData?.totalDeliveries || 0

    return (
        <div className='min-h-screen bg-[#0A090D] text-white pt-[76px] pb-[70px] md:pb-12'>
            <div className='max-w-3xl mx-auto px-4 py-6'>
                
                {/* Warning Banner if using cached data */}
                {error && (
                    <div className='bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 mb-4 flex items-center gap-3'>
                        <FaExclamationTriangle className='text-amber-400' />
                        <p className='text-amber-300 text-xs font-medium flex-1'>
                            ⚠️ {error} - Some data may be outdated
                        </p>
                        <button 
                            onClick={handleRetry}
                            className='text-xs text-[#FF6B00] hover:underline font-bold'
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Profile Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='bg-[#13121A] border border-white/10 rounded-3xl p-6 shadow-xl mb-6'
                >
                    <div className='flex flex-col items-center text-center'>
                        <div className='relative'>
                            <div className='w-24 h-24 rounded-full bg-[#FF6B00] flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-orange-500/20'>
                                {profileData?.fullName?.charAt(0) || 'D'}
                            </div>
                            <div className='absolute bottom-0 right-0 p-2 bg-[#181722] border border-white/10 rounded-full text-white/60'>
                                <FaMotorcycle size={12} className="text-[#FF6B00]" />
                            </div>
                        </div>
                        <h1 className='text-2xl font-black text-white mt-4 flex items-center gap-2'>
                            {profileData?.fullName}
                            <MdVerified className='text-sky-400 text-lg' />
                        </h1>
                        <p className='text-gray-400 text-sm flex items-center gap-1.5 mt-0.5'>
                            <FaMotorcycle className='text-[#FF6B00]' />
                            <span>Fleet Delivery Partner</span>
                        </p>
                        <div className='flex items-center gap-3 mt-3 flex-wrap justify-center'>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                                isApproved 
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            }`}>
                                {isApproved ? (
                                    <><FaCheckCircle size={12} className="text-emerald-400" /> Verified Partner</>
                                ) : (
                                    <><FaClock size={12} className="text-amber-400" /> Pending Approval</>
                                )}
                            </span>
                            <span className='text-xs font-bold px-3 py-1 rounded-full border border-white/10 bg-[#181722] text-white flex items-center gap-1.5'>
                                <FaStar className='text-amber-400' />
                                <span>{rating > 0 ? `${rating.toFixed(1)} ★` : 'New Partner'}</span>
                                {ratingCount > 0 && <span className='text-gray-400 text-[10px]'>({ratingCount})</span>}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-6'>
                    {[
                        { icon: <FaTruck className='text-[#FF6B00]' />, label: 'Deliveries', value: totalDeliveries },
                        { icon: <FaWallet className='text-emerald-400' />, label: 'Earnings', value: `₹${totalEarnings}` },
                        { icon: <FaStar className='text-amber-400' />, label: 'Rating', value: rating > 0 ? `${rating.toFixed(1)} ★` : 'N/A' },
                        { icon: <FaMedal className='text-sky-400' />, label: 'Status', value: isApproved ? 'Active' : 'Pending' }
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -2 }}
                            className='bg-[#13121A] border border-white/[0.08] p-4 rounded-2xl text-center shadow-lg'
                        >
                            <div className='text-2xl mb-1 flex justify-center'>{stat.icon}</div>
                            <div className='text-lg font-black text-white'>{stat.value}</div>
                            <div className='text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-0.5'>
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Personal Info */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className='bg-[#13121A] border border-white/10 rounded-3xl p-6 shadow-xl mb-6'
                >
                    <h2 className='text-lg font-black text-white flex items-center gap-2 mb-4'>
                        <FaUser className='text-[#FF6B00]' /> Personal Information
                    </h2>
                    <div className='space-y-3'>
                        <div className='flex items-center gap-3 p-3 rounded-xl bg-[#181722] border border-white/[0.06]'>
                            <FaUser className='text-gray-400' />
                            <div>
                                <p className='text-gray-400 text-[10px] font-bold uppercase tracking-wider'>Full Name</p>
                                <p className='text-white font-medium text-sm'>{profileData?.fullName || 'N/A'}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-3 p-3 rounded-xl bg-[#181722] border border-white/[0.06]'>
                            <FaEnvelope className='text-gray-400' />
                            <div>
                                <p className='text-gray-400 text-[10px] font-bold uppercase tracking-wider'>Email</p>
                                <p className='text-white font-medium text-sm'>{profileData?.email || 'N/A'}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-3 p-3 rounded-xl bg-[#181722] border border-white/[0.06]'>
                            <FaPhone className='text-gray-400' />
                            <div>
                                <p className='text-gray-400 text-[10px] font-bold uppercase tracking-wider'>Mobile</p>
                                <p className='text-white font-medium text-sm'>{profileData?.mobile || 'N/A'}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-3 p-3 rounded-xl bg-[#181722] border border-white/[0.06]'>
                            <FaMapMarkerAlt className='text-gray-400' />
                            <div>
                                <p className='text-gray-400 text-[10px] font-bold uppercase tracking-wider'>Location</p>
                                <p className='text-white font-medium text-sm'>
                                    {profileData?.city || profileData?.state || 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div className='flex items-center gap-3 p-3 rounded-xl bg-[#181722] border border-white/[0.06]'>
                            <FaCalendarAlt className='text-gray-400' />
                            <div>
                                <p className='text-gray-400 text-[10px] font-bold uppercase tracking-wider'>Joined</p>
                                <p className='text-white font-medium text-sm'>
                                    {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Achievements */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className='bg-[#13121A] border border-white/10 rounded-3xl p-6 shadow-xl'
                >
                    <h2 className='text-lg font-black text-white flex items-center gap-2 mb-4'>
                        <FaAward className='text-[#FF6B00]' /> Achievements & Badges
                    </h2>
                    <div className='flex flex-wrap gap-3'>
                        {totalDeliveries >= 10 && (
                            <div className='flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30'>
                                <FaMedal className='text-amber-400' />
                                <span className='text-xs font-bold text-amber-300'>10+ Deliveries</span>
                            </div>
                        )}
                        {totalDeliveries >= 50 && (
                            <div className='flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-500/10 border border-sky-500/30'>
                                <FaMedal className='text-sky-400' />
                                <span className='text-xs font-bold text-sky-300'>50+ Deliveries</span>
                            </div>
                        )}
                        {totalDeliveries >= 100 && (
                            <div className='flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30'>
                                <FaMedal className='text-purple-400' />
                                <span className='text-xs font-bold text-purple-300'>100+ Deliveries</span>
                            </div>
                        )}
                        {rating >= 4.5 && ratingCount > 0 && (
                            <div className='flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30'>
                                <FaStar className='text-emerald-400' />
                                <span className='text-xs font-bold text-emerald-300'>Top Rated Rider</span>
                            </div>
                        )}
                        {isApproved && (
                            <div className='flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30'>
                                <FaShieldAlt className='text-emerald-400' />
                                <span className='text-xs font-bold text-emerald-300'>Verified Partner</span>
                            </div>
                        )}
                        {!isApproved && (
                            <div className='flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30'>
                                <FaClock className='text-amber-400' />
                                <span className='text-xs font-bold text-amber-300'>Awaiting Verification</span>
                            </div>
                        )}
                    </div>
                </motion.div>

            </div>
        </div>
    )
}

export default DeliveryBoyProfile