import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"
import * as UserController from "../controllers/user.controllers.js"

const userRouter = express.Router()

// ✅ Public routes
userRouter.post("/register", UserController.register)
userRouter.post("/login", UserController.login)

// ✅ Protected routes
userRouter.get("/current", isAuth, UserController.getCurrentUser)
userRouter.post("/update-location", isAuth, UserController.updateUserLocation)
userRouter.post("/set-password", isAuth, UserController.setPassword)
userRouter.put("/profile", isAuth, UserController.updateProfile)
userRouter.get("/orders", isAuth, UserController.getUserOrders)
userRouter.get("/profile", isAuth, UserController.getProfile)

// ✅ Delivery Boy routes
userRouter.get('/delivery-boy/:id', isAuth, UserController.getDeliveryBoyStats)
userRouter.get('/delivery-boys/nearby', isAuth, UserController.getNearbyDeliveryBoys)  // ✅ ADD THIS

// ✅ Upload avatar
userRouter.post(
    "/upload-avatar",
    isAuth,
    upload.single('avatar'),
    UserController.uploadAvatar
)

// ✅ User by ID (keep at the end)
userRouter.get("/:id", isAuth, UserController.getUserById)

export default userRouter