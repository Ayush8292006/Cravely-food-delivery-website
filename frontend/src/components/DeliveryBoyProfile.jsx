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
            <div className='min-h-screen bg-[#f8f4f0] flex items-center justify-center'>
                <div className='flex flex-col items-center gap-4'>
                    <div className='w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin' />
                    <p className='text-gray-500 text-sm font-medium animate-pulse'>Loading profile...</p>
                </div>
            </div>
        )
    }

    // ✅ Error State
    if (error && !profileData) {
        return (
            <div className='min-h-screen bg-[#f8f4f0] flex items-center justify-center p-4'>
                <div className='bg-white border-2 border-red-200 rounded-3xl p-8 max-w-md w-full text-center shadow-sm'>
                    <div className='w-16 h-16 mx-auto rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mb-4'>
                        <FaExclamationTriangle className='text-red-500 text-2xl' />
                    </div>
                    <h2 className='text-lg font-bold text-gray-900 mb-2'>Failed to Load Profile</h2>
                    <p className='text-gray-500 text-sm mb-4'>{error}</p>
                    <button 
                        onClick={handleRetry}
                        className='px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center gap-2 mx-auto transition-all duration-300'
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
            <div className='min-h-screen bg-[#f8f4f0] flex items-center justify-center p-4'>
                <div className='bg-white border-2 border-gray-200 rounded-3xl p-8 max-w-md w-full text-center shadow-sm'>
                    <FaMotorcycle className='text-gray-300 text-5xl mx-auto mb-4' />
                    <h2 className='text-lg font-bold text-gray-900 mb-2'>No Profile Data</h2>
                    <p className='text-gray-500 text-sm'>Please login again to load your profile.</p>
                    <button 
                        onClick={() => window.location.href = '/signin'}
                        className='mt-4 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all duration-300'
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
        <div className='min-h-screen bg-[#f8f4f0] pt-[70px] pb-[70px] md:pb-0'>
            <div className='max-w-3xl mx-auto px-4 py-6'>
                
                {/* ✅ Warning Banner if using cached data */}
                {error && (
                    <div className='bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 mb-4 flex items-center gap-3'>
                        <FaExclamationTriangle className='text-amber-500' />
                        <p className='text-amber-700 text-xs font-medium flex-1'>
                            ⚠️ {error} - Some data may be outdated
                        </p>
                        <button 
                            onClick={handleRetry}
                            className='text-xs text-amber-600 hover:text-amber-800 font-bold underline'
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* ✅ Profile Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm mb-6'
                >
                    <div className='flex flex-col items-center text-center'>
                        <div className='relative'>
                            <div className='w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center text-white text-3xl font-bold shadow-md shadow-orange-200'>
                                {profileData?.fullName?.charAt(0) || 'D'}
                            </div>
                            <button className='absolute bottom-0 right-0 p-2 bg-white border-2 border-gray-200 rounded-full shadow-sm hover:border-orange-300 transition-all duration-300'>
                                <FaCamera className='text-gray-400 text-sm' />
                            </button>
                        </div>
                        <h1 className='text-2xl font-bold text-gray-900 mt-4 flex items-center gap-2'>
                            {profileData?.fullName}
                            <MdVerified className='text-blue-500 text-lg' />
                        </h1>
                        <p className='text-gray-500 text-sm flex items-center gap-2'>
                            <FaMotorcycle className='text-orange-500' />
                            Delivery Boy
                        </p>
                        <div className='flex items-center gap-3 mt-2 flex-wrap justify-center'>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border-2 flex items-center gap-1.5 ${
                                isApproved 
                                    ? 'bg-green-50 text-green-700 border-green-200' 
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                                {isApproved ? (
                                    <><FaCheckCircle size={12} className="text-green-500" /> Verified</>
                                ) : (
                                    <><FaClock size={12} className="text-amber-500" /> Pending Approval</>
                                )}
                            </span>
                            <span className='text-xs font-bold px-3 py-1 rounded-full border-2 border-gray-200 bg-gray-50 text-gray-700 flex items-center gap-1.5'>
                                <FaStar className='text-amber-400' />
                                {rating > 0 ? `${rating.toFixed(1)} ★` : 'No ratings'}
                                {ratingCount > 0 && <span className='text-gray-400 text-[10px]'>({ratingCount})</span>}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* ✅ Stats Grid */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-6'>
                    {[
                        { icon: <FaTruck className='text-orange-500' />, label: 'Deliveries', value: totalDeliveries },
                        { icon: <FaWallet className='text-amber-500' />, label: 'Earnings', value: `₹${totalEarnings}` },
                        { icon: <FaStar className='text-amber-400' />, label: 'Rating', value: rating > 0 ? `${rating.toFixed(1)} ★` : 'N/A' },
                        { icon: <FaMedal className='text-blue-500' />, label: 'Status', value: isApproved ? '✅ Active' : '⏳ Pending' }
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -2 }}
                            className='bg-white border-2 border-gray-200 p-4 rounded-2xl text-center shadow-sm'
                        >
                            <div className='text-2xl mb-0.5'>{stat.icon}</div>
                            <div className='text-lg font-bold text-gray-800'>{stat.value}</div>
                            <div className='text-[9px] font-bold uppercase tracking-wider text-gray-500'>
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ✅ Personal Info */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className='bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm mb-6'
                >
                    <h2 className='text-lg font-bold text-gray-900 flex items-center gap-2 mb-4'>
                        <FaUser className='text-orange-500' /> Personal Information
                    </h2>
                    <div className='space-y-3'>
                        <div className='flex items-center gap-3 p-3 rounded-xl bg-gray-50 border-2 border-gray-200'>
                            <FaUser className='text-gray-400' />
                            <div>
                                <p className='text-gray-500 text-[10px] font-bold uppercase tracking-wider'>Full Name</p>
                                <p className='text-gray-800 font-medium'>{profileData?.fullName || 'N/A'}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-3 p-3 rounded-xl bg-gray-50 border-2 border-gray-200'>
                            <FaEnvelope className='text-gray-400' />
                            <div>
                                <p className='text-gray-500 text-[10px] font-bold uppercase tracking-wider'>Email</p>
                                <p className='text-gray-800 font-medium'>{profileData?.email || 'N/A'}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-3 p-3 rounded-xl bg-gray-50 border-2 border-gray-200'>
                            <FaPhone className='text-gray-400' />
                            <div>
                                <p className='text-gray-500 text-[10px] font-bold uppercase tracking-wider'>Mobile</p>
                                <p className='text-gray-800 font-medium'>{profileData?.mobile || 'N/A'}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-3 p-3 rounded-xl bg-gray-50 border-2 border-gray-200'>
                            <FaMapMarkerAlt className='text-gray-400' />
                            <div>
                                <p className='text-gray-500 text-[10px] font-bold uppercase tracking-wider'>Location</p>
                                <p className='text-gray-800 font-medium'>
                                    {profileData?.city || profileData?.state || 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div className='flex items-center gap-3 p-3 rounded-xl bg-gray-50 border-2 border-gray-200'>
                            <FaCalendarAlt className='text-gray-400' />
                            <div>
                                <p className='text-gray-500 text-[10px] font-bold uppercase tracking-wider'>Joined</p>
                                <p className='text-gray-800 font-medium'>
                                    {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ✅ Badges */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className='bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm'
                >
                    <h2 className='text-lg font-bold text-gray-900 flex items-center gap-2 mb-4'>
                        <FaAward className='text-orange-500' /> Achievements
                    </h2>
                    <div className='flex flex-wrap gap-3'>
                        {totalDeliveries >= 10 && (
                            <div className='flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border-2 border-amber-200'>
                                <FaMedal className='text-amber-500' />
                                <span className='text-xs font-bold text-amber-700'>10+ Deliveries</span>
                            </div>
                        )}
                        {totalDeliveries >= 50 && (
                            <div className='flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border-2 border-blue-200'>
                                <FaMedal className='text-blue-500' />
                                <span className='text-xs font-bold text-blue-700'>50+ Deliveries</span>
                            </div>
                        )}
                        {totalDeliveries >= 100 && (
                            <div className='flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50 border-2 border-purple-200'>
                                <FaMedal className='text-purple-500' />
                                <span className='text-xs font-bold text-purple-700'>100+ Deliveries</span>
                            </div>
                        )}
                        {rating >= 4.5 && ratingCount > 0 && (
                            <div className='flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 border-2 border-green-200'>
                                <FaStar className='text-green-500' />
                                <span className='text-xs font-bold text-green-700'>Top Rated</span>
                            </div>
                        )}
                        {isApproved && (
                            <div className='flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 border-2 border-green-200'>
                                <FaShieldAlt className='text-green-500' />
                                <span className='text-xs font-bold text-green-700'>Verified Partner</span>
                            </div>
                        )}
                        {!isApproved && (
                            <div className='flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border-2 border-amber-200'>
                                <FaClock className='text-amber-500' />
                                <span className='text-xs font-bold text-amber-700'>Awaiting Verification</span>
                            </div>
                        )}
                    </div>
                </motion.div>

            </div>
        </div>
    )
}

export default DeliveryBoyProfile