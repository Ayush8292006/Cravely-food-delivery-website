import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
    FaStore, FaImage, FaMapMarkerAlt, FaCity, FaSave, 
    FaCamera, FaUpload, FaCheck, FaArrowLeft, FaStar,
    FaInfoCircle, FaClock
} from "react-icons/fa"
import { toast } from "react-toastify"
import axios from 'axios'
import { serverUrl } from '../../config'
import { setMyShopData } from '../redux/ownerSlice'
import { ClipLoader } from 'react-spinners'
import { motion } from 'framer-motion'
import OwnerNav from '../components/OwnerNav'

function CreateEditShop() {
    const { myShopData } = useSelector(state => state.owner)
    const { currentCity, currentState, currentAddress } = useSelector(state => state.user)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    
    const [name, setName] = useState(myShopData?.name || "")
    const [address, setAddress] = useState(myShopData?.address || currentAddress || "")
    const [city, setCity] = useState(myShopData?.city || currentCity || "")
    const [state, setState] = useState(myShopData?.state || currentState || "")
    const [frontendImage, setFrontendImage] = useState(myShopData?.image || null)
    const [backendImage, setBackendImage] = useState(null)
    const [loading, setLoading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)

    useEffect(() => {
        return () => {
            if (frontendImage && frontendImage.startsWith('blob:')) {
                URL.revokeObjectURL(frontendImage)
            }
        }
    }, [frontendImage])

    const isEditing = !!myShopData

    const handleImageChange = (file) => {
        if (!file) return
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
        if (!validTypes.includes(file.type)) {
            toast.error('Please upload a valid image (JPEG, PNG, WEBP)')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB')
            return
        }
        if (frontendImage && frontendImage.startsWith('blob:')) {
            URL.revokeObjectURL(frontendImage)
        }
        setBackendImage(file)
        setFrontendImage(URL.createObjectURL(file))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!name.trim() || !address.trim() || !city.trim() || !state.trim()) {
            toast.warning('Please fill in all required fields')
            return
        }
        if (!frontendImage && !backendImage) {
            toast.warning('Please upload a restaurant cover image')
            return
        }

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('name', name)
            formData.append('address', address)
            formData.append('city', city)
            formData.append('state', state)
            if (backendImage) {
                formData.append('image', backendImage)
            }

            const response = await axios.post(
                `${serverUrl}/api/shop/create-edit`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true
                }
            )

            dispatch(setMyShopData(response.data.shop))
            toast.success(isEditing ? 'Restaurant updated successfully!' : 'Restaurant created successfully! 🎉')
            navigate('/owner-dashboard')
        } catch (error) {
            console.error('Error saving restaurant:', error)
            toast.error(error.response?.data?.message || 'Failed to save restaurant profile')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div 
            className="min-h-screen bg-[#0A090D] text-white pt-[90px] pb-24 px-4 sm:px-6 lg:px-8 selection:bg-[#FF6B00] selection:text-white"
            style={{ fontFamily: "'Poppins', 'Segoe UI', system-ui, sans-serif" }}
        >
            <OwnerNav />

            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Header Strip */}
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
                                {isEditing ? 'Edit Restaurant Profile' : 'Register New Restaurant'}
                            </h1>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Set up your restaurant identity, delivery coverage & cover photography
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main 2-Column Grid: Form Left, Live Preview Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Form: 7 cols */}
                    <div className="lg:col-span-7 bg-[#13121A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            
                            {/* Shop Name */}
                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <FaStore size={12} className="text-[#FF6B00]" />
                                    <span>Restaurant Name *</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. The Royal Biryani & Kebab Co."
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full bg-[#0A090D] border border-white/10 focus:border-[#FF6B00] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-gray-500 focus:outline-none transition"
                                />
                            </div>

                            {/* Street Address */}
                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <FaMapMarkerAlt size={12} className="text-[#FF6B00]" />
                                    <span>Detailed Street Address *</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Shop 12, Alpha 1 Commercial Belt"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                    className="w-full bg-[#0A090D] border border-white/10 focus:border-[#FF6B00] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-gray-500 focus:outline-none transition"
                                />
                            </div>

                            {/* City and State */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                        <FaCity size={12} className="text-[#FF6B00]" />
                                        <span>City *</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Greater Noida"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        required
                                        className="w-full bg-[#0A090D] border border-white/10 focus:border-[#FF6B00] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-gray-500 focus:outline-none transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                                        <span>State / Province *</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Uttar Pradesh"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        required
                                        className="w-full bg-[#0A090D] border border-white/10 focus:border-[#FF6B00] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-gray-500 focus:outline-none transition"
                                    />
                                </div>
                            </div>

                            {/* Image Upload Zone */}
                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <FaCamera size={12} className="text-[#FF6B00]" />
                                    <span>Restaurant Cover Photo *</span>
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
                                        id="coverImageInput"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) handleImageChange(e.target.files[0]);
                                        }}
                                    />
                                    <label htmlFor="coverImageInput" className="cursor-pointer space-y-2 block">
                                        <div className="w-12 h-12 mx-auto rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF6B00]">
                                            <FaUpload size={18} />
                                        </div>
                                        <p className="text-xs font-bold text-white">Click or drag & drop cover image</p>
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
                                            <span>{isEditing ? 'Save Restaurant Profile' : 'Publish Restaurant to Cravely'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Live Preview: 5 cols */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="bg-[#13121A] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                                    Customer Card Live Preview
                                </h3>
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                    Live Preview
                                </span>
                            </div>

                            {/* Simulated Card */}
                            <div className="rounded-2xl overflow-hidden bg-[#0A090D] border border-white/10 shadow-lg">
                                <div className="relative w-full h-[150px] bg-black/60 overflow-hidden">
                                    <img 
                                        src={frontendImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop'} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                                        Verified
                                    </div>
                                    <div className="absolute bottom-2.5 right-2.5 bg-emerald-600 text-white font-black text-xs px-2 py-0.5 rounded-md flex items-center gap-1">
                                        <FaStar size={10} />
                                        <span>4.8</span>
                                    </div>
                                </div>

                                <div className="p-3.5 space-y-1.5">
                                    <h4 className="text-[15px] font-black text-white truncate">
                                        {name.trim() || 'Your Restaurant Name'}
                                    </h4>
                                    <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                                        <FaMapMarkerAlt size={10} className="text-[#FF6B00]" />
                                        <span>{address.trim() || 'Restaurant Address'}, {city.trim() || 'City'}</span>
                                    </p>
                                    <div className="pt-2 flex items-center justify-between border-t border-white/[0.08] text-[11px] text-gray-300">
                                        <span>30-40 mins • ₹200 for two</span>
                                        <span className="text-[#FF8C00] font-bold">Explore →</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[11px] text-gray-500 text-center leading-relaxed">
                                This is how customers in {city || 'your area'} will discover and browse your kitchen.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateEditShop
