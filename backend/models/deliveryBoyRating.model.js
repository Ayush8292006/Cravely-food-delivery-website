import mongoose from "mongoose";

const deliveryBoyRatingSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    deliveryBoy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop"
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        maxlength: 500,
        default: ''
    },
    deliveryTime: {
        type: String,
        enum: ['early', 'on-time', 'late'],
        default: 'on-time'
    },
    behavior: {
        type: String,
        enum: ['friendly', 'professional', 'average', 'needs-improvement'],
        default: 'professional'
    }
}, { timestamps: true })

// ✅ Index for faster queries
deliveryBoyRatingSchema.index({ deliveryBoy: 1, createdAt: -1 })
deliveryBoyRatingSchema.index({ order: 1 })

const DeliveryBoyRating = mongoose.model("DeliveryBoyRating", deliveryBoyRatingSchema)
export default DeliveryBoyRating