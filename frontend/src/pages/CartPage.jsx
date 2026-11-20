import React, { useEffect, useState } from 'react';
import { IoArrowBack } from "react-icons/io5";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MdRemoveShoppingCart } from "react-icons/md";
import { 
    FaShoppingCart, FaArrowRight, FaTruck, FaTags,
    FaTrashAlt, FaTag, FaCheckCircle, FaPen, FaShieldAlt
} from "react-icons/fa";
import CartItemcard from '../components/CartItemcard';
import Nav from '../components/Nav';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import { serverUrl } from '../../config';
import { clearCart } from '../redux/userSlice';

function CartPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const { cartItems, totalAmount, userData } = useSelector(state => state.user);
    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(() => {
        try {
            const saved = localStorage.getItem('appliedCoupon');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    });
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const [cookingInstructions, setCookingInstructions] = useState(() => {
        return localStorage.getItem('cookingInstructions') || '';
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/coupon/active`);
            setAvailableCoupons(res.data || []);
        } catch (e) {
            console.warn('Failed to load active coupons:', e);
        }
    };

    // Constants
    const DELIVERY_THRESHOLD = 199;
    const DELIVERY_FEE = 30;
    const MIN_ORDER_AMOUNT = 50;
    const TAX_AMOUNT = 23; // Fixed tax ₹23
    
    const items = cartItems || [];
    const total = totalAmount || 0;
    const itemCount = items.length;
    
    // Check if free delivery coupon is applied
    const isFreeDelCoupon = appliedCoupon?.code === 'FREEDEL';
    const deliveryFee = (total >= DELIVERY_THRESHOLD || isFreeDelCoupon) ? 0 : DELIVERY_FEE;
    const amountNeededForFreeDelivery = Math.max(0, DELIVERY_THRESHOLD - total);
    
    // Discount Calculation
    const discountAmount = appliedCoupon?.discountAmount || 0;
    const grandTotal = Math.max(0, total + deliveryFee + TAX_AMOUNT - discountAmount);
    const progressPercent = Math.min(100, (total / DELIVERY_THRESHOLD) * 100);
    const isOrderValid = total >= MIN_ORDER_AMOUNT && itemCount > 0;

    const handleApplyCoupon = async (codeToApply = null) => {
        const code = (codeToApply || couponInput).trim().toUpperCase();
        if (!code) {
            toast.error('Please enter a coupon code');
            return;
        }
        setValidatingCoupon(true);
        try {
            const res = await axios.post(`${serverUrl}/api/coupon/validate`, {
                code,
                totalAmount: total
            });
            if (res.data.valid) {
                setAppliedCoupon(res.data);
                localStorage.setItem('appliedCoupon', JSON.stringify(res.data));
                toast.success(res.data.message || `Coupon ${code} applied successfully!`);
                setCouponInput('');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid coupon code');
        } finally {
            setValidatingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        localStorage.removeItem('appliedCoupon');
        toast.info('Coupon removed');
    };

    const handleCheckout = () => {
        if (!isOrderValid) {
            toast.warning(`Minimum order amount is ₹${MIN_ORDER_AMOUNT}`);
            return;
        }
        localStorage.setItem('cookingInstructions', cookingInstructions);
        navigate("/checkout", {
            state: {
                appliedCoupon,
                discountAmount,
                deliveryInstructions: cookingInstructions
            }
        });
    };

    const clearCartItems = () => {
        if (items.length > 0) {
            dispatch(clearCart());
            handleRemoveCoupon();
            toast.info('Cart cleared');
        }
    };

    const addInstructionTag = (tag) => {
        if (!cookingInstructions.includes(tag)) {
            setCookingInstructions(prev => prev ? `${prev}, ${tag}` : tag);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A090D] text-white flex flex-col font-sans selection:bg-[#FF6B00] selection:text-white">
            {/* Top Navigation */}
            <Nav />

            {/* Main Content Area */}
            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12">
                
                {/* Header Strip */}
                <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
                    <div className="flex items-center gap-3">
                        <button 
                            type="button"
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-xl bg-[#13121A] border border-white/10 hover:border-white/20 flex items-center justify-center text-zinc-300 hover:text-white transition-all"
                            aria-label="Back"
                        >
                            <IoArrowBack size={18} />
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                                Your Cart
                            </h1>
                            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                                {itemCount} {itemCount === 1 ? 'item' : 'items'} in your tray
                            </p>
                        </div>
                    </div>

                    {itemCount > 0 && (
                        <button
                            type="button"
                            onClick={clearCartItems}
                            className="text-xs font-semibold text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-transparent hover:border-red-500/20 hover:bg-red-500/10"
                        >
                            <FaTrashAlt size={11} /> Clear Cart
                        </button>
                    )}
                </div>

                {itemCount === 0 ? (
                    /* Empty Cart State */
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#13121A] rounded-3xl border border-white/10 p-10 sm:p-14 text-center max-w-md mx-auto my-8 shadow-2xl"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-[#FF6B00] flex items-center justify-center mx-auto mb-5 text-3xl">
                            <MdRemoveShoppingCart />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">
                            Your cart is empty
                        </h2>
                        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                            Good food is always cooking. Explore top restaurants near you to satisfy your cravings.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/restaurants')}
                            className="w-full py-3.5 rounded-xl bg-[#FF6B00] hover:bg-[#E55A00] text-white font-bold text-sm transition-all"
                        >
                            Explore Restaurants
                        </button>
                    </motion.div>
                ) : (
                    /* Cart Content Grid */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                        
                        {/* LEFT COLUMN: Items List, Delivery Progress & Notes */}
                        <div className="lg:col-span-7 space-y-5">
                            
                            {/* Free Delivery Threshold Bar */}
                            <div className="bg-[#13121A] border border-white/10 rounded-2xl p-4 sm:p-5">
                                <div className="flex items-start gap-3.5">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                        deliveryFee === 0 
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                            : 'bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20'
                                    }`}>
                                        <FaTruck size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={`font-bold text-sm ${
                                                deliveryFee === 0 ? 'text-emerald-400' : 'text-white'
                                            }`}>
                                                {deliveryFee === 0 ? 'Free Delivery Unlocked' : 'Standard Delivery Fee: ₹30'}
                                            </p>
                                            {deliveryFee === 0 && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                    SAVED ₹30
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-zinc-400 text-xs mt-0.5">
                                            {deliveryFee === 0 
                                                ? 'You saved ₹30 delivery charges on this order' 
                                                : `Add items worth ₹${amountNeededForFreeDelivery} more to enjoy free delivery`}
                                        </p>
                                        
                                        {/* Solid Progress Bar */}
                                        <div className="mt-3 h-2 w-full bg-black/60 rounded-full overflow-hidden border border-white/10">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    deliveryFee === 0 ? 'bg-emerald-500' : 'bg-[#FF6B00]'
                                                }`}
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cart Items List */}
                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <CartItemcard 
                                        key={item._id || item.id || index}
                                        data={item} 
                                        index={index}
                                    />
                                ))}
                            </div>

                            {/* Cooking / Delivery Instructions Card */}
                            <div className="bg-[#13121A] border border-white/10 rounded-2xl p-4 sm:p-5">
                                <label className="block font-bold text-sm text-white mb-2 flex items-center gap-2">
                                    <FaPen className="text-[#FF6B00] text-xs" /> Special Instructions
                                </label>
                                <textarea
                                    rows="2"
                                    placeholder="e.g. Less spicy, keep chutney extra, leave food at the door..."
                                    value={cookingInstructions}
                                    onChange={(e) => setCookingInstructions(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6B00] resize-none transition-colors"
                                />

                                {/* Quick instruction tags */}
                                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                                    <span className="text-[11px] text-zinc-500">Quick add:</span>
                                    {['Leave at door', 'Extra spicy', 'Less oil', 'Don\'t ring bell'].map(tag => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => addInstructionTag(tag)}
                                            className="text-[11px] text-zinc-300 bg-black/40 hover:bg-white/10 border border-white/10 hover:border-white/20 px-2.5 py-1 rounded-lg transition-colors"
                                        >
                                            + {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Trust & Guarantee Banner */}
                            <div className="bg-[#13121A]/60 border border-white/10 rounded-2xl p-3.5 flex items-center gap-3 text-xs text-zinc-400">
                                <FaShieldAlt className="text-[#FF6B00] text-base shrink-0" />
                                <span>100% Contactless and Hygienic delivery with temperature-checked riders.</span>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Coupons & Bill Details */}
                        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
                            
                            {/* Coupons & Offers Card */}
                            <div className="bg-[#13121A] border border-white/10 rounded-2xl p-5 sm:p-6">
                                <div className="flex items-center gap-2 font-bold text-white text-base mb-4">
                                    <FaTag className="text-[#FF6B00]" /> Offers & Coupons
                                </div>

                                {appliedCoupon ? (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm font-mono">
                                                <FaCheckCircle size={14} /> {appliedCoupon.code}
                                            </div>
                                            <div className="text-xs text-emerald-300/80 mt-0.5">
                                                Applied! You saved ₹{appliedCoupon.discountAmount}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveCoupon}
                                            className="text-xs text-red-400 hover:text-red-300 font-semibold px-2 py-1 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Enter coupon code"
                                                value={couponInput}
                                                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6B00] transition-colors"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleApplyCoupon()}
                                                disabled={validatingCoupon || !couponInput.trim()}
                                                className="px-4 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E55A00] text-white font-bold text-xs disabled:opacity-40 transition-colors"
                                            >
                                                {validatingCoupon ? 'Checking...' : 'Apply'}
                                            </button>
                                        </div>

                                        {/* Available coupons chips */}
                                        {availableCoupons.length > 0 && (
                                            <div className="space-y-2 pt-2 border-t border-white/10">
                                                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                                                    Available Coupons
                                                </div>
                                                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                                                    {availableCoupons.slice(0, 3).map((cp) => (
                                                        <div
                                                            key={cp._id || cp.code}
                                                            className="p-2.5 rounded-xl border border-white/10 bg-black/40 flex items-center justify-between hover:border-[#FF6B00]/40 transition-colors"
                                                        >
                                                            <div className="min-w-0 pr-2">
                                                                <span className="font-mono font-bold text-xs text-[#FF6B00]">
                                                                    {cp.code}
                                                                </span>
                                                                <div className="text-[10px] text-zinc-400 truncate">
                                                                    {cp.title || cp.description || 'Special promo discount'}
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleApplyCoupon(cp.code)}
                                                                className="text-xs font-bold text-[#FF6B00] hover:text-white px-2.5 py-1 rounded-lg bg-[#FF6B00]/10 hover:bg-[#FF6B00] transition-colors shrink-0"
                                                            >
                                                                Apply
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Bill Details / Order Summary Breakdown */}
                            <div className="bg-[#13121A] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl">
                                <h3 className="font-extrabold text-white text-base sm:text-lg mb-4">
                                    Bill Details
                                </h3>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between text-zinc-400">
                                        <span>Item Total ({itemCount} items)</span>
                                        <span className="font-semibold text-white">₹{total}</span>
                                    </div>

                                    <div className="flex justify-between text-zinc-400">
                                        <span>Delivery Fee</span>
                                        <span className={deliveryFee === 0 ? 'text-emerald-400 font-bold' : 'font-semibold text-white'}>
                                            {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-zinc-400">
                                        <span>Govt Taxes & Restaurant GST</span>
                                        <span className="font-semibold text-white">₹{TAX_AMOUNT}</span>
                                    </div>

                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-emerald-400 font-semibold py-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 rounded-xl text-xs">
                                            <span>Coupon Discount ({appliedCoupon?.code})</span>
                                            <span>- ₹{discountAmount}</span>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-white/10 flex justify-between items-baseline">
                                        <div>
                                            <span className="font-extrabold text-lg text-white block">
                                                To Pay
                                            </span>
                                            <span className="text-[10px] text-zinc-400">
                                                Inclusive of all taxes
                                            </span>
                                        </div>
                                        <span className="text-2xl sm:text-3xl font-extrabold text-[#FF6B00]">
                                            ₹{grandTotal}
                                        </span>
                                    </div>

                                    {(discountAmount > 0 || deliveryFee === 0) && (
                                        <div className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg text-center mt-2">
                                            🎉 You saved ₹{discountAmount + (deliveryFee === 0 ? 30 : 0)} on this order!
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleCheckout}
                                    disabled={!isOrderValid}
                                    className="w-full mt-6 py-3.5 sm:py-4 rounded-xl bg-[#FF6B00] hover:bg-[#E55A00] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
                                >
                                    <span>Proceed to Checkout</span>
                                    <FaArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default CartPage;
