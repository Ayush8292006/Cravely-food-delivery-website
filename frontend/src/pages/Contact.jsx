import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    FaEnvelope, FaClock, FaHeart, FaPaperPlane, 
    FaCheckCircle, FaMapMarkerAlt, FaPhoneAlt,
    FaFacebook, FaInstagram, FaTwitter, FaYoutube,
    FaArrowLeft, FaUtensils, FaUtensilSpoon, FaShieldAlt, 
    FaBolt, FaStar, FaRocket, FaGem, FaCrown, FaInfinity
} from 'react-icons/fa'
import { MdEmail, MdLocationOn, MdPhoneIphone, MdVerified } from 'react-icons/md'
import { motion } from 'framer-motion'

function Contact() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const [submitted, setSubmitted] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)

    React.useEffect(() => {
        setTimeout(() => setIsLoaded(true), 300)
    }, [])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Contact Form Data:', formData)
        setSubmitted(true)
        setTimeout(() => setSubmitted(false), 5000)
        setFormData({ name: '', email: '', subject: '', message: '' })
    }

    const fadeUp = `transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#0a0a0f] pt-20 pb-16">
            
            {/* ✅ Premium Animated Background */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div 
                    animate={{ x: [0, 60, -30, 0], y: [0, -40, 50, 0] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-[#ff2d55]/6 rounded-full blur-3xl"
                />
                <motion.div 
                    animate={{ x: [0, -50, 30, 0], y: [0, 40, -50, 0] }}
                    transition={{ duration: 25, repeat: Infinity }}
                    className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-[#ff6b35]/6 rounded-full blur-3xl"
                />
                <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ffd93d]/4 rounded-full blur-3xl"
                />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4">
                
                {/* ✅ Back Button */}
                <motion.button 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.05, rotate: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className='fixed top-6 left-6 z-50 glass-premium px-4 sm:px-5 py-2.5 rounded-full text-white/70 hover:text-white transition-all duration-300 flex items-center gap-2 text-xs sm:text-sm font-medium hover:shadow-2xl hover:shadow-[#ff2d55]/20 border border-white/10 hover:border-[#ff2d55]/30 backdrop-blur-2xl'
                    onClick={() => navigate("/")}
                >
                    <FaArrowLeft size={14} className='group-hover:-translate-x-1 transition-transform' />
                    <span className='hidden sm:inline'>Back to Home</span>
                </motion.button>

                {/* ✅ Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className={`text-center mb-10 sm:mb-12 ${fadeUp}`}
                >
                    <div className="inline-flex items-center gap-2 glass-premium px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm text-white/70 mb-4 border border-white/5">
                        <FaHeart className="text-[#ff2d55] animate-pulse" />
                        <span>Get in Touch</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                        Contact <span className="text-gradient-hero">Us</span>
                    </h1>
                    <p className="text-white/50 max-w-2xl mx-auto mt-3 sm:mt-4 text-sm sm:text-base md:text-lg">
                        Have questions or feedback? We'd love to hear from you!
                    </p>
                </motion.div>

                {/* ===== Contact Cards ===== */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-12">
                    {[
                        { 
                            icon: <MdEmail className="text-2xl text-[#ff2d55]" />, 
                            title: 'Email Us', 
                            desc: 'contact.cravely@gmail.com',
                            sub: 'We reply within 24hrs',
                            color: 'hover:border-[#ff2d55]/30'
                        },
                        { 
                            icon: <FaClock className="text-2xl text-[#ff6b35]" />, 
                            title: 'Working Hours', 
                            desc: 'Mon - Sat: 10:00 AM - 8:00 PM',
                            sub: 'Sunday Closed',
                            color: 'hover:border-[#ff6b35]/30'
                        },
                        { 
                            icon: <FaMapMarkerAlt className="text-2xl text-[#ffd93d]" />, 
                            title: 'Our Location', 
                            desc: 'Patna, Bihar, India',
                            sub: 'Serving across India',
                            color: 'hover:border-[#ffd93d]/30'
                        }
                    ].map((item, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.15 }}
                            whileHover={{ y: -6, scale: 1.02 }}
                            className={`glass-premium p-5 sm:p-6 rounded-2xl text-center border border-white/5 transition-all duration-300 group ${item.color}`}
                        >
                            <motion.div 
                                whileHover={{ scale: 1.15, rotate: 5 }}
                                className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-[#ff2d55]/20 to-[#ff6b35]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                            >
                                {item.icon}
                            </motion.div>
                            <h4 className="text-base sm:text-lg font-semibold text-white">{item.title}</h4>
                            <p className="text-white/50 text-xs sm:text-sm">{item.desc}</p>
                            <p className="text-white/30 text-[10px] sm:text-xs mt-1">{item.sub}</p>
                        </motion.div>
                    ))}
                </div>

                {/* ===== Form + Info ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
                    
                    {/* ✅ Form - 3 columns */}
                    <motion.div 
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-3 glass-premium p-5 sm:p-6 md:p-8 rounded-3xl border border-white/5"
                    >
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-5 sm:mb-6 flex items-center gap-3">
                            <span className="w-1 h-7 sm:h-8 rounded-full bg-gradient-to-b from-[#ff2d55] to-[#ff6b35]" />
                            Send us a Message
                        </h2>
                        
                        {submitted ? (
                            <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex flex-col items-center justify-center py-8 sm:py-12"
                            >
                                <motion.div 
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4"
                                >
                                    <FaCheckCircle className="text-green-400 text-3xl sm:text-4xl" />
                                </motion.div>
                                <p className="text-white font-semibold text-lg sm:text-xl">Message Sent! 🎉</p>
                                <p className="text-white/50 text-xs sm:text-sm mt-1">We'll get back to you soon.</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-white/70 text-xs sm:text-sm font-medium mb-1.5">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter your name"
                                            className="w-full glass-input px-4 py-2.5 sm:py-3 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/50 transition text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-white/70 text-xs sm:text-sm font-medium mb-1.5">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter your email"
                                            className="w-full glass-input px-4 py-2.5 sm:py-3 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/50 transition text-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-white/70 text-xs sm:text-sm font-medium mb-1.5">Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="What's this about?"
                                        className="w-full glass-input px-4 py-2.5 sm:py-3 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/50 transition text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-white/70 text-xs sm:text-sm font-medium mb-1.5">Message</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder="Write your message here..."
                                        className="w-full glass-input px-4 py-2.5 sm:py-3 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/50 transition resize-none text-sm"
                                        required
                                    />
                                </div>

                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="w-full btn-neon py-3 sm:py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base font-semibold"
                                >
                                    <FaPaperPlane size={14} className="sm:text-base" />
                                    Send Message
                                </motion.button>
                            </form>
                        )}
                    </motion.div>

                    {/* ✅ Side Info - 2 columns */}
                    <motion.div 
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-2 space-y-4 sm:space-y-6"
                    >
                        {/* ✅ Social Links */}
                        <div className="glass-premium p-5 sm:p-6 rounded-3xl border border-white/5">
                            <h3 className="text-base sm:text-lg font-semibold text-white text-center mb-4 sm:mb-5">Connect With Us</h3>
                            <div className="flex justify-center gap-3 sm:gap-4">
                                {[
                                    { icon: <FaFacebook size={20} className="sm:text-2xl" />, label: 'Facebook', color: '#1877f2' },
                                    { icon: <FaInstagram size={20} className="sm:text-2xl" />, label: 'Instagram', color: '#e4405f' },
                                    { icon: <FaTwitter size={20} className="sm:text-2xl" />, label: 'Twitter', color: '#1da1f2' },
                                    { icon: <FaYoutube size={20} className="sm:text-2xl" />, label: 'YouTube', color: '#ff0000' },
                                ].map((social, index) => (
                                    <motion.a 
                                        key={index}
                                        whileHover={{ scale: 1.15, y: -4 }}
                                        whileTap={{ scale: 0.9 }}
                                        href="#"
                                        className="w-11 h-11 sm:w-12 sm:h-12 glass-input rounded-xl flex items-center justify-center hover:bg-white/10 transition-all duration-300 hover:shadow-lg"
                                        style={{ color: social.color }}
                                    >
                                        {social.icon}
                                    </motion.a>
                                ))}
                            </div>
                            <p className="text-white/30 text-[10px] sm:text-xs text-center mt-3 sm:mt-4">Follow us for updates & offers</p>
                        </div>

                        {/* ✅ Quick Response */}
                        <div className="glass-premium p-5 sm:p-6 rounded-3xl text-center border border-white/5">
                            <motion.div 
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-full bg-[#ff2d55]/10 flex items-center justify-center"
                            >
                                <FaHeart className="text-[#ff2d55] text-xl sm:text-2xl" />
                            </motion.div>
                            <h4 className="text-white font-semibold text-sm sm:text-base">We're Here to Help!</h4>
                            <p className="text-white/40 text-xs sm:text-sm mt-1">
                                Our team will respond to your query within 24 hours.
                            </p>
                            <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 text-white/50 text-xs sm:text-sm">
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400 animate-pulse" />
                                Online
                            </div>
                        </div>

                        {/* ✅ Brand Badge - Cravely Logo (Spoon + Fork) */}
                        <div className="glass-premium p-4 sm:p-5 rounded-3xl text-center border border-white/5 bg-gradient-to-r from-[#ff2d55]/5 to-[#ff6b35]/5">
                            <div className="flex items-center justify-center gap-2">
                                <div className="flex items-center">
                                    <FaUtensilSpoon className="text-[#ff6b35] text-base sm:text-xl transform -rotate-12" />
                                    <FaUtensils className="text-[#ff2d55] text-sm sm:text-lg transform rotate-12 ml-[-4px]" />
                                </div>
                                <span className="text-white font-bold text-sm sm:text-base">Cravely</span>
                                <MdVerified size={14} className="text-blue-400 sm:text-base" />
                            </div>
                            <p className="text-white/30 text-[10px] sm:text-xs mt-1">🍽️ Food Delivery</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            <style jsx>{`
                .glass-premium {
                    background: rgba(255, 255, 255, 0.04);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }

                .glass-input {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    transition: all 0.3s ease;
                }
                .glass-input:focus {
                    border-color: rgba(255, 107, 53, 0.3);
                    box-shadow: 0 0 25px rgba(255, 107, 53, 0.15);
                }

                .btn-neon {
                    background: linear-gradient(135deg, #ff2d55, #ff6b35);
                    color: white;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 0 40px rgba(255, 45, 85, 0.15);
                }
                .btn-neon:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 0 60px rgba(255, 45, 85, 0.3);
                }

                .text-gradient-hero {
                    background: linear-gradient(135deg, #ff6b35, #ffd93d);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
            `}</style>
        </div>
    )
}

export default Contact