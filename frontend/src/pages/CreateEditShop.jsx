import React, { useState, useEffect } from 'react'
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
import { toast } from "react-toastify";
import axios from 'axios';
import { serverUrl } from '../../config';
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
    const [isLoaded, setIsLoaded] = useState(false)
    const [errors, setErrors] = useState({})
    const dispatch = useDispatch()

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 300)
    }, [])

    useEffect(() => {
        return () => {
            if (frontendImage && frontendImage.startsWith('blob:')) {
                URL.revokeObjectURL(frontendImage)
            }
        }
    }, [frontendImage])

    const isEditing = !!myShopData
    const isPending = myShopData && !myShopData.isApproved

    const validateField = (field, value) => {
        const newErrors = { ...errors }
        if (!value || !value.trim()) {
            newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
        } else {
            delete newErrors[field]
        }
        setErrors(newErrors)
        return !newErrors[field]
    }

    const handleImage = (e) => {
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

        if (frontendImage && frontendImage.startsWith('blob:')) {
            URL.revokeObjectURL(frontendImage)
        }

        setBackendImage(file)
        setFrontendImage(URL.createObjectURL(file))
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
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB')
                return
            }
            if (frontendImage && frontendImage.startsWith('blob:')) {
                URL.revokeObjectURL(frontendImage)
            }
            setBackendImage(file)
            setFrontendImage(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        
        const isNameValid = validateField('name', name)
        const isAddressValid = validateField('address', address)
        const isCityValid = validateField('city', city)
        const isStateValid = validateField('state', state)
        
        if (!isNameValid || !isAddressValid || !isCityValid || !isStateValid) {
            toast.error('Please fill all required fields')
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
        <div className='min-h-screen bg-[#f8f4f0] py-6 px-4'>
            
            {/* Back Button */}
            <div className='max-w-5xl mx-auto mb-4'>
                <motion.button 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className='bg-white border-2 border-gray-200 px-4 py-2.5 rounded-full text-gray-600 hover:text-gray-800 hover:border-orange-300 transition-all duration-300 flex items-center gap-2 text-sm shadow-sm hover:shadow-md'
                    onClick={() => navigate("/home")}
                >
                    <IoArrowBack size={16} />
                    <span>Back to Dashboard</span>
                </motion.button>
            </div>

            {/* Main Container */}
            <div className='relative z-10 max-w-5xl mx-auto'>
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 ${fadeUp}`}
                >
                    <div className='flex items-center gap-4'>
                        <div className='w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center shadow-md shadow-orange-200'>
                            {isEditing ? <FaEdit className='text-white text-2xl' /> : <FaStore className='text-white text-2xl' />}
                        </div>
                        <div>
                            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight'>
                                {isEditing ? 'Edit Shop' : 'Create Shop'}
                            </h1>
                            <p className='text-gray-500 text-sm flex items-center gap-2 font-medium'>
                                <span className='w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse' />
                                {isEditing ? 'Update your restaurant details' : 'Start your food delivery journey'}
                            </p>
                        </div>
                    </div>
                    
                    {isPending && (
                        <div className='flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border-2 border-amber-200'>
                            <FaClock className='text-amber-500' />
                            <span className='text-amber-700 text-xs font-bold'>Pending Approval</span>
                            <span className='w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse' />
                        </div>
                    )}
                </motion.div>

                {/* Main Content - Square Layout */}
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                    
                    {/* Form - Takes 2/3 width */}
                    <div className='lg:col-span-2'>
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                            className={`bg-white border-2 border-gray-200 rounded-3xl p-6 sm:p-8 shadow-lg ${fadeUp}`}
                        >
                            <form className='space-y-5' onSubmit={handleSubmit}>
                                
                                {/* Shop Name - Full Width */}
                                <div>
                                    <label className='block text-gray-600 text-sm font-semibold mb-1.5 flex items-center gap-2'>
                                        <FaStore className='text-orange-500' size={14} />
                                        Shop Name <span className='text-red-500'>*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder='Enter your shop name...' 
                                        className={`w-full bg-gray-50 border-2 rounded-xl px-4 py-3.5 text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all duration-300 text-sm ${
                                            errors.name 
                                                ? 'border-red-400 hover:border-red-500' 
                                                : 'border-gray-200 hover:border-orange-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                                        }`}
                                        onChange={(e) => {
                                            setName(e.target.value)
                                            if (errors.name) validateField('name', e.target.value)
                                        }}
                                        value={name}
                                        onBlur={() => validateField('name', name)}
                                        required
                                    />
                                    {errors.name && (
                                        <p className='text-red-500 text-xs mt-1 font-medium'>{errors.name}</p>
                                    )}
                                </div>

                                {/* Address - Full Width */}
                                <div>
                                    <label className='block text-gray-600 text-sm font-semibold mb-1.5 flex items-center gap-2'>
                                        <FaMapMarkerAlt className='text-orange-500' size={14} />
                                        Address <span className='text-red-500'>*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder='Enter your shop address...' 
                                        className={`w-full bg-gray-50 border-2 rounded-xl px-4 py-3.5 text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all duration-300 text-sm ${
                                            errors.address 
                                                ? 'border-red-400 hover:border-red-500' 
                                                : 'border-gray-200 hover:border-orange-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                                        }`}
                                        onChange={(e) => {
                                            setAddress(e.target.value)
                                            if (errors.address) validateField('address', e.target.value)
                                        }}
                                        value={address}
                                        onBlur={() => validateField('address', address)}
                                        required
                                    />
                                    {errors.address && (
                                        <p className='text-red-500 text-xs mt-1 font-medium'>{errors.address}</p>
                                    )}
                                </div>

                                {/* City & State - Side by Side */}
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                    <div>
                                        <label className='block text-gray-600 text-sm font-semibold mb-1.5 flex items-center gap-2'>
                                            <FaCity className='text-orange-500' size={14} />
                                            City <span className='text-red-500'>*</span>
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder='Enter city...' 
                                            className={`w-full bg-gray-50 border-2 rounded-xl px-4 py-3.5 text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all duration-300 text-sm ${
                                                errors.city 
                                                    ? 'border-red-400 hover:border-red-500' 
                                                    : 'border-gray-200 hover:border-orange-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                                            }`}
                                            onChange={(e) => {
                                                setCity(e.target.value)
                                                if (errors.city) validateField('city', e.target.value)
                                            }}
                                            value={city}
                                            onBlur={() => validateField('city', city)}
                                            required
                                        />
                                        {errors.city && (
                                            <p className='text-red-500 text-xs mt-1 font-medium'>{errors.city}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className='block text-gray-600 text-sm font-semibold mb-1.5 flex items-center gap-2'>
                                            <FaMapPin className='text-orange-500' size={14} />
                                            State <span className='text-red-500'>*</span>
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder='Enter state...' 
                                            className={`w-full bg-gray-50 border-2 rounded-xl px-4 py-3.5 text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all duration-300 text-sm ${
                                                errors.state 
                                                    ? 'border-red-400 hover:border-red-500' 
                                                    : 'border-gray-200 hover:border-orange-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                                            }`}
                                            onChange={(e) => {
                                                setState(e.target.value)
                                                if (errors.state) validateField('state', e.target.value)
                                            }}
                                            value={state}
                                            onBlur={() => validateField('state', state)}
                                            required
                                        />
                                        {errors.state && (
                                            <p className='text-red-500 text-xs mt-1 font-medium'>{errors.state}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Image Upload - Full Width */}
                                <div>
                                    <label className='block text-gray-600 text-sm font-semibold mb-1.5 flex items-center gap-2'>
                                        <FaImage className='text-orange-500' size={14} />
                                        Shop Image
                                    </label>
                                    <div 
                                        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                                            isDragging 
                                                ? 'border-orange-400 bg-orange-50' 
                                                : 'border-gray-300 hover:border-orange-300 bg-gray-50 hover:bg-gray-100'
                                        }`}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                    >
                                        <input 
                                            type="file" 
                                            accept='image/*' 
                                            className='absolute inset-0 opacity-0 cursor-pointer z-10'
                                            onChange={handleImage}
                                        />
                                        <div className='flex flex-col items-center gap-2'>
                                            <div className='w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center'>
                                                <FaCamera className='text-gray-400 text-2xl' />
                                            </div>
                                            <p className='text-gray-500 text-sm font-medium'>
                                                {isDragging ? 'Drop your image here 📥' : 'Click or drag to upload'}
                                            </p>
                                            <p className='text-gray-400 text-xs'>PNG, JPG up to 5MB</p>
                                        </div>
                                    </div>
                                    
                                    {frontendImage && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className='mt-4 relative'
                                        >
                                            <img 
                                                src={frontendImage} 
                                                alt="Shop preview" 
                                                className='w-full h-48 object-cover rounded-xl border-2 border-gray-200'
                                            />
                                            <button
                                                type="button"
                                                className='absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all duration-300 text-sm shadow-md'
                                                onClick={() => {
                                                    if (frontendImage && frontendImage.startsWith('blob:')) {
                                                        URL.revokeObjectURL(frontendImage)
                                                    }
                                                    setFrontendImage(null)
                                                    setBackendImage(null)
                                                }}
                                            >
                                                <FaTimes size={14} />
                                            </button>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className='w-full py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-sm shadow-orange-200 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 text-sm'
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ClipLoader size={20} color='white' />
                                    ) : (
                                        <>
                                            <FaSave size={16} />
                                            {isEditing ? 'Update Shop' : 'Create Shop'}
                                            <FaArrowRight size={14} />
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>

                    {/* Sidebar - Takes 1/3 width */}
                    <div className='space-y-4'>
                        
                        {/* Pending Status */}
                        {isPending && (
                            <motion.div 
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                className='bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl'
                            >
                                <div className='flex items-start gap-3'>
                                    <div className='w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0'>
                                        <FaClock className='text-amber-600 text-lg' />
                                    </div>
                                    <div>
                                        <h4 className='text-amber-800 font-bold text-sm'>Pending Approval</h4>
                                        <p className='text-amber-600 text-xs mt-1 font-medium'>Your shop is under review by admin.</p>
                                        <div className='mt-2 flex items-center gap-2'>
                                            <span className='w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse' />
                                            <span className='text-amber-600 text-[10px] font-bold'>Under Review</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Quick Tips */}
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className='bg-white border-2 border-gray-200 p-5 rounded-2xl shadow-lg'
                        >
                            <h4 className='text-gray-800 font-semibold text-sm mb-3 flex items-center gap-2'>
                                <FaInfoCircle className='text-orange-500' /> Pro Tips
                            </h4>
                            <div className='space-y-2.5'>
                                {[
                                    { icon: <FaStar className='text-amber-400' />, text: 'Use a clear, high-quality shop image' },
                                    { icon: <FaCheckCircle className='text-green-500' />, text: 'Add complete address details' },
                                    { icon: <FaFire className='text-orange-500' />, text: 'Keep shop name unique & catchy' },
                                    { icon: <FaCrown className='text-amber-500' />, text: 'Add multiple items to attract customers' }
                                ].map((tip, idx) => (
                                    <div 
                                        key={idx}
                                        className='flex items-center gap-2.5 text-gray-600 text-xs font-medium p-2 rounded-lg hover:bg-gray-50 transition-all duration-300'
                                    >
                                        <span className='text-sm'>{tip.icon}</span>
                                        {tip.text}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Features */}
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className='bg-white border-2 border-gray-200 p-5 rounded-2xl shadow-lg'
                        >
                            <h4 className='text-gray-800 font-semibold text-sm mb-3 flex items-center gap-2'>
                                <FaRocket className='text-orange-500' /> Platform Features
                            </h4>
                            <div className='grid grid-cols-3 gap-2'>
                                {[
                                    { icon: <FaShieldAlt className='text-orange-500 text-lg' />, label: 'Secure' },
                                    { icon: <FaRocket className='text-orange-500 text-lg' />, label: 'Fast' },
                                    { icon: <FaGem className='text-amber-500 text-lg' />, label: 'Premium' },
                                    { icon: <FaAward className='text-purple-500 text-lg' />, label: 'Trusted' },
                                    { icon: <FaHeart className='text-pink-500 text-lg' />, label: 'Loved' },
                                    { icon: <FaMagic className='text-indigo-500 text-lg' />, label: 'Smart' }
                                ].map((item, idx) => (
                                    <div 
                                        key={idx}
                                        className='flex flex-col items-center gap-1 p-2 rounded-xl bg-gray-50 border border-gray-200'
                                    >
                                        <span className='text-xl'>{item.icon}</span>
                                        <span className='text-gray-500 text-[8px] uppercase tracking-wider font-semibold'>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Success Animation */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4'
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className='text-center max-w-sm w-full bg-white rounded-3xl p-8 shadow-2xl border-2 border-green-200'
                        >
                            <div className='w-20 h-20 mx-auto rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center'>
                                <FaCheck className='text-green-500 text-4xl' />
                            </div>
                            <h3 className='text-gray-800 font-bold text-xl mt-4'>
                                {isEditing ? 'Updated Successfully!' : 'Created Successfully!'}
                            </h3>
                            <p className='text-gray-500 text-sm mt-2'>
                                {isEditing ? 'Shop updated successfully' : 'Shop created successfully'}
                            </p>
                            {!isEditing && (
                                <div className='mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200'>
                                    <FaClock className='text-amber-500 text-sm' />
                                    <span className='text-amber-700 text-xs font-semibold'>⏳ Pending admin approval</span>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default CreateEditShop