import React from 'react'
import { IoArrowBack } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    FaUtensils, FaPlus, FaImage, FaTag, FaList, 
    FaLeaf, FaDrumstickBite, FaSave, FaArrowRight,
    FaCamera, FaUpload, FaCheck, FaTimes, FaInfoCircle,
    FaCheckCircle, FaStar, FaFire, FaRocket, FaShieldAlt,
    FaGem, FaAward, FaHeart, FaMagic, FaCrown,
    FaStore, FaMotorcycle, FaClock, FaUtensilSpoon
} from "react-icons/fa";
import { useState } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
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
    const [activeStep, setActiveStep] = useState(1)
    const [isFocused, setIsFocused] = useState(null)
    const [isLoaded, setIsLoaded] = useState(false)
    
    const categories = ["Snacks", "Main Course", "Desserts", "Pizza", "Burgers", "Sandwiches", "South Indian", "North Indian", "Chinese", "Fast Food", "Others"]
    const dispatch = useDispatch()

    React.useEffect(() => {
        setTimeout(() => setIsLoaded(true), 300)
    }, [])

    const steps = [
        { id: 1, label: 'Basic Info', icon: <FaUtensils />, desc: 'Item details' },
        { id: 2, label: 'Category', icon: <FaList />, desc: 'Type & price' },
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
            toast.error('Please enter item name')
            setLoading(false)
            return
        }
        if (!price || price <= 0) {
            toast.error('Please enter valid price')
            setLoading(false)
            return
        }
        if (!category) {
            toast.error('Please select category')
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
            toast.success("Item added successfully! 🎉")
            
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
                    transition={{ duration: 25, repeat: Infinity }}
                    className='absolute -top-40 -left-40 w-[700px] h-[700px] bg-[#ff2d55]/4 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ x: [0, -80, 40, 0], y: [0, 40, -60, 0] }}
                    transition={{ duration: 30, repeat: Infinity }}
                    className='absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-[#ff6b35]/4 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[#ffd93d]/2 rounded-full blur-3xl'
                />
            </div>

            {/* ✅ Premium Back Button */}
            <motion.button 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.08, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                className='fixed top-6 left-6 z-50 glass-premium px-4 sm:px-5 py-2.5 rounded-full text-white/80 hover:text-white transition-all duration-300 flex items-center gap-2 text-xs sm:text-sm font-medium hover:shadow-2xl hover:shadow-[#ff2d55]/20 border border-white/10 hover:border-[#ff2d55]/30 backdrop-blur-2xl'
                onClick={() => navigate("/")}
            >
                <IoArrowBack size={14} className="sm:text-base" />
                <span className='hidden sm:inline'>Back to Dashboard</span>
            </motion.button>

            {/* ✅ Main Container */}
            <div className='relative z-10 max-w-6xl mx-auto mt-14 sm:mt-16'>
                
                {/* ✅ Header */}
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
                            className='w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center shadow-2xl shadow-[#ff2d55]/40'
                        >
                            <FaPlus className='text-white text-2xl sm:text-3xl' />
                        </motion.div>
                        <div>
                            <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight'>
                                Add Food Item
                                <span className='ml-2 sm:ml-3 text-xs sm:text-sm font-normal bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] bg-clip-text text-transparent'>
                                    🍕 New
                                </span>
                            </h1>
                            <p className='text-white/40 text-xs sm:text-sm flex items-center gap-2'>
                                <span className='w-1.5 h-1.5 rounded-full bg-[#ff6b35] animate-pulse' />
                                Add delicious items to your menu
                            </p>
                        </div>
                    </div>
                    
                    <div className='flex items-center gap-2 sm:gap-3'>
                        <div className='flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/5'>
                            <FaStore className='text-[#ff6b35] text-xs sm:text-sm' />
                            <span className='text-white/40 text-[10px] sm:text-xs truncate max-w-[100px] sm:max-w-none'>
                                {myShopData?.name || 'Your Shop'}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* ✅ Steps - Responsive */}
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
                                    {activeStep > step.id ? <FaCheck size={10} className="sm:text-sm" /> : step.id}
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
                                <div className={`flex-1 h-[2px] rounded-full transition-all duration-500 ${
                                    activeStep > step.id ? 'bg-gradient-to-r from-[#ff2d55] to-[#ff6b35]' : 'bg-white/10'
                                }`} />
                            )}
                        </React.Fragment>
                    ))}
                </motion.div>

                {/* ✅ Main Content - Grid */}
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6'>
                    
                    {/* ✅ Left Column - Form (2/3) */}
                    <div className='lg:col-span-2'>
                        <motion.div 
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                            className={`glass-premium rounded-2xl sm:rounded-3xl border border-white/5 p-5 sm:p-6 md:p-8 shadow-2xl shadow-[#ff2d55]/5 relative overflow-hidden group ${fadeUp}`}
                        >
                            <div className='absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff2d55] to-transparent' />
                            <div className='absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent' />

                            <form className='space-y-4 sm:space-y-5' onSubmit={handleSubmit}>
                                
                                {/* Item Name */}
                                <div>
                                    <label className='block text-white/60 text-[10px] sm:text-xs font-medium mb-1.5 flex items-center gap-2'>
                                        <FaUtensils className='text-[#ff6b35]' size={12} className="sm:text-sm" />
                                        Item Name
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder='Enter item name...' 
                                        className={`w-full bg-[#18181D] border rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 text-white placeholder:text-white/30 focus:outline-none transition-all duration-300 text-xs sm:text-sm ${
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
                                </div>

                                {/* Price & Category */}
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                    <div>
                                        <label className='block text-white/60 text-[10px] sm:text-xs font-medium mb-1.5 flex items-center gap-2'>
                                            <FaTag className='text-[#ff6b35]' size={12} className="sm:text-sm" />
                                            Price (₹)
                                        </label>
                                        <input 
                                            type="number" 
                                            placeholder='Enter price...' 
                                            className={`w-full bg-[#18181D] border rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 text-white placeholder:text-white/30 focus:outline-none transition-all duration-300 text-xs sm:text-sm ${
                                                isFocused === 'price' 
                                                    ? 'border-[#ff2d55] shadow-lg shadow-[#ff2d55]/10' 
                                                    : 'border-white/10 hover:border-white/20'
                                            }`}
                                            onChange={(e) => setPrice(e.target.value)}
                                            value={price}
                                            onFocus={() => { setActiveStep(2); setIsFocused('price') }}
                                            onBlur={() => setIsFocused(null)}
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-white/60 text-[10px] sm:text-xs font-medium mb-1.5 flex items-center gap-2'>
                                            <FaList className='text-[#ff6b35]' size={12} className="sm:text-sm" />
                                            Category
                                        </label>
                                        <select 
                                            className={`w-full bg-[#18181D] border rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 text-white focus:outline-none transition-all duration-300 text-xs sm:text-sm cursor-pointer ${
                                                isFocused === 'category' 
                                                    ? 'border-[#ff2d55] shadow-lg shadow-[#ff2d55]/10' 
                                                    : 'border-white/10 hover:border-white/20'
                                            }`}
                                            onChange={(e) => setCategory(e.target.value)}
                                            value={category}
                                            onFocus={() => { setActiveStep(2); setIsFocused('category') }}
                                            onBlur={() => setIsFocused(null)}
                                            required
                                        >
                                            <option value="" className='bg-[#1a1a2e]'>Select Category</option>
                                            {categories.map((cate, index) => (
                                                <option value={cate} key={index} className='bg-[#1a1a2e]'>{cate}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Food Type */}
                                <div>
                                    <label className='block text-white/60 text-[10px] sm:text-xs font-medium mb-1.5 flex items-center gap-2'>
                                        <FaLeaf className='text-[#ff6b35]' size={12} className="sm:text-sm" />
                                        Food Type
                                    </label>
                                    <div className='grid grid-cols-2 gap-2 sm:gap-3'>
                                        <motion.button
                                            type="button"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`py-3 sm:py-3.5 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium ${
                                                foodType === 'veg' 
                                                    ? 'border-green-500 bg-green-500/20 text-green-400 shadow-lg shadow-green-500/20' 
                                                    : 'border-white/10 text-white/40 hover:border-white/30'
                                            }`}
                                            onClick={() => setFoodtype('veg')}
                                        >
                                            <FaLeaf className='text-green-400 text-sm sm:text-base' /> Veg
                                        </motion.button>
                                        <motion.button
                                            type="button"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`py-3 sm:py-3.5 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium ${
                                                foodType === 'non veg' 
                                                    ? 'border-red-500 bg-red-500/20 text-red-400 shadow-lg shadow-red-500/20' 
                                                    : 'border-white/10 text-white/40 hover:border-white/30'
                                            }`}
                                            onClick={() => setFoodtype('non veg')}
                                        >
                                            <FaDrumstickBite className='text-red-400 text-sm sm:text-base' /> Non-Veg
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className='block text-white/60 text-[10px] sm:text-xs font-medium mb-1.5 flex items-center gap-2'>
                                        <FaImage className='text-[#ff6b35]' size={12} className="sm:text-sm" />
                                        Item Image
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
                                                className='w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 flex items-center justify-center'
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
                                            className='mt-3 sm:mt-4 relative group'
                                        >
                                            <img 
                                                src={frontendImage} 
                                                alt="Item preview" 
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
                                                <FaTimes size={12} className="sm:text-base" />
                                            </button>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className='w-full py-3 sm:py-4 rounded-xl bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white font-semibold shadow-lg shadow-[#ff2d55]/30 hover:shadow-[#ff2d55]/50 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 text-xs sm:text-sm group'
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ClipLoader size={16} className="sm:w-5 sm:h-5" color='white' />
                                    ) : (
                                        <>
                                            <FaSave size={12} className="sm:text-base group-hover:scale-110 transition-transform" />
                                            Save Item
                                            <FaArrowRight size={10} className="sm:text-sm group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>

                    {/* ✅ Right Column - Info (1/3) */}
                    <div className='space-y-3 sm:space-y-4'>
                        
                        {/* Shop Info */}
                        <motion.div 
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`glass-premium p-4 sm:p-5 rounded-2xl border border-white/5 ${fadeUp}`}
                        >
                            <h4 className='text-white font-semibold text-xs sm:text-sm mb-2 sm:mb-3 flex items-center gap-2'>
                                <FaStore className='text-[#ff6b35] text-xs sm:text-sm' /> Your Shop
                            </h4>
                            <div className='flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-white/5 border border-white/5'>
                                <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden'>
                                    <img 
                                        src={myShopData?.image || 'https://via.placeholder.com/100/1a1a2e/666?text=Shop'} 
                                        alt={myShopData?.name || 'Shop'}
                                        className='w-full h-full object-cover'
                                    />
                                </div>
                                <div>
                                    <p className='text-white font-medium text-xs sm:text-sm'>{myShopData?.name || 'No Shop'}</p>
                                    <p className='text-white/30 text-[10px] sm:text-xs'>{myShopData?.city || 'Add shop first'}</p>
                                </div>
                            </div>
                            <div className='mt-2 sm:mt-3 flex items-center gap-2'>
                                <span className={`w-1.5 h-1.5 rounded-full ${myShopData?.isApproved ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
                                <span className={`text-[10px] sm:text-xs ${myShopData?.isApproved ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {myShopData?.isApproved ? '✅ Active' : '⏳ Pending Approval'}
                                </span>
                            </div>
                        </motion.div>

                        {/* Quick Tips */}
                        <motion.div 
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className={`glass-premium p-4 sm:p-5 rounded-2xl border border-white/5 ${fadeUp}`}
                        >
                            <h4 className='text-white font-semibold text-xs sm:text-sm mb-3 sm:mb-4 flex items-center gap-2'>
                                <FaInfoCircle className='text-[#ff6b35] text-xs sm:text-sm' /> Pro Tips
                            </h4>
                            <div className='space-y-2 sm:space-y-2.5'>
                                {[
                                    { icon: <FaStar className='text-yellow-400 text-xs sm:text-sm' />, text: 'Use clear, high-quality images' },
                                    { icon: <FaFire className='text-[#ff2d55] text-xs sm:text-sm' />, text: 'Set competitive prices' },
                                    { icon: <FaCheckCircle className='text-green-400 text-xs sm:text-sm' />, text: 'Add detailed descriptions' }
                                ].map((tip, idx) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + (idx * 0.1) }}
                                        className='flex items-center gap-1.5 sm:gap-2.5 text-white/40 text-[10px] sm:text-xs p-1.5 sm:p-2 rounded-lg hover:bg-white/5 transition-all duration-300'
                                    >
                                        <span className='text-sm sm:text-base'>{tip.icon}</span>
                                        {tip.text}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Features */}
                        <motion.div 
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className={`glass-premium p-4 sm:p-5 rounded-2xl border border-white/5 ${fadeUp}`}
                        >
                            <h4 className='text-white font-semibold text-xs sm:text-sm mb-2 sm:mb-3 flex items-center gap-2'>
                                <FaRocket className='text-[#ff2d55] text-xs sm:text-sm' /> Benefits
                            </h4>
                            <div className='grid grid-cols-3 gap-1.5 sm:gap-2'>
                                {[
                                    { icon: <FaShieldAlt className='text-[#ff6b35] text-sm sm:text-base' />, label: 'Secure' },
                                    { icon: <FaGem className='text-[#ffd93d] text-sm sm:text-base' />, label: 'Premium' },
                                    { icon: <FaAward className='text-purple-400 text-sm sm:text-base' />, label: 'Trusted' }
                                ].map((item, idx) => (
                                    <motion.div 
                                        key={idx}
                                        whileHover={{ scale: 1.1 }}
                                        className='flex flex-col items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 rounded-xl bg-white/5 border border-white/5'
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

            {/* ✅ Success Animation */}
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
                            transition={{ type: "spring", stiffness: 300 }}
                            className='text-center max-w-sm w-full'
                        >
                            <motion.div 
                                className='w-20 h-20 sm:w-28 sm:h-28 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-2xl shadow-green-500/40'
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 0.6, repeat: Infinity }}
                            >
                                <FaCheck className='text-white text-3xl sm:text-5xl' />
                            </motion.div>
                            <h3 className='text-white font-bold text-xl sm:text-2xl mt-4 sm:mt-6'>Item Added! 🎉</h3>
                            <p className='text-white/40 text-xs sm:text-sm mt-2'>Item added to your menu successfully</p>
                            <div className='mt-3 sm:mt-4 inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-green-500/20 border border-green-500/30'>
                                <FaCheckCircle className='text-green-400 text-xs sm:text-sm' />
                                <span className='text-green-400/80 text-[10px] sm:text-xs'>Ready to serve</span>
                            </div>
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
            `}</style>
        </div>
    )
}

export default AddItem