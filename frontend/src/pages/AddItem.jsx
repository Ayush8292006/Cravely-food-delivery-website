import React, { useEffect, useState } from 'react'
import { IoArrowBack } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    FaUtensils, FaPlus, FaImage, FaTag, FaList, 
    FaLeaf, FaDrumstickBite, FaSave, FaArrowRight,
    FaCamera, FaUpload, FaCheck, FaTimes, FaInfoCircle,
    FaCheckCircle, FaStar, FaFire, FaRocket, FaShieldAlt,
    FaGem, FaAward, FaHeart, FaMagic, FaCrown,
    FaStore, FaMotorcycle, FaClock, FaUtensilSpoon,
    FaExclamationTriangle
} from "react-icons/fa";
import axios from 'axios';
import { serverUrl } from '../../config';
import { toast } from "react-toastify";
import { setMyShopData } from '../redux/ownerSlice';
import { ClipLoader } from 'react-spinners';
import { motion, AnimatePresence } from 'framer-motion';

function AddItem() {
    const { myShopData } = useSelector(state => state.owner)
    const navigate = useNavigate()
    const [name, setName] = useState("")
    const [price, setPrice] = useState(0)
    const [frontendImage, setFrontendImage] = useState(null)
    const [backendImage, setBackendImage] = useState(null)
    const [category, setCategory] = useState("")
    const [foodType, setFoodtype] = useState("veg")
    const [loading, setLoading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [errors, setErrors] = useState({})
    
    const categories = ["Snacks", "Main Course", "Desserts", "Pizza", "Burgers", "Sandwiches", "South Indian", "North Indian", "Chinese", "Fast Food", "Others"]
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

    useEffect(() => {
        if (!myShopData && isLoaded) {
            toast.warning('Please create a shop first to add items')
            navigate('/create-edit-shop')
        }
    }, [myShopData, isLoaded, navigate])

    const validateField = (field, value) => {
        const newErrors = { ...errors }
        if (!value || (typeof value === 'string' && !value.trim())) {
            newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
        } else if (field === 'price' && (value <= 0 || isNaN(value))) {
            newErrors[field] = 'Price must be greater than 0'
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
        const isPriceValid = validateField('price', price)
        const isCategoryValid = validateField('category', category)
        
        if (!isNameValid || !isPriceValid || !isCategoryValid) {
            toast.error('Please fill all required fields correctly')
            setLoading(false)
            return
        }

        try {
            const formData = new FormData()
            formData.append("name", name.trim())
            formData.append("category", category)
            formData.append("foodType", foodType)
            formData.append("price", price)
            if (backendImage) {
                formData.append("image", backendImage)
            }
            
            const result = await axios.post(`${serverUrl}/api/item/add-item`, formData, { 
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            
            dispatch(setMyShopData(result.data))
            setLoading(false)
            setShowSuccess(true)
            toast.success("Item added successfully! 🎉", {
                position: "top-center",
                autoClose: 3000,
            })
            
            setTimeout(() => {
                setShowSuccess(false)
                navigate("/owner-dashboard")
            }, 2000)
            
        } catch (error) {
            console.log(error)
            setLoading(false)
            toast.error(error.response?.data?.message || "Something went wrong ❌", {
                position: "top-center",
                autoClose: 3000,
            })
        }
    }

    const fadeUp = `transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`

    if (!isLoaded) {
        return (
            <div className='min-h-screen bg-white flex items-center justify-center'>
                <div className='flex flex-col items-center gap-4'>
                    <div className='w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin' />
                    <p className='text-gray-500 text-sm font-medium animate-pulse'>Loading...</p>
                </div>
            </div>
        )
    }

    if (!myShopData) {
        return (
            <div className='min-h-screen bg-white flex items-center justify-center p-4'>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='text-center max-w-md'
                >
                    <div className='w-24 h-24 mx-auto rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mb-4'>
                        <FaStore className='text-amber-500 text-5xl' />
                    </div>
                    <h2 className='text-2xl font-bold text-gray-800 mb-2'>No Shop Found</h2>
                    <p className='text-gray-500 text-sm mb-6'>
                        You need to create a shop first before adding items.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/create-edit-shop')}
                        className='px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium flex items-center justify-center gap-2 mx-auto shadow-sm shadow-orange-200'
                    >
                        Create Your Shop
                    </motion.button>
                </motion.div>
            </div>
        )
    }

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
                    onClick={() => navigate("/owner-dashboard")}
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
                            <FaPlus className='text-white text-2xl' />
                        </div>
                        <div>
                            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight'>
                                Add Food Item
                            </h1>
                            <p className='text-gray-500 text-sm flex items-center gap-2 font-medium'>
                                <span className='w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse' />
                                Add delicious items to your menu
                            </p>
                        </div>
                    </div>
                    
                    <div className='flex items-center gap-3'>
                        <div className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border-2 border-gray-200 shadow-sm'>
                            <FaStore className='text-orange-500 text-xs' />
                            <span className='text-gray-600 text-xs font-medium truncate max-w-[100px]'>
                                {myShopData?.name || 'Your Shop'}
                            </span>
                        </div>
                        <div className={`w-1.5 h-1.5 rounded-full ${myShopData?.isApproved ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} />
                    </div>
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
                                
                                {/* Item Name - Full Width */}
                                <div>
                                    <label className='block text-gray-600 text-sm font-semibold mb-1.5 flex items-center gap-2'>
                                        <FaUtensils className='text-orange-500' size={14} />
                                        Item Name <span className='text-red-500'>*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder='Enter item name...' 
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

                                {/* Price & Category - Side by Side */}
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                    <div>
                                        <label className='block text-gray-600 text-sm font-semibold mb-1.5 flex items-center gap-2'>
                                            <FaTag className='text-orange-500' size={14} />
                                            Price (₹) <span className='text-red-500'>*</span>
                                        </label>
                                        <input 
                                            type="number" 
                                            placeholder='Enter price...' 
                                            className={`w-full bg-gray-50 border-2 rounded-xl px-4 py-3.5 text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all duration-300 text-sm ${
                                                errors.price 
                                                    ? 'border-red-400 hover:border-red-500' 
                                                    : 'border-gray-200 hover:border-orange-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                                            }`}
                                            onChange={(e) => {
                                                setPrice(e.target.value)
                                                if (errors.price) validateField('price', e.target.value)
                                            }}
                                            value={price}
                                            onBlur={() => validateField('price', price)}
                                            required
                                            min="0"
                                            step="1"
                                        />
                                        {errors.price && (
                                            <p className='text-red-500 text-xs mt-1 font-medium'>{errors.price}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className='block text-gray-600 text-sm font-semibold mb-1.5 flex items-center gap-2'>
                                            <FaList className='text-orange-500' size={14} />
                                            Category <span className='text-red-500'>*</span>
                                        </label>
                                        <select 
                                            className={`w-full bg-gray-50 border-2 rounded-xl px-4 py-3.5 text-gray-800 focus:outline-none transition-all duration-300 text-sm cursor-pointer ${
                                                errors.category 
                                                    ? 'border-red-400 hover:border-red-500' 
                                                    : 'border-gray-200 hover:border-orange-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                                            }`}
                                            onChange={(e) => {
                                                setCategory(e.target.value)
                                                if (errors.category) validateField('category', e.target.value)
                                            }}
                                            value={category}
                                            onBlur={() => validateField('category', category)}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((cate, index) => (
                                                <option value={cate} key={index}>{cate}</option>
                                            ))}
                                        </select>
                                        {errors.category && (
                                            <p className='text-red-500 text-xs mt-1 font-medium'>{errors.category}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Food Type - Full Width */}
                                <div>
                                    <label className='block text-gray-600 text-sm font-semibold mb-1.5 flex items-center gap-2'>
                                        <FaLeaf className='text-orange-500' size={14} />
                                        Food Type <span className='text-red-500'>*</span>
                                    </label>
                                    <div className='grid grid-cols-2 gap-3'>
                                        <motion.button
                                            type="button"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`py-3.5 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-semibold ${
                                                foodType === 'veg' 
                                                    ? 'border-green-400 bg-green-50 text-green-700 shadow-sm shadow-green-100' 
                                                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                            onClick={() => setFoodtype('veg')}
                                        >
                                            <FaLeaf className='text-green-500' /> Veg
                                        </motion.button>
                                        <motion.button
                                            type="button"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`py-3.5 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-semibold ${
                                                foodType === 'non veg' 
                                                    ? 'border-red-400 bg-red-50 text-red-700 shadow-sm shadow-red-100' 
                                                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                            onClick={() => setFoodtype('non veg')}
                                        >
                                            <FaDrumstickBite className='text-red-500' /> Non-Veg
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Image Upload - Full Width */}
                                <div>
                                    <label className='block text-gray-600 text-sm font-semibold mb-1.5 flex items-center gap-2'>
                                        <FaImage className='text-orange-500' size={14} />
                                        Item Image
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
                                                alt="Item preview" 
                                                className='w-full h-48 object-cover rounded-xl border-2 border-gray-200'
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/800x400/f0ebe5/cbb8a8?text=No+Image'
                                                }}
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
                                            Save Item
                                            <FaArrowRight size={14} />
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>

                    {/* Sidebar - Takes 1/3 width */}
                    <div className='space-y-4'>
                        
                        {/* Shop Info */}
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`bg-white border-2 border-gray-200 p-5 rounded-2xl shadow-lg ${fadeUp}`}
                        >
                            <h4 className='text-gray-800 font-semibold text-sm mb-3 flex items-center gap-2'>
                                <FaStore className='text-orange-500' /> Your Shop
                            </h4>
                            <div className='flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200'>
                                <div className='w-12 h-12 rounded-xl overflow-hidden border border-gray-200'>
                                    <img 
                                        src={myShopData?.image || 'https://via.placeholder.com/100/f0ebe5/cbb8a8?text=Shop'} 
                                        alt={myShopData?.name || 'Shop'}
                                        className='w-full h-full object-cover'
                                    />
                                </div>
                                <div>
                                    <p className='text-gray-800 font-semibold text-sm'>{myShopData?.name || 'No Shop'}</p>
                                    <p className='text-gray-500 text-xs'>{myShopData?.city || 'Add shop first'}</p>
                                </div>
                            </div>
                            <div className='mt-3 flex items-center gap-2'>
                                <span className={`w-1.5 h-1.5 rounded-full ${myShopData?.isApproved ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} />
                                <span className={`text-xs font-semibold ${myShopData?.isApproved ? 'text-green-600' : 'text-amber-600'}`}>
                                    {myShopData?.isApproved ? '✅ Active' : '⏳ Pending Approval'}
                                </span>
                            </div>
                        </motion.div>

                        {/* Quick Tips */}
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className={`bg-white border-2 border-gray-200 p-5 rounded-2xl shadow-lg ${fadeUp}`}
                        >
                            <h4 className='text-gray-800 font-semibold text-sm mb-3 flex items-center gap-2'>
                                <FaInfoCircle className='text-orange-500' /> Pro Tips
                            </h4>
                            <div className='space-y-2.5'>
                                {[
                                    { icon: <FaStar className='text-amber-400' />, text: 'Use clear, high-quality images' },
                                    { icon: <FaFire className='text-orange-500' />, text: 'Set competitive prices' },
                                    { icon: <FaCheckCircle className='text-green-500' />, text: 'Add detailed descriptions' }
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

                        {/* Benefits */}
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className={`bg-white border-2 border-gray-200 p-5 rounded-2xl shadow-lg ${fadeUp}`}
                        >
                            <h4 className='text-gray-800 font-semibold text-sm mb-3 flex items-center gap-2'>
                                <FaRocket className='text-orange-500' /> Benefits
                            </h4>
                            <div className='grid grid-cols-3 gap-2'>
                                {[
                                    { icon: <FaShieldAlt className='text-orange-500 text-lg' />, label: 'Secure' },
                                    { icon: <FaGem className='text-amber-500 text-lg' />, label: 'Premium' },
                                    { icon: <FaAward className='text-purple-500 text-lg' />, label: 'Trusted' }
                                ].map((item, idx) => (
                                    <div 
                                        key={idx}
                                        className='flex flex-col items-center gap-1 p-3 rounded-xl bg-gray-50 border border-gray-200'
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
                            <h3 className='text-gray-800 font-bold text-xl mt-4'>Item Added! 🎉</h3>
                            <p className='text-gray-500 text-sm mt-2'>Item added to your menu successfully</p>
                            <div className='mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200'>
                                <FaCheckCircle className='text-green-500 text-sm' />
                                <span className='text-green-700 text-xs font-semibold'>Ready to serve</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default AddItem