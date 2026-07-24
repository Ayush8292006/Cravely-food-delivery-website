import User from "../models/user.model.js"
import Shop from "../models/shop.model.js"
import Order from "../models/order.model.js"
import Item from "../models/item.model.js"

// ============================================
// DASHBOARD STATS
// ============================================
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' })
        const totalOwners = await User.countDocuments({ role: 'owner' })
        const totalDeliveryBoys = await User.countDocuments({ role: 'deliveryBoy' })
        const totalShops = await Shop.countDocuments()
        const totalItems = await Item.countDocuments()
        
        const totalOrders = await Order.countDocuments()
        const pendingOrders = await Order.countDocuments({ 'shopOrders.status': 'pending' })
        const deliveredOrders = await Order.countDocuments({ 'shopOrders.status': 'delivered' })
        
        const revenueResult = await Order.aggregate([
            { $match: { payment: true } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ])
        const totalRevenue = revenueResult[0]?.total || 0

        // ✅ Pending approvals
        const pendingOwners = await User.countDocuments({ 
            role: 'owner', 
            isApproved: false 
        })
        const pendingDeliveryBoys = await User.countDocuments({ 
            role: 'deliveryBoy', 
            isApproved: false 
        })

        return res.status(200).json({
            users: { total: totalUsers, owners: totalOwners, deliveryBoys: totalDeliveryBoys },
            shops: totalShops,
            items: totalItems,
            orders: { total: totalOrders, pending: pendingOrders, delivered: deliveredOrders },
            revenue: totalRevenue,
            pendingApprovals: {
                owners: pendingOwners,
                deliveryBoys: pendingDeliveryBoys
            }
        })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// ============================================
// GET ALL USERS
// ============================================
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password -resetOtp -loginOtp -emailVerificationToken')
            .sort({ createdAt: -1 })
        
        return res.status(200).json(users)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// ============================================
// BLOCK/UNBLOCK USER
// ============================================
export const toggleBlockUser = async (req, res) => {
    try {
        const { userId } = req.params
        const user = await User.findById(userId)
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }
        user.isBlocked = !user.isBlocked
        await user.save()
        return res.status(200).json({ 
            message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
            user
        })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// ============================================
// DELETE USER
// ============================================
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params
        const user = await User.findByIdAndDelete(userId)
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }
        return res.status(200).json({ message: "User deleted successfully" })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// ============================================
// GET ALL SHOPS
// ============================================
export const getAllShops = async (req, res) => {
    try {
        const shops = await Shop.find()
            .populate('owner', 'fullName email mobile isApproved')
            .sort({ createdAt: -1 })
        
        return res.status(200).json(shops)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// ============================================
// APPROVE/REJECT SHOP
// ============================================
export const approveShop = async (req, res) => {
    try {
        const { shopId } = req.params
        const { isApproved } = req.body
        
        console.log("🔍 Approving shop:", shopId, "Status:", isApproved)
        
        const shop = await Shop.findById(shopId)
        if (!shop) {
            return res.status(400).json({ message: "Shop not found" })
        }
        
        // ✅ Update shop approval
        shop.isApproved = isApproved !== undefined ? isApproved : true
        shop.approvedBy = req.userId
        shop.approvedAt = shop.isApproved ? new Date() : null
        await shop.save()
        
        // ✅ Update owner's approval status
        await User.findByIdAndUpdate(shop.owner, { 
            isApproved: shop.isApproved 
        })
        
        return res.status(200).json({ 
            message: `Shop ${shop.isApproved ? 'approved' : 'rejected'} successfully`,
            shop
        })
    } catch (error) {
        console.log("❌ Approve shop error:", error.message)
        return res.status(500).json({ message: error.message })
    }
}

// ============================================
// GET ALL ORDERS
// ============================================
export const getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query
        
        let filter = {}
        if (status && status !== 'all') {
            filter['shopOrders.status'] = status
        }
        
        const orders = await Order.find(filter)
            .populate('user', 'fullName email mobile')
            .populate('shopOrders.shop', 'name')
            .populate('shopOrders.owner', 'fullName email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
        
        const total = await Order.countDocuments(filter)
        
        return res.status(200).json({
            orders,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// ============================================
// UPDATE REFUND STATUS
// ============================================
export const updateRefundStatus = async (req, res) => {
    try {
        const { orderId } = req.params
        const { refundStatus } = req.body

        const validStatuses = ['pending', 'processing', 'completed', 'failed']
        if (!validStatuses.includes(refundStatus)) {
            return res.status(400).json({ message: "Invalid refund status" })
        }

        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(400).json({ message: "Order not found" })
        }

        order.refundStatus = refundStatus
        await order.save()

        return res.status(200).json({ 
            message: "Refund status updated",
            order
        })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// ============================================
// GET REVENUE REPORT
// ============================================
export const getRevenueReport = async (req, res) => {
    try {
        const { period = 'month' } = req.query
        
        let startDate = new Date()
        if (period === 'week') {
            startDate.setDate(startDate.getDate() - 7)
        } else if (period === 'month') {
            startDate.setMonth(startDate.getMonth() - 1)
        } else if (period === 'year') {
            startDate.setFullYear(startDate.getFullYear() - 1)
        }
        startDate.setHours(0, 0, 0, 0)

        const orders = await Order.find({
            createdAt: { $gte: startDate },
            payment: true
        })

        const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)
        
        const dailyRevenue = {}
        orders.forEach(order => {
            const date = order.createdAt.toISOString().split('T')[0]
            dailyRevenue[date] = (dailyRevenue[date] || 0) + order.totalAmount
        })

        return res.status(200).json({
            period,
            totalRevenue,
            ordersCount: orders.length,
            dailyRevenue: Object.entries(dailyRevenue).map(([date, amount]) => ({ date, amount }))
        })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// ============================================
// GET DELIVERY BOYS (Pending & All)
// ============================================
export const getDeliveryBoys = async (req, res) => {
    try {
        const { status = 'all' } = req.query
        
        let filter = { role: 'deliveryBoy' }
        if (status === 'pending') {
            filter.isApproved = false
        } else if (status === 'approved') {
            filter.isApproved = true
        }
        
        const deliveryBoys = await User.find(filter)
            .select('fullName email mobile isApproved createdAt location')
            .sort({ createdAt: -1 })
        
        return res.status(200).json(deliveryBoys)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// ============================================
// APPROVE DELIVERY BOY
// ============================================
export const approveDeliveryBoy = async (req, res) => {
    try {
        const { userId } = req.params
        const { isApproved } = req.body
        
        const user = await User.findById(userId)
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }
        
        if (user.role !== 'deliveryBoy') {
            return res.status(400).json({ message: "User is not a delivery boy" })
        }
        
        user.isApproved = isApproved
        user.approvedBy = req.userId
        user.approvedAt = isApproved ? new Date() : null
        await user.save()
        
        return res.status(200).json({ 
            message: `Delivery boy ${isApproved ? 'approved' : 'rejected'} successfully`,
            user
        })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}