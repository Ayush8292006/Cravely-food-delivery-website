import React, { useState, useEffect } from 'react'
// ✅ Import OwnerNav instead of Nav
import OwnerNav from '../components/OwnerNav'
import { useSelector } from 'react-redux'
import { 
    FaUtensils, FaStore, FaPlus, FaPen, FaStar, 
    FaClock, FaTruck, FaShoppingBag, FaArrowRight,
    FaFire, FaCrown, FaRocket, FaGem, FaAward,
    FaHeart, FaSmile, FaBolt, FaMagic, FaChartLine,
    FaUsers, FaEye, FaCalendarAlt, FaStoreAlt,
    FaBox, FaTag, FaPercent, FaShoppingCart,
    FaCheckCircle, FaTimesCircle, FaHourglassHalf,
    FaMapMarkerAlt, FaPhone, FaGlobe,
    FaBookmark, FaThumbsUp, FaComment
} from "react-icons/fa";
import { MdRestaurant, MdDeliveryDining, MdVerified } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import OwnerItemCard from './OwnerItemCard';
import { motion } from 'framer-motion';
import axios from 'axios';
import { serverUrl } from '../App';
import { toast } from 'react-toastify';

function OwnerDashboard() {
    const { myShopData } = useSelector(state => state.owner)
    const { userData } = useSelector(state => state.user)
    const navigate = useNavigate()
    
    const [stats, setStats] = useState({
        totalItems: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        todayOrders: 0
    })
    const [loading, setLoading] = useState(true)
    const [recentOrders, setRecentOrders] = useState([])
    const [isShopPending, setIsShopPending] = useState(false)
    const [isLiked, setIsLiked] = useState(false)

    const totalItems = myShopData?.items?.length || 0
    const shopName = myShopData?.name || ''
    const shopImage = myShopData?.image || 'https://via.placeholder.com/800x400/1a1a2e/666?text=No+Image'
    const shopAddress = myShopData?.address || ''
    const shopCity = myShopData?.city || ''
    const shopState = myShopData?.state || ''
    const shopRating = myShopData?.rating?.average || 0
    const shopReviews = myShopData?.rating?.count || 0

    // ✅ FIXED: Default values for fields that don't exist in backend
    const deliveryTime = '30-40'  // Default delivery time
    const freeDelivery = false   // Default free delivery

    useEffect(() => {
        if (myShopData && !myShopData.isApproved) {
            setIsShopPending(true)
        } else {
            setIsShopPending(false)
        }
    }, [myShopData])

    useEffect(() => {
        const fetchOrdersData = async () => {
            if (!myShopData) {
                setLoading(false)
                return
            }
            
            try {
                const response = await axios.get(`${serverUrl}/api/order/my-orders`, {
                    withCredentials: true
                })
                
                const orders = response.data || []
                setRecentOrders(orders.slice(0, 5))
                
                const totalOrders = orders.length
                const pendingOrders = orders.filter(o => o.shopOrders?.status === 'pending').length
                const totalRevenue = orders
                    .filter(o => o.payment === true || o.paymentMethod === 'cod')
                    .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
                
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const todayOrders = orders.filter(o => {
                    const orderDate = new Date(o.createdAt)
                    orderDate.setHours(0, 0, 0, 0)
                    return orderDate.getTime() === today.getTime()
                }).length

                setStats({
                    totalItems: totalItems,
                    totalOrders: totalOrders,
                    pendingOrders: pendingOrders,
                    totalRevenue: totalRevenue,
                    todayOrders: todayOrders
                })
                setLoading(false)
            } catch (error) {
                console.log('Error fetching orders:', error)
                setStats({
                    totalItems: totalItems,
                    totalOrders: 0,
                    pendingOrders: 0,
                    totalRevenue: 0,
                    todayOrders: 0
                })
                setLoading(false)
            }
        }

        fetchOrdersData()
    }, [myShopData, totalItems])

    const handleItemDelete = (itemId) => {
        toast.info('Item deleted. Refreshing...')
        setTimeout(() => window.location.reload(), 500)
    }

    return (
        <div className='min-h-screen bg-[#0a0a0f] relative overflow-hidden pt-[70px] pb-[70px] md:pb-0'>
            
            {/* ✅ OwnerNav */}
            <OwnerNav />

            {/* ✅ Animated Background Orbs */}
            <div className='absolute inset-0 pointer-events-none'>
                <motion.div 
                    animate={{ x: [0, 80, -40, 0], y: [0, -40, 60, 0] }}
                    transition={{ duration: 25, repeat: Infinity }}
                    className='absolute -top-40 -left-40 w-[700px] h-[700px] bg-[#ff2d55]/5 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ x: [0, -80, 40, 0], y: [0, 40, -60, 0] }}
                    transition={{ duration: 30, repeat: Infinity }}
                    className='absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-[#ff6b35]/5 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[#ffd93d]/3 rounded-full blur-3xl'
                />
            </div>

            <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8'>
                
                {/* ✅ Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8'
                >
                    <div className='flex items-center gap-4'>
                        <motion.div 
                            whileHover={{ rotate: 15, scale: 1.1 }}
                            animate={{ 
                                boxShadow: ['0 0 20px rgba(255,45,85,0.3)', '0 0 40px rgba(255,45,85,0.6)', '0 0 20px rgba(255,45,85,0.3)']
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className='w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center shadow-2xl shadow-[#ff2d55]/40'
                        >
                            <MdRestaurant className='text-white text-3xl' />
                        </motion.div>
                        <div>
                            <h1 className='text-3xl sm:text-4xl font-bold text-white tracking-tight'>
                                Owner Dashboard
                            </h1>
                            <p className='text-white/40 text-sm flex items-center gap-2'>
                                <span className='w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse' />
                                {myShopData ? 'Manage your restaurant and orders' : 'Set up your restaurant'}
                            </p>
                        </div>
                    </div>
                    
                    {myShopData && (
                        <div className='flex items-center gap-3'>
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className='flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5'
                            >
                                <FaCalendarAlt className='text-[#ff6b35] text-sm' />
                                <span className='text-white/60 text-sm'>Today</span>
                                <span className='text-white font-bold'>{stats.todayOrders}</span>
                                <span className='text-white/30 text-xs'>orders</span>
                            </motion.div>
                        </div>
                    )}
                </motion.div>

                {/* ✅ Pending Approval Banner */}
                {isShopPending && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className='glass-premium p-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 mb-6'
                    >
                        <div className='flex flex-col sm:flex-row sm:items-center gap-3'>
                            <div className='flex items-center gap-3'>
                                <div className='w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0'>
                                    <FaClock className='text-yellow-400 text-xl' />
                                </div>
                                <div>
                                    <h3 className='text-yellow-400 font-semibold'>⏳ Pending Admin Approval</h3>
                                    <p className='text-white/40 text-sm'>Your shop is waiting for admin approval.</p>
                                </div>
                            </div>
                            <div className='sm:ml-auto'>
                                <span className='text-xs bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full border border-yellow-500/30'>
                                    Under Review
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ✅ Stats Cards */}
                {myShopData && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8'
                    >
                        {[
                            { 
                                icon: <FaStore className='text-[#ff6b35]' />, 
                                label: 'Total Items', 
                                value: stats.totalItems, 
                                color: 'text-[#ff6b35]',
                                bg: 'bg-[#ff6b35]/10',
                                gradient: 'from-[#ff6b35]/20 to-transparent'
                            },
                            { 
                                icon: <FaShoppingBag className='text-[#ffd700]' />, 
                                label: 'Total Orders', 
                                value: stats.totalOrders, 
                                color: 'text-[#ffd700]',
                                bg: 'bg-[#ffd700]/10',
                                gradient: 'from-[#ffd700]/20 to-transparent'
                            },
                            { 
                                icon: <FaClock className='text-[#2ecc71]' />, 
                                label: 'Pending Orders', 
                                value: stats.pendingOrders, 
                                color: 'text-[#2ecc71]',
                                bg: 'bg-[#2ecc71]/10',
                                gradient: 'from-[#2ecc71]/20 to-transparent'
                            },
                            { 
                                icon: <FaChartLine className='text-[#ff2d55]' />, 
                                label: 'Revenue', 
                                value: `₹${stats.totalRevenue}`, 
                                color: 'text-[#ff2d55]',
                                bg: 'bg-[#ff2d55]/10',
                                gradient: 'from-[#ff2d55]/20 to-transparent'
                            }
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -8, scale: 1.03 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className={`glass-premium p-5 rounded-2xl border border-white/5 bg-gradient-to-br ${stat.gradient} transition-all duration-300 shadow-xl shadow-black/20`}
                            >
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <p className='text-white/40 text-[10px] font-medium uppercase tracking-wider'>{stat.label}</p>
                                        <motion.p 
                                            key={stat.value}
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className='text-2xl sm:text-3xl font-bold text-white'
                                        >
                                            {stat.value}
                                        </motion.p>
                                    </div>
                                    <motion.div 
                                        whileHover={{ rotate: 15, scale: 1.1 }}
                                        className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center text-2xl ${stat.color}`}
                                    >
                                        {stat.icon}
                                    </motion.div>
                                </div>
                                <div className='mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden'>
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, stats.totalOrders > 0 ? (stats.totalOrders / 100) * 100 : 50)}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className={`h-full rounded-full bg-gradient-to-r ${stat.color.replace('text-', 'from-')} to-transparent`}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* ✅ Shop Card */}
                {myShopData ? (
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className='glass-premium rounded-3xl border border-white/5 overflow-hidden mb-8 shadow-2xl shadow-[#ff2d55]/10 hover:shadow-[#ff2d55]/20 transition-all duration-500'
                    >
                        <div className='grid grid-cols-1 md:grid-cols-4'>
                            <div className='md:col-span-1 relative h-[220px] md:h-full overflow-hidden'>
                                <img 
                                    src={shopImage}
                                    alt={shopName}
                                    className='w-full h-full object-cover hover:scale-105 transition-all duration-700'
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/400x400/1a1a2e/666?text=No+Image'
                                    }}
                                />
                                <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent md:bg-gradient-to-r md:from-black/70 md:via-transparent' />
                                
                                <div className={`absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-xl border ${
                                    myShopData.isApproved 
                                        ? 'bg-green-500/40 border-green-400/50 shadow-lg shadow-green-500/20' 
                                        : 'bg-yellow-500/40 border-yellow-400/50 shadow-lg shadow-yellow-500/20'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                                        myShopData.isApproved ? 'bg-green-400' : 'bg-yellow-400'
                                    }`} />
                                    <span className={`text-[9px] font-medium ${
                                        myShopData.isApproved ? 'text-green-300' : 'text-yellow-300'
                                    }`}>
                                        {myShopData.isApproved ? '✅ Approved' : '⏳ Pending'}
                                    </span>
                                </div>
                                
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 15 }}
                                    whileTap={{ scale: 0.9 }}
                                    className='absolute top-4 right-4 w-9 h-9 rounded-full bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] text-white flex items-center justify-center shadow-lg shadow-[#ff2d55]/30 hover:shadow-[#ff2d55]/50 transition-all duration-300'
                                    onClick={() => navigate("/create-edit-shop")}
                                >
                                    <FaPen size={14} />
                                </motion.button>
                            </div>

                            <div className='md:col-span-3 p-6'>
                                <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-3'>
                                    <div>
                                        <div className='flex items-center gap-2'>
                                            <h2 className='text-2xl font-bold text-white flex items-center gap-2'>
                                                {shopName}
                                            </h2>
                                            {myShopData.isApproved && (
                                                <MdVerified className='text-blue-400 text-lg' />
                                            )}
                                            <span className='text-[9px] bg-[#ff2d55]/20 text-[#ff2d55] px-2 py-0.5 rounded-full border border-[#ff2d55]/20'>
                                                Owner
                                            </span>
                                        </div>
                                        
                                        <p className='text-white/40 text-sm flex items-center gap-2 mt-1'>
                                            <FaMapMarkerAlt className='text-[#ff6b35] text-xs' />
                                            {shopAddress && shopCity ? `${shopAddress}, ${shopCity}, ${shopState}` : 'Address not added'}
                                        </p>
                                        
                                        <div className='flex flex-wrap items-center gap-3 mt-2.5'>
                                            <div className='flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5'>
                                                <FaStar className='text-yellow-400 text-[10px]' />
                                                <span className='text-white/60 text-xs'>
                                                    {shopRating > 0 ? `${shopRating.toFixed(1)} ★` : 'No ratings'}
                                                </span>
                                            </div>
                                            {/* ✅ FIXED: Use default value instead of myShopData.deliveryTime */}
                                            <div className='flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5'>
                                                <FaClock className='text-[#ff6b35] text-[10px]' />
                                                <span className='text-white/60 text-xs'>
                                                    {deliveryTime} min
                                                </span>
                                            </div>
                                            {/* ✅ FIXED: Use default value instead of myShopData.freeDelivery */}
                                            <div className='flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5'>
                                                <FaTruck className='text-blue-400 text-[10px]' />
                                                <span className='text-white/60 text-xs'>
                                                    {freeDelivery ? 'Free Delivery' : 'Delivery Available'}
                                                </span>
                                            </div>
                                            <div className='flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5'>
                                                <FaShoppingBag className='text-[#ff6b35] text-[10px]' />
                                                <span className='text-white/60 text-xs'>
                                                    {totalItems} items
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className='px-5 py-2 rounded-full bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white text-sm font-medium shadow-lg shadow-[#ff2d55]/20 flex items-center gap-2 whitespace-nowrap'
                                        onClick={() => navigate("/create-edit-shop")}
                                    >
                                        <FaPen size={14} /> Edit Shop
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className='glass-premium p-16 rounded-3xl border border-white/5 text-center relative overflow-hidden group'
                    >
                        <div className='absolute inset-0 bg-gradient-to-r from-[#ff2d55]/10 to-[#ff6b35]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700' />
                        <div className='relative z-10'>
                            <div className='w-28 h-28 mx-auto mb-5 rounded-full bg-gradient-to-br from-[#ff2d55]/10 to-[#ff6b35]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-white/10'>
                                <MdRestaurant size={45} className='text-white/20' />
                            </div>
                            <h3 className='text-2xl font-bold text-white mb-2'>Add Your Shop</h3>
                            <p className='text-white/40 text-sm max-w-sm mx-auto leading-relaxed'>
                                Join our food delivery platform and reach thousands of hungry customers every day.
                            </p>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className='mt-6 px-8 py-3 rounded-full bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white font-medium shadow-lg shadow-[#ff2d55]/20 flex items-center gap-2 mx-auto'
                                onClick={() => navigate("/create-edit-shop")}
                            >
                                <FaPlus size={14} /> Get Started
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* ✅ Items Section */}
                {myShopData && myShopData.isApproved && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className='flex items-center justify-between mb-4'>
                            <h2 className='text-xl font-bold text-white flex items-center gap-2'>
                                <FaUtensils className='text-[#ff6b35]' /> Menu Items
                                <span className='text-xs text-white/30 font-normal'>({totalItems})</span>
                            </h2>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className='px-4 py-2 rounded-full bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white text-sm font-medium shadow-lg shadow-[#ff2d55]/20 flex items-center gap-2'
                                onClick={() => navigate("/add-item")}
                            >
                                <FaPlus size={14} /> Add Item
                            </motion.button>
                        </div>

                        {myShopData.items && myShopData.items.length > 0 ? (
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                                {myShopData.items.map((item, index) => (
                                    <OwnerItemCard key={item._id || index} data={item} index={index} onDelete={handleItemDelete} />
                                ))}
                            </div>
                        ) : (
                            <div className='glass-premium p-10 rounded-2xl border border-white/5 text-center'>
                                <div className='w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center'>
                                    <FaUtensils size={32} className='text-white/20' />
                                </div>
                                <h3 className='text-white font-semibold text-lg mb-2'>No Items Yet</h3>
                                <p className='text-white/30 text-sm'>Start adding your delicious items to the menu</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className='mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white text-sm font-medium shadow-lg shadow-[#ff2d55]/20'
                                    onClick={() => navigate("/add-item")}
                                >
                                    Add Your First Item
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ✅ If Shop Pending */}
                {myShopData && !myShopData.isApproved && (
                    <div className='glass-premium p-10 rounded-2xl border border-white/5 text-center mt-6'>
                        <div className='w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-500/10 flex items-center justify-center'>
                            <FaClock size={32} className='text-yellow-400' />
                        </div>
                        <h3 className='text-white font-semibold text-lg mb-2'>⏳ Waiting for Approval</h3>
                        <p className='text-white/40 text-sm max-w-md mx-auto'>
                            Your shop is pending admin approval. Once approved, you'll be able to add items and start receiving orders.
                        </p>
                        <div className='mt-4 flex items-center justify-center gap-2'>
                            <span className='w-2 h-2 bg-yellow-400 rounded-full animate-pulse' />
                            <span className='text-yellow-400/60 text-xs'>Under Review</span>
                        </div>
                    </div>
                )}
            </div>

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
                @keyframes float-3d {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(40px, -30px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
            `}</style>
        </div>
    )
}

export default OwnerDashboard