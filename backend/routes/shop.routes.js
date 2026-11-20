import express from "express"
import { 
    createEditShop, 
    getMyShop, 
    getMyShops,
    getShopByCity, 
    getActiveLocations,
    getShopById,
    deleteShop,
    getAllShops,
    approveShop
} from "../controllers/shop.controllers.js"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"

const shopRouter = express.Router()

// ✅ Public Location & Customer routes (Must be defined before /:id)
shopRouter.get("/active-locations", getActiveLocations)
shopRouter.get("/get-by-city/:city", getShopByCity)

// ✅ Owner routes
shopRouter.post("/create-edit", isAuth, upload.single("image"), createEditShop)
shopRouter.get('/my-shop', isAuth, getMyShop)
shopRouter.get('/my-shops', isAuth, getMyShops)
shopRouter.get('/:id', getShopById)
shopRouter.delete('/:id', isAuth, deleteShop)

// ✅ Admin routes
shopRouter.get("/admin/all", isAuth, getAllShops)
shopRouter.put("/admin/approve/:id", isAuth, approveShop)

export default shopRouter