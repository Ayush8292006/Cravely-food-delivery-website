import mongoose from "mongoose";

const ticketResponseSchema = new mongoose.Schema({
    sender: {
        type: String,
        enum: ["user", "support", "admin"],
        default: "user"
    },
    senderName: {
        type: String,
        default: "Support Team"
    },
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ticketSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        default: null
    },
    category: {
        type: String,
        enum: ["order_status", "payment_refund", "delivery", "food_quality", "account", "other"],
        default: "order_status"
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["open", "in_progress", "resolved", "closed"],
        default: "open"
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high", "urgent"],
        default: "medium"
    },
    responses: [ticketResponseSchema],
    resolvedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

ticketSchema.index({ user: 1, createdAt: -1 });
ticketSchema.index({ status: 1 });

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;

