import Razorpay from 'razorpay'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_TGBOrn6rcZhh6H',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'Q4nMta2A546gunyD3zrieF07',
})

export const createOrder = async (amount, currency = 'INR') => {
    try {
        const options = {
            amount: Math.round(Number(amount) * 100), // paise mein
            currency: currency,
            receipt: `rcpt_${Date.now()}`,
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
        const crypto = await import('crypto')
        const body = razorpayOrderId + '|' + razorpayPaymentId
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'Q4nMta2A546gunyD3zrieF07')
            .update(body)
            .digest('hex')
        
        return expectedSignature === razorpaySignature
    } catch (error) {
        console.log('Razorpay verify error:', error)
        throw error
    }
}

export const refundPayment = async (paymentId, amount = null, notes = {}) => {
    try {
        const options = { notes: { ...notes, initiatedAt: new Date().toISOString() } }
        if (amount) {
            options.amount = Math.round(Number(amount) * 100) // in paise
        }
        const refund = await razorpay.payments.refund(paymentId, options)
        console.log("✅ Razorpay Refund Processed:", refund.id)
        return refund
    } catch (error) {
        console.log('Razorpay refund error:', error)
        // If refund fails or not eligible in test mode, return structured error details
        throw error
    }
}

export default razorpay
