import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../../config'
import { 
    FaEdit, FaTrash, FaStar, FaLeaf, FaDrumstickBite,
    FaClock, FaTag, FaUtensils, FaEye
} from "react-icons/fa"
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'

function OwnerItemCard({ data, index = 0, onDelete }) {
    const navigate = useNavigate()
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    if (!data) return null

    const isVeg = data.foodType === 'veg'
    const rating = data.rating?.average || 4.5
    const reviews = data.rating?.count || 42
    const itemName = data.name || 'Delicious Dish'
    const itemPrice = data.price || 0
    const itemImage = data.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
    const itemCategory = data.category || 'Menu'
    const itemId = data._id

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await axios.get(`${serverUrl}/api/item/delete/${itemId}`, {
                withCredentials: true
            })
            toast.success(`${itemName} deleted successfully! 🗑️`)
            setShowDeleteConfirm(false)
            if (onDelete) {
                onDelete(itemId)
            } else {
                window.location.reload()
            }
        } catch (error) {
            console.error('Delete item error:', error)
            toast.error(error.response?.data?.message || 'Failed to delete item')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, duration: 0.25, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className="group relative w-full rounded-2xl overflow-hidden bg-[#13121A] border border-white/[0.08] hover:border-[#FF6B00]/40 transition-all duration-300 shadow-xl flex flex-col justify-between"
        >
            {/* 1. Food Photo Container (Height: 145px) */}
            <div className="relative w-full h-[145px] overflow-hidden bg-[#0A090D]">
                <img 
                    src={itemImage}
                    alt={itemName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                />

                {/* Top-Left: FSSAI Indicator */}
                <div className="absolute top-2.5 left-2.5">
                    <span 
                        className={`w-4 h-4 rounded-sm border flex items-center justify-center bg-[#0A090D]/90 shadow-sm ${
                            isVeg ? 'border-emerald-500' : 'border-rose-500'
                        }`}
                        title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                    >
                        <span className={`w-2 h-2 rounded-full ${isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    </span>
                </div>

                {/* Top-Right: Rating Badge */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0A090D]/90 border border-white/10 text-white text-[11px] font-bold shadow-sm">
                    <FaStar size={10} className="text-amber-400" />
                    <span>{Number(rating).toFixed(1)}</span>
                </div>

                {/* Bottom-Left: Category Tag */}
                {itemCategory && (
                    <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-[#0A090D]/90 text-[10px] font-semibold text-white/90 border border-white/10">
                        {itemCategory}
                    </span>
                )}
            </div>

            {/* 2. Item Info & Controls */}
            <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                    <h4 
                        className="text-[15px] font-black text-white group-hover:text-[#FF6B00] transition-colors truncate leading-tight"
                        title={itemName}
                    >
                        {itemName}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {reviews} customer orders
                    </p>
                </div>

                {/* Price and Action Buttons */}
                <div className="pt-2.5 flex items-center justify-between border-t border-white/[0.08]">
                    <span className="text-base font-black text-white font-mono">
                        ₹{itemPrice}
                    </span>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => navigate(`/edit-item/${itemId}`)}
                            className="p-2 rounded-xl bg-white/[0.06] hover:bg-[#FF6B00] text-gray-300 hover:text-white transition cursor-pointer"
                            title="Edit Item"
                        >
                            <FaEdit size={12} />
                        </button>

                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white transition cursor-pointer"
                            title="Delete Item"
                        >
                            <FaTrash size={12} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setShowDeleteConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#13121A] border border-white/15 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl text-white text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
                                <FaTrash size={22} />
                            </div>

                            <div>
                                <h3 className="text-base font-black text-white">Delete "{itemName}"?</h3>
                                <p className="text-xs text-gray-400 mt-1">
                                    This dish will be permanently removed from your restaurant's active menu.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer"
                                >
                                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default OwnerItemCard
