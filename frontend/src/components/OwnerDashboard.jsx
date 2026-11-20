import React, { useState, useEffect } from 'react'
import OwnerNav from '../components/OwnerNav'
import { useSelector } from 'react-redux'
import { 
    FaUtensils, FaStore, FaPlus, FaPen, FaStar, 
    FaClock, FaTruck, FaShoppingBag, FaArrowRight,
    FaChartLine, FaBox, FaCheckCircle, FaTimesCircle,
    FaMapMarkerAlt, FaPhone, FaSearch, FaFilter
} from "react-icons/fa"
import { MdRestaurant, MdVerified } from "react-icons/md"
import { useNavigate } from 'react-router-dom'
import OwnerItemCard from './OwnerItemCard'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { serverUrl } from '../../config'
import { ClipLoader } from 'react-spinners'
import { toast } from 'react-toastify'

function OwnerDashboard() {
    const { userData } = useSelector(state => state.user)
    const navigate = useNavigate()
    
    const [shops, setShops] = useState([])
    const [selectedShop, setSelectedShop] = useState(null)
    const [loading, setLoading] = useState(true)
    const [searchMenu, setSearchMenu] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')

    const [stats, setStats] = useState({
        totalItems: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        todayOrders: 0
    })

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
                }
            } catch (error) {
                console.log('Error fetching my-shops:', error)
                try {
                    const fallback = await axios.get(`${serverUrl}/api/shop/my-shop`, { withCredentials: true })
                    if (fallback.data.shop) {
                        setShops([fallback.data.shop])
                        setSelectedShop(fallback.data.shop)
                    }
                } catch (fbErr) {
                    console.log('No shop exists')
                }
            } finally {
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
                
                const totalOrders = orders.length
                const pendingOrders = orders.filter(o => {
                    const so = Array.isArray(o.shopOrders) ? o.shopOrders[0] : o.shopOrders
                    return so?.status === 'pending'
                }).length

                // Calculate Net Restaurant Revenue (using authoritative restaurant earnings)
                const totalRevenue = orders
                    .filter(o => o.payment === true || o.paymentMethod === 'cod')
                    .reduce((sum, o) => {
                        const so = Array.isArray(o.shopOrders) ? o.shopOrders[0] : o.shopOrders
                        return sum + (so?.restaurantEarnings || so?.subtotal || 0)
                    }, 0)

                const today = new Date().toDateString()
                const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today).length

                setStats({
                    totalItems: selectedShop?.items?.length || 0,
                    totalOrders,
                    pendingOrders,
                    totalRevenue,
                    todayOrders
                })
            } catch (err) {
                console.error('Error fetching dashboard metrics:', err)
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

    const handleItemDeleted = (itemId) => {
        if (selectedShop) {
            const updatedItems = (selectedShop.items || []).filter(item => item._id !== itemId)
            setSelectedShop({ ...selectedShop, items: updatedItems })
        }
    }

    // Filter menu items
    const filteredItems = (selectedShop?.items || []).filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category?.toLowerCase() === selectedCategory.toLowerCase()
        const matchesSearch = !searchMenu.trim() || item.name?.toLowerCase().includes(searchMenu.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const categories = ['all', 'Snacks', 'Main Course', 'Desserts', 'Pizza', 'Burgers', 'Chinese', 'Fast Food']

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A090D] text-white flex flex-col items-center justify-center">
                <ClipLoader size={50} color="#FF6B00" />
                <p className="mt-4 text-xs text-gray-400 animate-pulse">Loading merchant dashboard...</p>
            </div>
        )
    }

    if (!selectedShop && !loading) {
        return (
            <div 
                className="min-h-screen bg-[#0A090D] text-white pt-24 pb-16 px-4 selection:bg-[#FF6B00] selection:text-white"
                style={{ fontFamily: "'Poppins', 'Segoe UI', system-ui, sans-serif" }}
            >
                <OwnerNav />
                <div className="max-w-xl mx-auto mt-16 bg-[#13121A] border border-white/10 rounded-3xl p-10 text-center space-y-4 shadow-2xl">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF6B00]">
                        <FaStore size={30} />
                    </div>
                    <h2 className="text-2xl font-black text-white">No Restaurant Registered</h2>
                    <p className="text-xs text-gray-400">
                        You have not registered your restaurant yet. Setup your kitchen profile to start receiving customer orders on Cravely.
                    </p>
                    <button
                        onClick={() => navigate('/create-edit-shop')}
                        className="px-6 py-3 rounded-2xl bg-[#FF6B00] hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-orange-500/25 cursor-pointer"
                    >
                        Register Restaurant Now
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div 
            className="min-h-screen bg-[#0A090D] text-white pt-[90px] pb-24 px-4 sm:px-6 lg:px-8 selection:bg-[#FF6B00] selection:text-white"
            style={{ fontFamily: "'Poppins', 'Segoe UI', system-ui, sans-serif" }}
        >
            <OwnerNav />

            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* 1. Dashboard Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                Partner Dashboard
                            </h1>
                            {selectedShop.isApproved ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>Kitchen Live</span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
                                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                    <span>Approval Pending</span>
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Welcome back, <strong className="text-white">{userData?.fullName || 'Chef'}</strong> • Manage your culinary offerings & real-time revenue
                        </p>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                            onClick={() => navigate('/add-item')}
                            className="px-4 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-orange-600 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-orange-500/20 cursor-pointer"
                        >
                            <FaPlus size={11} />
                            <span>Add Dish</span>
                        </button>

                        <button
                            onClick={() => navigate('/create-edit-shop')}
                            className="px-4 py-2.5 rounded-xl bg-[#13121A] hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                            <FaPen size={11} className="text-gray-400" />
                            <span>Edit Shop</span>
                        </button>

                        <button
                            onClick={() => navigate('/owner-orders')}
                            className="px-4 py-2.5 rounded-xl bg-[#13121A] hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                            <FaShoppingBag size={11} className="text-amber-400" />
                            <span>View Orders</span>
                        </button>
                    </div>
                </div>

                {/* 2. Key Performance Metric Cards (Solid Dark Surfaces, Zero Gradients) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    
                    {/* Card 1: Net Earnings */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 rounded-2xl bg-[#13121A] border border-white/[0.08] space-y-1 shadow-lg"
                    >
                        <div className="flex items-center justify-between text-emerald-400 mb-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Net Earnings</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <FaChartLine size={14} />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-white font-mono">₹{stats.totalRevenue}</p>
                        <p className="text-[11px] text-gray-400">Post-commission net revenue</p>
                    </motion.div>

                    {/* Card 2: Orders Today */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="p-5 rounded-2xl bg-[#13121A] border border-white/[0.08] space-y-1 shadow-lg"
                    >
                        <div className="flex items-center justify-between text-[#FF6B00] mb-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Orders Today</span>
                            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                                <FaShoppingBag size={14} />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-white font-mono">{stats.todayOrders}</p>
                        <p className="text-[11px] text-gray-400">{stats.totalOrders} total lifetime orders</p>
                    </motion.div>

                    {/* Card 3: Pending Kitchen Orders */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-5 rounded-2xl bg-[#13121A] border border-white/[0.08] space-y-1 shadow-lg"
                    >
                        <div className="flex items-center justify-between text-amber-400 mb-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Orders</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <FaClock size={14} />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-white font-mono">{stats.pendingOrders}</p>
                        <p className="text-[11px] text-gray-400">Awaiting kitchen confirmation</p>
                    </motion.div>

                    {/* Card 4: Total Menu Items */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="p-5 rounded-2xl bg-[#13121A] border border-white/[0.08] space-y-1 shadow-lg"
                    >
                        <div className="flex items-center justify-between text-sky-400 mb-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Dishes</span>
                            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                                <FaUtensils size={14} />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-white font-mono">{selectedShop.items?.length || 0}</p>
                        <p className="text-[11px] text-gray-400">Available on Cravely customer menu</p>
                    </motion.div>
                </div>

                {/* 3. Restaurant Profile Showcase Card */}
                <div className="bg-[#13121A] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        <div className="md:col-span-4 rounded-2xl overflow-hidden aspect-[16/10] bg-[#0A090D] border border-white/10 shadow-md">
                            <img 
                                src={selectedShop.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop'} 
                                alt={selectedShop.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="md:col-span-8 space-y-3">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                                    Verified Restaurant Partner
                                </span>
                                <span className="px-3 py-1 rounded-full bg-[#181722] border border-white/10 text-xs font-bold text-white flex items-center gap-1">
                                    <FaStar size={11} className="text-amber-400" />
                                    <span>{Number(selectedShop.rating?.average || 4.5).toFixed(1)}</span>
                                    <span className="text-gray-400 font-normal">({selectedShop.rating?.count || 120} reviews)</span>
                                </span>
                            </div>

                            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                {selectedShop.name}
                            </h2>

                            <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                <FaMapMarkerAlt size={11} className="text-[#FF6B00]" />
                                <span>{selectedShop.address}, {selectedShop.city}, {selectedShop.state}</span>
                            </p>

                            <div className="pt-2 flex items-center gap-3">
                                <button
                                    onClick={() => navigate('/create-edit-shop')}
                                    className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/15 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                                >
                                    <FaPen size={11} />
                                    <span>Update Details & Cover Photo</span>
                                </button>

                                <button
                                    onClick={() => navigate(`/shop/${selectedShop._id}`)}
                                    className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/15 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                                >
                                    <span>View Customer Page →</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Menu Dishes Management Section */}
                <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                                <FaUtensils size={16} className="text-[#FF6B00]" />
                                <span>Menu Catalog</span>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#FF6B00]/20 text-[#FF8C00]">
                                    {filteredItems.length}
                                </span>
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Add, update pricing, or remove dishes in your restaurant's digital menu
                            </p>
                        </div>

                        {/* Search and Category Filters */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <div className="relative">
                                <FaSearch size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                                <input
                                    type="text"
                                    placeholder="Filter dishes..."
                                    value={searchMenu}
                                    onChange={(e) => setSearchMenu(e.target.value)}
                                    className="bg-[#13121A] border border-white/10 focus:border-[#FF6B00] rounded-xl pl-8 pr-7 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none transition w-44"
                                />
                                {searchMenu && (
                                    <button
                                        onClick={() => setSearchMenu('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="bg-[#13121A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00] cursor-pointer"
                            >
                                <option value="all">All Categories</option>
                                <option value="Snacks">Snacks</option>
                                <option value="Main Course">Main Course</option>
                                <option value="Desserts">Desserts</option>
                                <option value="Pizza">Pizza</option>
                                <option value="Burgers">Burgers</option>
                                <option value="Chinese">Chinese</option>
                                <option value="Fast Food">Fast Food</option>
                            </select>
                        </div>
                    </div>

                    {/* Menu Items Grid */}
                    {filteredItems.length === 0 ? (
                        <div className="bg-[#13121A] border border-white/10 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
                            <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                                <FaUtensils size={24} />
                            </div>
                            <h4 className="text-base font-bold text-white">No Dishes Found</h4>
                            <p className="text-xs text-gray-400">
                                {searchMenu 
                                    ? `No dishes matched "${searchMenu}".` 
                                    : 'Start building your menu by adding mouth-watering food items.'}
                            </p>
                            <button
                                onClick={() => navigate('/add-item')}
                                className="px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-orange-600 text-white font-bold text-xs transition cursor-pointer"
                            >
                                Add Your First Dish
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {filteredItems.map((item, index) => (
                                <OwnerItemCard 
                                    key={item._id || index}
                                    data={item}
                                    index={index}
                                    onDelete={handleItemDeleted}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default OwnerDashboard
