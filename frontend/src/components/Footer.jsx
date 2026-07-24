import React from 'react'
import { Link } from 'react-router-dom'
import { 
    FaFacebook, FaTwitter, FaInstagram, FaYoutube, 
    FaLinkedin, FaGithub, FaHeart, FaMotorcycle,
    FaUtensils, FaTruck, FaStar, FaPhone, FaEnvelope,
    FaMapMarkerAlt, FaArrowRight, FaClock, FaShieldAlt
} from 'react-icons/fa'
import { MdDeliveryDining, MdVerified } from 'react-icons/md'

function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="relative bg-[#0a0a0f] border-t border-white/5 overflow-hidden mt-auto">
            
            {/* ✅ Glowing Orbs */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-[#ff2d55]/5 rounded-full blur-3xl" />
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#ff6b35]/5 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#ffd93d]/3 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                
                {/* ✅ Top Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    
                    {/* ✅ Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center shadow-lg shadow-[#ff2d55]/25 group-hover:scale-110 transition-all duration-300">
                                <FaMotorcycle className="text-white text-2xl" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white tracking-tight">
                                    Cravely
                                </h1>
                                <div className="flex items-center gap-1">
                                    <p className="text-[9px] text-white/30 uppercase tracking-[0.2em]">
                                        🍽️ Food Delivery
                                    </p>
                                    <MdVerified size={10} className="text-blue-400" />
                                </div>
                            </div>
                        </div>
                        <p className="text-white/40 text-sm leading-relaxed max-w-xs">
                            Order food from your favorite restaurants and get it delivered 
                            to your doorstep in minutes. 🚀
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <a href="#" className="text-white/30 hover:text-[#ff6b35] transition-all duration-300 hover:scale-110">
                                <FaFacebook size={20} />
                            </a>
                            <a href="#" className="text-white/30 hover:text-[#ff6b35] transition-all duration-300 hover:scale-110">
                                <FaTwitter size={20} />
                            </a>
                            <a href="#" className="text-white/30 hover:text-[#ff6b35] transition-all duration-300 hover:scale-110">
                                <FaInstagram size={20} />
                            </a>
                            <a href="#" className="text-white/30 hover:text-[#ff6b35] transition-all duration-300 hover:scale-110">
                                <FaYoutube size={20} />
                            </a>
                            <a href="#" className="text-white/30 hover:text-[#ff6b35] transition-all duration-300 hover:scale-110">
                                <FaLinkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* ✅ Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                            <span className="w-1 h-4 bg-gradient-to-b from-[#ff2d55] to-[#ff6b35] rounded-full" />
                            Quick Links
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { name: 'Home', path: '/' },
                                { name: 'Restaurants', path: '/restaurants' },
                                { name: 'About Us', path: '/about' },
                                { name: 'Contact', path: '/contact' },
                                { name: 'My Orders', path: '/my-orders' },
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link 
                                        to={item.path}
                                        className="text-white/40 hover:text-white transition-all duration-300 text-sm flex items-center gap-2 group"
                                    >
                                        <span className="w-0 group-hover:w-2 h-px bg-[#ff6b35] transition-all duration-300" />
                                        {item.name}
                                        <FaArrowRight size={10} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 text-[#ff6b35]" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ✅ Support */}
                    <div>
                        <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                            <span className="w-1 h-4 bg-gradient-to-b from-[#ff2d55] to-[#ff6b35] rounded-full" />
                            Support
                        </h3>
                        <ul className="space-y-3">
                            <li className="text-white/40 text-sm flex items-center gap-3 hover:text-white transition-all duration-300">
                                <FaPhone size={14} className="text-[#ff6b35]" />
                                +91 98765 43210
                            </li>
                            <li className="text-white/40 text-sm flex items-center gap-3 hover:text-white transition-all duration-300">
                                <FaEnvelope size={14} className="text-[#ff6b35]" />
                                support@cravely.com
                            </li>
                            <li className="text-white/40 text-sm flex items-center gap-3 hover:text-white transition-all duration-300">
                                <FaMapMarkerAlt size={14} className="text-[#ff6b35]" />
                                Patna, Bihar, India
                            </li>
                            <li className="text-white/40 text-sm flex items-center gap-3 hover:text-white transition-all duration-300">
                                <FaClock size={14} className="text-[#ff6b35]" />
                                24/7 Customer Support
                            </li>
                        </ul>
                    </div>

                    {/* ✅ Features */}
                    <div>
                        <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                            <span className="w-1 h-4 bg-gradient-to-b from-[#ff2d55] to-[#ff6b35] rounded-full" />
                            Features
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-white/40 text-sm hover:text-white transition-all duration-300 group">
                                <div className="w-8 h-8 rounded-lg bg-[#ff2d55]/10 flex items-center justify-center group-hover:bg-[#ff2d55]/20 transition-all duration-300">
                                    <FaUtensils size={14} className="text-[#ff6b35]" />
                                </div>
                                Wide Variety
                            </li>
                            <li className="flex items-center gap-3 text-white/40 text-sm hover:text-white transition-all duration-300 group">
                                <div className="w-8 h-8 rounded-lg bg-[#ff2d55]/10 flex items-center justify-center group-hover:bg-[#ff2d55]/20 transition-all duration-300">
                                    <FaTruck size={14} className="text-[#ff6b35]" />
                                </div>
                                Fast Delivery
                            </li>
                            <li className="flex items-center gap-3 text-white/40 text-sm hover:text-white transition-all duration-300 group">
                                <div className="w-8 h-8 rounded-lg bg-[#ff2d55]/10 flex items-center justify-center group-hover:bg-[#ff2d55]/20 transition-all duration-300">
                                    <FaShieldAlt size={14} className="text-[#ff6b35]" />
                                </div>
                                Secure Payment
                            </li>
                            <li className="flex items-center gap-3 text-white/40 text-sm hover:text-white transition-all duration-300 group">
                                <div className="w-8 h-8 rounded-lg bg-[#ff2d55]/10 flex items-center justify-center group-hover:bg-[#ff2d55]/20 transition-all duration-300">
                                    <FaStar size={14} className="text-[#ff6b35]" />
                                </div>
                                24/7 Support
                            </li>
                        </ul>
                    </div>
                </div>

                {/* ✅ Bottom Section */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-white/20 text-xs text-center md:text-left">
                        © {currentYear} Cravely. All rights reserved.
                    </p>
                    
                    <div className="flex items-center gap-6 text-xs">
                        <Link to="/about" className="text-white/20 hover:text-white/40 transition-all duration-300">
                            About
                        </Link>
                        <Link to="/contact" className="text-white/20 hover:text-white/40 transition-all duration-300">
                            Contact
                        </Link>
                        <span className="text-white/10">|</span>
                        <span className="text-white/20 flex items-center gap-1">
                            Made with <FaHeart size={12} className="text-[#ff2d55] animate-pulse" /> in India
                        </span>
                    </div>

                    {/* ✅ Payment Methods */}
                    <div className="flex items-center gap-3">
                        <span className="text-white/20 text-[10px]">Secure</span>
                        <div className="flex gap-2">
                            <span className="px-2 py-1 rounded bg-white/5 text-white/20 text-[8px] border border-white/5">VISA</span>
                            <span className="px-2 py-1 rounded bg-white/5 text-white/20 text-[8px] border border-white/5">MasterCard</span>
                            <span className="px-2 py-1 rounded bg-white/5 text-white/20 text-[8px] border border-white/5">UPI</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer