import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../../config'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { FaTag, FaGem, FaCopy, FaCheck, FaCoins, FaFire, FaPercent, FaArrowRight } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'

function Offers() {
    const { cartItems, totalAmount } = useSelector(state => state.user)
    const [coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(true)
    const [copiedCode, setCopiedCode] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetchCoupons()
    }, [])

    const fetchCoupons = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`${serverUrl}/api/coupon/active`)
            setCoupons(res.data || [])
        } catch (error) {
            console.log('Error fetching coupons:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code)
        setCopiedCode(code)
        toast.success(`Coupon "${code}" copied to clipboard! 📋`)
        setTimeout(() => setCopiedCode(null), 3000)
    }

    const handleApplyAndGo = (code) => {
        handleCopy(code)
        if (cartItems && cartItems.length > 0) {
            navigate('/cart')
        } else {
            toast.info('Browse delicious dishes and apply this code during checkout!')
            navigate('/restaurants')
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col font-sans">
            <Nav />

            <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
                {/* Hero Header */}
                <div className="relative rounded-3xl bg-gradient-to-r from-orange-600/30 via-red-600/20 to-amber-500/20 border border-white/10 p-8 md:p-12 mb-10 overflow-hidden shadow-2xl">
                    <div className="max-w-2xl relative z-10">
                        <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase tracking-wider mb-4 inline-block">
                            Exclusive Deals & Discounts
                        </span>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
                            Save Big on Every <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">Delicious Craving</span>.
                        </h1>
                        <p className="text-white/70 text-sm md:text-base leading-relaxed">
                            Discover verified coupons, free delivery vouchers, and unlock Cravely Rewards every time you feast.
                        </p>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-4">
                        <div className="px-5 py-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center gap-3">
                            <FaCoins className="text-amber-400 text-xl" />
                            <div>
                                <div className="text-xs text-white/50">Cravely Coins</div>
                                <div className="text-sm font-bold text-white">Earn 10% on every order</div>
                            </div>
                        </div>
                        <div className="px-5 py-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center gap-3">
                            <FaPercent className="text-orange-400 text-xl" />
                            <div>
                                <div className="text-xs text-white/50">Max Savings</div>
                                <div className="text-sm font-bold text-white">Up to 50% OFF</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coupons Section */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <FaTag className="text-orange-500" /> Active Promo Codes
                            </h2>
                            <p className="text-xs text-white/50 mt-1">Copy code or click apply to redeem on your cart.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-full text-center py-16 text-white/40">Loading available offers...</div>
                        ) : coupons.length === 0 ? (
                            <div className="col-span-full text-center py-16 text-white/40 bg-[#12121c] rounded-3xl border border-white/5">
                                No active coupons available at the moment.
                            </div>
                        ) : (
                            coupons.map((coupon) => {
                                const isCopied = copiedCode === coupon.code
                                return (
                                    <div
                                        key={coupon._id}
                                        className="bg-[#12121c] border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-orange-500/50 transition duration-300 shadow-2xl flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase tracking-wider">
                                                    {coupon.badge || 'PROMO'}
                                                </span>
                                                <button
                                                    onClick={() => handleCopy(coupon.code)}
                                                    className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition"
                                                >
                                                    {isCopied ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
                                                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                                                </button>
                                            </div>

                                            <div className="bg-white/5 border border-dashed border-white/20 rounded-2xl p-3.5 mb-4 flex items-center justify-between">
                                                <span className="font-mono text-lg font-extrabold text-white tracking-widest">
                                                    {coupon.code}
                                                </span>
                                                <span className="text-xs font-bold text-orange-400">
                                                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                                                </span>
                                            </div>

                                            <h3 className="font-bold text-white text-base mb-1">{coupon.title}</h3>
                                            <p className="text-xs text-white/50 leading-relaxed mb-4">{coupon.description || 'Valid on all qualifying food orders.'}</p>
                                        </div>

                                        <div>
                                            <div className="text-[11px] text-white/40 pt-3 border-t border-white/5 mb-4 space-y-1">
                                                <div>Min order: <strong className="text-white/80">₹{coupon.minOrderAmount || 0}</strong></div>
                                                {coupon.maxDiscount ? <div>Maximum discount: <strong className="text-white/80">₹{coupon.maxDiscount}</strong></div> : null}
                                            </div>

                                            <button
                                                onClick={() => handleApplyAndGo(coupon.code)}
                                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition"
                                            >
                                                <span>Apply to Cart</span>
                                                <FaArrowRight size={10} />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Loyalty & Rewards Banner */}
                <div className="bg-gradient-to-r from-[#181824] to-[#12121c] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-3xl shadow-lg shadow-amber-500/10">
                            <FaCoins />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Join Cravely Gourmet Rewards</h3>
                            <p className="text-xs text-white/60 mt-1 max-w-lg leading-relaxed">
                                Earn coins with every meal. Redeem directly on checkout for complimentary treats, free delivery, and VIP perks.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/restaurants')}
                        className="px-6 py-3 rounded-2xl bg-white text-gray-900 font-bold text-xs hover:bg-neutral-200 transition shadow-xl whitespace-nowrap"
                    >
                        Start Ordering
                    </button>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default Offers

