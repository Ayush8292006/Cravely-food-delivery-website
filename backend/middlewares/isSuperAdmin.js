import User from "../models/user.model.js"

const isSuperAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(401).json({ message: "User not found" })
        }
        if (user.role !== "superAdmin") {
            return res.status(403).json({ message: "Super Admin access required" })
        }
        next()
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export default isSuperAdmin