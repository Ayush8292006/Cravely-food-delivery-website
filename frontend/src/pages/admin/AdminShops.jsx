import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
// ✅ FIXED: Correct import path
import { serverUrl } from '../../../config'
import { 
    FaSearch, FaCheck, FaTimes, FaEye,
    FaStore, FaMapMarkerAlt, FaUser, FaClock,
    FaChevronLeft, FaChevronRight, FaStar, FaGem,
    FaTimes as FaClose, FaSync, FaExclamationTriangle,
    FaPhone, FaEnvelope, FaShoppingCart, FaUtensils,
    FaBuilding
} from "react-icons/fa";
import { ClipLoader } from 'react-spinners'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import AdminLayout from './AdminLayout'

function AdminShops() {
    const { socket } = useSelector(state => state.user)  // ✅ Get socket
    const [shops, setShops] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [refreshing, setRefreshing] = useState(false)
    const [selectedShop, setSelectedShop] = useState(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [confirmAction, setConfirmAction] = useState(null) // 'approve' or 'reject'
    const [selectedShopId, setSelectedShopId] = useState(null)
    const [actionLoading, setActionLoading] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(9)

    // ✅ Socket listener for new shop registrations
    useEffect(() => {
        if (!socket) return

        const handleNewShop = () => {
            toast.info('🏪 New shop registered!', {
                position: "top-center",
                autoClose: 3000,
            })
            fetchShops()
        }

        socket.on('newShop', handleNewShop)

        return () => {
            socket.off('newShop', handleNewShop)
        }
    }, [socket])

    useEffect(() => {
        fetchShops()
    }, [])

    const fetchShops = async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await axios.get(`${serverUrl}/api/super-admin/shops`, {
                withCredentials: true
            })
            setShops(result.data || [])
        } catch (error) {
            console.log('❌ Fetch shops error:', error)
            const errorMsg = error.response?.data?.message || 'Failed to fetch shops'
            setError(errorMsg)
            toast.error(errorMsg)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    // ✅ Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchShops()
        toast.info('🔄 Shops refreshed!', {
            position: "top-center",
            autoClose: 2000,
        })
    }

    const handleApprove = async (shopId, isApproved) => {
        setActionLoading(shopId)
        try {
            await axios.put(`${serverUrl}/api/super-admin/shops/${shopId}/approve`, {
                isApproved
            }, { withCredentials: true })
            toast.success(`Shop ${isApproved ? 'approved' : 'rejected'} successfully!`, {
                position: "top-center",
                autoClose: 3000,
            })
            await fetchShops()
            setShowConfirmModal(false)
            setSelectedShopId(null)
            setConfirmAction(null)
        } catch (error) {
            console.log('❌ Update shop error:', error)
            toast.error(error.response?.data?.message || 'Failed to update shop')
        } finally {
            setActionLoading(null)
        }
    }

    // ✅ Open confirmation modal
    const openConfirmModal = (shopId, action) => {
        setSelectedShopId(shopId)
        setConfirmAction(action)
        setShowConfirmModal(true)
    }

    // ✅ Handle confirm action
    const handleConfirmAction = () => {
        if (confirmAction === 'approve') {
            handleApprove(selectedShopId, true)
        } else if (confirmAction === 'reject') {
            handleApprove(selectedShopId, false)
        }
    }

    // ✅ Open shop detail
    const openShopDetail = (shop) => {
        setSelectedShop(shop)
        setShowDetailModal(true)
    }

    // ✅ Clear search
    const clearSearch = () => {
        setSearchQuery('')
    }

    // Filter shops
    const filteredShops = useMemo(() => {
        let filtered = shops
        
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(shop => 
                shop.name?.toLowerCase().includes(query) ||
                shop.address?.toLowerCase().includes(query) ||
                shop.city?.toLowerCase().includes(query) ||
                shop.owner?.fullName?.toLowerCase().includes(query)
            )
        }
        
        if (filterStatus === 'approved') {
            filtered = filtered.filter(shop => shop.isApproved === true)
        } else if (filterStatus === 'pending') {
            filtered = filtered.filter(shop => shop.isApproved !== true)
        }
        
        return filtered
    }, [shops, searchQuery, filterStatus])

    // ✅ Pagination
    const totalPages = Math.ceil(filteredShops.length / itemsPerPage)
    const currentItems = filteredShops.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    // ✅ Stats
    const stats = useMemo(() => ({
        total: shops.length,
        approved: shops.filter(s => s.isApproved === true).length,
        pending: shops.filter(s => s.isApproved !== true).length
    }), [shops])

    // ✅ Get fallback image
    const getShopImage = (image) => {
        if (!image) return 'https://via.placeholder.com/400x300/1a1a2e/666?text=🏪+No+Image'
        if (image.startsWith('http')) return image
        return image
    }

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-[70vh]">
                    <div className="flex flex-col items-center gap-4">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                            <ClipLoader size={50} color="#ffd700" />
                        </motion.div>
                        <motion.p 
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-white/40 text-sm"
                        >
                            Loading shops...
                        </motion.p>
                    </div>
                </div>
            </AdminLayout>
        )
    }

    // ✅ Error State
    if (error) {
        return (
            <AdminLayout>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center h-[70vh]"
                >
                    <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                        <FaExclamationTriangle className="text-red-400 text-5xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Failed to Load Shops</h2>
                    <p className="text-white/40 text-sm mb-6">{error}</p>
                    <button 
                        onClick={fetchShops}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white font-medium flex items-center gap-2"
                    >
                        <FaSync /> Try Again
                    </button>
                </motion.div>
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
                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="px-4 py-2 rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 border border-white/5 flex items-center gap-2 text-sm disabled:opacity-50"
                    >
                        <FaSync className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </motion.button>
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="text-white/30 text-sm bg-white/5 px-4 py-2 rounded-full border border-white/5"
                    >
                        {filteredShops.length} shops
                    </motion.div>
                </div>
            </motion.div>

            {/* ✅ Stats Cards */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 gap-4 mb-6"
            >
                <div className="glass-premium p-4 rounded-2xl border border-white/5 text-center hover:border-white/20 transition-all duration-300">
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                    <p className="text-white/30 text-xs uppercase tracking-wider">Total Shops</p>
                </div>
                <div className="glass-premium p-4 rounded-2xl border border-green-500/20 text-center hover:border-green-500/40 transition-all duration-300">
                    <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
                    <p className="text-white/30 text-xs uppercase tracking-wider">Approved ✅</p>
                </div>
                <div className="glass-premium p-4 rounded-2xl border border-yellow-500/20 text-center hover:border-yellow-500/40 transition-all duration-300">
                    <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                    <p className="text-white/30 text-xs uppercase tracking-wider">Pending ⏳</p>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col sm:flex-row gap-4 mb-6"
            >
                <div className="flex-1 relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                    <input
                        type="text"
                        placeholder="Search by name, address or owner..."
                        className="w-full bg-[#18181D] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition"
                            onClick={clearSearch}
                        >
                            <FaClose size={14} />
                        </motion.button>
                    )}
                </div>
                <select
                    className="bg-[#18181D] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 cursor-pointer"
                    value={filterStatus}
                    onChange={(e) => {
                        setFilterStatus(e.target.value)
                        setCurrentPage(1)
                    }}
                >
                    <option value="all">All Shops</option>
                    <option value="approved">✅ Approved</option>
                    <option value="pending">⏳ Pending</option>
                </select>
            </motion.div>

            {/* Shops Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentItems.map((shop, idx) => (
                    <motion.div
                        key={shop._id}
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: (idx % 9) * 0.04, type: "spring", stiffness: 200 }}
                        whileHover={{ 
                            y: -8, 
                            scale: 1.02,
                            transition: { type: "spring", stiffness: 300 }
                        }}
                        className="glass-premium rounded-2xl border border-white/5 overflow-hidden hover:border-[#ff2d55]/30 transition-all duration-300 cursor-pointer"
                        onClick={() => openShopDetail(shop)}
                    >
                        {/* Image */}
                        <div className="relative h-[160px]">
                            <img 
                                src={getShopImage(shop.image)} 
                                alt={shop.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/400x300/1a1a2e/666?text=🏪+No+Image'
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            {!shop.isApproved ? (
                                <motion.div 
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute top-3 right-3 bg-yellow-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-yellow-500/30 flex items-center gap-1"
                                >
                                    <FaClock size={10} /> Pending
                                </motion.div>
                            ) : (
                                <div className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-green-500/30 flex items-center gap-1">
                                    <FaCheck size={10} /> Approved
                                </div>
                            )}
                            <div className="absolute bottom-3 left-3">
                                <h3 className="text-white font-bold text-lg truncate max-w-[180px]">{shop.name}</h3>
                                <p className="text-white/60 text-xs flex items-center gap-1">
                                    <FaMapMarkerAlt size={10} /> {shop.city || shop.address?.slice(0, 30) || 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="p-4">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <FaUser className="text-white/30" size={12} />
                                    <span className="text-white/60 text-xs truncate max-w-[120px]">
                                        {shop.owner?.fullName || 'Unknown'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FaStar className="text-yellow-400 text-xs" />
                                    <span className="text-white/60 text-xs">{shop.rating?.average || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                                {!shop.isApproved && (
                                    <>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                openConfirmModal(shop._id, 'approve')
                                            }}
                                            disabled={actionLoading === shop._id}
                                            className="flex-1 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all duration-300 flex items-center justify-center gap-2 text-xs font-medium border border-green-500/20 disabled:opacity-50"
                                        >
                                            {actionLoading === shop._id ? (
                                                <ClipLoader size={12} color="#4ade80" />
                                            ) : (
                                                <>
                                                    <FaCheck size={12} /> Approve
                                                </>
                                            )}
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                openConfirmModal(shop._id, 'reject')
                                            }}
                                            disabled={actionLoading === shop._id}
                                            className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-300 flex items-center justify-center gap-2 text-xs font-medium border border-red-500/20 disabled:opacity-50"
                                        >
                                            {actionLoading === shop._id ? (
                                                <ClipLoader size={12} color="#f87171" />
                                            ) : (
                                                <>
                                                    <FaTimes size={12} /> Reject
                                                </>
                                            )}
                                        </motion.button>
                                    </>
                                )}
                                {shop.isApproved && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            openConfirmModal(shop._id, 'reject')
                                        }}
                                        disabled={actionLoading === shop._id}
                                        className="w-full py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-300 flex items-center justify-center gap-2 text-xs font-medium disabled:opacity-50"
                                    >
                                        {actionLoading === shop._id ? (
                                            <ClipLoader size={12} color="#f87171" />
                                        ) : (
                                            <>
                                                <FaTimes size={12} /> Remove
                                            </>
                                        )}
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredShops.length === 0 && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                >
                    <FaStore className="text-white/10 text-5xl mx-auto mb-3" />
                    <p className="text-white/30 text-sm">
                        {searchQuery ? 'No shops match your search' : 'No shops found'}
                    </p>
                    {searchQuery && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={clearSearch}
                            className="mt-3 text-[#ff6b35] text-sm hover:underline"
                        >
                            Clear search
                        </motion.button>
                    )}
                </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-3 mt-6"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-2.5 rounded-xl bg-white/5 text-white/40 disabled:opacity-30 hover:bg-white/10 transition-all duration-300 border border-white/5 disabled:hover:bg-white/5"
                    >
                        <FaChevronLeft size={14} />
                    </motion.button>
                    <span className="text-white/40 text-sm font-medium">
                        Page {currentPage} of {totalPages}
                    </span>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2.5 rounded-xl bg-white/5 text-white/40 disabled:opacity-30 hover:bg-white/10 transition-all duration-300 border border-white/5 disabled:hover:bg-white/5"
                    >
                        <FaChevronRight size={14} />
                    </motion.button>
                </motion.div>
            )}

            {/* ✅ Shop Detail Modal */}
            <AnimatePresence>
                {showDetailModal && selectedShop && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4"
                        onClick={() => setShowDetailModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 20 }}
                            className="glass-premium max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <FaStore className="text-[#ff6b35]" />
                                    {selectedShop.name}
                                </h2>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 rounded-lg hover:bg-white/10 transition"
                                    onClick={() => setShowDetailModal(false)}
                                >
                                    <FaClose className="text-white/60" />
                                </motion.button>
                            </div>

                            <div className="space-y-4">
                                {/* Shop Image */}
                                <div className="rounded-xl overflow-hidden h-48">
                                    <img 
                                        src={getShopImage(selectedShop.image)} 
                                        alt={selectedShop.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/800x300/1a1a2e/666?text=🏪+No+Image'
                                        }}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-white/30 text-[10px] uppercase tracking-wider">Status</p>
                                        <span className={`text-sm font-medium ${selectedShop.isApproved ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {selectedShop.isApproved ? '✅ Approved' : '⏳ Pending'}
                                        </span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-white/30 text-[10px] uppercase tracking-wider">Rating</p>
                                        <p className="text-white font-medium flex items-center gap-1">
                                            <FaStar className="text-yellow-400" />
                                            {selectedShop.rating?.average || 'N/A'}
                                            {selectedShop.rating?.count > 0 && (
                                                <span className="text-white/30 text-xs">({selectedShop.rating.count})</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                    <p className="text-white/30 text-[10px] uppercase tracking-wider">Address</p>
                                    <p className="text-white/60 text-sm">{selectedShop.address || 'N/A'}</p>
                                    <p className="text-white/40 text-xs">{selectedShop.city}, {selectedShop.state}</p>
                                </div>

                                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                    <p className="text-white/30 text-[10px] uppercase tracking-wider">Owner</p>
                                    <p className="text-white font-medium">{selectedShop.owner?.fullName || 'Unknown'}</p>
                                    <div className="flex items-center gap-3 text-sm text-white/40">
                                        <span className="flex items-center gap-1">
                                            <FaEnvelope size={12} /> {selectedShop.owner?.email || 'N/A'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FaPhone size={12} /> {selectedShop.owner?.mobile || 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                    <p className="text-white/30 text-[10px] uppercase tracking-wider">Details</p>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-white/60 flex items-center gap-1">
                                            <FaUtensils /> {selectedShop.itemsCount || 0} items
                                        </span>
                                        <span className="text-white/60 flex items-center gap-1">
                                            <FaShoppingCart /> {selectedShop.ordersCount || 0} orders
                                        </span>
                                    </div>
                                </div>

                                {/* Actions in Modal */}
                                {!selectedShop.isApproved && (
                                    <div className="flex gap-3">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                setShowDetailModal(false)
                                                openConfirmModal(selectedShop._id, 'approve')
                                            }}
                                            className="flex-1 py-2.5 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all duration-300 font-medium flex items-center justify-center gap-2"
                                        >
                                            <FaCheck /> Approve Shop
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                setShowDetailModal(false)
                                                openConfirmModal(selectedShop._id, 'reject')
                                            }}
                                            className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-300 font-medium flex items-center justify-center gap-2"
                                        >
                                            <FaTimes /> Reject Shop
                                        </motion.button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ✅ Confirmation Modal */}
            <AnimatePresence>
                {showConfirmModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4"
                        onClick={() => {
                            setShowConfirmModal(false)
                            setSelectedShopId(null)
                            setConfirmAction(null)
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 20 }}
                            className="glass-premium p-6 max-w-md w-full rounded-3xl border border-white/10 text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={`w-20 h-20 mx-auto rounded-full ${confirmAction === 'approve' ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'} border flex items-center justify-center mb-4`}>
                                {confirmAction === 'approve' ? (
                                    <FaCheck className="text-green-400 text-4xl" />
                                ) : (
                                    <FaExclamationTriangle className="text-red-400 text-4xl" />
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                {confirmAction === 'approve' ? 'Approve Shop' : 'Reject Shop'}
                            </h3>
                            <p className="text-white/40 text-sm mb-6">
                                {confirmAction === 'approve' 
                                    ? 'Are you sure you want to approve this shop? It will become active on the platform.'
                                    : 'Are you sure you want to reject this shop? This action cannot be undone.'
                                }
                            </p>
                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex-1 py-2.5 rounded-xl bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all duration-300 text-sm"
                                    onClick={() => {
                                        setShowConfirmModal(false)
                                        setSelectedShopId(null)
                                        setConfirmAction(null)
                                    }}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`flex-1 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 ${
                                        confirmAction === 'approve'
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                                            : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30'
                                    }`}
                                    onClick={handleConfirmAction}
                                    disabled={actionLoading === selectedShopId}
                                >
                                    {actionLoading === selectedShopId ? (
                                        <ClipLoader size={16} color="white" />
                                    ) : (
                                        <>
                                            {confirmAction === 'approve' ? <FaCheck /> : <FaTimes />}
                                            {confirmAction === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
                                        </>
                                    )}
                                </motion.button>
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
                .overflow-y-auto::-webkit-scrollbar {
                    width: 4px;
                }
                .overflow-y-auto::-webkit-scrollbar-track {
                    background: transparent;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: rgba(255, 45, 85, 0.3);
                    border-radius: 10px;
                }
            `}</style>
        </AdminLayout>
    )
}

export default AdminShops