import React, { useState, useRef, useLayoutEffect } from 'react'
import {
  FaRegEye, FaRegEyeSlash, FaArrowRight, FaLock,
  FaBolt, FaShieldAlt, FaHeart, FaUserPlus, FaSignInAlt, FaKey
} from 'react-icons/fa'
import { MdMail } from 'react-icons/md'
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
import heroScooterImg from '../assets/hero-scooter.jpg'
import authFullscreenBg from '../assets/auth-fullscreen-bg.jpg'

function SignIn() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [email, setEmail] = useState(() => localStorage.getItem('cravely_remember_email') || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(() => Boolean(localStorage.getItem('cravely_remember_email')))
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const pageRef = useRef(null)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.auth-left-reveal', {
          x: -18,
          opacity: 0.9,
          duration: 0.38,
          stagger: 0.06,
          ease: 'power3.out'
        })
        gsap.from('.auth-card-reveal', {
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

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErr('')

    if (rememberMe && email.trim()) {
      localStorage.setItem('cravely_remember_email', email.trim())
    } else {
      localStorage.removeItem('cravely_remember_email')
    }

    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signin`,
        { email, password },
        { withCredentials: true }
      )

      setSessionUser(result.data)
      localStorage.setItem('userData', JSON.stringify(result.data))
      dispatch(setUserData(result.data))
      setLoading(false)

      toast.success('Welcome back to CRAVELY!', {
        position: 'top-center',
        autoClose: 1800
      })

      setTimeout(() => navigate('/'), 1500)
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Invalid credentials!'

      if (
        error?.response?.data?.code === 'EMAIL_NOT_VERIFIED' ||
        errorMessage.toLowerCase().includes('verify your email')
      ) {
        toast.error(
          <div>
            {errorMessage}
            <button
              onClick={async () => {
                try {
                  await axios.post(`${serverUrl}/api/auth/resend-verification`, { email })
                  toast.success('Verification email resent! Check your inbox.')
                } catch {
                  toast.error('Failed to resend verification email.')
                }
              }}
              className="ml-2 text-[#FF6B00] underline font-bold"
            >
              Resend
            </button>
          </div>,
          { autoClose: false }
        )
      } else {
        toast.error(errorMessage, { position: 'top-center', autoClose: 2200 })
      }

      setErr(errorMessage)
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)

      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          fullName: result.user.displayName || 'Google User',
          email: result.user.email,
          role: 'user',
          mobile: result.user.phoneNumber || '0000000000'
        },
        { withCredentials: true }
      )

      setSessionUser(data)
      localStorage.setItem('userData', JSON.stringify(data))
      dispatch(setUserData(data))

      toast.success('Signed in successfully with Google!', {
        position: 'top-center',
        autoClose: 1800
      })

      setTimeout(() => navigate('/'), 1500)
    } catch {
      toast.error('Google sign in failed!', { position: 'top-center', autoClose: 2000 })
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
        {/* Cinematic Vignette & Ambient Warm Orange Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070709]/95 via-[#070709]/75 to-[#070709]/92" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-[#070709]/85" />
        <div className="absolute -bottom-24 right-1/4 w-[550px] h-[350px] rounded-full bg-[#FF6B00]/16 blur-[140px]" />
      </div>

      {/* Top Header */}
      <header className="relative z-30 max-w-7xl w-full mx-auto px-5 sm:px-8 pt-6 pb-2 flex items-center justify-between">
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

      {/* Main Split-Screen Auth Content (Left: Luxury Text & Highlights | Right: Frosted Form) */}
      <main className="relative z-20 max-w-7xl w-full mx-auto px-5 sm:px-8 py-4 lg:py-6 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center w-full">
          {/* LEFT SIDE: Luxury Brand Highlights & Typography */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6 pr-6 relative z-10">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/15 backdrop-blur-md w-fit">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping" />
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FFA552]">Gourmet Doorstep Express</span>
            </div>

            <div className="space-y-3">
              <h1 className="auth-left-reveal text-4xl xl:text-5xl font-extrabold leading-[1.08] tracking-tight text-white">
                Welcome Back to
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] via-[#FF8C33] to-[#FFB366] mt-1">
                  Great Taste.
                </span>
              </h1>
              <p className="auth-left-reveal text-white/70 text-base max-w-lg leading-relaxed">
                Your favourite chef-curated meals are just a few clicks away. Experience hyper-fast delivery, real-time rider tracking, and tamper-proof hot dining.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="auth-left-reveal grid grid-cols-2 gap-3.5 max-w-md pt-1">
              <div className="p-4 rounded-2xl bg-black/55 border border-white/10 backdrop-blur-xl shadow-lg">
                <div className="text-[#FF6B00] font-black text-xl">28 Min</div>
                <div className="text-xs text-white/60 mt-0.5">Average Doorstep Delivery</div>
              </div>
              <div className="p-4 rounded-2xl bg-black/55 border border-white/10 backdrop-blur-xl shadow-lg">
                <div className="text-[#FFB800] font-black text-xl">4.9 ★★★★★</div>
                <div className="text-xs text-white/60 mt-0.5">From 15K+ Happy Foodies</div>
              </div>
            </div>

            {/* Handwritten Signature Script */}
            <div className="auth-left-reveal pt-2 pointer-events-none select-none transform -rotate-3">
              <p className="font-handwritten text-4xl text-white/95 leading-none drop-shadow-[0_0_20px_rgba(255,107,0,0.6)]">
                Eat Happy, <span className="text-[#FF8C33]">Live Better.</span>
              </p>
            </div>
          </div>

          {/* RIGHT SIDE: Glass Login Card */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="auth-card-reveal w-full max-w-[420px] rounded-[2rem] bg-[#120F0E]/85 backdrop-blur-2xl border border-[#FF6B00]/25 shadow-[0_25px_90px_rgba(0,0,0,0.85),0_0_50px_rgba(255,107,0,0.08)] p-6 sm:p-7">
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-black/50 border border-white/10 mb-5">
                <button
                  type="button"
                  className="py-2.5 rounded-xl neon-orange-btn text-white text-xs font-bold flex items-center justify-center gap-2 cursor-default"
                >
                  <FaSignInAlt size={12} />
                  <span>Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="py-2.5 rounded-xl text-white/60 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <FaUserPlus size={12} />
                  <span>Sign Up</span>
                </button>
              </div>

              <div className="text-center mb-5">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome Back</h2>
                <p className="text-xs text-white/55 mt-1">
                  Sign in to continue your <span className="text-[#FF6B00] font-bold">CRAVELY</span> experience.
                </p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-3.5">
                <div className="relative group">
                  <MdMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#FF6B00] transition-colors" size={16} />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/[0.04] border border-white/15 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none transition-all"
                  />
                </div>

                <div className="relative group">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#FF6B00] transition-colors" size={14} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/[0.04] border border-white/15 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition cursor-pointer"
                  >
                    {showPassword ? <FaRegEyeSlash size={15} /> : <FaRegEye size={15} />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-white/65 hover:text-white transition">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[#FF6B00] cursor-pointer"
                    />
                    <span>Remember Me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-[#FF6B00] hover:text-[#FF8C33] font-semibold hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                {err && (
                  <p className="text-rose-400 text-xs text-center bg-rose-500/10 border border-rose-500/20 rounded-xl py-2 px-3">
                    {err}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-full neon-orange-btn text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <ClipLoader size={16} color="white" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <FaArrowRight size={12} />
                    </>
                  )}
                </button>

                <div className="flex items-center gap-3 py-0.5">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[11px] text-white/40">or continue with</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="w-full py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/15 hover:border-white/30 text-white text-xs font-semibold flex items-center justify-center gap-2.5 transition cursor-pointer"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                  <span>Continue with Google</span>
                </button>

                <p className="text-center text-xs text-white/55 pt-1">
                  Don’t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="text-[#FF6B00] hover:text-[#FF8C33] font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Create Account</span>
                    <FaArrowRight size={10} />
                  </button>
                </p>

                <div className="flex items-center justify-center gap-4 pt-1.5 border-t border-white/[0.06] text-[11px] text-white/40">
                  <button type="button" onClick={() => navigate('/login-otp')} className="hover:text-white/80 flex items-center gap-1 transition cursor-pointer">
                    <FaKey size={9} className="text-[#FF6B00]" />
                    <span>Login with OTP</span>
                  </button>
                  <span>•</span>
                  <button type="button" onClick={() => navigate('/admin/login')} className="hover:text-white/80 transition cursor-pointer">
                    Admin Portal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Trust Strip */}
      <footer className="relative z-20 max-w-4xl w-full mx-auto px-5 pb-5 pt-2">
        <div className="grid grid-cols-3 gap-4 border-t border-white/[0.08] pt-4">
          {[
            { icon: <FaBolt size={14} />, title: 'Fast Delivery', sub: 'At Your Doorstep' },
            { icon: <FaShieldAlt size={14} />, title: 'Secure & Safe', sub: 'Payments' },
            { icon: <FaHeart size={14} />, title: 'Loved by', sub: 'Millions' }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 text-center sm:text-left">
              <div className="w-9 h-9 rounded-full bg-[#FF6B00]/15 border border-[#FF6B00]/50 text-[#FF6B00] flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(255,107,0,0.25)]">
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

export default SignIn
