import React, { useState, useEffect } from 'react'
import { 
    FaRegEye, FaRegEyeSlash, FaGoogle, FaArrowRight, 
    FaTruck, FaStar, FaFire, FaLock, FaEnvelope, FaBolt, FaArrowLeft,
    FaShieldAlt, FaClock
} from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// ✅ FIXED: serverUrl import
import { serverUrl } from '../../config';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';
import { ClipLoader } from "react-spinners"
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { MdMail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { toast } from "react-toastify";
import { setSessionUser } from '../utils/auth'

function SignIn() {
    const [showPassword, setshowPassword] = useState(false)
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [err, setErr] = useState("")
    const [loading, setLoading] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const dispatch = useDispatch()

    useEffect(() => {
        setIsVisible(true)
    }, [])

    const handleSignIn = async () => {
        setLoading(true)
        try {
            const result = await axios.post(`${serverUrl}/api/auth/signin`, {
                email, password
            }, { withCredentials: true })
            
            setSessionUser(result.data)
            localStorage.setItem('userData', JSON.stringify(result.data))
            dispatch(setUserData(result.data))
            setErr("")
            setLoading(false)

            toast.success("Welcome back!", {
                position: "top-center",
                autoClose: 2000,
            });

            setTimeout(() => {
                navigate("/");
            }, 2000);
        } catch (error) {
            const errorMessage = error?.response?.data?.message || "Invalid credentials!"
            
            if (error?.response?.data?.code === "EMAIL_NOT_VERIFIED" || 
                errorMessage.includes("verify your email")) {
                
                toast.error(
                    <div>
                        {errorMessage}
                        <button 
                            onClick={async () => {
                                try {
                                    await axios.post(`${serverUrl}/api/auth/resend-verification`, { email })
                                    toast.success("Verification email resent! Check your inbox.")
                                } catch (err) {
                                    toast.error("Failed to resend verification email.")
                                }
                            }}
                            className="ml-2 text-[#ff2d55] underline font-semibold"
                        >
                            Resend
                        </button>
                    </div>,
                    { autoClose: false }
                )
            } else {
                toast.error(errorMessage, {
                    position: "top-center",
                    autoClose: 2000,
                })
            }
            
            setErr(errorMessage)
            setLoading(false)
        }
    }

    const handleGoogleAuth = async () => {
        const provider = new GoogleAuthProvider()
        const result = await signInWithPopup(auth, provider)

        try {
            // ✅ FIXED: fullName and other fields added
            const { data } = await axios.post(`${serverUrl}/api/auth/google-auth`, {
                fullName: result.user.displayName || "Google User",
                email: result.user.email,
                role: "user",
                mobile: result.user.phoneNumber || "0000000000"
            }, { withCredentials: true })
            
            setSessionUser(data)
            localStorage.setItem('userData', JSON.stringify(data))
            dispatch(setUserData(data))

            toast.success("Signed in successfully with Google!", {
                position: "top-center",
                autoClose: 2000,
            });

            setTimeout(() => {
                navigate("/");
            }, 2000);
        } catch (error) {
            console.log(error)
            toast.error("Google sign in failed!", {
                position: "top-center",
                autoClose: 2000,
            });
        }
    }
    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-[#ff6b35]/8 via-transparent to-transparent" />
                <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-[#ff2d55]/5 rounded-full blur-3xl" />
                <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-[#ff6b35]/4 rounded-full blur-3xl" />
            </div>

            {/* Top bar */}
            <div className="absolute top-5 left-6 right-6 z-50 flex items-center justify-between">
                <div className="text-2xl font-bold text-white tracking-tight">
                    cravely<span className="text-[#ff6b35]">.</span>
                </div>

                <button 
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
                >
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                        <FaArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    </div>
                    <span className="text-sm hidden sm:block group-hover:underline decoration-white/30 underline-offset-4">Back to Home</span>
                </button>

                
                <button 
                    onClick={() => navigate("/signup")}
                    className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1.5 border border-white/10 rounded-full px-4 py-1.5 hover:border-white/20"
                >
                    Don't have an account? <span className="text-[#ff6b35] font-medium">Sign Up</span>
                </button>

                
            </div>

            

            {/* Main Container */}
            <div className={`w-full max-w-6xl min-h-[640px] flex flex-col lg:flex-row relative transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
                
                {/* ==================== LEFT SIDE ==================== */}
                <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-center py-12 pr-8 overflow-hidden">
                    
                    {/* Burger image BEHIND the text */}
                    <div className="absolute inset-0 flex items-center justify-end pointer-events-none">
                        <img 
                            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&h=900&fit=crop" 
                            alt="Burger" 
                            className="w-[420px] h-[520px] object-contain opacity-90 drop-shadow-2xl -mr-8"
                        />
                        {/* Soft gradient so text remains readable */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/85 to-transparent" />
                    </div>

                    {/* Content (on top of image) */}
                    <div className="relative z-10 max-w-md">
                        {/* Top badge */}
                        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 text-sm text-white/80 w-fit mb-6 backdrop-blur-sm">
                            <FaTruck className="text-[#ff6b35]" size={13} />
                            <span>Delicious food, delivered to <span className="text-[#ff6b35] font-medium">you</span></span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
                            Welcome back,<br />
                            <span className="text-[#ff6b35]">Foodie!</span>
                        </h1>
                        <p className="text-white/60 text-[15px] leading-relaxed mb-8 max-w-sm">
                            Sign in to continue ordering your favorite meals from top restaurants, delivered fast and fresh.
                        </p>

                        {/* Features */}
                        <div className="space-y-3.5 mb-8">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#ff6b35]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <FaStar className="text-[#ff6b35]" size={12} />
                                </div>
                                <div>
                                    <p className="text-white font-medium text-sm">Exclusive Offers</p>
                                    <p className="text-white/50 text-xs">Get access to member-only deals</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#ff6b35]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <FaClock className="text-[#ff6b35]" size={12} />
                                </div>
                                <div>
                                    <p className="text-white font-medium text-sm">Fast Delivery</p>
                                    <p className="text-white/50 text-xs">Quick and on-time delivery</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#ff6b35]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <FaShieldAlt className="text-[#ff6b35]" size={12} />
                                </div>
                                <div>
                                    <p className="text-white font-medium text-sm">Safe & Secure</p>
                                    <p className="text-white/50 text-xs">Your data and payments are protected</p>
                                </div>
                            </div>
                        </div>

                        {/* 50+ Restaurants card */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-center gap-3 max-w-xs backdrop-blur-sm hover:bg-white/8 transition-colors cursor-pointer group">
                            <div className="flex -space-x-2">
                                <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=60&h=60&fit=crop" alt="" className="w-9 h-9 rounded-lg object-cover border-2 border-[#0a0a0f]" />
                                <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=60&h=60&fit=crop" alt="" className="w-9 h-9 rounded-lg object-cover border-2 border-[#0a0a0f]" />
                                <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=60&h=60&fit=crop" alt="" className="w-9 h-9 rounded-lg object-cover border-2 border-[#0a0a0f]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-white font-semibold text-sm">50+ Top Restaurants</p>
                                <p className="text-white/50 text-[11px]">From local favorites to gourmet meals</p>
                            </div>
                            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#ff6b35]/20 transition-colors">
                                <FaArrowRight className="text-white/70 group-hover:text-[#ff6b35]" size={11} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ==================== RIGHT SIDE - FORM ==================== */}
                <div className="w-full lg:w-[45%] flex items-center justify-center py-8">
                    <div className="w-full max-w-[380px] bg-[#12121a]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/40">
                        
                        {/* Logo icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#ff2d55] flex items-center justify-center shadow-lg shadow-[#ff6b35]/30">
                                <span className="text-white font-bold text-lg">C</span>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-white text-center mb-0.5">Sign In</h2>
                        <p className="text-white/50 text-xs text-center mb-5">
                            Welcome back to <span className="text-[#ff6b35]">Cravely</span>
                        </p>

                        <form onSubmit={(e) => { e.preventDefault(); handleSignIn(); }} className="space-y-3.5">
                            {/* Email */}
                            <div className="relative">
                                <MdMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={15} />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3.5 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#ff6b35]/50 focus:ring-1 focus:ring-[#ff6b35]/30 transition-all text-sm"
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div className="relative">
                                <RiLockPasswordFill className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={15} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#ff6b35]/50 focus:ring-1 focus:ring-[#ff6b35]/30 transition-all text-sm"
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                    onClick={() => setshowPassword((prev) => !prev)}
                                >
                                    {!showPassword ? <FaRegEye size={15} /> : <FaRegEyeSlash size={15} />}
                                </button>
                            </div>

                            {/* Forgot Password & OTP */}
                            <div className="flex items-center justify-between">
                                <span 
                                    className="text-[#ff6b35] text-xs cursor-pointer hover:underline"
                                    onClick={() => navigate("/forgot-password")}
                                >
                                    Forgot Password?
                                </span>
                                <span 
                                    className="text-white/40 text-xs cursor-pointer hover:text-white/60 transition"
                                    onClick={() => navigate("/login-otp")}
                                >
                                    Login with OTP
                                </span>
                            </div>

                            {err && <p className="text-red-400 text-[11px] text-center">{err}</p>}

                            {/* Sign In Button */}
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-[#ff6b35] to-[#ff2d55] hover:from-[#ff7a45] hover:to-[#ff3d65] text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-[#ff6b35]/25 hover:shadow-[#ff6b35]/40 hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <ClipLoader size={16} color="white" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <FaArrowRight size={12} />
                                    </>
                                )}
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-3 py-0.5">
                                <div className="flex-1 h-px bg-white/10" />
                                <span className="text-white/40 text-[11px]">or continue with</span>
                                <div className="flex-1 h-px bg-white/10" />
                            </div>

                            {/* Social */}
                            <div className="grid gap-2.5">
                                <button
                                    type="button"
                                    onClick={handleGoogleAuth}
                                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 text-xs font-medium hover:bg-white/10 hover:border-white/20 transition-all"
                                >
                                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-3.5 h-3.5" />
                                    Google
                                </button>
                              
                            </div>

                            {/* Admin Login */}
                            <div className="text-center pt-1">
                                <span 
                                    className="text-white/30 text-[11px] cursor-pointer hover:text-white/50 transition"
                                    onClick={() => navigate('/admin/login')}
                                >
                                    👑 Admin Login
                                </span>
                            </div>

                            {/* Privacy */}
                            <p className="text-center text-white/30 text-[10px] flex items-center justify-center gap-1.5">
                                <FaLock size={9} />
                                We never share your personal information
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignIn