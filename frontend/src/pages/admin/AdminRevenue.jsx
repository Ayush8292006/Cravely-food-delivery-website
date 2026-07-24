import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../../App'
import { 
    FaChartLine, FaCalendarAlt, FaDollarSign,
    FaShoppingCart, FaStore, FaUsers, FaGem,
    FaChevronLeft, FaChevronRight, FaDownload
} from "react-icons/fa";
import { ClipLoader } from 'react-spinners'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import AdminLayout from './AdminLayout'

 

function AdminRevenue() {
    const [revenueData, setRevenueData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState('month')

    useEffect(() => {
        fetchRevenue()
    }, [period])

    const fetchRevenue = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/super-admin/revenue`, {
                params: { period },
                withCredentials: true
            })
            setRevenueData(result.data)
        } catch (error) {
            toast.error('Failed to fetch revenue data')
        } finally {
            setLoading(false)
        }
    }

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
                <div className="flex items-center gap-3">
                    <motion.select
                        whileHover={{ scale: 1.02 }}
                        className="bg-[#18181D] border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#ff2d55]/50"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                    >
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                        <option value="year">Last Year</option>
                    </motion.select>
                    <motion.button 
                        whileHover={{ scale: 1.05, rotate: 15 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-xl bg-[#ff2d55]/20 text-[#ff2d55] hover:bg-[#ff2d55]/30 transition-all duration-300"
                    >
                        <FaDownload size={18} />
                    </motion.button>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[
                    { title: 'Total Revenue', value: `₹${revenueData?.totalRevenue || 0}`, icon: <FaDollarSign />, color: 'text-[#ffd700]', bg: 'bg-[#ffd700]/10' },
                    { title: 'Total Orders', value: revenueData?.ordersCount || 0, icon: <FaShoppingCart />, color: 'text-[#ff2d55]', bg: 'bg-[#ff2d55]/10' },
                    { title: 'Average Order', value: `₹${revenueData?.ordersCount > 0 ? Math.round(revenueData.totalRevenue / revenueData.ordersCount) : 0}`, icon: <FaChartLine />, color: 'text-[#2ecc71]', bg: 'bg-[#2ecc71]/10' }
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="glass-premium p-5 rounded-2xl border border-white/5 hover:border-[#ff2d55]/30 transition-all duration-300"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/40 text-xs font-medium uppercase tracking-wider">{stat.title}</p>
                                <motion.p 
                                    key={stat.value}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className={`text-2xl font-bold ${stat.color}`}
                                >
                                    {stat.value}
                                </motion.p>
                            </div>
                            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center text-xl ${stat.color}`}>
                                {stat.icon}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Daily Revenue Chart */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-premium p-5 md:p-6 rounded-2xl border border-white/5"
            >
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FaCalendarAlt className="text-[#ff6b35]" /> Daily Revenue
                    <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-[#ffd93d] text-xs">✨</span>
                    </motion.span>
                </h2>
                <div className="space-y-2">
                    {revenueData?.dailyRevenue?.map((item, idx) => {
                        const maxAmount = Math.max(...(revenueData.dailyRevenue.map(i => i.amount) || [0]))
                        const percentage = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0
                        return (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex items-center gap-4"
                            >
                                <span className="text-white/30 text-xs w-24 truncate">{item.date}</span>
                                <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 0.8, delay: idx * 0.05 }}
                                        className="h-full bg-gradient-to-r from-[#ff2d55] via-[#ff6b35] to-[#ffd93d] rounded-lg shadow-lg shadow-[#ff2d55]/20"
                                    />
                                </div>
                                <span className="text-white/60 text-xs w-20 text-right font-medium">₹{item.amount}</span>
                            </motion.div>
                        )
                    })}
                </div>
                {revenueData?.dailyRevenue?.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-white/30 text-sm">No revenue data available</p>
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

export default AdminRevenue