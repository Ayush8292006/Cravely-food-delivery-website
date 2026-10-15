import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
// ✅ FIXED: Correct import path
import { serverUrl } from '../../../config'
import { 
    FaSearch, FaUserCheck, FaUserTimes, FaTrash, 
    FaEye, FaChevronLeft, FaChevronRight,
    FaUserCircle, FaEnvelope, FaPhone, FaCalendarAlt,
    FaShieldAlt, FaUserCog, FaGem, FaRocket,
    FaTimes as FaClose, FaSync, FaExclamationTriangle,
    FaStore, FaTruck, FaUser
} from "react-icons/fa";
import { ClipLoader } from 'react-spinners'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import AdminLayout from './AdminLayout'

function AdminUsers() {
    const { socket } = useSelector(state => state.user)  // ✅ Get socket
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterRole, setFilterRole] = useState('all')
    const [refreshing, setRefreshing] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [confirmAction, setConfirmAction] = useState(null) // 'block', 'unblock', 'delete'
    const [selectedUserId, setSelectedUserId] = useState(null)
    const [actionLoading, setActionLoading] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    // ✅ Socket listener for user events
    useEffect(() => {
        if (!socket) return

        const handleUserRegistered = () => {
            toast.info('👤 New user registered!', {
                position: "top-center",
                autoClose: 3000,
            })
            fetchUsers()
        }

        socket.on('userRegistered', handleUserRegistered)

        return () => {
            socket.off('userRegistered', handleUserRegistered)
        }
    }, [socket])

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await axios.get(`${serverUrl}/api/super-admin/users`, {
                withCredentials: true
            })
            setUsers(result.data || [])
        } catch (error) {
            console.log('❌ Fetch users error:', error)
            const errorMsg = error.response?.data?.message || 'Failed to fetch users'
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
        await fetchUsers()
        toast.info('🔄 Users refreshed!', {
            position: "top-center",
            autoClose: 2000,
        })
    }

    const handleBlockToggle = async (userId, isBlocked) => {
        setActionLoading(userId)
        try {
            await axios.put(`${serverUrl}/api/super-admin/users/${userId}/block`, {}, {
                withCredentials: true
            })
            toast.success(`User ${isBlocked ? 'unblocked' : 'blocked'} successfully!`, {
                position: "top-center",
                autoClose: 3000,
            })
            await fetchUsers()
            setShowConfirmModal(false)
            setSelectedUserId(null)
            setConfirmAction(null)
        } catch (error) {
            console.log('❌ Block error:', error)
            toast.error(error.response?.data?.message || 'Failed to update user')
        } finally {
            setActionLoading(null)
        }
    }

    const handleDelete = async (userId) => {
        setActionLoading(userId)
        try {
            await axios.delete(`${serverUrl}/api/super-admin/users/${userId}`, {
                withCredentials: true
            })
            toast.success('User deleted successfully!', {
                position: "top-center",
                autoClose: 3000,
            })
            await fetchUsers()
            setShowConfirmModal(false)
            setSelectedUserId(null)
            setConfirmAction(null)
        } catch (error) {
            console.log('❌ Delete error:', error)
            toast.error(error.response?.data?.message || 'Failed to delete user')
        } finally {
            setActionLoading(null)
        }
    }

    // ✅ Open confirmation modal
    const openConfirmModal = (userId, action) => {
        setSelectedUserId(userId)
        setConfirmAction(action)
        setShowConfirmModal(true)
    }

    // ✅ Handle confirm action
    const handleConfirmAction = () => {
        if (confirmAction === 'block') {
            handleBlockToggle(selectedUserId, false)
        } else if (confirmAction === 'unblock') {
            handleBlockToggle(selectedUserId, true)
        } else if (confirmAction === 'delete') {
            handleDelete(selectedUserId)
        }
    }

    // ✅ Open user detail
    const openUserDetail = (user) => {
        setSelectedUser(user)
        setShowDetailModal(true)
    }

    // ✅ Clear search
    const clearSearch = () => {
        setSearchQuery('')
    }

    // Filter users
    const filteredUsers = useMemo(() => {
        let filtered = users
        
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(user => 
                user.fullName?.toLowerCase().includes(query) ||
                user.email?.toLowerCase().includes(query) ||
                user.mobile?.includes(query)
            )
        }
        
        if (filterRole !== 'all') {
            filtered = filtered.filter(user => user.role === filterRole)
        }
        
        return filtered
    }, [users, searchQuery, filterRole])

    // ✅ Pagination
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
    const currentItems = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    // ✅ Stats
    const stats = useMemo(() => ({
        total: users.length,
        active: users.filter(u => !u.isBlocked).length,
        blocked: users.filter(u => u.isBlocked).length,
        users: users.filter(u => u.role === 'user').length,
        owners: users.filter(u => u.role === 'owner').length,
        deliveryBoys: users.filter(u => u.role === 'deliveryBoy').length,
        admins: users.filter(u => u.role === 'superAdmin').length
    }), [users])

    // ✅ Get role badge color
    const getRoleBadge = (role) => {
        const colors = {
            superAdmin: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
            owner: 'bg-[#ff6b35]/20 text-[#ff6b35] border-[#ff6b35]/20',
            deliveryBoy: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
            user: 'bg-[#ff2d55]/20 text-[#ff2d55] border-[#ff2d55]/20'
        }
        return colors[role] || 'bg-gray-500/20 text-gray-400 border-gray-500/20'
    }

    // ✅ Get role icon
    const getRoleIcon = (role) => {
        const icons = {
            superAdmin: <FaShieldAlt className="text-purple-400" size={12} />,
            owner: <FaStore className="text-[#ff6b35]" size={12} />,
            deliveryBoy: <FaTruck className="text-blue-400" size={12} />,
            user: <FaUser className="text-[#ff2d55]" size={12} />
        }
        return icons[role] || <FaUser className="text-gray-400" size={12} />
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
                            Loading users...
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
                    <h2 className="text-2xl font-bold text-white mb-2">Failed to Load Users</h2>
                    <p className="text-white/40 text-sm mb-6">{error}</p>
                    <button 
                        onClick={fetchUsers}
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
                        👥 Users Management
                        <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        >
                            <span className="text-[#ffd93d] text-sm">✨</span>
                        </motion.span>
                    </h1>
                    <p className="text-white/40 text-sm">Manage all users on your platform</p>
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
                        {filteredUsers.length} users
                    </motion.div>
                </div>
            </motion.div>

            {/* ✅ Stats Cards */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-6"
            >
                {[
                    { label: 'Total', value: stats.total, color: 'text-white', bg: 'bg-white/5' },
                    { label: 'Active', value: stats.active, color: 'text-green-400', bg: 'bg-green-500/10' },
                    { label: 'Blocked', value: stats.blocked, color: 'text-red-400', bg: 'bg-red-500/10' },
                    { label: 'Users', value: stats.users, color: 'text-[#ff2d55]', bg: 'bg-[#ff2d55]/10' },
                    { label: 'Owners', value: stats.owners, color: 'text-[#ff6b35]', bg: 'bg-[#ff6b35]/10' },
                    { label: 'Delivery', value: stats.deliveryBoys, color: 'text-blue-400', bg: 'bg-blue-500/10' }
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -3 }}
                        className={`${stat.bg} rounded-xl p-3 text-center border border-white/5 hover:border-white/10 transition-all duration-300`}
                    >
                        <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-white/30 text-[8px] uppercase tracking-wider">{stat.label}</p>
                    </motion.div>
                ))}
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
                        placeholder="Search by name, email or phone..."
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
                    value={filterRole}
                    onChange={(e) => {
                        setFilterRole(e.target.value)
                        setCurrentPage(1)
                    }}
                >
                    <option value="all">All Roles</option>
                    <option value="user">👤 Users</option>
                    <option value="owner">🏪 Owners</option>
                    <option value="deliveryBoy">🛵 Delivery Boys</option>
                    <option value="superAdmin">👑 Super Admin</option>
                </select>
            </motion.div>

            {/* Users Table */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-premium rounded-2xl border border-white/5 overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-[#ff2d55]/10 to-[#ff6b35]/10 border-b border-white/5">
                            <tr>
                                <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-4 py-3">User</th>
                                <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-4 py-3 hidden md:table-cell">Email</th>
                                <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Role</th>
                                <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Status</th>
                                <th className="text-center text-white/40 text-xs font-medium uppercase tracking-wider px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((user, idx) => (
                                <motion.tr 
                                    key={user._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                                    className="border-b border-white/5 transition-all duration-300 cursor-pointer"
                                    onClick={() => openUserDetail(user)}
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <motion.div 
                                                whileHover={{ scale: 1.1, rotate: 10 }}
                                                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#ff2d55]/20 flex-shrink-0"
                                            >
                                                {user.fullName?.charAt(0) || 'U'}
                                            </motion.div>
                                            <div className="min-w-0">
                                                <p className="text-white font-medium text-sm truncate">{user.fullName || 'Unknown'}</p>
                                                <p className="text-white/30 text-[10px]">{user.mobile || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <p className="text-white/60 text-sm truncate max-w-[180px]">{user.email || 'N/A'}</p>
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell">
                                        <span className={`text-[10px] px-2.5 py-1 rounded-full border flex items-center gap-1 w-fit ${getRoleBadge(user.role)}`}>
                                            {getRoleIcon(user.role)}
                                            {user.role === 'superAdmin' ? 'Admin' : user.role === 'deliveryBoy' ? 'Delivery' : user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        {user.isBlocked ? (
                                            <span className="text-xs text-red-400 flex items-center gap-1">
                                                <FaUserTimes size={12} /> Blocked
                                            </span>
                                        ) : (
                                            <span className="text-xs text-green-400 flex items-center gap-1">
                                                <FaUserCheck size={12} /> Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            {user.role !== 'superAdmin' && (
                                                <>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => openConfirmModal(user._id, user.isBlocked ? 'unblock' : 'block')}
                                                        disabled={actionLoading === user._id}
                                                        className={`p-2 rounded-lg transition-all duration-300 disabled:opacity-50 ${
                                                            user.isBlocked 
                                                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                                                                : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                                        }`}
                                                        title={user.isBlocked ? 'Unblock' : 'Block'}
                                                    >
                                                        {actionLoading === user._id ? (
                                                            <ClipLoader size={12} color={user.isBlocked ? '#4ade80' : '#fbbf24'} />
                                                        ) : (
                                                            user.isBlocked ? <FaUserCheck size={14} /> : <FaUserTimes size={14} />
                                                        )}
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1, rotate: 15 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => openConfirmModal(user._id, 'delete')}
                                                        disabled={actionLoading === user._id}
                                                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-300 disabled:opacity-50"
                                                        title="Delete"
                                                    >
                                                        {actionLoading === user._id ? (
                                                            <ClipLoader size={12} color="#f87171" />
                                                        ) : (
                                                            <FaTrash size={14} />
                                                        )}
                                                    </motion.button>
                                                </>
                                            )}
                                            {user.role === 'superAdmin' && (
                                                <span className="text-[10px] text-purple-400 flex items-center gap-1 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                                                    <FaShieldAlt size={12} /> Admin
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12"
                    >
                        <FaUserCircle className="text-white/10 text-5xl mx-auto mb-3" />
                        <p className="text-white/30 text-sm">
                            {searchQuery ? 'No users match your search' : 'No users found'}
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
            </motion.div>

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

            {/* ✅ User Detail Modal */}
            <AnimatePresence>
                {showDetailModal && selectedUser && (
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
                            className="glass-premium max-w-md w-full rounded-3xl border border-white/10 p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <FaUserCircle className="text-[#ff6b35]" />
                                    User Profile
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
                                {/* Avatar */}
                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-[#ff2d55]/30">
                                        {selectedUser.fullName?.charAt(0) || 'U'}
                                    </div>
                                    <h3 className="text-white font-semibold text-lg mt-2">{selectedUser.fullName || 'Unknown'}</h3>
                                    <span className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1 ${getRoleBadge(selectedUser.role)}`}>
                                        {getRoleIcon(selectedUser.role)}
                                        {selectedUser.role === 'superAdmin' ? 'Super Admin' : selectedUser.role === 'deliveryBoy' ? 'Delivery Boy' : selectedUser.role}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-white/30 text-[10px] uppercase tracking-wider">Status</p>
                                        <span className={`text-sm font-medium ${selectedUser.isBlocked ? 'text-red-400' : 'text-green-400'}`}>
                                            {selectedUser.isBlocked ? '🔴 Blocked' : '🟢 Active'}
                                        </span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-white/30 text-[10px] uppercase tracking-wider">Joined</p>
                                        <p className="text-white/60 text-sm">
                                            {new Date(selectedUser.createdAt).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                    <p className="text-white/30 text-[10px] uppercase tracking-wider">Contact</p>
                                    <p className="text-white/60 text-sm flex items-center gap-2">
                                        <FaEnvelope size={12} className="text-white/30" />
                                        {selectedUser.email || 'N/A'}
                                    </p>
                                    <p className="text-white/60 text-sm flex items-center gap-2">
                                        <FaPhone size={12} className="text-white/30" />
                                        {selectedUser.mobile || 'N/A'}
                                    </p>
                                </div>

                                {selectedUser.role === 'owner' && selectedUser.shop && (
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-white/30 text-[10px] uppercase tracking-wider">Shop</p>
                                        <p className="text-white font-medium">{selectedUser.shop.name}</p>
                                        <p className="text-white/40 text-sm">{selectedUser.shop.address}</p>
                                    </div>
                                )}

                                {selectedUser.role === 'deliveryBoy' && (
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-white/30 text-[10px] uppercase tracking-wider">Delivery Stats</p>
                                        <div className="flex gap-4 text-sm">
                                            <span className="text-white/60">📦 {selectedUser.totalDeliveries || 0} deliveries</span>
                                            <span className="text-white/60 flex items-center gap-1">
                                                ⭐ {selectedUser.deliveryBoyRating?.average?.toFixed(1) || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Actions in Modal */}
                                {selectedUser.role !== 'superAdmin' && (
                                    <div className="flex gap-3">
                                        {selectedUser.isBlocked ? (
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    setShowDetailModal(false)
                                                    openConfirmModal(selectedUser._id, 'unblock')
                                                }}
                                                className="flex-1 py-2.5 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all duration-300 font-medium flex items-center justify-center gap-2"
                                            >
                                                <FaUserCheck /> Unblock User
                                            </motion.button>
                                        ) : (
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    setShowDetailModal(false)
                                                    openConfirmModal(selectedUser._id, 'block')
                                                }}
                                                className="flex-1 py-2.5 rounded-xl bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-all duration-300 font-medium flex items-center justify-center gap-2"
                                            >
                                                <FaUserTimes /> Block User
                                            </motion.button>
                                        )}
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                setShowDetailModal(false)
                                                openConfirmModal(selectedUser._id, 'delete')
                                            }}
                                            className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-300 font-medium flex items-center justify-center gap-2"
                                        >
                                            <FaTrash /> Delete User
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
                            setSelectedUserId(null)
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
                            <div className={`w-20 h-20 mx-auto rounded-full border flex items-center justify-center mb-4 ${
                                confirmAction === 'delete' ? 'bg-red-500/20 border-red-500/30' :
                                confirmAction === 'block' || confirmAction === 'unblock' ? 'bg-yellow-500/20 border-yellow-500/30' :
                                'bg-green-500/20 border-green-500/30'
                            }`}>
                                {confirmAction === 'delete' ? (
                                    <FaTrash className="text-red-400 text-4xl" />
                                ) : confirmAction === 'block' ? (
                                    <FaUserTimes className="text-yellow-400 text-4xl" />
                                ) : confirmAction === 'unblock' ? (
                                    <FaUserCheck className="text-green-400 text-4xl" />
                                ) : null}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                {confirmAction === 'delete' ? 'Delete User' :
                                 confirmAction === 'block' ? 'Block User' :
                                 confirmAction === 'unblock' ? 'Unblock User' : ''}
                            </h3>
                            <p className="text-white/40 text-sm mb-6">
                                {confirmAction === 'delete' 
                                    ? 'Are you sure you want to delete this user? This action cannot be undone.'
                                    : confirmAction === 'block'
                                    ? 'Are you sure you want to block this user? They will not be able to access the platform.'
                                    : confirmAction === 'unblock'
                                    ? 'Are you sure you want to unblock this user? They will be able to access the platform again.'
                                    : ''
                                }
                            </p>
                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex-1 py-2.5 rounded-xl bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all duration-300 text-sm"
                                    onClick={() => {
                                        setShowConfirmModal(false)
                                        setSelectedUserId(null)
                                        setConfirmAction(null)
                                    }}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`flex-1 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 ${
                                        confirmAction === 'delete'
                                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30'
                                            : confirmAction === 'block'
                                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/30'
                                            : confirmAction === 'unblock'
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                                            : ''
                                    }`}
                                    onClick={handleConfirmAction}
                                    disabled={actionLoading === selectedUserId}
                                >
                                    {actionLoading === selectedUserId ? (
                                        <ClipLoader size={16} color="white" />
                                    ) : (
                                        <>
                                            {confirmAction === 'delete' ? <FaTrash /> :
                                             confirmAction === 'block' ? <FaUserTimes /> :
                                             confirmAction === 'unblock' ? <FaUserCheck /> : null}
                                            {confirmAction === 'delete' ? 'Yes, Delete' :
                                             confirmAction === 'block' ? 'Yes, Block' :
                                             confirmAction === 'unblock' ? 'Yes, Unblock' : ''}
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

export default AdminUsers