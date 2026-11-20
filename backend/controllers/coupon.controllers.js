import Coupon from "../models/coupon.model.js";

// GET ALL ACTIVE COUPONS
export const getActiveCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({
            isActive: true,
            validTill: { $gte: new Date() }
        }).sort({ discountValue: -1 });
        return res.status(200).json(coupons);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// VALIDATE COUPON
export const validateCoupon = async (req, res) => {
    try {
        const { code, totalAmount } = req.body;
        if (!code) {
            return res.status(400).json({ message: "Coupon code is required" });
        }

        const coupon = await Coupon.findOne({
            code: code.trim().toUpperCase(),
            isActive: true
        });

        if (!coupon) {
            return res.status(404).json({ message: "Invalid coupon code" });
        }

        if (coupon.validTill && new Date(coupon.validTill) < new Date()) {
            return res.status(400).json({ message: "This coupon has expired" });
        }

        const subtotal = Number(totalAmount) || 0;
        if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
            return res.status(400).json({
                message: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`
            });
        }

        let discount = 0;
        if (coupon.discountType === "percentage") {
            discount = Math.round((subtotal * coupon.discountValue) / 100);
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else {
            discount = coupon.discountValue;
        }

        if (discount > subtotal) {
            discount = subtotal;
        }

        return res.status(200).json({
            valid: true,
            code: coupon.code,
            title: coupon.title,
            discountAmount: discount,
            message: `Coupon "${coupon.code}" applied! You saved ₹${discount}`
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// CREATE COUPON (Admin)
export const createCoupon = async (req, res) => {
    try {
        const { code, title, description, discountType, discountValue, maxDiscount, minOrderAmount, validTill, badge } = req.body;
        const exists = await Coupon.findOne({ code: code.toUpperCase() });
        if (exists) {
            return res.status(400).json({ message: "Coupon with this code already exists" });
        }

        const newCoupon = await Coupon.create({
            code: code.toUpperCase(),
            title,
            description,
            discountType,
            discountValue,
            maxDiscount,
            minOrderAmount,
            validTill: validTill ? new Date(validTill) : undefined,
            badge
        });
        return res.status(201).json(newCoupon);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// DELETE COUPON (Admin)
export const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        await Coupon.findByIdAndDelete(id);
        return res.status(200).json({ message: "Coupon deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

