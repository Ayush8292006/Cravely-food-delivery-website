import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

// ✅ Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
})

// ============================================
// SEND OTP MAIL (Password Reset)
// ============================================
export const sendOtpMail = async (to, otp) => {
    try {
        console.log("📧 Sending OTP to:", to)
        console.log("🔑 OTP:", otp)

        const info = await transporter.sendMail({
            from: `"Cravely" <${process.env.MAIL_USER}>`,
            to: to,
            subject: 'Reset Your Password',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <h2 style="color: #8B1A2A;">🔐 Reset Your Password</h2>
                    <p>Your OTP for password reset is:</p>
                    <div style="font-size: 32px; font-weight: bold; color: #8B1A2A; padding: 15px; background: #fff; border-radius: 8px; text-align: center; border: 2px dashed #8B1A2A;">
                        ${otp}
                    </div>
                    <p style="color: #666; font-size: 14px;">This OTP expires in 5 minutes.</p>
                    <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                </div>
            `
        })

        console.log('✅ OTP email sent successfully')
        console.log('📧 Message ID:', info.messageId)
        return info
    } catch (error) {
        console.log('❌ OTP email error:', error.message)
        return null
    }
}

// ============================================
// SEND DELIVERY OTP MAIL
// ============================================
export const sendDeliveryOtpMail = async (user, otp) => {
    try {
        console.log("📧 Sending Delivery OTP to:", user?.email)
        console.log("🔑 Delivery OTP:", otp)

        if (!user?.email) {
            console.log("❌ No email found")
            return null
        }

        const info = await transporter.sendMail({
            from: `"Cravely" <${process.env.MAIL_USER}>`,
            to: user.email,
            subject: '📦 Delivery OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <h2 style="color: #8B1A2A;">📦 Delivery OTP</h2>
                    <p>Hi <b>${user.fullName || 'Customer'}</b>,</p>
                    <p>Your delivery OTP is:</p>
                    <div style="font-size: 36px; font-weight: bold; color: #8B1A2A; padding: 15px; background: #fff; border-radius: 8px; text-align: center; letter-spacing: 5px; border: 2px dashed #8B1A2A;">
                        ${otp}
                    </div>
                    <p style="color: #666; font-size: 14px;">This OTP expires in <b>5 minutes</b>.</p>
                    <p style="color: #666; font-size: 14px;">Please share this OTP with your delivery partner.</p>
                </div>
            `
        })

        console.log('✅ Delivery OTP email sent')
        return info
    } catch (error) {
        console.log('❌ Delivery OTP error:', error.message)
        return null
    }
}

// ============================================
// SEND ORDER CONFIRMATION MAIL
// ============================================
export const sendOrderConfirmation = async (user, orderDetails) => {
    try {
        if (!orderDetails || !user) {
            console.log("⚠️ Missing data, skipping email")
            return null
        }

        const orderId = orderDetails._id?.toString() || 'N/A'
        const shortOrderId = orderId.slice(-6) || 'N/A'

        const info = await transporter.sendMail({
            from: `"Cravely" <${process.env.MAIL_USER}>`,
            to: user.email,
            subject: '🎉 Order Confirmed - Cravely',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <h2 style="color: #8B1A2A; text-align: center;">🎉 Order Confirmed!</h2>
                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <p>Hi <b>${user.fullName || 'Customer'}</b>,</p>
                        <p>Your order has been placed successfully!</p>
                        <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px;">
                            <p><b>Order ID:</b> #${shortOrderId}</p>
                            <p><b>Total:</b> ₹${orderDetails.totalAmount || 0}</p>
                            <p><b>Payment:</b> ${orderDetails.paymentMethod?.toUpperCase() || 'N/A'}</p>
                        </div>
                        <p>Thank you for ordering with Cravely! 🍕</p>
                    </div>
                </div>
            `
        })

        console.log('✅ Order confirmation email sent')
        return info
    } catch (error) {
        console.log('❌ Order confirmation error:', error.message)
        return null
    }
}

// ============================================
// SEND EMAIL VERIFICATION MAIL
// ============================================
export const sendEmailVerificationMail = async (to, token) => {
    try {
        const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`

        console.log("📧 Sending verification to:", to)
        console.log("🔗 Link:", verificationLink)

        const info = await transporter.sendMail({
            from: `"Cravely" <${process.env.MAIL_USER}>`,
            to: to,
            subject: '✅ Verify Your Email - Cravely',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <h2 style="color: #8B1A2A; text-align: center;">Welcome to Cravely! 🍕</h2>
                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <p>Thank you for signing up!</p>
                        <p>Please verify your email to start ordering:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationLink}" 
                               style="background-color: #8B1A2A; color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold;">
                                ✅ Verify Email
                            </a>
                        </div>
                        <p style="font-size: 14px; color: #666;">This link expires in <b>24 hours</b>.</p>
                        <p style="font-size: 14px; color: #666;">If you didn't create an account, please ignore this email.</p>
                    </div>
                    <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
                        &copy; 2026 Cravely Food Delivery
                    </p>
                </div>
            `
        })

        console.log('✅ Verification email sent to:', to)
        console.log('📧 Message ID:', info.messageId)
        return info
    } catch (error) {
        console.log('❌ Verification email error:', error.message)
        return null
    }
}

// ============================================
// SEND LOGIN OTP MAIL
// ============================================
// ============================================
// SEND LOGIN OTP MAIL
// ============================================
export const sendLoginOtpMail = async (to, otp) => {
    try {
        console.log("📧 Sending Login OTP to:", to)
        console.log("🔑 Login OTP:", otp)

        if (!to) {
            console.log("❌ No email provided")
            return null
        }

        const info = await transporter.sendMail({
            from: `"Cravely" <${process.env.MAIL_USER}>`,
            to: to,
            subject: '🔑 Login OTP - Cravely',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <h2 style="color: #8B1A2A; text-align: center;">🔑 Login OTP</h2>
                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;">
                        <p style="font-size: 16px; color: #333;">Your login OTP is:</p>
                        <div style="font-size: 40px; font-weight: bold; color: #8B1A2A; padding: 15px; background: #f5f5f5; border-radius: 8px; margin: 15px 0; letter-spacing: 8px;">
                            ${otp}
                        </div>
                        <p style="color: #666; font-size: 14px;">This OTP expires in <b>10 minutes</b>.</p>
                        <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                    </div>
                    <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
                        &copy; 2026 Cravely Food Delivery
                    </p>
                </div>
            `
        })

        console.log('✅ Login OTP email sent successfully!')
        console.log('📧 Message ID:', info.messageId)
        return info
    } catch (error) {
        console.log('❌ Login OTP email error:', error.message)
        return null
    }
}