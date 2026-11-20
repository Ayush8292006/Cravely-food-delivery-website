import express from "express";
import { getActiveCoupons, validateCoupon, createCoupon, deleteCoupon } from "../controllers/coupon.controllers.js";
import isAuth from "../middlewares/isAuth.js";
import isSuperAdmin from "../middlewares/isSuperAdmin.js";

const couponRouter = express.Router();

couponRouter.get("/active", getActiveCoupons);
couponRouter.post("/validate", validateCoupon);
couponRouter.post("/create", isAuth, isSuperAdmin, createCoupon);
couponRouter.delete("/:id", isAuth, isSuperAdmin, deleteCoupon);

export default couponRouter;

