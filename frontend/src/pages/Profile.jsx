import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../../config'
import { setUserData } from '../redux/userSlice'
import { toast } from 'react-toastify'
import { ClipLoader } from 'react-spinners'
import { 
    FaCamera, FaEdit, FaArrowLeft, FaUser, FaPhone, FaEnvelope, 
    FaCheckCircle, FaExclamationCircle, FaLock, FaKey, FaUserCircle,
    FaShieldAlt, FaIdCard, FaMobileAlt, FaRegEnvelope, FaPen,
    FaSave, FaTimes, FaGoogle, FaArrowRight, FaRocket,
    FaCrown, FaGem, FaStar, FaHeart, FaInfoCircle
} from 'react-icons/fa'
import { MdDeliveryDining, MdRestaurant, MdVerified } from 'react-icons/md'
import { motion } from 'framer-motion'

function Profile() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)
    
    const [loading, setLoading] = useState(false)
    const [photoLoading, setPhotoLoading] = useState(false)
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
            const errorMsg = error.response?.data?.message || 'Failed to change password'
            toast.error(errorMsg)
            setLoading(false)
        }
    }

    const handleSetPassword = async () => {
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
            const result = await axios.post(`${serverUrl}/api/user/set-password`, {
                newPassword
            }, { withCredentials: true })
            
            dispatch(setUserData(result.data.user))
            
            toast.success('Password set successfully! 🔒')
            setNewPassword('')
            setConfirmPassword('')
            setIsChangingPassword(false)
            setLoading(false)
            
            setTimeout(() => window.location.reload(), 500)
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to set password'
            toast.error(errorMsg)
            setLoading(false)
        }
    }

    const handleUploadPhoto = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif']
        if (!validTypes.includes(file.type)) {
            toast.error('Please upload a valid image file (JPEG, PNG, WEBP, GIF)')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB')
            return
        }

        const formData = new FormData()
        formData.append('avatar', file)
        setPhotoLoading(true)

        try {
            const response = await axios.post(`${serverUrl}/api/user/upload-avatar`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            
            if (response && response.data) {
                const avatarUrl = response.data.avatar || 
                                  response.data.profilePhoto || 
                                  response.data.image || 
                                  response.data.url ||
                                  response.data.user?.avatar ||
                                  response.data.user?.profilePhoto
                
                const updatedUser = { 
                    ...userData, 
                    profilePhoto: avatarUrl,
                    avatar: avatarUrl
                }
                dispatch(setUserData(updatedUser))
                toast.success('Profile photo updated! 📸')
            }
            
            setPhotoLoading(false)
        } catch (error) {
            console.error('Upload error:', error)
            const errorMsg = error.response?.data?.message || 'Upload failed. Please try again.'
            toast.error(errorMsg)
            setPhotoLoading(false)
        }
    }

    const getRoleInfo = () => {
        switch(userData?.role) {
            case 'owner': 
                return { 
                    icon: <MdRestaurant size={18} />, 
                    label: 'Restaurant Owner',
                    color: 'text-orange-600',
                    bg: 'bg-orange-50',
                    border: 'border-orange-200'
                }
            case 'deliveryBoy': 
                return { 
                    icon: <MdDeliveryDining size={18} />, 
                    label: 'Delivery Partner',
                    color: 'text-blue-600',
                    bg: 'bg-blue-50',
                    border: 'border-blue-200'
                }
            case 'superAdmin': 
                return { 
                    icon: <FaShieldAlt size={16} />, 
                    label: 'Super Admin',
                    color: 'text-purple-600',
                    bg: 'bg-purple-50',
                    border: 'border-purple-200'
                }
            default: 
                return { 
                    icon: <FaUser size={14} />, 
                    label: 'Customer',
                    color: 'text-orange-600',
                    bg: 'bg-orange-50',
                    border: 'border-orange-200'
                }
        }
    }

    const roleInfo = getRoleInfo()
    const isGoogleUser = userData?.mobile === '0000000000' || userData?.mobile === '000000000' || !userData?.password
    const fadeUp = `transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`

    if (!userData) {
        return (
            <div className='min-h-screen bg-white flex items-center justify-center'>
                <div className='flex flex-col items-center gap-5'>
                    <div className='relative'>
                        <ClipLoader size={48} color="#d4845a" />
                        <div className='absolute inset-0 animate-ping rounded-full border border-orange-300/20' />
                    </div>
                    <p className='text-gray-400 text-sm tracking-wide'>Loading profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div 
            className='min-h-screen bg-white relative'
            style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-track { background: #f1f1f1; }
                ::-webkit-scrollbar-thumb { 
                    background: #d4845a; 
                    border-radius: 10px; 
                }
                ::-webkit-scrollbar-thumb:hover { 
                    background: #c2744a; 
                }
            `}</style>

            <div className='max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10'>
                
                {/* Header */}
                <div className={`flex items-center gap-4 mb-8 ${fadeUp}`}>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className='w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-all duration-200'
                        onClick={() => navigate('/')}
                    >
                        <FaArrowLeft size={14} className='text-gray-600' />
                    </motion.button>
                    <div>
                        <h1 className='text-xl font-semibold text-gray-900 tracking-tight'>
                            My Profile
                        </h1>
                        <p className='text-gray-400 text-xs mt-0.5'>Manage your account settings</p>
                    </div>
                </div>

                {/* Main Profile Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className='rounded-2xl border border-gray-200 bg-white p-6 sm:p-7 shadow-sm'
                >
                    <div className='flex flex-col items-center'>
                        
                        {/* Avatar */}
                        <div className='relative group'>
                            <div className='absolute -inset-1 rounded-full bg-gradient-to-br from-orange-400/30 to-amber-400/20 opacity-60 group-hover:opacity-100 blur-md transition-opacity duration-300' />
                            
                            {photoLoading ? (
                                <div className='w-28 h-28 rounded-full bg-gray-100 border-2 border-orange-400 flex items-center justify-center relative z-10'>
                                    <ClipLoader size={26} color="#d4845a" />
                                </div>
                            ) : (
                                <img 
                                    src={userData.profilePhoto || userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.fullName || 'User')}&background=d4845a&color=fff&size=140&bold=true`} 
                                    alt="Profile" 
                                    className='w-28 h-28 rounded-full object-cover border-2 border-orange-400 relative z-10 group-hover:scale-[1.03] transition-transform duration-300'
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.fullName || 'User')}&background=d4845a&color=fff&size=140&bold=true`
                                    }}
                                />
                            )}
                            <label className='absolute bottom-0.5 right-0.5 z-20 w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center cursor-pointer shadow-lg shadow-orange-200 transition-all duration-200 hover:scale-110'>
                                {photoLoading ? <ClipLoader size={12} color="white" /> : <FaCamera size={12} />}
                                <input type="file" accept="image/*" className='hidden' onChange={handleUploadPhoto} disabled={photoLoading} />
                            </label>
                        </div>
                        
                        <h2 className='text-xl font-semibold text-gray-900 mt-4 flex items-center gap-2'>
                            {userData.fullName}
                            {userData.isEmailVerified && (
                                <MdVerified size={18} className='text-green-500' />
                            )}
                        </h2>
                        
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${roleInfo.bg} ${roleInfo.border} border mt-2`}>
                            <span className={roleInfo.color}>{roleInfo.icon}</span>
                            <span className={`text-xs font-medium ${roleInfo.color}`}>{roleInfo.label}</span>
                        </div>

                        {isGoogleUser && (
                            <div className='flex items-center gap-2 mt-2.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200'>
                                <FaGoogle size={11} className='text-blue-500' />
                                <span className='text-[11px] text-blue-600 font-medium'>Google Account</span>
                            </div>
                        )}

                        {/* Info Grid */}
                        <div className='w-full mt-7 space-y-3'>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                {/* Name */}
                                <div className='bg-gray-50 hover:bg-gray-100 p-3.5 rounded-xl border border-gray-200 hover:border-orange-300 transition-all duration-200'>
                                    <div className='flex items-center gap-3'>
                                        <div className='w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0'>
                                            <FaUser size={13} className='text-orange-500' />
                                        </div>
                                        <div className='min-w-0'>
                                            <p className='text-gray-400 text-[10px] font-medium tracking-wider uppercase'>Full Name</p>
                                            <p className='text-gray-800 font-medium truncate text-sm mt-0.5'>{userData.fullName}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile */}
                                <div className='bg-gray-50 hover:bg-gray-100 p-3.5 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200'>
                                    <div className='flex items-center gap-3'>
                                        <div className='w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0'>
                                            <FaMobileAlt size={13} className='text-blue-500' />
                                        </div>
                                        <div className='min-w-0'>
                                            <p className='text-gray-400 text-[10px] font-medium tracking-wider uppercase'>Mobile</p>
                                            <p className='text-gray-800 font-medium truncate text-sm mt-0.5'>
                                                {mobile || (
                                                    <span className='text-gray-400 italic text-xs font-normal'>
                                                        {isGoogleUser ? 'Add mobile' : 'Not provided'}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className='sm:col-span-2 bg-gray-50 hover:bg-gray-100 p-3.5 rounded-xl border border-gray-200 hover:border-green-300 transition-all duration-200'>
                                    <div className='flex items-center gap-3'>
                                        <div className='w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0'>
                                            <FaRegEnvelope size={13} className='text-green-500' />
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <p className='text-gray-400 text-[10px] font-medium tracking-wider uppercase'>Email</p>
                                            <p className='text-gray-800 font-medium truncate text-sm mt-0.5'>{userData.email}</p>
                                        </div>
                                        {!userData.isEmailVerified ? (
                                            <span className='flex items-center gap-1.5 text-amber-600 text-[10px] bg-amber-50 px-2.5 py-1 rounded-full flex-shrink-0 border border-amber-200'>
                                                <FaExclamationCircle size={9} />
                                                Verify
                                            </span>
                                        ) : (
                                            <span className='flex items-center gap-1.5 text-green-600 text-[10px] bg-green-50 px-2.5 py-1 rounded-full flex-shrink-0 border border-green-200'>
                                                <FaCheckCircle size={9} />
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {!isEditing && (
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    className='w-full mt-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-all duration-200 shadow-sm shadow-orange-200 flex items-center justify-center gap-2 text-sm'
                                    onClick={() => setIsEditing(true)}
                                >
                                    <FaEdit size={13} />
                                    <span>Edit Profile</span>
                                </motion.button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Edit Mode */}
                {isEditing && (
                    <motion.div 
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='mt-4 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm'
                    >
                        <div className='space-y-4'>
                            <div>
                                <label className='block text-gray-500 text-xs font-medium mb-1.5 tracking-wide'>Full Name</label>
                                <input
                                    type="text"
                                    className='w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-all duration-200 text-sm'
                                    placeholder='Enter your full name'
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className='block text-gray-500 text-xs font-medium mb-1.5 tracking-wide'>Mobile</label>
                                <input
                                    type="text"
                                    className='w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-all duration-200 text-sm'
                                    placeholder={isGoogleUser ? 'Add your mobile number' : 'Enter mobile number'}
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                                    maxLength={10}
                                />
                            </div>
                            <div>
                                <label className='block text-gray-500 text-xs font-medium mb-1.5 tracking-wide'>Email</label>
                                <input
                                    type="email"
                                    className='w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-all duration-200 text-sm'
                                    placeholder='Enter email'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            
                            <div className='flex gap-3 pt-1'>
                                <button
                                    className='flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-all duration-200 disabled:opacity-50 shadow-sm shadow-orange-200 flex items-center justify-center gap-2 text-sm'
                                    onClick={handleUpdateProfile}
                                    disabled={loading}
                                >
                                    {loading ? <ClipLoader size={15} color='white' /> : <><FaSave size={12} /> Save</>}
                                </button>
                                <button
                                    className='flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm'
                                    onClick={() => setIsEditing(false)}
                                >
                                    <FaTimes size={12} /> Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Security Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.1 }}
                    className='rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 mt-4 shadow-sm'
                >
                    <div className='flex items-center gap-3 mb-4'>
                        <div className='w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 border border-amber-200'>
                            <FaLock size={15} className='text-amber-500' />
                        </div>
                        <div>
                            <h3 className='text-gray-800 font-medium text-sm'>
                                {isGoogleUser ? 'Set Password' : 'Security Settings'}
                            </h3>
                            <p className='text-gray-400 text-xs mt-0.5'>
                                {isGoogleUser 
                                    ? 'Set a password for your Google account' 
                                    : 'Manage your password and security'}
                            </p>
                        </div>
                    </div>

                    {isChangingPassword ? (
                        <div className='space-y-3'>
                            {!isGoogleUser && (
                                <input
                                    type="password"
                                    placeholder='Current Password'
                                    className='w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-orange-400 transition-all duration-200 text-sm'
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                            )}
                            <input
                                type="password"
                                placeholder='New Password'
                                className='w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-orange-400 transition-all duration-200 text-sm'
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder='Confirm Password'
                                className='w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-orange-400 transition-all duration-200 text-sm'
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <div className='flex gap-3 pt-1'>
                                <button
                                    className='flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-all duration-200 disabled:opacity-50 shadow-sm shadow-orange-200 flex items-center justify-center gap-2 text-sm'
                                    onClick={isGoogleUser ? handleSetPassword : handleChangePassword}
                                    disabled={loading}
                                >
                                    {loading ? <ClipLoader size={15} color='white' /> : <><FaKey size={12} /> {isGoogleUser ? 'Set Password' : 'Update'}</>}
                                </button>
                                <button
                                    className='flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm'
                                    onClick={() => {
                                        setIsChangingPassword(false)
                                        setCurrentPassword('')
                                        setNewPassword('')
                                        setConfirmPassword('')
                                    }}
                                >
                                    <FaTimes size={12} /> Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <button
                                className='w-full py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-800 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-2 text-sm'
                                onClick={() => setIsChangingPassword(true)}
                            >
                                {isGoogleUser ? <FaKey size={13} /> : <FaLock size={13} />}
                                <span>{isGoogleUser ? 'Set Password' : 'Change Password'}</span>
                            </button>
                            
                            {!isGoogleUser && (
                                <div className='flex items-center justify-center gap-2 mt-3'>
                                    <span className='text-gray-400 text-xs'>Forgot password?</span>
                                    <span 
                                        className='text-xs text-orange-500 cursor-pointer font-medium hover:text-orange-600 transition flex items-center gap-1'
                                        onClick={() => navigate("/forgot-password")}
                                    >
                                        Reset here <FaArrowRight size={9} />
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Google User Info */}
                {isGoogleUser && (
                    <motion.div 
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.15 }}
                        className='rounded-2xl border border-gray-200 bg-white p-4 mt-4 shadow-sm'
                    >
                        <div className='flex items-start gap-3'>
                            <div className='w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-200 mt-0.5'>
                                <FaInfoCircle size={14} className='text-blue-500' />
                            </div>
                            <div>
                                <h3 className='text-gray-800 font-medium text-sm'>Google Account</h3>
                                <p className='text-gray-400 text-xs mt-1 leading-relaxed'>
                                    You are signed in with Google. Set a password above to enable regular login.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default Profile