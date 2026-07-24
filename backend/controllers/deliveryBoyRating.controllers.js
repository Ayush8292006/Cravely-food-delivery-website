import DeliveryBoyRating from "../models/deliveryBoyRating.model.js"
import User from "../models/user.model.js"
import Order from "../models/order.model.js"

// ============================================
// ADD DELIVERY BOY RATING
// ============================================
export const addDeliveryBoyRating = async (req, res) => {
    try {
        const { orderId, rating, comment, deliveryTime, behavior } = req.body

        if (!orderId || !rating) {
            return res.status(400).json({ message: "Order ID and rating are required" })
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" })
        }

        // ✅ Check if order exists and get delivery boy info
        const order = await Order.findById(orderId)
            .populate('shopOrders.assignedDeliveryBoy', 'fullName email mobile')

        if (!order) {
            return res.status(400).json({ message: "Order not found" })
        }

        // ✅ Get delivery boy from order
        let deliveryBoyId = null
        let shopId = null
        order.shopOrders.forEach(shopOrder => {
            if (shopOrder.assignedDeliveryBoy) {
                deliveryBoyId = shopOrder.assignedDeliveryBoy._id
                shopId = shopOrder.shop
            }
        })

        if (!deliveryBoyId) {
            return res.status(400).json({ message: "No delivery boy assigned to this order" })
        }

        // ✅ Check if already rated
        const existingRating = await DeliveryBoyRating.findOne({ order: orderId, user: req.userId })
        if (existingRating) {
            return res.status(400).json({ message: "You already rated this delivery" })
        }

        // ✅ Create rating
        const deliveryBoyRating = await DeliveryBoyRating.create({
            order: orderId,
            deliveryBoy: deliveryBoyId,
            user: req.userId,
            shop: shopId,
            rating,
            comment: comment || '',
            deliveryTime: deliveryTime || 'on-time',
            behavior: behavior || 'professional'
        })

        // ✅ Update delivery boy's average rating
        const allRatings = await DeliveryBoyRating.find({ deliveryBoy: deliveryBoyId })
        const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
        
        await User.findByIdAndUpdate(deliveryBoyId, {
            deliveryBoyRating: {
                average: Math.round(avgRating * 10) / 10,
                count: allRatings.length
            }
        })

        await deliveryBoyRating.populate('user', 'fullName profilePhoto')
        await deliveryBoyRating.populate('deliveryBoy', 'fullName profilePhoto')

        return res.status(201).json(deliveryBoyRating)
    } catch (error) {
        return res.status(500).json({ message: `Add delivery rating error: ${error.message}` })
    }
}

// ============================================
// GET DELIVERY BOY RATINGS
// ============================================
export const getDeliveryBoyRatings = async (req, res) => {
    try {
        const { deliveryBoyId } = req.params
        const { page = 1, limit = 10 } = req.query

        const ratings = await DeliveryBoyRating.find({ deliveryBoy: deliveryBoyId })
            .populate('user', 'fullName profilePhoto')
            .populate('deliveryBoy', 'fullName profilePhoto')
            .populate('order', 'totalAmount createdAt')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))

        const total = await DeliveryBoyRating.countDocuments({ deliveryBoy: deliveryBoyId })

        return res.status(200).json({
            ratings,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
        return res.status(500).json({ message: `Get delivery ratings error: ${error.message}` })
    }
}

export const getDeliveryBoyAverageRating = async (req, res) => {
    try {
        const { deliveryBoyId } = req.params

        const ratings = await DeliveryBoyRating.find({ deliveryBoy: deliveryBoyId })
        const avgRating = ratings.length > 0 
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
            : 0

        return res.status(200).json({
            average: Math.round(avgRating * 10) / 10,
            count: ratings.length
        })
    } catch (error) {
        return res.status(500).json({ message: `Get average rating error: ${error.message}` })
    }
}