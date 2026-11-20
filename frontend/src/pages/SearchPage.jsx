import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../../config'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import FoodCard from '../components/FoodCard'
import ShopCard from '../components/ShopCard'
import { 
    FaSearch, FaFilter, FaStar, FaTimes, FaUtensils, 
    FaStore, FaLeaf, FaFire, FaSortAmountDown, FaArrowRight 
} from 'react-icons/fa'
import { categories } from '../category'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'

function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const initialQuery = searchParams.get('q') || ''
    const [query, setQuery] = useState(initialQuery)
    const { currentCity } = useSelector(state => state.user)

    const [items, setItems] = useState([])
    const [shops, setShops] = useState([])
    const [loading, setLoading] = useState(false)
    
    // Filters
    const [foodType, setFoodType] = useState('all') // 'all', 'veg', 'non veg'
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [minRating, setMinRating] = useState('all') // 'all', '4.0', '4.5'
    const [sortBy, setSortBy] = useState('rating') // 'rating', 'price_asc', 'price_desc'
    const [activeTab, setActiveTab] = useState('dishes') // 'dishes', 'restaurants'

    const navigate = useNavigate()

    useEffect(() => {
        const qParam = searchParams.get('q')
        if (qParam !== null && qParam !== query) {
            setQuery(qParam)
        }
    }, [searchParams])

    useEffect(() => {
        performSearch()
    }, [query, foodType, selectedCategory, minRating, sortBy])

    const performSearch = async () => {
        setLoading(true)
        try {
            // Search items
            const params = {
                query: query.trim(),
                city: currentCity || 'all',
                foodType: foodType !== 'all' ? foodType : undefined,
                category: selectedCategory !== 'all' ? selectedCategory : undefined,
                rating: minRating !== 'all' ? minRating : undefined
            }

            const itemRes = await axios.get(`${serverUrl}/api/item/search-items-with-filters`, { params })
            let fetchedItems = itemRes.data || []

            // Apply sorting
            if (sortBy === 'price_asc') {
                fetchedItems.sort((a, b) => a.price - b.price)
            } else if (sortBy === 'price_desc') {
                fetchedItems.sort((a, b) => b.price - a.price)
            } else {
                fetchedItems.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0))
            }
            setItems(fetchedItems)

            // Search restaurants
            const shopRes = await axios.get(`${serverUrl}/api/shop/get-by-city/${encodeURIComponent(currentCity || 'all')}`)
            const allShops = shopRes.data || []
            if (query.trim()) {
                const filteredShops = allShops.filter(s =>
                    s.name?.toLowerCase().includes(query.toLowerCase()) ||
                    s.address?.toLowerCase().includes(query.toLowerCase()) ||
                    s.items?.some(it => it.name?.toLowerCase().includes(query.toLowerCase()))
                )
                setShops(filteredShops)
            } else {
                setShops(allShops)
            }
        } catch (error) {
            console.log('Search error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        setSearchParams(query.trim() ? { q: query.trim() } : {})
    }

    const handleClearFilters = () => {
        setFoodType('all')
        setSelectedCategory('all')
        setMinRating('all')
        setSortBy('rating')
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col font-sans">
            <Nav />

            <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
                {/* Search Header Bar */}
                <div className="max-w-3xl mx-auto mb-8">
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <FaSearch className="absolute left-5 top-4 text-white/40 text-lg" />
                        <input
                            type="text"
                            placeholder="Search for restaurants, dishes, pizzas, biryani..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-[#12121c] border border-white/10 rounded-3xl pl-14 pr-28 py-4 text-white text-base focus:outline-none focus:border-orange-500 shadow-2xl transition"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => {
                                    setQuery('')
                                    setSearchParams({})
                                }}
                                className="absolute right-20 top-4 text-white/30 hover:text-white"
                            >
                                <FaTimes />
                            </button>
                        )}
                        <button
                            type="submit"
                            className="absolute right-3 top-2.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-xs shadow-md shadow-orange-500/20 transition"
                        >
                            Search
                        </button>
                    </form>

                    {/* Quick Category Chips */}
                    <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
                        {['Pizza', 'Burgers', 'Main Course', 'Chinese', 'Desserts', 'Snacks', 'Fast Food'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => {
                                    setSelectedCategory(selectedCategory === cat ? 'all' : cat)
                                }}
                                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                                    selectedCategory === cat
                                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                                        : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tabs & Filters Bar */}
                <div className="bg-[#12121c] border border-white/5 rounded-3xl p-4 md:p-5 mb-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* View Switcher: Dishes vs Restaurants */}
                    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl">
                        <button
                            onClick={() => setActiveTab('dishes')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                activeTab === 'dishes'
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                                    : 'text-white/50 hover:text-white'
                            }`}
                        >
                            <FaUtensils size={11} /> Dishes ({items.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('restaurants')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                activeTab === 'restaurants'
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                                    : 'text-white/50 hover:text-white'
                            }`}
                        >
                            <FaStore size={11} /> Restaurants ({shops.length})
                        </button>
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        {/* Food Type */}
                        <select
                            value={foodType}
                            onChange={(e) => setFoodType(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/80 focus:outline-none focus:border-orange-500"
                        >
                            <option value="all" className="bg-[#12121c]">All Food Types</option>
                            <option value="veg" className="bg-[#12121c]">Pure Veg 🟢</option>
                            <option value="non veg" className="bg-[#12121c]">Non-Veg 🔴</option>
                        </select>

                        {/* Rating */}
                        <select
                            value={minRating}
                            onChange={(e) => setMinRating(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/80 focus:outline-none focus:border-orange-500"
                        >
                            <option value="all" className="bg-[#12121c]">All Ratings</option>
                            <option value="4" className="bg-[#12121c]">4.0+ ★</option>
                            <option value="4.5" className="bg-[#12121c]">4.5+ ★ (Top Rated)</option>
                        </select>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/80 focus:outline-none focus:border-orange-500"
                        >
                            <option value="rating" className="bg-[#12121c]">Sort: Popularity / Rating</option>
                            <option value="price_asc" className="bg-[#12121c]">Price: Low to High</option>
                            <option value="price_desc" className="bg-[#12121c]">Price: High to Low</option>
                        </select>

                        {(foodType !== 'all' || selectedCategory !== 'all' || minRating !== 'all' || sortBy !== 'rating') && (
                            <button
                                onClick={handleClearFilters}
                                className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition"
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Results Section */}
                {loading ? (
                    <div className="text-center py-20 text-white/40">Searching delicious delicacies...</div>
                ) : activeTab === 'dishes' ? (
                    <div>
                        {items.length === 0 ? (
                            <div className="text-center py-20 bg-[#12121c] border border-white/5 rounded-3xl p-8">
                                <FaUtensils className="text-4xl text-white/10 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-white mb-1">No matching dishes found</h3>
                                <p className="text-xs text-white/40 mb-6">
                                    Try checking for spelling mistakes or explore our most loved categories.
                                </p>
                                <button
                                    onClick={handleClearFilters}
                                    className="px-5 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-semibold"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {items.map((item) => (
                                    <FoodCard key={item._id} data={item} />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        {shops.length === 0 ? (
                            <div className="text-center py-20 bg-[#12121c] border border-white/5 rounded-3xl p-8">
                                <FaStore className="text-4xl text-white/10 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-white mb-1">No matching restaurants found</h3>
                                <p className="text-xs text-white/40">Try searching for other restaurant names or cuisines.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {shops.map((shop) => (
                                    <ShopCard key={shop._id} data={shop} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}

export default SearchPage

