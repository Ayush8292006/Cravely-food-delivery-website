import React, { useState, useEffect } from 'react'
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
    FaBookmark, FaThumbsUp, FaComment,
    FaChevronLeft, FaChevronRight
} from "react-icons/fa";
import { MdRestaurant, MdDeliveryDining, MdVerified } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import OwnerItemCard from './OwnerItemCard';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { serverUrl } from '../../config';
import { toast } from 'react-toastify';

function OwnerDashboard() {
    const { userData } = useSelector(state => state.user)
    const navigate = useNavigate()
    
    const [shops, setShops] = useState([])
    const [selectedShop, setSelectedShop] = useState(null)
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalItems: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        todayOrders: 0
    })
    const [recentOrders, setRecentOrders] = useState([])
    const [currentShopIndex, setCurrentShopIndex] = useState(0)

    useEffect(() => {
        const fetchMyShops = async () => {
            if (!userData?._id) {
                setLoading(false)
                return
            }

            try {
                const response = await axios.get(
                    `${serverUrl}/api/shop/my-shops`,
                    { withCredentials: true }
                )
                const shopsData = response.data.shops || []
                setShops(shopsData)
                
                if (shopsData.length > 0) {
                    setSelectedShop(shopsData[0])
                    setCurrentShopIndex(0)
                }
                setLoading(false)
            } catch (error) {
                console.log('❌ Error fetching shops:', error)
                try {
                    const fallbackResponse = await axios.get(
                        `${serverUrl}/api/shop/my-shop`,
                        { withCredentials: true }
                    )
                    if (fallbackResponse.data.shop) {
                        setShops([fallbackResponse.data.shop])
                        setSelectedShop(fallbackResponse.data.shop)
                    }
                } catch (fallbackError) {
                    console.log('❌ No shop found')
                }
                setLoading(false)
            }
        }

        fetchMyShops()
    }, [userData?._id])

    useEffect(() => {
        if (!selectedShop) return

        const fetchOrdersData = async () => {
            try {
                const response = await axios.get(
                    `${serverUrl}/api/order/my-orders`,
                    { withCredentials: true }
                )
                
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
                    totalItems: selectedShop?.items?.length || 0,
                    totalOrders: totalOrders,
                    pendingOrders: pendingOrders,
                    totalRevenue: totalRevenue,
                    todayOrders: todayOrders
                })
            } catch (error) {
                console.log('Error fetching orders:', error)
                setStats({
                    totalItems: selectedShop?.items?.length || 0,
                    totalOrders: 0,
                    pendingOrders: 0,
                    totalRevenue: 0,
                    todayOrders: 0
                })
            }
        }

        fetchOrdersData()
    }, [selectedShop])

    const handleItemDelete = (itemId) => {
        toast.info('Item deleted. Refreshing...')
        if (selectedShop) {
            const updatedItems = selectedShop.items.filter(item => item._id !== itemId)
            setSelectedShop({ ...selectedShop, items: updatedItems })
        }
        setTimeout(() => window.location.reload(), 500)
    }

    const nextShop = () => {
        if (shops.length > 0) {
            const nextIndex = (currentShopIndex + 1) % shops.length
            setCurrentShopIndex(nextIndex)
            setSelectedShop(shops[nextIndex])
        }
    }

    const prevShop = () => {
        if (shops.length > 0) {
            const prevIndex = (currentShopIndex - 1 + shops.length) % shops.length
            setCurrentShopIndex(prevIndex)
            setSelectedShop(shops[prevIndex])
        }
    }

    const myShopData = selectedShop
    const totalItems = myShopData?.items?.length || 0
    const shopName = myShopData?.name || ''
    const shopImage = myShopData?.image || 'https://via.placeholder.com/800x400/f0ebe5/cbb8a8?text=No+Image'
    const shopAddress = myShopData?.address || ''
    const shopCity = myShopData?.city || ''
    const shopState = myShopData?.state || ''
    const shopRating = myShopData?.rating?.average || 0
    const shopReviews = myShopData?.rating?.count || 0
    const isShopPending = myShopData && !myShopData.isApproved

    const deliveryTime = '30-40'
    const freeDelivery = false

    if (loading) {
        return (
            <div className='min-h-screen bg-white flex items-center justify-center'>
                <div className='flex flex-col items-center gap-4'>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className='w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full'
                    />
                    <p className='text-gray-400 text-sm animate-pulse font-medium'>Loading your shops...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-[#f8f4f0] relative overflow-hidden pt-[70px] pb-[70px] md:pb-0'>
            
            <OwnerNav />

            <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8'>
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8'
                >
                    <div className='flex items-center gap-4'>
                        <div className='w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center shadow-md shadow-orange-200'>
                            <MdRestaurant className='text-white text-3xl' />
                        </div>
                        <div>
                            <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight'>
                                Owner Dashboard
                            </h1>
                            <p className='text-gray-500 text-sm flex items-center gap-2 font-medium'>
                                <span className='w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse' />
                                {shops.length > 0 ? `${shops.length} Shop${shops.length > 1 ? 's' : ''}` : 'No shops yet'}
                            </p>
                        </div>
                    </div>
                    
                    {myShopData && (
                        <div className='flex items-center gap-3'>
                            <div className='flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-gray-200 shadow-sm'>
                                <FaCalendarAlt className='text-orange-500 text-sm' />
                                <span className='text-gray-600 text-sm font-medium'>Today</span>
                                <span className='text-gray-800 font-bold'>{stats.todayOrders}</span>
                                <span className='text-gray-400 text-xs'>orders</span>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Multiple Shops Navigation */}
                {shops.length > 1 && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='flex items-center justify-between gap-4 mb-6 bg-white border-2 border-gray-200 p-3 rounded-2xl shadow-sm'
                    >
                        <button
                            onClick={prevShop}
                            className='w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300 flex items-center justify-center text-gray-500 hover:text-gray-700'
                        >
                            <FaChevronLeft size={16} />
                        </button>
                        
                        <div className='flex items-center gap-2'>
                            <span className='text-gray-600 text-sm font-medium'>
                                Shop {currentShopIndex + 1} of {shops.length}
                            </span>
                            <span className='text-gray-300 text-xs'>|</span>
                            <span className='text-gray-700 text-sm font-semibold truncate max-w-[200px]'>
                                {shops[currentShopIndex]?.name}
                            </span>
                            {shops[currentShopIndex]?.isApproved ? (
                                <MdVerified className='text-blue-500 text-sm' />
                            ) : (
                                <span className='text-[8px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-medium'>Pending</span>
                            )}
                        </div>

                        <button
                            onClick={nextShop}
                            className='w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300 flex items-center justify-center text-gray-500 hover:text-gray-700'
                        >
                            <FaChevronRight size={16} />
                        </button>
                    </motion.div>
                )}

                {/* Pending Approval Banner */}
                {isShopPending && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className='bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl mb-6'
                    >
                        <div className='flex flex-col sm:flex-row sm:items-center gap-3'>
                            <div className='flex items-center gap-3'>
                                <div className='w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0'>
                                    <FaClock className='text-amber-600 text-xl' />
                                </div>
                                <div>
                                    <h3 className='text-amber-700 font-bold'>⏳ Pending Admin Approval</h3>
                                    <p className='text-amber-600 text-sm font-medium'>Your shop is waiting for admin approval.</p>
                                </div>
                            </div>
                            <div className='sm:ml-auto'>
                                <span className='text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full border border-amber-200 font-bold'>
                                    Under Review
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Stats Cards */}
                {myShopData && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8'
                    >
                        {[
                            { 
                                icon: <FaStore className='text-orange-500' />, 
                                label: 'Total Items', 
                                value: stats.totalItems, 
                                color: 'text-orange-600',
                                bg: 'bg-orange-50',
                                border: 'border-orange-200'
                            },
                            { 
                                icon: <FaShoppingBag className='text-amber-500' />, 
                                label: 'Total Orders', 
                                value: stats.totalOrders, 
                                color: 'text-amber-600',
                                bg: 'bg-amber-50',
                                border: 'border-amber-200'
                            },
                            { 
                                icon: <FaClock className='text-emerald-500' />, 
                                label: 'Pending Orders', 
                                value: stats.pendingOrders, 
                                color: 'text-emerald-600',
                                bg: 'bg-emerald-50',
                                border: 'border-emerald-200'
                            },
                            { 
                                icon: <FaChartLine className='text-red-500' />, 
                                label: 'Revenue', 
                                value: `₹${stats.totalRevenue}`, 
                                color: 'text-red-600',
                                bg: 'bg-red-50',
                                border: 'border-red-200'
                            }
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -4, scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className={`bg-white border-2 ${stat.border} p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300`}
                            >
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <p className='text-gray-500 text-[10px] font-bold uppercase tracking-wider'>{stat.label}</p>
                                        <p className='text-2xl sm:text-3xl font-bold text-gray-800'>
                                            {stat.value}
                                        </p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center text-2xl ${stat.color}`}>
                                        {stat.icon}
                                    </div>
                                </div>
                                <div className='mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden'>
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, stats.totalOrders > 0 ? (stats.totalOrders / 100) * 100 : 50)}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className={`h-full rounded-full bg-orange-500`}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Shop Card */}
                {myShopData ? (
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className='bg-white border-2 border-gray-200 rounded-3xl overflow-hidden mb-8 shadow-sm hover:shadow-md transition-all duration-300'
                    >
                        <div className='grid grid-cols-1 md:grid-cols-4'>
                            <div className='md:col-span-1 relative h-[220px] md:h-full overflow-hidden'>
                                <img 
                                    src={shopImage}
                                    alt={shopName}
                                    className='w-full h-full object-cover hover:scale-105 transition-all duration-700'
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/400x400/f0ebe5/cbb8a8?text=No+Image'
                                    }}
                                />
                                <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r md:from-black/60 md:via-transparent' />
                                
                                <div className={`absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-sm border-2 ${
                                    myShopData.isApproved 
                                        ? 'bg-green-500/90 border-green-400' 
                                        : 'bg-amber-500/90 border-amber-400'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                                        myShopData.isApproved ? 'bg-white' : 'bg-white'
                                    }`} />
                                    <span className={`text-[9px] font-bold text-white`}>
                                        {myShopData.isApproved ? '✅ Approved' : '⏳ Pending'}
                                    </span>
                                </div>
                                
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 15 }}
                                    whileTap={{ scale: 0.9 }}
                                    className='absolute top-4 right-4 w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-200 hover:bg-orange-600 transition-all duration-300'
                                    onClick={() => navigate("/create-edit-shop")}
                                >
                                    <FaPen size={14} />
                                </motion.button>
                            </div>

                            <div className='md:col-span-3 p-6'>
                                <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-3'>
                                    <div>
                                        <div className='flex items-center gap-2'>
                                            <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
                                                {shopName}
                                            </h2>
                                            {myShopData.isApproved && (
                                                <MdVerified className='text-blue-500 text-lg' />
                                            )}
                                            <span className='text-[9px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200 font-bold'>
                                                Owner
                                            </span>
                                        </div>
                                        
                                        <p className='text-gray-500 text-sm flex items-center gap-2 mt-1 font-medium'>
                                            <FaMapMarkerAlt className='text-orange-500 text-xs' />
                                            {shopAddress && shopCity ? `${shopAddress}, ${shopCity}, ${shopState}` : 'Address not added'}
                                        </p>
                                        
                                        <div className='flex flex-wrap items-center gap-3 mt-2.5'>
                                            <div className='flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 border border-gray-200'>
                                                <FaStar className='text-amber-400 text-[10px]' />
                                                <span className='text-gray-700 text-xs font-medium'>
                                                    {shopRating > 0 ? `${shopRating.toFixed(1)} ★` : 'No ratings'}
                                                </span>
                                            </div>
                                            <div className='flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 border border-gray-200'>
                                                <FaClock className='text-orange-500 text-[10px]' />
                                                <span className='text-gray-700 text-xs font-medium'>
                                                    {deliveryTime} min
                                                </span>
                                            </div>
                                            <div className='flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 border border-gray-200'>
                                                <FaTruck className='text-blue-500 text-[10px]' />
                                                <span className='text-gray-700 text-xs font-medium'>
                                                    {freeDelivery ? 'Free Delivery' : 'Delivery Available'}
                                                </span>
                                            </div>
                                            <div className='flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 border border-gray-200'>
                                                <FaShoppingBag className='text-orange-500 text-[10px]' />
                                                <span className='text-gray-700 text-xs font-medium'>
                                                    {totalItems} items
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className='px-5 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-sm shadow-orange-200 flex items-center gap-2 whitespace-nowrap'
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
                        className='bg-white border-2 border-gray-200 p-16 rounded-3xl text-center shadow-sm'
                    >
                        <div className='relative z-10'>
                            <div className='w-28 h-28 mx-auto mb-5 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center'>
                                <MdRestaurant size={45} className='text-gray-300' />
                            </div>
                            <h3 className='text-2xl font-bold text-gray-800 mb-2'>Add Your Shop</h3>
                            <p className='text-gray-500 text-sm max-w-sm mx-auto leading-relaxed font-medium'>
                                Join our food delivery platform and reach thousands of hungry customers every day.
                            </p>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className='mt-6 px-8 py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-sm shadow-orange-200 flex items-center gap-2 mx-auto'
                                onClick={() => navigate("/create-edit-shop")}
                            >
                                <FaPlus size={14} /> Get Started
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* Items Section */}
                {myShopData && myShopData.isApproved && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className='flex items-center justify-between mb-4'>
                            <h2 className='text-xl font-bold text-gray-900 flex items-center gap-2'>
                                <FaUtensils className='text-orange-500' /> Menu Items
                                <span className='text-xs text-gray-400 font-normal'>({totalItems})</span>
                            </h2>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className='px-4 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-sm shadow-orange-200 flex items-center gap-2'
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
                            <div className='bg-gray-50 border-2 border-gray-200 p-10 rounded-2xl text-center'>
                                <div className='w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center'>
                                    <FaUtensils size={32} className='text-gray-400' />
                                </div>
                                <h3 className='text-gray-800 font-bold text-lg mb-2'>No Items Yet</h3>
                                <p className='text-gray-500 text-sm font-medium'>Start adding your delicious items to the menu</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className='mt-4 px-6 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-sm shadow-orange-200'
                                    onClick={() => navigate("/add-item")}
                                >
                                    Add Your First Item
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* If Shop Pending */}
                {myShopData && !myShopData.isApproved && (
                    <div className='bg-white border-2 border-gray-200 p-10 rounded-2xl text-center mt-6 shadow-sm'>
                        <div className='w-20 h-20 mx-auto mb-4 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center'>
                            <FaClock size={32} className='text-amber-500' />
                        </div>
                        <h3 className='text-gray-800 font-bold text-lg mb-2'>⏳ Waiting for Approval</h3>
                        <p className='text-gray-500 text-sm max-w-md mx-auto font-medium'>
                            Your shop is pending admin approval. Once approved, you'll be able to add items and start receiving orders.
                        </p>
                        <div className='mt-4 flex items-center justify-center gap-2'>
                            <span className='w-2 h-2 bg-amber-500 rounded-full animate-pulse' />
                            <span className='text-amber-600 text-xs font-bold'>Under Review</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default OwnerDashboard