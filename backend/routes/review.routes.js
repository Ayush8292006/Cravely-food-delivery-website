import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { 
    addReview, 
    getShopReviews, 
    likeReview,
    addReply 
} from "../controllers/review.controllers.js"

const reviewRouter = express.Router()

reviewRouter.post("/add", isAuth, addReview)
reviewRouter.get("/shop/:shopId", isAuth, getShopReviews)
reviewRouter.post("/like/:reviewId", isAuth, likeReview)
reviewRouter.post("/reply/:reviewId", isAuth, addReply)

export default reviewRouter