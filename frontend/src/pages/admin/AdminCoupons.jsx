import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../../../config'
import AdminLayout from './AdminLayout'
import { FaGem, FaPlus, FaTrash, FaCheck, FaTimes, FaTag, FaPercentage } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'

function AdminCoupons() {
    const [coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        code: '',
        title: '',
        description: '',
        discountType: 'percentage',
        discountValue: 20,
        maxDiscount: 100,
        minOrderAmount: 199,
        badge: 'SPECIAL'
    })
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        fetchCoupons()
    }, [])

    const fetchCoupons = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`${serverUrl}/api/coupon/active`)
            setCoupons(res.data || [])
        } catch (error) {
            toast.error('Failed to load coupons')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateCoupon = async (e) => {
        e.preventDefault()
        if (!formData.code || !formData.title || !formData.discountValue) {
            toast.error('Please fill all required fields')
            return
        }
        setCreating(true)
        try {
            await axios.post(`${serverUrl}/api/coupon/create`, formData, { withCredentials: true })
            toast.success(`Coupon ${formData.code.toUpperCase()} created successfully!`)
            setShowModal(false)
            setFormData({
                code: '',
                title: '',
                description: '',
                discountType: 'percentage',
                discountValue: 20,
                maxDiscount: 100,
                minOrderAmount: 199,
                badge: 'SPECIAL'
            })
            fetchCoupons()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create coupon')
        } finally {
            setCreating(false)
        }
    }

    const handleDelete = async (id, code) => {
        if (!window.confirm(`Are you sure you want to delete coupon "${code}"?`)) return
        try {
            await axios.delete(`${serverUrl}/api/coupon/${id}`, { withCredentials: true })
            toast.success('Coupon removed')
            fetchCoupons()
        } catch (error) {
            toast.error('Failed to delete coupon')
        }
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <FaGem className="text-orange-500" /> Offers & Coupons Management
                        </h1>
                        <p className="text-white/40 text-sm mt-1">
                            Configure promotional discount coupons, minimum orders, and maximum discount limits.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-orange-500/20 transition"
                    >
                        <FaPlus size={12} /> Create Coupon
                    </button>
                </div>

                {/* Grid of Coupons */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full text-center py-12 text-white/40">Loading active coupons...</div>
                    ) : coupons.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-white/40 bg-[#12121c] rounded-2xl border border-white/5">
                            No active coupons found. Click "Create Coupon" to add one.
                        </div>
                    ) : (
                        coupons.map((coupon) => (
                            <div
                                key={coupon._id}
                                className="bg-[#12121c] border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-orange-500/40 transition shadow-xl"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase tracking-wider">
                                        {coupon.badge || 'PROMO'}
                                    </span>
                                    <button
                                        onClick={() => handleDelete(coupon._id, coupon.code)}
                                        className="text-white/20 hover:text-red-400 p-1 transition"
                                        title="Delete coupon"
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                </div>

                                <div className="font-mono text-xl font-bold text-white tracking-wider mb-1 flex items-center gap-2">
                                    <FaTag className="text-orange-500 text-base" /> {coupon.code}
                                </div>
                                <h4 className="text-sm font-semibold text-white/90 mb-1">{coupon.title}</h4>
                                <p className="text-xs text-white/40 mb-4">{coupon.description || 'Valid on all eligible orders.'}</p>

                                <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-white/5 text-white/60">
                                    <div>
                                        Discount: <strong className="text-white">{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</strong>
                                    </div>
                                    <div>
                                        Max Save: <strong className="text-white">₹{coupon.maxDiscount || 'N/A'}</strong>
                                    </div>
                                    <div>
                                        Min Order: <strong className="text-white">₹{coupon.minOrderAmount || 0}</strong>
                                    </div>
                                    <div>
                                        Status: <strong className="text-emerald-400">Active</strong>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#181824] border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <FaGem className="text-orange-500" /> Create Promotional Coupon
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white">
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCoupon} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-white/60 mb-1">Coupon Code *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. YUMMY50"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white uppercase text-sm focus:outline-none focus:border-orange-500 font-mono"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-white/60 mb-1">Badge Tag</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. SPECIAL, BESTSELLER"
                                        value={formData.badge}
                                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-white/60 mb-1">Offer Title *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 50% OFF up to ₹150"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-white/60 mb-1">Description</label>
                                <input
                                    type="text"
                                    placeholder="Brief terms or details"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-white/60 mb-1">Discount Type</label>
                                    <select
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500"
                                    >
                                        <option value="percentage" className="bg-[#181824]">Percentage (%)</option>
                                        <option value="flat" className="bg-[#181824]">Flat Amount (₹)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-white/60 mb-1">Value *</label>
                                    <input
                                        type="number"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                                        required
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-white/60 mb-1">Max Cap (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.maxDiscount}
                                        onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-white/60 mb-1">Min Order Amount (₹)</label>
                                <input
                                    type="number"
                                    value={formData.minOrderAmount}
                                    onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                                    min="0"
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl bg-white/5 text-white/60 hover:text-white text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-sm shadow-lg shadow-orange-500/20 disabled:opacity-50"
                                >
                                    {creating ? 'Saving...' : 'Save & Publish'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AdminLayout>
    )
}

export default AdminCoupons

