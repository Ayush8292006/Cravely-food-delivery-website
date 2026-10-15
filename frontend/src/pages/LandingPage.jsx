import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  FaArrowRight, FaBars, FaTimes, FaStar, FaMotorcycle,
  FaCheckCircle, FaMapMarkerAlt, FaClock, FaShieldAlt
} from 'react-icons/fa'
import {
  MdDeliveryDining, MdRestaurant, MdSearch, MdShoppingBag, MdLocalShipping
} from 'react-icons/md'
import { motion } from 'framer-motion'

function LandingPage() {
  const navigate = useNavigate()
  const { userData } = useSelector(state => state.user)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [showLanding, setShowLanding] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowLanding(true), 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (showLanding && userData && userData._id) {
      navigate('/home')
    }
  }, [showLanding, userData, navigate])

  if (!showLanding) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-sm animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  if (userData && userData._id) return null

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 font-sans selection:bg-orange-500/30 selection:text-white">
      {/* ========== NAVBAR ========== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <span className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                cravely<span className="text-orange-500">.</span>
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
              {[
                { label: 'Home', path: '/' },
                { label: 'About Us', path: '/about' },
                { label: 'How It Works', path: '#how-it-works' },
                
                { label: 'Contact Us', path: '/contact' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.path}
                  onClick={(e) => {
                    if (item.path.startsWith('#')) return
                    e.preventDefault()
                    navigate(item.path)
                  }}
                  className="hover:text-orange-500 transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full" />
                </a>
              ))}
            </div>

            {/* Order Now Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/signup')}
                className="hidden sm:flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40"
              >
                Order Now <FaArrowRight size={12} />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden text-neutral-400 p-2 hover:text-orange-500 transition"
                onClick={() => setMobileMenu(!mobileMenu)}
              >
                {mobileMenu ? <FaTimes size={22} /> : <FaBars size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-[#141414] border-t border-white/5 px-4 py-4 space-y-3"
          >
            {[
              { label: 'Home', path: '/' },
              { label: 'About Us', path: '/about' },
              { label: 'How It Works', path: '#how-it-works' },
              
              { label: 'Contact Us', path: '/contact' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.path}
                onClick={(e) => {
                  if (!item.path.startsWith('#')) {
                    e.preventDefault()
                    navigate(item.path)
                  }
                  setMobileMenu(false)
                }}
                className="block py-2 text-neutral-400 font-medium hover:text-orange-500"
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={() => {
                navigate('/signup')
                setMobileMenu(false)
              }}
              className="w-full mt-2 bg-orange-500 text-white py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-orange-600 transition"
            >
              Order Now <FaArrowRight size={12} />
            </button>
          </motion.div>
        )}
      </nav>

      {/* ========== HERO SECTION ========== */}
      <section className="relative pt-20 md:pt-24 min-h-[90vh] flex items-center overflow-hidden bg-[#0a0a0f]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1600&h=900&fit=crop"
            alt="Delicious Burger"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 md:py-24">
          <div className="max-w-2xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-orange-400 font-medium text-sm md:text-base mb-3 tracking-wide"
            >
              Crave it. We'll deliver it.
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6"
            >
              Delicious food,{' '}
              <span className="text-orange-400">delivered to you</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-neutral-400 text-base md:text-lg max-w-lg mb-8 leading-relaxed"
            >
              Cravely connects you with your favorite restaurants and delivers happiness right to your doorstep.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4 mb-10"
            >
              <button
                onClick={() => navigate('/signup')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-7 py-3.5 rounded-full font-semibold flex items-center gap-2 transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/60 hover:-translate-y-0.5"
              >
                Order Now <FaArrowRight size={14} />
              </button>
              
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-6 text-sm text-neutral-400"
            >
              <div className="flex items-center gap-2">
                <FaMotorcycle className="text-orange-400" />
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-orange-400" />
                <span>Best Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-orange-400" />
                <span>Easy Payment</span>
              </div>
            </motion.div>
          </div>

          {/* Rating Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="absolute bottom-10 right-4 sm:right-8 md:right-16 bg-[#141414]/80 backdrop-blur-md border border-white/5 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-xl"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  src={`https://i.pravatar.cc/40?img=${i + 10}`}
                  alt="user"
                  className="w-8 h-8 rounded-full border-2 border-[#0a0a0f]"
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 text-white font-semibold">
                4.8 <FaStar className="text-yellow-400 text-sm" />
              </div>
              <p className="text-xs text-neutral-500">10K+ Happy Customers</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== ABOUT SECTION ========== */}
      <section className="py-16 md:py-24 bg-[#0a0a0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div>
              <p className="text-orange-500 font-semibold text-sm tracking-wider uppercase mb-3">
                About Cravely
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                More than just{' '}
                <span className="text-orange-500">food delivery</span>
              </h2>
              <p className="text-neutral-400 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
                Cravely is your ultimate food delivery companion, designed to satisfy your cravings with speed, quality, and convenience. From local favorites to gourmet meals, we bring everything you love right to your door.
              </p>
              <button
                onClick={() => navigate('/about')}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-md hover:shadow-lg"
              >
                Learn More About Us <FaArrowRight size={13} />
              </button>
            </div>

            {/* Right Images Grid */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img
                    src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=400&h=300&fit=crop"
                    alt="Food"
                    className="rounded-2xl object-cover h-40 w-full shadow-lg border border-white/5"
                  />
                  <div className="bg-[#141414] border border-white/5 rounded-2xl p-4 flex items-center gap-3 shadow-md">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-400">
                      <FaClock size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">Quick Delivery</p>
                      <p className="text-xs text-neutral-500">At Your Doorstep</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <img
                    src="https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=500&fit=crop"
                    alt="Delivery Bag"
                    className="rounded-2xl object-cover h-52 w-full shadow-lg border border-white/5"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop"
                    alt="Delivery Partner"
                    className="rounded-2xl object-cover h-36 w-full shadow-lg border border-white/5"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how-it-works" className="py-16 md:py-24 bg-[#0f0f15]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-orange-500 font-semibold text-sm tracking-wider uppercase mb-2">
              How It Works
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              Food delivery in{' '}
              <span className="text-orange-500">3 simple steps</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (desktop) */}
            <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-0.5 bg-orange-500/20" />

            {[
              {
                icon: <MdSearch size={28} />,
                step: '01',
                title: 'Choose Your Food',
                desc: 'Browse from a wide range of restaurants and cuisines',
              },
              {
                icon: <MdShoppingBag size={28} />,
                step: '02',
                title: 'Place Your Order',
                desc: 'Add to cart, choose payment method and place your order',
              },
              {
                icon: <MdLocalShipping size={28} />,
                step: '03',
                title: 'Get It Delivered',
                desc: 'Sit back and relax while we deliver to your doorstep',
              },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                viewport={{ once: true }}
                className="relative bg-[#141414] border border-white/5 rounded-2xl p-8 text-center shadow-sm hover:shadow-xl hover:border-orange-500/30 transition-all"
              >
                <div className="w-16 h-16 mx-auto mb-5 bg-orange-500/10 text-orange-400 rounded-2xl flex items-center justify-center relative z-10">
                  {item.icon}
                </div>
                <span className="inline-block text-orange-500 font-bold text-sm mb-2">
                  {item.step}
                </span>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== STATS SECTION ========== */}
      <section className="py-12 md:py-16 bg-[#0a0a0f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10K+', label: 'Happy Customers', icon: <FaStar /> },
              { value: '500+', label: 'Top Restaurants', icon: <MdRestaurant /> },
              { value: '50+', label: 'Cities Covered', icon: <FaMapMarkerAlt /> },
              { value: '99%', label: 'On-Time Delivery', icon: <FaClock /> },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="space-y-2"
              >
                <div className="text-orange-400 text-2xl flex justify-center mb-1">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold">{stat.value}</div>
                <p className="text-neutral-500 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== APP DOWNLOAD SECTION ========== */}
      <section className="py-16 md:py-24 bg-[#0f0f15] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-orange-500 font-semibold text-sm tracking-wider uppercase mb-3">
                Download Our App
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                Better experience{' '}
                <span className="text-orange-500">on the app</span>
              </h2>
              <p className="text-neutral-400 text-base md:text-lg mb-8 max-w-md">
                Get the Cravely app for faster ordering, exclusive offers, and a smoother experience.
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  href="#"
                  className="flex items-center gap-3 bg-white text-black px-5 py-3 rounded-xl hover:bg-gray-200 transition"
                >
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.337 1.351c.8.462.849 1.485.107 2.011l-.107.066-2.337 1.351-2.47-2.47 2.47-2.309zM5.864 2.658L16.802 8.99l-2.302 2.302-8.636-8.634z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] leading-none opacity-80">GET IT ON</p>
                    <p className="text-sm font-semibold">Google Play</p>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 bg-white text-black px-5 py-3 rounded-xl hover:bg-gray-200 transition"
                >
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] leading-none opacity-80">Download on the</p>
                    <p className="text-sm font-semibold">App Store</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="relative flex justify-center">
              <div className="relative w-64 md:w-72">
                <div className="bg-[#1a1a1a] rounded-[2.5rem] p-3 shadow-2xl border border-white/5">
                  <div className="bg-[#0a0a0f] rounded-[2rem] overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=800&fit=crop"
                      alt="App Screenshot"
                      className="w-full h-[480px] object-cover"
                    />
                  </div>
                </div>
                {/* Decorative food images */}
                <img
                  src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=150&h=150&fit=crop"
                  alt="Pizza"
                  className="absolute -left-10 top-20 w-24 h-24 rounded-2xl object-cover shadow-xl rotate-[-8deg] border border-white/5 hidden sm:block"
                />
                <img
                  src="https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=150&h=150&fit=crop"
                  alt="Pasta"
                  className="absolute -right-8 bottom-24 w-28 h-28 rounded-2xl object-cover shadow-xl rotate-[6deg] border border-white/5 hidden sm:block"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1600&h=800&fit=crop"
            alt="Pizza"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0a0a0f]/80" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white mb-4"
          >
            Hungry? We've{' '}
            <span className="text-orange-400">got you!</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-neutral-400 text-lg mb-8"
          >
            Explore restaurants and order your favorite meal now.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            onClick={() => navigate('/signup')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center gap-2 mx-auto shadow-xl shadow-orange-500/30 hover:shadow-orange-500/60 transition-all hover:-translate-y-1"
          >
            Order Now <FaArrowRight />
          </motion.button>
        </div>
      </section>

    </div>
  )
}

export default LandingPage
