import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../../config'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import {
    FaHeadset, FaSearch, FaQuestionCircle, FaRobot, FaPaperPlane,
    FaTicketAlt, FaShieldAlt, FaUndo, FaClock, FaCheckCircle,
    FaChevronDown, FaChevronUp, FaPlus, FaComments
} from 'react-icons/fa'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'

const FAQ_CATEGORIES = [
    {
        id: 'orders',
        name: 'Orders & Tracking',
        icon: '📦',
        faqs: [
            {
                q: 'How can I track my live order?',
                a: 'You can track your order in real-time from the "My Orders" page or by clicking "Track Order" on your active order card. You will see every stage from kitchen preparation to delivery partner assignment.'
            },
            {
                q: 'Can I modify my order after placing it?',
                a: 'Once an order is accepted by the restaurant kitchen, items cannot be changed. However, you can add special cooking instructions during checkout before placing your order.'
            },
            {
                q: 'What should I do if my order is delayed?',
                a: 'Our delivery partners strive to deliver within 30-40 minutes. If delayed due to high traffic or weather, the estimated time updates automatically on your tracking screen, or you can message our assistant below.'
            }
        ]
    },
    {
        id: 'refunds',
        name: 'Cancellation & Refunds',
        icon: '💳',
        faqs: [
            {
                q: 'How do I cancel my order?',
                a: 'You can cancel an order directly from the "Track Order" or "My Orders" screen before the delivery partner is dispatched. Choose your cancellation reason to submit.'
            },
            {
                q: 'When will I receive my refund?',
                a: 'For online payments (Razorpay), refunds are initiated instantly upon cancellation. In test mode, it reflects immediately in your payment history. In production, banks process it within 2 to 5 business days.'
            },
            {
                q: 'Where can I check my refund status?',
                a: 'Visit your Profile Dashboard under "Payment & Refund History" or check the specific order card in "My Orders" to see your refund status (Processing or Completed).'
            }
        ]
    },
    {
        id: 'payments',
        name: 'Payments & Razorpay',
        icon: '🔒',
        faqs: [
            {
                q: 'What payment methods are supported?',
                a: 'We support all major payment methods powered securely by Razorpay: UPI (GPay, PhonePe, Paytm), Credit & Debit cards, NetBanking, and Cash on Delivery (COD).'
            },
            {
                q: 'My payment was deducted but the order was not placed. What should I do?',
                a: 'In rare banking network drops, Razorpay automatically reverses unconfirmed debits within 24-48 hours. You can also raise a ticket below with your transaction ID for instant manual review.'
            }
        ]
    },
    {
        id: 'coupons',
        name: 'Coupons & Offers',
        icon: '🎟️',
        faqs: [
            {
                q: 'How do I apply a discount coupon?',
                a: 'On the Cart or Checkout screen, browse the available coupons section or type codes like "CRAVELY50" or "WELCOME100" and click "Apply". The discount is calculated and subtracted instantly.'
            },
            {
                q: 'Why is my coupon code not applying?',
                a: 'Each coupon has a minimum order value requirement (e.g. ₹199 for CRAVELY50). Ensure your cart items meet the minimum threshold and that the coupon has not expired.'
            }
        ]
    }
]

function HelpSupport() {
    const { userData } = useSelector(state => state.user)
    const [activeTab, setActiveTab] = useState('assistant') // 'assistant', 'faqs', 'tickets'
    const [searchQuery, setSearchQuery] = useState('')
    const [openFaq, setOpenFaq] = useState(null)
    const [userOrders, setUserOrders] = useState([])
    
    // Assistant Chat
    const [chatMessages, setChatMessages] = useState([
        {
            sender: 'bot',
            text: `Hi ${userData?.fullName ? userData.fullName.split(' ')[0] : 'there'}! 👋 I am Cravely's Smart Support Assistant. How can I assist you today?`,
            time: new Date()
        }
    ])
    const [inputText, setInputText] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const chatEndRef = useRef(null)

    // Tickets
    const [myTickets, setMyTickets] = useState([])
    const [showTicketModal, setShowTicketModal] = useState(false)
    const [ticketSubject, setTicketSubject] = useState('')
    const [ticketCategory, setTicketCategory] = useState('order_status')
    const [ticketOrder, setTicketOrder] = useState('')
    const [ticketMessage, setTicketMessage] = useState('')
    const [submittingTicket, setSubmittingTicket] = useState(false)

    useEffect(() => {
        fetchUserOrders()
        if (userData?._id) {
            fetchMyTickets()
        }
    }, [userData])

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chatMessages, isTyping])

    const fetchUserOrders = async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/order/my-orders`, { withCredentials: true })
            setUserOrders(res.data || [])
        } catch (e) {}
    }

    const fetchMyTickets = async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/support/my-tickets`, { withCredentials: true })
            setMyTickets(res.data || [])
        } catch (e) {}
    }

    const handleSendMessage = (textToSend = null) => {
        const query = textToSend || inputText
        if (!query.trim()) return

        const userMsg = { sender: 'user', text: query, time: new Date() }
        setChatMessages(prev => [...prev, userMsg])
        if (!textToSend) setInputText('')
        setIsTyping(true)

        setTimeout(() => {
            const botReply = generateSmartResponse(query.toLowerCase())
            setChatMessages(prev => [...prev, { sender: 'bot', text: botReply, time: new Date() }])
            setIsTyping(false)
        }, 600)
    }

    const generateSmartResponse = (q) => {
        const latestOrder = userOrders[0]

        if (q.includes('where is my order') || q.includes('track') || q.includes('status of my order')) {
            if (latestOrder) {
                const shopOrder = latestOrder.shopOrders?.[0]
                const status = shopOrder?.status || 'placed'
                return `📦 Your latest order #${latestOrder._id.slice(-6).toUpperCase()} (₹${latestOrder.totalAmount}) is currently in status: "${status.toUpperCase()}". You can view real-time live map tracking on your "Track Order" page!`
            }
            return "I couldn't find any recent orders for your account. You can browse restaurants from the homepage and place your first delicious order!"
        }

        if (q.includes('cancel') || q.includes('cancellation')) {
            if (latestOrder && !latestOrder.isCancelled) {
                return `To cancel order #${latestOrder._id.slice(-6).toUpperCase()}, open your "Track Order" or "My Orders" page and tap "Cancel Order". If eligible (prior to food dispatch), your refund is automatically processed immediately!`
            }
            return "You can cancel any eligible order directly from 'My Orders' before the delivery partner picks it up. Once cancelled, your refund is processed according to our transparent policy."
        }

        if (q.includes('refund') || q.includes('money back')) {
            if (latestOrder && latestOrder.refundStatus) {
                return `💳 Your refund for order #${latestOrder._id.slice(-6).toUpperCase()} is currently: "${latestOrder.refundStatus.toUpperCase()}" for ₹${latestOrder.refundAmount || latestOrder.totalAmount}. Razorpay test refunds are credited directly back to the original method.`
            }
            return "Refunds for online payments are processed instantly to your Razorpay source account. You can review all refund statuses anytime under Profile > Payment & Refund History."
        }

        if (q.includes('coupon') || q.includes('discount') || q.includes('promo')) {
            return "🎉 We have exclusive active offers for you! Use code 'CRAVELY50' for 50% off (up to ₹150) or 'WELCOME100' for flat ₹100 off on your first order. Check out our Offers page for all coupons!"
        }

        if (q.includes('payment') || q.includes('deducted') || q.includes('razorpay')) {
            return "All payments are securely processed through Razorpay. If money was debited but the order was interrupted, please click the 'Raise Ticket' button so our team can immediately verify the transaction ID."
        }

        if (q.includes('contact') || q.includes('human') || q.includes('agent') || q.includes('support')) {
            return "You can reach our dedicated support specialists 24/7! Click 'Raise Ticket' below or email us at contact.cravely@gmail.com. We typically resolve tickets within 15 minutes."
        }

        return "I can help with order tracking, refunds, payment inquiries, coupon codes, and support tickets. Try clicking one of the quick suggestions below or raise a ticket for personal assistance!"
    }

    const handleCreateTicket = async (e) => {
        e.preventDefault()
        if (!ticketSubject || !ticketMessage) {
            toast.error('Please enter subject and message')
            return
        }
        setSubmittingTicket(true)
        try {
            const res = await axios.post(`${serverUrl}/api/support/create`, {
                subject: ticketSubject,
                category: ticketCategory,
                orderId: ticketOrder || null,
                message: ticketMessage
            }, { withCredentials: true })
            toast.success('Support ticket created successfully! 🎫')
            setShowTicketModal(false)
            setTicketSubject('')
            setTicketMessage('')
            fetchMyTickets()
            setActiveTab('tickets')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create ticket')
        } finally {
            setSubmittingTicket(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col font-sans">
            <Nav />

            <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
                {/* Header Banner */}
                <div className="relative rounded-3xl bg-gradient-to-r from-orange-600/20 via-red-600/10 to-amber-600/20 border border-white/10 p-6 md:p-10 mb-8 overflow-hidden shadow-2xl">
                    <div className="relative z-10 max-w-2xl">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase tracking-wider mb-3 inline-block">
                            Cravely Care 24/7
                        </span>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
                            How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">help you</span> today?
                        </h1>
                        <p className="text-white/60 text-sm md:text-base leading-relaxed">
                            Instant answers to orders, payments, refunds, and food inquiries with our Smart Support Assistant.
                        </p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            onClick={() => setActiveTab('assistant')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
                                activeTab === 'assistant'
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                                    : 'bg-white/5 border border-white/10 text-white/70 hover:text-white'
                            }`}
                        >
                            <FaRobot /> Smart Assistant
                        </button>
                        <button
                            onClick={() => setActiveTab('faqs')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
                                activeTab === 'faqs'
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                                    : 'bg-white/5 border border-white/10 text-white/70 hover:text-white'
                            }`}
                        >
                            <FaQuestionCircle /> Help Center & FAQs
                        </button>
                        <button
                            onClick={() => setActiveTab('tickets')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
                                activeTab === 'tickets'
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                                    : 'bg-white/5 border border-white/10 text-white/70 hover:text-white'
                            }`}
                        >
                            <FaTicketAlt /> My Support Tickets ({myTickets.length})
                        </button>
                    </div>
                </div>

                {/* TAB 1: Smart Support Assistant */}
                {activeTab === 'assistant' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Chat Interface */}
                        <div className="lg:col-span-8 bg-[#12121c] border border-white/10 rounded-3xl p-5 md:p-6 flex flex-col h-[600px] shadow-2xl relative">
                            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                                        <FaRobot size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-base">Cravely AI Assistant</h3>
                                        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Connected to your live order data
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowTicketModal(true)}
                                    className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500 text-xs font-medium text-white/80 hover:text-white transition flex items-center gap-1.5"
                                >
                                    <FaTicketAlt size={11} /> Raise Ticket
                                </button>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                {chatMessages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                                    >
                                        <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                                            msg.sender === 'user'
                                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-br-none shadow-lg shadow-orange-500/20'
                                                : 'bg-white/5 border border-white/10 text-white/90 rounded-bl-none'
                                        }`}>
                                            {msg.text}
                                        </div>
                                        <span className="text-[10px] text-white/30 mt-1 px-1">
                                            {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))}

                                {isTyping && (
                                    <div className="flex items-center gap-2 text-white/40 text-xs py-2">
                                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                                        Cravely Assistant is searching order records...
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Quick Questions */}
                            <div className="pt-3 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                                {[
                                    'Where is my order?',
                                    'How can I cancel my order?',
                                    'When will I get my refund?',
                                    'How do I apply a coupon?'
                                ].map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSendMessage(prompt)}
                                        className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/70 hover:text-white transition"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>

                            {/* Input Form */}
                            <div className="pt-3 border-t border-white/5 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Ask anything about your orders, refunds, delivery..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition"
                                />
                                <button
                                    onClick={() => handleSendMessage()}
                                    disabled={!inputText.trim()}
                                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-40 transition"
                                >
                                    <FaPaperPlane size={13} />
                                </button>
                            </div>
                        </div>

                        {/* Recent Order Status Card & Quick Links */}
                        <div className="lg:col-span-4 space-y-6">
                            {userOrders.length > 0 ? (
                                <div className="bg-[#12121c] border border-white/10 rounded-3xl p-6 shadow-2xl">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400">
                                        Your Latest Order
                                    </span>
                                    <div className="mt-2 flex items-center justify-between">
                                        <h4 className="font-mono font-bold text-white text-base">
                                            #{userOrders[0]._id.slice(-6).toUpperCase()}
                                        </h4>
                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                            {userOrders[0].shopOrders?.[0]?.status || 'Active'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-white/50 mt-1">
                                        Total: <strong className="text-white">₹{userOrders[0].totalAmount}</strong> • {userOrders[0].shopOrders?.[0]?.shop?.name || 'Restaurant'}
                                    </p>

                                    <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                                        <a
                                            href={`/track-order/${userOrders[0]._id}`}
                                            className="flex-1 text-center py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-md shadow-orange-500/20 transition"
                                        >
                                            Live Tracking
                                        </a>
                                        <button
                                            onClick={() => {
                                                setTicketOrder(userOrders[0]._id)
                                                setTicketSubject(`Issue with order #${userOrders[0]._id.slice(-6).toUpperCase()}`)
                                                setShowTicketModal(true)
                                            }}
                                            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 transition"
                                        >
                                            Get Help
                                        </button>
                                    </div>
                                </div>
                            ) : null}

                            <div className="bg-[#12121c] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
                                <h3 className="font-bold text-white text-sm">Need Direct Human Support?</h3>
                                <p className="text-xs text-white/50 leading-relaxed">
                                    Can't find the answer or need assistance with a payment or restaurant dispute? Raise a high-priority ticket.
                                </p>
                                <button
                                    onClick={() => setShowTicketModal(true)}
                                    className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
                                >
                                    <FaTicketAlt className="text-orange-500" /> Raise Support Ticket
                                </button>
                                <div className="text-center text-[11px] text-white/30 pt-2 border-t border-white/5">
                                    Direct Email: <a href="mailto:contact.cravely@gmail.com" className="text-orange-400 underline">contact.cravely@gmail.com</a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: FAQs */}
                {activeTab === 'faqs' && (
                    <div className="space-y-6">
                        <div className="max-w-xl mx-auto mb-8">
                            <div className="relative">
                                <FaSearch className="absolute left-4 top-3.5 text-white/40" />
                                <input
                                    type="text"
                                    placeholder="Search help articles, topics, keywords..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#12121c] border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition shadow-xl"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {FAQ_CATEGORIES.map((category) => {
                                const matchedFaqs = category.faqs.filter(f =>
                                    !searchQuery ||
                                    f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    f.a.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                if (matchedFaqs.length === 0) return null

                                return (
                                    <div key={category.id} className="bg-[#12121c] border border-white/10 rounded-3xl p-6 shadow-2xl">
                                        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-white/5">
                                            <span className="text-2xl">{category.icon}</span>
                                            <h3 className="font-bold text-lg text-white">{category.name}</h3>
                                        </div>

                                        <div className="space-y-3">
                                            {matchedFaqs.map((faq, i) => {
                                                const isOpen = openFaq === `${category.id}-${i}`
                                                return (
                                                    <div
                                                        key={i}
                                                        className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.02]"
                                                    >
                                                        <button
                                                            onClick={() => setOpenFaq(isOpen ? null : `${category.id}-${i}`)}
                                                            className="w-full p-4 text-left flex items-center justify-between gap-3 text-sm font-semibold text-white/90 hover:text-white transition"
                                                        >
                                                            <span>{faq.q}</span>
                                                            {isOpen ? <FaChevronUp className="text-orange-500 text-xs shrink-0" /> : <FaChevronDown className="text-white/40 text-xs shrink-0" />}
                                                        </button>
                                                        {isOpen && (
                                                            <div className="px-4 pb-4 text-xs text-white/60 leading-relaxed border-t border-white/5 pt-3">
                                                                {faq.a}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* TAB 3: My Support Tickets */}
                {activeTab === 'tickets' && (
                    <div className="bg-[#12121c] border border-white/10 rounded-3xl p-6 shadow-2xl">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4 mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white">My Support Tickets</h3>
                                <p className="text-xs text-white/50 mt-0.5">Track inquiries and responses from our support specialists.</p>
                            </div>
                            <button
                                onClick={() => setShowTicketModal(true)}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-xs shadow-lg shadow-orange-500/20 transition flex items-center gap-2"
                            >
                                <FaPlus size={10} /> Create New Ticket
                            </button>
                        </div>

                        {myTickets.length === 0 ? (
                            <div className="text-center py-16 text-white/40">
                                <FaTicketAlt className="text-4xl text-white/10 mx-auto mb-3" />
                                <p>You haven't raised any support tickets yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myTickets.map((t) => (
                                    <div
                                        key={t._id}
                                        className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition"
                                    >
                                        <div className="flex items-center justify-between gap-3 mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-xs font-bold text-orange-400">{t.ticketId}</span>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                    t.status === 'open' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                    t.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                }`}>
                                                    {t.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <span className="text-[11px] text-white/40">{new Date(t.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        <h4 className="text-base font-semibold text-white mb-2">{t.subject}</h4>
                                        <p className="text-xs text-white/60 mb-4">{t.message}</p>

                                        {t.responses?.length > 1 && (
                                            <div className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-2">
                                                <div className="text-[10px] uppercase font-bold text-orange-400">Latest Response</div>
                                                <div className="text-xs text-white/90">
                                                    {t.responses[t.responses.length - 1].message}
                                                </div>
                                                <div className="text-[9px] text-white/30 text-right">
                                                    — {t.responses[t.responses.length - 1].senderName}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Raise Ticket Modal */}
            {showTicketModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#181824] border border-white/10 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <FaTicketAlt className="text-orange-500" /> Raise Support Ticket
                        </h3>
                        <p className="text-xs text-white/50 mb-5">
                            Our support team will review your inquiry and respond within 15 minutes.
                        </p>

                        <form onSubmit={handleCreateTicket} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-white/70 mb-1">Category *</label>
                                <select
                                    value={ticketCategory}
                                    onChange={(e) => setTicketCategory(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500"
                                >
                                    <option value="order_status" className="bg-[#181824]">Order Status & Delivery</option>
                                    <option value="payment_refund" className="bg-[#181824]">Payment & Refund Issue</option>
                                    <option value="food_quality" className="bg-[#181824]">Food Quality & Missing Items</option>
                                    <option value="account" className="bg-[#181824]">Account & Profile</option>
                                    <option value="other" className="bg-[#181824]">Other Inquiries</option>
                                </select>
                            </div>

                            {userOrders.length > 0 && (
                                <div>
                                    <label className="block text-xs font-medium text-white/70 mb-1">Related Order (Optional)</label>
                                    <select
                                        value={ticketOrder}
                                        onChange={(e) => setTicketOrder(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500"
                                    >
                                        <option value="" className="bg-[#181824]">-- None / General Inquiry --</option>
                                        {userOrders.map((ord) => (
                                            <option key={ord._id} value={ord._id} className="bg-[#181824]">
                                                Order #{ord._id.slice(-6).toUpperCase()} (₹{ord.totalAmount})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-medium text-white/70 mb-1">Subject *</label>
                                <input
                                    type="text"
                                    placeholder="Brief summary of your issue"
                                    value={ticketSubject}
                                    onChange={(e) => setTicketSubject(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-white/70 mb-1">Detailed Description *</label>
                                <textarea
                                    rows="4"
                                    placeholder="Please describe what happened in detail..."
                                    value={ticketMessage}
                                    onChange={(e) => setTicketMessage(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 resize-none"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowTicketModal(false)}
                                    className="px-4 py-2.5 rounded-xl bg-white/5 text-white/60 hover:text-white text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingTicket}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-sm shadow-lg shadow-orange-500/20 disabled:opacity-50"
                                >
                                    {submittingTicket ? 'Submitting...' : 'Submit Ticket'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            <Footer />
        </div>
    )
}

export default HelpSupport

