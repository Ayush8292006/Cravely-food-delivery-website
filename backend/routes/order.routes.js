import express from "express"
import isAuth from "../middlewares/isAuth.js"
import {
    acceptOrder, getCurrentOrder, getDeliveryBoyAssignment, getMyOrders,
    getOrderById, getTodayDeliveries, placeOrder, sendDeliveryOtp,
    updateOrderStatus, verifyDeliveryOtp,
    verifyRazorpay, cancelOrder,
    getCancellationReasons,getMyOrdersWithFilters,rejectOrder
} from "../controllers/orders.controllers.js"

const orderRouter = express.Router()

// ✅ Razorpay routes
orderRouter.post("/place-order", isAuth, placeOrder)
orderRouter.post("/verify-payment", isAuth, verifyRazorpay)  // ✅ Changed

// ✅ Other routes (same as before)
orderRouter.post('/reject-order/:assignmentId', isAuth, rejectOrder)
orderRouter.get("/my-orders", isAuth, getMyOrders)
orderRouter.post("/send-delivery-otp", isAuth, sendDeliveryOtp)
orderRouter.post("/verify-delivery-otp", isAuth, verifyDeliveryOtp)
orderRouter.get("/get-assignments", isAuth, getDeliveryBoyAssignment)
orderRouter.get("/get-current-order", isAuth, getCurrentOrder)
orderRouter.get("/get-order-by-id/:orderId", isAuth, getOrderById)
orderRouter.post("/update-status/:orderId/:shopId", isAuth, updateOrderStatus)
orderRouter.get("/accept-order/:assignmentId", isAuth, acceptOrder)
orderRouter.get("/get-today-deliveries", isAuth, getTodayDeliveries)
orderRouter.post("/cancel/:orderId", isAuth, cancelOrder)
orderRouter.get("/cancellation-reasons", isAuth, getCancellationReasons)
orderRouter.get("/my-orders-filtered", isAuth, getMyOrdersWithFilters)

export default orderRouter