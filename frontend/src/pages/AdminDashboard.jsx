import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'
import { 
    FaUsers, FaStore, FaTruck, FaShoppingCart, FaDollarSign, 
    FaClock, FaCheckCircle, FaTimesCircle, FaCrown, FaArrowLeft,
    FaUserPlus, FaUserCheck, FaUserTimes, FaUtensils,
    FaChartLine, FaCalendarAlt, FaBox, FaTag, FaPercent,
    FaEye, FaEdit, FaTrash, FaChevronRight, FaSearch, FaPlus,
    FaDoorOpen, FaBell, FaHome, FaStar, FaFire
} from 'react-icons/fa'
import { MdDeliveryDining, MdRestaurant, MdVerified } from 'react-icons/md'
import { ClipLoader } from 'react-spinners'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'

function AdminDashboard() {
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [recentOrders, setRecentOrders] = useState([])

    useEffect(() => {
        fetchDashboardStats()
        fetchRecentOrders()
    }, [])

    const fetchDashboardStats = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/super-admin/dashboard`, {
                withCredentials: true
            })
            setStats(result.data)
        } catch (error) {
            console.log('Dashboard error:', error)
            toast.error('Failed to load dashboard')
        }
    }

    const fetchRecentOrders = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/super-admin/orders?limit=5`, {
                withCredentials: true
            })
            setRecentOrders(result.data.orders || [])
        } catch (error) {
            console.log('Recent orders error:', error)
        } finally {
            setLoading(false)
        }
    }

    // ✅ Navigate to different sections
    const goToUsers = () => navigate('/admin/users')
    const goToShops = () => navigate('/admin/shops')
    const goToOrders = () => navigate('/admin/orders')
    const goToRevenue = () => navigate('/admin/revenue')
    const goToDeliveryBoys = () => navigate('/admin/delivery-boys')

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <ClipLoader size={50} color="#ffd700" />
                    <p className="text-white/40 text-sm animate-pulse">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    // ✅ Stats Cards Data
    const statCards = [
        {
            title: 'Total Users',
            value: stats?.users?.total || 0,
            icon: <FaUsers className="text-[#ff2d55] text-xl" />,
            color: 'bg-[#ff2d55]/20',
            subtitle: `👤 ${stats?.users?.owners || 0} Owners • 🚴 ${stats?.users?.deliveryBoys || 0} Delivery`,
            link: '/admin/users'
        },
        {
            title: 'Total Shops',
            value: stats?.shops || 0,
            icon: <FaStore className="text-[#ff6b35] text-xl" />,
            color: 'bg-[#ff6b35]/20',
            subtitle: `${stats?.pendingApprovals?.owners || 0} pending approvals`,
            link: '/admin/shops'
        },
        {
            title: 'Total Orders',
            value: stats?.orders?.total || 0,
            icon: <FaShoppingCart className="text-[#ffd700] text-xl" />,
            color: 'bg-[#ffd700]/20',
            subtitle: `⏳ ${stats?.orders?.pending || 0} Pending • ✅ ${stats?.orders?.delivered || 0} Delivered`,
            link: '/admin/orders'
        },
        {
            title: 'Revenue',
            value: `₹${stats?.revenue || 0}`,
            icon: <FaDollarSign className="text-[#2ecc71] text-xl" />,
            color: 'bg-[#2ecc71]/20',
            subtitle: 'Total earnings',
            link: '/admin/revenue'
        }
    ]

    return (
        <div className="min-h-screen bg-[#0a0a0f] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
            
            {/* ✅ Animated Background Orbs */}
            <div className='absolute inset-0 pointer-events-none'>
                <div className='absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#ff2d55]/5 rounded-full blur-3xl animate-float-3d' />
                <div className='absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#ff6b35]/5 rounded-full blur-3xl animate-float-3d animation-delay-300' />
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ffd93d]/3 rounded-full blur-3xl animate-float-3d animation-delay-600' />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                
                {/* ✅ Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/')}
                            className="glass-premium px-4 py-2.5 rounded-full text-white/70 hover:text-white transition-all duration-300 flex items-center gap-2 text-sm hover:scale-105 border border-white/5"
                        >
                            <FaArrowLeft size={14} />
                            Back
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                                <FaCrown className="text-[#ffd700] text-3xl" />
                                Admin Dashboard
                            </h1>
                            <p className="text-white/40 text-sm">Manage your platform with full control</p>
                        </div>
                    </div>
                    
                    {/* ✅ Admin Status */}
                    <div className="flex items-center gap-3 glass-premium px-4 py-2 rounded-full border border-white/5">
                        <div className="relative">
                            <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse absolute -top-1 -right-1" />
                            <MdVerified size={18} className="text-blue-400" />
                        </div>
                        <span className="text-white/60 text-xs font-medium">Super Admin</span>
                        <span className="w-px h-4 bg-white/10" />
                        <FaBell size={14} className="text-white/30" />
                        <span className="text-[10px] text-white/20">3</span>
                    </div>
                </div>

                {/* ✅ Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                    {statCards.map((stat, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -4, scale: 1.02 }}
                            className="glass-premium p-5 rounded-2xl border border-white/5 hover:border-[#ff2d55]/30 transition-all duration-300 cursor-pointer"
                            onClick={() => stat.link && navigate(stat.link)}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white/40 text-xs font-medium uppercase tracking-wider">{stat.title}</p>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                                    {stat.icon}
                                </div>
                            </div>
                            <div className="mt-2">
                                <p className="text-white/30 text-[10px]">{stat.subtitle}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ✅ Pending Approvals Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-premium p-5 md:p-6 rounded-2xl border border-white/5 mb-8"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            📋 Pending Approvals
                            {(stats?.pendingApprovals?.owners > 0 || stats?.pendingApprovals?.deliveryBoys > 0) && (
                                <span className="text-[10px] bg-[#ff2d55] px-2 py-0.5 rounded-full text-white animate-pulse">
                                    {stats.pendingApprovals.owners + stats.pendingApprovals.deliveryBoys}
                                </span>
                            )}
                        </h2>
                        <button className="text-[#ff6b35] text-xs hover:underline flex items-center gap-1">
                            View All <FaChevronRight size={10} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div 
                            className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer"
                            onClick={goToShops}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[#ff6b35]/20 flex items-center justify-center">
                                    <FaStore className="text-[#ff6b35]" />
                                </div>
                                <div>
                                    <span className="text-white/70 text-sm">Restaurants Pending</span>
                                    <p className="text-[10px] text-white/30">Need approval</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-white font-bold text-lg">{stats?.pendingApprovals?.owners || 0}</span>
                                <FaChevronRight className="text-white/20 text-xs" />
                            </div>
                        </div>
                        <div 
                            className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer"
                            onClick={goToDeliveryBoys}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[#ff2d55]/20 flex items-center justify-center">
                                    <FaTruck className="text-[#ff2d55]" />
                                </div>
                                <div>
                                    <span className="text-white/70 text-sm">Delivery Boys Pending</span>
                                    <p className="text-[10px] text-white/30">Need approval</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-white font-bold text-lg">{stats?.pendingApprovals?.deliveryBoys || 0}</span>
                                <FaChevronRight className="text-white/20 text-xs" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ✅ Quick Actions */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-8"
                >
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        🚀 Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { icon: <FaUsers className="text-[#ff2d55] text-xl" />, label: 'Manage Users', color: 'hover:border-[#ff2d55]/30', onClick: goToUsers },
                            { icon: <FaStore className="text-[#ff6b35] text-xl" />, label: 'Manage Shops', color: 'hover:border-[#ff6b35]/30', onClick: goToShops },
                            { icon: <FaShoppingCart className="text-[#ffd700] text-xl" />, label: 'All Orders', color: 'hover:border-[#ffd700]/30', onClick: goToOrders },
                            { icon: <FaChartLine className="text-[#2ecc71] text-xl" />, label: 'Revenue Reports', color: 'hover:border-[#2ecc71]/30', onClick: goToRevenue }
                        ].map((action, idx) => (
                            <motion.button
                                key={idx}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`glass-premium p-4 rounded-2xl border border-white/5 transition-all duration-300 text-center ${action.color}`}
                                onClick={action.onClick}
                            >
                                <div className="flex items-center justify-center mb-2">
                                    {action.icon}
                                </div>
                                <span className="text-white/70 text-xs sm:text-sm font-medium">{action.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* ✅ Recent Orders */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-premium p-5 md:p-6 rounded-2xl border border-white/5"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            📦 Recent Orders
                        </h2>
                        <button 
                            className="text-[#ff6b35] text-xs hover:underline flex items-center gap-1"
                            onClick={goToOrders}
                        >
                            View All <FaChevronRight size={10} />
                        </button>
                    </div>
                    
                    {recentOrders.length === 0 ? (
                        <div className="text-center py-8">
                            <FaShoppingCart className="text-white/10 text-4xl mx-auto mb-2" />
                            <p className="text-white/30 text-sm">No recent orders</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentOrders.map((order, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[#ffd700]/20 flex items-center justify-center">
                                            <FaShoppingCart className="text-[#ffd700] text-sm" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium text-sm">Order #{order._id?.slice(-6) || 'N/A'}</p>
                                            <p className="text-white/30 text-[10px]">{order.user?.fullName || 'Unknown'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[#ffd700] font-bold text-sm">₹{order.totalAmount || 0}</span>
                                        <span className={`text-[10px] px-2 py-1 rounded-full ${
                                            order.shopOrders?.[0]?.status === 'delivered' 
                                                ? 'bg-green-500/20 text-green-400' 
                                                : order.shopOrders?.[0]?.status === 'cancelled'
                                                ? 'bg-red-500/20 text-red-400'
                                                : 'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                            {order.shopOrders?.[0]?.status || 'pending'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            <style jsx>{`
                @keyframes float-3d {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(40px, -30px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-float-3d {
                    animation: float-3d 15s ease-in-out infinite;
                }
                .animation-delay-300 { animation-delay: 0.3s; }
                .animation-delay-600 { animation-delay: 0.6s; }

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
        </div>
    )
}

export default AdminDashboard