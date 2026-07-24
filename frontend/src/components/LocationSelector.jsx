import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { FaLocationDot, FaChevronDown } from "react-icons/fa6"
import { FaSearch, FaTimes, FaCheck, FaHome, FaBriefcase, FaMapMarkerAlt } from "react-icons/fa"
import { setCurrentCity, setCurrentState, setCurrentAddress, setSavedAddresses, removeSavedAddress, setDefaultAddress } from '../redux/userSlice'
import { setAddress, setLocation } from '../redux/mapSlice'
import { toast } from 'react-toastify'
import { serverUrl } from '../App'
import { ClipLoader } from 'react-spinners'

function LocationSelector() {
    const dispatch = useDispatch()
    const { currentCity, savedAddresses, userData } = useSelector(state => state.user)
    const [showDropdown, setShowDropdown] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [searching, setSearching] = useState(false)
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [addressForm, setAddressForm] = useState({ type: 'home', label: 'Home', text: '', latitude: '', longitude: '' })
    const [submitting, setSubmitting] = useState(false)
    const [gettingLocation, setGettingLocation] = useState(false)
    const dropdownRef = useRef(null)
    const apiKey = import.meta.env.VITE_GEOAPIKEY

    useEffect(() => {
        if (userData) {
            fetchSavedAddresses()
        }
    }, [userData])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false)
                setShowAddressForm(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchSavedAddresses = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/user/addresses`, {
                withCredentials: true
            })
            dispatch(setSavedAddresses(result.data))
        } catch (error) {
            console.log('Error fetching addresses:', error)
        }
    }

    const searchAddress = async (query) => {
        if (!query || query.length < 2) {
            setSuggestions([])
            return
        }

        setSearching(true)
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
            console.log('Search error:', error)
            setSearching(false)
        }
    }

    const selectLocation = (suggestion) => {
        const city = suggestion.city || suggestion.state_district || suggestion.state || 'Unknown'
        const state = suggestion.state || ''
        const fullAddress = suggestion.address_line1 + (suggestion.address_line2 ? ', ' + suggestion.address_line2 : '')

        // ✅ Update Redux state
        dispatch(setCurrentCity(city))
        dispatch(setCurrentState(state))
        dispatch(setCurrentAddress(fullAddress))
        dispatch(setAddress(fullAddress))
        dispatch(setLocation({ lat: suggestion.lat, lon: suggestion.lon }))

        setSearchQuery('')
        setSuggestions([])
        setShowDropdown(false)
        toast.success(`📍 ${city}`)

        // ✅ Auto-save address to history
        if (userData) {
            autoSaveAddress(suggestion, city)
        }
    }

    const autoSaveAddress = async (suggestion, city) => {
        try {
            const fullAddress = suggestion.address_line1 + (suggestion.address_line2 ? ', ' + suggestion.address_line2 : '')
            await axios.post(`${serverUrl}/api/user/address`, {
                type: 'home',
                label: city,
                text: fullAddress,
                latitude: suggestion.lat,
                longitude: suggestion.lon
            }, { withCredentials: true })
            fetchSavedAddresses()
        } catch (error) {
            console.log('Auto-save error:', error)
        }
    }

    const handleSaveAddress = async () => {
        if (!addressForm.text || !addressForm.latitude || !addressForm.longitude) {
            toast.error('Please select a valid address')
            return
        }

        setSubmitting(true)
        try {
            await axios.post(`${serverUrl}/api/user/address`, addressForm, {
                withCredentials: true
            })
            fetchSavedAddresses()
            setShowAddressForm(false)
            setAddressForm({ type: 'home', label: 'Home', text: '', latitude: '', longitude: '' })
            toast.success('Address saved!')
            setSubmitting(false)
        } catch (error) {
            toast.error('Failed to save address')
            setSubmitting(false)
        }
    }

    const handleDeleteAddress = async (addressId) => {
        if (!confirm('Delete this address?')) return
        try {
            await axios.delete(`${serverUrl}/api/user/address/${addressId}`, {
                withCredentials: true
            })
            fetchSavedAddresses()
            toast.success('Address deleted!')
        } catch (error) {
            toast.error('Failed to delete address')
        }
    }

    const handleSetDefault = async (addressId) => {
        try {
            await axios.put(`${serverUrl}/api/user/address/${addressId}/default`, {}, {
                withCredentials: true
            })
            fetchSavedAddresses()
            toast.success('Default address updated!')
        } catch (error) {
            toast.error('Failed to set default address')
        }
    }

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation not supported in this browser')
            return
        }

        setGettingLocation(true)
        toast.info('Getting your location...')

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                
                try {
                    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
                    
                    const result = await axios.get(url, { withCredentials: false })
                    
                    if (result.data.results && result.data.results.length > 0) {
                        const location = result.data.results[0]
                        selectLocation(location)
                        toast.success(`📍 Location detected: ${location.city || 'Your area'}`)
                    } else {
                        toast.error('No location found')
                    }
                } catch (error) {
                    toast.error('Failed to get location. Please search manually.')
                }
                setGettingLocation(false)
            },
            (error) => {
                setGettingLocation(false)
                switch(error.code) {
                    case 1:
                        toast.error('Location permission denied. Please enable location in browser settings.')
                        break
                    case 2:
                        toast.error('Location unavailable. Please search manually.')
                        break
                    case 3:
                        toast.error('Location request timed out. Please try again.')
                        break
                    default:
                        toast.error('Failed to get location')
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        )
    }

    return (
        <div className='relative' ref={dropdownRef}>
            {/* ✅ Location Button - Premium Style */}
            <div 
                className='flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer hover:scale-105'
                onClick={() => setShowDropdown(!showDropdown)}
            >
                <FaLocationDot className='text-[#ff6b35]' size={16} />
                <span className='text-sm font-medium text-white max-w-[120px] truncate'>
                    {currentCity || 'Select Location'}
                </span>
                <FaChevronDown className={`text-white/40 text-xs transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
            </div>

            {/* ✅ Dropdown - Premium Glassmorphism */}
            {showDropdown && (
                <div className='absolute top-full left-0 mt-2 w-[320px] bg-[#1a1a2e]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/50 z-[9999] overflow-hidden animate-fade-in'>
                    
                    {/* ✅ Search Header */}
                    <div className='p-3 border-b border-white/10'>
                        <div className='relative'>
                            <input
                                type="text"
                                placeholder="Search for area, street..."
                                className='w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 pl-9 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff6b35]/50 transition-all duration-300'
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value)
                                    searchAddress(e.target.value)
                                }}
                            />
                            <FaSearch className='absolute left-3 top-3 text-white/30' size={14} />
                            {searching && (
                                <div className='absolute right-3 top-2.5'>
                                    <ClipLoader size={16} color="#ff6b35" />
                                </div>
                            )}
                        </div>
                        
                        {/* ✅ Suggestions */}
                        {suggestions.length > 0 && (
                            <div className='mt-2 max-h-40 overflow-y-auto'>
                                {suggestions.map((s, i) => (
                                    <div
                                        key={i}
                                        className='px-3 py-2 hover:bg-white/5 cursor-pointer rounded-xl text-sm flex items-start gap-2 transition-all duration-200'
                                        onClick={() => selectLocation(s)}
                                    >
                                        <FaMapMarkerAlt className='text-[#ff6b35] mt-0.5' size={12} />
                                        <div>
                                            <p className='font-medium text-white'>{s.address_line1}</p>
                                            <p className='text-xs text-white/40'>{s.address_line2}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ✅ Current Location */}
                    <div 
                        className={`p-3 border-b border-white/10 hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-all duration-200 ${gettingLocation ? 'opacity-50' : ''}`}
                        onClick={!gettingLocation ? getCurrentLocation : undefined}
                    >
                        <div className='w-8 h-8 rounded-full bg-[#ff2d55]/20 flex items-center justify-center'>
                            {gettingLocation ? (
                                <ClipLoader size={14} color="#ff2d55" />
                            ) : (
                                <FaLocationDot className='text-[#ff2d55]' size={14} />
                            )}
                        </div>
                        <div>
                            <p className='text-sm font-medium text-white'>
                                {gettingLocation ? 'Detecting...' : '📍 Use Current Location'}
                            </p>
                            <p className='text-xs text-white/40'>Detect your current location</p>
                        </div>
                    </div>

                    {/* ✅ Saved Addresses - History */}
                    {savedAddresses.length > 0 && (
                        <div className='p-2 border-b border-white/10'>
                            <p className='text-xs font-semibold text-white/40 uppercase px-2 py-1 tracking-wider'>Saved Addresses</p>
                            {savedAddresses.map((addr) => (
                                <div 
                                    key={addr._id} 
                                    className='flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-xl cursor-pointer transition-all duration-200 group'
                                    onClick={() => {
                                        dispatch(setCurrentCity(addr.label || 'Saved'))
                                        dispatch(setCurrentAddress(addr.text))
                                        dispatch(setLocation({ lat: addr.latitude, lon: addr.longitude }))
                                        setShowDropdown(false)
                                        toast.success(`📍 ${addr.label}`)
                                    }}
                                >
                                    <div className='flex items-center gap-3 flex-1 min-w-0'>
                                        <div className='w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0'>
                                            {addr.type === 'home' ? <FaHome size={14} className='text-blue-400' /> :
                                             addr.type === 'office' ? <FaBriefcase size={14} className='text-purple-400' /> :
                                             <FaMapMarkerAlt size={14} className='text-green-400' />}
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <div className='flex items-center gap-2'>
                                                <span className='text-sm font-medium text-white truncate'>{addr.label}</span>
                                                {addr.isDefault && (
                                                    <span className='text-[9px] bg-[#ff2d55] text-white px-1.5 py-0.5 rounded-full flex-shrink-0'>Default</span>
                                                )}
                                            </div>
                                            <p className='text-xs text-white/40 truncate'>{addr.text}</p>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                                        {!addr.isDefault && (
                                            <button 
                                                className='text-white/30 hover:text-green-400 p-1 rounded-full hover:bg-green-500/10 transition-all duration-200'
                                                onClick={(e) => { e.stopPropagation(); handleSetDefault(addr._id) }}
                                            >
                                                <FaCheck size={12} />
                                            </button>
                                        )}
                                        <button 
                                            className='text-white/30 hover:text-red-400 p-1 rounded-full hover:bg-red-500/10 transition-all duration-200'
                                            onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr._id) }}
                                        >
                                            <FaTimes size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ✅ Add Address */}
                    <div className='p-2'>
                        {!showAddressForm ? (
                            <button 
                                className='w-full text-sm text-[#ff6b35] font-medium text-center py-2 hover:bg-white/5 rounded-xl transition-all duration-200'
                                onClick={() => setShowAddressForm(true)}
                            >
                                + Add New Address
                            </button>
                        ) : (
                            <div className='p-2 space-y-2 bg-white/5 rounded-xl'>
                                <div className='grid grid-cols-2 gap-2'>
                                    <select
                                        className='bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-[#ff6b35]/50 transition-all duration-300'
                                        value={addressForm.type}
                                        onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value, label: e.target.value === 'home' ? 'Home' : e.target.value === 'office' ? 'Office' : 'Other' })}
                                    >
                                        <option value="home" className='bg-[#1a1a2e]'>🏠 Home</option>
                                        <option value="office" className='bg-[#1a1a2e]'>💼 Office</option>
                                        <option value="other" className='bg-[#1a1a2e]'>📍 Other</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Label"
                                        className='bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff6b35]/50 transition-all duration-300'
                                        value={addressForm.label}
                                        onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search address..."
                                    className='w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff6b35]/50 transition-all duration-300'
                                    value={addressForm.text}
                                    onChange={(e) => {
                                        setAddressForm({ ...addressForm, text: e.target.value })
                                        searchAddress(e.target.value)
                                    }}
                                />
                                {suggestions.length > 0 && (
                                    <div className='max-h-32 overflow-y-auto border border-white/10 rounded-lg bg-[#1a1a2e]'>
                                        {suggestions.map((s, i) => (
                                            <div key={i} className='px-2 py-1 hover:bg-white/5 cursor-pointer text-sm text-white' onClick={() => {
                                                setAddressForm({
                                                    ...addressForm,
                                                    text: s.address_line1 + (s.address_line2 ? ', ' + s.address_line2 : ''),
                                                    latitude: s.lat,
                                                    longitude: s.lon
                                                })
                                                setSuggestions([])
                                            }}>
                                                {s.address_line1}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className='flex gap-2'>
                                    <button 
                                        className='flex-1 bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white py-1.5 rounded-lg text-sm font-medium hover:scale-105 transition-all duration-300 disabled:opacity-50'
                                        onClick={handleSaveAddress}
                                        disabled={submitting || !addressForm.text}
                                    >
                                        {submitting ? <ClipLoader size={14} color='white' /> : 'Save Address'}
                                    </button>
                                    <button 
                                        className='px-3 bg-white/5 text-white/60 py-1.5 rounded-lg text-sm hover:bg-white/10 transition-all duration-300'
                                        onClick={() => {
                                            setShowAddressForm(false)
                                            setAddressForm({ type: 'home', label: 'Home', text: '', latitude: '', longitude: '' })
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-8px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out forwards;
                }
                .overflow-y-auto::-webkit-scrollbar {
                    width: 4px;
                }
                .overflow-y-auto::-webkit-scrollbar-track {
                    background: transparent;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: rgba(255, 107, 53, 0.3);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    )
}

export default LocationSelector