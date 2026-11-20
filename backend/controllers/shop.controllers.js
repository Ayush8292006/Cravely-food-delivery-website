import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

// ============================================
// CREATE OR EDIT SHOP
// ============================================
export const createEditShop = async (req, res) => {
    try {
        const { name, city, state, address } = req.body

        // ✅ VALIDATION - Check all required fields
        if (!name || !name.trim()) {
            return res.status(400).json({ 
                message: "Shop name is required" 
            })
        }
        if (!city || !city.trim()) {
            return res.status(400).json({ 
                message: "City is required" 
            })
        }
        if (!state || !state.trim()) {
            return res.status(400).json({ 
                message: "State is required" 
            })
        }
        if (!address || !address.trim()) {
            return res.status(400).json({ 
                message: "Address is required" 
            })
        }

        // ✅ Check if user is logged in
        if (!req.userId) {
            return res.status(401).json({ 
                message: "Authentication required" 
            })
        }

        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path)
        }

        // ✅ Check if user already has a shop
        let shop = await Shop.findOne({ owner: req.userId })

        if (!shop) {
            // ✅ CREATE NEW SHOP
            shop = await Shop.create({
                name: name.trim(),
                city: city.trim(),
                state: state.trim(),
                address: address.trim(),
                image: image || null,
                owner: req.userId,
                isApproved: false  // ✅ Default pending approval
            })
        } else {
            // ✅ UPDATE EXISTING SHOP
            shop = await Shop.findByIdAndUpdate(
                shop._id, 
                {
                    name: name.trim(),
                    city: city.trim(),
                    state: state.trim(),
                    address: address.trim(),
                    image: image || shop.image,
                }, 
                { 
                    returnDocument: 'after',
                    new: true 
                }
            )
        }

        await shop.populate("owner")
        await shop.populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })

        return res.status(200).json(shop)

    } catch (error) {
        console.log("❌ Create shop error:", error.message)
        return res.status(500).json({ 
            message: `create shop error: ${error.message}` 
        })
    }
}

// ============================================
// GET MY SINGLE SHOP (for backward compatibility)
// ============================================
export const getMyShop = async (req, res) => {
    try {
        const userId = req.userId
        
        if (!userId) {
            return res.status(401).json({ 
                message: "Unauthorized" 
            })
        }

        const shop = await Shop.findOne({ owner: userId })
            .populate('owner', 'fullName email mobile')
            .populate('items')
        
        if (!shop) {
            return res.status(404).json({ 
                success: false,
                message: "No shop found for this user",
                shop: null 
            })
        }

        return res.status(200).json({ 
            success: true, 
            shop 
        })
    } catch (error) {
        console.log("❌ Get my shop error:", error.message)
        return res.status(500).json({ 
            success: false,
            message: error.message 
        })
    }
}

// ============================================
// ✅ NEW: GET ALL SHOPS OF THE OWNER (Multiple Shops Support)
// ============================================
export const getMyShops = async (req, res) => {
    try {
        const userId = req.userId
        
        if (!userId) {
            return res.status(401).json({ 
                success: false,
                message: "Unauthorized" 
            })
        }

        const shops = await Shop.find({ owner: userId })
            .populate('owner', 'fullName email mobile')
            .populate('items')
            .sort({ createdAt: -1 })

        return res.status(200).json({ 
            success: true, 
            shops: shops || [],
            count: shops.length
        })
    } catch (error) {
        console.log("❌ Get my shops error:", error.message)
        return res.status(500).json({ 
            success: false,
            message: error.message 
        })
    }
}

// ============================================
// GET SHOPS BY CITY
// ============================================
export const getShopByCity = async (req, res) => {
    try {
        const { city } = req.params

        // ✅ VALIDATION
        if (!city || !city.trim()) {
            return res.status(400).json({ 
                message: "City is required" 
            })
        }

        let shops = await Shop.find({
            city: { $regex: new RegExp(`^${city.trim()}$`, "i") },
            isApproved: true  // ✅ Only approved shops for customers
        }).populate("items")
        .populate('owner', 'fullName email')

        if ((!shops || shops.length === 0) && (city.toLowerCase() === 'all' || city.toLowerCase() === 'nearby')) {
            shops = await Shop.find({ isApproved: true })
                .populate("items")
                .populate('owner', 'fullName email')
        }

        // If no shops in this specific city, still return all approved shops so the customer has choices
        if (!shops || shops.length === 0) {
            shops = await Shop.find({ isApproved: true })
                .populate("items")
                .populate('owner', 'fullName email')
                .limit(20)
        }

        return res.status(200).json(shops || [])

    } catch (error) {
        console.log("❌ Get shop by city error:", error.message)
        return res.status(500).json({ 
            message: `get shop by city error: ${error.message}` 
        })
    }
}

// ============================================
// GET SHOP BY ID
// ============================================
export const getShopById = async (req, res) => {
    try {
        const { id } = req.params
        
        if (!id) {
            return res.status(400).json({ 
                message: "Shop ID is required" 
            })
        }

        const shop = await Shop.findById(id)
            .populate('owner', 'fullName email mobile')
            .populate({
                path: 'items',
                options: { sort: { createdAt: -1 } }
            })

        if (!shop) {
            return res.status(404).json({ 
                message: "Shop not found" 
            })
        }

        return res.status(200).json({ 
            success: true, 
            shop 
        })
    } catch (error) {
        console.log("❌ Get shop by ID error:", error.message)
        return res.status(500).json({ 
            message: error.message 
        })
    }
}

// ============================================
// DELETE SHOP
// ============================================
export const deleteShop = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const shop = await Shop.findOne({ _id: id, owner: userId })
        
        if (!shop) {
            return res.status(404).json({ 
                message: "Shop not found or you don't have permission" 
            })
        }

        await Shop.findByIdAndDelete(id)

        return res.status(200).json({ 
            success: true,
            message: "Shop deleted successfully" 
        })
    } catch (error) {
        console.log("❌ Delete shop error:", error.message)
        return res.status(500).json({ 
            message: error.message 
        })
    }
}

// ============================================
// GET ALL SHOPS (Admin Only)
// ============================================
export const getAllShops = async (req, res) => {
    try {
        const shops = await Shop.find()
            .populate('owner', 'fullName email mobile')
            .populate('items')
            .sort({ createdAt: -1 })

        return res.status(200).json({ 
            success: true, 
            shops: shops || [],
            count: shops.length
        })
    } catch (error) {
        console.log("❌ Get all shops error:", error.message)
        return res.status(500).json({ 
            message: error.message 
        })
    }
}

// ============================================
// APPROVE SHOP (Admin Only)
// ============================================
export const approveShop = async (req, res) => {
    try {
        const { id } = req.params

        const shop = await Shop.findByIdAndUpdate(
            id,
            { isApproved: true },
            { new: true }
        )

        if (!shop) {
            return res.status(404).json({ 
                message: "Shop not found" 
            })
        }

        return res.status(200).json({ 
            success: true,
            message: "Shop approved successfully",
            shop 
        })
    } catch (error) {
        console.log("❌ Approve shop error:", error.message)
        return res.status(500).json({ 
            message: error.message 
        })
    }
}