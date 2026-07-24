import express from "express"
import { googleAuth, resetPassword, sendOtp, signIn, signOut, signUp, verifyOtp, verifyEmail, resendVerificationEmail ,  sendLoginOtp, verifyLoginOtp } from "../controllers/auth.controllers.js"

const authRouter = express.Router()

authRouter.post("/signup",signUp)
authRouter.post("/signin",signIn)
authRouter.get("/signout",signOut)
authRouter.post("/send-otp",sendOtp)
authRouter.post("/verify-otp",verifyOtp)
authRouter.post("/reset-password",resetPassword)
authRouter.post("/google-auth",googleAuth)

authRouter.get("/verify-email/:token", verifyEmail)
authRouter.post("/resend-verification", resendVerificationEmail)

authRouter.post("/send-login-otp", sendLoginOtp)
authRouter.post("/verify-login-otp", verifyLoginOtp)

export default authRouter
