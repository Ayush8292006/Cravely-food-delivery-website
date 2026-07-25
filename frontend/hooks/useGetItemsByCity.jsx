export const getItemByCity = async (req, res) => {
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
        })

        // ✅ If no shops found, return empty array (not 400)
        if (shops.length === 0) {
            return res.status(200).json([])
        }

        const shopIds = shops.map((shop) => shop._id)
        const items = await Item.find({ 
            shop: { $in: shopIds } 
        }).populate("shop")

        return res.status(200).json(items)

    } catch (error) {
        console.log("❌ Get item by city error:", error.message)
        return res.status(500).json({ 
            message: `Get item by city error: ${error.message}` 
        })
    }
}