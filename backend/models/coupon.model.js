import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        uppercase: true,
        unique: true,
        trim: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    discountType: {
        type: String,
        enum: ["percentage", "flat"],
        default: "percentage"
    },
    discountValue: {
        type: Number,
        required: true
    },
    maxDiscount: {
        type: Number,
        default: 150
    },
    minOrderAmount: {
        type: Number,
        default: 0
    },
    validTill: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    isActive: {
        type: Boolean,
        default: true
    },
    badge: {
        type: String,
        default: "HOT OFFER"
    }
}, { timestamps: true });

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;

