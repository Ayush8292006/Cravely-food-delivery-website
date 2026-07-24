import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../../App'
import { 
    FaSearch, FaCheck, FaTimes, FaEye,
    FaStore, FaMapMarkerAlt, FaUser, FaClock,
    FaChevronLeft, FaChevronRight, FaStar, FaGem
} from "react-icons/fa";
import { ClipLoader } from 'react-spinners'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import AdminLayout from './AdminLayout'



function AdminShops() {
    const [shops, setShops] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')

    useEffect(() => {
        fetchShops()
    }, [])

    const fetchShops = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/super-admin/shops`, {
                withCredentials: true
            })
            setShops(result.data)
        } catch (error) {
            toast.error('Failed to fetch shops')
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (shopId, isApproved) => {
        try {
            await axios.put(`${serverUrl}/api/super-admin/shops/${shopId}/approve`, {
                isApproved
            }, { withCredentials: true })
            toast.success(`Shop ${isApproved ? 'approved' : 'rejected'} successfully`)
            fetchShops()
        } catch (error) {
            toast.error('Failed to update shop')
        }
    }

    const filteredShops = shops.filter(shop => {
        const matchesSearch = shop.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             shop.address?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = filterStatus === 'all' || 
                             (filterStatus === 'approved' && shop.isApproved) ||
                             (filterStatus === 'pending' && !shop.isApproved)
        return matchesSearch && matchesStatus
    })

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-[70vh]">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <ClipLoader size={50} color="#ffd700" />
                    </motion.div>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
            >
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        🏪 Shops Management
                        <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        >
                            <span className="text-[#ffd93d] text-sm">✨</span>
                        </motion.span>
                    </h1>
                    <p className="text-white/40 text-sm">Manage all restaurants on your platform</p>
                </div>
                <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="text-white/30 text-sm bg-white/5 px-4 py-2 rounded-full border border-white/5"
                >
                    {filteredShops.length} shops found
                </motion.div>
            </motion.div>

            {/* Filters */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col sm:flex-row gap-4 mb-6"
            >
                <div className="flex-1 relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search shops..."
                        className="w-full bg-[#18181D] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="bg-[#18181D] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ff2d55]/50"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">All Shops</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                </select>
            </motion.div>

            {/* Shops Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredShops.map((shop, idx) => (
                    <motion.div
                        key={shop._id}
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: idx * 0.05, type: "spring", stiffness: 200 }}
                        whileHover={{ 
                            y: -8, 
                            scale: 1.02,
                            transition: { type: "spring", stiffness: 300 }
                        }}
                        className="glass-premium rounded-2xl border border-white/5 overflow-hidden hover:border-[#ff2d55]/30 transition-all duration-300"
                    >
                        {/* Image */}
                        <div className="relative h-[160px]">
                            <img src={shop.image} alt={shop.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            {!shop.isApproved ? (
                                <motion.div 
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute top-3 right-3 bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg shadow-yellow-500/30"
                                >
                                    ⏳ Pending
                                </motion.div>
                            ) : (
                                <div className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg shadow-green-500/30">
                                    ✅ Approved
                                </div>
                            )}
                            <div className="absolute bottom-3 left-3">
                                <h3 className="text-white font-bold text-lg">{shop.name}</h3>
                                <p className="text-white/60 text-xs flex items-center gap-1">
                                    <FaMapMarkerAlt size={10} /> {shop.address}
                                </p>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="p-4">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <FaUser className="text-white/30" />
                                    <span className="text-white/60">{shop.owner?.fullName || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FaStar className="text-yellow-400 text-xs" />
                                    <span className="text-white/60 text-xs">{shop.rating?.average || 0}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                                {!shop.isApproved && (
                                    <>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleApprove(shop._id, true)}
                                            className="flex-1 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium border border-green-500/20"
                                        >
                                            <FaCheck size={14} /> Approve
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleApprove(shop._id, false)}
                                            className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium border border-red-500/20"
                                        >
                                            <FaTimes size={14} /> Reject
                                        </motion.button>
                                    </>
                                )}
                                {shop.isApproved && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleApprove(shop._id, false)}
                                        className="w-full py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium"
                                    >
                                        <FaTimes size={14} /> Reject
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredShops.length === 0 && (
                <div className="text-center py-16">
                    <FaStore className="text-white/10 text-5xl mx-auto mb-3" />
                    <p className="text-white/30 text-sm">No shops found</p>
                </div>
            )}

            <style jsx>{`
                .glass-premium {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }
            `}</style>
        </AdminLayout>
    )
}

export default AdminShops