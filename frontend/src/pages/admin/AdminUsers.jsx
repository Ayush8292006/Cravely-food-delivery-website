import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../../App'
import { 
    FaSearch, FaUserCheck, FaUserTimes, FaTrash, 
    FaEye, FaChevronLeft, FaChevronRight,
    FaUserCircle, FaEnvelope, FaPhone, FaCalendarAlt,
    FaShieldAlt, FaUserCog, FaGem, FaRocket
} from "react-icons/fa";
import { ClipLoader } from 'react-spinners'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import AdminLayout from './AdminLayout'



function AdminUsers() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterRole, setFilterRole] = useState('all')

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/super-admin/users`, {
                withCredentials: true
            })
            setUsers(result.data)
        } catch (error) {
            toast.error('Failed to fetch users')
        } finally {
            setLoading(false)
        }
    }

    const handleBlockToggle = async (userId, isBlocked) => {
        try {
            await axios.put(`${serverUrl}/api/super-admin/users/${userId}/block`, {}, {
                withCredentials: true
            })
            toast.success(`User ${isBlocked ? 'unblocked' : 'blocked'} successfully`)
            fetchUsers()
        } catch (error) {
            toast.error('Failed to update user')
        }
    }

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return
        try {
            await axios.delete(`${serverUrl}/api/super-admin/users/${userId}`, {
                withCredentials: true
            })
            toast.success('User deleted successfully')
            fetchUsers()
        } catch (error) {
            toast.error('Failed to delete user')
        }
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             user.email?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRole = filterRole === 'all' || user.role === filterRole
        return matchesSearch && matchesRole
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
                <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="text-white/30 text-sm bg-white/5 px-4 py-2 rounded-full border border-white/5"
                >
                    {filteredUsers.length} users found
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
                        placeholder="Search users..."
                        className="w-full bg-[#18181D] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="bg-[#18181D] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ff2d55]/50"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                >
                    <option value="all">All Roles</option>
                    <option value="user">Users</option>
                    <option value="owner">Owners</option>
                    <option value="deliveryBoy">Delivery Boys</option>
                    <option value="superAdmin">Super Admin</option>
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
                                <th className="text-right text-white/40 text-xs font-medium uppercase tracking-wider px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user, idx) => (
                                <motion.tr 
                                    key={user._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                                    className="border-b border-white/5 transition-all duration-300"
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <motion.div 
                                                whileHover={{ scale: 1.1, rotate: 10 }}
                                                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#ff2d55]/20"
                                            >
                                                {user.fullName?.charAt(0) || 'U'}
                                            </motion.div>
                                            <div>
                                                <p className="text-white font-medium text-sm">{user.fullName}</p>
                                                <p className="text-white/30 text-[10px]">{user.mobile}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <p className="text-white/60 text-sm">{user.email}</p>
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell">
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            user.role === 'superAdmin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' :
                                            user.role === 'owner' ? 'bg-[#ff6b35]/20 text-[#ff6b35] border border-[#ff6b35]/20' :
                                            user.role === 'deliveryBoy' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' :
                                            'bg-[#ff2d55]/20 text-[#ff2d55] border border-[#ff2d55]/20'
                                        }`}>
                                            {user.role}
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
                                        <div className="flex items-center justify-end gap-2">
                                            {user.role !== 'superAdmin' && (
                                                <>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleBlockToggle(user._id, user.isBlocked)}
                                                        className={`p-2 rounded-lg transition-all duration-300 ${
                                                            user.isBlocked 
                                                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                                                                : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                                        }`}
                                                        title={user.isBlocked ? 'Unblock' : 'Block'}
                                                    >
                                                        {user.isBlocked ? <FaUserCheck size={14} /> : <FaUserTimes size={14} />}
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1, rotate: 15 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleDelete(user._id)}
                                                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-300"
                                                        title="Delete"
                                                    >
                                                        <FaTrash size={14} />
                                                    </motion.button>
                                                </>
                                            )}
                                            {user.role === 'superAdmin' && (
                                                <span className="text-xs text-purple-400 flex items-center gap-1 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
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
                    <div className="text-center py-12">
                        <FaUserCircle className="text-white/10 text-5xl mx-auto mb-3" />
                        <p className="text-white/30 text-sm">No users found</p>
                    </div>
                )}
            </motion.div>

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