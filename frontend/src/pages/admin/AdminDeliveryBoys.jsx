import React, { useState, useEffect } from 'react'
import axios from 'axios'
// ✅ FIXED: Correct import path
import { serverUrl } from '../../App'  // ✅ 2 levels up (pages/admin/AdminDeliveryBoys.jsx → App.jsx)
import { toast } from 'react-toastify'
import { 
    FaUser, FaCheckCircle, FaTimesCircle, FaHourglassHalf,
    FaMotorcycle, FaPhone, FaEnvelope, FaSearch,
    FaSync, FaSpinner, FaShieldAlt, FaUserCheck
} from 'react-icons/fa'
import { motion } from 'framer-motion'
import { ClipLoader } from 'react-spinners'

function AdminDeliveryBoys() {
    const [deliveryBoys, setDeliveryBoys] = useState([])
    const [filteredBoys, setFilteredBoys] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [fetching, setFetching] = useState(false)

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
    }, [searchQuery, filterStatus, deliveryBoys])

    // ✅ FIXED: Changed /api/admin/ to /api/super-admin/
    const fetchDeliveryBoys = async () => {
        setFetching(true)
        try {
            const response = await axios.get(`${serverUrl}/api/super-admin/delivery-boys`, {
                withCredentials: true
            })
            console.log("📦 Delivery Boys:", response.data)
            setDeliveryBoys(response.data || [])
            setFilteredBoys(response.data || [])
        } catch (error) {
            console.log('❌ Fetch error:', error)
            toast.error('Failed to fetch delivery boys')
        } finally {
            setLoading(false)
            setFetching(false)
        }
    }

    // ✅ FIXED: Changed /api/admin/ to /api/super-admin/
    const approveDeliveryBoy = async (id) => {
        try {
            await axios.put(`${serverUrl}/api/super-admin/delivery-boys/${id}/approve`, {}, {
                withCredentials: true
            })
            toast.success('✅ Delivery boy approved successfully!')
            fetchDeliveryBoys()
        } catch (error) {
            console.log('❌ Approve error:', error)
            toast.error(error.response?.data?.message || 'Failed to approve')
        }
    }

    // ✅ FIXED: Changed /api/admin/ to /api/super-admin/
    const rejectDeliveryBoy = async (id) => {
        if (!window.confirm('Are you sure you want to reject this delivery boy?')) {
            return
        }
        
        try {
            await axios.delete(`${serverUrl}/api/super-admin/delivery-boys/${id}`, {
                withCredentials: true
            })
            toast.success('❌ Delivery boy rejected successfully!')
            fetchDeliveryBoys()
        } catch (error) {
            console.log('❌ Reject error:', error)
            toast.error(error.response?.data?.message || 'Failed to reject')
        }
    }

    const stats = {
        total: deliveryBoys.length,
        approved: deliveryBoys.filter(b => b.isApproved === true).length,
        pending: deliveryBoys.filter(b => b.isApproved !== true).length
    }

    if (loading) {
        return (
            <div className='min-h-screen bg-[#0a0a0f] flex items-center justify-center'>
                <div className='flex flex-col items-center gap-4'>
                    <ClipLoader size={50} color="#ff2d55" />
                    <p className='text-white/40 text-sm animate-pulse'>Loading delivery boys...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-[#0a0a0f] relative overflow-hidden p-6'>
            
            <div className='absolute inset-0 pointer-events-none'>
                <div className='absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#ff2d55]/5 rounded-full blur-3xl' />
                <div className='absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#ff6b35]/5 rounded-full blur-3xl' />
            </div>

            <div className='relative z-10 max-w-6xl mx-auto'>
                
                <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
                    <div>
                        <h1 className='text-3xl font-bold text-white flex items-center gap-3'>
                            <FaMotorcycle className='text-[#ff6b35]' />
                            Delivery Boys
                            <span className='text-xs bg-[#ff2d55]/20 px-3 py-1 rounded-full text-[#ff6b35] border border-[#ff2d55]/20'>
                                {stats.total}
                            </span>
                        </h1>
                        <p className='text-white/40 text-sm'>Manage delivery partners and their approvals</p>
                    </div>
                    <button
                        className='px-4 py-2 rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 border border-white/5 flex items-center gap-2 text-sm'
                        onClick={fetchDeliveryBoys}
                        disabled={fetching}
                    >
                        {fetching ? <FaSpinner className='animate-spin' /> : <FaSync />}
                        Refresh
                    </button>
                </div>

                <div className='grid grid-cols-3 gap-4 mb-6'>
                    <div className='glass-premium-ultra p-4 rounded-2xl border border-white/5 text-center'>
                        <p className='text-2xl font-bold text-white'>{stats.total}</p>
                        <p className='text-white/30 text-xs uppercase tracking-wider'>Total</p>
                    </div>
                    <div className='glass-premium-ultra p-4 rounded-2xl border border-green-500/20 text-center'>
                        <p className='text-2xl font-bold text-green-400'>{stats.approved}</p>
                        <p className='text-white/30 text-xs uppercase tracking-wider'>Approved ✅</p>
                    </div>
                    <div className='glass-premium-ultra p-4 rounded-2xl border border-yellow-500/20 text-center'>
                        <p className='text-2xl font-bold text-yellow-400'>{stats.pending}</p>
                        <p className='text-white/30 text-xs uppercase tracking-wider'>Pending ⏳</p>
                    </div>
                </div>

                <div className='glass-premium-ultra p-4 rounded-2xl border border-white/5 mb-6'>
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
                        <div className='flex gap-2'>
                            {[
                                { id: 'all', label: 'All' },
                                { id: 'approved', label: '✅ Approved' },
                                { id: 'pending', label: '⏳ Pending' }
                            ].map((filter) => (
                                <button
                                    key={filter.id}
                                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                                        filterStatus === filter.id
                                            ? 'bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white shadow-lg shadow-[#ff2d55]/20'
                                            : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-white/5'
                                    }`}
                                    onClick={() => setFilterStatus(filter.id)}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {filteredBoys.length === 0 ? (
                    <div className='glass-premium-ultra p-16 rounded-3xl border border-white/5 text-center'>
                        <FaMotorcycle className='text-white/10 text-5xl mx-auto mb-4' />
                        <h3 className='text-white font-semibold text-xl mb-2'>No Delivery Boys Found</h3>
                        <p className='text-white/30 text-sm'>
                            {searchQuery ? 'Try changing your search query' : 'No delivery boys registered yet'}
                        </p>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {filteredBoys.map((boy, index) => (
                            <motion.div
                                key={boy._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`glass-premium-ultra p-4 rounded-2xl border transition-all duration-300 ${
                                    boy.isApproved 
                                        ? 'border-green-500/20 hover:border-green-500/40' 
                                        : 'border-yellow-500/20 hover:border-yellow-500/40'
                                }`}
                            >
                                <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                                    <div className='flex items-center gap-4'>
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                                            boy.isApproved 
                                                ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                                                : 'bg-gradient-to-br from-yellow-500 to-orange-500'
                                        }`}>
                                            {boy.fullName?.charAt(0) || 'D'}
                                        </div>
                                        <div>
                                            <p className='text-white font-semibold flex items-center gap-2'>
                                                {boy.fullName || 'Unknown'}
                                                {boy.isApproved ? (
                                                    <FaCheckCircle className='text-green-400 text-sm' />
                                                ) : (
                                                    <FaHourglassHalf className='text-yellow-400 text-sm animate-pulse' />
                                                )}
                                            </p>
                                            <p className='text-white/40 text-sm flex items-center gap-2'>
                                                <FaEnvelope size={12} /> {boy.email || 'N/A'}
                                            </p>
                                            <p className='text-white/30 text-xs flex items-center gap-2'>
                                                <FaPhone size={12} /> {boy.mobile || 'N/A'}
                                                <span className='w-1 h-1 rounded-full bg-white/20' />
                                                <span className={boy.isOnline ? 'text-green-400' : 'text-red-400'}>
                                                    {boy.isOnline ? '🟢 Online' : '🔴 Offline'}
                                                </span>
                                                <span className='w-1 h-1 rounded-full bg-white/20' />
                                                <span className='text-white/30'>
                                                    {boy.totalDeliveries || 0} deliveries
                                                </span>
                                                {boy.deliveryBoyRating?.average > 0 && (
                                                    <>
                                                        <span className='w-1 h-1 rounded-full bg-white/20' />
                                                        <span className='text-yellow-400'>
                                                            ★ {boy.deliveryBoyRating.average.toFixed(1)}
                                                        </span>
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className='flex items-center gap-3'>
                                        <span className={`text-xs px-4 py-1.5 rounded-full font-medium border ${
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
                                                    className='px-4 py-1.5 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30 transition text-xs font-medium border border-green-500/30 flex items-center gap-1'
                                                    onClick={() => approveDeliveryBoy(boy._id)}
                                                >
                                                    <FaUserCheck size={12} /> Approve
                                                </motion.button>
                                                <motion.button 
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className='px-4 py-1.5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition text-xs font-medium border border-red-500/30 flex items-center gap-1'
                                                    onClick={() => rejectDeliveryBoy(boy._id)}
                                                >
                                                    <FaTimesCircle size={12} /> Reject
                                                </motion.button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .glass-premium-ultra {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }
            `}</style>
        </div>
    )
}

export default AdminDeliveryBoys