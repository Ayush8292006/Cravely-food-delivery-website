import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    FaUtensils, FaTruck, FaMedal, FaStar, FaUsers, 
    FaClock, FaAward, FaLeaf, FaHeart, FaCrown, 
    FaUserTie, FaStore, FaEye 
} from 'react-icons/fa'
import { MdDeliveryDining, MdRestaurant } from 'react-icons/md'

function About() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#0a0a0f] pt-24 pb-16">
            {/* Animated Background */}
            <div className="bg-animated">
                <div className="orb"></div>
                <div className="orb"></div>
                <div className="orb"></div>
                <div className="orb" style={{ width: '250px', height: '250px', background: 'rgba(255, 107, 53, 0.12)', top: '60%', left: '30%', animationDelay: '-3s' }} />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4">
                {/* Back Button */}
                <button 
                    className="glass px-5 py-2.5 rounded-full text-sm text-white/70 hover:text-white hover:bg-white/10 transition flex items-center gap-2 mb-8"
                    onClick={() => navigate('/')}
                >
                    ← Back to Home
                </button>

                {/* Header */}
                <div className="text-center mb-16 animate-fade-up">
                    <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-white/70 mb-4">
                        <FaHeart className="text-[#ff2d55]" />
                        <span>About Cravely</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white">
                        <span className="text-gradient-hero">Cravely</span> — Food Delivery
                    </h1>
                    <p className="text-white/50 max-w-2xl mx-auto mt-4 text-lg">
                        Quick, reliable & delicious food delivery at your fingertips.
                    </p>
                </div>

                {/* What We Do */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-center">
                    <div className="space-y-4 animate-fade-left">
                        <h2 className="text-2xl font-bold text-white">What We Do</h2>
                        <p className="text-white/60 leading-relaxed">
                            Cravely connects you with the best restaurants in your city. 
                            Whether you're craving pizza, burgers, or healthy meals — 
                            we bring it all to your doorstep, hot and fresh.
                        </p>
                        <p className="text-white/60 leading-relaxed">
                            With real-time tracking and zero contact delivery, 
                            we ensure a safe and seamless experience every time.
                        </p>
                        <div className="flex gap-6 pt-4">
                            <div>
                                <p className="text-2xl font-bold text-gradient-hero">100+</p>
                                <p className="text-white/40 text-sm">Restaurants</p>
                            </div>
                            <div className="w-px bg-white/10" />
                            <div>
                                <p className="text-2xl font-bold text-gradient-hero">10K+</p>
                                <p className="text-white/40 text-sm">Orders Delivered</p>
                            </div>
                            <div className="w-px bg-white/10" />
                            <div>
                                <p className="text-2xl font-bold text-gradient-hero">4.9★</p>
                                <p className="text-white/40 text-sm">User Rating</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative animate-fade-right">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-[#ff2d55]/10">
                            <img 
                                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop" 
                                alt="Cravely Food Delivery" 
                                className="w-full object-cover h-[300px]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0a0f]/70 via-transparent to-transparent" />
                        </div>
                        <div className="absolute -bottom-4 -right-4 glass-premium p-4 rounded-2xl animate-float">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff2d55] to-[#ff6b35] flex items-center justify-center">
                                    <FaHeart className="text-white text-xl" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Made with ❤️</p>
                                    <p className="text-xs text-white/50">Since 2024</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mission, Vision, Values */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 stagger">
                    <div className="card-premium text-center animate-fade-up">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl glass flex items-center justify-center">
                            <FaCrown className="text-2xl text-[#ff2d55]" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Our Mission</h3>
                        <p className="text-white/50 text-sm">
                            To make delicious food accessible to everyone — fast, fresh, and hassle-free.
                        </p>
                    </div>

                    <div className="card-premium text-center animate-fade-up animation-delay-200">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl glass flex items-center justify-center">
                            <FaEye className="text-2xl text-[#ff6b35]" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Our Vision</h3>
                        <p className="text-white/50 text-sm">
                            To become India's most loved food delivery platform — one order at a time.
                        </p>
                    </div>

                    <div className="card-premium text-center animate-fade-up animation-delay-400">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl glass flex items-center justify-center">
                            <FaHeart className="text-2xl text-[#ffd93d]" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Our Values</h3>
                        <p className="text-white/50 text-sm">
                            Quality, integrity, speed, and customer-first approach in everything we do.
                        </p>
                    </div>
                </div>

                {/* Why Choose Cravely */}
                <div className="mb-20">
                    <h2 className="text-2xl font-bold text-white text-center mb-10">Why Choose Cravely?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { icon: <FaTruck size={28} />, title: 'Lightning Fast', desc: 'Delivered in under 30 minutes' },
                            { icon: <FaUtensils size={28} />, title: 'Premium Quality', desc: 'Fresh ingredients from top restaurants' },
                            { icon: <FaMedal size={28} />, title: '100% Satisfaction', desc: 'Love your meal or get a refund' },
                            { icon: <FaStar size={28} />, title: 'Top Rated', desc: '4.9★ rating from 10K+ customers' },
                        ].map((item, index) => (
                            <div key={index} className="card-premium text-center animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="text-[#ff2d55] flex justify-center mb-3">{item.icon}</div>
                                <h4 className="text-lg font-semibold text-white">{item.title}</h4>
                                <p className="text-white/40 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
                    {[
                        { icon: <FaUsers size={28} />, number: '10K+', label: 'Happy Customers' },
                        { icon: <MdRestaurant size={28} />, number: '100+', label: 'Partner Restaurants' },
                        { icon: <FaClock size={28} />, number: '30min', label: 'Avg Delivery Time' },
                        { icon: <FaStar size={28} />, number: '4.9★', label: 'Customer Rating' },
                    ].map((item, index) => (
                        <div key={index} className="glass-premium p-6 rounded-2xl text-center animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="text-[#ff2d55] flex justify-center mb-3">{item.icon}</div>
                            <p className="text-2xl font-bold text-white">{item.number}</p>
                            <p className="text-white/40 text-sm">{item.label}</p>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="glass-premium p-10 rounded-3xl text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#ff2d55]/10 to-[#ff6b35]/10" />
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold text-white mb-4">Order Now & Experience Cravely</h2>
                        <p className="text-white/50 max-w-xl mx-auto mb-6">
                            Join thousands of happy customers. Order your favorite food today!
                        </p>
                        <button 
                            className="btn-neon px-8 py-3 rounded-full"
                            onClick={() => navigate('/signup')}
                        >
                            Order Now
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                .btn-neon {
                    background: linear-gradient(135deg, #ff2d55, #ff6b35);
                    color: white;
                    padding: 12px 32px;
                    border-radius: 50px;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 0 40px rgba(255, 45, 85, 0.25);
                }
                .btn-neon:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 0 60px rgba(255, 45, 85, 0.4);
                }
            `}</style>
        </div>
    )
}

export default About