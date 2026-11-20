import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    FaStar, FaClock, FaMapMarkerAlt, 
    FaArrowRight, FaHeart, FaRegHeart, FaCheckCircle
} from 'react-icons/fa'
import { motion } from 'framer-motion'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop'

function ShopCard({ shop, data, index = 0, dark = true }) {
    const navigate = useNavigate()
    const currentShop = shop || data || null

    if (!currentShop) return null

    const [isLiked, setIsLiked] = useState(false)
    const [imageError, setImageError] = useState(false)

    const rating = currentShop.rating?.average ? Number(currentShop.rating.average).toFixed(1) : '5.0'
    const reviewCount = currentShop.rating?.count || 0
    const deliveryTime = currentShop.deliveryTime || '30-40 mins'
    const priceForTwo = currentShop.priceForTwo ? `₹${currentShop.priceForTwo} for two` : '₹200 for two'

    const getImageSrc = () => {
        if (imageError) return FALLBACK_IMAGE
        return currentShop.image || FALLBACK_IMAGE
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, duration: 0.25, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className="group relative w-full rounded-2xl overflow-hidden bg-[#13121A] border border-white/[0.08] hover:border-[#FF6B00]/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-black/60 flex flex-col justify-between"
            onClick={() => navigate(`/shop/${currentShop._id}`)}
        >
            {/* 1. RESTAURANT PHOTOGRAPHY COVER (Height: 145px, Clean Solid Dark Backdrop) */}
            <div className="relative w-full h-[145px] overflow-hidden bg-[#0A090D]">
                <img 
                    src={getImageSrc()} 
                    alt={currentShop.name || 'Restaurant'} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                    onError={() => setImageError(true)}
                />

                {/* Top-Right: Wishlist Heart Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        setIsLiked(!isLiked)
                    }}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-[#0A090D]/80 border border-white/10 text-white/80 hover:text-red-500 flex items-center justify-center transition-colors shadow-md"
                    title="Save restaurant"
                >
                    {isLiked ? (
                        <FaHeart size={12} className="text-red-500" />
                    ) : (
                        <FaRegHeart size={12} />
                    )}
                </button>

                {/* Top-Left: Verified Partner Badge */}
                <div className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                    <FaCheckCircle size={9} />
                    <span>Verified</span>
                </div>

                {/* Bottom-Right: Emerald Rating Badge */}
                <div className="absolute bottom-2.5 right-2.5 bg-emerald-600 text-white font-extrabold text-xs px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                    <FaStar size={10} />
                    <span>{Number(rating).toFixed(1)}</span>
                </div>

                {/* Bottom-Left: Category Tag */}
                {currentShop.category && (
                    <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#0A090D]/90 text-[10px] font-semibold text-white/90 border border-white/10">
                        {currentShop.category}
                    </span>
                )}
            </div>

            {/* 2. REFINED RESTAURANT DETAILS & ACTION */}
            <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                    {/* Restaurant Name */}
                    <h4 
                        className="text-[15px] font-black text-white group-hover:text-[#FF6B00] transition-colors truncate leading-tight"
                        title={currentShop.name}
                    >
                        {currentShop.name || 'Gourmet Kitchen'}
                    </h4>

                    {/* Location / Cuisines */}
                    <p className="text-xs text-gray-400 truncate flex items-center gap-1.5 mt-1">
                        <FaMapMarkerAlt size={10} className="text-[#FF6B00] flex-shrink-0" />
                        <span className="truncate">{currentShop.address || 'Central Market'}, {currentShop.city || 'City Center'}</span>
                    </p>

                    {/* Delivery Time and Reviews */}
                    <div className="text-[11px] text-gray-400 flex items-center gap-2 pt-1">
                        <span className="flex items-center gap-1">
                            <FaClock size={9} className="text-[#FF6B00]" />
                            <span>{deliveryTime}</span>
                        </span>
                        <span>•</span>
                        <span>{reviewCount > 0 ? `${reviewCount}+ reviews` : 'New Kitchen'}</span>
                    </div>
                </div>

                {/* Bottom Action Row: Price for Two + Explore Button */}
                <div className="pt-2.5 mt-2 flex items-center justify-between border-t border-white/[0.08]">
                    <span className="text-xs font-semibold text-gray-300">
                        {priceForTwo}
                    </span>

                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/shop/${currentShop._id}`)
                        }}
                        className="px-3 py-1 rounded-full bg-[#FF6B00] hover:bg-orange-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                    >
                        <span>Explore</span>
                        <FaArrowRight size={9} />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

export default ShopCard
