import React, { useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from 'axios';
import { serverUrl } from '../../config';
import { 
    FaTimes, FaDownload, FaPrint, FaMotorcycle, 
    FaCheckCircle, FaClock, FaUtensils, FaMapMarkerAlt, 
    FaPhone, FaEnvelope, FaUser, FaTag, FaFileInvoiceDollar,
    FaShieldAlt
} from 'react-icons/fa';
import { MdRestaurant, MdLocationOn } from 'react-icons/md';
import { motion } from 'framer-motion';

function Invoice({ order, onClose }) {
    const [invoiceData, setInvoiceData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuthoritativeInvoice = async () => {
            if (!order?._id) return;
            try {
                const res = await axios.get(`${serverUrl}/api/order/invoice/${order._id}`, {
                    withCredentials: true
                });
                if (res.data) {
                    setInvoiceData(res.data);
                }
            } catch (err) {
                console.warn('Invoice endpoint fallback:', err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAuthoritativeInvoice();
    }, [order?._id]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const downloadPDF = () => {
        const input = document.getElementById('cravely-invoice-sheet');
        if (!input) return;
        
        html2canvas(input, {
            backgroundColor: '#0A090D',
            scale: 2,
            useCORS: true,
            logging: false,
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = 210;
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            const invId = invoiceData?.invoiceNumber || `CRV-INV-${order?._id?.slice(-6)}`;
            pdf.save(`${invId}.pdf`);
        });
    };

    if (!order) return null;

    // Authoritative data resolution
    const firstShop = order.shopOrders?.[0]?.shop;
    const invNumber = invoiceData?.invoiceNumber || order.invoiceNumber || `CRV-INV-${new Date(order.createdAt).getFullYear()}-${order._id.slice(-6).toUpperCase()}`;
    const invDate = invoiceData?.invoiceDate || order.createdAt;
    
    // Items
    const items = invoiceData?.items || (() => {
        const list = [];
        order.shopOrders?.forEach(so => {
            so.shopOrderItems?.forEach(item => {
                const price = Number(item.price) || 0;
                const quantity = Number(item.quantity) || 1;
                list.push({
                    name: item.name || item.item?.name || 'Item',
                    price,
                    quantity,
                    total: price * quantity
                });
            });
        });
        return list;
    })();

    // Financials
    const subtotal = invoiceData?.financials?.subtotal ?? (order.subtotal || items.reduce((s, i) => s + i.total, 0));
    const deliveryFee = invoiceData?.financials?.deliveryFee ?? (order.deliveryFee ?? 0);
    const taxAmount = invoiceData?.financials?.taxAmount ?? (order.taxAmount ?? 23);
    const platformFee = invoiceData?.financials?.platformFee ?? (order.platformFee ?? 0);
    const discountAmount = invoiceData?.financials?.discountAmount ?? (order.discountAmount ?? 0);
    const couponCode = invoiceData?.financials?.couponCode || order.couponCode;
    const totalAmount = invoiceData?.financials?.totalAmount ?? (order.totalAmount || Math.max(0, subtotal - discountAmount + deliveryFee + taxAmount + platformFee));
    const paymentStatus = invoiceData?.paymentStatus || order.paymentStatus || (order.payment ? 'paid' : 'pending');
    const paymentMethod = invoiceData?.paymentMethod || order.paymentMethod || 'cod';
    const transactionId = invoiceData?.transactionId || order.transactionId || order.razorpayPaymentId || null;
    const isPaid = paymentStatus === 'paid' || order.payment === true;

    // Customer & Restaurant
    const customer = invoiceData?.customer || {
        name: order.customerName || order.user?.fullName || 'Customer',
        email: order.user?.email || 'N/A',
        mobile: order.mobile || order.user?.mobile || 'N/A',
        deliveryAddress: order.deliveryAddress?.text || 'Standard Address'
    };

    const restaurant = invoiceData?.restaurant || {
        name: firstShop?.name || 'Cravely Restaurant Partner',
        address: firstShop?.address || 'Restaurant Address',
        city: firstShop?.city || 'Noida'
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[99999] p-4"
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="relative bg-[#13121A] rounded-2xl border border-white/10 max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl text-white"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header actions */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <FaFileInvoiceDollar className="text-[#FF6B00]" size={18} />
                        <span className="font-bold text-sm">Official Tax Invoice</span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-black/40 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                    >
                        <FaTimes size={14} />
                    </button>
                </div>

                {/* Printable Invoice Sheet */}
                <div className="p-6">
                    <div id="cravely-invoice-sheet" className="bg-[#0A090D] border border-white/10 rounded-xl p-6 sm:p-8 text-white font-sans">
                        
                        {/* Header: Brand & Invoice Meta */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                            <div>
                                <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                                    <span className="text-[#FF6B00]">CRAVELY</span>
                                </h1>
                                <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-0.5">
                                    Gourmet Express Delivery • Tax Invoice
                                </p>
                            </div>
                            <div className="sm:text-right">
                                <span className="text-xs font-mono font-bold text-[#FF6B00] bg-[#FF6B00]/10 border border-[#FF6B00]/20 px-2.5 py-1 rounded-md">
                                    {invNumber}
                                </span>
                                <p className="text-[11px] text-zinc-400 mt-1.5">
                                    Date: {formatDate(invDate)}
                                </p>
                                <p className="text-[10px] text-zinc-500 font-mono">
                                    Order ID: #{order._id}
                                </p>
                            </div>
                        </div>

                        {/* Customer & Restaurant 2-Col Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-white/10 text-xs">
                            <div className="bg-[#13121A] p-3.5 rounded-xl border border-white/5">
                                <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider mb-2">Billed To (Customer)</p>
                                <p className="font-bold text-white text-sm">{customer.name}</p>
                                <p className="text-zinc-300 mt-0.5">{customer.mobile}</p>
                                <p className="text-zinc-400 text-[11px] mt-1 leading-relaxed">{customer.deliveryAddress}</p>
                            </div>
                            <div className="bg-[#13121A] p-3.5 rounded-xl border border-white/5">
                                <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider mb-2">Restaurant Partner</p>
                                <p className="font-bold text-white text-sm">{restaurant.name}</p>
                                <p className="text-zinc-400 text-[11px] mt-1 leading-relaxed">{restaurant.address}, {restaurant.city}</p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="py-5 border-b border-white/10">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="text-zinc-400 uppercase text-[10px] border-b border-white/10">
                                        <th className="pb-2">Item</th>
                                        <th className="pb-2 text-center">Qty</th>
                                        <th className="pb-2 text-right">Unit Price</th>
                                        <th className="pb-2 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="py-2.5 font-medium text-white">{item.name}</td>
                                            <td className="py-2.5 text-center text-zinc-300">{item.quantity}</td>
                                            <td className="py-2.5 text-right text-zinc-300">₹{item.price}</td>
                                            <td className="py-2.5 text-right font-bold text-white">₹{item.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Financial Summary */}
                        <div className="py-4 space-y-2 text-xs">
                            <div className="flex justify-between text-zinc-300">
                                <span>Food Items Subtotal</span>
                                <span className="font-semibold text-white">₹{subtotal}</span>
                            </div>
                            <div className="flex justify-between text-zinc-300">
                                <span>Delivery Fee</span>
                                <span className={deliveryFee === 0 ? 'text-emerald-400 font-bold' : 'font-semibold text-white'}>
                                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-zinc-300">
                                <span>Govt Taxes & Restaurant GST</span>
                                <span className="font-semibold text-white">₹{taxAmount}</span>
                            </div>
                            {platformFee > 0 && (
                                <div className="flex justify-between text-zinc-300">
                                    <span>Platform Fee</span>
                                    <span className="font-semibold text-white">₹{platformFee}</span>
                                </div>
                            )}
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-emerald-400 font-bold py-1 bg-emerald-500/10 border border-emerald-500/20 px-2 rounded">
                                    <span>Coupon Discount ({couponCode || 'PROMO'})</span>
                                    <span>- ₹{discountAmount}</span>
                                </div>
                            )}
                            <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                                <div>
                                    <span className="font-extrabold text-base text-white block">Final Total</span>
                                    <span className="text-[10px] text-zinc-400">Inclusive of all taxes</span>
                                </div>
                                <span className="text-2xl font-extrabold text-[#FF6B00]">
                                    ₹{totalAmount}
                                </span>
                            </div>
                        </div>

                        {/* Payment & Settlement Details */}
                        <div className="bg-[#13121A] p-4 rounded-xl border border-white/5 text-xs mt-3 flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Payment Method</span>
                                <span className="font-bold text-white uppercase">{paymentMethod}</span>
                                {transactionId && (
                                    <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">
                                        Ref: {transactionId}
                                    </span>
                                )}
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Payment Status</span>
                                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                                    isPaid 
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                    {isPaid ? 'PAID IN FULL' : 'PAYMENT PENDING'}
                                </span>
                            </div>
                        </div>

                        {/* Footer disclaimer */}
                        <div className="mt-6 pt-4 border-t border-white/10 text-center text-[10px] text-zinc-500">
                            <p>This is a computer-generated tax invoice and requires no physical signature.</p>
                            <p className="mt-0.5">&copy; {new Date().getFullYear()} Cravely Food Delivery. Support: support@cravely.com</p>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex gap-3 mt-4">
                        <button
                            type="button"
                            onClick={downloadPDF}
                            className="flex-1 py-3 rounded-xl bg-[#FF6B00] hover:bg-[#E55A00] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                        >
                            <FaDownload size={13} /> Download PDF Invoice
                        </button>
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="px-5 py-3 rounded-xl bg-black/40 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                        >
                            <FaPrint size={13} /> Print
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default Invoice;
