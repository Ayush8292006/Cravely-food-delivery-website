import Stripe from 'stripe'
import dotenv from 'dotenv'
dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// ============================================
// CREATE PAYMENT INTENT
// ============================================
export const createPaymentIntent = async (amount, currency = 'inr') => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: currency,
            payment_method_types: ['card'],
        })
        return paymentIntent
    } catch (error) {
        console.log('Stripe payment intent error:', error)
        throw error
    }
}

// ============================================
// CONFIRM PAYMENT
// ============================================
export const confirmPayment = async (paymentIntentId) => {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
        return paymentIntent
    } catch (error) {
        console.log('Stripe confirm payment error:', error)
        throw error
    }
}

// ============================================
// CREATE CHECKOUT SESSION (NEW)
// ============================================
export const createCheckoutSession = async (orderId, amount, currency = 'inr') => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: currency,
                        product_data: {
                            name: 'Food Delivery Order',
                            description: `Order #${orderId.toString().slice(-6)}`,
                        },
                        unit_amount: Math.round(amount * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            // ✅ SUCCESS URL - YEH SAHI HONA CHAHIYE
           success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-placed?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout`,
            metadata: {
                orderId: orderId.toString()
            }
        })
        return session
    } catch (error) {
        console.log('Stripe checkout session error:', error)
        throw error
    }
}

// ============================================
// REFUND PAYMENT
// ============================================
export const refundPayment = async (paymentIntentId, amount) => {
    try {
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: Math.round(amount * 100)
        })
        return refund
    } catch (error) {
        console.log('Stripe refund error:', error)
        throw error
    }
}

export default stripe