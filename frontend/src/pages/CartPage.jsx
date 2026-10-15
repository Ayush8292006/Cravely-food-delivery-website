import React, { useEffect, useState } from 'react'
import { IoArrowBack } from "react-icons/io5";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MdRemoveShoppingCart } from "react-icons/md";
import { 
    FaShoppingCart, FaArrowRight, FaTruck, FaTags,
    FaExclamationTriangle, FaTrashAlt, FaGift
} from "react-icons/fa";
import CartItemcard from '../components/CartItemcard';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { removeCartItem, updateQuantity, clearCart } from '../redux/userSlice';

function CartPage() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    
    const { cartItems, totalAmount } = useSelector(state => state.user)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 200)
    }, [])

    // ✅ Constants
    const DELIVERY_THRESHOLD = 199
    const DELIVERY_FEE = 30
    const MIN_ORDER_AMOUNT = 50
    const TAX_AMOUNT = 23 // ✅ Fixed tax ₹23
    
    const items = cartItems || []
    const total = totalAmount || 0
    const itemCount = items.length
    
    const deliveryFee = total >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
    const amountNeededForFreeDelivery = Math.max(0, DELIVERY_THRESHOLD - total)
    const grandTotal = total + deliveryFee + TAX_AMOUNT // ✅ Added tax
    const progressPercent = Math.min(100, (total / DELIVERY_THRESHOLD) * 100)
    const isOrderValid = total >= MIN_ORDER_AMOUNT && itemCount > 0

    const fadeUp = `transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`

    const handleCheckout = () => {
        if (!isOrderValid) {
            toast.warning(`Minimum order amount is ₹${MIN_ORDER_AMOUNT}`)
            return
        }
        navigate("/checkout")
    }

    const handleRemoveItem = (itemId) => {
        dispatch(removeCartItem(itemId))
        toast.info('Item removed from cart')
    }

    const handleQuantityUpdate = (itemId, newQuantity) => {
        if (newQuantity < 1) {
            dispatch(removeCartItem(itemId))
            return
        }
        dispatch(updateQuantity({ id: itemId, quantity: newQuantity }))
    }

    const clearCartItems = () => {
        if (items.length > 0) {
            dispatch(clearCart())
            toast.info('Cart cleared')
        }
    }

    return (
        <div className='min-h-screen bg-white relative'>
            {/* Top accent bar */}
            <div className='h-1.5 w-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400' />

            <div className='relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10'>
                
                {/* Header */}
                <div className={`flex items-center gap-4 mb-8 ${fadeUp}`}>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className='w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center hover:bg-orange-100 transition-all duration-300 shadow-sm'
                        onClick={() => navigate("/")}
                    >
                        <IoArrowBack size={20} className='text-orange-600 font-bold' />
                    </motion.button>

                    <div className='flex-1'>
                        <h1 className='text-3xl font-extrabold text-gray-900 tracking-tight'>
                            Your Cart
                        </h1>
                        <p className='text-gray-600 text-sm mt-0.5 font-medium'>
                            {itemCount} {itemCount === 1 ? 'item' : 'items'} added
                        </p>
                    </div>

                    <div className='flex items-center gap-2.5 bg-orange-50 border border-orange-200 px-4 py-2.5 rounded-2xl shadow-sm'>
                        <FaShoppingCart className='text-orange-600' size={16} />
                        <span className='text-orange-700 font-bold text-base'>{itemCount}</span>
                    </div>
                </div>

                {/* Empty State */}
                {itemCount === 0 ? (
                    <div className='flex flex-col items-center justify-center min-h-[60vh]'>
                        <div className='w-32 h-32 rounded-full bg-orange-50 border-2 border-orange-200 flex items-center justify-center'>
                            <MdRemoveShoppingCart size={56} className="text-orange-300" />
                        </div>
                        
                        <h2 className="text-3xl font-bold text-gray-800 mt-6 mb-3">
                            Your Cart is Empty
                        </h2>
                        <p className="text-gray-500 text-base text-center max-w-sm leading-relaxed">
                            Looks like you haven't added anything yet.
                        </p>
                        
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className='mt-8 px-8 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-base transition-all shadow-lg shadow-orange-200 flex items-center gap-3'
                            onClick={() => navigate('/')}
                        >
                            Browse Restaurants
                            <FaArrowRight size={15} />
                        </motion.button>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                        
                        {/* LEFT SIDE - Items */}
                        <div className='lg:col-span-2 space-y-5'>
                            
                            {/* Min Order Warning */}
                            {!isOrderValid && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className='rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 flex items-center gap-4 shadow-sm'
                                >
                                    <div className='w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0'>
                                        <FaExclamationTriangle size={18} className="text-amber-600" />
                                    </div>
                                    <div>
                                        <p className='text-amber-800 text-sm font-bold'>
                                            Minimum order amount is ₹{MIN_ORDER_AMOUNT}
                                        </p>
                                        <p className='text-amber-600 text-xs font-medium'>
                                            Add more items to proceed with your order
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Delivery Banner */}
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`rounded-2xl border-2 p-5 shadow-sm ${
                                    deliveryFee === 0 
                                        ? 'border-emerald-300 bg-emerald-50' 
                                        : 'border-orange-300 bg-orange-50'
                                }`}
                            >
                                <div className='flex items-center gap-4'>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 ${
                                        deliveryFee === 0 ? 'border-emerald-300 bg-emerald-100' : 'border-orange-300 bg-orange-100'
                                    }`}>
                                        <FaTruck className={deliveryFee === 0 ? 'text-emerald-700' : 'text-orange-700'} size={20} />
                                    </div>
                                    <div className='flex-1'>
                                        <p className={`font-bold text-base ${deliveryFee === 0 ? 'text-emerald-800' : 'text-orange-800'}`}>
                                            {deliveryFee === 0 ? '🎉 Free Delivery Unlocked!' : '🚚 Delivery Charges Apply'}
                                        </p>
                                        <p className='text-gray-700 text-sm font-medium mt-0.5'>
                                            {deliveryFee === 0 
                                                ? "You've unlocked free delivery on this order!" 
                                                : `Add ₹${amountNeededForFreeDelivery} more for free delivery`
                                            }
                                        </p>
                                        
                                        {/* Progress Bar */}
                                        <div className='mt-3 flex items-center gap-3'>
                                            <div className='flex-1 h-3 bg-white rounded-full overflow-hidden border-2 border-orange-200'>
                                                <motion.div 
                                                    className={`h-full rounded-full ${deliveryFee === 0 ? 'bg-emerald-500' : 'bg-orange-500'}`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progressPercent}%` }}
                                                    transition={{ duration: 1, delay: 0.2 }}
                                                />
                                            </div>
                                            <span className={`text-sm font-bold ${deliveryFee === 0 ? 'text-emerald-700' : 'text-orange-700'}`}>
                                                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Cart Items */}
                            <div className={`space-y-4 ${fadeUp}`}>
                                {items.map((item, index) => (
                                    <motion.div 
                                        key={item._id || item.id || index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.08 }}
                                    >
                                        <CartItemcard 
                                            data={item} 
                                            onRemove={() => handleRemoveItem(item._id || item.id)}
                                            onQuantityChange={(newQty) => handleQuantityUpdate(item._id || item.id, newQty)}
                                        />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Clear Cart */}
                            {items.length > 0 && (
                                <div className='flex justify-end pt-2'>
                                    <button
                                        className='text-gray-500 hover:text-red-600 transition-all text-sm font-semibold flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-red-50 border-2 border-transparent hover:border-red-200'
                                        onClick={clearCartItems}
                                    >
                                        <FaTrashAlt size={13} /> Clear Cart
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* RIGHT SIDE - Order Summary */}
                        <div className='lg:sticky lg:top-6'>
                            <div className='rounded-3xl bg-white border-2 border-orange-200 shadow-xl shadow-orange-100/50 p-6 sm:p-7'>
                                {/* Header */}
                                <div className='flex items-center gap-3 mb-6'>
                                    <div className='w-11 h-11 rounded-2xl bg-orange-100 border-2 border-orange-200 flex items-center justify-center'>
                                        <FaTags className='text-orange-700' size={16} />
                                    </div>
                                    <div>
                                        <h2 className='text-gray-900 font-extrabold text-lg'>Order Summary</h2>
                                        <p className='text-gray-500 text-xs font-medium'>Review your order details</p>
                                    </div>
                                </div>
                                
                                {/* Details */}
                                <div className='space-y-3.5 text-sm'>
                                    <div className='flex justify-between items-center py-2 border-b-2 border-gray-100'>
                                        <span className='text-gray-700 font-medium'>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                                        <span className='font-bold text-gray-900'>₹{total}</span>
                                    </div>
                                    
                                    <div className='flex justify-between items-center py-2 border-b-2 border-gray-100'>
                                        <span className='text-gray-700 font-medium'>Delivery Fee</span>
                                        <span className={deliveryFee === 0 ? 'text-emerald-600 font-bold' : 'font-bold text-gray-900'}>
                                            {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                                        </span>
                                    </div>
                                    
                                    <div className='flex justify-between items-center py-2 border-b-2 border-gray-100'>
                                        <span className='text-gray-700 font-medium'>Tax (GST)</span>
                                        <span className='font-bold text-gray-900'>₹{TAX_AMOUNT}</span>
                                    </div>
                                    
                                 

                                    {/* Total */}
                                    <div className='pt-4 mt-2 border-t-2 border-orange-300 flex justify-between items-center'>
                                        <span className='text-gray-900 font-extrabold text-xl'>Total</span>
                                        <span className='text-2xl font-extrabold text-orange-600'>
                                            ₹{grandTotal}
                                        </span>
                                    </div>
                                </div>

                                {/* Checkout Button */}
                                <motion.button 
                                    whileHover={isOrderValid ? { scale: 1.02 } : {}}
                                    whileTap={isOrderValid ? { scale: 0.98 } : {}}
                                    className={`w-full mt-6 py-4 rounded-2xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-3 ${
                                        isOrderValid 
                                            ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200' 
                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    }`}
                                    onClick={handleCheckout}
                                    disabled={!isOrderValid}
                                >
                                    {isOrderValid ? (
                                        <>
                                            Proceed to Checkout
                                            <FaArrowRight size={14} />
                                        </>
                                    ) : (
                                        <>
                                            <FaExclamationTriangle size={14} />
                                            Min ₹{MIN_ORDER_AMOUNT} Required
                                        </>
                                    )}
                                </motion.button>
                                
                                {!isOrderValid && (
                                    <p className='text-gray-500 text-sm font-medium text-center mt-3'>
                                        Add more items to reach minimum order
                                    </p>
                                )}

                                {/* Trust Badges */}
                                <div className='mt-5 pt-4 border-t-2 border-gray-100 flex justify-center gap-6 text-sm'>
                                    <span className='flex items-center gap-2 text-gray-600 font-medium'>
                                        <span className='text-green-500 text-lg'>🔒</span> Secure
                                    </span>
                                    <span className='flex items-center gap-2 text-gray-600 font-medium'>
                                        <span className='text-green-500 text-lg'>🚚</span> Fast
                                    </span>
                                    <span className='flex items-center gap-2 text-gray-600 font-medium'>
                                        <span className='text-green-500 text-lg'>💯</span> Fresh
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CartPage