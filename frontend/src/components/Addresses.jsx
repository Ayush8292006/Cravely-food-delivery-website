import React, { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
// ✅ FIXED: Correct import path
import { serverUrl } from '../../config'
import { toast } from 'react-toastify'
import { ClipLoader } from 'react-spinners'
import { 
    FaPlus, FaTrash, FaCheck, FaHome, FaBriefcase, 
    FaMapMarkerAlt, FaBuilding, FaEdit, FaTimes,
    FaMotorcycle, FaShieldAlt, FaStar, FaRocket,
    FaSearch, FaClock, FaHeart,
    FaCrown, FaGem, FaAward, FaTruck, FaExclamationTriangle,
    FaSpinner
} from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

function Addresses() {
    const [addresses, setAddresses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({
        type: 'home',
        label: 'Home',
        text: '',
        latitude: '',
        longitude: ''
    })
    const [submitting, setSubmitting] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searching, setSearching] = useState(false)
    const [suggestions, setSuggestions] = useState([])
    const [selectedAddress, setSelectedAddress] = useState(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [formErrors, setFormErrors] = useState({})
    const [isLocating, setIsLocating] = useState(false)
    
    const apiKey = import.meta.env.VITE_GEOAPIKEY
    const searchTimeoutRef = useRef(null)

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 300)
        fetchAddresses()
    }, [])

    // ✅ Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [])

    const fetchAddresses = async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await axios.get(`${serverUrl}/api/user/addresses`, {
                withCredentials: true
            })
            setAddresses(result.data || [])
        } catch (error) {
            console.log('❌ Fetch addresses error:', error)
            const errorMsg = error.response?.data?.message || 'Failed to load addresses'
            setError(errorMsg)
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    // ✅ Debounced search
    const searchAddress = useCallback((query) => {
        // ✅ Clear existing timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }

        if (!query || query.length < 2) {
            setSuggestions([])
            return
        }

        // ✅ Check API key
        if (!apiKey) {
            toast.error('Search service not configured')
            return
        }

        setSearching(true)
        
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const result = await axios.get(
                    `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&format=json&apiKey=${apiKey}&limit=5`,
                    { withCredentials: false }
                )
                
                if (result.data.results && result.data.results.length > 0) {
                    const indianResults = result.data.results.filter(r => r.country_code === 'in')
                    setSuggestions(indianResults.length > 0 ? indianResults : result.data.results)
                } else {
                    setSuggestions([])
                }
                setSearching(false)
            } catch (error) {
                console.log("❌ Search error:", error)
                setSearching(false)
                setSuggestions([])
            }
        }, 300) // ✅ 300ms debounce
    }, [apiKey])

    // ✅ Get current location
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser')
            return
        }

        setIsLocating(true)
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                
                // ✅ Reverse geocode to get address
                try {
                    if (!apiKey) {
                        toast.error('Search service not configured')
                        setIsLocating(false)
                        return
                    }
                    
                    const result = await axios.get(
                        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`,
                        { withCredentials: false }
                    )
                    
                    const location = result?.data?.results?.[0]
                    if (location) {
                        const fullAddress = location.address_line1 + 
                            (location.address_line2 ? ', ' + location.address_line2 : '')
                        
                        setFormData({
                            ...formData,
                            text: fullAddress,
                            latitude: latitude,
                            longitude: longitude
                        })
                        setSearchQuery(fullAddress)
                        setSelectedAddress(location)
                        toast.success('📍 Current location detected!')
                    }
                } catch (error) {
                    console.log('❌ Reverse geocode error:', error)
                    toast.error('Failed to get address from location')
                }
                setIsLocating(false)
            },
            (error) => {
                console.log('❌ Geolocation error:', error.message)
                toast.error('Failed to get current location. Please search manually.')
                setIsLocating(false)
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }

    const selectAddress = (suggestion) => {
        const fullAddress = suggestion.address_line1 + (suggestion.address_line2 ? ', ' + suggestion.address_line2 : '')
        setSelectedAddress(suggestion)
        setFormData({
            ...formData,
            text: fullAddress,
            latitude: suggestion.lat,
            longitude: suggestion.lon
        })
        setSearchQuery(suggestion.address_line1)
        setSuggestions([])
        // ✅ Clear error for address field
        setFormErrors(prev => ({ ...prev, text: '' }))
    }

    // ✅ Validate form
    const validateForm = () => {
        const errors = {}
        if (!formData.text || !formData.text.trim()) {
            errors.text = 'Please enter or select an address'
        }
        if (!formData.latitude || !formData.longitude) {
            errors.location = 'Please select a valid location from search'
        }
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleAddAddress = async () => {
        if (!validateForm()) {
            toast.error('Please fill all required fields correctly')
            return
        }

        setSubmitting(true)
        try {
            const result = await axios.post(`${serverUrl}/api/user/address`, formData, {
                withCredentials: true
            })
            setAddresses(result.data)
            resetForm()
            toast.success('Address added successfully! 🎉')
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to add address'
            toast.error(errorMsg)
        } finally {
            setSubmitting(false)
        }
    }

    const handleUpdateAddress = async () => {
        if (!validateForm()) {
            toast.error('Please fill all required fields correctly')
            return
        }

        setSubmitting(true)
        try {
            // ✅ Delete old and create new (or use PUT)
            await axios.delete(`${serverUrl}/api/user/address/${editingId}`, {
                withCredentials: true
            })
            const result = await axios.post(`${serverUrl}/api/user/address`, formData, {
                withCredentials: true
            })
            setAddresses(result.data)
            resetForm()
            toast.success('Address updated successfully! ✏️')
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to update address'
            toast.error(errorMsg)
        } finally {
            setSubmitting(false)
        }
    }

    const handleSetDefault = async (addressId) => {
        try {
            const result = await axios.put(
                `${serverUrl}/api/user/address/${addressId}/default`,
                {},
                { withCredentials: true }
            )
            setAddresses(result.data)
            toast.success('Default address updated! 📍')
        } catch (error) {
            toast.error('Failed to set default address')
        }
    }

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return

        try {
            const result = await axios.delete(
                `${serverUrl}/api/user/address/${addressId}`,
                { withCredentials: true }
            )
            setAddresses(result.data)
            toast.success('Address deleted! 🗑️')
        } catch (error) {
            toast.error('Failed to delete address')
        }
    }

    const resetForm = () => {
        setShowForm(false)
        setEditingId(null)
        setSearchQuery('')
        setSuggestions([])
        setSelectedAddress(null)
        setFormErrors({})
        setFormData({ type: 'home', label: 'Home', text: '', latitude: '', longitude: '' })
    }

    const getTypeIcon = (type, size = 20) => {
        switch(type) {
            case 'home': return <FaHome size={size} className='text-blue-400' />
            case 'office': return <FaBriefcase size={size} className='text-purple-400' />
            default: return <FaMapMarkerAlt size={size} className='text-green-400' />
        }
    }

    const getTypeEmoji = (type) => {
        switch(type) {
            case 'home': return '🏠'
            case 'office': return '💼'
            default: return '📍'
        }
    }

    const fadeUp = `transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`

    // ✅ Loading State
    if (loading) {
        return (
            <div className='flex flex-col items-center justify-center py-12'>
                <div className='relative'>
                    <ClipLoader size={40} color="#ff2d55" />
                    <div className='absolute inset-0 animate-ping rounded-full border-2 border-[#ff2d55]/20' />
                </div>
                <p className='mt-4 text-white/40 text-sm animate-pulse'>Loading addresses...</p>
            </div>
        )
    }

    // ✅ Error State
    if (error) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='text-center py-12'
            >
                <div className='w-20 h-20 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4'>
                    <FaExclamationTriangle className='text-red-400 text-4xl' />
                </div>
                <h3 className='text-white font-semibold text-lg'>Failed to Load Addresses</h3>
                <p className='text-white/40 text-sm mt-1'>{error}</p>
                <button 
                    onClick={fetchAddresses}
                    className='mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white font-medium'
                >
                    Try Again
                </button>
            </motion.div>
        )
    }

    return (
        <div className='space-y-4'>
            {/* ✅ Empty State */}
            {addresses.length === 0 && !showForm && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className='text-center py-12 glass-premium rounded-xl border border-white/5'
                >
                    <FaMapMarkerAlt className='text-white/10 text-5xl mx-auto mb-3' />
                    <h3 className='text-white font-semibold text-lg'>No Addresses Saved</h3>
                    <p className='text-white/40 text-sm'>Add your first address to get started</p>
                </motion.div>
            )}

            {/* ✅ Address Cards */}
            {addresses.length > 0 && (
                <div className='space-y-3'>
                    <AnimatePresence>
                        {addresses.map((addr, index) => (
                            <motion.div 
                                key={addr._id} 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                className={`glass-premium rounded-xl border p-4 transition-all duration-300 hover:scale-[1.01] ${
                                    addr.isDefault 
                                        ? 'border-[#ff2d55]/40 bg-gradient-to-r from-[#ff2d55]/10 to-[#ff6b35]/10' 
                                        : 'border-white/10 hover:border-[#ff2d55]/20'
                                }`}
                            >
                                <div className='flex items-start gap-3'>
                                    <div className='mt-0.5'>
                                        {getTypeIcon(addr.type, 22)}
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <div className='flex items-center gap-2 flex-wrap'>
                                            <span className='font-semibold text-white'>{addr.label}</span>
                                            {addr.isDefault && (
                                                <motion.span 
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className='text-[8px] sm:text-[10px] bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white px-2 py-0.5 rounded-full font-medium shadow-lg shadow-[#ff2d55]/20'
                                                >
                                                    ★ Default
                                                </motion.span>
                                            )}
                                            <span className='text-xs text-white/30 ml-auto'>{getTypeEmoji(addr.type)}</span>
                                        </div>
                                        <p className='text-sm text-white/60 mt-0.5 break-words'>{addr.text}</p>
                                        <div className='flex items-center gap-4 mt-2 flex-wrap'>
                                            {!addr.isDefault && (
                                                <motion.button 
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className='text-xs text-[#ff6b35] font-medium hover:underline flex items-center gap-1'
                                                    onClick={() => handleSetDefault(addr._id)}
                                                >
                                                    <FaCheck size={10} /> Set as Default
                                                </motion.button>
                                            )}
                                            <motion.button 
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className='text-xs text-white/40 hover:text-[#ff6b35] flex items-center gap-1 transition-all duration-300'
                                                onClick={() => {
                                                    setEditingId(addr._id)
                                                    setFormData({
                                                        type: addr.type,
                                                        label: addr.label,
                                                        text: addr.text,
                                                        latitude: addr.latitude,
                                                        longitude: addr.longitude
                                                    })
                                                    setSearchQuery(addr.text)
                                                    setFormErrors({})
                                                    setShowForm(true)
                                                }}
                                            >
                                                <FaEdit size={10} /> Edit
                                            </motion.button>
                                            <motion.button 
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className='text-xs text-white/40 hover:text-red-400 flex items-center gap-1 transition-all duration-300'
                                                onClick={() => handleDeleteAddress(addr._id)}
                                            >
                                                <FaTrash size={10} /> Remove
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* ✅ Add Address Button */}
            {!showForm ? (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className='w-full glass-premium border-2 border-dashed border-white/10 rounded-xl py-4 hover:border-[#ff2d55]/40 hover:bg-[#ff2d55]/5 transition-all duration-300 flex items-center justify-center gap-2 text-white/50 hover:text-white group'
                    onClick={() => {
                        setShowForm(true)
                        setFormErrors({})
                    }}
                >
                    <FaPlus className='text-[#ff6b35] group-hover:rotate-90 transition-transform duration-300' /> 
                    <span>Add New Address</span>
                </motion.button>
            ) : (
                // ✅ Add Address Form
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className='glass-premium rounded-xl border border-[#ff2d55]/30 p-5 shadow-2xl shadow-[#ff2d55]/10'
                >
                    <div className='flex items-center justify-between mb-4'>
                        <h4 className='font-semibold text-white flex items-center gap-2'>
                            <span className='text-[#ff6b35]'>{editingId ? '✏️' : '📍'}</span>
                            {editingId ? 'Edit Address' : 'Add New Address'}
                        </h4>
                        <motion.button 
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={resetForm} 
                            className='text-white/30 hover:text-white transition-all duration-300'
                        >
                            <FaTimes size={18} />
                        </motion.button>
                    </div>
                    
                    {/* ✅ Address Type Selection */}
                    <div className='grid grid-cols-3 gap-2 mb-4'>
                        {[
                            { type: 'home', label: 'Home', icon: '🏠' },
                            { type: 'office', label: 'Office', icon: '💼' },
                            { type: 'other', label: 'Other', icon: '📍' }
                        ].map((option) => (
                            <motion.button
                                key={option.type}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${
                                    formData.type === option.type 
                                        ? 'bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white shadow-lg shadow-[#ff2d55]/20' 
                                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                                }`}
                                onClick={() => setFormData({ ...formData, type: option.type, label: option.label })}
                            >
                                {option.icon} {option.label}
                            </motion.button>
                        ))}
                    </div>

                    {/* ✅ Search Address */}
                    <div className='relative mb-3'>
                        <div className='relative'>
                            <input
                                type="text"
                                placeholder="Search for your area, street or landmark..."
                                className={`w-full bg-[#18181D] border rounded-xl px-4 py-3 pl-11 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/50 transition-all duration-300 text-sm ${
                                    formErrors.text ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10'
                                }`}
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value)
                                    searchAddress(e.target.value)
                                    if (formErrors.text) {
                                        setFormErrors(prev => ({ ...prev, text: '' }))
                                    }
                                }}
                            />
                            <FaSearch className='absolute left-3 top-3.5 text-white/30' size={16} />
                            {searching && (
                                <div className='absolute right-3 top-3'>
                                    <FaSpinner className='animate-spin text-[#ff2d55]' size={16} />
                                </div>
                            )}
                            
                            {/* ✅ Current Location Button */}
                            <button
                                onClick={getCurrentLocation}
                                disabled={isLocating}
                                className='absolute right-12 top-2.5 text-white/30 hover:text-[#ff6b35] transition-all duration-300 disabled:opacity-50'
                                title="Use current location"
                            >
                                {isLocating ? (
                                    <FaSpinner className='animate-spin' size={18} />
                                ) : (
                                    <FaMapMarkerAlt size={18} />
                                )}
                            </button>
                        </div>
                        
                        {formErrors.text && (
                            <p className='text-red-400 text-xs mt-1'>{formErrors.text}</p>
                        )}
                        {formErrors.location && (
                            <p className='text-red-400 text-xs mt-1'>{formErrors.location}</p>
                        )}
                        
                        {/* ✅ Suggestions Dropdown */}
                        <AnimatePresence>
                            {suggestions.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className='absolute z-10 w-full bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl mt-1 max-h-52 overflow-y-auto'
                                >
                                    {suggestions.map((suggestion, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className='px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 transition flex items-start gap-3'
                                            onClick={() => selectAddress(suggestion)}
                                        >
                                            <FaMapMarkerAlt className='text-[#ff6b35] mt-0.5' size={14} />
                                            <div>
                                                <p className='text-sm font-medium text-white'>{suggestion.address_line1}</p>
                                                <p className='text-xs text-white/40'>{suggestion.address_line2}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ✅ Selected Address Preview */}
                    {formData.text && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className='bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-3 flex items-start gap-2'
                        >
                            <FaCheck className='text-green-400 mt-0.5' size={14} />
                            <div className='flex-1 min-w-0'>
                                <p className='text-xs text-green-400 font-medium'>Selected Address</p>
                                <p className='text-sm text-white/70 break-words'>{formData.text}</p>
                            </div>
                        </motion.div>
                    )}

                    <div className='flex gap-3'>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            className='flex-1 bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-[#ff2d55]/20 disabled:opacity-50 transition-all duration-300 text-sm'
                            onClick={editingId ? handleUpdateAddress : handleAddAddress}
                            disabled={submitting || !formData.text}
                        >
                            {submitting ? (
                                <ClipLoader size={18} color='white' />
                            ) : (
                                editingId ? 'Update Address' : 'Save Address'
                            )}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            className='px-6 py-3 bg-white/5 text-white/50 rounded-xl font-medium hover:bg-white/10 transition-all duration-300 text-sm'
                            onClick={resetForm}
                        >
                            Cancel
                        </motion.button>
                    </div>
                </motion.div>
            )}

            <style jsx>{`
                .glass-premium {
                    background: rgba(255, 255, 255, 0.04);
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
                .overflow-y-auto::-webkit-scrollbar {
                    width: 4px;
                }
                .overflow-y-auto::-webkit-scrollbar-track {
                    background: transparent;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: rgba(255, 45, 85, 0.3);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    )
}

export default Addresses