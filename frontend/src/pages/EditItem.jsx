import React, { useEffect } from 'react'
import { IoArrowBack } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    FaUtensils, FaEdit, FaImage, FaTag, FaList, FaLeaf, FaDrumstickBite,
    FaMotorcycle, FaShieldAlt, FaBolt, FaStar, FaCheckCircle,
    FaArrowRight, FaSave, FaRocket, FaGem, FaCrown
} from "react-icons/fa";
import { useState } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import { setMyShopData } from '../redux/ownerSlice';
import { ClipLoader } from 'react-spinners';
import { toast } from "react-toastify";
import { motion } from 'framer-motion';

function EditItem() {
    const { myShopData } = useSelector(state => state.owner)
    const { itemId } = useParams()
    const [currentItem, setCurrentItem] = useState(null)
    const navigate = useNavigate()
    const [name, setName] = useState("")
    const [price, setPrice] = useState(0)
    const [frontendImage, setFrontendImage] = useState("")
    const [backendImage, setBackendImage] = useState(null)
    const [category, setCategory] = useState("")
    const [foodType, setFoodtype] = useState("")
    const [loading, setLoading] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    
    const categories = ["Snacks", "Main Course", "Desserts", "Pizza", "Burgers", "Sandwiches", "South Indian", "North Indian", "Chinese", "Fast Food", "Others"]
    const dispatch = useDispatch()

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 300)
    }, [])

    const handleImage = (e) => {
        const file = e.target.files[0]
        setBackendImage(file)
        setFrontendImage(URL.createObjectURL(file))
    }

    const handleSubmit = async (e) => {
        setLoading(true)
        e.preventDefault()
        try {
            const formData = new FormData()
            formData.append("name", name)
            formData.append("category", category)
            formData.append("foodType", foodType)
            formData.append("price", price)
            if (backendImage) {
                formData.append("image", backendImage)
            }
            const result = await axios.post(`${serverUrl}/api/item/edit-item/${itemId}`, formData, { withCredentials: true })
            dispatch(setMyShopData(result.data))
            setLoading(false)
            toast.success("Item updated successfully 🎉");
            navigate("/owner-dashboard")
        } catch (error) {
            console.log(error)
            setLoading(false)
            toast.error("Something went wrong ❌");
        }
    }

    useEffect(() => {
        const handleGetItemById = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/item/get-by-id/${itemId}`, { withCredentials: true })
                setCurrentItem(result.data)
            } catch (error) {
                console.log(error)
            }
        }
        handleGetItemById()
    }, [itemId])

    useEffect(() => {
        setName(currentItem?.name || "")
        setPrice(currentItem?.price || 0)
        setCategory(currentItem?.category || "")
        setFoodtype(currentItem?.foodType || "")
        setFrontendImage(currentItem?.image || "")
    }, [currentItem])

    const fadeUp = `transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`

    return (
        <div className='min-h-screen bg-[#0a0a0f] relative overflow-hidden flex items-center justify-center p-4'>
            
            {/* ✅ Animated Background Orbs */}
            <div className='absolute inset-0 pointer-events-none'>
                <motion.div 
                    animate={{ x: [0, 60, -30, 0], y: [0, -40, 50, 0] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className='absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#ff2d55]/5 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ x: [0, -50, 30, 0], y: [0, 40, -50, 0] }}
                    transition={{ duration: 25, repeat: Infinity }}
                    className='absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#ff6b35]/5 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ffd93d]/3 rounded-full blur-3xl'
                />
            </div>

            {/* ✅ Back Button */}
            <motion.button 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                className='fixed top-6 left-6 z-50 glass-premium px-4 py-2.5 rounded-full text-white/70 hover:text-white transition-all duration-300 flex items-center gap-2 text-sm hover:scale-105 hover:shadow-lg hover:shadow-[#ff2d55]/10 border border-white/5'
                onClick={() => navigate("/owner-dashboard")}
            >
                <IoArrowBack size={16} />
                <span className="hidden sm:inline">Back to Dashboard</span>
            </motion.button>

            {/* ✅ Main Card */}
            <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                className={`w-full max-w-lg glass-premium rounded-3xl border border-white/5 p-6 sm:p-8 shadow-2xl shadow-[#ff2d55]/5 ${fadeUp}`}
            >
                {/* ✅ Header */}
                <div className='flex flex-col items-center mb-6 sm:mb-8'>
                    <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className='w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center shadow-2xl shadow-[#ff2d55]/20 mb-3 sm:mb-4'
                    >
                        <FaEdit className='text-white text-2xl sm:text-3xl' />
                    </motion.div>
                    <h1 className='text-2xl sm:text-3xl font-bold text-white'>Edit Food Item</h1>
                    <p className='text-white/40 text-xs sm:text-sm mt-1'>Update your delicious item</p>
                </div>

                {/* ✅ Form */}
                <form className='space-y-4 sm:space-y-5' onSubmit={handleSubmit}>
                    
                    {/* ✅ Name */}
                    <div>
                        <label className='block text-white/60 text-xs sm:text-sm font-medium mb-1.5 flex items-center gap-2'>
                            <FaUtensils className='text-[#ff6b35]' size={14} />
                            Item Name
                        </label>
                        <input 
                            type="text" 
                            placeholder='Enter item name...' 
                            className='w-full bg-[#18181D] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 text-sm'
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            required
                        />
                    </div>

                    {/* ✅ Image */}
                    <div>
                        <label className='block text-white/60 text-xs sm:text-sm font-medium mb-1.5 flex items-center gap-2'>
                            <FaImage className='text-[#ff6b35]' size={14} />
                            Food Image
                        </label>
                        <div className='relative border-2 border-dashed border-white/10 rounded-xl p-4 sm:p-6 text-center hover:border-[#ff2d55]/30 transition-all duration-300'>
                            <input 
                                type="file" 
                                accept='image/*' 
                                className='absolute inset-0 opacity-0 cursor-pointer z-10'
                                onChange={handleImage}
                            />
                            <div className='flex flex-col items-center gap-2'>
                                <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 flex items-center justify-center'>
                                    <FaImage className='text-white/30 text-lg sm:text-xl' />
                                </div>
                                <p className='text-white/30 text-xs sm:text-sm'>Click or drag to upload</p>
                                <p className='text-white/20 text-[10px] sm:text-xs'>PNG, JPG up to 5MB</p>
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
                                    className='w-full h-40 sm:h-48 object-cover rounded-xl border border-white/10'
                                />
                                <button
                                    type="button"
                                    className='absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-500 transition-all duration-300 text-sm'
                                    onClick={() => {
                                        setFrontendImage(null)
                                        setBackendImage(null)
                                    }}
                                >
                                    ✕
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* ✅ Price */}
                    <div>
                        <label className='block text-white/60 text-xs sm:text-sm font-medium mb-1.5 flex items-center gap-2'>
                            <FaTag className='text-[#ff6b35]' size={14} />
                            Price (₹)
                        </label>
                        <input 
                            type="number" 
                            placeholder='Enter item price...' 
                            className='w-full bg-[#18181D] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 text-sm'
                            onChange={(e) => setPrice(e.target.value)}
                            value={price}
                            required
                            min="0"
                        />
                    </div>

                    {/* ✅ Category */}
                    <div>
                        <label className='block text-white/60 text-xs sm:text-sm font-medium mb-1.5 flex items-center gap-2'>
                            <FaList className='text-[#ff6b35]' size={14} />
                            Category
                        </label>
                        <select 
                            className='w-full bg-[#18181D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 text-sm cursor-pointer'
                            onChange={(e) => setCategory(e.target.value)}
                            value={category}
                            required
                        >
                            <option value="" className='bg-[#1a1a2e]'>Select Category</option>
                            {categories.map((cate, index) => (
                                <option value={cate} key={index} className='bg-[#1a1a2e]'>{cate}</option>
                            ))}
                        </select>
                    </div>

                    {/* ✅ Food Type */}
                    <div>
                        <label className='block text-white/60 text-xs sm:text-sm font-medium mb-1.5 flex items-center gap-2'>
                            <FaLeaf className='text-[#ff6b35]' size={14} />
                            Food Type
                        </label>
                        <div className='grid grid-cols-2 gap-3'>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                className={`py-3 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-2 text-xs sm:text-sm ${
                                    foodType === 'veg' 
                                        ? 'border-green-500 bg-green-500/20 text-green-400 shadow-lg shadow-green-500/20' 
                                        : 'border-white/10 text-white/40 hover:border-white/30 hover:bg-white/5'
                                }`}
                                onClick={() => setFoodtype('veg')}
                            >
                                <FaLeaf className='text-green-400' /> Veg
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                className={`py-3 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-2 text-xs sm:text-sm ${
                                    foodType === 'non veg' 
                                        ? 'border-red-500 bg-red-500/20 text-red-400 shadow-lg shadow-red-500/20' 
                                        : 'border-white/10 text-white/40 hover:border-white/30 hover:bg-white/5'
                                }`}
                                onClick={() => setFoodtype('non veg')}
                            >
                                <FaDrumstickBite className='text-red-400' /> Non-Veg
                            </motion.button>
                        </div>
                    </div>

                    {/* ✅ Submit Button */}
                    <motion.button 
                        whileHover={{ scale: 1.02, boxShadow: "0 0 60px rgba(255,45,85,0.3)" }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className='w-full py-3.5 rounded-xl bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white font-semibold shadow-lg shadow-[#ff2d55]/25 hover:shadow-[#ff2d55]/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 text-sm'
                        disabled={loading}
                    >
                        {loading ? (
                            <ClipLoader size={20} color='white' />
                        ) : (
                            <>
                                <FaSave size={16} />
                                Update Item
                                <FaArrowRight size={14} className='group-hover:translate-x-1 transition-transform duration-300' />
                            </>
                        )}
                    </motion.button>

                    {/* ✅ Footer */}
                    <p className='text-center text-white/20 text-[10px] sm:text-xs'>
                        Update your food item details
                    </p>
                </form>
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

                .glass-premium {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }
            `}</style>
        </div>
    )
}

export default EditItem