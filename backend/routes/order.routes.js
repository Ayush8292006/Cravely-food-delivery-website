// backend/routes/order.routes.js
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
    requestRefund,
    getOrderInvoice,
    getCancellationReasons,
    getMyOrdersWithFilters,
    rejectOrder,
    getDeliveryBoyStats,
    getAssignedOrders,
    completeDelivery,
    updateDeliveryStatus,
    getAssignmentById,
    getPendingOrdersCount,
    checkAssignments,
    clearAssignments,
    checkAssignment,
        addDeliveryBoyToBroadcast,  // ✅ Add this
    forceAssignDeliveryBoy ,
    debugOrders      // ✅ Add this
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
orderRouter.get('/get-current-order', isAuth, getCurrentOrder)
orderRouter.get("/get-order-by-id/:orderId", isAuth, getOrderById)
orderRouter.post("/update-status/:orderId/:shopId", isAuth, updateOrderStatus)
orderRouter.get("/accept-order/:assignmentId", isAuth, acceptOrder)
orderRouter.get("/get-today-deliveries", isAuth, getTodayDeliveries)
orderRouter.post("/cancel/:orderId", isAuth, cancelOrder)
orderRouter.post("/refund-request/:orderId", isAuth, requestRefund)
orderRouter.get("/invoice/:orderId", isAuth, getOrderInvoice)
orderRouter.get("/cancellation-reasons", isAuth, getCancellationReasons)
orderRouter.get("/my-orders-filtered", isAuth, getMyOrdersWithFilters)

// ✅ Delivery Boy Routes
orderRouter.get("/delivery-stats", isAuth, getDeliveryBoyStats)
orderRouter.get("/assigned-orders", isAuth, getAssignedOrders)
orderRouter.post("/complete-delivery/:orderId", isAuth, completeDelivery)
orderRouter.put("/delivery-status/:orderId", isAuth, updateDeliveryStatus)
orderRouter.get("/assignment/:assignmentId", isAuth, getAssignmentById)

// ✅ Pending Orders Count
orderRouter.get("/pending-count", isAuth, getPendingOrdersCount)

// ✅ Check and Clear Assignments
orderRouter.get("/check-assignments", isAuth, checkAssignments)
orderRouter.post("/clear-assignments", isAuth, clearAssignments)

// ✅ Debug Routes
orderRouter.get("/check-assignment/:assignmentId", isAuth, checkAssignment)
orderRouter.post("/add-to-broadcast/:assignmentId", isAuth, addDeliveryBoyToBroadcast)

// ✅ NEW: Force assign delivery boy
orderRouter.post("/force-assign/:assignmentId", isAuth, forceAssignDeliveryBoy)

orderRouter.get("/debug", isAuth, debugOrders)

export default orderRouter