import React from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { 
    FaTimes, FaDownload, FaPrint, FaShareAlt,
    FaMotorcycle, FaStar, FaCheckCircle, FaClock,
    FaUtensils, FaRupeeSign, FaMapMarkerAlt,
    FaPhone, FaEnvelope, FaUser, FaTag,
    FaUserCircle, FaHome, FaCity, FaBuilding
} from 'react-icons/fa'
import { MdVerified, MdRestaurant, MdLocationOn } from 'react-icons/md'
import { motion } from 'framer-motion'

function Invoice({ order, onClose }) {
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const downloadPDF = () => {
        const input = document.getElementById('invoice-content')
        html2canvas(input, {
            backgroundColor: '#12121a',
            scale: 2,
            useCORS: true,
            logging: false,
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pdfWidth = 210
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save(`Invoice_${order._id.slice(-6)}.pdf`)
        })
    }

    const firstShop = order.shopOrders?.[0]
    const restaurant = firstShop?.shop
    const isDelivered = firstShop?.status === 'delivered'

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/85 backdrop-blur-3xl flex items-center justify-center z-[99999] p-4'
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.8, y: 30, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.8, y: 30, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className='relative bg-[#18181D] rounded-3xl border border-white/10 max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl shadow-black/50'
                onClick={(e) => e.stopPropagation()}
            >
                {/* Premium Header Glow */}
                <div className='absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff2d55] to-transparent' />
                <div className='absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent' />

                {/* Close Button */}
                <motion.button 
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className='absolute top-4 right-4 z-10 text-white/40 hover:text-white transition-all duration-300 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 backdrop-blur-sm border border-white/5'
                    onClick={onClose}
                >
                    <FaTimes size={18} />
                </motion.button>

                <div className='p-6'>
                    {/* ✅ Invoice Content */}
                    <div id="invoice-content" className='bg-gradient-to-b from-[#12121a] to-[#0a0a0f] rounded-2xl p-8 border border-white/5'>
                        
                        {/* Header - Premium */}
                        <div className='flex items-center justify-between pb-6 border-b border-white/10'>
                            <div className='flex items-center gap-3'>
                                <div className='w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center shadow-lg shadow-[#ff2d55]/30'>
                                    <FaMotorcycle className='text-white text-2xl' />
                                </div>
                                <div>
                                    <h1 className='text-2xl font-bold text-white tracking-tight'>Cravely</h1>
                                    <p className='text-[10px] text-white/30 tracking-[0.2em] uppercase'>🍽️ Food Delivery</p>
                                </div>
                            </div>
                            <div className='text-right'>
                                <div className='flex items-center gap-1 justify-end'>
                                    <span className='text-[10px] text-white/30 font-medium'>INVOICE</span>
                                    <span className='text-[10px] bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] px-2 py-0.5 rounded-full text-white font-bold'>
                                        #{order._id.slice(-6)}
                                    </span>
                                </div>
                                <p className='text-[10px] text-white/20 mt-0.5'>{formatDate(order.createdAt)}</p>
                            </div>
                        </div>

                        {/* Order Status */}
                        <div className='flex items-center gap-2 py-4 border-b border-white/10'>
                            <div className={`flex items-center gap-1.5 ${isDelivered ? 'text-green-400' : 'text-yellow-400'}`}>
                                {isDelivered ? <FaCheckCircle size={12} /> : <FaClock size={12} />}
                                <span className='text-xs font-medium'>
                                    {isDelivered ? '✅ Order Delivered' : '⏳ Order Processing'}
                                </span>
                            </div>
                            <span className='text-white/20'>|</span>
                            <span className='text-white/30 text-xs flex items-center gap-1'>
                                <FaTag size={10} className="text-[#ff6b35]" />
                                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                            </span>
                            <span className='text-white/20'>|</span>
                            <span className='text-white/30 text-xs'>
                                {order.payment ? '✅ Paid' : '⏳ Pending'}
                            </span>
                        </div>

                        {/* ✅ Customer Details - Complete */}
                        <div className='py-4 border-b border-white/10'>
                            <p className='text-[10px] text-white/30 font-medium uppercase tracking-wider flex items-center gap-1.5 mb-3'>
                                <FaUserCircle size={12} className="text-[#ff6b35]" /> Customer Details
                            </p>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                <div className='bg-white/5 rounded-xl p-3 border border-white/5'>
                                    <p className='text-[9px] text-white/30 font-medium uppercase tracking-wider'>Full Name</p>
                                    <p className='text-white font-semibold text-sm flex items-center gap-1.5'>
                                        <FaUser size={12} className="text-[#ff6b35]" />
                                        {order.user?.fullName || 'Customer'}
                                    </p>
                                </div>
                                <div className='bg-white/5 rounded-xl p-3 border border-white/5'>
                                    <p className='text-[9px] text-white/30 font-medium uppercase tracking-wider'>Email</p>
                                    <p className='text-white/70 text-sm flex items-center gap-1.5'>
                                        <FaEnvelope size={12} className="text-[#ff6b35]" />
                                        {order.user?.email || 'N/A'}
                                    </p>
                                </div>
                                <div className='bg-white/5 rounded-xl p-3 border border-white/5'>
                                    <p className='text-[9px] text-white/30 font-medium uppercase tracking-wider'>Phone Number</p>
                                    <p className='text-white/70 text-sm flex items-center gap-1.5'>
                                        <FaPhone size={12} className="text-[#ff6b35]" />
                                        {order.user?.mobile || 'N/A'}
                                    </p>
                                </div>
                                <div className='bg-white/5 rounded-xl p-3 border border-white/5'>
                                    <p className='text-[9px] text-white/30 font-medium uppercase tracking-wider'>Delivery Address</p>
                                    <p className='text-white/70 text-sm flex items-center gap-1.5'>
                                        <MdLocationOn size={12} className="text-[#ff6b35]" />
                                        {order.deliveryAddress?.text || 'Address not available'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Restaurant Details */}
                        <div className='py-4 border-b border-white/10'>
                            <p className='text-[10px] text-white/30 font-medium uppercase tracking-wider flex items-center gap-1.5 mb-3'>
                                <MdRestaurant size={12} className="text-[#ff6b35]" /> Restaurant Details
                            </p>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                <div className='bg-white/5 rounded-xl p-3 border border-white/5'>
                                    <p className='text-[9px] text-white/30 font-medium uppercase tracking-wider'>Restaurant Name</p>
                                    <p className='text-white font-semibold text-sm flex items-center gap-1.5'>
                                        <FaUtensils size={12} className="text-[#ff6b35]" />
                                        {restaurant?.name || 'Cravely'}
                                    </p>
                                </div>
                                <div className='bg-white/5 rounded-xl p-3 border border-white/5'>
                                    <p className='text-[9px] text-white/30 font-medium uppercase tracking-wider'>Restaurant Address</p>
                                    <p className='text-white/70 text-sm flex items-center gap-1.5'>
                                        <FaMapMarkerAlt size={12} className="text-[#ff6b35]" />
                                        {restaurant?.address || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Items Table - Premium */}
                        <div className='py-4 border-b border-white/10'>
                            <p className='text-[10px] text-white/30 font-medium uppercase tracking-wider flex items-center gap-1.5 mb-3'>
                                <FaUtensils size={10} className="text-[#ff6b35]" /> Order Items
                            </p>
                            <div className='space-y-2'>
                                {order.shopOrders?.map((shopOrder) => (
                                    shopOrder.shopOrderItems?.map((item, idx) => (
                                        <div key={idx} className='flex items-center justify-between py-2.5 px-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300'>
                                            <div className='flex items-center gap-3'>
                                                <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff2d55]/20 to-[#ff6b35]/20 flex items-center justify-center'>
                                                    <FaUtensils className='text-white/30 text-xs' />
                                                </div>
                                                <div>
                                                    <p className='text-white text-sm font-medium'>{item.name}</p>
                                                    <p className='text-white/30 text-[10px]'>Qty: {item.quantity} × ₹{item.price}</p>
                                                </div>
                                            </div>
                                            <p className='text-white font-semibold text-sm'>₹{item.price * item.quantity}</p>
                                        </div>
                                    ))
                                ))}
                            </div>
                        </div>

                        {/* Totals */}
                        <div className='py-4'>
                            <div className='flex justify-between items-center py-1.5'>
                                <span className='text-white/40 text-sm'>Subtotal</span>
                                <span className='text-white/60 text-sm'>₹{order.totalAmount}</span>
                            </div>
                            <div className='flex justify-between items-center py-1.5'>
                                <span className='text-white/40 text-sm'>Delivery Fee</span>
                                <span className='text-white/60 text-sm'>₹{order.deliveryFee || 30}</span>
                            </div>
                            <div className='flex justify-between items-center py-1.5'>
                                <span className='text-white/40 text-sm'>Tax</span>
                                <span className='text-white/60 text-sm'>₹0</span>
                            </div>
                            <div className='h-px bg-white/10 my-2' />
                            <div className='flex justify-between items-center'>
                                <span className='text-white font-bold text-base'>Total</span>
                                <span className='text-[#ff6b35] font-bold text-2xl'>₹{order.totalAmount}</span>
                            </div>
                            <p className='text-white/20 text-[10px] text-right mt-1'>Inclusive of all taxes</p>
                        </div>

                        {/* Footer */}
                        <div className='pt-4 border-t border-white/10 text-center'>
                            <p className='text-white/30 text-xs flex items-center justify-center gap-2'>
                                <span>Thank you for ordering with</span>
                                <span className='text-[#ff6b35] font-semibold'>Cravely</span>
                                <span className='text-white/20'>🍕</span>
                            </p>
                            <p className='text-white/20 text-[10px] mt-1'>For queries, contact support@cravely.com</p>
                            <div className='flex items-center justify-center gap-4 mt-2 text-white/10 text-[10px]'>
                                <span>Secure</span>
                                <span className='w-px h-3 bg-white/10' />
                                <span>Trusted</span>
                                <span className='w-px h-3 bg-white/10' />
                                <span>Premium</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='mt-6 flex flex-wrap gap-3'>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={downloadPDF}
                            className='flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-[#ff2d55]/20 flex items-center justify-center gap-2 text-sm'
                        >
                            <FaDownload size={16} />
                            Download Invoice
                        </motion.button>
                        
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.print()}
                            className='flex-1 sm:flex-none px-6 py-3 rounded-xl border border-white/15 text-white/60 font-semibold hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 text-sm'
                        >
                            <FaPrint size={16} />
                            Print
                        </motion.button>
                        
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            className='flex-1 sm:flex-none px-6 py-3 rounded-xl bg-white/5 text-white/40 font-semibold hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 text-sm border border-white/5'
                        >
                            <FaTimes size={16} />
                            Close
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default Invoice