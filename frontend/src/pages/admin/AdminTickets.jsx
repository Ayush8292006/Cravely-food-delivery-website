import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../../../config'
import AdminLayout from './AdminLayout'
import { FaHeadset, FaSearch, FaCheckCircle, FaClock, FaCommentDots, FaPaperPlane, FaSync } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'

function AdminTickets() {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedTicket, setSelectedTicket] = useState(null)
    const [replyText, setReplyText] = useState('')
    const [replying, setReplying] = useState(false)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        fetchTickets()
    }, [])

    const fetchTickets = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`${serverUrl}/api/support/all`, { withCredentials: true })
            setTickets(res.data || [])
        } catch (error) {
            toast.error('Failed to load support tickets')
        } finally {
            setLoading(false)
        }
    }

    const handleSendReply = async () => {
        if (!replyText.trim() || !selectedTicket) return
        setReplying(true)
        try {
            const res = await axios.post(`${serverUrl}/api/support/${selectedTicket._id}/respond`, {
                message: replyText
            }, { withCredentials: true })
            toast.success('Reply sent to customer')
            setReplyText('')
            setSelectedTicket(res.data)
            fetchTickets()
        } catch (error) {
            toast.error('Failed to send reply')
        } finally {
            setReplying(false)
        }
    }

    const handleUpdateStatus = async (ticketId, status) => {
        try {
            const res = await axios.put(`${serverUrl}/api/support/${ticketId}/status`, { status }, { withCredentials: true })
            toast.success(`Ticket marked as ${status}`)
            if (selectedTicket?._id === ticketId) {
                setSelectedTicket(res.data.ticket)
            }
            fetchTickets()
        } catch (error) {
            toast.error('Failed to update ticket status')
        }
    }

    const filtered = tickets.filter(t => {
        if (filter === 'all') return true
        return t.status === filter
    })

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <FaHeadset className="text-orange-500" /> Customer Support Tickets
                        </h1>
                        <p className="text-white/40 text-sm mt-1">
                            Resolve customer issues, reply to tickets, and track complaint resolutions.
                        </p>
                    </div>
                    <button
                        onClick={fetchTickets}
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/50 text-white text-sm flex items-center gap-2 transition"
                    >
                        <FaSync size={12} /> Refresh
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 border-b border-white/5 pb-2 overflow-x-auto">
                    {['all', 'open', 'in_progress', 'resolved', 'closed'].map((st) => (
                        <button
                            key={st}
                            onClick={() => setFilter(st)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition ${
                                filter === st
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20'
                                    : 'bg-white/5 text-white/50 hover:text-white'
                            }`}
                        >
                            {st.replace('_', ' ')} ({st === 'all' ? tickets.length : tickets.filter(t => t.status === st).length})
                        </button>
                    ))}
                </div>

                {/* Main Split: Tickets List & Details */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* List */}
                    <div className="lg:col-span-5 space-y-3">
                        {loading ? (
                            <div className="text-center py-12 text-white/40">Loading tickets...</div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-12 text-white/40 bg-[#12121c] rounded-2xl border border-white/5">
                                No tickets found in this view.
                            </div>
                        ) : (
                            filtered.map((ticket) => (
                                <div
                                    key={ticket._id}
                                    onClick={() => setSelectedTicket(ticket)}
                                    className={`p-4 rounded-2xl border cursor-pointer transition ${
                                        selectedTicket?._id === ticket._id
                                            ? 'bg-orange-500/10 border-orange-500/50'
                                            : 'bg-[#12121c] border-white/5 hover:border-white/20'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <span className="font-mono text-xs font-semibold text-orange-400">
                                            {ticket.ticketId}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                            ticket.status === 'open' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                            ticket.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        }`}>
                                            {ticket.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-semibold text-white mb-1 line-clamp-1">{ticket.subject}</h4>
                                    <p className="text-xs text-white/50 line-clamp-2 mb-3">{ticket.message}</p>
                                    <div className="flex items-center justify-between text-[11px] text-white/40 pt-2 border-t border-white/5">
                                        <span>{ticket.user?.fullName || 'Customer'}</span>
                                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Thread Details */}
                    <div className="lg:col-span-7">
                        {selectedTicket ? (
                            <div className="bg-[#12121c] border border-white/5 rounded-2xl p-6 flex flex-col h-[650px] shadow-2xl">
                                {/* Header */}
                                <div className="border-b border-white/5 pb-4 mb-4">
                                    <div className="flex items-center justify-between gap-3 mb-2">
                                        <div>
                                            <span className="font-mono text-xs text-orange-400 font-bold">{selectedTicket.ticketId}</span>
                                            <h3 className="text-lg font-bold text-white">{selectedTicket.subject}</h3>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleUpdateStatus(selectedTicket._id, 'in_progress')}
                                                className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition"
                                            >
                                                In Progress
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(selectedTicket._id, 'resolved')}
                                                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition"
                                            >
                                                Resolve
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-white/40">
                                        <span>Customer: <strong className="text-white/70">{selectedTicket.user?.fullName}</strong></span>
                                        <span>Email: <strong className="text-white/70">{selectedTicket.user?.email}</strong></span>
                                        <span>Category: <strong className="text-white/70 capitalize">{selectedTicket.category?.replace('_', ' ')}</strong></span>
                                    </div>
                                </div>

                                {/* Messages Thread */}
                                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                    {(selectedTicket.responses || []).map((resp, idx) => {
                                        const isAdmin = resp.sender === 'admin' || resp.sender === 'support'
                                        return (
                                            <div
                                                key={idx}
                                                className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                                            >
                                                <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm ${
                                                    isAdmin
                                                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-br-none shadow-lg shadow-orange-500/10'
                                                        : 'bg-white/5 text-white/90 border border-white/10 rounded-bl-none'
                                                }`}>
                                                    <div className="text-[10px] opacity-75 font-semibold mb-1">
                                                        {resp.senderName || (isAdmin ? 'Cravely Support Specialist' : 'Customer')}
                                                    </div>
                                                    <p className="whitespace-pre-wrap leading-relaxed">{resp.message}</p>
                                                    <div className="text-[9px] opacity-60 text-right mt-1">
                                                        {new Date(resp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Reply Input Box */}
                                <div className="pt-4 border-t border-white/5 flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Type reply to customer..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500"
                                    />
                                    <button
                                        onClick={handleSendReply}
                                        disabled={replying || !replyText.trim()}
                                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50 transition"
                                    >
                                        <FaPaperPlane size={12} /> {replying ? 'Sending...' : 'Reply'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#12121c] border border-white/5 rounded-2xl p-12 text-center text-white/40 h-[650px] flex flex-col items-center justify-center">
                                <FaCommentDots className="text-4xl text-white/10 mb-3" />
                                <p>Select a support ticket from the list to view the conversation thread and respond.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminTickets

