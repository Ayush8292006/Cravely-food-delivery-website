import React, { useEffect, useState } from 'react'
import { IoArrowBack } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    FaUtensils, FaEdit, FaImage, FaTag, FaList, FaLeaf, FaDrumstickBite,
    FaMotorcycle, FaShieldAlt, FaBolt, FaStar, FaCheckCircle,
    FaArrowRight, FaSave, FaRocket, FaGem, FaCrown, FaExclamationTriangle
} from "react-icons/fa";
import axios from 'axios';
import { serverUrl } from '../../config';
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
    const [fetchLoading, setFetchLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isLoaded, setIsLoaded] = useState(false)
    
    const categories = ["Snacks", "Main Course", "Desserts", "Pizza", "Burgers", "Sandwiches", "South Indian", "North Indian", "Chinese", "Fast Food", "Others"]
    const dispatch = useDispatch()

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 300)
    }, [])

    useEffect(() => {
        if (!myShopData && !fetchLoading) {
            toast.warning('Please create a shop first to edit items')
            navigate('/create-edit-shop')
        }
    }, [myShopData, fetchLoading, navigate])

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

        setBackendImage(file)
        setFrontendImage(URL.createObjectURL(file))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        
        try {
            const formData = new FormData()
            formData.append("name", name)
            formData.append("category", category)
            formData.append("foodType", foodType)
            formData.append("price", price)
            if (backendImage) {
                formData.append("image", backendImage)
            }
            
            const result = await axios.post(`${serverUrl}/api/item/edit-item/${itemId}`, formData, { 
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            
            dispatch(setMyShopData(result.data))
            setLoading(false)
            toast.success("Item updated successfully 🎉", {
                position: "top-center",
                autoClose: 3000,
            })
            navigate("/owner-dashboard")
        } catch (error) {
            console.log("Edit item error:", error)
            const errorMsg = error.response?.data?.message || "Something went wrong ❌"
            setError(errorMsg)
            setLoading(false)
            toast.error(errorMsg, {
                position: "top-center",
                autoClose: 3000,
            })
        }
    }

    useEffect(() => {
        const handleGetItemById = async () => {
            setFetchLoading(true)
            setError(null)
            try {
                const result = await axios.get(`${serverUrl}/api/item/get-by-id/${itemId}`, { 
                    withCredentials: true 
                })
                setCurrentItem(result.data)
            } catch (error) {
                console.log("Fetch item error:", error)
                const errorMsg = error.response?.data?.message || "Failed to load item"
                setError(errorMsg)
                toast.error(errorMsg)
            } finally {
                setFetchLoading(false)
            }
        }
        handleGetItemById()
    }, [itemId])

    useEffect(() => {
        if (currentItem) {
            setName(currentItem.name || "")
            setPrice(currentItem.price || 0)
            setCategory(currentItem.category || "")
            setFoodtype(currentItem.foodType || "")
            setFrontendImage(currentItem.image || "")
        }
    }, [currentItem])

    const fadeUp = `transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`

    if (fetchLoading) {
        return (
            <div className='min-h-screen bg-white flex items-center justify-center'>
                <div className='flex flex-col items-center gap-4'>
                    <div className='relative'>
                        <div className='w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin' />
                        <div className='absolute inset-0 animate-ping rounded-full border-2 border-orange-300/20' />
                    </div>
                    <p className='text-gray-500 text-sm font-medium animate-pulse'>Loading item...</p>
                </div>
            </div>
        )
    }

    if (error && !currentItem) {
        return (
            <div className='min-h-screen bg-white flex items-center justify-center p-4'>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='text-center max-w-md'
                >
                    <div className='w-24 h-24 mx-auto rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mb-4'>
                        <FaExclamationTriangle className='text-red-500 text-5xl' />
                    </div>
                    <h2 className='text-2xl font-bold text-gray-800 mb-2'>Item Not Found</h2>
                    <p className='text-gray-500 text-sm mb-6'>{error}</p>
                    <button 
                        onClick={() => navigate('/owner-dashboard')}
                        className='px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-sm shadow-orange-200'
                    >
                        Back to Dashboard
                    </button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-[#f8f4f0] py-6 px-4'>
            
            {/* Back Button */}
            <div className='max-w-4xl mx-auto mb-4'>
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

            {/* Main Card - Wider and Square */}
            <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                className={`w-full max-w-4xl mx-auto bg-white border-2 border-gray-200 rounded-3xl p-8 sm:p-10 shadow-lg ${fadeUp}`}
            >
                {/* Header */}
                <div className='flex flex-col items-center mb-8'>
                    <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className='w-20 h-20 rounded-2xl bg-orange-500 flex items-center justify-center shadow-md shadow-orange-200 mb-4'
                    >
                        <FaEdit className='text-white text-3xl' />
                    </motion.div>
                    <h1 className='text-3xl sm:text-4xl font-bold text-gray-900'>Edit Food Item</h1>
                    <p className='text-gray-500 text-sm mt-1 font-medium'>Update your delicious item</p>
                </div>

                {/* Form - 2 Column Grid for Square Layout */}
                <form className='space-y-5' onSubmit={handleSubmit}>
                    
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                        {/* Name */}
                        <div className='md:col-span-2'>
                            <label className='block text-gray-600 text-sm font-semibold mb-1.5 flex items-center gap-2'>
                                <FaUtensils className='text-orange-500' size={14} />
                                Item Name
                            </label>
                            <input 
                                type="text" 
                                placeholder='Enter item name...' 
                                className='w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all duration-300 text-sm'
                                onChange={(e) => setName(e.target.value)}
                                value={name}
                                required
                            />
                        </div>

                        {/* Price */}
                        <div>
                            <label className='block text-gray-600 text-sm font-semibold mb-1.5 flex items-center gap-2'>
                                <FaTag className='text-orange-500' size={14} />
                                Price (₹)
                            </label>
                            <input 
                                type="number" 
                                placeholder='Enter item price...' 
                                className='w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all duration-300 text-sm'
                                onChange={(e) => setPrice(e.target.value)}
                                value={price}
                                required
                                min="0"
                                step="1"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className='block text-gray-600 text-sm font-semibold mb-1.5 flex items-center gap-2'>
                                <FaList className='text-orange-500' size={14} />
                                Category
                            </label>
                            <select 
                                className='w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all duration-300 text-sm cursor-pointer'
                                onChange={(e) => setCategory(e.target.value)}
                                value={category}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map((cate, index) => (
                                    <option value={cate} key={index}>{cate}</option>
                                ))}
                            </select>
                        </div>

                        {/* Food Type */}
                        <div className='md:col-span-2'>
                            <label className='block text-gray-600 text-sm font-semibold mb-1.5 flex items-center gap-2'>
                                <FaLeaf className='text-orange-500' size={14} />
                                Food Type
                            </label>
                            <div className='grid grid-cols-2 gap-3'>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
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
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
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
                    </div>

                    {/* Image - Full Width */}
                    <div>
                        <label className='block text-gray-600 text-sm font-semibold mb-1.5 flex items-center gap-2'>
                            <FaImage className='text-orange-500' size={14} />
                            Food Image
                        </label>
                        <div className='relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-300 transition-all duration-300 bg-gray-50'>
                            <input 
                                type="file" 
                                accept='image/*' 
                                className='absolute inset-0 opacity-0 cursor-pointer z-10'
                                onChange={handleImage}
                            />
                            <div className='flex flex-col items-center gap-2'>
                                <div className='w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center'>
                                    <FaImage className='text-gray-400 text-2xl' />
                                </div>
                                <p className='text-gray-500 text-sm font-medium'>Click or drag to upload</p>
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
                                    className='w-full h-52 object-cover rounded-xl border-2 border-gray-200'
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/800x400/f0ebe5/cbb8a8?text=No+Image'
                                    }}
                                />
                                <button
                                    type="button"
                                    className='absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all duration-300 text-sm shadow-md'
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
                                Update Item
                                <FaArrowRight size={14} />
                            </>
                        )}
                    </motion.button>

                    {/* Footer */}
                    <p className='text-center text-gray-400 text-xs font-medium'>
                        Update your food item details
                    </p>
                </form>
            </motion.div>
        </div>
    )
}

export default EditItem