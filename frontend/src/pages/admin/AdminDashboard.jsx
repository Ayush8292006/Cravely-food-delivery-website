import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../../App'
import { 
    FaUsers, FaStore, FaShoppingCart, FaDollarSign,
    FaClock, FaCheckCircle, FaTimesCircle, FaCrown, 
    FaUserPlus, FaUserCheck, FaUserTimes, 
    FaChartLine, FaEye, FaChevronRight,
    FaTruck, FaUtensils, FaRocket, FaGem
} from "react-icons/fa";
import { MdDeliveryDining, MdRestaurant } from 'react-icons/md'
import { ClipLoader } from 'react-spinners'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import AdminLayout from './AdminLayout'



function AdminDashboard() {
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [recentOrders, setRecentOrders] = useState([])

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const [statsRes, ordersRes] = await Promise.all([
                axios.get(`${serverUrl}/api/super-admin/dashboard`, { withCredentials: true }),
                axios.get(`${serverUrl}/api/super-admin/orders?limit=5`, { withCredentials: true })
            ])
            setStats(statsRes.data)
            setRecentOrders(ordersRes.data.orders || [])
        } catch (error) {
            console.log('Dashboard error:', error)
            toast.error('Failed to load dashboard')
        } finally {
            setLoading(false)
        }
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
                            Loading dashboard...
                        </motion.p>
                    </div>
                </div>
            </AdminLayout>
        )
    }

    const statsCards = [
        { 
            title: 'Total Users', 
            value: stats?.users?.total || 0, 
            icon: <FaUsers className="text-[#ff2d55]" />, 
            bg: 'bg-[#ff2d55]/10',
            sub: `${stats?.users?.owners || 0} Owners • ${stats?.users?.deliveryBoys || 0} Delivery`,
            gradient: 'from-[#ff2d55]/20 to-transparent'
        },
        { 
            title: 'Total Shops', 
            value: stats?.shops || 0, 
            icon: <FaStore className="text-[#ff6b35]" />, 
            bg: 'bg-[#ff6b35]/10',
            sub: `${stats?.pendingApprovals?.owners || 0} pending approvals`,
            gradient: 'from-[#ff6b35]/20 to-transparent'
        },
        { 
            title: 'Total Orders', 
            value: stats?.orders?.total || 0, 
            icon: <FaShoppingCart className="text-[#ffd700]" />, 
            bg: 'bg-[#ffd700]/10',
            sub: `⏳ ${stats?.orders?.pending || 0} Pending • ✅ ${stats?.orders?.delivered || 0} Delivered`,
            gradient: 'from-[#ffd700]/20 to-transparent'
        },
        { 
            title: 'Revenue', 
            value: `₹${stats?.revenue || 0}`, 
            icon: <FaDollarSign className="text-[#2ecc71]" />, 
            bg: 'bg-[#2ecc71]/10',
            sub: 'Total earnings',
            gradient: 'from-[#2ecc71]/20 to-transparent'
        }
    ]

    return (
        <AdminLayout>
            {/* ✅ Animated Welcome */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-6"
            >
                <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <FaCrown className="text-[#ffd700] text-3xl" />
                </motion.div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Welcome Back, Admin!</h1>
                    <p className="text-white/40 text-sm">Here's what's happening with your platform today</p>
                </div>
            </motion.div>

            {/* ✅ Stats Grid - 3D Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
                {statsCards.map((card, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30, rotateY: -10 }}
                        animate={{ opacity: 1, y: 0, rotateY: 0 }}
                        transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                        whileHover={{ 
                            y: -8, 
                            scale: 1.03,
                            rotateY: 5,
                            transition: { type: "spring", stiffness: 300 }
                        }}
                        className={`glass-premium p-5 rounded-2xl border border-white/5 hover:border-[#ff2d55]/30 transition-all duration-300 relative overflow-hidden bg-gradient-to-br ${card.gradient}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/40 text-xs font-medium uppercase tracking-wider">{card.title}</p>
                                <motion.p 
                                    key={card.value}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-2xl font-bold text-white"
                                >
                                    {card.value}
                                </motion.p>
                            </div>
                            <motion.div 
                                whileHover={{ scale: 1.1, rotate: 15 }}
                                className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center text-xl`}
                            >
                                {card.icon}
                            </motion.div>
                        </div>
                        <p className="text-white/30 text-[10px] mt-2">{card.sub}</p>
                        
                        {/* ✅ Shine Effect */}
                        <motion.div 
                            className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl"
                            animate={{ 
                                x: [0, -30, 0],
                                y: [0, -30, 0],
                            }}
                            transition={{ duration: 5, repeat: Infinity }}
                        />
                    </motion.div>
                ))}
            </div>

            {/* ✅ Pending Approvals - Animated */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-premium p-5 md:p-6 rounded-2xl border border-white/5 mb-6 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-[#ff2d55]/5 to-[#ff6b35]/5 opacity-0 hover:opacity-100 transition-opacity duration-700" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        📋 Pending Approvals
                        {(stats?.pendingApprovals?.owners > 0 || stats?.pendingApprovals?.deliveryBoys > 0) && (
                            <motion.span 
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="text-[10px] bg-[#ff2d55] px-2 py-0.5 rounded-full text-white shadow-lg shadow-[#ff2d55]/30"
                            >
                                {stats.pendingApprovals.owners + stats.pendingApprovals.deliveryBoys}
                            </motion.span>
                        )}
                    </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                    {[
                        { 
                            label: 'Restaurants Pending', 
                            count: stats?.pendingApprovals?.owners || 0, 
                            icon: <MdRestaurant className="text-[#ff6b35]" />,
                            bg: 'bg-[#ff6b35]/10',
                            onClick: () => navigate('/admin/shops')
                        },
                        { 
                            label: 'Delivery Boys Pending', 
                            count: stats?.pendingApprovals?.deliveryBoys || 0, 
                            icon: <MdDeliveryDining className="text-[#ff2d55]" />,
                            bg: 'bg-[#ff2d55]/10',
                            onClick: () => navigate('/admin/delivery-boys')
                        }
                    ].map((item, idx) => (
                        <motion.div 
                            key={idx}
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={item.onClick}
                            className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center text-xl`}>
                                    {item.icon}
                                </div>
                                <span className="text-white/70 text-sm">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <motion.span 
                                    key={item.count}
                                    initial={{ scale: 0.5 }}
                                    animate={{ scale: 1 }}
                                    className="text-white font-bold text-lg"
                                >
                                    {item.count}
                                </motion.span>
                                <FaChevronRight className="text-white/20 text-xs" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* ✅ Quick Actions - 3D Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { icon: <FaUsers />, label: 'Users', color: 'hover:border-[#ff2d55]/30', gradient: 'from-[#ff2d55]/20 to-[#ff2d55]/5', onClick: () => navigate('/admin/users') },
                    { icon: <FaStore />, label: 'Shops', color: 'hover:border-[#ff6b35]/30', gradient: 'from-[#ff6b35]/20 to-[#ff6b35]/5', onClick: () => navigate('/admin/shops') },
                    { icon: <FaShoppingCart />, label: 'Orders', color: 'hover:border-[#ffd700]/30', gradient: 'from-[#ffd700]/20 to-[#ffd700]/5', onClick: () => navigate('/admin/orders') },
                    { icon: <FaChartLine />, label: 'Revenue', color: 'hover:border-[#2ecc71]/30', gradient: 'from-[#2ecc71]/20 to-[#2ecc71]/5', onClick: () => navigate('/admin/revenue') }
                ].map((action, idx) => (
                    <motion.button
                        key={idx}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + (idx * 0.1) }}
                        className={`glass-premium p-4 rounded-2xl border border-white/5 transition-all duration-300 text-center bg-gradient-to-br ${action.gradient} ${action.color}`}
                        onClick={action.onClick}
                    >
                        <motion.div 
                            whileHover={{ rotate: 15 }}
                            className="text-xl text-white/60 mb-1 flex justify-center"
                        >
                            {action.icon}
                        </motion.div>
                        <span className="text-white/60 text-xs font-medium">{action.label}</span>
                    </motion.button>
                ))}
            </div>

            {/* ✅ Recent Orders - Animated Table */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-premium p-5 md:p-6 rounded-2xl border border-white/5"
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        📦 Recent Orders
                        <motion.span
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <span className="text-[#ffd93d] text-xs">✨</span>
                        </motion.span>
                    </h2>
                    <motion.button 
                        whileHover={{ x: 5 }}
                        className="text-[#ff6b35] text-xs hover:underline flex items-center gap-1"
                        onClick={() => navigate('/admin/orders')}
                    >
                        View All <FaChevronRight size={10} />
                    </motion.button>
                </div>
                
                {recentOrders.length === 0 ? (
                    <div className="text-center py-8">
                        <FaShoppingCart className="text-white/10 text-4xl mx-auto mb-2" />
                        <p className="text-white/30 text-sm">No recent orders</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentOrders.map((order, idx) => {
                            const status = order.shopOrders?.[0]?.status || 'pending'
                            const statusColors = {
                                delivered: 'bg-green-500/20 text-green-400 border-green-500/20',
                                cancelled: 'bg-red-500/20 text-red-400 border-red-500/20',
                                pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
                                'out of delivery': 'bg-blue-500/20 text-blue-400 border-blue-500/20',
                                preparing: 'bg-purple-500/20 text-purple-400 border-purple-500/20'
                            }
                            return (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ scale: 1.01, x: 5 }}
                                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-[#ff2d55]/20"
                                >
                                    <div className="flex items-center gap-3">
                                        <motion.div 
                                            whileHover={{ rotate: 15 }}
                                            className="w-10 h-10 rounded-lg bg-[#ffd700]/20 flex items-center justify-center"
                                        >
                                            <FaShoppingCart className="text-[#ffd700] text-sm" />
                                        </motion.div>
                                        <div>
                                            <p className="text-white font-medium text-sm">#{order._id?.slice(-6) || 'N/A'}</p>
                                            <p className="text-white/30 text-[10px]">{order.user?.fullName || 'Unknown'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[#ffd700] font-bold text-sm">₹{order.totalAmount || 0}</span>
                                        <span className={`text-[10px] px-2 py-1 rounded-full border ${statusColors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/20'}`}>
                                            {status === 'out of delivery' ? 'Out for Delivery' : status}
                                        </span>
                                    </div>
                                </motion.div>
                            )
                        })}
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
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .animate-pulse {
                    animation: pulse 2s ease-in-out infinite;
                }
            `}</style>
        </AdminLayout>
    )
}

export default AdminDashboard