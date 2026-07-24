import React from 'react'
import { IoArrowBack } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    FaUtensils, FaStore, FaImage, FaMapMarkerAlt, FaCity, FaMapPin, 
    FaSave, FaEdit, FaPlus, FaStoreAlt, FaBuilding, FaGlobe,
    FaCamera, FaUpload, FaCheck, FaTimes, FaArrowRight,
    FaClock, FaShieldAlt, FaRocket, FaGem, FaAward,
    FaInfoCircle, FaCheckCircle, FaExclamationTriangle,
    FaStar, FaHeart, FaFire, FaCrown, FaMagic, FaMotorcycle
} from "react-icons/fa";
import { MdRestaurant, MdLocationOn, MdVerified } from "react-icons/md";
import { useState } from 'react';
import { toast } from "react-toastify";
import axios from 'axios';
import { serverUrl } from '../App';
import { setMyShopData } from '../redux/ownerSlice';
import { ClipLoader } from 'react-spinners';
import { motion, AnimatePresence } from 'framer-motion';

function CreateEditShop() {
    const { myShopData } = useSelector(state => state.owner)
    const { currentCity, currentState, currentAddress } = useSelector(state => state.user)
    const navigate = useNavigate()
    
    const [name, setName] = useState(myShopData?.name || "")
    const [address, setAddress] = useState(myShopData?.address || currentAddress || "")
    const [city, setCity] = useState(myShopData?.city || currentCity || "")
    const [state, setState] = useState(myShopData?.state || currentState || "")
    const [frontendImage, setFrontendImage] = useState(myShopData?.image || null)
    const [backendImage, setBackendImage] = useState(null)
    const [loading, setLoading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [activeStep, setActiveStep] = useState(1)
    const [isFocused, setIsFocused] = useState(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const dispatch = useDispatch()

    React.useEffect(() => {
        setTimeout(() => setIsLoaded(true), 300)
    }, [])

    const isEditing = !!myShopData
    const isPending = myShopData && !myShopData.isApproved

    const steps = [
        { id: 1, label: 'Basic Info', icon: <FaStore />, desc: 'Shop details' },
        { id: 2, label: 'Location', icon: <FaMapMarkerAlt />, desc: 'Address' },
        { id: 3, label: 'Image', icon: <FaImage />, desc: 'Upload photo' }
    ]

    const handleImage = (e) => {
        const file = e.target.files[0]
        if (file) {
            setBackendImage(file)
            setFrontendImage(URL.createObjectURL(file))
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith('image/')) {
            setBackendImage(file)
            setFrontendImage(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e) => {
        setLoading(true)
        e.preventDefault()
        
        if (!name.trim()) {
            toast.error('Please enter shop name')
            setLoading(false)
            return
        }
        if (!address.trim()) {
            toast.error('Please enter shop address')
            setLoading(false)
            return
        }
        if (!city.trim()) {
            toast.error('Please enter city')
            setLoading(false)
            return
        }
        if (!state.trim()) {
            toast.error('Please enter state')
            setLoading(false)
            return
        }

        try {
            const formData = new FormData()
            formData.append("name", name.trim())
            formData.append("city", city.trim())
            formData.append("state", state.trim())
            formData.append("address", address.trim())
            if (backendImage) {
                formData.append("image", backendImage)
            }
            
            const result = await axios.post(`${serverUrl}/api/shop/create-edit`, formData, { 
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            
            dispatch(setMyShopData(result.data))
            setLoading(false)
            setShowSuccess(true)
            
            if (isEditing) {
                toast.success("Shop updated successfully! 🎉")
            } else {
                toast.success("Shop created successfully! 🎉")
                toast.info("⏳ Your shop is pending admin approval.")
            }
            
            setTimeout(() => {
                setShowSuccess(false)
                navigate("/home")
            }, 2000)
            
        } catch (error) {
            console.log(error)
            setLoading(false)
            toast.error(error.response?.data?.message || "Something went wrong ❌")
        }
    }

    const fadeUp = `transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`

    return (
        <div className='min-h-screen bg-[#0a0a0f] relative overflow-hidden p-4'>
            
            {/* ✅ Ultra Premium Animated Background */}
            <div className='absolute inset-0 pointer-events-none'>
                <motion.div 
                    animate={{ x: [0, 80, -40, 0], y: [0, -40, 60, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className='absolute -top-40 -left-40 w-[700px] h-[700px] bg-[#ff2d55]/4 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ x: [0, -80, 40, 0], y: [0, 40, -60, 0] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className='absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-[#ff6b35]/4 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[#ffd93d]/2 rounded-full blur-3xl'
                />
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className='absolute w-1 h-1 rounded-full bg-white/20'
                        animate={{
                            x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
                            y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
                            opacity: [0, 0.5, 0]
                        }}
                        transition={{
                            duration: 10 + Math.random() * 10,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                ))}
            </div>

            {/* ✅ Premium Back Button */}
            <motion.button 
                initial={{ opacity: 0, x: -30, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                whileHover={{ scale: 1.08, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                className='fixed top-6 left-6 z-50 glass-premium px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-white/80 hover:text-white transition-all duration-300 flex items-center gap-2 text-xs sm:text-sm font-medium hover:shadow-2xl hover:shadow-[#ff2d55]/20 border border-white/10 hover:border-[#ff2d55]/30 backdrop-blur-2xl'
                onClick={() => navigate("/home")}
            >
                <IoArrowBack size={16} className='group-hover:-translate-x-1 transition-transform' />
                <span className='hidden sm:inline'>Back to Dashboard</span>
            </motion.button>

            {/* ✅ Main Container */}
            <div className='relative z-10 max-w-6xl mx-auto mt-14 sm:mt-16'>
                
                {/* ✅ Ultra Premium Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 sm:mb-10 ${fadeUp}`}
                >
                    <div className='flex items-center gap-3 sm:gap-5'>
                        <motion.div 
                            whileHover={{ rotate: 15, scale: 1.1 }}
                            animate={{ 
                                boxShadow: ['0 0 20px rgba(255,45,85,0.3)', '0 0 40px rgba(255,45,85,0.6)', '0 0 20px rgba(255,45,85,0.3)']
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className='w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center shadow-2xl shadow-[#ff2d55]/40 relative'
                        >
                            {isEditing ? <FaEdit className='text-white text-2xl sm:text-3xl' /> : <FaStore className='text-white text-2xl sm:text-3xl' />}
                            <motion.div 
                                className='absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-[#0a0a0f]'
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                        </motion.div>
                        <div>
                            <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight'>
                                {isEditing ? 'Edit Shop' : 'Create Shop'}
                                <span className='ml-2 sm:ml-3 text-xs sm:text-sm font-normal bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] bg-clip-text text-transparent'>
                                    {isEditing ? '✏️ Update' : '🚀 New'}
                                </span>
                            </h1>
                            <p className='text-white/40 text-xs sm:text-sm flex items-center gap-2'>
                                <span className='w-1.5 h-1.5 rounded-full bg-[#ff6b35] animate-pulse' />
                                {isEditing ? 'Update your restaurant details' : 'Start your food delivery journey'}
                            </p>
                        </div>
                    </div>
                    
                    {isPending && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            className='flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 shadow-lg shadow-yellow-500/10'
                        >
                            <div className='relative'>
                                <FaClock className='text-yellow-400 text-xs sm:text-sm' />
                                <span className='absolute -top-1 -right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping' />
                            </div>
                            <span className='text-yellow-400 text-[10px] sm:text-xs font-medium'>Pending Approval</span>
                            <span className='w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse' />
                        </motion.div>
                    )}
                </motion.div>

                {/* ✅ Premium Steps - Responsive */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-2 sm:gap-3 mb-8 sm:mb-10 px-3 sm:px-5 py-3 sm:py-4 rounded-2xl glass-premium border border-white/5 shadow-xl shadow-black/20 overflow-x-auto ${fadeUp}`}
                >
                    {steps.map((step, idx) => (
                        <React.Fragment key={step.id}>
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className={`flex items-center gap-2 sm:gap-3 cursor-pointer px-2 sm:px-3 py-1 rounded-xl transition-all duration-300 flex-shrink-0 ${
                                    activeStep >= step.id 
                                        ? 'bg-gradient-to-r from-[#ff2d55]/20 to-[#ff6b35]/20 border border-[#ff2d55]/20' 
                                        : 'hover:bg-white/5'
                                }`}
                                onClick={() => setActiveStep(step.id)}
                            >
                                <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${
                                    activeStep >= step.id 
                                        ? 'bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white shadow-lg shadow-[#ff2d55]/30' 
                                        : 'bg-white/10 text-white/30'
                                }`}>
                                    {activeStep > step.id ? <FaCheck size={12} className="sm:text-sm" /> : step.id}
                                </div>
                                <div className='hidden sm:block'>
                                    <p className={`text-[10px] sm:text-xs font-medium ${
                                        activeStep >= step.id ? 'text-white' : 'text-white/30'
                                    }`}>
                                        {step.label}
                                    </p>
                                    <p className='text-[7px] sm:text-[8px] text-white/20'>{step.desc}</p>
                                </div>
                            </motion.div>
                            {idx < steps.length - 1 && (
                                <motion.div 
                                    className={`flex-1 h-[2px] rounded-full transition-all duration-500 ${
                                        activeStep > step.id ? 'bg-gradient-to-r from-[#ff2d55] to-[#ff6b35]' : 'bg-white/10'
                                    }`}
                                    animate={{ 
                                        width: activeStep > step.id ? '100%' : '50%'
                                    }}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </motion.div>

                {/* ✅ Main Content - Grid */}
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6'>
                    
                    {/* ✅ Left Column - Form (2/3) */}
                    <div className='lg:col-span-2'>
                        <motion.div 
                            initial={{ opacity: 0, x: -40, rotateY: -5 }}
                            animate={{ opacity: 1, x: 0, rotateY: 0 }}
                            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                            className='glass-premium rounded-3xl border border-white/5 p-5 sm:p-6 md:p-8 shadow-2xl shadow-[#ff2d55]/5 relative overflow-hidden group hover:shadow-[#ff2d55]/15 transition-all duration-500'
                        >
                            <div className='absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff2d55] to-transparent' />
                            <div className='absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent' />
                            <div className='absolute -top-20 -right-20 w-40 h-40 bg-[#ff2d55]/5 rounded-full blur-2xl group-hover:bg-[#ff2d55]/10 transition-all duration-700' />
                            <div className='absolute -bottom-20 -left-20 w-40 h-40 bg-[#ff6b35]/5 rounded-full blur-2xl group-hover:bg-[#ff6b35]/10 transition-all duration-700' />

                            <form className='space-y-4 sm:space-y-5 relative z-10' onSubmit={handleSubmit}>
                                
                                {/* ✅ Shop Name */}
                                <div>
                                    <label className='block text-white/60 text-[10px] sm:text-xs font-medium mb-1.5 flex items-center gap-2'>
                                        <FaStore className='text-[#ff6b35]' size={14} />
                                        Shop Name
                                    </label>
                                    <div className='relative group'>
                                        <input 
                                            type="text" 
                                            placeholder='Enter your shop name...' 
                                            className={`w-full bg-[#18181D] border rounded-xl px-4 py-3 sm:py-3.5 text-white placeholder:text-white/30 focus:outline-none transition-all duration-300 text-sm ${
                                                isFocused === 'name' 
                                                    ? 'border-[#ff2d55] shadow-lg shadow-[#ff2d55]/10' 
                                                    : 'border-white/10 hover:border-white/20'
                                            }`}
                                            onChange={(e) => setName(e.target.value)}
                                            value={name}
                                            onFocus={() => { setActiveStep(1); setIsFocused('name') }}
                                            onBlur={() => setIsFocused(null)}
                                            required
                                        />
                                        <motion.div 
                                            className='absolute right-3 top-1/2 -translate-y-1/2 text-white/20'
                                            animate={{ opacity: name ? 1 : 0 }}
                                        >
                                            <FaCheckCircle size={16} className='text-green-400' />
                                        </motion.div>
                                    </div>
                                </div>

                                {/* ✅ Address */}
                                <div>
                                    <label className='block text-white/60 text-[10px] sm:text-xs font-medium mb-1.5 flex items-center gap-2'>
                                        <FaMapMarkerAlt className='text-[#ff6b35]' size={14} />
                                        Address
                                    </label>
                                    <div className='relative group'>
                                        <input 
                                            type="text" 
                                            placeholder='Enter your shop address...' 
                                            className={`w-full bg-[#18181D] border rounded-xl px-4 py-3 sm:py-3.5 text-white placeholder:text-white/30 focus:outline-none transition-all duration-300 text-sm ${
                                                isFocused === 'address' 
                                                    ? 'border-[#ff2d55] shadow-lg shadow-[#ff2d55]/10' 
                                                    : 'border-white/10 hover:border-white/20'
                                            }`}
                                            onChange={(e) => setAddress(e.target.value)}
                                            value={address}
                                            onFocus={() => { setActiveStep(2); setIsFocused('address') }}
                                            onBlur={() => setIsFocused(null)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* ✅ City & State */}
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                    <div>
                                        <label className='block text-white/60 text-[10px] sm:text-xs font-medium mb-1.5 flex items-center gap-2'>
                                            <FaCity className='text-[#ff6b35]' size={14} />
                                            City
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder='Enter city...' 
                                            className='w-full bg-[#18181D] border border-white/10 rounded-xl px-4 py-3 sm:py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 text-sm'
                                            onChange={(e) => setCity(e.target.value)}
                                            value={city}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-white/60 text-[10px] sm:text-xs font-medium mb-1.5 flex items-center gap-2'>
                                            <FaMapPin className='text-[#ff6b35]' size={14} />
                                            State
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder='Enter state...' 
                                            className='w-full bg-[#18181D] border border-white/10 rounded-xl px-4 py-3 sm:py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 text-sm'
                                            onChange={(e) => setState(e.target.value)}
                                            value={state}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* ✅ Image Upload */}
                                <div>
                                    <label className='block text-white/60 text-[10px] sm:text-xs font-medium mb-1.5 flex items-center gap-2'>
                                        <FaImage className='text-[#ff6b35]' size={14} />
                                        Shop Image
                                    </label>
                                    <div 
                                        className={`relative border-2 border-dashed rounded-xl p-4 sm:p-6 text-center transition-all duration-300 ${
                                            isDragging 
                                                ? 'border-[#ff2d55] bg-[#ff2d55]/10 shadow-lg shadow-[#ff2d55]/20' 
                                                : 'border-white/10 hover:border-[#ff2d55]/30 hover:bg-white/5'
                                        }`}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onFocus={() => setActiveStep(3)}
                                    >
                                        <input 
                                            type="file" 
                                            accept='image/*' 
                                            className='absolute inset-0 opacity-0 cursor-pointer z-10'
                                            onChange={handleImage}
                                        />
                                        <div className='flex flex-col items-center gap-2'>
                                            <motion.div 
                                                className='w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/5 flex items-center justify-center'
                                                whileHover={{ scale: 1.1, rotate: 10 }}
                                            >
                                                <FaCamera className='text-white/30 text-xl sm:text-2xl' />
                                            </motion.div>
                                            <p className='text-white/30 text-xs sm:text-sm'>
                                                {isDragging ? 'Drop your image here 📥' : 'Click or drag to upload'}
                                            </p>
                                            <p className='text-white/20 text-[10px] sm:text-xs'>PNG, JPG up to 5MB</p>
                                        </div>
                                    </div>
                                    
                                    {frontendImage && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            className='mt-4 relative group'
                                        >
                                            <img 
                                                src={frontendImage} 
                                                alt="Shop preview" 
                                                className='w-full h-40 sm:h-52 object-cover rounded-xl border border-white/10 shadow-xl'
                                            />
                                            <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-xl' />
                                            <button
                                                type="button"
                                                className='absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-500 hover:scale-110 transition-all duration-300 shadow-lg shadow-red-500/30'
                                                onClick={() => {
                                                    setFrontendImage(null)
                                                    setBackendImage(null)
                                                }}
                                            >
                                                <FaTimes size={14} className="sm:text-base" />
                                            </button>
                                            <div className='absolute bottom-2 left-2 sm:bottom-3 sm:left-3 flex items-center gap-2'>
                                                <div className='px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10'>
                                                    <span className='text-white/60 text-[10px] sm:text-xs'>✅ Image uploaded</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* ✅ Submit Button */}
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className='w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white font-semibold shadow-lg shadow-[#ff2d55]/30 hover:shadow-[#ff2d55]/50 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 text-xs sm:text-sm group'
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ClipLoader size={20} color='white' />
                                    ) : (
                                        <>
                                            <FaSave size={14} className="sm:text-base group-hover:scale-110 transition-transform" />
                                            {isEditing ? 'Update Shop' : 'Create Shop'}
                                            <FaArrowRight size={12} className="sm:text-sm group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>

                    {/* ✅ Right Column - Info (1/3) */}
                    <div className='space-y-4'>
                        
                        {/* ✅ Pending Status Card */}
                        {isPending && (
                            <motion.div 
                                initial={{ opacity: 0, x: 40, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                whileHover={{ scale: 1.02 }}
                                className='glass-premium p-4 sm:p-5 rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-yellow-600/5'
                            >
                                <div className='flex items-start gap-3'>
                                    <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0'>
                                        <FaClock className='text-yellow-400 text-lg sm:text-xl' />
                                    </div>
                                    <div>
                                        <h4 className='text-yellow-400 font-semibold text-xs sm:text-sm'>Pending Approval</h4>
                                        <p className='text-white/40 text-[10px] sm:text-xs mt-1'>Your shop is under review by admin.</p>
                                        <div className='mt-2 sm:mt-3 flex items-center gap-2'>
                                            <span className='w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping' />
                                            <span className='text-yellow-400/60 text-[8px] sm:text-[10px]'>Under Review</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ✅ Quick Tips */}
                        <motion.div 
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            whileHover={{ y: -2 }}
                            className='glass-premium p-4 sm:p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent'
                        >
                            <h4 className='text-white font-semibold text-xs sm:text-sm mb-3 sm:mb-4 flex items-center gap-2'>
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <FaInfoCircle className='text-[#ff6b35] text-sm sm:text-base' />
                                </motion.div>
                                Pro Tips
                            </h4>
                            <div className='space-y-2 sm:space-y-3'>
                                {[
                                    { icon: <FaStar className='text-yellow-400 text-xs sm:text-sm' />, text: 'Use a clear, high-quality shop image' },
                                    { icon: <FaCheckCircle className='text-green-400 text-xs sm:text-sm' />, text: 'Add complete address details' },
                                    { icon: <FaFire className='text-[#ff2d55] text-xs sm:text-sm' />, text: 'Keep shop name unique & catchy' },
                                    { icon: <FaCrown className='text-[#ffd93d] text-xs sm:text-sm' />, text: 'Add multiple items to attract customers' }
                                ].map((tip, idx) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + (idx * 0.1) }}
                                        className='flex items-center gap-2 text-white/40 text-[10px] sm:text-xs p-1.5 sm:p-2 rounded-lg hover:bg-white/5 transition-all duration-300'
                                    >
                                        <span className='text-sm sm:text-base'>{tip.icon}</span>
                                        {tip.text}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* ✅ Features */}
                        <motion.div 
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            whileHover={{ y: -2 }}
                            className='glass-premium p-4 sm:p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent'
                        >
                            <h4 className='text-white font-semibold text-xs sm:text-sm mb-3 sm:mb-4 flex items-center gap-2'>
                                <FaRocket className='text-[#ff2d55] text-sm sm:text-base' /> Platform Features
                            </h4>
                            <div className='grid grid-cols-3 gap-1.5 sm:gap-2'>
                                {[
                                    { icon: <FaShieldAlt className='text-[#ff6b35]' />, label: 'Secure' },
                                    { icon: <FaRocket className='text-[#ff2d55]' />, label: 'Fast' },
                                    { icon: <FaGem className='text-[#ffd93d]' />, label: 'Premium' },
                                    { icon: <FaAward className='text-purple-400' />, label: 'Trusted' },
                                    { icon: <FaHeart className='text-pink-400' />, label: 'Loved' },
                                    { icon: <FaMagic className='text-indigo-400' />, label: 'Smart' }
                                ].map((item, idx) => (
                                    <motion.div 
                                        key={idx}
                                        whileHover={{ scale: 1.1, y: -2 }}
                                        className='flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 border border-white/5 hover:border-[#ff2d55]/20 transition-all duration-300'
                                    >
                                        <span className='text-base sm:text-xl'>{item.icon}</span>
                                        <span className='text-white/30 text-[6px] sm:text-[8px] uppercase tracking-wider'>{item.label}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* ✅ Success Animation Overlay */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4'
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className='text-center max-w-sm w-full'
                        >
                            <motion.div 
                                className='w-20 h-20 sm:w-28 sm:h-28 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-2xl shadow-green-500/40'
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 0.6, repeat: Infinity }}
                            >
                                <motion.div
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <FaCheck className='text-white text-3xl sm:text-5xl' />
                                </motion.div>
                            </motion.div>
                            <motion.h3 
                                className='text-white font-bold text-xl sm:text-2xl mt-4 sm:mt-6'
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                {isEditing ? 'Updated Successfully!' : 'Created Successfully!'}
                            </motion.h3>
                            <p className='text-white/40 text-xs sm:text-sm mt-2'>
                                {isEditing ? 'Shop updated successfully' : 'Shop created successfully'}
                            </p>
                            {!isEditing && (
                                <motion.div 
                                    className='mt-3 sm:mt-4 inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-yellow-500/20 border border-yellow-500/30'
                                    animate={{ scale: [1, 1.02, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <FaClock className='text-yellow-400 text-xs sm:text-sm' />
                                    <span className='text-yellow-400/80 text-[10px] sm:text-xs'>⏳ Pending admin approval</span>
                                </motion.div>
                            )}
                            <motion.div 
                                className='mt-4 sm:mt-6 w-10 sm:w-12 h-1 mx-auto rounded-full bg-gradient-to-r from-[#ff2d55] to-[#ff6b35]'
                                animate={{ width: ['20%', '80%', '20%'] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .glass-premium {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .animate-pulse {
                    animation: pulse 2s ease-in-out infinite;
                }
                @keyframes float-3d {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(40px, -30px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
            `}</style>
        </div>
    )
}

export default CreateEditShop