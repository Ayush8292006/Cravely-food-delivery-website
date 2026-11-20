import express from "express"
import { 
    createEditShop, 
    getMyShop, 
    getMyShops,      // ✅ ADD THIS
    getShopByCity, 
    getShopById,
    deleteShop,
    getAllShops,
    approveShop
} from "../controllers/shop.controllers.js"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"

const shopRouter = express.Router()

// ✅ Owner routes
shopRouter.post("/create-edit", isAuth, upload.single("image"), createEditShop)
shopRouter.get('/my-shop', isAuth, getMyShop)           // ✅ Single shop (backward compatible)
shopRouter.get('/my-shops', isAuth, getMyShops)         // ✅ NEW: All shops of owner
shopRouter.get('/:id', getShopById)                     // ✅ Get shop by ID (public access for menu browsing)
shopRouter.delete('/:id', isAuth, deleteShop)           // ✅ Delete shop

// ✅ Customer routes
shopRouter.get("/get-by-city/:city", getShopByCity)     // ✅ Get shops by city (no auth needed)

// ✅ Admin routes
shopRouter.get("/admin/all", isAuth, getAllShops)       // ✅ Get all shops
shopRouter.put("/admin/approve/:id", isAuth, approveShop) // ✅ Approve shop

export default shopRouter