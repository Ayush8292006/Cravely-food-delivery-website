import mongoose from "mongoose";

const shopOrderItemSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true
    },
    name: String,
    price: Number,
    quantity: Number
}, { timestamps: true });

const shopOrderSchema = new mongoose.Schema({
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    subtotal: {
        type: Number,
        default: 0
    },
    commissionRate: {
        type: Number,
        default: 10 // 10% platform commission
    },
    commissionAmount: {
        type: Number,
        default: 0
    },
    restaurantEarnings: {
        type: Number,
        default: 0
    },
    settlementStatus: {
        type: String,
        enum: ["pending", "settled", "cancelled"],
        default: "pending"
    },
    shopOrderItems: [shopOrderItemSchema],
    status: {
        type: String,
        enum: ["pending", "preparing", "out of delivery", "delivered", "cancelled"],
        default: "pending"
    },
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeliveryAssignment",
        default: null
    },
    assignedDeliveryBoy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    deliveryOtp: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    },
    deliveredAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    paymentMethod: {
        type: String,
        enum: ['cod', "online"],
        required: true
    },
    mobile: {
        type: String,
        required: false
    },
    customerName: {
        type: String,
        default: 'Customer'
    },
    deliveryAddress: {
        text: String,
        latitude: Number,
        longitude: Number,
    },
    // ✅ Single Authoritative Financial Breakdown
    subtotal: {
        type: Number,
        default: 0
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    couponCode: {
        type: String,
        default: null
    },
    deliveryFee: {
        type: Number,
        default: 0
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    platformFee: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    amountPaid: {
        type: Number,
        default: 0
    },
    amountRefunded: {
        type: Number,
        default: 0
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded', 'cancelled'],
        default: 'pending'
    },
    transactionId: {
        type: String,
        default: null
    },
    // Partner & Platform Economics
    deliveryPayout: {
        type: Number,
        default: 50 // Fixed ₹50 payout per completed delivery
    },
    commissionAmount: {
        type: Number,
        default: 0
    },
    restaurantEarnings: {
        type: Number,
        default: 0
    },
    deliveryInstructions: {
        type: String,
        default: ""
    },
    shopOrders: [shopOrderSchema],
    payment: {
        type: Boolean,
        default: false
    },
    razorpayOrderId: {
        type: String,
        default: ""
    },
    razorpayPaymentId: {
        type: String,
        default: ""
    },
    isCancelled: {
        type: Boolean,
        default: false
    },
    cancelledAt: {
        type: Date,
        default: null
    },
    cancellationReason: {
        type: String,
        default: null
    },
    cancellationNote: {
        type: String,
        maxlength: 500,
        default: null
    },
    refundStatus: {
        type: String,
        enum: ['not_applicable', 'requested', 'pending', 'processing', 'completed', 'failed', 'rejected', null],
        default: null
    },
    refundAmount: {
        type: Number,
        default: 0
    },
    refundId: {
        type: String,
        default: null
    },
    refundedAt: {
        type: Date,
        default: null
    },
    refundReason: {
        type: String,
        default: null
    }
}, { timestamps: true });

// ✅ Database Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ invoiceNumber: 1 });
orderSchema.index({ 'shopOrders.status': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'shopOrders.assignedDeliveryBoy': 1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;
