// backend/controllers/orders.controllers.js
import DeliveryAssignment from "../models/deliveryAssignment.model.js"
import Order from "../models/order.model.js"
import Shop from "../models/shop.model.js"
import User from "../models/user.model.js"
import { sendDeliveryOtpMail, sendOrderConfirmation } from "../utils/mail.js"
import { createOrder, verifyPayment as verifyRazorpayPayment } from "../utils/razorpay.js"

// ============================================
// ✅ CONSTANTS (match frontend)
// ============================================
const MIN_ORDER_FOR_FREE_DELIVERY = 199
const DELIVERY_FEE = 30
const TAX_AMOUNT = 23 // ✅ Fixed tax ₹23 (same as CartPage/Checkout)

// ============================================
// ✅ HELPER: Calculate Delivery Fee
// ============================================
const calculateDeliveryFee = (totalAmount) => {
    if (totalAmount < MIN_ORDER_FOR_FREE_DELIVERY) {
        return DELIVERY_FEE
    }
    return 0
}

// ============================================
// ✅ PLACE ORDER - WITH TAX
// ============================================
export const placeOrder = async (req, res) => {
    try {
        console.log("🔍 ===== ORDER PLACE START =====")
        const { cartItems, paymentMethod, deliveryAddress, totalAmount, mobile, customerName } = req.body

        if (!mobile) {
            return res.status(400).json({ message: "Mobile number is required" })
        }

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: "cart is empty" })
        }
        if (!deliveryAddress?.text || !deliveryAddress?.latitude || !deliveryAddress?.longitude) {
            return res.status(400).json({ message: "Send complete Delivery Address" })
        }

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
            return res.status(400).json({ message: "No valid items found. Please check your cart." })
        }

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
            return res.status(400).json({ message: "No valid shops found. Please try again." })
        }

        // ✅ CALCULATE WITH TAX
        const deliveryFee = calculateDeliveryFee(subtotal)
        const taxAmount = TAX_AMOUNT
        const finalTotal = subtotal + deliveryFee + taxAmount // ✅ Tax included

        console.log(`💰 Subtotal: ₹${subtotal}, Delivery Fee: ₹${deliveryFee}, Tax: ₹${taxAmount}, Final Total: ₹${finalTotal}`)

        const newOrder = await Order.create({
            user: req.userId,
            paymentMethod,
            deliveryAddress,
            totalAmount: finalTotal,        // ✅ Tax included
            deliveryFee: deliveryFee,
            taxAmount: taxAmount,           // ✅ Save tax
            shopOrders,
            payment: false,
            mobile: mobile,
            customerName: customerName || 'Customer'
        })

        await newOrder.populate("shopOrders.shopOrderItems.item", "name image price")
        await newOrder.populate("shopOrders.shop", "name")
        await newOrder.populate("shopOrders.owner", "fullName socketId")
        await newOrder.populate("user", "fullName email mobile")

        // ✅ ONLINE PAYMENT - Razorpay with tax
        if (paymentMethod === "online") {
            const razorOrder = await createOrder(finalTotal) // ✅ finalTotal includes tax
            newOrder.razorpayOrderId = razorOrder.id
            await newOrder.save()
            return res.status(200).json({
                razorpayOrderId: razorOrder.id,
                orderId: newOrder._id,
                amount: razorOrder.amount,     // ✅ Amount with tax
                currency: razorOrder.currency,
                keyId: process.env.RAZORPAY_KEY_ID,
                deliveryFee: deliveryFee,
                taxAmount: taxAmount,          // ✅ Send tax
                subtotal: subtotal,
                finalTotal: finalTotal
            })
        }

        // ✅ COD - Send email
        try {
            await sendOrderConfirmation(newOrder.user, newOrder)
        } catch (emailError) {
            console.log("⚠️ Email error:", emailError.message)
        }

        // ✅ Socket emit for COD
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
                        taxAmount: taxAmount,
                        subtotal: subtotal,
                        mobile: mobile
                    })
                }
            })
        }

        return res.status(201).json({
            ...newOrder.toObject(),
            deliveryFee: deliveryFee,
            taxAmount: taxAmount,
            subtotal: subtotal,
            finalTotal: finalTotal
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
        const isValid = await verifyRazorpayPayment(razorpay_payment_id, razorpay_order_id, razorpay_signature)

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

        await order.populate("user", "fullName email mobile")
        await order.populate("shopOrders.shop", "name")
        await order.populate("shopOrders.owner", "fullName socketId")
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
                        taxAmount: order.taxAmount || 0,
                        subtotal: order.totalAmount - (order.deliveryFee || 0) - (order.taxAmount || 0)
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
                .populate("user", "fullName email mobile")
                .populate("shopOrders.shop", "name")
                .populate("shopOrders.owner", "fullName email mobile")
                .populate("shopOrders.shopOrderItems.item", "name image price")
        } 
        else if (user.role === "deliveryBoy") {
            orders = await Order.find({
                "shopOrders.assignedDeliveryBoy": req.userId
            })
            .sort({ createdAt: -1 })
            .populate("user", "fullName email mobile")
            .populate("shopOrders.shop", "name")
            .populate("shopOrders.owner", "fullName email mobile")
            .populate("shopOrders.shopOrderItems.item", "name image price")
            .populate("shopOrders.assignedDeliveryBoy", "fullName mobile")
            
            orders = orders.map(order => {
                const orderObj = order.toObject()
                return {
                    ...orderObj,
                    mobile: order.mobile || orderObj.user?.mobile || null,
                    customerMobile: order.mobile || orderObj.user?.mobile || null
                }
            })
            
            console.log(`📦 Found ${orders.length} assigned orders for delivery boy`)
        }
        else if (user.role === "owner") {
            const allOrders = await Order.find({ "shopOrders.owner": req.userId })
                .sort({ createdAt: -1 })
                .populate("user", "fullName email mobile")
                .populate("shopOrders.shop", "name")
                .populate("shopOrders.owner", "fullName email mobile")
                .populate("shopOrders.shopOrderItems.item", "name image price")
                .populate("shopOrders.assignedDeliveryBoy", "fullName mobile")

            orders = allOrders.map(order => ({
                ...order._doc,
                shopOrders: order.shopOrders.filter(o => o.owner._id.toString() === req.userId.toString())
            })).filter(order => order.shopOrders.length > 0)
        }

        return res.status(200).json(orders)

    } catch (error) {
        console.log("❌ Get my orders error:", error.message)
        return res.status(500).json({ message: `get my order error: ${error.message}` })
    }
}

// ============================================
// ✅ GET ORDER BY ID
// ============================================
export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params
        const order = await Order.findById(orderId)
            .populate("user", "fullName email mobile")
            .populate({ path: "shopOrders.shop", model: "Shop" })
            .populate({ path: "shopOrders.assignedDeliveryBoy", model: "User", select: "fullName mobile email" })
            .populate({ path: "shopOrders.shopOrderItems.item", model: "Item" })
            .lean()

        if (!order) {
            return res.status(404).json({ message: "Order not found" })
        }
        return res.status(200).json(order)
    } catch (error) {
        console.log("❌ Get order by id error:", error.message)
        return res.status(500).json({ message: `get order by id error: ${error.message}` })
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

        try {
            await sendDeliveryOtpMail(order.user, otp)
            console.log("✅ Delivery OTP email sent to:", order.user.email)
        } catch (emailError) {
            console.log("❌ Email error:", emailError.message)
        }

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
// ✅ VERIFY DELIVERY OTP - WITH EARNINGS
// ============================================
export const verifyDeliveryOtp = async (req, res) => {
    try {
        const { orderId, shopOrderId, otp } = req.body
        console.log("🔍 Verifying OTP:", { orderId, shopOrderId, otp })
        
        const order = await Order.findById(orderId).populate("user")
        if (!order) {
            return res.status(400).json({ message: "Order not found" })
        }
        
        const shopOrder = order.shopOrders.id(shopOrderId)
        if (!shopOrder) {
            return res.status(400).json({ message: "Shop order not found" })
        }

        console.log("🔑 Stored OTP:", shopOrder.deliveryOtp)
        console.log("⏰ Expires:", shopOrder.otpExpires)
        console.log("📦 Current Status:", shopOrder.status)

        if (shopOrder.status === 'delivered') {
            return res.status(400).json({ message: "Order already delivered" })
        }

        if (shopOrder.deliveryOtp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" })
        }
        
        if (!shopOrder.otpExpires || shopOrder.otpExpires < Date.now()) {
            return res.status(400).json({ message: "OTP expired" })
        }

        shopOrder.status = "delivered"
        shopOrder.deliveredAt = new Date()
        await order.save()
        
        await DeliveryAssignment.deleteOne({
            shopOrderId: shopOrder._id,
            order: order._id,
            assignedTo: shopOrder.assignedDeliveryBoy
        })

        const EARNING_PER_DELIVERY = 50
        const deliveryBoyId = shopOrder.assignedDeliveryBoy
        
        if (deliveryBoyId) {
            console.log(`💰 Adding ₹${EARNING_PER_DELIVERY} to delivery boy:`, deliveryBoyId)
            
            const deliveryBoy = await User.findById(deliveryBoyId)
            
            if (deliveryBoy) {
                const currentEarnings = deliveryBoy.earnings || 0
                const newEarnings = currentEarnings + EARNING_PER_DELIVERY
                
                const currentDeliveries = deliveryBoy.totalDeliveries || 0
                const newDeliveries = currentDeliveries + 1
                
                deliveryBoy.earnings = newEarnings
                deliveryBoy.totalDeliveries = newDeliveries
                deliveryBoy.isBusy = false
                deliveryBoy.isOnline = true
                
                await deliveryBoy.save()
                
                console.log(`✅ Updated ${deliveryBoy.fullName}:`)
                console.log(`   Earnings: ₹${currentEarnings} → ₹${newEarnings}`)
                console.log(`   Deliveries: ${currentDeliveries} → ${newDeliveries}`)
                
                return res.status(200).json({ 
                    message: "Order Delivered Successfully! +₹50 earned!",
                    success: true,
                    earning: EARNING_PER_DELIVERY,
                    totalEarnings: newEarnings,
                    totalDeliveries: newDeliveries,
                    deliveryBoy: {
                        id: deliveryBoy._id,
                        fullName: deliveryBoy.fullName,
                        earnings: deliveryBoy.earnings,
                        totalDeliveries: deliveryBoy.totalDeliveries
                    }
                })
            } else {
                console.log("❌ Delivery boy not found:", deliveryBoyId)
                return res.status(400).json({ message: "Delivery boy not found" })
            }
        } else {
            console.log("❌ No delivery boy assigned to this order")
            return res.status(200).json({ 
                message: "Order delivered but no delivery boy assigned",
                success: true
            })
        }
        
    } catch (error) {
        console.log("❌ Verify OTP error:", error)
        return res.status(500).json({ message: `Verify OTP error: ${error.message}` })
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

        if (status === "out of delivery" && !shopOrder.assignedDeliveryBoy) {
            const { longitude, latitude } = order.deliveryAddress
            
            console.log('📍 Finding delivery boys near:', { longitude, latitude })
            
            const allDeliveryBoys = await User.find({
                role: "deliveryBoy",
                isOnline: true
            })
            
            console.log(`📦 Total online delivery boys: ${allDeliveryBoys.length}`)
            
            const nearbyBoys = await User.find({
                role: "deliveryBoy",
                isOnline: true,
                location: {
                    $near: {
                        $geometry: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
                        $maxDistance: 15000
                    }
                }
            })
            
            console.log(`📍 Nearby delivery boys: ${nearbyBoys.length}`)
            
            const allCandidates = new Set()
            allDeliveryBoys.forEach(b => allCandidates.add(String(b._id)))
            nearbyBoys.forEach(b => allCandidates.add(String(b._id)))
            
            console.log(`📦 Total candidates: ${allCandidates.size}`)
            
            if (allCandidates.size === 0) {
                await order.save()
                return res.json({ 
                    message: "Order status updated but no delivery boys found",
                    shopOrder: shopOrder,
                    availableBoys: []
                })
            }

            const candidates = Array.from(allCandidates)
            const deliveryAssignment = await DeliveryAssignment.create({
                order: order._id,
                shop: shopOrder.shop,
                shopOrderId: shopOrder._id,
                brodcastedTo: candidates,
                status: "broadcasted"
            })
            
            console.log('✅ Assignment created:', {
                id: deliveryAssignment._id,
                broadcastedTo: deliveryAssignment.brodcastedTo.length,
                status: deliveryAssignment.status
            })
            
            shopOrder.assignment = deliveryAssignment._id
            
            deliveryBoysPayload = allDeliveryBoys.map(b => ({
                id: b._id,
                fullName: b.fullName,
                mobile: b.mobile,
                isOnline: b.isOnline,
                isBusy: false
            }))

            await deliveryAssignment.populate('order')
            await deliveryAssignment.populate('shop')

            const io = req.app.get('io')
            if (io) {
                allDeliveryBoys.forEach(boy => {
                    const boySocketId = boy.socketId
                    if (boySocketId) {
                        console.log(`📤 Sending assignment to: ${boy.fullName} (${boy._id})`)
                        io.to(boySocketId).emit('newAssignment', {
                            sentTo: boy._id,
                            assignmentId: deliveryAssignment._id,
                            orderId: deliveryAssignment.order._id,
                            shopName: deliveryAssignment.shop.name,
                            deliveryAddress: deliveryAssignment.order.deliveryAddress,
                            items: deliveryAssignment.order.shopOrders.find(so => 
                                so._id.equals(deliveryAssignment.shopOrderId)
                            )?.shopOrderItems || [],
                            subtotal: deliveryAssignment.order.shopOrders.find(so => 
                                so._id.equals(deliveryAssignment.shopOrderId)
                            )?.subtotal
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
        console.log("❌ Order status error:", error)
        return res.status(500).json({ message: `order status error: ${error.message}` })
    }
}

// ============================================
// ✅ ACCEPT ORDER
// ============================================
export const acceptOrder = async (req, res) => {
    try {
        const { assignmentId } = req.params
        const userId = req.userId

        console.log('📦 Accept Order Request:', { assignmentId, userId })

        const assignment = await DeliveryAssignment.findById(assignmentId)
        if (!assignment) {
            return res.status(404).json({ 
                success: false,
                message: "Assignment not found" 
            })
        }

        console.log('📋 Assignment found:', {
            status: assignment.status,
            broadcastedTo: assignment.brodcastedTo.map(id => String(id))
        })

        if (assignment.status !== "broadcasted") {
            return res.status(400).json({ 
                success: false,
                message: `Assignment is ${assignment.status}. Cannot accept.` 
            })
        }

        const user = await User.findById(userId)
        if (!user || user.role !== 'deliveryBoy') {
            return res.status(400).json({ 
                success: false,
                message: "User is not a delivery boy" 
            })
        }

        if (!user.isOnline) {
            return res.status(400).json({ 
                success: false,
                message: "You are offline. Please go online to accept orders." 
            })
        }

        const userIdStr = String(userId)
        const isAuthorized = assignment.brodcastedTo.some(id => String(id) === userIdStr)
        
        if (!isAuthorized) {
            console.log('⚠️ Delivery boy not in broadcast list. Auto-adding...')
            assignment.brodcastedTo.push(userId)
            await assignment.save()
        }

        const existingAssignment = await DeliveryAssignment.findOne({
            assignedTo: userId,
            status: { $in: ["assigned", "broadcasted", "accepted", "out of delivery"] }
        })

        if (existingAssignment) {
            return res.status(400).json({ 
                success: false,
                message: "You are already assigned to another order. Complete it first." 
            })
        }

        const activeOrder = await Order.findOne({
            'shopOrders.assignedDeliveryBoy': userId,
            'shopOrders.status': { $in: ['assigned', 'out of delivery'] }
        })

        if (activeOrder) {
            return res.status(400).json({ 
                success: false,
                message: "You already have an active order. Complete it first." 
            })
        }

        assignment.assignedTo = userId
        assignment.status = "assigned"
        assignment.acceptedAt = new Date()
        await assignment.save()

        const order = await Order.findById(assignment.order)
        if (!order) {
            return res.status(404).json({ 
                success: false,
                message: "Order not found" 
            })
        }

        const shopOrder = order.shopOrders.id(assignment.shopOrderId)
        if (shopOrder) {
            shopOrder.assignedDeliveryBoy = userId
            shopOrder.status = 'out of delivery'
            await order.save()
        }

        await User.findByIdAndUpdate(userId, { 
            isBusy: true,
            isOnline: true 
        })

        const io = req.app.get('io')
        if (io) {
            io.to(userId).emit('order-status-update', {
                orderId: order._id,
                status: 'out of delivery',
                deliveryBoyId: userId
            })
        }

        return res.status(200).json({ 
            success: true,
            message: 'Order accepted successfully',
            assignment,
            order
        })

    } catch (error) {
        console.log("❌ Accept order error:", error.message)
        return res.status(500).json({ 
            success: false,
            message: `Accept order error: ${error.message}` 
        })
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

        const assignment = await DeliveryAssignment.findById(assignmentId)
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" })
        }

        if (assignment.status === 'assigned' || assignment.status === 'accepted') {
            return res.status(400).json({ message: "Order already accepted, cannot reject" })
        }

        if (assignment.status === 'rejected') {
            return res.status(400).json({ message: "Order already rejected" })
        }

        assignment.status = 'rejected'
        assignment.rejectedAt = new Date()
        assignment.rejectedBy = deliveryBoyId
        await assignment.save()

        assignment.brodcastedTo = assignment.brodcastedTo.filter(id => String(id) !== String(deliveryBoyId))
        await assignment.save()

        const io = req.app.get('io')
        if (io) {
            io.emit('order-rejected', {
                orderId: assignment.order,
                deliveryBoyId,
                assignmentId
            })
        }

        return res.status(200).json({ message: "Order rejected successfully", assignment })
    } catch (error) {
        console.log("❌ Reject order error:", error.message)
        return res.status(500).json({ message: error.message })
    }
}

// ============================================
// ✅ GET DELIVERY BOY ASSIGNMENTS
// ============================================
export const getDeliveryBoyAssignments = async (req, res) => {
    try {
        const userId = req.userId
        
        console.log('🔍 Fetching assignments for delivery boy:', userId)
        
        const assignments = await DeliveryAssignment.find({
            $or: [
                { assignedTo: userId },
                { brodcastedTo: userId }
            ]
        })
        .populate('order')
        .populate('shop')
        .sort({ createdAt: -1 })
        
        console.log(`📦 Found ${assignments.length} assignments`)
        
        return res.status(200).json({
            success: true,
            assignments,
            count: assignments.length
        })
    } catch (error) {
        console.log("❌ Get assignments error:", error.message)
        return res.status(500).json({ 
            success: false,
            message: error.message 
        })
    }
}

// ============================================
// ✅ GET CURRENT ORDER
// ============================================
export const getCurrentOrder = async (req, res) => {
    try {
        const userId = req.userId
        const order = await Order.findOne({
            'shopOrders.assignedDeliveryBoy': userId,
            'shopOrders.status': { $in: ['assigned', 'out of delivery'] }
        }).populate('shopOrders.shop shopOrders.shopOrderItems.item')

        if (!order) {
            return res.status(200).json({ order: null, message: 'No active order' })
        }

        return res.status(200).json({ success: true, order })
    } catch (error) {
        return res.status(500).json({ message: error.message })
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
                    shopOrder.deliveredAt >= startsOfDay) {
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
            .populate({ path: 'shopOrders.shop', select: 'name' })
            .populate({ path: 'shopOrders.owner', select: 'fullName email socketId' })

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

        return res.status(200).json({ message: "Order cancelled successfully", order })
    } catch (error) {
        console.log("❌ Cancel order error:", error.message)
        return res.status(500).json({ message: `Cancel order error: ${error.message}` })
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
        const { status, paymentMethod, startDate, endDate, page = 1, limit = 10 } = req.query
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
            .populate("user", "fullName email mobile")
            .populate("shopOrders.shop", "name")
            .populate("shopOrders.owner", "fullName email mobile")
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

// ============================================
// ✅ GET ASSIGNED ORDERS FOR DELIVERY BOY
// ============================================
export const getAssignedOrders = async (req, res) => {
    try {
        const userId = req.userId
        
        console.log(`🔍 Fetching assigned orders for delivery boy: ${userId}`)
        
        const orders = await Order.find({
            'shopOrders.assignedDeliveryBoy': userId
        })
        .populate({
            path: 'shopOrders.shop',
            select: 'name image address city'
        })
        .populate({
            path: 'shopOrders.shopOrderItems.item',
            select: 'name price image foodType'
        })
        .populate('user', 'fullName email mobile')
        .sort({ createdAt: -1 })
        
        console.log(`📦 Found ${orders.length} assigned orders`)
        
        const formattedOrders = orders.map(order => {
            const shopOrder = order.shopOrders.find(so => 
                so.assignedDeliveryBoy?.toString() === userId.toString()
            )
            
            const orderObj = order.toObject()
            
            return {
                ...orderObj,
                mobile: order.mobile || order.user?.mobile || null,
                customerMobile: order.mobile || order.user?.mobile || null,
                status: shopOrder?.status || 'assigned',
                shopOrder: shopOrder,
                user: {
                    ...orderObj.user,
                    mobile: orderObj.user?.mobile || order.mobile || null
                }
            }
        })
        
        return res.status(200).json({ 
            success: true, 
            orders: formattedOrders || [],
            count: formattedOrders.length
        })
        
    } catch (error) {
        console.log("❌ Get assigned orders error:", error.message)
        return res.status(500).json({ 
            success: false,
            message: error.message 
        })
    }
}

// ============================================
// ✅ COMPLETE DELIVERY - WITH EARNINGS (₹50)
// ============================================
export const completeDelivery = async (req, res) => {
    try {
        const { orderId } = req.params
        const userId = req.userId

        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(404).json({ message: "Order not found" })
        }

        const shopOrder = order.shopOrders.find(so => so.assignedDeliveryBoy?.toString() === userId.toString())
        if (!shopOrder) {
            return res.status(404).json({ message: "Order not assigned to you" })
        }
        if (shopOrder.status === 'delivered') {
            return res.status(400).json({ message: "Order already delivered" })
        }

        const EARNING_PER_DELIVERY = 50
        const earning = EARNING_PER_DELIVERY

        shopOrder.status = 'delivered'
        shopOrder.deliveredAt = new Date()
        await order.save()

        await User.findByIdAndUpdate(userId, {
            $inc: { 
                totalDeliveries: 1, 
                earnings: earning
            },
            isBusy: false,
            isOnline: true
        })

        await DeliveryAssignment.deleteOne({ order: order._id, assignedTo: userId })

        const io = req.app.get('io')
        if (io) {
            io.to(userId).emit('order-status-update', {
                orderId: order._id,
                status: 'delivered',
                deliveryBoyId: userId
            })
        }

        return res.status(200).json({ 
            success: true, 
            message: "Delivery completed successfully", 
            order,
            earning: earning
        })

    } catch (error) {
        console.log("❌ Complete delivery error:", error.message)
        return res.status(500).json({ message: error.message })
    }
}

// ============================================
// ✅ UPDATE DELIVERY STATUS
// ============================================
export const updateDeliveryStatus = async (req, res) => {
    try {
        const { orderId } = req.params
        const { status } = req.body
        const userId = req.userId

        const validStatuses = ['assigned', 'out of delivery', 'delivered']
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" })
        }

        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(404).json({ message: "Order not found" })
        }

        const shopOrder = order.shopOrders.find(so => so.assignedDeliveryBoy?.toString() === userId.toString())
        if (!shopOrder) {
            return res.status(404).json({ message: "Order not assigned to you" })
        }

        shopOrder.status = status
        if (status === 'out of delivery') {
            shopOrder.outForDeliveryAt = new Date()
        }
        if (status === 'delivered') {
            shopOrder.deliveredAt = new Date()
        }
        await order.save()

        const io = req.app.get('io')
        if (io) {
            io.to(userId).emit('order-status-update', {
                orderId: order._id,
                status: status,
                deliveryBoyId: userId
            })
        }

        return res.status(200).json({ success: true, message: `Order status updated to ${status}`, order })
    } catch (error) {
        console.log("❌ Update delivery status error:", error.message)
        return res.status(500).json({ message: error.message })
    }
}

// ============================================
// ✅ GET ASSIGNMENT BY ID
// ============================================
export const getAssignmentById = async (req, res) => {
    try {
        const { assignmentId } = req.params
        const assignment = await DeliveryAssignment.findById(assignmentId).populate('order').populate('shop')

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" })
        }

        return res.status(200).json({ success: true, assignment })
    } catch (error) {
        console.log("❌ Get assignment error:", error.message)
        return res.status(500).json({ message: error.message })
    }
}

// ============================================
// ✅ GET DELIVERY BOY STATS
// ============================================
export const getDeliveryBoyStats = async (req, res) => {
    try {
        const { id } = req.params
        
        if (id !== req.userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" })
        }

        const user = await User.findById(id)
            .select('fullName email mobile totalDeliveries earnings deliveryBoyRating completionRate ratePerDelivery isApproved')

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        if (user.role !== 'deliveryBoy') {
            return res.status(400).json({ success: false, message: "User is not a delivery boy" })
        }

        return res.status(200).json({
            success: true,
            totalDeliveries: user.totalDeliveries || 0,
            totalEarning: user.earnings || 0,
            deliveryBoyRating: user.deliveryBoyRating || { average: 0, count: 0 },
            completionRate: user.completionRate || 0,
            ratePerDelivery: user.ratePerDelivery || 50,
            fullName: user.fullName,
            email: user.email,
            mobile: user.mobile,
            isApproved: user.isApproved
        })
    } catch (error) {
        console.log("❌ Get delivery boy stats error:", error.message)
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ============================================
// ✅ GET DELIVERY BOY DETAILS
// ============================================
export const getDeliveryBoyDetails = async (req, res) => {
    try {
        const { id } = req.params
        const deliveryBoy = await User.findById(id)
            .select('fullName email mobile location isOnline isBusy deliveryBoyRating profilePhoto updatedAt totalDeliveries earnings')

        if (!deliveryBoy) {
            return res.status(404).json({ success: false, message: "Delivery boy not found" })
        }

        if (deliveryBoy.role !== 'deliveryBoy') {
            return res.status(400).json({ success: false, message: "User is not a delivery boy" })
        }

        const busyAssignment = await DeliveryAssignment.findOne({
            assignedTo: id,
            status: { $in: ['assigned', 'broadcasted'] }
        })

        const result = deliveryBoy.toObject()
        result.isBusy = !!busyAssignment
        result.currentAssignment = busyAssignment || null

        return res.status(200).json({ success: true, deliveryBoy: result })
    } catch (error) {
        console.log("❌ Get delivery boy details error:", error.message)
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ============================================
// ✅ UPDATE DELIVERY BOY STATUS
// ============================================
export const updateDeliveryBoyStatus = async (req, res) => {
    try {
        const { isOnline } = req.body
        const user = await User.findByIdAndUpdate(
            req.userId,
            { isOnline: isOnline !== undefined ? isOnline : true },
            { returnDocument: 'after' }
        )

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        return res.status(200).json({
            success: true,
            message: `Status updated to ${user.isOnline ? 'Online' : 'Offline'}`,
            isOnline: user.isOnline
        })
    } catch (error) {
        console.log("❌ Update delivery boy status error:", error.message)
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ============================================
// ✅ GET PENDING ORDERS COUNT
// ============================================
export const getPendingOrdersCount = async (req, res) => {
    try {
        const userId = req.userId

        const shop = await Shop.findOne({ owner: userId })
        if (!shop) {
            return res.status(200).json({ count: 0 })
        }

        const count = await Order.countDocuments({
            'shopOrders.shop': shop._id,
            'shopOrders.status': { $in: ['pending', 'preparing'] }
        })

        return res.status(200).json({ 
            success: true, 
            count: count || 0 
        })
    } catch (error) {
        console.log("❌ Get pending orders count error:", error.message)
        return res.status(500).json({ 
            success: false, 
            message: error.message 
        })
    }
}

// ============================================
// ✅ CHECK ASSIGNMENTS
// ============================================
export const checkAssignments = async (req, res) => {
    try {
        const userId = req.userId
        console.log('🔍 Checking assignments for:', userId)

        const assignments = await DeliveryAssignment.find({
            assignedTo: userId,
            status: { $in: ["assigned", "broadcasted"] }
        })

        const orders = await Order.find({
            'shopOrders.assignedDeliveryBoy': userId,
            'shopOrders.status': { $in: ['assigned', 'out of delivery', 'preparing'] }
        })

        return res.status(200).json({
            success: true,
            assignments: assignments,
            orders: orders,
            hasActiveAssignment: assignments.length > 0 || orders.length > 0,
            assignmentCount: assignments.length,
            orderCount: orders.length
        })
    } catch (error) {
        console.log("❌ Check assignments error:", error.message)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// ============================================
// ✅ CLEAR ASSIGNMENTS
// ============================================
export const clearAssignments = async (req, res) => {
    try {
        const userId = req.userId
        console.log(`🧹 Clearing all assignments for delivery boy: ${userId}`)

        const assignmentResult = await DeliveryAssignment.updateMany(
            { assignedTo: userId },
            { status: "completed", completedAt: new Date() }
        )

        const orderResult = await Order.updateMany(
            { 'shopOrders.assignedDeliveryBoy': userId },
            { 
                $set: { 
                    'shopOrders.$[].assignedDeliveryBoy': null,
                    'shopOrders.$[].status': 'pending'
                }
            }
        )

        return res.status(200).json({
            success: true,
            message: "All assignments cleared successfully",
            assignmentsUpdated: assignmentResult.modifiedCount,
            ordersUpdated: orderResult.modifiedCount
        })
    } catch (error) {
        console.log("❌ Clear assignments error:", error.message)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// ============================================
// ✅ CHECK SPECIFIC ASSIGNMENT (DEBUG)
// ============================================
export const checkAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params
        
        const assignment = await DeliveryAssignment.findById(assignmentId)
            .populate('order')
            .populate('shop')
        
        if (!assignment) {
            return res.status(404).json({ 
                success: false, 
                message: "Assignment not found" 
            })
        }
        
        return res.status(200).json({
            success: true,
            assignment: {
                id: assignment._id,
                status: assignment.status,
                broadcastedTo: assignment.brodcastedTo,
                assignedTo: assignment.assignedTo,
                orderId: assignment.order?._id,
                shopId: assignment.shop?._id,
                createdAt: assignment.createdAt
            }
        })
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: error.message 
        })
    }
}

// ============================================
// ✅ ADD DELIVERY BOY TO BROADCAST LIST
// ============================================
export const addDeliveryBoyToBroadcast = async (req, res) => {
    try {
        const { assignmentId } = req.params
        const { deliveryBoyId } = req.body

        console.log('📦 Adding delivery boy to broadcast:', { assignmentId, deliveryBoyId })

        const assignment = await DeliveryAssignment.findById(assignmentId)
        if (!assignment) {
            return res.status(404).json({ 
                success: false,
                message: "Assignment not found" 
            })
        }

        const deliveryBoy = await User.findById(deliveryBoyId)
        if (!deliveryBoy) {
            return res.status(404).json({ 
                success: false,
                message: "Delivery boy not found" 
            })
        }

        if (deliveryBoy.role !== 'deliveryBoy') {
            return res.status(400).json({ 
                success: false,
                message: `User is not a delivery boy. Role: ${deliveryBoy.role}` 
            })
        }

        const alreadyInList = assignment.brodcastedTo.some(id => String(id) === String(deliveryBoyId))
        if (alreadyInList) {
            return res.status(200).json({ 
                success: true,
                message: "Delivery boy already in broadcast list",
                assignment
            })
        }

        assignment.brodcastedTo.push(deliveryBoyId)
        await assignment.save()

        console.log('✅ Delivery boy added to broadcast list')

        return res.status(200).json({ 
            success: true,
            message: "Delivery boy added to broadcast list successfully",
            assignment
        })

    } catch (error) {
        console.log("❌ Add delivery boy to broadcast error:", error.message)
        return res.status(500).json({ 
            success: false,
            message: error.message 
        })
    }
}

// ============================================
// ✅ FORCE ASSIGN DELIVERY BOY TO ORDER
// ============================================
export const forceAssignDeliveryBoy = async (req, res) => {
    try {
        const { assignmentId } = req.params
        const { deliveryBoyId } = req.body

        console.log('🚴 Force assigning delivery boy:', { assignmentId, deliveryBoyId })

        const assignment = await DeliveryAssignment.findById(assignmentId)
        if (!assignment) {
            return res.status(404).json({ 
                success: false,
                message: "Assignment not found" 
            })
        }

        const deliveryBoy = await User.findById(deliveryBoyId)
        if (!deliveryBoy) {
            return res.status(404).json({ 
                success: false,
                message: "Delivery boy not found" 
            })
        }

        if (deliveryBoy.role !== 'deliveryBoy') {
            return res.status(400).json({ 
                success: false,
                message: `User is not a delivery boy. Role: ${deliveryBoy.role}` 
            })
        }

        if (!deliveryBoy.isOnline) {
            return res.status(400).json({ 
                success: false,
                message: "Delivery boy is offline" 
            })
        }

        if (assignment.status !== "broadcasted") {
            return res.status(400).json({ 
                success: false,
                message: `Assignment is ${assignment.status}. Cannot assign.` 
            })
        }

        if (!assignment.brodcastedTo.some(id => String(id) === String(deliveryBoyId))) {
            assignment.brodcastedTo.push(deliveryBoyId)
            await assignment.save()
        }

        assignment.assignedTo = deliveryBoyId
        assignment.status = "assigned"
        assignment.acceptedAt = new Date()
        await assignment.save()

        const order = await Order.findById(assignment.order)
        if (!order) {
            return res.status(404).json({ 
                success: false,
                message: "Order not found" 
            })
        }

        const shopOrder = order.shopOrders.id(assignment.shopOrderId)
        if (shopOrder) {
            shopOrder.assignedDeliveryBoy = deliveryBoyId
            shopOrder.status = 'out of delivery'
            await order.save()
        }

        await User.findByIdAndUpdate(deliveryBoyId, { 
            isBusy: true,
            isOnline: true 
        })

        const io = req.app.get('io')
        if (io) {
            io.to(deliveryBoyId).emit('order-status-update', {
                orderId: order._id,
                status: 'out of delivery',
                deliveryBoyId: deliveryBoyId
            })
        }

        return res.status(200).json({ 
            success: true,
            message: "Delivery boy assigned successfully",
            assignment,
            order
        })

    } catch (error) {
        console.log("❌ Force assign error:", error.message)
        return res.status(500).json({ 
            success: false,
            message: error.message 
        })
    }
}

// ============================================
// ✅ DEBUG ORDERS
// ============================================
export const debugOrders = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        console.log('👤 User:', user.fullName, 'Role:', user.role)
        
        const orders = await Order.find({ user: req.userId })
            .populate('shopOrders.shop')
            .populate('shopOrders.shopOrderItems.item')
            .lean()
        
        console.log('📦 Orders found:', orders.length)
        
        res.json({
            success: true,
            count: orders.length,
            orders: orders,
            user: {
                id: user._id,
                name: user.fullName,
                role: user.role
            }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}