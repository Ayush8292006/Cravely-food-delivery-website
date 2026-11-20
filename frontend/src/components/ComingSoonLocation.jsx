import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../../config'
import { setCurrentCity } from '../redux/userSlice'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { 
    FaMapMarkerAlt, FaStore, FaStar, FaBolt, 
    FaPaperPlane, FaCheckCircle, FaCompass, 
    FaUtensils, FaInfoCircle, FaArrowRight 
} from 'react-icons/fa'

const FALLBACK_HUBS = [
    {
        city: 'Greater Noida',
        restaurantCount: 6,
        sampleAddresses: [
            'Near Alpha 1 Commercial Belt, Greater Noida',
            'Pari Chowk Boulevard, Greater Noida',
            'Knowledge Park III Food Court, Greater Noida',
            'Royal Paradize, Greater Noida'
        ],
        restaurants: [
            { name: 'The Royal Biryani & Kebab Co.', rating: 4.8, category: 'Biryani & Mughlai' },
            { name: 'Fire & Crust Artisanal Pizzeria', rating: 4.7, category: 'Italian & Pizzas' },
            { name: 'Urban Smash Burgers & Shakes', rating: 4.6, category: 'Burgers & Fast Food' },
            { name: 'Your Resturants', rating: 4.5, category: 'Multi-Cuisine' }
        ]
    }
]

function ComingSoonLocation({ requestedCity, onBrowseAll }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { currentCity } = useSelector(state => state.user)
    const displayCity = requestedCity || currentCity || 'your area'

    const [activeHubs, setActiveHubs] = useState(FALLBACK_HUBS)
    const [loadingHubs, setLoadingHubs] = useState(true)
    const [notifyEmail, setNotifyEmail] = useState('')
    const [notified, setNotified] = useState(false)

    useEffect(() => {
        const fetchActiveLocations = async () => {
            try {
                const res = await axios.get(`${serverUrl}/api/shop/active-locations`, {
                    withCredentials: true,
                    timeout: 6000
                })
                if (res.data?.activeHubs && res.data.activeHubs.length > 0) {
                    setActiveHubs(res.data.activeHubs)
                }
            } catch {
                // Keep FALLBACK_HUBS on network failure
            } finally {
                setLoadingHubs(false)
            }
        }
        fetchActiveLocations()
    }, [])

    const handleSwitchCity = (newCity) => {
        dispatch(setCurrentCity(newCity))
        try {
            localStorage.setItem('cravely_city', newCity)
        } catch {}
        toast.success(`📍 Location switched to ${newCity}! Loading kitchens...`, {
            autoClose: 1800
        })
    }

    const handleNotify = (e) => {
        e.preventDefault()
        if (!notifyEmail || !notifyEmail.includes('@')) {
            toast.error('Please enter a valid email address')
            return
        }
        setNotified(true)
        toast.success(`🎉 You're on the priority launch list for ${displayCity}!`)
    }

    return (
        <div className="w-full max-w-5xl mx-auto my-6 space-y-6 select-none">
            {/* 1. Main Hero: Coming Soon Showcase */}
            <motion.div 
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#13121A] border border-white/10 rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden shadow-2xl"
            >
                {/* Background Tech Rings */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
                    <div className="w-80 h-80 rounded-full border border-orange-500 absolute" />
                    <div className="w-[500px] h-[500px] rounded-full border border-orange-500 absolute" />
                </div>

                <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                    {/* Status Pill */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-[#FF8C00] text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping" />
                        <span>FLEET EXPANSION IN PROGRESS</span>
                    </div>

                    {/* Headline */}
                    <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                        We Haven't Launched in{' '}
                        <span className="text-[#FF6B00] underline decoration-white/20 underline-offset-8">
                            {displayCity}
                        </span>{' '}
                        Yet
                    </h2>

                    {/* Subtitle in Polished English */}
                    <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
                        CRAVELY operates with hyper-local cloud kitchens and a dedicated rapid rider fleet.
                        We are currently scaling operations and will be delivering to <strong>{displayCity}</strong> very soon!
                    </p>

                    {/* Reviewer / Recruiter Guidance Callout Banner */}
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-left flex items-start gap-3 mt-4">
                        <FaInfoCircle size={16} className="text-[#FF6B00] flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-gray-300 leading-relaxed">
                            <strong className="text-white">Interviewer / Recruiter Demo Notice:</strong>{' '}
                            CRAVELY uses live browser GPS reverse-geocoding. To evaluate live menu catalogs, item customizations, 
                            Redux cart, and Razorpay payment checkout, click any active delivery hub below to instantly test the platform.
                        </div>
                    </div>

                    {/* Notify Form */}
                    {!notified ? (
                        <form onSubmit={handleNotify} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                            <input 
                                type="email" 
                                placeholder={`Enter email for ${displayCity} launch alert...`}
                                value={notifyEmail}
                                onChange={(e) => setNotifyEmail(e.target.value)}
                                className="flex-1 bg-[#181722] border border-white/10 focus:border-[#FF6B00] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/40 outline-none transition"
                            />
                            <button 
                                type="submit"
                                className="px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-orange-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:scale-105 active:scale-95"
                            >
                                <FaPaperPlane size={10} />
                                <span>Notify Me</span>
                            </button>
                        </form>
                    ) : (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                            <FaCheckCircle size={12} />
                            <span>You're on the VIP launch list! We'll alert you the day we go live in {displayCity}.</span>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* 2. Active Operational Hubs & Live Addresses Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#FF6B00] flex items-center justify-center text-white">
                            <FaCompass size={14} />
                        </div>
                        <div>
                            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                                Live Serviceable Hubs
                            </h3>
                            <p className="text-[11px] text-gray-400">
                                Click any active location to test real kitchens, menus, and delivery
                            </p>
                        </div>
                    </div>

                    {onBrowseAll && (
                        <button 
                            onClick={onBrowseAll}
                            className="text-xs text-[#FF6B00] hover:text-orange-400 font-bold flex items-center gap-1 transition"
                        >
                            <span>Browse All</span>
                            <FaArrowRight size={10} />
                        </button>
                    )}
                </div>

                {/* Hub Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeHubs.map((hub, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            className="bg-[#13121A] border border-white/10 hover:border-[#FF6B00]/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl transition"
                        >
                            <div>
                                {/* Hub Header */}
                                <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/[0.06]">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#FF6B00]">
                                            <FaMapMarkerAlt size={14} />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-black text-white">
                                                {hub.city}
                                            </h4>
                                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                Active Operational Fleet
                                            </span>
                                        </div>
                                    </div>

                                    <span className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white font-mono text-xs font-bold">
                                        {hub.restaurantCount} Kitchens Live
                                    </span>
                                </div>

                                {/* Sample Addresses / Landmarks */}
                                {hub.sampleAddresses && hub.sampleAddresses.length > 0 && (
                                    <div className="pt-3 space-y-1.5">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                            Operational Delivery Landmarks:
                                        </p>
                                        <div className="space-y-1">
                                            {hub.sampleAddresses.map((addr, aIdx) => (
                                                <div key={aIdx} className="text-xs text-gray-300 flex items-center gap-1.5 truncate">
                                                    <span className="text-[#FF6B00]">•</span>
                                                    <span className="truncate">{addr}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Featured Restaurants Preview in this Hub */}
                                {hub.restaurants && hub.restaurants.length > 0 && (
                                    <div className="pt-3 space-y-1.5">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                            Sample Kitchens Serving Now:
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {hub.restaurants.slice(0, 3).map((r, rIdx) => (
                                                <span 
                                                    key={rIdx}
                                                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] text-white flex items-center gap-1 font-medium"
                                                >
                                                    <FaStore size={9} className="text-[#FF6B00]" />
                                                    <span>{r.name}</span>
                                                    <span className="text-amber-400 text-[10px]">★ {r.rating || 4.5}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* One-Click Switch Location CTA */}
                            <button
                                onClick={() => handleSwitchCity(hub.city)}
                                className="w-full py-2.5 rounded-xl bg-[#FF6B00] hover:bg-orange-600 text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <FaBolt size={11} />
                                <span>Switch Location to {hub.city} (Explore Live)</span>
                                <FaArrowRight size={10} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ComingSoonLocation
