import Review from "../models/review.model.js"
import Shop from "../models/shop.model.js"
import Order from "../models/order.model.js"

// ============================================
// ADD REVIEW - ✅ FIXED
// ============================================
export const addReview = async (req, res) => {
    try {
        const { shopId, orderId, rating, comment } = req.body

        // ✅ Validation
        if (!shopId || !rating) {
            return res.status(400).json({ message: "Shop ID and rating are required" })
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" })
        }

        // ✅ Check if shop exists
        const shop = await Shop.findById(shopId)
        if (!shop) {
            return res.status(400).json({ message: "Shop not found" })
        }

        // ✅ Check if user already reviewed this shop
        const existingReview = await Review.findOne({ 
            user: req.userId, 
            shop: shopId 
        })
        
        if (existingReview) {
            return res.status(400).json({ 
                message: "You already reviewed this restaurant" 
            })
        }

        // ✅ If orderId provided, check if order belongs to user
        if (orderId) {
            const order = await Order.findOne({
                _id: orderId,
                user: req.userId,
                'shopOrders.shop': shopId
            })
            
            if (!order) {
                return res.status(400).json({ 
                    message: "You can only review shops you've ordered from" 
                })
            }
        }

        // ✅ Create review
        const review = await Review.create({
            user: req.userId,
            shop: shopId,
            order: orderId || null,
            rating: Number(rating),
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

        // ✅ Populate user data
        await review.populate('user', 'fullName profilePhoto')

        return res.status(201).json({
            success: true,
            message: "Review added successfully",
            review
        })
    } catch (error) {
        console.log("❌ Add review error:", error.message)
        return res.status(500).json({ 
            message: `Add review error: ${error.message}` 
        })
    }
}

// ============================================
// GET SHOP REVIEWS
// ============================================
export const getShopReviews = async (req, res) => {
    try {
        const { shopId } = req.params
        const { page = 1, limit = 10 } = req.query

        // ✅ Check if shop exists
        const shop = await Shop.findById(shopId)
        if (!shop) {
            return res.status(400).json({ message: "Shop not found" })
        }

        const reviews = await Review.find({ shop: shopId })
            .populate('user', 'fullName profilePhoto')
            .populate('replies.user', 'fullName profilePhoto')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))

        const total = await Review.countDocuments({ shop: shopId })

        return res.status(200).json({
            success: true,
            reviews,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            shopRating: shop.rating
        })
    } catch (error) {
        console.log("❌ Get reviews error:", error.message)
        return res.status(500).json({ 
            message: `Get reviews error: ${error.message}` 
        })
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

        // ✅ Toggle like
        const userId = req.userId
        const index = review.likes.findIndex(id => id.toString() === userId.toString())
        
        if (index === -1) {
            review.likes.push(userId)
        } else {
            review.likes.splice(index, 1)
        }

        await review.save()
        
        return res.status(200).json({
            success: true,
            likes: review.likes.length,
            liked: index === -1
        })
    } catch (error) {
        console.log("❌ Like review error:", error.message)
        return res.status(500).json({ 
            message: `Like review error: ${error.message}` 
        })
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

        // ✅ Only shop owner can reply
        const shop = await Shop.findById(review.shop)
        if (!shop) {
            return res.status(400).json({ message: "Shop not found" })
        }

        if (shop.owner.toString() !== req.userId.toString()) {
            return res.status(403).json({ 
                message: "Only shop owner can reply to reviews" 
            })
        }

        review.replies.push({
            user: req.userId,
            comment
        })

        await review.save()
        await review.populate('replies.user', 'fullName profilePhoto')

        return res.status(200).json({
            success: true,
            review
        })
    } catch (error) {
        console.log("❌ Add reply error:", error.message)
        return res.status(500).json({ 
            message: `Add reply error: ${error.message}` 
        })
    }
}

// ============================================
// ✅ DELETE REVIEW (NEW)
// ============================================
export const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params

        const review = await Review.findById(reviewId)
        if (!review) {
            return res.status(400).json({ message: "Review not found" })
        }

        // ✅ Only review owner or admin can delete
        if (review.user.toString() !== req.userId.toString()) {
            const user = await User.findById(req.userId)
            if (user.role !== 'superAdmin') {
                return res.status(403).json({ 
                    message: "You are not authorized to delete this review" 
                })
            }
        }

        await review.deleteOne()

        // ✅ Recalculate shop rating
        const allReviews = await Review.find({ shop: review.shop })
        const shop = await Shop.findById(review.shop)
        
        if (allReviews.length > 0) {
            const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
            shop.rating = {
                average: Math.round(avgRating * 10) / 10,
                count: allReviews.length
            }
        } else {
            shop.rating = {
                average: 0,
                count: 0
            }
        }
        await shop.save()

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        })
    } catch (error) {
        console.log("❌ Delete review error:", error.message)
        return res.status(500).json({ 
            message: `Delete review error: ${error.message}` 
        })
    }
}