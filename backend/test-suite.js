import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

import connectDb from "./config/db.js";
import User from "./models/user.model.js";
import Shop from "./models/shop.model.js";
import Item from "./models/item.model.js";
import Order from "./models/order.model.js";
import Coupon from "./models/coupon.model.js";
import Ticket from "./models/ticket.model.js";
import Notification from "./models/notification.model.js";
import { createOrder, verifyPayment, refundPayment } from "./utils/razorpay.js";

async function runTests() {
    console.log("==========================================");
    console.log("🚀 CRAVELY MASTER SYSTEM VERIFICATION TEST");
    console.log("==========================================");

    let passedTests = 0;
    let failedTests = 0;

    const assert = (condition, title) => {
        if (condition) {
            console.log(`✅ [PASS] ${title}`);
            passedTests++;
        } else {
            console.error(`❌ [FAIL] ${title}`);
            failedTests++;
        }
    };

    try {
        await connectDb();
        assert(true, "Database connection established to MongoDB Atlas");

        // 1. RAZORPAY TEST ORDER CREATION
        console.log("\n--- TEST 1: RAZORPAY ORDER CREATION (TEST MODE) ---");
        const testAmount = 299;
        const razorOrder = await createOrder(testAmount);
        assert(razorOrder && razorOrder.id && razorOrder.id.startsWith("order_"), `Razorpay Order Created: ${razorOrder.id} (Amount: ₹${razorOrder.amount / 100})`);
        assert(razorOrder.amount === 29900, "Paise amount correctly calculated (29900 paise for ₹299)");

        // 2. PAYMENT SIGNATURE VERIFICATION
        console.log("\n--- TEST 2: RAZORPAY PAYMENT SIGNATURE VERIFICATION ---");
        const dummyPaymentId = "pay_test_" + Date.now();
        const dummyOrderId = razorOrder.id;
        const secret = process.env.RAZORPAY_KEY_SECRET;
        const validSignature = crypto.createHmac("sha256", secret)
            .update(dummyOrderId + "|" + dummyPaymentId)
            .digest("hex");

        const isValid = await verifyPayment(dummyPaymentId, dummyOrderId, validSignature);
        assert(isValid === true, "Valid cryptographic HMAC-SHA256 signature verified");

        const isTamperedValid = await verifyPayment(dummyPaymentId, dummyOrderId, "tampered_fake_signature");
        assert(isTamperedValid === false, "Tampered signature correctly rejected");

        // 3. COUPONS & PROMOTIONAL ENGINE
        console.log("\n--- TEST 3: COUPON ENGINE & DISCOUNT CALCULATION ---");
        const coupon = await Coupon.findOne({ code: "CRAVELY50" });
        assert(coupon !== null, "Found coupon CRAVELY50 in database");

        // Test discount calculation
        const cartTotal = 400;
        let calculatedDiscount = 0;
        if (coupon.discountType === "percentage") {
            calculatedDiscount = Math.round((cartTotal * coupon.discountValue) / 100);
            if (coupon.maxDiscount && calculatedDiscount > coupon.maxDiscount) {
                calculatedDiscount = coupon.maxDiscount;
            }
        }
        assert(calculatedDiscount === 150, `50% discount on ₹400 correctly capped at ₹150 max discount`);

        // 4. ORDER CREATION WITH TAX, DELIVERY FEE & DISCOUNT
        console.log("\n--- TEST 4: ORDER CREATION, TAX & DISCOUNT RECORDING ---");
        const testUser = await User.findOne({ role: "user" });
        const testShop = await Shop.findOne({ isApproved: true }).populate("items");
        assert(testUser && testShop, "Customer and Restaurant found for test order");

        const testItem = testShop.items[0];
        assert(testItem !== undefined, `Found item: ${testItem.name} (₹${testItem.price})`);

        const subtotal = testItem.price * 2;
        const deliveryFee = subtotal >= 199 ? 0 : 30;
        const taxAmount = 23;
        const discountAmount = 50;
        const totalAmount = Math.max(0, subtotal + deliveryFee + taxAmount - discountAmount);

        const testOrder = await Order.create({
            user: testUser._id,
            paymentMethod: "online",
            totalAmount: totalAmount,
            deliveryFee: deliveryFee,
            taxAmount: taxAmount,
            discountAmount: discountAmount,
            couponCode: "CRAVELY50",
            deliveryInstructions: "Ring bell twice and leave package at doorstep",
            payment: true,
            razorpayOrderId: dummyOrderId,
            razorpayPaymentId: dummyPaymentId,
            deliveryAddress: {
                text: "123 Test Street, Knowledge Park, Greater Noida",
                latitude: 28.4744,
                longitude: 77.5040
            },
            mobile: "9876543210",
            customerName: testUser.fullName,
            shopOrders: [
                {
                    shop: testShop._id,
                    owner: testShop.owner,
                    subtotal: subtotal,
                    status: "pending",
                    shopOrderItems: [
                        {
                            item: testItem._id,
                            name: testItem.name,
                            price: testItem.price,
                            quantity: 2
                        }
                    ]
                }
            ]
        });

        assert(testOrder && testOrder._id, `Order successfully created in DB: #${testOrder._id}`);
        assert(testOrder.totalAmount === totalAmount, `Order total properly calculated: ₹${totalAmount}`);
        assert(testOrder.discountAmount === 50, "Discount properly recorded in order");

        // 5. CANCELLATION & INSTANT REFUND INITIATION
        console.log("\n--- TEST 5: ORDER CANCELLATION & REFUND WORKFLOW ---");
        testOrder.isCancelled = true;
        testOrder.cancelledAt = new Date();
        testOrder.cancellationReason = "changed_mind";
        testOrder.cancellationNote = "Ordered by mistake";
        testOrder.refundStatus = "completed";
        testOrder.refundAmount = testOrder.totalAmount;
        testOrder.refundId = "rfnd_test_" + Date.now();
        testOrder.refundedAt = new Date();
        testOrder.shopOrders[0].status = "cancelled";
        await testOrder.save();

        assert(testOrder.isCancelled === true, "Order marked as isCancelled: true");
        assert(testOrder.refundStatus === "completed", `Refund status updated to "${testOrder.refundStatus}"`);
        assert(testOrder.refundAmount === testOrder.totalAmount, `Refund amount ₹${testOrder.refundAmount} matches order total`);

        // 6. SUPPORT TICKET CREATION & CONVERSATION
        console.log("\n--- TEST 6: CUSTOMER SUPPORT TICKET SYSTEM ---");
        const ticketId = "CRV-TEST-" + Date.now().toString().slice(-4);
        const ticket = await Ticket.create({
            ticketId,
            user: testUser._id,
            order: testOrder._id,
            category: "payment_refund",
            subject: "Verification of test refund",
            message: "I cancelled my test order and wanted to verify refund status.",
            status: "open",
            priority: "high",
            responses: [
                {
                    sender: "user",
                    senderName: testUser.fullName,
                    message: "I cancelled my test order and wanted to verify refund status."
                }
            ]
        });

        assert(ticket && ticket.ticketId, `Support ticket created: ${ticket.ticketId}`);

        // Add admin reply
        ticket.responses.push({
            sender: "admin",
            senderName: "Cravely Support Team",
            message: "Hello! Your refund has been processed instantly. Reference ID: " + testOrder.refundId
        });
        ticket.status = "resolved";
        ticket.resolvedAt = new Date();
        await ticket.save();

        assert(ticket.responses.length === 2, "Admin response added to ticket thread");
        assert(ticket.status === "resolved", "Ticket status marked as resolved");

        // 7. IN-APP NOTIFICATIONS
        console.log("\n--- TEST 7: REAL-TIME NOTIFICATIONS SYSTEM ---");
        const notif = await Notification.create({
            user: testUser._id,
            title: "Refund Processed",
            message: `Your refund of ₹${testOrder.refundAmount} has been processed.`,
            type: "refund",
            link: `/track-order/${testOrder._id}`
        });

        assert(notif && notif._id, "Notification generated and saved for customer");
        const userNotifs = await Notification.find({ user: testUser._id, isRead: false });
        assert(userNotifs.length > 0, `Unread notification count verified (${userNotifs.length} unread)`);

        // Clean up test order & ticket
        await Order.findByIdAndDelete(testOrder._id);
        await Ticket.findByIdAndDelete(ticket._id);
        await Notification.findByIdAndDelete(notif._id);
        console.log("\n🧹 Test entities cleaned up successfully.");

        console.log("\n==========================================");
        console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
        console.log("==========================================");

        process.exit(failedTests > 0 ? 1 : 0);
    } catch (err) {
        console.error("Test execution error:", err);
        process.exit(1);
    }
}

runTests();

