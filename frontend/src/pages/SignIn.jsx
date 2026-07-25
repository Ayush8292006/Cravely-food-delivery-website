import React, { useState, useEffect } from 'react'
import { 
    FaRegEye, FaRegEyeSlash, FaGoogle, FaArrowRight, 
    FaTruck, FaStar, FaFire, FaLock, FaEnvelope, FaBolt, FaArrowLeft 
} from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';
import { ClipLoader } from "react-spinners"
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { MdMail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { toast } from "react-toastify";

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
        const { data } = await axios.post(
            `${serverUrl}/api/auth/google-auth`,
            {
                fullName: result.user.displayName,
                email: result.user.email, 
                role: role,
                mobile: result.user.phoneNumber || "0000000000"
            }, 
            { 
                withCredentials: true,  // ✅ MUST BE TRUE
                headers: { 'Content-Type': 'application/json' }
            }
        )
        
        dispatch(setUserData(data))
        
        // ✅ Check cookie after login
        console.log("✅ Google Auth successful")
        console.log("📝 Cookies:", document.cookie)

        toast.success("Signed up successfully with Google!")
        setTimeout(() => {
            navigate("/");
        }, 2000);
        
    } catch (error) {
        console.log("❌ Google auth error:", error)
        toast.error("Google sign up failed!")
    }
}

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
            {/* Background Glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#ff2d55]/8 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#ff6b35]/10 rounded-full blur-3xl animate-pulse animation-delay-200" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ff2d55]/5 rounded-full blur-3xl" />
            </div>

            {/* Back Button */}
            <button 
                onClick={() => navigate('/')}
                className="fixed top-6 left-6 z-50 glass-premium px-4 py-2.5 rounded-full text-white/70 hover:text-white transition-all duration-300 flex items-center gap-2 text-sm hover:scale-105 hover:shadow-lg hover:shadow-[#ff2d55]/10 border border-white/5"
            >
                <FaArrowLeft size={14} />
                Back to Home
            </button>

            {/* Main Container */}
            <div className={`w-full max-w-6xl min-h-[650px] rounded-3xl overflow-hidden shadow-2xl shadow-[#ff2d55]/10 flex flex-col md:flex-row relative transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
            }`}>
                
                {/* Left Side - Image */}
                <div className="hidden md:flex md:w-1/2 relative flex-col justify-between min-h-[650px] group overflow-hidden">
                    <div className="absolute inset-0 transition-transform duration-700 ease-in-out group-hover:scale-105">
                        <img 
                            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=800&fit=crop" 
                            alt="Delicious Food" 
                            className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/35 to-black/60" />
                    </div>

                   

                    {/* Floating Glass Badges */}
                    <div className="absolute top-4 left-6 right-6 flex justify-between z-10">
                        <div className="glass-premium px-4 py-2 rounded-xl flex items-center gap-2 text-white text-sm border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#ff6b35]/20 animate-float">
                            <FaTruck className="text-[#ff6b35]" />
                            <span>30 Min</span>
                        </div>
                        <div className="glass-premium px-4 py-2 rounded-xl flex items-center gap-2 text-white text-sm border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#ff6b35]/20 animate-float animation-delay-200">
                            <FaStar className="text-yellow-400" />
                            <span>4.9 ★</span>
                        </div>
                        <div className="glass-premium px-4 py-2 rounded-xl flex items-center gap-2 text-white text-sm border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#ff6b35]/20 animate-float animation-delay-400">
                            <FaFire className="text-[#ff2d55]" />
                            <span>5K+ Orders</span>
                        </div>
                    </div>

                    {/* ✅ Rating Badge - Niche */}
                    <div className="absolute bottom-3 left-6 right-6 z-10">
                        <div className="glass-premium p-4 rounded-2xl border border-white/10 max-w-xs mx-auto transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#ff6b35]/20">
                            <div className="flex items-center justify-center gap-3">
                                <div className="flex">
                                    {[1,2,3,4,5].map((i) => (
                                        <FaStar key={i} className="text-yellow-400 text-sm" />
                                    ))}
                                </div>
                                <span className="text-white font-semibold text-sm">4.9 Rating</span>
                                <span className="text-white/40 text-xs">|</span>
                                <span className="text-white/60 text-sm">5,000+ Trusted</span>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 p-10 top-7 flex flex-col justify-end min-h-[650px] pb-36">
                        <div className="absolute top-12 left-10">
                            <h1 className="text-5xl font-bold text-white mb-0.5">Cravely</h1>
                            <p className="text-gradient-hero text-lg tracking-wider uppercase">Food Delivery</p>
                        </div>
                        
                        <div className="mb-4">
                            <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
                                Welcome Back! 👋
                            </h2>
                            <p className="text-white/70 text-base leading-relaxed max-w-xs">
                                Sign in to continue your food journey with Cravely.
                            </p>
                            <div className="mt-5 flex gap-3 flex-wrap">
                                <div className="glass-premium px-3.5 py-1.5 rounded-xl text-white text-xs font-medium border border-white/10">
                                    🚀 Fast Delivery
                                </div>
                                <div className="glass-premium px-3.5 py-1.5 rounded-xl text-white text-xs font-medium border border-white/10">
                                    🍕 Premium Quality
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 glass-form p-6 md:p-10 overflow-y-auto max-h-[95vh] md:max-h-none">
                    <div className="max-w-md mx-auto">
                        {/* Back Button - Inside Form */}
                        <div className="flex items-center justify-between mb-4">
                            <button 
                                onClick={() => navigate('/')}
                                className="glass-premium px-3.5 py-2 rounded-full text-white/60 hover:text-white transition-all duration-300 flex items-center gap-2 text-xs hover:scale-105 border border-white/5"
                            >
                                <FaArrowLeft size={12} />
                                Back
                            </button>
                            <span className="text-[10px] text-white/20">Secure 🔒</span>
                        </div>

                        {/* Mobile Logo */}
                        <div className="md:hidden text-center mb-4">
                            <h1 className="text-2xl font-bold text-gradient">Cravely</h1>
                            <p className="text-white/40 text-sm">Welcome back</p>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-1">Sign In</h2>
                        <p className="text-white/40 text-sm mb-6">
                            Welcome back to <span className="text-gradient font-semibold">Cravely</span>!
                        </p>

                        <form onSubmit={(e) => { e.preventDefault(); handleSignIn(); }} className="space-y-4">
                            {/* Email */}
                            <div className="relative group">
                                <MdMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#ff6b35] transition-colors duration-300" size={18} />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    className="w-full glass-input pl-12 pr-4 py-3.5 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/50 transition-all duration-300 text-sm"
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div className="relative group">
                                <RiLockPasswordFill className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#ff6b35] transition-colors duration-300" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className="w-full glass-input pl-12 pr-12 py-3.5 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/50 transition-all duration-300 text-sm"
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                    required
                                />
                                <button
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-all duration-300 hover:scale-110"
                                    onClick={() => setshowPassword((prev) => !prev)}
                                >
                                    {!showPassword ? <FaRegEye size={18} /> : <FaRegEyeSlash size={18} />}
                                </button>
                            </div>

                            {/* Forgot Password & OTP Login */}
                            <div className="flex items-center justify-between">
                                <span 
                                    className="text-[#ff2d55] text-xs cursor-pointer hover:underline"
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

                            {err && <p className="text-red-400 text-xs text-center">{err}</p>}

                            {/* Sign In Button */}
                            <button
                                type="submit"
                                className="w-full btn-neon py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold group transition-all duration-300"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <ClipLoader size={18} color="white" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <FaArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                                    </>
                                )}
                            </button>

                            {/* Trust Section */}
                            <div className="flex justify-center gap-4 text-white/30 text-xs py-1">
                                <span className="flex items-center gap-1"><FaLock size={10} /> Secure</span>
                                <span className="flex items-center gap-1"><FaEnvelope size={10} /> Verified</span>
                                <span className="flex items-center gap-1"><FaBolt size={10} /> Instant</span>
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-white/10" />
                                <span className="text-white/30 text-xs">or continue with</span>
                                <div className="flex-1 h-px bg-white/10" />
                            </div>

                            {/* Google */}
                            <button
                                type="button"
                                className="w-full glass py-3.5 rounded-xl text-white/70 text-sm font-medium hover:bg-white/8 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] hover:border-white/20 border border-white/5"
                                onClick={handleGoogleAuth}
                            >
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                                Google
                            </button>

                            {/* Admin Login Button */}
                            <div className="text-center mt-2">
                                <span 
                                    className="text-white/30 text-xs cursor-pointer hover:text-white/50 transition"
                                    onClick={() => navigate('/admin/login')}
                                >
                                    👑 Admin Login
                                </span>
                            </div>

                            <p className="text-center text-white/40 text-xs">
                                Don't have an account?{' '}
                                <span className="text-gradient cursor-pointer hover:opacity-80 transition" onClick={() => navigate("/signup")}>
                                    Sign Up
                                </span>
                            </p>
                        </form>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                .animation-delay-200 { animation-delay: 0.2s; }
                .animation-delay-400 { animation-delay: 0.4s; }

                @keyframes pulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                }
                .animate-pulse {
                    animation: pulse 4s ease-in-out infinite;
                }

                .glass-form {
                    background: rgba(255, 255, 255, 0.04);
                    backdrop-filter: blur(18px);
                    -webkit-backdrop-filter: blur(18px);
                    border-left: 1px solid rgba(255, 255, 255, 0.06);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
                }

                .glass-premium {
                    background: rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }

                .glass-input {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    transition: all 0.3s ease;
                }
                .glass-input:focus {
                    border-color: rgba(255, 107, 53, 0.3);
                    box-shadow: 0 0 25px rgba(255, 107, 53, 0.15);
                }

                .glass {
                    background: rgba(255, 255, 255, 0.04);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }

                .btn-neon {
                    background: linear-gradient(135deg, #ff2d55, #ff6b35);
                    color: white;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 0 30px rgba(255, 45, 85, 0.15);
                }
                .btn-neon:hover {
                    transform: translateY(-2px) scale(1.01);
                    box-shadow: 0 0 50px rgba(255, 45, 85, 0.25);
                }

                .text-gradient {
                    background: linear-gradient(135deg, #ff2d55, #ff6b35);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
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

export default SignIn