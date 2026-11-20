import React, { useState, useRef, useLayoutEffect } from 'react'
import {
  FaRegEye, FaRegEyeSlash, FaArrowRight, FaLock,
  FaUser, FaPhoneAlt, FaBolt, FaShieldAlt, FaHeart,
  FaUserPlus, FaSignInAlt, FaMotorcycle
} from 'react-icons/fa'
import { MdMail, MdStore } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../../config'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../../firebase'
import { ClipLoader } from 'react-spinners'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'
import { toast } from 'react-toastify'
import { setSessionUser } from '../utils/auth'
import gsap from 'gsap'
import signupFeastImg from '../assets/signup-feast.jpg'
import authFullscreenBg from '../assets/auth-fullscreen-bg.jpg'

function SignUp() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [role, setRole] = useState('user')
  const [agreed, setAgreed] = useState(false)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const pageRef = useRef(null)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.signup-left-reveal', {
          x: -18,
          opacity: 0.9,
          duration: 0.38,
          stagger: 0.06,
          ease: 'power3.out'
        })
        gsap.from('.signup-card-reveal', {
          y: 16,
          scale: 0.99,
          opacity: 0.9,
          duration: 0.4,
          ease: 'power3.out',
          delay: 0.04
        })
      })
    }, pageRef)

    return () => {
      ctx.revert()
      mm.revert()
    }
  }, [])

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'text-white/40', barHex: 'rgba(255,255,255,0.1)' }
    let score = 0
    if (pass.length >= 6) score++
    if (pass.length >= 10) score++
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++
    if (/\d/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++

    const map = {
      0: { label: 'Weak', color: 'text-rose-400', barHex: '#f43f5e' },
      1: { label: 'Weak', color: 'text-rose-400', barHex: '#f43f5e' },
      2: { label: 'Fair', color: 'text-amber-400', barHex: '#f59e0b' },
      3: { label: 'Good', color: 'text-orange-400', barHex: '#ff6b00' },
      4: { label: 'Strong', color: 'text-emerald-400', barHex: '#10b981' },
      5: { label: 'Strong', color: 'text-emerald-400', barHex: '#10b981' }
    }
    return { score, ...map[score] }
  }

  const strength = getPasswordStrength(password)
  const passwordsMismatch = Boolean(confirmPassword && password !== confirmPassword)

  const handleSignUp = async (e) => {
    e.preventDefault()
    setErr('')

    if (!agreed) {
      toast.error('Please agree to the Terms & Conditions', { position: 'top-center', autoClose: 2000 })
      return
    }
    if (password.length < 6) {
      setErr('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setErr('Passwords do not match')
      return
    }
    if (mobile.replace(/\D/g, '').length < 10) {
      setErr('Please enter a valid 10-digit phone number')
      return
    }

    setLoading(true)
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        { fullName, email, password, mobile, role },
        { withCredentials: true }
      )

      setSessionUser(result.data)
      localStorage.setItem('userData', JSON.stringify(result.data))
      dispatch(setUserData(result.data))
      setLoading(false)

      toast.success('Account created! Please verify your email via the link sent to you.', {
        position: 'top-center',
        autoClose: 2800
      })

      setTimeout(() => navigate('/signin'), 2400)
    } catch (error) {
      const msg = error?.response?.data?.message || 'Registration failed!'
      setErr(msg)
      setLoading(false)
      toast.error(msg, { position: 'top-center', autoClose: 2200 })
    }
  }

  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)

      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          fullName: result.user.displayName,
          email: result.user.email,
          role,
          mobile: result.user.phoneNumber || '0000000000'
        },
        { withCredentials: true }
      )

      setSessionUser(data)
      localStorage.setItem('userData', JSON.stringify(data))
      dispatch(setUserData(data))

      toast.success('Signed up successfully with Google!', {
        position: 'top-center',
        autoClose: 1800
      })

      setTimeout(() => navigate('/'), 1500)
    } catch {
      toast.error('Google sign up failed!', { position: 'top-center', autoClose: 2000 })
    }
  }

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-[#070709] text-white relative overflow-x-clip flex flex-col justify-between"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .font-handwritten {
          font-family: 'Caveat', cursive;
        }
        .neon-orange-btn {
          background: linear-gradient(90deg, #FF6B00 0%, #EA580C 100%);
          box-shadow: 0 10px 30px -4px rgba(255, 107, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.25);
        }
        .neon-orange-btn:hover:not(:disabled) {
          background: linear-gradient(90deg, #FF7B1A 0%, #F97316 100%);
          box-shadow: 0 14px 36px -4px rgba(255, 107, 0, 0.78);
          transform: translateY(-1px);
        }
        .mask-seamless-auth {
          -webkit-mask-image: radial-gradient(ellipse 72% 72% at 50% 50%, #000 44%, rgba(0, 0, 0, 0.72) 66%, transparent 94%);
          mask-image: radial-gradient(ellipse 72% 72% at 50% 50%, #000 44%, rgba(0, 0, 0, 0.72) 66%, transparent 94%);
        }
      `}</style>

      {/* Fullscreen Luxury Fine-Dining Feast Background (Spans Entire Screen) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={authFullscreenBg}
          alt="CRAVELY Luxury Dining Feast"
          className="w-full h-full object-cover object-left-bottom lg:object-center brightness-[0.55] contrast-[1.18] scale-105"
        />
        {/* Cinematic Vignette & Ambient Warm Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070709]/95 via-[#070709]/75 to-[#070709]/92" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-[#070709]/85" />
        <div className="absolute -bottom-24 right-1/4 w-[550px] h-[350px] rounded-full bg-[#FF6B00]/16 blur-[140px]" />
      </div>

      {/* Top Header */}
      <header className="relative z-30 max-w-7xl w-full mx-auto px-5 sm:px-8 pt-3 pb-1 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="cursor-pointer select-none flex items-center text-2xl font-black tracking-wider text-white"
        >
          <span>CRA</span>
          <span className="text-[#FF6B00]">V</span>
          <span>ELY</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-white/75">Good Food. Good Mood.</span>
          <span className="w-8 h-[1.5px] bg-[#FF6B00] hidden sm:inline-block" />
        </div>
      </header>

      {/* Main Split-Screen Content (Left: Luxury Text & Highlights | Right: Frosted Form) */}
      <main className="relative z-20 max-w-7xl w-full mx-auto px-5 sm:px-8 py-1.5 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center w-full">
          {/* LEFT SIDE: Brand Statement & Luxury Highlights */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-5 pr-6 relative z-10">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/15 backdrop-blur-md w-fit">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping" />
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FFA552]">Crafted by Top Chefs</span>
            </div>

            <div className="space-y-2.5">
              <h1 className="signup-left-reveal text-4xl xl:text-5xl font-extrabold leading-[1.08] tracking-tight text-white">
                Your Next Favourite
                <span className="block mt-1">
                  Meal <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] via-[#FF8C33] to-[#FFB366]">Starts Here.</span>
                </span>
              </h1>
              <p className="signup-left-reveal text-white/70 text-base max-w-lg leading-relaxed">
                Join <span className="text-[#FF6B00] font-bold">CRAVELY</span> and discover artisan wood-fired pizzas, royal dum biryanis, and gourmet late-night cravings from top kitchens.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="signup-left-reveal grid grid-cols-2 gap-3.5 max-w-md pt-1">
              <div className="p-3.5 rounded-2xl bg-black/55 border border-white/10 backdrop-blur-xl shadow-lg">
                <div className="text-[#FF6B00] font-black text-lg">Hot & Fresh</div>
                <div className="text-xs text-white/60 mt-0.5">Delivered at Peak Heat</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/55 border border-white/10 backdrop-blur-xl shadow-lg">
                <div className="text-[#FFB800] font-black text-lg">Zero Surge</div>
                <div className="text-xs text-white/60 mt-0.5">Honest Pricing & Offers</div>
              </div>
            </div>

            {/* Handwritten Signature Script */}
            <div className="signup-left-reveal pt-1 pointer-events-none select-none transform -rotate-3">
              <p className="font-handwritten text-4xl text-white/95 leading-none drop-shadow-[0_0_20px_rgba(255,107,0,0.6)]">
                Good Food, <span className="text-[#FF8C33]">Good Mood.</span>
              </p>
            </div>
          </div>

          {/* RIGHT SIDE: Glass Signup Form Card (Compact proportions so entire page + trust strip fits cleanly on 1280x800) */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="signup-card-reveal w-full max-w-[430px] rounded-[2rem] bg-[#120F0E]/85 backdrop-blur-2xl border border-[#FF6B00]/25 shadow-[0_25px_90px_rgba(0,0,0,0.85),0_0_50px_rgba(255,107,0,0.08)] p-4 sm:p-5">
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-black/50 border border-white/10 mb-3">
                <button
                  type="button"
                  onClick={() => navigate('/signin')}
                  className="py-1.5 rounded-xl text-white/60 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <FaSignInAlt size={12} />
                  <span>Login</span>
                </button>
                <button
                  type="button"
                  className="py-1.5 rounded-xl neon-orange-btn text-white text-xs font-bold flex items-center justify-center gap-2 cursor-default"
                >
                  <FaUserPlus size={12} />
                  <span>Sign Up</span>
                </button>
              </div>

              <div className="text-center mb-3">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Create Your Account</h2>
                <p className="text-[11px] text-white/55 mt-0.5">
                  Join <span className="text-[#FF6B00] font-bold">CRAVELY</span> and enjoy a better food delivery experience.
                </p>
              </div>

              <form onSubmit={handleSignUp} className="space-y-2">
                <div className="relative group">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#FF6B00] transition-colors" size={12} />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-white/[0.04] border border-white/15 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-white/35 focus:outline-none transition-all"
                  />
                </div>

                <div className="relative group">
                  <MdMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#FF6B00] transition-colors" size={14} />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/[0.04] border border-white/15 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-white/35 focus:outline-none transition-all"
                  />
                </div>

                <div className="relative group">
                  <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#FF6B00] transition-colors" size={12} />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                    className="w-full bg-white/[0.04] border border-white/15 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-white/35 focus:outline-none transition-all"
                  />
                </div>

                <div className="relative group">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#FF6B00] transition-colors" size={12} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/[0.04] border border-white/15 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 rounded-xl pl-10 pr-10 py-2 text-xs sm:text-sm text-white placeholder:text-white/35 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition cursor-pointer"
                  >
                    {showPassword ? <FaRegEyeSlash size={14} /> : <FaRegEye size={14} />}
                  </button>
                </div>

                <div className="relative group">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#FF6B00] transition-colors" size={12} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`w-full bg-white/[0.04] border rounded-xl pl-10 pr-10 py-2 text-xs sm:text-sm text-white placeholder:text-white/35 focus:outline-none transition-all ${
                      passwordsMismatch
                        ? 'border-rose-500/70 focus:border-rose-500'
                        : 'border-white/15 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition cursor-pointer"
                  >
                    {showConfirmPassword ? <FaRegEyeSlash size={14} /> : <FaRegEye size={14} />}
                  </button>
                </div>

                {passwordsMismatch && <p className="text-[11px] text-rose-400">Passwords do not match</p>}

                {/* Password Strength Bar */}
                <div className="flex items-center justify-between gap-3 pt-0.5">
                  <span className="text-[11px] text-white/55 whitespace-nowrap">Password Strength:</span>
                  <div className="flex-1 flex gap-1.5 h-2">
                    {[1, 2, 3, 4].map((step) => {
                      const active = password && step <= Math.min(4, Math.max(1, strength.score))
                      return (
                        <div
                          key={step}
                          className="flex-1 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: active ? strength.barHex : 'rgba(255,255,255,0.12)',
                            boxShadow: active ? `0 0 10px ${strength.barHex}80` : 'none'
                          }}
                        />
                      )
                    })}
                  </div>
                  <span className={`text-[11px] font-bold min-w-[44px] text-right ${strength.color}`}>
                    {password ? strength.label : '—'}
                  </span>
                </div>

                {/* Compact Role Selector */}
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'user', icon: <FaUser size={10} />, label: 'Customer' },
                    { id: 'owner', icon: <MdStore size={12} />, label: 'Restaurant' },
                    { id: 'deliveryBoy', icon: <FaMotorcycle size={11} />, label: 'Rider' }
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
                        role === r.id
                          ? 'bg-[#FF6B00]/20 border border-[#FF6B00] text-[#FF8C33]'
                          : 'bg-white/[0.03] border border-white/10 text-white/55 hover:text-white'
                      }`}
                    >
                      {r.icon}
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-0.5">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-[#FF6B00] cursor-pointer"
                  />
                  <span className="text-[11px] text-white/65">
                    I agree to the <span className="text-[#FF6B00] font-semibold">Terms & Conditions</span>
                  </span>
                </label>

                {err && (
                  <p className="text-rose-400 text-[11px] text-center bg-rose-500/10 border border-rose-500/20 rounded-xl py-1.5 px-3">
                    {err}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-full neon-orange-btn text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <ClipLoader size={16} color="white" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <FaArrowRight size={12} />
                    </>
                  )}
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[11px] text-white/40">or continue with</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="w-full py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/15 hover:border-white/30 text-white text-xs font-semibold flex items-center justify-center gap-2.5 transition cursor-pointer"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                  <span>Continue with Google</span>
                </button>

                <p className="text-center text-xs text-white/55 pt-0.5">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/signin')}
                    className="text-[#FF6B00] hover:text-[#FF8C33] font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Login</span>
                    <FaArrowRight size={10} />
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Trust Strip */}
      <footer className="relative z-20 max-w-4xl w-full mx-auto px-5 pb-3 pt-1">
        <div className="grid grid-cols-3 gap-4 border-t border-white/[0.08] pt-2.5">
          {[
            { icon: <FaBolt size={14} />, title: 'Fast Delivery', sub: 'At Your Doorstep' },
            { icon: <FaShieldAlt size={14} />, title: 'Secure & Safe', sub: 'Payments' },
            { icon: <FaHeart size={14} />, title: 'Loved by', sub: 'Millions' }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 text-center sm:text-left">
              <div className="w-8 h-8 rounded-full bg-[#FF6B00]/15 border border-[#FF6B00]/50 text-[#FF6B00] flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(255,107,0,0.25)]">
                {item.icon}
              </div>
              <div>
                <div className="text-[11px] sm:text-xs font-bold text-white leading-tight">{item.title}</div>
                <div className="text-[10px] sm:text-[11px] text-white/45 leading-tight">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </footer>
    </div>
  )
}

export default SignUp
