import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../../config'
import { toast } from 'react-toastify'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  FaArrowRight, FaBars, FaTimes, FaStar, FaMotorcycle,
  FaMapMarkerAlt, FaShieldAlt, FaUtensils, FaBolt, FaLeaf,
  FaChevronRight, FaChevronLeft, FaChevronDown, FaPlay,
  FaBoxOpen, FaShoppingCart, FaHome, FaHandshake,
  FaPhoneAlt, FaEnvelope, FaInstagram, FaFacebookF,
  FaYoutube, FaTwitter, FaArrowUp, FaCheckCircle
} from 'react-icons/fa'
import LocationSelector from '../components/LocationSelector'

// ✅ Bespoke Studio Assets Matching Reference Images 1:1
import heroScooterImg from '../assets/hero-scooter.jpg'
import heroPizzaImg from '../assets/hero-pizza.jpg'
import journeyRiderImg from '../assets/journey-rider.jpg'
import freshnessBurgerImg from '../assets/freshness-burger.jpg'
import howBagImg from '../assets/how-bag.jpg'
import offersPizzaImg from '../assets/offers-pizza.jpg'
import ctaFeastImg from '../assets/cta-feast.jpg'

gsap.registerPlugin(ScrollTrigger)

const DEFAULT_RESTAURANTS = [
  {
    _id: 'default-dominos',
    name: "Domino's Pizza",
    deliveryTime: '30-40 min',
    rating: { average: 4.5 },
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700&auto=format&fit=crop&q=80'
  },
  {
    _id: 'default-burgerking',
    name: 'Burger King',
    deliveryTime: '25-35 min',
    rating: { average: 4.6 },
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&auto=format&fit=crop&q=80'
  },
  {
    _id: 'default-mcdonalds',
    name: "McDonald's",
    deliveryTime: '30-40 min',
    rating: { average: 4.8 },
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=700&auto=format&fit=crop&q=80'
  },
  {
    _id: 'default-biryani',
    name: 'Behrouz Royal Biryani',
    deliveryTime: '28-35 min',
    rating: { average: 4.9 },
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80'
  },
  {
    _id: 'default-wok',
    name: 'Mainland China Wok',
    deliveryTime: '25-35 min',
    rating: { average: 4.7 },
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=700&auto=format&fit=crop&q=80'
  }
]

const DELIVERY_STAGES = [
  {
    num: '01',
    title: 'Order\nPlaced',
    shortTitle: 'Order Placed',
    desc: 'Instant order confirmation sent directly to the kitchen.',
    icon: <FaShoppingCart size={17} />
  },
  {
    num: '02',
    title: 'Freshly\nPrepared',
    shortTitle: 'Freshly Prepared',
    desc: 'Master chefs prepare your meal fresh with handpicked ingredients.',
    icon: <FaUtensils size={17} />
  },
  {
    num: '03',
    title: 'Packed &\nSealed',
    shortTitle: 'Packed & Sealed',
    desc: 'Triple-layer tamper-proof CRAVELY box locks in heat.',
    icon: <FaBoxOpen size={17} />
  },
  {
    num: '04',
    title: 'On The\nWay',
    shortTitle: 'On The Way',
    desc: 'Express CRAVELY rider speeds through the city with live GPS.',
    icon: <FaMotorcycle size={18} />
  },
  {
    num: '05',
    title: 'Delivered\nTo You',
    shortTitle: 'Delivered To You',
    desc: 'Arrives piping hot at your doorstep with OTP handover.',
    icon: <FaHome size={17} />
  }
]

const WHY_CRAVELY_FEATURES = [
  { icon: <FaBolt size={18} />, title: 'Freshly\nPrepared Food' },
  { icon: <FaShieldAlt size={18} />, title: 'Secure\nPackaging' },
  { icon: <FaHandshake size={18} />, title: 'Trusted Local\nRestaurants' },
  { icon: <FaMotorcycle size={18} />, title: 'Reliable\nDelivery' },
  { icon: <FaStar size={18} />, title: 'Quality\nExperience' }
]

function LandingPage() {
  const navigate = useNavigate()
  const { userData, currentCity } = useSelector((state) => state.user)

  const [mobileMenu, setMobileMenu] = useState(false)
  const [shops, setShops] = useState([])
  const [activeStage, setActiveStage] = useState(0)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [showVideoModal, setShowVideoModal] = useState(false)

  // Auto-forward logged in users to their dashboard
  useEffect(() => {
    if (userData) {
      const targetRoute = userData?.role === 'deliveryBoy'
        ? '/delivery-dashboard'
        : userData?.role === 'superAdmin'
          ? '/admin/dashboard'
          : '/home'
      navigate(targetRoute, { replace: true })
    }
  }, [userData, navigate])

  // GSAP Refs
  const rootRef = useRef(null)
  const scrollBarRef = useRef(null)
  const heroRef = useRef(null)
  const heroBgRef = useRef(null)
  const heroScooterRef = useRef(null)

  const journeyPinRef = useRef(null)
  const journeyScooterRef = useRef(null)
  const journeyTrailRef = useRef(null)
  const journeyTopTrackRef = useRef(null)
  const journeyCityBgRef = useRef(null)

  const freshnessRef = useRef(null)
  const burgerRef = useRef(null)

  const restaurantCarouselRef = useRef(null)
  const offersBannerRef = useRef(null)
  const offersBadgeRef = useRef(null)
  const offersPizzaRef = useRef(null)
  const ctaSectionRef = useRef(null)
  const ctaFeastRef = useRef(null)

  useEffect(() => {
    fetchRestaurantsByCity()
  }, [currentCity])

  const fetchRestaurantsByCity = async () => {
    try {
      const cityToQuery = currentCity || 'all'
      const res = await axios.get(
        `${serverUrl}/api/shop/get-by-city/${encodeURIComponent(cityToQuery)}`
      )
      if (Array.isArray(res.data) && res.data.length > 0) {
        setShops(res.data)
      }
    } catch {
      // keep fallback showcase
    }
  }

  const sanitizedBackendShops = shops
    .filter((s) => s.name && !s.name.toLowerCase().includes('your resturant'))
    .map((s) => ({
      ...s,
      image:
        s.image && !s.image.includes('shop.png')
          ? s.image
          : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700&auto=format&fit=crop&q=80'
    }))

  const displayRestaurants = [
    ...DEFAULT_RESTAURANTS.slice(0, 3),
    ...sanitizedBackendShops,
    ...DEFAULT_RESTAURANTS.slice(3)
  ]

  // ✅ GSAP + ScrollTrigger Engine (Preserves 1:1 visual appearance while driving real scroll motion)
  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {
      if (scrollBarRef.current) {
        gsap.to(scrollBarRef.current, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.2
          }
        })
      }

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // 1. Hero Entrance & Scroll Parallax (starts visible so above-the-fold never renders dim)
        const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        heroTl
          .fromTo(
            '.hero-stagger',
            { y: 18, opacity: 0.9 },
            { y: 0, opacity: 1, duration: 0.45, stagger: 0.05 }
          )
          .fromTo(
            heroScooterRef.current,
            { x: 30, scale: 0.97, opacity: 0.9 },
            { x: 0, scale: 1, opacity: 1, duration: 0.55 },
            '-=0.35'
          )

        if (heroRef.current) {
          if (heroBgRef.current) {
            gsap.to(heroBgRef.current, {
              yPercent: 16,
              scale: 1.06,
              ease: 'none',
              scrollTrigger: {
                trigger: heroRef.current,
                start: 'top top',
                end: 'bottom top',
                scrub: true
              }
            })
          }
          if (heroScooterRef.current) {
            gsap.to(heroScooterRef.current, {
              x: 45,
              y: -20,
              ease: 'none',
              scrollTrigger: {
                trigger: heroRef.current,
                start: 'top top',
                end: 'bottom top',
                scrub: true
              }
            })
          }
        }

        // 2. SECTION 02 — Pinned Delivery Journey (Scooter drives horizontally across city road)
        const buildJourneyTimeline = (isDesktop) => {
          if (!journeyPinRef.current) return

          const journeyTl = gsap.timeline({
            scrollTrigger: {
              trigger: journeyPinRef.current,
              start: isDesktop ? 'top top' : 'top 65%',
              end: isDesktop ? '+=1450' : 'bottom 25%',
              pin: isDesktop,
              anticipatePin: isDesktop ? 1 : 0,
              scrub: 0.5,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const idx = Math.min(4, Math.floor(self.progress * 4.99))
                setActiveStage((prev) => (prev !== idx ? idx : prev))
              }
            }
          })

          if (journeyScooterRef.current) {
            journeyTl.fromTo(
              journeyScooterRef.current,
              { left: '8%' },
              { left: '84%', ease: 'none', duration: 1 },
              0
            )
          }

          if (journeyTrailRef.current) {
            journeyTl.fromTo(
              journeyTrailRef.current,
              { width: '8%' },
              { width: '84%', ease: 'none', duration: 1 },
              0
            )
          }

          if (journeyTopTrackRef.current) {
            journeyTl.fromTo(
              journeyTopTrackRef.current,
              { scaleX: 0 },
              { scaleX: 1, ease: 'none', duration: 1 },
              0
            )
          }

          if (journeyCityBgRef.current) {
            journeyTl.fromTo(
              journeyCityBgRef.current,
              { xPercent: 0, scale: 1.06 },
              { xPercent: -5, scale: 1.12, ease: 'none', duration: 1 },
              0
            )
          }
        }

        mm.add('(min-width: 1024px)', () => {
          buildJourneyTimeline(true)
        })
        mm.add('(max-width: 1023px)', () => {
          buildJourneyTimeline(false)
        })

        // 3. SECTION 03 — Freshness First (Scroll-linked Burger Scale + Text Reveal)
        if (freshnessRef.current) {
          if (burgerRef.current) {
            gsap.fromTo(
              burgerRef.current,
              { scale: 0.9, y: 28 },
              {
                scale: 1.04,
                y: -18,
                ease: 'none',
                scrollTrigger: {
                  trigger: freshnessRef.current,
                  start: 'top 85%',
                  end: 'bottom 20%',
                  scrub: 0.8
                }
              }
            )
          }
          gsap.fromTo(
            '.freshness-reveal',
            { y: 28, opacity: 0.85 },
            {
              y: 0,
              opacity: 1,
              duration: 0.55,
              stagger: 0.08,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: freshnessRef.current,
                start: 'top 92%',
                once: true
              }
            }
          )
        }

        // 4. SECTION 04 — Restaurants Reveal
        gsap.fromTo(
          '.restaurants-section-reveal',
          { y: 32, opacity: 0.85 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '.restaurants-section',
              start: 'top 92%',
              once: true
            }
          }
        )

        // 5. SECTION 05 — Why Cravely Stagger
        gsap.fromTo(
          '.why-card-stagger',
          { y: 30, scale: 0.94, opacity: 0.85 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.5,
            stagger: 0.07,
            ease: 'back.out(1.3)',
            scrollTrigger: {
              trigger: '.why-section',
              start: 'top 92%',
              once: true
            }
          }
        )

        // 6. SECTION 06 — How It Works Stagger
        gsap.fromTo(
          '.how-step-stagger',
          { y: 32, scale: 0.95, opacity: 0.85 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.55,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '.how-section',
              start: 'top 92%',
              once: true
            }
          }
        )

        // 7. SECTION 07 — Special Offers Parallax
        if (offersBannerRef.current) {
          gsap.fromTo(
            '.offers-reveal',
            { y: 28, opacity: 0.85 },
            {
              y: 0,
              opacity: 1,
              duration: 0.55,
              stagger: 0.08,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: offersBannerRef.current,
                start: 'top 92%',
                once: true
              }
            }
          )
          if (offersBadgeRef.current) {
            gsap.fromTo(
              offersBadgeRef.current,
              { scale: 0.88, y: 16 },
              {
                scale: 1.05,
                y: -14,
                ease: 'none',
                scrollTrigger: {
                  trigger: offersBannerRef.current,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 0.7
                }
              }
            )
          }
          if (offersPizzaRef.current) {
            gsap.fromTo(
              offersPizzaRef.current,
              { y: 20, rotate: -3 },
              {
                y: -18,
                rotate: 2,
                ease: 'none',
                scrollTrigger: {
                  trigger: offersBannerRef.current,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 0.7
                }
              }
            )
          }
        }

        // 8. SECTION 08 — Final CTA Reveal & Parallax
        if (ctaSectionRef.current) {
          gsap.fromTo(
            '.cta-reveal',
            { y: 28, opacity: 0.85 },
            {
              y: 0,
              opacity: 1,
              duration: 0.55,
              stagger: 0.08,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: ctaSectionRef.current,
                start: 'top 92%',
                once: true
              }
            }
          )
          if (ctaFeastRef.current) {
            gsap.fromTo(
              ctaFeastRef.current,
              { y: 20, scale: 0.96 },
              {
                y: -16,
                scale: 1.03,
                ease: 'none',
                scrollTrigger: {
                  trigger: ctaSectionRef.current,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 0.8
                }
              }
            )
          }
        }
      })
    }, rootRef)

    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 300)
    return () => {
      clearTimeout(refreshTimer)
      ctx.revert()
      mm.revert()
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 150)
    return () => clearTimeout(t)
  }, [shops.length])

  const scrollRestaurants = (dir) => {
    if (!restaurantCarouselRef.current) return
    restaurantCarouselRef.current.scrollBy({
      left: dir === 'left' ? -300 : 300,
      behavior: 'smooth'
    })
  }

  const jumpToStage = (idx) => {
    setActiveStage(idx)
    const pct = Math.max(8, Math.min(84, (idx / 4) * 76 + 8))
    if (journeyScooterRef.current) {
      gsap.to(journeyScooterRef.current, { left: `${pct}%`, duration: 0.5, ease: 'power2.out' })
    }
    if (journeyTrailRef.current) {
      gsap.to(journeyTrailRef.current, { width: `${pct}%`, duration: 0.5, ease: 'power2.out' })
    }
    if (journeyTopTrackRef.current) {
      gsap.to(journeyTopTrackRef.current, { scaleX: idx / 4, duration: 0.5, ease: 'power2.out' })
    }
  }

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) {
      toast.warning('Please enter your email address')
      return
    }
    toast.success('Subscribed to CRAVELY updates & exclusive offers!')
    setNewsletterEmail('')
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div
      ref={rootRef}
      className="min-h-screen bg-[#070709] text-white selection:bg-[#FF6B00] selection:text-white relative overflow-x-clip"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .font-handwritten {
          font-family: 'Caveat', cursive;
        }
        .neon-orange-btn {
          background: linear-gradient(90deg, #FF6B00 0%, #EA580C 100%);
          box-shadow: 0 8px 28px -4px rgba(255, 107, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.25);
        }
        .neon-orange-btn:hover {
          background: linear-gradient(90deg, #FF7B1A 0%, #F97316 100%);
          box-shadow: 0 12px 36px -4px rgba(255, 107, 0, 0.78), inset 0 1px 1px rgba(255, 255, 255, 0.35);
          transform: translateY(-2px);
        }
        .dark-glass-card {
          background: linear-gradient(180deg, rgba(22, 18, 16, 0.88) 0%, rgba(11, 10, 12, 0.96) 100%);
          border: 1px solid rgba(255, 107, 0, 0.22);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
        }
        .dark-glass-card:hover {
          border-color: rgba(255, 107, 0, 0.6);
          box-shadow: 0 24px 60px rgba(255, 107, 0, 0.16);
        }
        .neon-icon-circle {
          background: radial-gradient(circle, rgba(255, 107, 0, 0.28) 0%, rgba(255, 107, 0, 0.06) 70%);
          border: 1.5px solid rgba(255, 107, 0, 0.6);
          box-shadow: 0 0 24px rgba(255, 107, 0, 0.38), inset 0 0 12px rgba(255, 107, 0, 0.22);
        }
        .mask-seamless-radial {
          -webkit-mask-image: radial-gradient(ellipse 66% 66% at 50% 50%, #000 36%, rgba(0, 0, 0, 0.7) 58%, transparent 88%);
          mask-image: radial-gradient(ellipse 66% 66% at 50% 50%, #000 36%, rgba(0, 0, 0, 0.7) 58%, transparent 88%);
        }
        .mask-rider-seamless {
          -webkit-mask-image: radial-gradient(ellipse 68% 68% at 52% 52%, #000 42%, rgba(0, 0, 0, 0.78) 64%, transparent 92%);
          mask-image: radial-gradient(ellipse 68% 68% at 52% 52%, #000 42%, rgba(0, 0, 0, 0.78) 64%, transparent 92%);
        }
        .mask-edge-soft {
          -webkit-mask-image: radial-gradient(ellipse 74% 74% at 52% 50%, #000 44%, rgba(0, 0, 0, 0.72) 66%, transparent 92%);
          mask-image: radial-gradient(ellipse 74% 74% at 52% 50%, #000 44%, rgba(0, 0, 0, 0.72) 66%, transparent 92%);
        }
        .mask-hero-platter {
          -webkit-mask-image: radial-gradient(ellipse 78% 74% at 50% 50%, #000 50%, rgba(0, 0, 0, 0.7) 74%, transparent 96%);
          mask-image: radial-gradient(ellipse 78% 74% at 50% 50%, #000 50%, rgba(0, 0, 0, 0.7) 74%, transparent 96%);
        }
      `}</style>

      {/* Scroll Progress Indicator */}
      <div
        ref={scrollBarRef}
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FF6B00] via-[#FF9E00] to-[#FFB800] origin-left scale-x-0 z-[100] pointer-events-none"
      />

      {/* =====================================================================
          TOP NAVIGATION BAR (1:1 REFERENCE MATCH)
      ===================================================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#070709]/85 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8 lg:gap-10">
            <div
              onClick={() => navigate('/')}
              className="cursor-pointer select-none flex items-center text-2xl font-black tracking-wider text-white"
            >
              <span>CRA</span>
              <span className="text-[#FF6B00]">V</span>
              <span>ELY</span>
            </div>

            <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-white/80">
              <button onClick={scrollToTop} className="text-white hover:text-[#FF6B00] transition cursor-pointer">
                Home
              </button>
              <button
                onClick={() => navigate('/restaurants')}
                className="hover:text-[#FF6B00] transition flex items-center gap-1 cursor-pointer"
              >
                <span>Restaurants</span>
                <FaChevronDown size={9} className="text-white/40" />
              </button>
              <button onClick={() => navigate('/offers')} className="hover:text-[#FF6B00] transition cursor-pointer">
                Offers
              </button>
              <button onClick={() => navigate('/about')} className="hover:text-[#FF6B00] transition cursor-pointer">
                About
              </button>
              <button onClick={() => navigate('/contact')} className="hover:text-[#FF6B00] transition cursor-pointer">
                Contact
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:block">
              <LocationSelector />
            </div>

            {userData ? (
              <button
                onClick={() => navigate('/home')}
                className="neon-orange-btn px-5 py-2.5 rounded-full text-xs font-bold text-white transition cursor-pointer"
              >
                Dashboard →
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/signin')}
                  className="hidden sm:inline-flex px-5 py-2 rounded-full border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-xs font-semibold text-white/90 transition cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="neon-orange-btn px-5 py-2 rounded-full text-xs font-bold text-white transition cursor-pointer"
                >
                  Sign Up
                </button>
              </>
            )}

            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="lg:hidden w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
              aria-label="Menu"
            >
              {mobileMenu ? <FaTimes size={16} /> : <FaBars size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenu && (
          <div className="lg:hidden bg-[#0E0E12] border-b border-white/10 px-6 py-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs text-white/50">Location</span>
              <LocationSelector />
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs font-semibold">
              <button onClick={() => { navigate('/restaurants'); setMobileMenu(false) }} className="text-left p-3 rounded-xl bg-white/5 text-white">Restaurants</button>
              <button onClick={() => { navigate('/offers'); setMobileMenu(false) }} className="text-left p-3 rounded-xl bg-white/5 text-white">Offers</button>
              <button onClick={() => { navigate('/about'); setMobileMenu(false) }} className="text-left p-3 rounded-xl bg-white/5 text-white">About Us</button>
              <button onClick={() => { navigate('/contact'); setMobileMenu(false) }} className="text-left p-3 rounded-xl bg-white/5 text-white">Contact</button>
            </div>
            {!userData && (
              <div className="flex gap-3 pt-1">
                <button onClick={() => { navigate('/signin'); setMobileMenu(false) }} className="flex-1 py-2.5 rounded-full border border-white/20 text-xs font-bold text-white">Log In</button>
                <button onClick={() => { navigate('/signup'); setMobileMenu(false) }} className="flex-1 py-2.5 rounded-full neon-orange-btn text-xs font-bold text-white">Sign Up</button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* =====================================================================
          SECTION 01 — CINEMATIC HERO (1:1 REFERENCE MATCH)
      ===================================================================== */}
      <section ref={heroRef} className="relative pt-24 sm:pt-28 pb-12 lg:pb-16 overflow-hidden border-b border-white/[0.06]">
        {/* Nighttime City Skyline Bokeh Background */}
        <div
          ref={heroBgRef}
          className="absolute inset-0 bg-cover bg-center opacity-35 pointer-events-none"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1800&auto=format&fit=crop&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070709] via-[#070709]/65 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-[#070709]/60 pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[520px] h-[520px] rounded-full bg-[#FF6B00]/22 blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-5 space-y-6">
              <h1 className="hero-stagger text-4xl sm:text-6xl lg:text-[4.3rem] font-extrabold leading-[1.04] tracking-tight text-white">
                Great Food.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] via-[#FF8C33] to-[#FFA94D]">
                  Delivered
                </span>
                <span className="block text-white">Differently.</span>
              </h1>

              <p className="hero-stagger text-white/65 text-sm sm:text-base max-w-sm leading-relaxed">
                Freshly prepared, hot & delicious meals now at your doorstep.
              </p>

              <div className="hero-stagger flex flex-wrap items-center gap-4 pt-1">
                <button
                  onClick={() => navigate('/restaurants')}
                  className="neon-orange-btn px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold text-white flex items-center gap-2.5 transition-all cursor-pointer"
                >
                  <span>Explore Restaurants</span>
                  <FaArrowRight size={11} />
                </button>

                <button
                  onClick={() => setShowVideoModal(true)}
                  className="px-5 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/15 text-xs sm:text-sm font-semibold text-white flex items-center gap-3 transition cursor-pointer group"
                >
                  <span className="w-7 h-7 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00] flex items-center justify-center text-[#FF6B00] group-hover:bg-[#FF6B00] group-hover:text-white transition">
                    <FaPlay size={9} className="ml-0.5" />
                  </span>
                  <span>Watch Video</span>
                </button>
              </div>

              <div className="hero-stagger pt-3 flex items-center gap-4">
                <div className="flex -space-x-2.5">
                  {[
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
                  ].map((av, i) => (
                    <img
                      key={i}
                      src={av}
                      alt="Happy Foodie"
                      className="w-9 h-9 rounded-full object-cover border-2 border-[#070709] ring-1 ring-[#FF6B00]/45"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[#FFB800]">
                    {[...Array(5)].map((_, idx) => <FaStar key={idx} size={11} />)}
                  </div>
                  <p className="text-xs font-bold text-white/85 mt-0.5">
                    15K+ <span className="text-white/55 font-medium">Happy Foodies</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Masterpiece Artisan Wood-Fired Pizza Hero Visual */}
            <div className="lg:col-span-7 relative flex items-center justify-center min-h-[340px] sm:min-h-[450px]">
              {/* Handwritten "Food On the Way..." Script in Upper Right */}
              <div className="hidden sm:block absolute top-4 right-8 z-20 pointer-events-none select-none transform -rotate-6">
                <p className="font-handwritten text-4xl text-white/90 leading-none drop-shadow-[0_0_15px_rgba(255,107,0,0.65)]">
                  Food
                </p>
                <p className="font-handwritten text-3xl text-[#FF8C33] -mt-1">
                  On the Way...
                </p>
              </div>

              <div
                ref={heroScooterRef}
                className="relative w-full max-w-[760px] flex items-center justify-center mix-blend-screen"
              >
                <img
                  src={heroPizzaImg}
                  alt="CRAVELY Artisan Wood-Fired Pizza"
                  className="w-full h-auto max-h-[500px] object-contain rounded-3xl mask-hero-platter pointer-events-none drop-shadow-[0_15px_50px_rgba(255,107,0,0.25)]"
                />
              </div>
            </div>
          </div>

          {/* Scroll Down Mouse Indicator */}
          <div className="mt-4 flex flex-col items-center justify-center gap-2">
            <button
              onClick={() => journeyPinRef.current?.scrollIntoView({ behavior: 'smooth' })}
              aria-label="Scroll Down"
              className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5 cursor-pointer hover:border-[#FF6B00] transition"
            >
              <span className="w-1.5 h-2.5 rounded-full bg-[#FF6B00] animate-bounce" />
            </button>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
              Scroll Down
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 02 — PINNED DELIVERY JOURNEY (REAL RIDER ON SCOOTER DRIVING ACROSS CITY SKYLINE)
      ===================================================================== */}
      <section
        ref={journeyPinRef}
        className="relative min-h-screen flex flex-col justify-center py-16 lg:py-20 border-b border-white/[0.06] overflow-hidden bg-[#070709]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          {/* Top Row: Heading Left + 5 Dotted-Connected Circular Stage Nodes Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-10">
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#FF6B00]">
                  THE DELIVERY JOURNEY
                </span>
                <span className="w-10 h-[1.5px] bg-[#FF6B00]" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                From Our Kitchen
                <span className="block">to Your Door</span>
              </h2>

              <p className="text-white/55 text-xs sm:text-sm max-w-xs leading-relaxed">
                A seamless journey of taste, speed and care.
              </p>

              <div className="pt-1">
                <button
                  onClick={() => navigate('/about')}
                  className="px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-[#FF6B00]/20 border border-white/15 hover:border-[#FF6B00] text-xs font-bold text-white flex items-center gap-2 transition cursor-pointer"
                >
                  <span>Learn More</span>
                  <FaArrowRight size={10} className="text-[#FF6B00]" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="relative">
                {/* Dashed Connecting Track + Animated Glowing Line */}
                <div className="hidden sm:block absolute top-8 left-[9%] right-[9%] border-b-2 border-dashed border-[#FF6B00]/30" />
                <div className="hidden sm:block absolute top-8 left-[9%] right-[9%] h-[2px] overflow-hidden">
                  <div
                    ref={journeyTopTrackRef}
                    className="h-full w-full bg-gradient-to-r from-[#FF6B00] via-[#FF8C00] to-[#FFB800] shadow-[0_0_15px_#FF6B00] origin-left scale-x-0"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-2 relative z-10">
                  {DELIVERY_STAGES.map((st, idx) => {
                    const isCompleted = idx < activeStage
                    const isCurrent = idx === activeStage
                    return (
                      <div
                        key={st.num}
                        onClick={() => jumpToStage(idx)}
                        className="flex flex-col items-center text-center cursor-pointer group"
                      >
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-200 ${
                            isCurrent
                              ? 'bg-[#FF6B00] text-white scale-110 shadow-[0_0_32px_rgba(255,107,0,0.9)] ring-4 ring-[#FF6B00]/30'
                              : isCompleted
                              ? 'neon-icon-circle text-[#FF6B00]'
                              : 'neon-icon-circle text-[#FF6B00]/80 group-hover:text-[#FF6B00]'
                          }`}
                        >
                          {st.icon}
                        </div>

                        <span className="text-[11px] font-mono font-bold mt-3 text-[#FF6B00]">
                          {st.num}
                        </span>

                        <h4
                          className={`text-xs sm:text-sm font-bold mt-0.5 whitespace-pre-line leading-snug transition-colors ${
                            isCurrent || isCompleted ? 'text-white' : 'text-white/75'
                          }`}
                        >
                          {st.title}
                        </h4>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Full-Width Nighttime City Panorama with Real Courier Rider Driving Across */}
          <div className="relative rounded-3xl overflow-hidden border border-[#FF6B00]/25 bg-[#080709] h-[250px] sm:h-[320px] shadow-[0_25px_80px_rgba(0,0,0,0.85)]">
            <img
              ref={journeyCityBgRef}
              src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600&auto=format&fit=crop&q=80"
              alt="City Delivery Route"
              className="w-full h-full object-cover object-center opacity-45 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/30 to-[#070709]/85 pointer-events-none" />

            {/* Subtle Active Stage Caption Top-Left */}
            <div className="absolute top-4 left-5 z-20 flex items-center gap-2.5 text-xs font-bold text-white/90">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping" />
              <span className="text-[#FF8C33]">{DELIVERY_STAGES[activeStage]?.num}</span>
              <span>{DELIVERY_STAGES[activeStage]?.shortTitle}</span>
              <span className="hidden md:inline text-white/40">—</span>
              <span className="hidden md:inline text-white/60 font-normal">
                {DELIVERY_STAGES[activeStage]?.desc}
              </span>
            </div>

            {/* Glowing Location Checkpoints Along Road */}
            {[12, 31, 50, 69, 88].map((leftPct, idx) => {
              const reached = idx <= activeStage
              return (
                <div
                  key={idx}
                  style={{ left: `${leftPct}%` }}
                  className="absolute bottom-14 -translate-x-1/2 z-10 flex flex-col items-center pointer-events-none"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                      reached
                        ? 'bg-[#FF6B00] text-white shadow-[0_0_22px_#FF6B00] scale-110'
                        : 'bg-black/60 text-[#FF6B00] border border-[#FF6B00]/60'
                    }`}
                  >
                    {idx === 4 && activeStage === 4 ? <FaCheckCircle size={12} /> : <FaMapMarkerAlt size={11} />}
                  </div>
                </div>
              )
            })}

            {/* Multi-Layer Glowing Neon Orange Road Trail */}
            <div
              ref={journeyTrailRef}
              className="absolute bottom-6 left-0 h-5 pointer-events-none"
              style={{ width: '10%' }}
            >
              <div className="w-full h-[3px] bg-gradient-to-r from-transparent via-[#FF6B00] to-[#FFB800] shadow-[0_0_22px_#FF6B00]" />
              <div className="w-[90%] h-[2px] mt-1.5 bg-gradient-to-r from-transparent via-[#FF4500] to-[#FF8C00] opacity-90" />
            </div>

            {/* Real 3D Courier on Electric CRAVELY Scooter Driving Horizontally Across Road */}
            <div
              ref={journeyScooterRef}
              className="absolute bottom-0 -translate-x-1/2 z-20 pointer-events-none w-52 sm:w-64 mix-blend-screen"
              style={{ left: '8%' }}
            >
              <img
                src={journeyRiderImg}
                alt="CRAVELY Delivery Rider"
                className="w-full h-auto object-contain brightness-110 contrast-[1.14] mask-rider-seamless"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 03 — FRESHNESS FIRST ("Freshness You Can Feel.")
      ===================================================================== */}
      <section ref={freshnessRef} className="relative py-20 lg:py-24 border-b border-white/[0.06] overflow-hidden">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-[#FF6B00]/16 blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Seamless Sizzling Burger on Charred Wood with Neon Halo Ring & Flying Tomatoes */}
            <div className="lg:col-span-7 relative flex items-center justify-center">
              <div ref={burgerRef} className="relative w-full max-w-[540px] flex items-center justify-center mix-blend-screen">
                <img
                  src={freshnessBurgerImg}
                  alt="Freshly Prepared Gourmet Burger"
                  className="w-full h-auto max-h-[440px] object-contain brightness-105 contrast-[1.08] mask-seamless-radial pointer-events-none"
                />
              </div>
            </div>

            {/* Right: Copy + 3 Circular Neon Badges + Explore Menu */}
            <div className="lg:col-span-5 space-y-6">
              <div className="freshness-reveal flex items-center gap-3">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#FF6B00]">
                  FRESHNESS FIRST
                </span>
                <span className="w-10 h-[1.5px] bg-[#FF6B00]" />
              </div>

              <h2 className="freshness-reveal text-3xl sm:text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
                Freshness
                <span className="block mt-1">
                  You Can <span className="text-[#FF6B00]">Feel.</span>
                </span>
              </h2>

              <p className="freshness-reveal text-white/60 text-sm sm:text-base leading-relaxed">
                Made with premium ingredients, prepared with love and delivered fresh.
              </p>

              <div className="freshness-reveal grid grid-cols-3 gap-4 pt-2">
                {[
                  { icon: <FaLeaf size={17} />, label: 'Premium\nIngredients' },
                  { icon: <FaShieldAlt size={17} />, label: 'Hygienic\nPreparation' },
                  { icon: <FaUtensils size={17} />, label: 'Hot & Fresh\nDelivery' }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-full neon-icon-circle text-[#FF6B00] flex items-center justify-center mb-2.5">
                      {item.icon}
                    </div>
                    <span className="text-xs font-bold text-white/90 whitespace-pre-line leading-snug">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="freshness-reveal pt-2">
                <button
                  onClick={() => navigate('/search')}
                  className="px-7 py-3 rounded-full bg-white/[0.04] hover:bg-[#FF6B00] border border-[#FF6B00]/55 text-xs sm:text-sm font-bold text-white flex items-center gap-2.5 transition-all cursor-pointer shadow-[0_0_25px_rgba(255,107,0,0.2)]"
                >
                  <span>Explore Menu</span>
                  <FaArrowRight size={11} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 04 — EXPLORE RESTAURANTS (3 CARDS SIDE-BY-SIDE IN VIEWPORT)
      ===================================================================== */}
      <section className="restaurants-section relative py-20 lg:py-24 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#FF6B00]">
                EXPLORE RESTAURANTS
              </span>
              <span className="w-10 h-[1.5px] bg-[#FF6B00]" />
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => scrollRestaurants('left')}
                aria-label="Previous Restaurants"
                className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-[#FF6B00] border border-white/15 text-white flex items-center justify-center transition cursor-pointer"
              >
                <FaChevronLeft size={11} />
              </button>
              <button
                onClick={() => scrollRestaurants('right')}
                aria-label="Next Restaurants"
                className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-[#FF6B00] border border-white/15 text-white flex items-center justify-center transition cursor-pointer"
              >
                <FaChevronRight size={11} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 space-y-5">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Discover Top
                <span className="block">Restaurants Near You</span>
              </h2>

              <p className="text-white/55 text-xs sm:text-sm leading-relaxed max-w-sm">
                From local favourites to trending spots, find the best food in your area.
              </p>

              <div className="pt-1">
                <button
                  onClick={() => navigate('/restaurants')}
                  className="neon-orange-btn px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold text-white flex items-center gap-2.5 transition cursor-pointer"
                >
                  <span>Browse Restaurants</span>
                  <FaArrowRight size={11} />
                </button>
              </div>
            </div>

            {/* 3 Cards Perfectly Fitted Side-by-Side on Desktop */}
            <div className="lg:col-span-8 restaurants-section-reveal">
              <div
                ref={restaurantCarouselRef}
                className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
              >
                {displayRestaurants.map((rest, idx) => {
                  const ratingVal = rest.rating?.average
                    ? Number(rest.rating.average).toFixed(1)
                    : '4.6'
                  const isDefault = String(rest._id).startsWith('default-')

                  return (
                    <div
                      key={rest._id || idx}
                      className="w-[240px] sm:w-[calc((100%-2rem)/3)] min-w-[220px] snap-start dark-glass-card rounded-2xl overflow-hidden pointer-events-none select-none cursor-default group transition-all duration-300 flex-shrink-0"
                    >
                      <div className="relative h-40 overflow-hidden bg-[#141418]">
                        <img
                          src={
                            rest.image ||
                            'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80'
                          }
                          alt={rest.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0C0D] via-transparent to-black/25" />

                        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-[#FF6B00]/50 flex items-center gap-1 text-[11px] font-extrabold text-white">
                          <FaStar className="text-[#FF6B00]" size={9} />
                          <span>{ratingVal}</span>
                        </div>
                      </div>

                      <div className="p-4 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-sm font-extrabold text-white group-hover:text-[#FF6B00] transition-colors truncate">
                            {rest.name}
                          </h3>
                          <p className="text-[11px] text-white/50 mt-0.5">
                            {rest.deliveryTime || '30-40 min'}
                          </p>
                        </div>

                        <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center text-white/80 transition flex-shrink-0">
                          <FaArrowRight size={10} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 05 — WHY CRAVELY
      ===================================================================== */}
      <section className="why-section relative py-20 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#FF6B00]">
                  WHY CRAVELY
                </span>
                <span className="w-10 h-[1.5px] bg-[#FF6B00]" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Because You Deserve
                <span className="block">the Best</span>
              </h2>

              <p className="text-white/55 text-xs sm:text-sm leading-relaxed max-w-xs">
                More than just food. A complete delivery experience.
              </p>
            </div>

            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {WHY_CRAVELY_FEATURES.map((feat, idx) => (
                <div
                  key={idx}
                  className="why-card-stagger dark-glass-card rounded-2xl p-5 flex flex-col items-center text-center group hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-full neon-icon-circle text-[#FF6B00] flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform">
                    {feat.icon}
                  </div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white whitespace-pre-line leading-snug">
                    {feat.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 06 — HOW IT WORKS (MATCHING PHONE, BOWL, AND KRAFT CRAVELY BAG)
      ===================================================================== */}
      <section className="how-section relative py-20 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#FF6B00]">
                  HOW IT WORKS
                </span>
                <span className="w-10 h-[1.5px] bg-[#FF6B00]" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Ordering is Easy
                <span className="block mt-1">
                  in Just <span className="text-[#FF6B00]">3 Steps</span>
                </span>
              </h2>
            </div>

            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
                {/* Step 01: Smartphone Mockup */}
                <div className="how-step-stagger relative flex items-center">
                  <div
                    onClick={() => navigate('/restaurants')}
                    className="w-full dark-glass-card rounded-3xl p-6 pt-9 flex flex-col items-center text-center relative cursor-pointer group hover:-translate-y-1.5 transition-all"
                  >
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#FF6B00] text-white font-extrabold text-xs flex items-center justify-center shadow-[0_0_20px_#FF6B00] ring-4 ring-[#070709]">
                      01
                    </div>
                    <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                      <div className="absolute inset-2 rounded-full bg-[#FF6B00]/25 blur-xl pointer-events-none" />
                      {/* Mini Realistic Smartphone Frame */}
                      <div className="relative w-20 h-28 rounded-2xl bg-[#111] border-2 border-white/25 overflow-hidden shadow-2xl p-1 group-hover:scale-105 transition-transform">
                        <img
                          src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80"
                          alt="Choose Restaurant App"
                          className="w-full h-16 object-cover rounded-lg"
                        />
                        <div className="mt-1.5 space-y-1 px-1">
                          <div className="h-1.5 w-10 bg-white/80 rounded-full" />
                          <div className="h-1.5 w-14 bg-[#FF6B00] rounded-full" />
                        </div>
                      </div>
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug group-hover:text-[#FF6B00] transition-colors">
                      Choose Your<br />Restaurant
                    </h3>
                  </div>

                  <div className="hidden sm:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#14141A] border border-[#FF6B00]/50 text-[#FF6B00] items-center justify-center shadow-[0_0_15px_rgba(255,107,0,0.4)]">
                    <FaArrowRight size={10} />
                  </div>
                </div>

                {/* Step 02: Steaming Food Bowl */}
                <div className="how-step-stagger relative flex items-center">
                  <div
                    onClick={() => navigate('/restaurants')}
                    className="w-full dark-glass-card rounded-3xl p-6 pt-9 flex flex-col items-center text-center relative cursor-pointer group hover:-translate-y-1.5 transition-all"
                  >
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#FF6B00] text-white font-extrabold text-xs flex items-center justify-center shadow-[0_0_20px_#FF6B00] ring-4 ring-[#070709]">
                      02
                    </div>
                    <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                      <div className="absolute inset-2 rounded-full bg-[#FF6B00]/25 blur-xl pointer-events-none" />
                      <img
                        src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80"
                        alt="Order Your Favourite Meal"
                        className="relative w-28 h-28 rounded-full object-cover border-2 border-[#FF6B00]/50 shadow-2xl group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug group-hover:text-[#FF6B00] transition-colors">
                      Order Your<br />Favourite Meal
                    </h3>
                  </div>

                  <div className="hidden sm:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#14141A] border border-[#FF6B00]/50 text-[#FF6B00] items-center justify-center shadow-[0_0_15px_rgba(255,107,0,0.4)]">
                    <FaArrowRight size={10} />
                  </div>
                </div>

                {/* Step 03: Kraft Paper CRAVELY Delivery Bag */}
                <div className="how-step-stagger relative flex items-center">
                  <div
                    onClick={() => navigate('/restaurants')}
                    className="w-full dark-glass-card rounded-3xl p-6 pt-9 flex flex-col items-center text-center relative cursor-pointer group hover:-translate-y-1.5 transition-all"
                  >
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#FF6B00] text-white font-extrabold text-xs flex items-center justify-center shadow-[0_0_20px_#FF6B00] ring-4 ring-[#070709]">
                      03
                    </div>
                    <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                      <img
                        src={howBagImg}
                        alt="CRAVELY Fresh Delivery Bag"
                        className="w-32 h-32 object-contain mix-blend-screen brightness-110 contrast-[1.12] mask-seamless-radial group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug group-hover:text-[#FF6B00] transition-colors">
                      Enjoy Fresh<br />Delivery
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 07 — SPECIAL OFFERS BANNER (SEAMLESS 50% OFF + MELTED CHEESE PIZZA SLICE)
      ===================================================================== */}
      <section ref={offersBannerRef} className="relative py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[2.25rem] overflow-hidden border border-[#FF6B00]/45 bg-gradient-to-r from-[#241005] via-[#3B1805] to-[#110804] p-8 sm:p-12 lg:p-14 shadow-[0_25px_80px_rgba(255,107,0,0.22)]">
          <svg viewBox="0 0 1200 360" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            <path d="M -40 30 Q 460 120 760 390" fill="none" stroke="#FF6B00" strokeWidth="3.5" strokeOpacity="0.7" />
            <path d="M -40 340 Q 560 220 1240 310" fill="none" stroke="#FF8C00" strokeWidth="2.5" strokeOpacity="0.45" />
          </svg>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="offers-reveal inline-block px-4 py-1 rounded-full bg-[#FF6B00] text-white text-[10px] font-extrabold uppercase tracking-widest shadow-lg">
                SPECIAL OFFERS
              </span>

              <h2 className="offers-reveal text-3xl sm:text-5xl font-extrabold text-white leading-tight">
                Get Exciting Offers
                <span className="block">& Huge Discounts!</span>
              </h2>

              <p className="offers-reveal text-white/75 text-sm sm:text-base">
                Save more. Eat more.
              </p>

              <div className="offers-reveal pt-2">
                <button
                  onClick={() => navigate('/offers')}
                  className="neon-orange-btn px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold text-white flex items-center gap-2.5 transition cursor-pointer"
                >
                  <span>Grab Offers</span>
                  <FaArrowRight size={11} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 relative flex items-center justify-center lg:justify-end gap-4">
              <div
                ref={offersBadgeRef}
                className="relative z-20 w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-b from-[#FF8C00] to-[#E85D04] border-2 border-[#FFB800] shadow-[0_0_60px_rgba(255,107,0,0.9)] flex flex-col items-center justify-center text-center p-3 flex-shrink-0"
              >
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-white/95">UP TO</span>
                <span className="text-4xl sm:text-5xl font-black text-white leading-none my-0.5">50%</span>
                <span className="text-xs font-extrabold uppercase tracking-widest text-white">OFF</span>
              </div>

              <div ref={offersPizzaRef} className="relative w-60 sm:w-80 flex items-center justify-center mix-blend-screen">
                <img
                  src={offersPizzaImg}
                  alt="50% Off Melted Pepperoni Pizza"
                  className="w-full h-auto max-h-[260px] object-contain brightness-95 contrast-[1.22] mask-seamless-radial pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 08 — FINAL CALL TO ACTION (SEAMLESS BIRYANI BOWL + CRAVELY ICED COFFEE)
      ===================================================================== */}
      <section ref={ctaSectionRef} className="relative py-16 lg:py-20 border-t border-white/[0.06] overflow-hidden">
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] rounded-full bg-[#FF6B00]/16 blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5">
              <h2 className="cta-reveal text-3xl sm:text-5xl font-extrabold text-white leading-[1.12] tracking-tight">
                Your Next Favourite Meal
                <span className="block mt-1">
                  Is <span className="text-[#FF6B00]">Just A Click Away.</span>
                </span>
              </h2>

              <p className="cta-reveal text-white/60 text-sm sm:text-base">
                Order now and satisfy your cravings!
              </p>

              <div className="cta-reveal pt-2">
                <button
                  onClick={() => navigate('/restaurants')}
                  className="neon-orange-btn px-8 py-4 rounded-full text-xs sm:text-sm font-bold text-white flex items-center gap-2.5 transition cursor-pointer"
                >
                  <span>Explore Restaurants</span>
                  <FaArrowRight size={11} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 relative flex items-center justify-center">
              <div ref={ctaFeastRef} className="relative w-full max-w-[660px] flex items-center justify-center mix-blend-screen">
                <img
                  src={ctaFeastImg}
                  alt="CRAVELY Biryani Feast and Iced Beverage"
                  className="w-full h-auto max-h-[380px] object-contain brightness-105 contrast-[1.1] mask-seamless-radial pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 09 — PREMIUM FOOTER
      ===================================================================== */}
      <footer className="bg-[#050507] border-t border-white/10 pt-16 pb-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
            <div className="lg:col-span-3 space-y-4">
              <div onClick={scrollToTop} className="cursor-pointer select-none flex items-center text-2xl font-black tracking-wider text-white">
                <span>CRA</span>
                <span className="text-[#FF6B00]">V</span>
                <span>ELY</span>
              </div>
              <p className="text-xs text-white/55 font-medium">Good Food. Good Mood.</p>

              <div className="flex items-center gap-2.5 pt-2">
                {[
                  { icon: <FaInstagram size={13} />, label: 'Instagram' },
                  { icon: <FaFacebookF size={13} />, label: 'Facebook' },
                  { icon: <FaYoutube size={13} />, label: 'YouTube' },
                  { icon: <FaTwitter size={13} />, label: 'Twitter' }
                ].map((soc, i) => (
                  <a
                    key={i}
                    href={`#${soc.label.toLowerCase()}`}
                    aria-label={soc.label}
                    onClick={(e) => e.preventDefault()}
                    className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-[#FF6B00] border border-white/15 hover:border-[#FF6B00] text-white/70 hover:text-white flex items-center justify-center transition"
                  >
                    {soc.icon}
                  </a>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Quick Links</h4>
              <ul className="space-y-2.5 text-xs text-white/55">
                <li><button onClick={scrollToTop} className="hover:text-[#FF6B00] transition cursor-pointer">Home</button></li>
                <li><Link to="/restaurants" className="hover:text-[#FF6B00] transition">Restaurants</Link></li>
                <li><Link to="/offers" className="hover:text-[#FF6B00] transition">Offers</Link></li>
                <li><Link to="/about" className="hover:text-[#FF6B00] transition">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-[#FF6B00] transition">Contact</Link></li>
              </ul>
            </div>

            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Our Services</h4>
              <ul className="space-y-2.5 text-xs text-white/55">
                <li><Link to="/restaurants" className="hover:text-[#FF6B00] transition">Food Delivery</Link></li>
                <li><Link to="/signup" className="hover:text-[#FF6B00] transition">Partner With Us</Link></li>
                <li><Link to="/signup" className="hover:text-[#FF6B00] transition">Become a Rider</Link></li>
                <li><Link to="/help" className="hover:text-[#FF6B00] transition">FAQs</Link></li>
                <li><Link to="/about" className="hover:text-[#FF6B00] transition">Terms & Conditions</Link></li>
              </ul>
            </div>

            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Contact Us</h4>
              <ul className="space-y-3 text-xs text-white/60">
                <li className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#FF6B00]/15 text-[#FF6B00] flex items-center justify-center flex-shrink-0"><FaPhoneAlt size={10} /></span>
                  <span>+91 98765 43210</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#FF6B00]/15 text-[#FF6B00] flex items-center justify-center flex-shrink-0"><FaEnvelope size={10} /></span>
                  <span>hello@cravely.com</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#FF6B00]/15 text-[#FF6B00] flex items-center justify-center flex-shrink-0"><FaMapMarkerAlt size={10} /></span>
                  <span>New Delhi, India</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Subscribe to our Newsletter</h4>
              <p className="text-xs text-white/50">Get the latest offers & updates.</p>

              <form onSubmit={handleNewsletterSubmit} className="flex items-center bg-white/[0.04] border border-white/15 focus-within:border-[#FF6B00] rounded-full p-1">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 bg-transparent text-xs text-white placeholder:text-white/35 px-3.5 py-2 focus:outline-none"
                />
                <button type="submit" aria-label="Subscribe" className="w-8 h-8 rounded-full neon-orange-btn text-white flex items-center justify-center flex-shrink-0 cursor-pointer">
                  <FaArrowRight size={10} />
                </button>
              </form>

              <div className="pt-2 flex justify-end">
                <button onClick={scrollToTop} aria-label="Back to top" className="w-9 h-9 rounded-full neon-orange-btn text-white flex items-center justify-center shadow-lg cursor-pointer">
                  <FaArrowUp size={11} />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/40">
            <p>© {new Date().getFullYear()} CRAVELY. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/about" className="hover:text-white/70 transition">Privacy Policy</Link>
              <span>|</span>
              <Link to="/about" className="hover:text-white/70 transition">Terms of Service</Link>
              <span>|</span>
              <Link to="/help" className="hover:text-white/70 transition">Cookie Policy</Link>
            </div>
            <div className="flex items-center gap-2">
              {['VISA', 'MasterCard', 'UPI', 'Paytm'].map((pm) => (
                <span key={pm} className="px-2.5 py-1 rounded bg-white/[0.05] border border-white/10 text-[10px] font-bold text-white/65">{pm}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Watch Video Modal */}
      {showVideoModal && (
        <div onClick={() => setShowVideoModal(false)} className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-3xl rounded-3xl overflow-hidden bg-[#121217] border border-[#FF6B00]/40 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white">CRA<span className="text-[#FF6B00]">V</span>ELY — Express Delivery Experience</h3>
              <button onClick={() => setShowVideoModal(false)} className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-[#FF6B00]"><FaTimes size={14} /></button>
            </div>
            <div className="relative rounded-2xl overflow-hidden h-72 sm:h-96 bg-black flex items-center justify-center">
              <img src={heroScooterImg} alt="Cravely Delivery Showcase" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#FF6B00]">28-Minute Doorstep Promise</span>
                <p className="text-lg font-bold text-white mt-1">From local chef kitchens to your doorstep with live GPS scooter telemetry.</p>
                <div className="mt-4">
                  <button onClick={() => { setShowVideoModal(false); navigate('/restaurants') }} className="neon-orange-btn px-6 py-2.5 rounded-full text-xs font-bold text-white cursor-pointer">
                    Order Now →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LandingPage
