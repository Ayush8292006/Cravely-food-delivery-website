import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import genToken from "../utils/token.js"
import { sendOtpMail, sendEmailVerificationMail, sendLoginOtpMail } from "../utils/mail.js"
import crypto from 'crypto'

export const signUp = async (req, res) => {
    try {
        const { fullName, email, password, mobile, role } = req.body

        console.log("📝 Signup Request:", { fullName, email, password: password ? "Received" : "Missing", mobile, role })

        if (!fullName || !email || !password || !mobile || !role) {
            return res.status(400).json({ 
                message: "All fields are required: fullName, email, password, mobile, role" 
            })
        }

        let user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: "User Already exists" })
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                message: "Password must have at least 6 characters" 
            })
        }

        if (mobile.length < 10) {
            return res.status(400).json({ 
                message: "Mobile number must have at least 10 digits" 
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        
        user = await User.create({
            fullName,
            email,
            role,
            mobile,
            password: hashedPassword,
            isEmailVerified: true,
            isApproved: true
        })

        console.log("✅ User created & auto-verified:", user.email)

        const token = await genToken(user._id)
        
        res.cookie("token", token, {
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            path: '/'
        })

        return res.status(201).json({
            message: "Signup successful! Welcome to Cravely.",
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            mobile: user.mobile,
            isApproved: user.isApproved,
            isEmailVerified: true
        })
    } catch (error) {
        console.log("❌ Signup error:", error.message)
        return res.status(500).json({ message: `Signup error: ${error.message}` })
    }
}

// ============================================
// OTP LOGIN - Send OTP
// ============================================
export const sendLoginOtp = async (req, res) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User not found with this email" })
        }

        if (!user.isEmailVerified) {
            return res.status(400).json({ message: "Please verify your email first" })
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        
        user.loginOtp = otp
        user.loginOtpExpires = Date.now() + 10 * 60 * 1000
        await user.save()

        console.log("🔑 Login OTP for", email, ":", otp)

        const emailResult = await sendLoginOtpMail(email, otp)
        
        if (emailResult) {
            console.log("✅ Login OTP email sent to:", email)
        } else {
            console.log("⚠️ Email sending failed, but OTP is saved in DB")
        }

        // ✅ FIXED: OTP sirf console me log karo, response me nahi
        return res.status(200).json({
            message: "OTP sent to your email",
            email: email
        })
    } catch (error) {
        console.log("❌ Send login OTP error:", error.message)
        return res.status(500).json({ message: `Send OTP error: ${error.message}` })
    }
}

// ============================================
// OTP LOGIN - Verify OTP
// ============================================
export const verifyLoginOtp = async (req, res) => {
    try {
        const { email, otp } = req.body

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" })
        }

        const user = await User.findOne({
            email,
            loginOtp: otp,
            loginOtpExpires: { $gt: Date.now() }
        })

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" })
        }

        user.loginOtp = undefined
        user.loginOtpExpires = undefined
        await user.save()

        const token = await genToken(user._id)
        res.cookie("token", token, {
            secure: process.env.NODE_ENV === 'production',
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        })

        return res.status(200).json({
            message: "Login successful",
            user: user
        })
    } catch (error) {
        console.log("❌ Verify login OTP error:", error.message)
        return res.status(500).json({ message: `Verify OTP error: ${error.message}` })
    }
}

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params

        console.log("🔍 Verifying token:", token)

        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        })

        if (!user) {
            return res.status(400).json({ 
                message: "Invalid or expired verification token" 
            })
        }

        user.isEmailVerified = true
        user.emailVerificationToken = null
        user.emailVerificationExpires = null
        await user.save()

        console.log("✅ Email verified for:", user.email)

        return res.status(200).json({ 
            message: "Email verified successfully! You can now login." 
        })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: "Email already verified" })
        }

        const verificationToken = crypto.randomBytes(32).toString('hex')
        user.emailVerificationToken = verificationToken
        user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000
        await user.save()

        await sendEmailVerificationMail(email, verificationToken)

        return res.status(200).json({ 
            message: "Verification email sent successfully" 
        })
    } catch (error) {
        return res.status(500).json({ message: `resend verification error ${error.message}` })
    }
}

export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({ message: "User does not exist" })
        }

        if (!user.isEmailVerified) {
            user.isEmailVerified = true
            await user.save()
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect Password" })
        }

        const token = await genToken(user._id)
        
        res.cookie("token", token, {
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            path: '/'
        })

        console.log("✅ Token set for:", user.email)

        return res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            mobile: user.mobile,
            isApproved: user.isApproved
        })
        
    } catch (error) {
        console.log("❌ Sign in error:", error.message)
        return res.status(500).json({ message: `sign In error: ${error.message}` })
    }
}

// ✅ FIXED: SignOut with proper clearCookie options
export const signOut = async (req, res) => {
    try {
        res.clearCookie("token", {
            secure: true,
            sameSite: "none",
            path: '/',
            httpOnly: true
        })
        return res.status(200).json({ message: "Logged out Successfully" })
    } catch (error) {
        return res.status(500).json({ message: `sign Out error ${error.message}` })
    }
}

export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body
        console.log("📧 Sending OTP to:", email)
        
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User does not exist." })
        }
        
        const otp = Math.floor(1000 + Math.random() * 9000).toString()
        user.resetOtp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000
        user.isOtpVerified = false
        await user.save()
        
        console.log("🔑 OTP for", email, ":", otp)
        
        await sendOtpMail(email, otp)
        return res.status(200).json({ message: "otp sent successfully" })
    } catch (error) {
        console.log("SEND OTP ERROR:", error.message)
        return res.status(500).json({ message: `send otp error ${error.message}` })
    }
}

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body
        const user = await User.findOne({ email })
        if (!user || user.resetOtp != otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "invalid/expired otp" })
        }
        user.isOtpVerified = true
        user.resetOtp = undefined
        user.otpExpires = undefined
        await user.save()
        return res.status(200).json({ message: "otp verified successfully" })
    } catch (error) {
        return res.status(500).json({ message: `verify otp error ${error.message}` })
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body
        const user = await User.findOne({ email })
        if (!user || !user.isOtpVerified) {
            return res.status(400).json({ message: "otp verification required" })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashedPassword
        user.isOtpVerified = false
        await user.save()
        return res.status(200).json({ message: "Password reset successfully" })
    } catch (error) {
        return res.status(500).json({ message: `reset password error ${error.message}` })
    }
}

export const googleAuth = async (req, res) => {
    try {
        const { fullName, email, mobile, role } = req.body
        
        console.log("🔍 Google Auth Request:", { fullName, email, role })

        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }

        let user = await User.findOne({ email })
        
        if (!user) {
            user = await User.create({
                fullName: fullName || email.split('@')[0],
                email: email,
                mobile: mobile || "0000000000",
                role: role || "user",
                isEmailVerified: true,
                isApproved: true
            })
            console.log("✅ New user created:", user.email)
        } else {
            console.log("✅ Existing user found:", user.email)
        }

        const token = await genToken(user._id)
        
        if (!token) {
            return res.status(500).json({ message: "Failed to generate token" })
        }

        res.cookie("token", token, {
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            path: '/'
        })

        console.log("✅ Token set for Google user:", user.email)

        const userData = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            mobile: user.mobile,
            isApproved: user.isApproved,
            profilePhoto: user.profilePhoto
        }

        return res.status(200).json(userData)
        
    } catch (error) {
        console.log("❌ Google Auth error:", error.message)
        return res.status(500).json({ 
            message: `Google Authentication error: ${error.message}` 
        })
    }
}