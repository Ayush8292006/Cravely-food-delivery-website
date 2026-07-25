import DeliveryAssignment from "../models/deliveryAssignment.model.js"
import Order from "../models/order.model.js"
import Shop from "../models/shop.model.js"
import User from "../models/user.model.js"
import { sendDeliveryOtpMail, sendOrderConfirmation } from "../utils/mail.js"
import { createOrder, verifyPayment as verifyRazorpayPayment } from "../utils/razorpay.js"

// ============================================
// ✅ HELPER: Calculate Delivery Fee
// ============================================
const calculateDeliveryFee = (totalAmount) => {
    const MIN_ORDER_FOR_FREE_DELIVERY = 199
    const DELIVERY_FEE = 30
    
    if (totalAmount < MIN_ORDER_FOR_FREE_DELIVERY) {
        return DELIVERY_FEE
    }
    return 0
}

// ============================================
// ✅ PLACE ORDER - WITH DELIVERY FEE
// ============================================
export const placeOrder = async (req, res) => {
    try {
        console.log("🔍 ===== ORDER PLACE START =====")
        
        const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: "cart is empty" })
        }
        if (!deliveryAddress?.text || !deliveryAddress?.latitude || !deliveryAddress?.longitude) {
            return res.status(400).json({ message: "Send complete Delivery Address" })
        }

        // ✅ Group items by shop
        const groupItemsByShop = {}
        
        for (const item of cartItems) {
            let shopId = null
            
            if (item.shop) {
                if (typeof item.shop === 'object' && item.shop._id) {
                    shopId = item.shop._id
                } else if (typeof item.shop === 'string') {
                    shopId = item.shop
                }
            }
            
            if (!shopId && item.shopId) shopId = item.shopId
            if (!shopId && item.shop_id) shopId = item.shop_id
            
            if (!shopId) {
                console.log(`⚠️ Skipping item "${item.name}" - No shop ID`)
                continue
            }
            
            if (!groupItemsByShop[shopId]) {
                groupItemsByShop[shopId] = []
            }
            groupItemsByShop[shopId].push(item)
        }

        if (Object.keys(groupItemsByShop).length === 0) {
            return res.status(400).json({ 
                message: "No valid items found. Please check your cart." 
            })
        }

        // ✅ Process each shop
        const shopOrders = []
        let subtotal = 0
        
        for (const shopId of Object.keys(groupItemsByShop)) {
            const shop = await Shop.findById(shopId).populate("owner")
            
            if (!shop) {
                console.log(`❌ Shop not found: ${shopId}`)
                continue
            }
            
            if (!shop.owner) {
                console.log(`⚠️ Owner NULL for shop: ${shop.name}`)
                const anyOwner = await User.findOne({ role: 'owner' })
                if (anyOwner) {
                    shop.owner = anyOwner
                } else {
                    continue
                }
            }

            const items = groupItemsByShop[shopId]
            const shopSubtotal = items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0)
            subtotal += shopSubtotal
            
            shopOrders.push({
                shop: shop._id,
                owner: shop.owner._id,
                subtotal: shopSubtotal,
                shopOrderItems: items.map((i) => ({
                    item: i.id || i._id,
                    price: Number(i.price),
                    quantity: Number(i.quantity),
                    name: i.name || 'Item'
                }))
            })
        }

        if (shopOrders.length === 0) {
            return res.status(400).json({ 
                message: "No valid shops found. Please try again." 
            })
        }

        // ✅ CALCULATE DELIVERY FEE
        const deliveryFee = calculateDeliveryFee(subtotal)
        const finalTotal = subtotal + deliveryFee

        console.log(`💰 Subtotal: ₹${subtotal}, Delivery Fee: ₹${deliveryFee}, Final Total: ₹${finalTotal}`)

        // ✅ Create order with deliveryFee
        const newOrder = await Order.create({
            user: req.userId,
            paymentMethod,
            deliveryAddress,
            totalAmount: finalTotal,
            deliveryFee: deliveryFee,
            shopOrders,
            payment: false
        })

        await newOrder.populate("shopOrders.shopOrderItems.item", "name image price")
        await newOrder.populate("shopOrders.shop", "name")
        await newOrder.populate("shopOrders.owner", "name socketId")
        await newOrder.populate("user", "name email mobile")

        // ✅ Razorpay - Use finalTotal
        if (paymentMethod === "online") {
            const razorOrder = await createOrder(finalTotal)
            newOrder.razorpayOrderId = razorOrder.id
            await newOrder.save()

            return res.status(200).json({
                razorpayOrderId: razorOrder.id,
                orderId: newOrder._id,
                amount: razorOrder.amount,
                currency: razorOrder.currency,
                keyId: process.env.RAZORPAY_KEY_ID,
                deliveryFee: deliveryFee,
                subtotal: subtotal
            })
        }

        // ✅ Email
        try {
            await sendOrderConfirmation(newOrder.user, newOrder)
        } catch (emailError) {
            console.log("⚠️ Email error:", emailError.message)
        }

        // ✅ Socket
        const io = req.app.get('io')
        if (io) {
            newOrder.shopOrders.forEach(shopOrder => {
                const ownerSocketId = shopOrder.owner?.socketId
                if (ownerSocketId) {
                    io.to(ownerSocketId).emit('newOrder', {
                        _id: newOrder._id,
                        paymentMethod: newOrder.paymentMethod,
                        user: newOrder.user,
                        shopOrders: shopOrder,
                        createdAt: newOrder.createdAt,
                        deliveryAddress: newOrder.deliveryAddress,
                        payment: newOrder.payment,
                        deliveryFee: deliveryFee,
                        subtotal: subtotal
                    })
                }
            })
        }

        return res.status(201).json({
            ...newOrder.toObject(),
            deliveryFee: deliveryFee,
            subtotal: subtotal
        })

    } catch (error) {
        console.log("❌ ORDER ERROR:", error.message)
        return res.status(500).json({ message: error.message })
    }
}

// ============================================
// ✅ VERIFY RAZORPAY PAYMENT
// ============================================
export const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = req.body

        const isValid = await verifyRazorpayPayment(
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature
        )

        if (!isValid) {
            return res.status(400).json({ message: "Payment verification failed" })
        }

        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(400).json({ message: "Order not found" })
        }

        order.payment = true
        order.razorpayPaymentId = razorpay_payment_id
        await order.save()

        // ✅ Populate user data
        await order.populate("user", "fullName email mobile")  // ✅ ADD THIS
        await order.populate("shopOrders.shop", "name")
        await order.populate("shopOrders.owner", "name socketId")
        await order.populate("shopOrders.shopOrderItems.item", "name image price")

        try {
            await sendOrderConfirmation(order.user, order)
        } catch (emailError) {
            console.log("Email error:", emailError.message)
        }

        const io = req.app.get('io')
        if (io) {
            order.shopOrders.forEach(shopOrder => {
                const ownerSocketId = shopOrder.owner.socketId
                if (ownerSocketId) {
                    io.to(ownerSocketId).emit('newOrder', {
                        _id: order._id,
                        paymentMethod: order.paymentMethod,
                        user: order.user,
                        shopOrders: shopOrder,
                        createdAt: order.createdAt,
                        deliveryAddress: order.deliveryAddress,
                        payment: order.payment,
                        deliveryFee: order.deliveryFee || 0,
                        subtotal: order.totalAmount - (order.deliveryFee || 0)
                    })
                }
            })
        }

        return res.status(200).json(order)

    } catch (error) {
        console.log("❌ Verify payment error:", error.message)
        return res.status(500).json({ message: `verify payment error: ${error.message}` })
    }
}

// ============================================
// ✅ GET MY ORDERS
// ============================================
export const getMyOrders = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        let orders = []

        if (user.role === "user") {
            orders = await Order.find({ user: req.userId })
                .sort({ createdAt: -1 })
                .populate("user", "fullName email mobile")  // ✅ ADD THIS
                .populate("shopOrders.shop", "name")
                .populate("shopOrders.owner", "name email mobile")
                .populate("shopOrders.shopOrderItems.item", "name image price")
        } 
        else if (user.role === "owner") {
            const allOrders = await Order.find({ "shopOrders.owner": req.userId })
                .sort({ createdAt: -1 })
                .populate("user", "fullName email mobile")  // ✅ ADD THIS
                .populate("shopOrders.shop", "name")
                .populate("shopOrders.shopOrderItems.item", "name image price")
                .populate("shopOrders.assignedDeliveryBoy", "fullName mobile")

            orders = allOrders.map(order => ({
                ...order._doc,
                shopOrders: order.shopOrders.filter(o => 
                    o.owner._id.toString() === req.userId.toString()
                )
            })).filter(order => order.shopOrders.length > 0)
        }

        return res.status(200).json(orders)

    } catch (error) {
        console.log("❌ Get my orders error:", error.message)
        return res.status(500).json({ 
            message: `get my order error: ${error.message}` 
        })
    }
}

// ============================================
// ✅ GET ORDER BY ID
// ============================================
export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params

        // ✅ FIX: Fully populate user data
        const order = await Order.findById(orderId)
            .populate("user", "fullName email mobile")  // ✅ SPECIFY FIELDS
            .populate({
                path: "shopOrders.shop",
                model: "Shop"
            })
            .populate({
                path: "shopOrders.assignedDeliveryBoy",
                model: "User",
                select: "fullName mobile email"  // ✅ SELECT SPECIFIC FIELDS
            })
            .populate({
                path: "shopOrders.shopOrderItems.item",
                model: "Item"
            })
            .lean()  // ✅ Convert to plain object

        if (!order) {
            return res.status(404).json({ message: "Order not found" })
        }

        // ✅ Ensure user data exists
        if (!order.user) {
            console.log("⚠️ No user found for order:", orderId)
        }

        return res.status(200).json(order)
    } catch (error) {
        console.log("❌ Get order by id error:", error.message)
        return res.status(500).json({ 
            message: `get order by id error: ${error.message}` 
        })
    }
}

// ============================================
// ✅ SEND DELIVERY OTP
// ============================================
export const sendDeliveryOtp = async (req, res) => {
    try {
        const { orderId, shopOrderId } = req.body
        console.log("📦 Send Delivery OTP for order:", orderId)
        
        const order = await Order.findById(orderId).populate("user")
        if (!order) {
            return res.status(400).json({ message: "Order not found" })
        }
        
        const shopOrder = order.shopOrders.id(shopOrderId)
        if (!shopOrder) {
            return res.status(400).json({ message: "Shop order not found" })
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString()
        console.log("🔑 Generated Delivery OTP:", otp)
        
        shopOrder.deliveryOtp = otp
        shopOrder.otpExpires = Date.now() + 5 * 60 * 1000
        await order.save()
        
        // ✅ Send email
        try {
            await sendDeliveryOtpMail(order.user, otp)
            console.log("✅ Delivery OTP email sent to:", order.user.email)
        } catch (emailError) {
            console.log("❌ Email error:", emailError.message)
        }
        
        // ✅ Return OTP in response
        return res.status(200).json({ 
            message: `Delivery OTP sent successfully to ${order.user.fullName}`,
            otp: otp,
            userEmail: order.user.email,
            userName: order.user.fullName
        })
        
    } catch (error) {
        console.log("❌ send delivery otp error:", error.message)
        return res.status(500).json({ message: `send delivery otp error ${error.message}` })
    }
}

// ============================================
// ✅ VERIFY DELIVERY OTP
// ============================================
export const verifyDeliveryOtp = async (req, res) => {
    try {
        const { orderId, shopOrderId, otp } = req.body
        const order = await Order.findById(orderId).populate("user")
        const shopOrder = order.shopOrders.id(shopOrderId)
        if (!order || !shopOrder) {
            return res.status(400).json({ message: "enter valid order/shopOrderid" })
        }

        if (shopOrder.deliveryOtp !== otp || !shopOrder.otpExpires || shopOrder.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid/Expired Otp" })
        }

        shopOrder.status = "delivered"
        shopOrder.deliveredAt = Date.now()
        await order.save()
        await DeliveryAssignment.deleteOne({
            shopOrderId: shopOrder._id,
            order: order._id,
            assignedTo: shopOrder.assignedDeliveryBoy
        })

        return res.status(200).json({ message: "Order Delivered Successfully" })
    } catch (error) {
        return res.status(500).json({ message: `verify delivery otp error ${error}` })
    }
}

// ============================================
// ✅ UPDATE ORDER STATUS
// ============================================
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, shopId } = req.params
        const { status } = req.body
        const order = await Order.findById(orderId)

        const shopOrder = order.shopOrders.find(o => o.shop.toString() == shopId)
        if (!shopOrder) {
            return res.status(400).json({ message: "shop order not found" })
        }
        shopOrder.status = status
        let deliveryBoysPayload = []

        if (status === "out of delivery" && !shopOrder.assignment) {
            const { longitude, latitude } = order.deliveryAddress
            const nearByDeliveryBoys = await User.find({
                role: "deliveryBoy",
                location: {
                    $near: {
                        $geometry: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
                        $maxDistance: 15000
                    }
                }
            })
            const nearByIds = nearByDeliveryBoys.map(b => b._id)
            const busyIds = await DeliveryAssignment.find({
                assignedTo: { $in: nearByIds },
                status: { $nin: ["broadcasted", "completed"] }
            }).distinct("assignedTo")

            const busyIdSet = new Set(busyIds.map(id => String(id)))

            const availableBoys = nearByDeliveryBoys.filter(b => !busyIdSet.has(String(b._id)))
            const candidates = availableBoys.map(b => b._id)

            if (candidates.length === 0) {
                await order.save()
                return res.json({
                    message: "order status updated but there is no available delivery boys"
                })
            }

            const deliveryAssignment = await DeliveryAssignment.create({
                order: order._id,
                shop: shopOrder.shop,
                shopOrderId: shopOrder._id,
                brodcastedTo: candidates,
                status: "broadcasted"
            })
            shopOrder.assignedDeliveryBoy = deliveryAssignment.assignedTo
            shopOrder.assignment = deliveryAssignment._id
            deliveryBoysPayload = availableBoys.map(b => ({
                id: b._id,
                fullName: b.fullName,
                longitude: b.location.coordinates?.[0],
                latitude: b.location.coordinates?.[1],
                mobile: b.mobile
            }))

            await deliveryAssignment.populate('order')
            await deliveryAssignment.populate('shop')

            const io = req.app.get('io')
            if (io) {
                availableBoys.forEach(boy => {
                    const boySocketId = boy.socketId
                    if (boySocketId) {
                        io.to(boySocketId).emit('newAssignment', {
                            sentTo: boy._id,
                            assignmentId: deliveryAssignment._id,
                            orderId: deliveryAssignment.order._id,
                            shopName: deliveryAssignment.shop.name,
                            deliveryAddress: deliveryAssignment.order.deliveryAddress,
                            items: deliveryAssignment.order.shopOrders.find(so => so._id.equals(deliveryAssignment.shopOrderId))?.shopOrderItems || [],
                            subtotal: deliveryAssignment.order.shopOrders.find(so => so._id.equals(deliveryAssignment.shopOrderId))?.subtotal
                        })
                    }
                })
            }
        }

        await order.save()
        const updatedShopOrder = order.shopOrders.find(o => o.shop.toString() == shopId)
        await order.populate("shopOrders.shop", "name")
        await order.populate("shopOrders.assignedDeliveryBoy", "fullName email mobile")

        await order.populate("user", "socketId")

        const io = req.app.get('io')
        if (io) {
            const userSocketId = order.user.socketId
            if (userSocketId) {
                io.to(userSocketId).emit('update-status', {
                    orderId: order._id,
                    shopId: updatedShopOrder.shop._id,
                    status: updatedShopOrder.status,
                    userId: order.user._id
                })
            }
        }

        return res.status(200).json({
            shopOrder: updatedShopOrder,
            assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy,
            availableBoys: deliveryBoysPayload,
            assignment: updatedShopOrder?.assignment
        })

    } catch (error) {
        return res.status(500).json({ message: `order status error ${error}` })
    }
}

// ============================================
// ✅ GET DELIVERY BOY ASSIGNMENT
// ============================================
export const getDeliveryBoyAssignment = async (req, res) => {
    try {
        const deliveryBoyId = req.userId
        const assignments = await DeliveryAssignment.find({
            brodcastedTo: deliveryBoyId,
            status: "broadcasted"
        })
            .populate("order")
            .populate("shop")

        const formated = assignments.map(a => ({
            assignmentId: a._id,
            orderId: a.order._id,
            shopName: a.shop.name,
            deliveryAddress: a.order.deliveryAddress,
            items: a.order.shopOrders.find(so => so._id.equals(a.shopOrderId))?.shopOrderItems || [],
            subtotal: a.order.shopOrders.find(so => so._id.equals(a.shopOrderId))?.subtotal
        }))
        return res.status(200).json(formated)
    } catch (error) {
        return res.status(500).json({ message: `get delivery boy assignment error ${error}` })
    }
}

// ============================================
// ✅ ACCEPT ORDER
// ============================================
export const acceptOrder = async (req, res) => {
    try {
        const { assignmentId } = req.params
        const assignment = await DeliveryAssignment.findById(assignmentId)
        if (!assignment) {
            return res.status(400).json({ message: "assignment not found" })
        }
        if (assignment.status !== "broadcasted") {
            return res.status(400).json({ message: "assignment is expired" })
        }

        const alreadyAssigned = await DeliveryAssignment.findOne({
            assignedTo: req.userId,
            status: { $nin: ["broadcasted", "completed"] }
        })

        if (alreadyAssigned) {
            return res.status(400).json({ message: "You are already assigned to another order" })
        }

        assignment.assignedTo = req.userId
        assignment.status = "assigned"
        assignment.acceptedAt = new Date()
        await assignment.save()

        const order = await Order.findById(assignment.order)
        if (!order) {
            return res.status(400).json({ message: "order not found" })
        }

        const shopOrder = order.shopOrders.id(assignment.shopOrderId)
        shopOrder.assignedDeliveryBoy = req.userId
        await order.save()

        return res.status(200).json({
            message: 'order accepted'
        })

    } catch (error) {
        return res.status(500).json({ message: `accept order error ${error}` })
    }
}

// ============================================
// ✅ REJECT ORDER
// ============================================
export const rejectOrder = async (req, res) => {
    try {
        const { assignmentId } = req.params
        const deliveryBoyId = req.userId
        
        console.log("❌ Rejecting order:", assignmentId)
        console.log("👤 Delivery Boy:", deliveryBoyId)
        
        const assignment = await DeliveryAssignment.findById(assignmentId)
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" })
        }
        
        if (assignment.status === 'accepted') {
            return res.status(400).json({ message: "Order already accepted, cannot reject" })
        }
        
        if (assignment.status === 'rejected') {
            return res.status(400).json({ message: "Order already rejected" })
        }
        
        assignment.status = 'rejected'
        assignment.rejectedAt = new Date()
        assignment.rejectedBy = deliveryBoyId
        await assignment.save()
        
        assignment.brodcastedTo = assignment.brodcastedTo.filter(
            id => String(id) !== String(deliveryBoyId)
        )
        await assignment.save()
        
        const io = req.app.get('io')
        if (io) {
            io.emit('order-rejected', {
                orderId: assignment.order,
                deliveryBoyId,
                assignmentId
            })
        }
        
        return res.status(200).json({
            message: "Order rejected successfully",
            assignment
        })
    } catch (error) {
        console.log("❌ Reject order error:", error.message)
        return res.status(500).json({ message: error.message })
    }
}

// ============================================
// ✅ GET CURRENT ORDER
// ============================================
export const getCurrentOrder = async (req, res) => {
    try {
        const assignment = await DeliveryAssignment.findOne({
            assignedTo: req.userId,
            status: "assigned"
        })
            .populate("shop", "name")
            .populate("assignedTo", "fullName email mobile location")
            .populate({
                path: "order",
                populate: [{
                    path: "user",
                    select: "fullName email location mobile"
                }]
            })

        if (!assignment) {
            return res.status(400).json({ message: "assignment not found" })
        }
        if (!assignment.order) {
            return res.status(400).json({ message: "order not found" })
        }

        const shopOrder = assignment.order.shopOrders.find(so => String(so._id) === String(assignment.shopOrderId))

        if (!shopOrder) {
            return res.status(400).json({ message: "shopOrder not found" })
        }

        let deliveryBoyLocation = { lat: null, lon: null }
        if (assignment.assignedTo.location.coordinates.length === 2) {
            deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1]
            deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates[0]
        }

        let customerLocation = { lat: null, lon: null }
        if (assignment.order.deliveryAddress) {
            customerLocation.lat = assignment.order.deliveryAddress.latitude
            customerLocation.lon = assignment.order.deliveryAddress.longitude
        }

        return res.status(200).json({
            _id: assignment.order._id,
            user: assignment.order.user,
            shopOrder,
            deliveryAddress: assignment.order.deliveryAddress,
            deliveryBoyLocation,
            customerLocation
        })

    } catch (error) {
        return res.status(500).json({ message: `current order error ${error}` })
    }
}

// ============================================
// ✅ GET TODAY DELIVERIES
// ============================================
export const getTodayDeliveries = async (req, res) => {
    try {
        const deliveryBoyId = req.userId
        const startsOfDay = new Date()
        startsOfDay.setHours(0, 0, 0, 0)

        const orders = await Order.find({
            "shopOrders.assignedDeliveryBoy": deliveryBoyId,
            "shopOrders.status": "delivered",
            "shopOrders.deliveredAt": { $gte: startsOfDay }
        }).lean()

        let todaysDeliveries = []

        orders.forEach(order => {
            order.shopOrders.forEach(shopOrder => {
                if (shopOrder.assignedDeliveryBoy == deliveryBoyId &&
                    shopOrder.status == "delivered" &&
                    shopOrder.deliveredAt &&
                    shopOrder.deliveredAt >= startsOfDay
                ) {
                    todaysDeliveries.push(shopOrder)
                }
            })
        })

        let stats = {}

        todaysDeliveries.forEach(shopOrder => {
            const hour = new Date(shopOrder.deliveredAt).getHours()
            stats[hour] = (stats[hour] || 0) + 1
        })

        let formattedStats = Object.keys(stats).map(hour => ({
            hour: parseInt(hour),
            count: stats[hour]
        }))

        formattedStats.sort((a, b) => a.hour - b.hour)

        return res.status(200).json(formattedStats)

    } catch (error) {
        return res.status(500).json({ message: `today deliveries error ${error}` })
    }
}

// ============================================
// ✅ CANCEL ORDER
// ============================================
export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params
        const { reason, note } = req.body

        const order = await Order.findById(orderId)
            .populate('user', 'fullName email mobile')
            .populate({
                path: 'shopOrders.shop',
                select: 'name'
            })
            .populate({
                path: 'shopOrders.owner',
                select: 'fullName email socketId'
            })

        if (!order) {
            return res.status(400).json({ message: "Order not found" })
        }

        if (order.user._id.toString() !== req.userId) {
            return res.status(403).json({ message: "You are not authorized to cancel this order" })
        }

        if (order.isCancelled) {
            return res.status(400).json({ message: "Order already cancelled" })
        }

        const shopOrder = order.shopOrders?.[0]
        if (!shopOrder) {
            return res.status(400).json({ message: "No shop order found" })
        }

        const status = shopOrder.status || 'pending'

        if (status === 'delivered') {
            return res.status(400).json({ message: "Order already delivered. Cannot cancel." })
        }

        if (status === 'out of delivery') {
            return res.status(400).json({ message: "Order is out for delivery. Cannot cancel." })
        }

        if (status === 'cancelled') {
            return res.status(400).json({ message: "Order already cancelled." })
        }

        order.isCancelled = true
        order.cancelledAt = new Date()
        order.cancellationReason = reason || 'other'
        order.cancellationNote = note || ''
        shopOrder.status = 'cancelled'

        if (order.paymentMethod === 'online' && order.payment) {
            order.refundStatus = 'processing'
        }

        await order.save()

        try {
            const io = req.app.get('io')
            if (io) {
                order.shopOrders.forEach(shopOrderItem => {
                    const owner = shopOrderItem.owner
                    if (owner && owner.socketId) {
                        io.to(owner.socketId).emit('order-cancelled', {
                            orderId: order._id,
                            shopId: shopOrderItem.shop?._id,
                            userId: order.user._id,
                            reason: reason || 'other'
                        })
                    }
                })
            }
        } catch (socketError) {
            console.log("⚠️ Socket notification error:", socketError.message)
        }

        return res.status(200).json({
            message: "Order cancelled successfully",
            order: order
        })
    } catch (error) {
        console.log("❌ Cancel order error:", error.message)
        return res.status(500).json({ 
            message: `Cancel order error: ${error.message}`
        })
    }
}

// ============================================
// ✅ GET CANCELLATION REASONS
// ============================================
export const getCancellationReasons = async (req, res) => {
    try {
        const reasons = [
            { value: 'changed_mind', label: 'Changed My Mind' },
            { value: 'wrong_address', label: 'Wrong Delivery Address' },
            { value: 'long_delivery_time', label: 'Delivery Taking Too Long' },
            { value: 'item_unavailable', label: 'Item Unavailable' },
            { value: 'other', label: 'Other Reason' }
        ]
        return res.status(200).json(reasons)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// ============================================
// ✅ GET ORDERS WITH FILTERS
// ============================================
export const getMyOrdersWithFilters = async (req, res) => {
    try {
        const { 
            status, 
            paymentMethod, 
            startDate, 
            endDate,
            page = 1,
            limit = 10 
        } = req.query

        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        let filter = { user: req.userId }

        if (status && status !== 'all') {
            filter['shopOrders.status'] = status
        }

        if (paymentMethod && paymentMethod !== 'all') {
            filter.paymentMethod = paymentMethod
        }

        if (startDate) {
            filter.createdAt = { $gte: new Date(startDate) }
        }
        if (endDate) {
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999)
            filter.createdAt = { ...filter.createdAt, $lte: end }
        }

        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate("shopOrders.shop", "name")
            .populate("shopOrders.owner", "name email mobile")
            .populate("shopOrders.shopOrderItems.item", "name image price")

        const total = await Order.countDocuments(filter)

        return res.status(200).json({
            orders,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            hasMore: page * limit < total
        })
    } catch (error) {
        return res.status(500).json({ message: `Get orders error: ${error.message}` })
    }
}

    