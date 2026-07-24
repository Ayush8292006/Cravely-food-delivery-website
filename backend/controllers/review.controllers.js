import Review from "../models/review.model.js"
import Shop from "../models/shop.model.js"
import Order from "../models/order.model.js"

// ============================================
// ADD REVIEW
// ============================================
export const addReview = async (req, res) => {
    try {
        const { shopId, orderId, rating, comment } = req.body

        if (!shopId || !rating) {
            return res.status(400).json({ message: "Shop ID and rating are required" })
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" })
        }

        // ✅ Check if user already reviewed this shop
        const existingReview = await Review.findOne({ user: req.userId, shop: shopId })
        if (existingReview) {
            return res.status(400).json({ message: "You already reviewed this restaurant" })
        }

        // ✅ Check if shop exists
        const shop = await Shop.findById(shopId)
        if (!shop) {
            return res.status(400).json({ message: "Shop not found" })
        }

        const review = await Review.create({
            user: req.userId,
            shop: shopId,
            order: orderId || null,
            rating,
            comment: comment || '',
            isVerified: !!orderId
        })

        // ✅ Update shop rating
        const allReviews = await Review.find({ shop: shopId })
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        
        shop.rating = {
            average: Math.round(avgRating * 10) / 10,
            count: allReviews.length
        }
        await shop.save()

        await review.populate('user', 'fullName profilePhoto')

        return res.status(201).json(review)
    } catch (error) {
        return res.status(500).json({ message: `Add review error: ${error.message}` })
    }
}

// ============================================
// GET SHOP REVIEWS
// ============================================
export const getShopReviews = async (req, res) => {
    try {
        const { shopId } = req.params
        const { page = 1, limit = 10 } = req.query

        const reviews = await Review.find({ shop: shopId })
            .populate('user', 'fullName profilePhoto')
            .populate('replies.user', 'fullName profilePhoto')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))

        const total = await Review.countDocuments({ shop: shopId })

        return res.status(200).json({
            reviews,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
        return res.status(500).json({ message: `Get reviews error: ${error.message}` })
    }
}

// ============================================
// LIKE REVIEW
// ============================================
export const likeReview = async (req, res) => {
    try {
        const { reviewId } = req.params

        const review = await Review.findById(reviewId)
        if (!review) {
            return res.status(400).json({ message: "Review not found" })
        }

        const index = review.likes.indexOf(req.userId)
        if (index === -1) {
            review.likes.push(req.userId)
        } else {
            review.likes.splice(index, 1)
        }

        await review.save()
        return res.status(200).json({ likes: review.likes.length, liked: index === -1 })
    } catch (error) {
        return res.status(500).json({ message: `Like review error: ${error.message}` })
    }
}

// ============================================
// ADD REPLY TO REVIEW
// ============================================
export const addReply = async (req, res) => {
    try {
        const { reviewId } = req.params
        const { comment } = req.body

        if (!comment) {
            return res.status(400).json({ message: "Comment is required" })
        }

        const review = await Review.findById(reviewId)
        if (!review) {
            return res.status(400).json({ message: "Review not found" })
        }

        review.replies.push({
            user: req.userId,
            comment
        })

        await review.save()
        await review.populate('replies.user', 'fullName profilePhoto')

        return res.status(200).json(review)
    } catch (error) {
        return res.status(500).json({ message: `Add reply error: ${error.message}` })
    }
}