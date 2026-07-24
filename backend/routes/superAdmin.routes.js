import express from "express"
import isAuth from "../middlewares/isAuth.js"
import isSuperAdmin from "../middlewares/isSuperAdmin.js"
import {
    getDashboardStats,
    getAllUsers,
    toggleBlockUser,
    deleteUser,
    getAllShops,
    approveShop,
    getAllOrders,
    updateRefundStatus,
    getRevenueReport,
    getDeliveryBoys,
    approveDeliveryBoy
} from "../controllers/superAdmin.controllers.js"

const superAdminRouter = express.Router()

// ✅ Ye line ensure karein - route ke pehle
superAdminRouter.use(isAuth, isSuperAdmin)

superAdminRouter.get("/dashboard", getDashboardStats)
superAdminRouter.get("/users", getAllUsers)
superAdminRouter.put("/users/:userId/block", toggleBlockUser)
superAdminRouter.delete("/users/:userId", deleteUser)
superAdminRouter.get("/shops", getAllShops)
superAdminRouter.put("/shops/:shopId/approve", approveShop)
superAdminRouter.get("/orders", getAllOrders)
superAdminRouter.put("/refund/:orderId", updateRefundStatus)
superAdminRouter.get("/revenue", getRevenueReport)
superAdminRouter.get("/delivery-boys", getDeliveryBoys)
superAdminRouter.put("/delivery-boys/:userId/approve", approveDeliveryBoy)

export default superAdminRouter