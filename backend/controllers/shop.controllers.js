import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

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

export const getMyShop = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ 
                message: "Authentication required" 
            })
        }

        const shop = await Shop.findOne({ owner: req.userId })
            .populate("owner")
            .populate({
                path: "items",
                options: { sort: { updatedAt: -1 } }
            })

        if (!shop) {
            return res.status(404).json({ 
                message: "No shop found for this owner" 
            })
        }

        return res.status(200).json(shop)

    } catch (error) {
        console.log("❌ Get my shop error:", error.message)
        return res.status(500).json({ 
            message: `get my shop error: ${error.message}` 
        })
    }
}

export const getShopByCity = async (req, res) => {
    try {
        const { city } = req.params

        // ✅ VALIDATION
        if (!city || !city.trim()) {
            return res.status(400).json({ 
                message: "City is required" 
            })
        }

        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        }).populate("items")

        // ✅ Return empty array (not 400)
        return res.status(200).json(shops)

    } catch (error) {
        console.log("❌ Get shop by city error:", error.message)
        return res.status(500).json({ 
            message: `get shop by city error: ${error.message}` 
        })
    }
}