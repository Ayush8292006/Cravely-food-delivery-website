import Razorpay from 'razorpay'
import dotenv from 'dotenv'
dotenv.config()

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export const createOrder = async (amount, currency = 'INR') => {
    try {
        const options = {
            amount: Math.round(amount * 100), // paise mein
            currency: currency,
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1 // Auto capture
        }
        const order = await razorpay.orders.create(options)
        return order
    } catch (error) {
        console.log('Razorpay order error:', error)
        throw error
    }
}

export const verifyPayment = async (razorpayPaymentId, razorpayOrderId, razorpaySignature) => {
    try {
        // ✅ Crypto verification
        const crypto = await import('crypto')
        const body = razorpayOrderId + '|' + razorpayPaymentId
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex')
        
        return expectedSignature === razorpaySignature
    } catch (error) {
        console.log('Razorpay verify error:', error)
        throw error
    }
}

export default razorpay