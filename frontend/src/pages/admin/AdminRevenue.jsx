import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
// ✅ FIXED: Correct import path
import { serverUrl } from '../../../config'
import { 
    FaChartLine, FaCalendarAlt, FaDollarSign,
    FaShoppingCart, FaStore, FaUsers, FaGem,
    FaChevronLeft, FaChevronRight, FaDownload,
    FaSync, FaExclamationTriangle, FaClock,
    FaFire, FaRocket, FaBuilding, FaUser
} from "react-icons/fa";
import { ClipLoader } from 'react-spinners'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import AdminLayout from './AdminLayout'

function AdminRevenue() {
    const { socket } = useSelector(state => state.user)  // ✅ Get socket
    const [revenueData, setRevenueData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [period, setPeriod] = useState('month')
    const [refreshing, setRefreshing] = useState(false)
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [exportLoading, setExportLoading] = useState(false)
    const [selectedShop, setSelectedShop] = useState('all')

    // ✅ Socket listener for real-time updates
    useEffect(() => {
        if (!socket) return

        const handleNewOrder = () => {
            toast.info('📦 New order! Revenue updated.', {
                position: "top-center",
                autoClose: 3000,
            })
            fetchRevenue()
        }

        socket.on('newOrder', handleNewOrder)

        return () => {
            socket.off('newOrder', handleNewOrder)
        }
    }, [socket])

    useEffect(() => {
        fetchRevenue()
    }, [period, startDate, endDate, selectedShop])

    // ✅ Auto-refresh every 60 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (!loading && !refreshing) {
                fetchRevenue(true)
            }
        }, 60000)

        return () => clearInterval(interval)
    }, [period, startDate, endDate, selectedShop])

    const fetchRevenue = async (silent = false) => {
        if (!silent) {
            setLoading(true)
        }
        setError(null)
        try {
            const params = { period }
            if (startDate && endDate) {
                params.startDate = startDate
                params.endDate = endDate
            }
            if (selectedShop !== 'all') {
                params.shopId = selectedShop
            }

            const result = await axios.get(`${serverUrl}/api/super-admin/revenue`, {
                params,
                withCredentials: true
            })
            setRevenueData(result.data)
        } catch (error) {
            console.log('❌ Revenue fetch error:', error)
            const errorMsg = error.response?.data?.message || 'Failed to fetch revenue data'
            setError(errorMsg)
            if (!silent) {
                toast.error(errorMsg)
            }
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    // ✅ Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchRevenue(true)
        toast.info('🔄 Revenue data refreshed!', {
            position: "top-center",
            autoClose: 2000,
        })
    }

    // ✅ Export to CSV
    const exportToCSV = async () => {
        setExportLoading(true)
        try {
            const response = await axios.get(`${serverUrl}/api/super-admin/revenue/export`, {
                params: { period, startDate, endDate, shopId: selectedShop },
                withCredentials: true,
                responseType: 'blob'
            })
            
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `revenue-report-${new Date().toISOString().split('T')[0]}.csv`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
            
            toast.success('📥 Revenue report exported successfully!', {
                position: "top-center",
                autoClose: 3000,
            })
        } catch (error) {
            console.log('❌ Export error:', error)
            toast.error('Failed to export revenue report')
        } finally {
            setExportLoading(false)
        }
    }

    // ✅ Apply custom date range
    const applyDateRange = () => {
        if (startDate && endDate) {
            setShowDatePicker(false)
            fetchRevenue()
        } else {
            toast.warning('Please select both start and end dates')
        }
    }

    // ✅ Reset date range
    const resetDateRange = () => {
        setStartDate('')
        setEndDate('')
        setShowDatePicker(false)
        setPeriod('month')
    }

    // ✅ Calculate stats
    const stats = useMemo(() => {
        if (!revenueData) return null
        return {
            totalRevenue: revenueData.totalRevenue || 0,
            ordersCount: revenueData.ordersCount || 0,
            shopCount: revenueData.shopCount || 0,
            userCount: revenueData.userCount || 0,
            avgOrderValue: revenueData.ordersCount > 0 
                ? Math.round(revenueData.totalRevenue / revenueData.ordersCount) 
                : 0,
            growthPercent: revenueData.growthPercent || 0
        }
    }, [revenueData])

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
                            Loading revenue data...
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
                    <h2 className="text-2xl font-bold text-white mb-2">Failed to Load Revenue</h2>
                    <p className="text-white/40 text-sm mb-6">{error}</p>
                    <button 
                        onClick={() => fetchRevenue()}
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
                        📊 Revenue Reports
                        <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        >
                            <span className="text-[#ffd93d] text-sm">✨</span>
                        </motion.span>
                    </h1>
                    <p className="text-white/40 text-sm">Track your platform earnings</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {/* ✅ Refresh Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2.5 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 border border-white/5 disabled:opacity-50"
                    >
                        <FaSync className={refreshing ? 'animate-spin' : ''} size={16} />
                    </motion.button>

                    <motion.select
                        whileHover={{ scale: 1.02 }}
                        className="bg-[#18181D] border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 cursor-pointer"
                        value={period}
                        onChange={(e) => {
                            setPeriod(e.target.value)
                            setStartDate('')
                            setEndDate('')
                        }}
                    >
                        <option value="today">Today</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                        <option value="year">Last Year</option>
                        <option value="custom">Custom Range</option>
                    </motion.select>

                    {/* ✅ Custom Date Range */}
                    {period === 'custom' && (
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                className="bg-[#18181D] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 [color-scheme:dark]"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <span className="text-white/30 text-sm">to</span>
                            <input
                                type="date"
                                className="bg-[#18181D] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 [color-scheme:dark]"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={applyDateRange}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white text-sm font-medium"
                            >
                                Apply
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={resetDateRange}
                                className="px-3 py-2 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all duration-300 text-sm"
                            >
                                Reset
                            </motion.button>
                        </div>
                    )}

                    {/* ✅ Export Button */}
                    <motion.button 
                        whileHover={{ scale: 1.05, rotate: 15 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={exportToCSV}
                        disabled={exportLoading}
                        className="p-2.5 rounded-xl bg-gradient-to-r from-[#ff2d55]/20 to-[#ff6b35]/20 text-[#ff6b35] hover:from-[#ff2d55]/30 hover:to-[#ff6b35]/30 transition-all duration-300 border border-[#ff2d55]/20 disabled:opacity-50"
                    >
                        {exportLoading ? (
                            <ClipLoader size={16} color="#ff6b35" />
                        ) : (
                            <FaDownload size={16} />
                        )}
                    </motion.button>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
                {[
                    { 
                        title: 'Total Revenue', 
                        value: `₹${stats?.totalRevenue || 0}`, 
                        icon: <FaDollarSign />, 
                        color: 'text-[#ffd700]', 
                        bg: 'bg-[#ffd700]/10',
                        sub: stats?.growthPercent ? `↑ ${stats.growthPercent}%` : ''
                    },
                    { 
                        title: 'Total Orders', 
                        value: stats?.ordersCount || 0, 
                        icon: <FaShoppingCart />, 
                        color: 'text-[#ff2d55]', 
                        bg: 'bg-[#ff2d55]/10',
                        sub: 'Total orders placed'
                    },
                    { 
                        title: 'Avg Order', 
                        value: `₹${stats?.avgOrderValue || 0}`, 
                        icon: <FaChartLine />, 
                        color: 'text-[#2ecc71]', 
                        bg: 'bg-[#2ecc71]/10',
                        sub: 'Average order value'
                    },
                    { 
                        title: 'Shops', 
                        value: stats?.shopCount || 0, 
                        icon: <FaStore />, 
                        color: 'text-[#ff6b35]', 
                        bg: 'bg-[#ff6b35]/10',
                        sub: 'Active shops'
                    },
                    { 
                        title: 'Users', 
                        value: stats?.userCount || 0, 
                        icon: <FaUsers />, 
                        color: 'text-[#4facfe]', 
                        bg: 'bg-[#4facfe]/10',
                        sub: 'Total users'
                    }
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="glass-premium p-4 rounded-2xl border border-white/5 hover:border-[#ff2d55]/30 transition-all duration-300"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/30 text-[8px] font-medium uppercase tracking-wider">{stat.title}</p>
                                <motion.p 
                                    key={stat.value}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className={`text-lg font-bold ${stat.color}`}
                                >
                                    {stat.value}
                                </motion.p>
                                {stat.sub && (
                                    <p className="text-white/20 text-[8px]">{stat.sub}</p>
                                )}
                            </div>
                            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center text-lg ${stat.color}`}>
                                {stat.icon}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ✅ Revenue by Shop */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="glass-premium p-5 rounded-2xl border border-white/5 mb-6"
            >
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FaStore className="text-[#ff6b35]" /> Revenue by Shop
                </h2>
                <div className="space-y-3">
                    {revenueData?.shopRevenue?.length > 0 ? (
                        revenueData.shopRevenue.map((shop, idx) => {
                            const maxAmount = Math.max(...(revenueData.shopRevenue.map(s => s.amount) || [0]))
                            const percentage = maxAmount > 0 ? (shop.amount / maxAmount) * 100 : 0
                            return (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff2d55]/20 to-[#ff6b35]/20 flex items-center justify-center flex-shrink-0">
                                        <FaStore className="text-[#ff6b35] text-xs" />
                                    </div>
                                    <span className="text-white/60 text-sm w-24 truncate">{shop.name}</span>
                                    <div className="flex-1 h-6 bg-white/5 rounded-lg overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 0.8, delay: idx * 0.05 }}
                                            className="h-full bg-gradient-to-r from-[#ff6b35] to-[#ffd93d] rounded-lg"
                                        />
                                    </div>
                                    <span className="text-[#ffd700] text-xs w-20 text-right font-medium">₹{shop.amount}</span>
                                </motion.div>
                            )
                        })
                    ) : (
                        <p className="text-white/30 text-sm text-center py-4">No shop revenue data available</p>
                    )}
                </div>
            </motion.div>

            {/* Daily Revenue Chart */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-premium p-5 md:p-6 rounded-2xl border border-white/5"
            >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <FaCalendarAlt className="text-[#ff6b35]" /> Daily Revenue
                        <motion.span
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <span className="text-[#ffd93d] text-xs">✨</span>
                        </motion.span>
                    </h2>
                    <div className="flex items-center gap-3 text-[10px]">
                        <span className="text-white/30 flex items-center gap-1">
                            <span className="w-3 h-3 rounded bg-gradient-to-r from-[#ff2d55] to-[#ff6b35]" /> Revenue
                        </span>
                        <span className="text-white/30 flex items-center gap-1">
                            <span className="w-3 h-3 rounded bg-[#ffd93d]/30 border border-[#ffd93d]/20" /> Orders
                        </span>
                    </div>
                </div>
                <div className="space-y-2">
                    {revenueData?.dailyRevenue?.length > 0 ? (
                        revenueData.dailyRevenue.map((item, idx) => {
                            const maxAmount = Math.max(...(revenueData.dailyRevenue.map(i => i.amount) || [0]))
                            const maxOrders = Math.max(...(revenueData.dailyRevenue.map(i => i.orders || 0) || [0]))
                            const amountPercentage = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0
                            const ordersPercentage = maxOrders > 0 ? ((item.orders || 0) / maxOrders) * 100 : 0
                            return (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="relative"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-white/30 text-[10px] w-20 truncate flex-shrink-0">
                                            {new Date(item.date).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: 'short'
                                            })}
                                        </span>
                                        <div className="flex-1 h-10 bg-white/5 rounded-lg overflow-hidden relative">
                                            {/* Revenue Bar */}
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${amountPercentage}%` }}
                                                transition={{ duration: 0.8, delay: idx * 0.03 }}
                                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#ff2d55] via-[#ff6b35] to-[#ffd93d] rounded-lg"
                                            />
                                            {/* Orders Bar (overlay) */}
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${ordersPercentage}%` }}
                                                transition={{ duration: 0.8, delay: idx * 0.03 }}
                                                className="absolute left-0 bottom-0 h-3 bg-[#ffd93d]/30 border border-[#ffd93d]/20 rounded-lg"
                                            />
                                        </div>
                                        <div className="flex flex-col items-end flex-shrink-0 w-16">
                                            <span className="text-[#ffd700] text-xs font-medium">₹{item.amount}</span>
                                            <span className="text-white/30 text-[8px]">{item.orders || 0} orders</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })
                    ) : (
                        <div className="text-center py-8">
                            <FaChartLine className="text-white/10 text-3xl mx-auto mb-2" />
                            <p className="text-white/30 text-sm">No revenue data available</p>
                        </div>
                    )}
                </div>
            </motion.div>

            <style jsx>{`
                .glass-premium {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }
                [color-scheme="dark"]::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    cursor: pointer;
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

export default AdminRevenue