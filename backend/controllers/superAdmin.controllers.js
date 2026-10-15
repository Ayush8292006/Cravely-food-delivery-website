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
        console.log("❌ Dashboard stats error:", error.message)
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
        
        const shop = await Shop.findById(shopId)
        if (!shop) {
            return res.status(400).json({ message: "Shop not found" })
        }
        
        shop.isApproved = isApproved !== undefined ? isApproved : true
        shop.approvedBy = req.userId
        shop.approvedAt = shop.isApproved ? new Date() : null
        await shop.save()
        
        // ✅ Only approve owner if shop is approved
        if (shop.isApproved) {
            await User.findByIdAndUpdate(shop.owner, { isApproved: true })
        }
        
        // ✅ Emit socket event for real-time update
        const owner = await User.findById(shop.owner)
        if (owner?.socketId && req.io) {
            req.io.to(owner.socketId).emit('shop-approved', {
                shopId: shop._id,
                shop: shop,
                message: `Your shop "${shop.name}" has been approved!`
            })
        }
        
        return res.status(200).json({ 
            success: true,
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
// ✅ FIXED: GET DELIVERY BOYS (Pending & All)
// ============================================
export const getDeliveryBoys = async (req, res) => {
    try {
        const { status = 'all' } = req.query
        
        let filter = { role: 'deliveryBoy' }
        
        // ✅ Fixed: Proper status filtering
        if (status === 'pending') {
            filter.isApproved = false
        } else if (status === 'approved') {
            filter.isApproved = true
        }
        // 'all' - don't add isApproved filter
        
        const deliveryBoys = await User.find(filter)
            .select('fullName email mobile isApproved isOnline isBusy createdAt location profilePhoto')
            .sort({ createdAt: -1 })
        
        return res.status(200).json({
            success: true,
            deliveryBoys,
            count: deliveryBoys.length
        })
    } catch (error) {
        console.log("❌ Get delivery boys error:", error.message)
        return res.status(500).json({ 
            success: false,
            message: error.message 
        })
    }
}

// ============================================
// ✅ FIXED: APPROVE/REJECT DELIVERY BOY
// ============================================
export const approveDeliveryBoy = async (req, res) => {
    try {
        const { userId } = req.params
        // ✅ isApproved can be true or false
        const { isApproved } = req.body

        // ✅ Validate input
        if (isApproved === undefined) {
            return res.status(400).json({ 
                success: false,
                message: "isApproved is required" 
            })
        }

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            })
        }

        // ✅ Check if user is a delivery boy
        if (user.role !== 'deliveryBoy') {
            return res.status(400).json({ 
                success: false,
                message: "User is not a delivery boy" 
            })
        }

        // ✅ Update approval status
        user.isApproved = isApproved
        user.approvedBy = req.userId
        user.approvedAt = isApproved ? new Date() : null
        await user.save()

        // ✅ Emit socket event for real-time update
        if (user.socketId && req.io) {
            req.io.to(user.socketId).emit('account-approved', {
                userId: user._id,
                isApproved: user.isApproved,
                message: isApproved 
                    ? '🎉 Your delivery boy account has been approved!' 
                    : 'Your delivery boy account has been rejected.'
            })
        }

        return res.status(200).json({ 
            success: true,
            message: `Delivery boy ${isApproved ? 'approved' : 'rejected'} successfully`,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                isApproved: user.isApproved,
                role: user.role
            }
        })
    } catch (error) {
        console.log("❌ Approve delivery boy error:", error.message)
        return res.status(500).json({ 
            success: false,
            message: error.message 
        })
    }
}

// ============================================
// ✅ NEW: GET PENDING DELIVERY BOYS COUNT
// ============================================
export const getPendingDeliveryBoysCount = async (req, res) => {
    try {
        const count = await User.countDocuments({
            role: 'deliveryBoy',
            isApproved: false
        })
        
        return res.status(200).json({
            success: true,
            count
        })
    } catch (error) {
        return res.status(500).json({ 
            success: false,
            message: error.message 
        })
    }
}

// ============================================
// ✅ NEW: GET DELIVERY BOY BY ID
// ============================================
export const getDeliveryBoyById = async (req, res) => {
    try {
        const { userId } = req.params
        
        const deliveryBoy = await User.findById(userId)
            .select('fullName email mobile isApproved isOnline isBusy createdAt location profilePhoto deliveryBoyRating')
        
        if (!deliveryBoy) {
            return res.status(404).json({ 
                success: false,
                message: "Delivery boy not found" 
            })
        }

        if (deliveryBoy.role !== 'deliveryBoy') {
            return res.status(400).json({ 
                success: false,
                message: "User is not a delivery boy" 
            })
        }

        return res.status(200).json({
            success: true,
            deliveryBoy
        })
    } catch (error) {
        return res.status(500).json({ 
            success: false,
            message: error.message 
        })
    }
}