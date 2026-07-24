import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"

// ✅ Import ALL functions from user.controllers
import * as UserController from "../controllers/user.controllers.js"

const userRouter = express.Router()

// ============================================
// USER ROUTES
// ============================================

// ✅ Current User
userRouter.get("/current", isAuth, UserController.getCurrentUser)

// ✅ Location
userRouter.post("/update-location", isAuth, UserController.updateUserLocation)

// ✅ Profile
userRouter.get("/profile", isAuth, UserController.getProfile)
userRouter.put("/profile", isAuth, UserController.updateProfile)
userRouter.post("/change-password", isAuth, UserController.changePassword)
userRouter.post("/upload-photo", isAuth, upload.single("image"), UserController.uploadProfilePhoto)

// ✅ Addresses
userRouter.post("/address", isAuth, UserController.addAddress)
userRouter.get("/addresses", isAuth, UserController.getAddresses)
userRouter.put("/address/:addressId/default", isAuth, UserController.setDefaultAddress)
userRouter.delete("/address/:addressId", isAuth, UserController.deleteAddress)

// ✅ Wishlist
userRouter.post("/wishlist/toggle", isAuth, UserController.toggleWishlist)
userRouter.get("/wishlist", isAuth, UserController.getWishlist)

// ✅ Delivery Boys - NEW ROUTES
userRouter.get("/delivery-boys/nearby", isAuth, UserController.getNearbyDeliveryBoys)
userRouter.put("/delivery-boy/status", isAuth, UserController.updateDeliveryBoyStatus)
userRouter.get("/delivery-boy/:deliveryBoyId", isAuth, UserController.getDeliveryBoyDetails)

export default userRouter