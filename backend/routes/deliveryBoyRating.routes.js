import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { 
    addDeliveryBoyRating,
    getDeliveryBoyRatings,
    getDeliveryBoyAverageRating
} from "../controllers/deliveryBoyRating.controllers.js"

const deliveryBoyRatingRouter = express.Router()

deliveryBoyRatingRouter.post("/add", isAuth, addDeliveryBoyRating)
deliveryBoyRatingRouter.get("/boy/:deliveryBoyId", isAuth, getDeliveryBoyRatings)
deliveryBoyRatingRouter.get("/boy/:deliveryBoyId/average", isAuth, getDeliveryBoyAverageRating)

export default deliveryBoyRatingRouter