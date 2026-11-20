import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
    FaUtensils, FaEdit, FaImage, FaTag, FaSave, FaArrowLeft,
    FaCamera, FaUpload, FaStar, FaLeaf, FaDrumstickBite
} from "react-icons/fa"
import axios from 'axios'
import { serverUrl } from '../../config'
import { toast } from "react-toastify"
import { setMyShopData } from '../redux/ownerSlice'
import { ClipLoader } from 'react-spinners'
import { motion } from 'framer-motion'
import OwnerNav from '../components/OwnerNav'

function EditItem() {
    const { myShopData } = useSelector(state => state.owner)
    const { itemId } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [frontendImage, setFrontendImage] = useState("")
    const [backendImage, setBackendImage] = useState(null)
    const [category, setCategory] = useState("Snacks")
    const [foodType, setFoodType] = useState("veg")
    const [loading, setLoading] = useState(false)
    const [fetchLoading, setFetchLoading] = useState(true)
    const [isDragging, setIsDragging] = useState(false)

    const categories = [
        "Snacks", "Main Course", "Desserts", "Pizza", "Burgers", 
        "Sandwiches", "South Indian", "North Indian", "Chinese", "Fast Food", "Others"
    ]

    useEffect(() => {
        const fetchItem = async () => {
            setFetchLoading(true)
            try {
                const res = await axios.get(`${serverUrl}/api/item/get-by-id/${itemId}`, { 
                    withCredentials: true 
                })
                if (res.data) {
                    setName(res.data.name || "")
                    setPrice(res.data.price || "")
                    setCategory(res.data.category || "Snacks")
                    setFoodType(res.data.foodType || "veg")
                    setFrontendImage(res.data.image || "")
                }
            } catch (err) {
                console.error("Fetch item error:", err)
                toast.error("Failed to load item details")
            } finally {
                setFetchLoading(false)
            }
        }
        fetchItem()
    }, [itemId])

    const handleImageChange = (file) => {
        if (!file) return
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
        if (!validTypes.includes(file.type)) {
            toast.error('Please upload a valid image file (JPEG, PNG, WEBP)')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB')
            return
        }
        setBackendImage(file)
        setFrontendImage(URL.createObjectURL(file))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!name.trim()) {
            toast.warning('Please enter a dish name')
            return
        }
        if (!price || Number(price) <= 0) {
            toast.warning('Please enter a valid price')
            return
        }

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("name", name)
            formData.append("price", price)
            formData.append("category", category)
            formData.append("foodType", foodType)
            if (backendImage) {
                formData.append("image", backendImage)
            }

            const res = await axios.post(
                `${serverUrl}/api/item/edit-item/${itemId}`, 
                formData, 
                { 
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            )

            if (res.data) {
                dispatch(setMyShopData(res.data))
            }

            toast.success("Dish updated successfully! 🎉")
            navigate("/owner-dashboard")
        } catch (err) {
            console.error("Edit dish error:", err)
            toast.error(err.response?.data?.message || "Failed to update dish")
        } finally {
            setLoading(false)
        }
    }

    if (fetchLoading) {
        return (
            <div className="min-h-screen bg-[#0A090D] text-white flex flex-col items-center justify-center">
                <ClipLoader size={48} color="#FF6B00" />
                <p className="mt-4 text-xs text-gray-400 animate-pulse">Loading dish details...</p>
            </div>
        )
    }

    return (
        <div 
            className="min-h-screen bg-[#0A090D] text-white pt-[90px] pb-24 px-4 sm:px-6 lg:px-8 selection:bg-[#FF6B00] selection:text-white"
            style={{ fontFamily: "'Poppins', 'Segoe UI', system-ui, sans-serif" }}
        >
            <OwnerNav />

            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/owner-dashboard')}
                            className="w-10 h-10 rounded-xl bg-[#13121A] hover:bg-[#FF6B00] border border-white/10 hover:border-transparent text-white flex items-center justify-center transition cursor-pointer"
                        >
                            <FaArrowLeft size={13} />
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                Edit Dish Details
                            </h1>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Modify name, pricing, category, or photo for this dish
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Form */}
                    <div className="lg:col-span-7 bg-[#13121A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            
                            {/* Dish Name */}
                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <FaUtensils size={12} className="text-[#FF6B00]" />
                                    <span>Dish Name *</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full bg-[#0A090D] border border-white/10 focus:border-[#FF6B00] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-gray-500 focus:outline-none transition"
                                />
                            </div>

                            {/* Price & Category */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                                        <span>Price (₹ INR) *</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        required
                                        min="1"
                                        className="w-full bg-[#0A090D] border border-white/10 focus:border-[#FF6B00] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-gray-500 focus:outline-none transition font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                        <FaTag size={11} className="text-[#FF6B00]" />
                                        <span>Category *</span>
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-[#0A090D] border border-white/10 focus:border-[#FF6B00] rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none transition cursor-pointer"
                                    >
                                        {categories.map((cat, idx) => (
                                            <option key={idx} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Food Type Toggle */}
                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                                    <span>Food Type (FSSAI Tag) *</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFoodType("veg")}
                                        className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                                            foodType === 'veg'
                                                ? 'bg-emerald-600 text-white shadow-md'
                                                : 'bg-[#0A090D] border border-white/10 text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        <span className="w-3.5 h-3.5 rounded-sm border border-emerald-400 flex items-center justify-center">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        </span>
                                        <span>Pure Veg 🌿</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFoodType("non veg")}
                                        className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                                            foodType === 'non veg'
                                                ? 'bg-rose-600 text-white shadow-md'
                                                : 'bg-[#0A090D] border border-white/10 text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        <span className="w-3.5 h-3.5 rounded-sm border border-rose-400 flex items-center justify-center">
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                        </span>
                                        <span>Non-Veg 🍗</span>
                                    </button>
                                </div>
                            </div>

                            {/* Image Upload Zone */}
                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <FaCamera size={12} className="text-[#FF6B00]" />
                                    <span>Change Dish Photograph</span>
                                </label>
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setIsDragging(false);
                                        if (e.dataTransfer.files?.[0]) handleImageChange(e.dataTransfer.files[0]);
                                    }}
                                    className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition ${
                                        isDragging 
                                            ? 'border-[#FF6B00] bg-orange-500/10' 
                                            : 'border-white/15 bg-[#0A090D] hover:border-white/30'
                                    }`}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="editDishImageInput"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) handleImageChange(e.target.files[0]);
                                        }}
                                    />
                                    <label htmlFor="editDishImageInput" className="cursor-pointer space-y-2 block">
                                        <div className="w-12 h-12 mx-auto rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF6B00]">
                                            <FaUpload size={18} />
                                        </div>
                                        <p className="text-xs font-bold text-white">Click or drag & drop to replace photo</p>
                                        <p className="text-[11px] text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                                    </label>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 rounded-2xl bg-[#FF6B00] hover:bg-orange-600 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                                >
                                    {loading ? (
                                        <ClipLoader size={16} color="#fff" />
                                    ) : (
                                        <>
                                            <FaSave size={13} />
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Live Preview */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="bg-[#13121A] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                                    Customer Card Live Preview
                                </h3>
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                    Customer View
                                </span>
                            </div>

                            {/* Simulated FoodCard */}
                            <div className="rounded-2xl overflow-hidden bg-[#0A090D] border border-white/10 shadow-lg">
                                <div className="relative w-full h-[145px] bg-black/60 overflow-hidden">
                                    <img 
                                        src={frontendImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'} 
                                        alt="Dish Preview" 
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2.5 left-2.5">
                                        <span className={`w-4 h-4 rounded-sm border flex items-center justify-center bg-[#0A090D]/90 shadow-sm ${
                                            foodType === 'veg' ? 'border-emerald-500' : 'border-rose-500'
                                        }`}>
                                            <span className={`w-2 h-2 rounded-full ${foodType === 'veg' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                        </span>
                                    </div>
                                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0A090D]/90 border border-white/10 text-white text-[11px] font-bold">
                                        <FaStar size={10} className="text-amber-400" />
                                        <span>4.8</span>
                                    </div>
                                    <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-[#0A090D]/90 text-[10px] font-semibold text-white/90 border border-white/10">
                                        {category}
                                    </span>
                                </div>

                                <div className="p-3.5 space-y-1.5">
                                    <h4 className="text-[15px] font-black text-white truncate">
                                        {name.trim() || 'Your Dish Name'}
                                    </h4>
                                    <p className="text-xs text-gray-400 truncate">
                                        {myShopData?.name || 'Your Restaurant'}
                                    </p>
                                    <div className="pt-2 flex items-center justify-between border-t border-white/[0.08]">
                                        <span className="text-base font-black text-white font-mono">
                                            ₹{price || 0}
                                        </span>
                                        <button 
                                            type="button"
                                            className="px-3.5 py-1.5 rounded-full bg-[#FF6B00] text-white text-xs font-bold"
                                        >
                                            Add +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditItem
