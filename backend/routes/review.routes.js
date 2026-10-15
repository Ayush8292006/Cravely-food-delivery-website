import express from "express"
import isAuth from "../middlewares/isAuth.js"
import {
    acceptOrder,
    getCurrentOrder,
     getDeliveryBoyAssignments,
    getMyOrders,
    getOrderById,
    getTodayDeliveries,
    placeOrder,
    sendDeliveryOtp,
    updateOrderStatus,
    verifyDeliveryOtp,
    verifyRazorpay,
    cancelOrder,
    getCancellationReasons,
    getMyOrdersWithFilters,
    rejectOrder,
    // ✅ Add new functions
    getDeliveryBoyStats,
    getAssignedOrders,
    completeDelivery,
    updateDeliveryStatus,
    getAssignmentById
} from "../controllers/orders.controllers.js"

const orderRouter = express.Router()

// ✅ Razorpay routes
orderRouter.post("/place-order", isAuth, placeOrder)
orderRouter.post("/verify-payment", isAuth, verifyRazorpay)

// ✅ Order management routes
orderRouter.post('/reject-order/:assignmentId', isAuth, rejectOrder)
orderRouter.get("/my-orders", isAuth, getMyOrders)
orderRouter.post("/send-delivery-otp", isAuth, sendDeliveryOtp)
orderRouter.post("/verify-delivery-otp", isAuth, verifyDeliveryOtp)
orderRouter.get("/get-assignments", isAuth, getDeliveryBoyAssignments)

// ✅ FIXED: Using getCurrentOrder directly
orderRouter.get('/get-current-order', isAuth, getCurrentOrder)

orderRouter.get("/get-order-by-id/:orderId", isAuth, getOrderById)
orderRouter.post("/update-status/:orderId/:shopId", isAuth, updateOrderStatus)
orderRouter.get("/accept-order/:assignmentId", isAuth, acceptOrder)
orderRouter.get("/get-today-deliveries", isAuth, getTodayDeliveries)
orderRouter.post("/cancel/:orderId", isAuth, cancelOrder)
orderRouter.get("/cancellation-reasons", isAuth, getCancellationReasons)
orderRouter.get("/my-orders-filtered", isAuth, getMyOrdersWithFilters)

// ✅ NEW - Delivery Boy Routes
orderRouter.get("/delivery-stats", isAuth, getDeliveryBoyStats)
orderRouter.get("/assigned-orders", isAuth, getAssignedOrders)
orderRouter.post("/complete-delivery/:orderId", isAuth, completeDelivery)
orderRouter.put("/delivery-status/:orderId", isAuth, updateDeliveryStatus)
orderRouter.get("/assignment/:assignmentId", isAuth, getAssignmentById)

export default orderRouter