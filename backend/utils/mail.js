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

// Helper: Common Email Wrapper
const emailWrapper = (title, content) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A090D; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0A090D; padding: 24px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #13121A; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden;">
                    <!-- Brand Header -->
                    <tr>
                        <td align="center" style="background-color: #181722; padding: 24px 20px; border-bottom: 2px solid #FF6B00;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
                                <span style="color: #FF6B00;">CRAVELY</span>
                            </h1>
                            <p style="margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #9CA3AF;">
                                Gourmet Express Delivery
                            </p>
                        </td>
                    </tr>
                    <!-- Main Body -->
                    <tr>
                        <td style="padding: 28px 24px;">
                            ${content}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color: #0E0D14; padding: 18px 20px; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 11px; color: #6B7280;">
                            <p style="margin: 0 0 6px;">Questions about your order? Reach out at support@cravely.com</p>
                            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Cravely Food Delivery. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`

// Helper: Format Items Table
const formatItemsTable = (order) => {
    let rows = ''
    if (order.shopOrders && Array.isArray(order.shopOrders)) {
        order.shopOrders.forEach(so => {
            if (so.shopOrderItems && Array.isArray(so.shopOrderItems)) {
                so.shopOrderItems.forEach(item => {
                    const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1)
                    rows += `
                        <tr>
                            <td style="padding: 8px 0; font-size: 13px; color: #D1D5DB; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                                ${item.name} <span style="color: #9CA3AF; font-size: 11px;">× ${item.quantity}</span>
                            </td>
                            <td align="right" style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #FFFFFF; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                                ₹${lineTotal}
                            </td>
                        </tr>
                    `
                })
            }
        })
    }
    return rows
}

// Helper: Format Financial Summary
const formatFinancialSummary = (order) => {
    const subtotal = order.subtotal ?? order.totalAmount ?? 0
    const deliveryFee = order.deliveryFee ?? 0
    const taxAmount = order.taxAmount ?? 0
    const discountAmount = order.discountAmount ?? 0
    const totalAmount = order.totalAmount ?? 0

    return `
        <table role="presentation" width="100%" style="margin-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 12px;">
            <tr>
                <td style="font-size: 12px; color: #9CA3AF; padding: 4px 0;">Item Subtotal</td>
                <td align="right" style="font-size: 12px; color: #D1D5DB; padding: 4px 0;">₹${subtotal}</td>
            </tr>
            <tr>
                <td style="font-size: 12px; color: #9CA3AF; padding: 4px 0;">Delivery Fee</td>
                <td align="right" style="font-size: 12px; color: ${deliveryFee === 0 ? '#10B981' : '#D1D5DB'}; padding: 4px 0;">
                    ${deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </td>
            </tr>
            <tr>
                <td style="font-size: 12px; color: #9CA3AF; padding: 4px 0;">Govt Taxes & GST</td>
                <td align="right" style="font-size: 12px; color: #D1D5DB; padding: 4px 0;">₹${taxAmount}</td>
            </tr>
            ${discountAmount > 0 ? `
            <tr>
                <td style="font-size: 12px; color: #10B981; padding: 4px 0;">Coupon Discount (${order.couponCode || 'PROMO'})</td>
                <td align="right" style="font-size: 12px; color: #10B981; font-weight: 600; padding: 4px 0;">- ₹${discountAmount}</td>
            </tr>
            ` : ''}
            <tr>
                <td style="font-size: 15px; font-weight: 700; color: #FFFFFF; padding: 12px 0 4px; border-top: 1px solid rgba(255, 255, 255, 0.15);">Total Payable</td>
                <td align="right" style="font-size: 18px; font-weight: 800; color: #FF6B00; padding: 12px 0 4px; border-top: 1px solid rgba(255, 255, 255, 0.15);">₹${totalAmount}</td>
            </tr>
        </table>
    `
}

// ============================================
// 1. SEND ORDER CONFIRMATION MAIL
// ============================================
export const sendOrderConfirmation = async (user, orderDetails) => {
    try {
        if (!orderDetails || !user?.email) {
            console.log("⚠️ Missing data for order confirmation email")
            return null
        }

        const orderId = orderDetails._id?.toString() || 'N/A'
        const shortOrderId = orderId.slice(-6).toUpperCase()

        const content = `
            <h2 style="margin: 0 0 12px; font-size: 18px; color: #FFFFFF;">
                Order Placed Successfully! 🎉
            </h2>
            <p style="margin: 0 0 16px; font-size: 13px; color: #9CA3AF; line-height: 1.5;">
                Hi <strong style="color: #FFFFFF;">${user.fullName || orderDetails.customerName || 'Foodie'}</strong>, your order has been received and sent to the kitchen.
            </p>

            <!-- Order Snapshot Box -->
            <div style="background-color: #1A1924; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 14px 16px; margin-bottom: 20px;">
                <table width="100%">
                    <tr>
                        <td style="font-size: 12px; color: #9CA3AF;">Order ID:</td>
                        <td align="right" style="font-size: 12px; font-weight: bold; font-family: monospace; color: #FF6B00;">#${shortOrderId}</td>
                    </tr>
                    <tr>
                        <td style="font-size: 12px; color: #9CA3AF;">Payment:</td>
                        <td align="right" style="font-size: 12px; font-weight: bold; color: ${orderDetails.paymentMethod === 'online' ? '#3B82F6' : '#10B981'};">
                            ${orderDetails.paymentMethod === 'online' ? 'ONLINE PREPAID' : 'CASH ON DELIVERY'}
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 12px; color: #9CA3AF;">Delivery To:</td>
                        <td align="right" style="font-size: 11px; color: #D1D5DB; max-width: 250px;">
                            ${orderDetails.deliveryAddress?.text || 'Standard Address'}
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Items Breakdown -->
            <h3 style="margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #9CA3AF;">
                Order Details
            </h3>
            <table role="presentation" width="100%" style="margin-bottom: 8px;">
                ${formatItemsTable(orderDetails)}
            </table>

            <!-- Financial Summary -->
            ${formatFinancialSummary(orderDetails)}

            <!-- CTA Button -->
            <div style="text-align: center; margin-top: 24px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/track-order/${orderId}" 
                   style="display: inline-block; background-color: #FF6B00; color: #FFFFFF; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 10px;">
                    Track Order Live &rarr;
                </a>
            </div>
        `

        const info = await transporter.sendMail({
            from: `"Cravely" <${process.env.MAIL_USER}>`,
            to: user.email,
            subject: `🎉 Order Confirmed #${shortOrderId} - Cravely`,
            html: emailWrapper('Order Confirmed', content)
        })

        console.log('✅ Order confirmation email delivered:', info.messageId)
        return info
    } catch (error) {
        console.log('❌ Order confirmation error:', error.message)
        return null
    }
}

// ============================================
// 2. SEND PAYMENT SUCCESS MAIL
// ============================================
export const sendPaymentSuccessMail = async (user, order) => {
    try {
        if (!order || !user?.email) return null
        const shortId = order._id.toString().slice(-6).toUpperCase()

        const content = `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="width: 52px; height: 52px; line-height: 52px; border-radius: 50%; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); font-size: 24px; color: #10B981; margin: 0 auto 12px;">
                    ✓
                </div>
                <h2 style="margin: 0 0 6px; font-size: 19px; color: #FFFFFF;">Payment Verified!</h2>
                <p style="margin: 0; font-size: 13px; color: #9CA3AF;">
                    We have successfully received ₹${order.totalAmount} for order #${shortId}.
                </p>
            </div>

            <div style="background-color: #1A1924; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                <table width="100%">
                    <tr>
                        <td style="font-size: 12px; color: #9CA3AF;">Transaction Reference:</td>
                        <td align="right" style="font-size: 12px; font-family: monospace; color: #FFFFFF;">${order.transactionId || order.razorpayPaymentId || 'VERIFIED'}</td>
                    </tr>
                    <tr>
                        <td style="font-size: 12px; color: #9CA3AF;">Payment Gateway:</td>
                        <td align="right" style="font-size: 12px; color: #FFFFFF;">Razorpay Secure 256-bit</td>
                    </tr>
                    <tr>
                        <td style="font-size: 12px; color: #9CA3AF;">Amount Paid:</td>
                        <td align="right" style="font-size: 14px; font-weight: bold; color: #10B981;">₹${order.totalAmount}</td>
                    </tr>
                </table>
            </div>

            ${formatFinancialSummary(order)}
        `

        return await transporter.sendMail({
            from: `"Cravely" <${process.env.MAIL_USER}>`,
            to: user.email,
            subject: `💳 Payment Received for Order #${shortId} - Cravely`,
            html: emailWrapper('Payment Successful', content)
        })
    } catch (error) {
        console.log('Payment success email error:', error.message)
        return null
    }
}

// ============================================
// 3. SEND ORDER STATUS UPDATE MAIL
// ============================================
export const sendOrderStatusUpdateMail = async (user, order, status) => {
    try {
        if (!order || !user?.email) return null
        const shortId = order._id.toString().slice(-6).toUpperCase()

        const statusDescriptions = {
            'preparing': {
                title: 'Kitchen is Preparing Your Feast 👨‍🍳',
                message: 'The chef has accepted your order and is cooking with the freshest ingredients.'
            },
            'out of delivery': {
                title: 'Your Food is Out for Delivery! 🛵',
                message: 'Our delivery partner is on the way to your doorstep. Keep your delivery OTP handy.'
            },
            'delivered': {
                title: 'Order Delivered! Enjoy Your Meal 🍽️',
                message: 'Your order has been handed over safely. We hope you enjoy every single bite!'
            }
        }

        const infoObj = statusDescriptions[status] || {
            title: `Order Status: ${status.toUpperCase()}`,
            message: `Your order status has been updated to "${status}".`
        }

        const content = `
            <h2 style="margin: 0 0 10px; font-size: 18px; color: #FFFFFF;">${infoObj.title}</h2>
            <p style="margin: 0 0 18px; font-size: 13px; color: #9CA3AF; line-height: 1.5;">${infoObj.message}</p>

            <div style="background-color: #1A1924; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 14px 16px; margin-bottom: 20px;">
                <table width="100%">
                    <tr>
                        <td style="font-size: 12px; color: #9CA3AF;">Order ID:</td>
                        <td align="right" style="font-size: 12px; font-weight: bold; font-family: monospace; color: #FF6B00;">#${shortId}</td>
                    </tr>
                    <tr>
                        <td style="font-size: 12px; color: #9CA3AF;">Total Amount:</td>
                        <td align="right" style="font-size: 13px; font-weight: bold; color: #FFFFFF;">₹${order.totalAmount}</td>
                    </tr>
                </table>
            </div>

            <div style="text-align: center; margin-top: 20px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/track-order/${order._id}" 
                   style="display: inline-block; background-color: #FF6B00; color: #FFFFFF; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 10px;">
                    View Live Tracker &rarr;
                </a>
            </div>
        `

        return await transporter.sendMail({
            from: `"Cravely" <${process.env.MAIL_USER}>`,
            to: user.email,
            subject: `${infoObj.title} (#${shortId}) - Cravely`,
            html: emailWrapper(infoObj.title, content)
        })
    } catch (error) {
        console.log('Status update email error:', error.message)
        return null
    }
}

// ============================================
// 4. SEND ORDER CANCELLATION MAIL
// ============================================
export const sendOrderCancellationMail = async (user, order, reason) => {
    try {
        if (!order || !user?.email) return null
        const shortId = order._id.toString().slice(-6).toUpperCase()

        const content = `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="width: 52px; height: 52px; line-height: 52px; border-radius: 50%; background-color: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); font-size: 24px; color: #EF4444; margin: 0 auto 12px;">
                    ✕
                </div>
                <h2 style="margin: 0 0 6px; font-size: 19px; color: #FFFFFF;">Order Cancelled</h2>
                <p style="margin: 0; font-size: 13px; color: #9CA3AF;">
                    Order #${shortId} has been cancelled as requested.
                </p>
            </div>

            <div style="background-color: #1A1924; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 14px 16px; margin-bottom: 16px;">
                <table width="100%">
                    <tr>
                        <td style="font-size: 12px; color: #9CA3AF;">Reason:</td>
                        <td align="right" style="font-size: 12px; color: #FFFFFF;">${reason || 'Customer Request'}</td>
                    </tr>
                    <tr>
                        <td style="font-size: 12px; color: #9CA3AF;">Order Total:</td>
                        <td align="right" style="font-size: 12px; font-weight: bold; color: #FFFFFF;">₹${order.totalAmount}</td>
                    </tr>
                    <tr>
                        <td style="font-size: 12px; color: #9CA3AF;">Refund Status:</td>
                        <td align="right" style="font-size: 12px; font-weight: bold; color: ${order.paymentMethod === 'online' ? '#10B981' : '#9CA3AF'};">
                            ${order.paymentMethod === 'online' ? `Processing (₹${order.totalAmount})` : 'Not Applicable (COD)'}
                        </td>
                    </tr>
                </table>
            </div>

            ${order.paymentMethod === 'online' ? `
                <p style="font-size: 12px; color: #9CA3AF; line-height: 1.5;">
                    The full amount of <strong>₹${order.totalAmount}</strong> has been initiated for refund via the original payment source and should reflect in your account within 3-5 business days.
                </p>
            ` : ''}
        `

        return await transporter.sendMail({
            from: `"Cravely" <${process.env.MAIL_USER}>`,
            to: user.email,
            subject: `Order Cancelled #${shortId} - Cravely`,
            html: emailWrapper('Order Cancelled', content)
        })
    } catch (error) {
        console.log('Cancellation email error:', error.message)
        return null
    }
}

// ============================================
// 5. SEND REFUND STATUS MAIL
// ============================================
export const sendRefundStatusMail = async (user, order) => {
    try {
        if (!order || !user?.email) return null
        const shortId = order._id.toString().slice(-6).toUpperCase()

        const content = `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="width: 52px; height: 52px; line-height: 52px; border-radius: 50%; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); font-size: 24px; color: #10B981; margin: 0 auto 12px;">
                    ✓
                </div>
                <h2 style="margin: 0 0 6px; font-size: 19px; color: #FFFFFF;">Refund Processed!</h2>
                <p style="margin: 0; font-size: 13px; color: #9CA3AF;">
                    ₹${order.refundAmount || order.totalAmount} has been refunded for Order #${shortId}.
                </p>
            </div>

            <div style="background-color: #1A1924; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 14px 16px; margin-bottom: 16px;">
                <table width="100%">
                    <tr>
                        <td style="font-size: 12px; color: #9CA3AF;">Refund ID:</td>
                        <td align="right" style="font-size: 12px; font-family: monospace; color: #FFFFFF;">${order.refundId || 'REFUND-COMPLETED'}</td>
                    </tr>
                    <tr>
                        <td style="font-size: 12px; color: #9CA3AF;">Amount:</td>
                        <td align="right" style="font-size: 14px; font-weight: bold; color: #10B981;">₹${order.refundAmount || order.totalAmount}</td>
                    </tr>
                    <tr>
                        <td style="font-size: 12px; color: #9CA3AF;">Destination:</td>
                        <td align="right" style="font-size: 12px; color: #FFFFFF;">Original Payment Method</td>
                    </tr>
                </table>
            </div>
        `

        return await transporter.sendMail({
            from: `"Cravely" <${process.env.MAIL_USER}>`,
            to: user.email,
            subject: `₹${order.refundAmount || order.totalAmount} Refund Completed for Order #${shortId} - Cravely`,
            html: emailWrapper('Refund Completed', content)
        })
    } catch (error) {
        console.log('Refund status email error:', error.message)
        return null
    }
}

// ============================================
// 6. SEND DELIVERY OTP MAIL
// ============================================
export const sendDeliveryOtpMail = async (user, otp) => {
    try {
        if (!user?.email) return null

        const content = `
            <h2 style="margin: 0 0 10px; font-size: 18px; color: #FFFFFF;">📦 Delivery Verification Code</h2>
            <p style="margin: 0 0 16px; font-size: 13px; color: #9CA3AF;">
                Hi <strong>${user.fullName || 'Customer'}</strong>, share this one-time code with your delivery partner to complete your drop-off:
            </p>

            <div style="text-align: center; padding: 18px; background-color: #1A1924; border: 2px dashed #FF6B00; border-radius: 12px; margin: 18px 0;">
                <span style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #FF6B00; font-family: monospace;">
                    ${otp}
                </span>
            </div>

            <p style="font-size: 12px; color: #9CA3AF; text-align: center; margin: 0;">
                This code expires in <strong>5 minutes</strong>. Do not share it until you have received your food.
            </p>
        `

        return await transporter.sendMail({
            from: `"Cravely" <${process.env.MAIL_USER}>`,
            to: user.email,
            subject: `📦 Delivery OTP: ${otp} - Cravely`,
            html: emailWrapper('Delivery OTP', content)
        })
    } catch (error) {
        console.log('Delivery OTP error:', error.message)
        return null
    }
}

// ============================================
// 7. SEND OTP MAIL (Password Reset)
// ============================================
export const sendOtpMail = async (to, otp) => {
    try {
        if (!to) return null
        const content = `
            <h2 style="margin: 0 0 10px; font-size: 18px; color: #FFFFFF;">🔐 Password Reset Request</h2>
            <p style="margin: 0 0 16px; font-size: 13px; color: #9CA3AF;">
                We received a request to reset your password. Use the following code:
            </p>
            <div style="text-align: center; padding: 16px; background-color: #1A1924; border: 2px dashed #FF6B00; border-radius: 12px; margin: 18px 0;">
                <span style="font-size: 34px; font-weight: 800; letter-spacing: 6px; color: #FF6B00; font-family: monospace;">
                    ${otp}
                </span>
            </div>
            <p style="font-size: 12px; color: #9CA3AF; margin: 0;">This OTP expires in 5 minutes. If you did not request this, please ignore this email.</p>
        `
        return await transporter.sendMail({
            from: `"Cravely" <${process.env.MAIL_USER}>`,
            to,
            subject: 'Reset Your Password - Cravely',
            html: emailWrapper('Password Reset', content)
        })
    } catch (error) {
        console.log('OTP email error:', error.message)
        return null
    }
}

// ============================================
// 8. SEND EMAIL VERIFICATION MAIL
// ============================================
export const sendEmailVerificationMail = async (to, token) => {
    try {
        const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`
        const content = `
            <h2 style="margin: 0 0 10px; font-size: 18px; color: #FFFFFF;">Welcome to Cravely! 🍕</h2>
            <p style="margin: 0 0 20px; font-size: 13px; color: #9CA3AF; line-height: 1.5;">
                Thank you for joining Cravely. Please verify your email address to unlock seamless ordering:
            </p>
            <div style="text-align: center; margin: 24px 0;">
                <a href="${verificationLink}" 
                   style="display: inline-block; background-color: #FF6B00; color: #FFFFFF; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 32px; border-radius: 10px;">
                    Verify My Email &rarr;
                </a>
            </div>
            <p style="font-size: 11px; color: #6B7280; text-align: center;">This link expires in 24 hours.</p>
        `
        return await transporter.sendMail({
            from: `"Cravely" <${process.env.MAIL_USER}>`,
            to,
            subject: 'Verify Your Email - Cravely',
            html: emailWrapper('Verify Email', content)
        })
    } catch (error) {
        console.log('Verification email error:', error.message)
        return null
    }
}

// ============================================
// 9. SEND LOGIN OTP MAIL
// ============================================
export const sendLoginOtpMail = async (to, otp) => {
    try {
        if (!to) return null
        const content = `
            <h2 style="margin: 0 0 10px; font-size: 18px; color: #FFFFFF;">🔑 Login Verification Code</h2>
            <p style="margin: 0 0 16px; font-size: 13px; color: #9CA3AF;">Use this code to sign in to your Cravely account:</p>
            <div style="text-align: center; padding: 16px; background-color: #1A1924; border: 2px dashed #FF6B00; border-radius: 12px; margin: 18px 0;">
                <span style="font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #FF6B00; font-family: monospace;">
                    ${otp}
                </span>
            </div>
            <p style="font-size: 12px; color: #9CA3AF; margin: 0;">This OTP expires in 10 minutes.</p>
        `
        return await transporter.sendMail({
            from: `"Cravely" <${process.env.MAIL_USER}>`,
            to,
            subject: '🔑 Login Verification Code - Cravely',
            html: emailWrapper('Login Verification', content)
        })
    } catch (error) {
        console.log('Login OTP error:', error.message)
        return null
    }
}
