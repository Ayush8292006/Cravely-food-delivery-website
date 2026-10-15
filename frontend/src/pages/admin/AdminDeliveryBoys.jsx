import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
// ✅ FIXED: Correct import path (2 levels up from pages/admin)
import { serverUrl } from '../../../config'
import { toast } from 'react-toastify'
import { 
    FaUser, FaCheckCircle, FaTimesCircle, FaHourglassHalf,
    FaMotorcycle, FaPhone, FaEnvelope, FaSearch,
    FaSync, FaSpinner, FaShieldAlt, FaUserCheck,
    FaDownload, FaExclamationTriangle, FaChevronLeft,
    FaChevronRight, FaUserPlus
} from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipLoader } from 'react-spinners'
import { useSelector } from 'react-redux'
import AdminLayout from './AdminLayout'

function AdminDeliveryBoys() {
    const { socket } = useSelector(state => state.user)
    const [deliveryBoys, setDeliveryBoys] = useState([])
    const [filteredBoys, setFilteredBoys] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [fetching, setFetching] = useState(false)
    const [actionLoading, setActionLoading] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [selectedBoyId, setSelectedBoyId] = useState(null)
    const [confirmAction, setConfirmAction] = useState(null)

    // ✅ Socket listener for new delivery boy registrations
    useEffect(() => {
        if (!socket) return

        const handleNewDeliveryBoy = (data) => {
            console.log('🛵 New delivery boy registered:', data)
            toast.info('🛵 New delivery boy registered!', {
                position: "top-center",
                autoClose: 3000,
            })
            fetchDeliveryBoys()
        }

        socket.on('newDeliveryBoy', handleNewDeliveryBoy)

        return () => {
            socket.off('newDeliveryBoy', handleNewDeliveryBoy)
        }
    }, [socket])

    useEffect(() => {
        fetchDeliveryBoys()
    }, [])

    useEffect(() => {
        let filtered = deliveryBoys
        
        if (filterStatus === 'approved') {
            filtered = filtered.filter(boy => boy.isApproved === true)
        } else if (filterStatus === 'pending') {
            filtered = filtered.filter(boy => boy.isApproved !== true)
        }
        
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(boy => 
                boy.fullName?.toLowerCase().includes(query) ||
                boy.email?.toLowerCase().includes(query) ||
                boy.mobile?.includes(query)
            )
        }
        
        setFilteredBoys(filtered)
        setCurrentPage(1)
    }, [searchQuery, filterStatus, deliveryBoys])

    const totalPages = Math.ceil(filteredBoys.length / itemsPerPage)
    const currentItems = filteredBoys.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const fetchDeliveryBoys = async () => {
        setFetching(true)
        setError(null)
        try {
            const response = await axios.get(`${serverUrl}/api/super-admin/delivery-boys`, {
                withCredentials: true
            })
            setDeliveryBoys(response.data.deliveryBoys || [])
            setFilteredBoys(response.data.deliveryBoys || [])
        } catch (error) {
            console.log('❌ Fetch error:', error)
            const errorMsg = error.response?.data?.message || 'Failed to fetch delivery boys'
            setError(errorMsg)
            toast.error(errorMsg)
        } finally {
            setLoading(false)
            setFetching(false)
        }
    }

    // ✅ FIXED: Approve delivery boy
    const approveDeliveryBoy = async (id) => {
        setActionLoading(id)
        try {
            const response = await axios.put(
                `${serverUrl}/api/super-admin/delivery-boys/${id}/approve`,
                { isApproved: true },
                { withCredentials: true }
            )
            
            if (response.data.success) {
                toast.success('✅ Delivery boy approved successfully!')
                await fetchDeliveryBoys()
            }
        } catch (error) {
            console.log('❌ Approve error:', error)
            toast.error(error.response?.data?.message || 'Failed to approve')
        } finally {
            setActionLoading(null)
        }
    }

    // ✅ FIXED: Reject delivery boy (using approve with false)
    const rejectDeliveryBoy = async (id) => {
        setActionLoading(id)
        try {
            const response = await axios.put(
                `${serverUrl}/api/super-admin/delivery-boys/${id}/approve`,
                { isApproved: false },
                { withCredentials: true }
            )
            
            if (response.data.success) {
                toast.success('❌ Delivery boy rejected successfully!')
                await fetchDeliveryBoys()
            }
        } catch (error) {
            console.log('❌ Reject error:', error)
            toast.error(error.response?.data?.message || 'Failed to reject')
        } finally {
            setActionLoading(null)
            setShowConfirmModal(false)
            setSelectedBoyId(null)
            setConfirmAction(null)
        }
    }

    const handleConfirmAction = () => {
        if (confirmAction === 'approve') {
            approveDeliveryBoy(selectedBoyId)
        } else if (confirmAction === 'reject') {
            rejectDeliveryBoy(selectedBoyId)
        }
    }

    const openConfirmModal = (id, action) => {
        setSelectedBoyId(id)
        setConfirmAction(action)
        setShowConfirmModal(true)
    }

    const exportToCSV = () => {
        const headers = ['Name', 'Email', 'Mobile', 'Status', 'Total Deliveries', 'Rating']
        const rows = filteredBoys.map(boy => [
            boy.fullName || 'N/A',
            boy.email || 'N/A',
            boy.mobile || 'N/A',
            boy.isApproved ? 'Approved' : 'Pending',
            boy.totalDeliveries || 0,
            boy.deliveryBoyRating?.average?.toFixed(1) || 'N/A'
        ])
        
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `delivery-boys-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success('📥 Export successful!')
    }

    const stats = useMemo(() => ({
        total: deliveryBoys.length,
        approved: deliveryBoys.filter(b => b.isApproved === true).length,
        pending: deliveryBoys.filter(b => b.isApproved !== true).length
    }), [deliveryBoys])

    if (loading) {
        return (
            <AdminLayout>
                <div className='flex items-center justify-center h-[60vh]'>
                    <div className='flex flex-col items-center gap-4'>
                        <ClipLoader size={50} color="#ff2d55" />
                        <p className='text-white/40 text-sm animate-pulse'>Loading delivery boys...</p>
                    </div>
                </div>
            </AdminLayout>
        )
    }

    if (error) {
        return (
            <AdminLayout>
                <div className='flex items-center justify-center h-[60vh]'>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='text-center max-w-md'
                    >
                        <div className='w-24 h-24 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4'>
                            <FaExclamationTriangle className='text-red-400 text-5xl' />
                        </div>
                        <h2 className='text-2xl font-bold text-white mb-2'>Something went wrong</h2>
                        <p className='text-white/40 text-sm mb-6'>{error}</p>
                        <button 
                            onClick={fetchDeliveryBoys}
                            className='px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white font-medium flex items-center gap-2 mx-auto'
                        >
                            <FaSync className={fetching ? 'animate-spin' : ''} />
                            Try Again
                        </button>
                    </motion.div>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className='space-y-6'>
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='flex flex-col md:flex-row md:items-center justify-between gap-4'
                >
                    <div>
                        <h1 className='text-2xl sm:text-3xl font-bold text-white flex items-center gap-3'>
                            <FaMotorcycle className='text-[#ff6b35]' />
                            Delivery Boys
                            <span className='text-xs bg-[#ff2d55]/20 px-3 py-1 rounded-full text-[#ff6b35] border border-[#ff2d55]/20'>
                                {stats.total}
                            </span>
                        </h1>
                        <p className='text-white/40 text-sm'>Manage delivery partners and their approvals</p>
                    </div>
                    <div className='flex gap-3'>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className='px-4 py-2 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all duration-300 border border-green-500/20 flex items-center gap-2 text-sm'
                            onClick={exportToCSV}
                        >
                            <FaDownload size={14} />
                            Export
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className='px-4 py-2 rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 border border-white/5 flex items-center gap-2 text-sm'
                            onClick={fetchDeliveryBoys}
                            disabled={fetching}
                        >
                            {fetching ? <FaSpinner className='animate-spin' /> : <FaSync />}
                            Refresh
                        </motion.button>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='grid grid-cols-3 gap-4'
                >
                    <div className='glass-premium p-4 rounded-2xl border border-white/5 text-center'>
                        <p className='text-2xl font-bold text-white'>{stats.total}</p>
                        <p className='text-white/30 text-xs uppercase tracking-wider'>Total</p>
                    </div>
                    <div className='glass-premium p-4 rounded-2xl border border-green-500/20 text-center'>
                        <p className='text-2xl font-bold text-green-400'>{stats.approved}</p>
                        <p className='text-white/30 text-xs uppercase tracking-wider'>Approved ✅</p>
                    </div>
                    <div className='glass-premium p-4 rounded-2xl border border-yellow-500/20 text-center'>
                        <p className='text-2xl font-bold text-yellow-400'>{stats.pending}</p>
                        <p className='text-white/30 text-xs uppercase tracking-wider'>Pending ⏳</p>
                    </div>
                </motion.div>

                {/* Search & Filter */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className='glass-premium p-4 rounded-2xl border border-white/5'
                >
                    <div className='flex flex-col md:flex-row gap-3'>
                        <div className='flex-1 relative'>
                            <FaSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-white/30' size={14} />
                            <input
                                type="text"
                                placeholder='Search by name, email or phone...'
                                className='w-full bg-[#18181D] border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 text-sm'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className='flex gap-2 flex-wrap'>
                            {[
                                { id: 'all', label: 'All' },
                                { id: 'approved', label: '✅ Approved' },
                                { id: 'pending', label: '⏳ Pending' }
                            ].map((filter) => (
                                <motion.button
                                    key={filter.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                                        filterStatus === filter.id
                                            ? 'bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white shadow-lg shadow-[#ff2d55]/20'
                                            : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-white/5'
                                    }`}
                                    onClick={() => setFilterStatus(filter.id)}
                                >
                                    {filter.label}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Delivery Boys List */}
                {filteredBoys.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className='glass-premium p-16 rounded-3xl border border-white/5 text-center'
                    >
                        <FaMotorcycle className='text-white/10 text-5xl mx-auto mb-4' />
                        <h3 className='text-white font-semibold text-xl mb-2'>No Delivery Boys Found</h3>
                        <p className='text-white/30 text-sm'>
                            {searchQuery ? 'Try changing your search query' : 'No delivery boys registered yet'}
                        </p>
                    </motion.div>
                ) : (
                    <>
                        <div className='space-y-3'>
                            {currentItems.map((boy, index) => (
                                <motion.div
                                    key={boy._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`glass-premium p-4 rounded-xl border transition-all duration-300 ${
                                        boy.isApproved 
                                            ? 'border-green-500/20 hover:border-green-500/40' 
                                            : 'border-yellow-500/20 hover:border-yellow-500/40'
                                    }`}
                                >
                                    <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                                        {/* User Info */}
                                        <div className='flex items-center gap-4'>
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${
                                                boy.isApproved 
                                                    ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                                                    : 'bg-gradient-to-br from-yellow-500 to-orange-500'
                                            }`}>
                                                {boy.fullName?.charAt(0) || 'D'}
                                            </div>
                                            <div className='min-w-0'>
                                                <p className='text-white font-semibold flex items-center gap-2'>
                                                    {boy.fullName || 'Unknown'}
                                                    {boy.isApproved ? (
                                                        <FaCheckCircle className='text-green-400 text-sm flex-shrink-0' />
                                                    ) : (
                                                        <FaHourglassHalf className='text-yellow-400 text-sm animate-pulse flex-shrink-0' />
                                                    )}
                                                </p>
                                                <p className='text-white/40 text-sm flex items-center gap-2'>
                                                    <FaEnvelope size={12} className='flex-shrink-0' /> 
                                                    <span className='truncate'>{boy.email || 'N/A'}</span>
                                                </p>
                                                <p className='text-white/30 text-xs flex items-center gap-2 flex-wrap'>
                                                    <FaPhone size={12} className='flex-shrink-0' /> 
                                                    {boy.mobile || 'N/A'}
                                                    <span className='w-1 h-1 rounded-full bg-white/20 flex-shrink-0' />
                                                    <span className={boy.isOnline ? 'text-green-400' : 'text-red-400'}>
                                                        {boy.isOnline ? '🟢 Online' : '🔴 Offline'}
                                                    </span>
                                                    {boy.deliveryBoyRating?.average > 0 && (
                                                        <>
                                                            <span className='w-1 h-1 rounded-full bg-white/20 flex-shrink-0' />
                                                            <span className='text-yellow-400'>
                                                                ★ {boy.deliveryBoyRating.average.toFixed(1)}
                                                            </span>
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className='flex items-center gap-3 flex-wrap'>
                                            <span className={`text-xs px-3 py-1 rounded-full font-medium border ${
                                                boy.isApproved 
                                                    ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                                    : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                            }`}>
                                                {boy.isApproved ? '✅ Approved' : '⏳ Pending'}
                                            </span>
                                            
                                            {!boy.isApproved && (
                                                <div className='flex gap-2'>
                                                    <motion.button 
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className='px-4 py-1.5 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30 transition text-xs font-medium border border-green-500/30 flex items-center gap-1 disabled:opacity-50'
                                                        onClick={() => approveDeliveryBoy(boy._id)}
                                                        disabled={actionLoading === boy._id}
                                                    >
                                                        {actionLoading === boy._id ? (
                                                            <ClipLoader size={12} color="#4ade80" />
                                                        ) : (
                                                            <FaUserCheck size={12} />
                                                        )}
                                                        Approve
                                                    </motion.button>
                                                    <motion.button 
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className='px-4 py-1.5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition text-xs font-medium border border-red-500/30 flex items-center gap-1 disabled:opacity-50'
                                                        onClick={() => openConfirmModal(boy._id, 'reject')}
                                                        disabled={actionLoading === boy._id}
                                                    >
                                                        {actionLoading === boy._id ? (
                                                            <ClipLoader size={12} color="#f87171" />
                                                        ) : (
                                                            <FaTimesCircle size={12} />
                                                        )}
                                                        Reject
                                                    </motion.button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className='flex items-center justify-center gap-2 mt-6'
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className='p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed'
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    <FaChevronLeft size={14} />
                                </motion.button>
                                
                                <span className='text-white/40 text-sm'>
                                    {currentPage} / {totalPages}
                                </span>
                                
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className='p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed'
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    <FaChevronRight size={14} />
                                </motion.button>
                            </motion.div>
                        )}
                    </>
                )}
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showConfirmModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4'
                        onClick={() => {
                            setShowConfirmModal(false)
                            setSelectedBoyId(null)
                            setConfirmAction(null)
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 20 }}
                            className='glass-premium p-6 max-w-md w-full rounded-3xl border border-white/10 text-center'
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className='w-20 h-20 mx-auto rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-4'>
                                <FaExclamationTriangle className='text-red-400 text-4xl' />
                            </div>
                            <h3 className='text-xl font-bold text-white mb-2'>Confirm Rejection</h3>
                            <p className='text-white/40 text-sm mb-6'>
                                Are you sure you want to reject this delivery boy? This action cannot be undone.
                            </p>
                            <div className='flex gap-3'>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    className='flex-1 py-2.5 rounded-xl bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all duration-300 text-sm'
                                    onClick={() => {
                                        setShowConfirmModal(false)
                                        setSelectedBoyId(null)
                                        setConfirmAction(null)
                                    }}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    className='flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300 text-sm flex items-center justify-center gap-2'
                                    onClick={handleConfirmAction}
                                    disabled={actionLoading === selectedBoyId}
                                >
                                    {actionLoading === selectedBoyId ? (
                                        <ClipLoader size={16} color="white" />
                                    ) : (
                                        <>
                                            <FaTimesCircle size={14} />
                                            Yes, Reject
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
            `}</style>
        </AdminLayout>
    )
}

export default AdminDeliveryBoys