import React, { useEffect, useState } from 'react'
import { IoArrowBack } from "react-icons/io5";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MdRemoveShoppingCart } from "react-icons/md";
import { FaShoppingCart, FaArrowRight, FaTruck, FaGift, FaTags, FaCrown, FaMotorcycle } from "react-icons/fa";
import CartItemcard from '../components/CartItemcard';
import { motion } from 'framer-motion';  // ✅ ADD THIS IMPORT
function CartPage() {
    const navigate = useNavigate()
    const { cartItems, totalAmount } = useSelector(state => state.user)
    const [isLoaded, setIsLoaded] = useState(false)

    // ✅ Delivery Fee Logic - ₹199 threshold
    const DELIVERY_THRESHOLD = 199
    const DELIVERY_FEE = 30
    const deliveryFee = totalAmount >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
    const amountNeededForFreeDelivery = Math.max(0, DELIVERY_THRESHOLD - totalAmount)
    const grandTotal = totalAmount + deliveryFee
    const itemCount = cartItems?.length || 0
    const progressPercent = Math.min(100, (totalAmount / DELIVERY_THRESHOLD) * 100)

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 300)
    }, [])

    const fadeUp = `transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`

    return (
        <div className='min-h-screen bg-[#0a0a0f] relative overflow-hidden'>
            
            {/* ✅ Animated Background Orbs */}
            <div className='absolute inset-0 pointer-events-none'>
                <div className='absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#ff2d55]/8 rounded-full blur-3xl animate-pulse' />
                <div className='absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-[#ff6b35]/8 rounded-full blur-3xl animate-pulse animation-delay-300' />
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ffd93d]/5 rounded-full blur-3xl animate-pulse animation-delay-600' />
            </div>

            <div className='relative z-10 max-w-4xl mx-auto px-4 py-8'>
                
                {/* ✅ Header */}
                <div className={`flex items-center gap-4 mb-8 ${fadeUp}`}>
                    <motion.button 
                        whileHover={{ scale: 1.05, rotate: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className='w-11 h-11 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#12121f] flex items-center justify-center hover:bg-white/10 transition-all duration-300 border border-white/10 group shadow-lg shadow-black/20'
                        onClick={() => navigate("/")}
                    >
                        <IoArrowBack size={20} className='text-white/60 group-hover:text-white transition' />
                    </motion.button>
                    <div>
                        <h1 className='text-2xl sm:text-3xl font-bold text-white'>Your Cart</h1>
                        <p className='text-white/40 text-sm'>{itemCount} items in your cart</p>
                    </div>
                    <div className='ml-auto flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-full bg-gradient-to-br from-[#ff2d55]/20 to-[#ff6b35]/20 flex items-center justify-center'>
                            <FaShoppingCart className='text-[#ff6b35]' size={18} />
                        </div>
                        <span className='text-white font-semibold text-lg'>{itemCount}</span>
                        {itemCount > 0 && (
                            <span className='text-[10px] bg-[#ff2d55]/20 text-[#ff2d55] px-2 py-0.5 rounded-full'>Active</span>
                        )}
                    </div>
                </div>

                {/* ✅ Cart Content */}
                {cartItems?.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center min-h-[60vh] ${fadeUp}`}>
                        <div className='relative'>
                            <div className='w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white/5 flex items-center justify-center border border-white/5'>
                                <MdRemoveShoppingCart size={60} className="sm:text-[70px] text-white/20" />
                            </div>
                            <div className='absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#ff2d55]/20 flex items-center justify-center animate-pulse'>
                                <span className='text-[8px] sm:text-[10px] text-[#ff2d55]'>!</span>
                            </div>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-6 mb-3">
                            Your Cart is Empty
                        </h1>
                        <p className="text-white/40 text-sm sm:text-lg text-center max-w-md">
                            Looks like you haven't added anything yet.
                            Start exploring delicious food items and fill your cart!
                        </p>
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className='mt-6 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white font-medium hover:scale-105 transition-all duration-300 shadow-lg shadow-[#ff2d55]/20 flex items-center gap-2 group'
                            onClick={() => navigate('/')}
                        >
                            Browse Restaurants
                            <FaArrowRight size={14} className='group-hover:translate-x-1 transition-transform duration-300' />
                        </motion.button>
                    </div>
                ) : (
                    <>
                        {/* ✅ Delivery Fee Banner - ₹199 threshold */}
                        <div className={`glass-premium-ultra p-4 sm:p-5 rounded-2xl border border-white/5 mb-6 ${fadeUp}`}>
                            <div className='flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#ff2d55]/20 to-[#ff6b35]/20 flex items-center justify-center flex-shrink-0'>
                                        <FaTruck className={`text-lg sm:text-xl ${deliveryFee === 0 ? 'text-green-400' : 'text-[#ff6b35]'}`} />
                                    </div>
                                    <div>
                                        <p className='text-white font-medium text-sm sm:text-base'>
                                            {deliveryFee === 0 ? '🎉 Free Delivery' : 'Delivery Charges Apply'}
                                        </p>
                                        <p className='text-white/40 text-xs sm:text-sm'>
                                            {deliveryFee === 0 
                                                ? 'You\'ve unlocked free delivery!' 
                                                : `Add ₹${amountNeededForFreeDelivery} more for free delivery`
                                            }
                                        </p>
                                    </div>
                                </div>
                                <div className='md:ml-auto w-full md:w-auto'>
                                    <div className='flex items-center gap-3'>
                                        <div className='flex-1 md:w-32'>
                                            <div className='w-full h-2 bg-white/10 rounded-full overflow-hidden'>
                                                <motion.div 
                                                    className='h-full bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] rounded-full'
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progressPercent}%` }}
                                                    transition={{ duration: 1, delay: 0.3 }}
                                                />
                                            </div>
                                            <p className='text-white/30 text-[8px] sm:text-[10px] mt-1 text-right'>
                                                {Math.round(progressPercent)}% complete
                                            </p>
                                        </div>
                                        <div className={`text-xs sm:text-sm font-semibold ${deliveryFee === 0 ? 'text-green-400' : 'text-[#ff6b35]'}`}>
                                            {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ✅ Cart Items */}
                        <div className={`space-y-3 sm:space-y-4 mb-6 ${fadeUp}`} style={{ animationDelay: '0.1s' }}>
                            {cartItems?.map((item, index) => (
                                <div key={index} className='animate-fade-up' style={{ animationDelay: `${0.05 * index}s` }}>
                                    <CartItemcard data={item} />
                                </div>
                            ))}
                        </div>

                        {/* ✅ Order Summary */}
                        <div className={`glass-premium-ultra p-5 sm:p-6 rounded-2xl border border-white/5 ${fadeUp}`} style={{ animationDelay: '0.2s' }}>
                            <div className='flex items-center gap-3 mb-4'>
                                <FaTags className='text-[#ff6b35]' size={16} className="sm:text-lg" />
                                <h2 className='text-white font-semibold text-base sm:text-lg'>Order Summary</h2>
                            </div>
                            
                            <div className='space-y-2 sm:space-y-3 text-xs sm:text-sm'>
                                <div className='flex justify-between text-white/60'>
                                    <span>Subtotal ({itemCount} items)</span>
                                    <span>₹{totalAmount}</span>
                                </div>
                                <div className='flex justify-between text-white/60'>
                                    <span>Delivery Fee</span>
                                    <span className={deliveryFee === 0 ? 'text-green-400 font-semibold' : 'text-white/60'}>
                                        {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                                    </span>
                                </div>
                                <div className='flex justify-between text-white/60'>
                                    <span>Tax</span>
                                    <span className='text-white/40'>₹0</span>
                                </div>
                                
                                {/* ✅ Free Delivery Banner */}
                                {deliveryFee > 0 && (
                                    <div className='bg-gradient-to-r from-[#ff2d55]/10 to-[#ff6b35]/10 p-3 rounded-xl border border-[#ff6b35]/10'>
                                        <p className='text-white/60 text-[10px] sm:text-xs text-center'>
                                            💡 Add <span className='text-[#ff6b35] font-bold'>₹{amountNeededForFreeDelivery}</span> more to get 
                                            <span className='text-green-400 font-bold'> FREE DELIVERY</span>
                                        </p>
                                    </div>
                                )}

                                <div className='border-t border-white/10 my-2 pt-3 flex justify-between text-base sm:text-lg font-bold'>
                                    <span className='text-white'>Total</span>
                                    <span className='text-[#ff6b35] text-lg sm:text-xl'>₹{grandTotal}</span>
                                </div>
                            </div>

                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                className='w-full mt-4 sm:mt-5 py-3 sm:py-4 rounded-full bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-[#ff2d55]/20 flex items-center justify-center gap-3 group text-sm sm:text-base'
                                onClick={() => navigate("/checkout")}
                            >
                                Proceed to Checkout
                                <FaArrowRight size={14} className="sm:text-base group-hover:translate-x-2 transition-transform duration-300" />
                            </motion.button>
                        </div>
                    </>
                )}
            </div>

            <style jsx>{`
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-up {
                    animation: fade-up 0.4s ease-out forwards;
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.3; }
                    50% { transform: scale(1.1); opacity: 0.6; }
                }
                .animate-pulse {
                    animation: pulse 2s ease-in-out infinite;
                }

                .animation-delay-300 { animation-delay: 0.3s; }
                .animation-delay-600 { animation-delay: 0.6s; }

                .glass-premium-ultra {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }
            `}</style>
        </div>
    )
}

export default CartPage