import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import uploadOnCloudinary from "../utils/cloudinary.js"
import DeliveryAssignment from "../models/deliveryAssignment.model.js"

// ============================================
// ✅ GET CURRENT USER
// ============================================
export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId
        if (!userId) {
            return res.status(400).json({ message: "userId is not found" })
        }
        const user = await User.findById(userId).select('-password -resetOtp -loginOtp -emailVerificationToken')
        if (!user) {
            return res.status(400).json({ message: "user is not found" })
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message: `get current user error ${error}` })
    }
}

// ============================================
// ✅ UPDATE USER LOCATION
// ============================================
export const updateUserLocation = async (req, res) => {
    try {
        const { lat, lon } = req.body
        if (!lat || !lon) {
            return res.status(400).json({ message: "Latitude and longitude are required" })
        }
        const user = await User.findByIdAndUpdate(req.userId, {
            location: {
                type: 'Point',
                coordinates: [parseFloat(lon), parseFloat(lat)]
            },
            isOnline: true
        }, { returnDocument: 'after' })

        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }
        return res.status(200).json({ message: 'Location updated successfully' })
    } catch (error) {
        return res.status(500).json({ message: `update location error ${error}` })
    }
}

// ============================================
// ✅ GET PROFILE
// ============================================
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .select('-password -resetOtp -loginOtp -emailVerificationToken -socketId')
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message: `Get profile error: ${error.message}` })
    }
}

// ============================================
// ✅ UPDATE PROFILE
// ============================================
export const updateProfile = async (req, res) => {
    try {
        const { fullName, mobile, email } = req.body
        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }
        if (fullName) user.fullName = fullName
        if (mobile) user.mobile = mobile
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email })
            if (existingUser) {
                return res.status(400).json({ message: "Email already in use" })
            }
            user.email = email
            user.isEmailVerified = false
        }
        await user.save()
        return res.status(200).json({ message: "Profile updated successfully", user: user })
    } catch (error) {
        return res.status(500).json({ message: `Update profile error: ${error.message}` })
    }
}

// ============================================
// ✅ SET PASSWORD
// ============================================
export const setPassword = async (req, res) => {
    try {
        const { newPassword } = req.body
        if (!newPassword) {
            return res.status(400).json({ message: "New password is required" })
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must have at least 6 characters" })
        }
        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }
        if (user.password) {
            return res.status(400).json({ message: "You already have a password set. Use change password instead." })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashedPassword
        await user.save()
        return res.status(200).json({ message: "Password set successfully!" })
    } catch (error) {
        console.log("❌ Set password error:", error.message)
        return res.status(500).json({ message: `Set password error: ${error.message}` })
    }
}

// ============================================
// ✅ GET USER ORDERS
// ============================================
export const getUserOrders = async (req, res) => {
    try {
        const userId = req.userId
        const orders = await Order.find({ user: userId })
            .populate('shopOrders.shop')
            .populate('shopOrders.shopOrderItems.item')
            .sort({ createdAt: -1 })
        return res.status(200).json(orders)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// ============================================
// ✅ GET USER BY ID
// ============================================
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params
        const user = await User.findById(id).select('-password')
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// ============================================
// ✅ REGISTER
// ============================================
export const register = async (req, res) => {
    try {
        const { fullName, email, password, role, mobile } = req.body
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            mobile,
            role: role || 'user',
            isApproved: role === 'deliveryBoy' ? false : true,
            location: { type: 'Point', coordinates: [0, 0] },
            isOnline: false,
            isBusy: false
        })
        return res.status(201).json({ success: true, message: "Registration successful", user })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// ============================================
// ✅ LOGIN
// ============================================
export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" })
        }
        // Generate token and set cookie (you need to implement this)
        return res.status(200).json({ success: true, message: "Login successful", user })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// ============================================
// ✅ UPLOAD AVATAR
// ============================================
export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please upload a photo" })
        }
        const imageUrl = await uploadOnCloudinary(req.file.path)
        if (!imageUrl) {
            return res.status(400).json({ message: "Failed to upload photo" })
        }
        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }
        user.profilePhoto = imageUrl
        await user.save()
        return res.status(200).json({ message: "Profile photo updated successfully", profilePhoto: imageUrl })
    } catch (error) {
        return res.status(500).json({ message: `Upload photo error: ${error.message}` })
    }
}

// ============================================
// ✅ GET DELIVERY BOY STATS
// ============================================
// ============================================
// ✅ GET DELIVERY BOY STATS
// ============================================
// ============================================
// ✅ GET DELIVERY BOY STATS - FIXED
// ============================================
export const getDeliveryBoyStats = async (req, res) => {
    try {
        const { id } = req.params
        
        console.log("📊 Fetching delivery boy stats for ID:", id)
        console.log("👤 Current user ID:", req.userId)
        
        // ✅ Check if ID is provided
        if (!id) {
            return res.status(400).json({ 
                success: false, 
                message: "Delivery boy ID is required" 
            })
        }

        // ✅ Check if user exists
        const user = await User.findById(id)
            .select('fullName email mobile totalDeliveries earnings deliveryBoyRating completionRate ratePerDelivery isApproved isOnline isBusy location role')

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            })
        }

        // ✅ Check if user is a delivery boy
        if (user.role !== 'deliveryBoy') {
            return res.status(400).json({ 
                success: false, 
                message: "User is not a delivery boy" 
            })
        }

        return res.status(200).json({
            success: true,
            totalDeliveries: user.totalDeliveries || 0,
            totalEarning: user.earnings || 0,
            deliveryBoyRating: user.deliveryBoyRating || { average: 0, count: 0 },
            completionRate: user.completionRate || 0,
            ratePerDelivery: user.ratePerDelivery || 50,
            fullName: user.fullName,
            email: user.email,
            mobile: user.mobile,
            isApproved: user.isApproved,
            isOnline: user.isOnline || false,
            isBusy: user.isBusy || false
        })
    } catch (error) {
        console.log("❌ Get delivery boy stats error:", error.message)
        return res.status(500).json({ 
            success: false, 
            message: error.message 
        })
    }
}

// ============================================
// ✅ GET NEARBY DELIVERY BOYS
// ============================================
export const getNearbyDeliveryBoys = async (req, res) => {
    try {
        const { lat, lon, radius = 15 } = req.query

        console.log("🔍 Finding delivery boys near:", { lat, lon, radius })

        if (!lat || !lon) {
            return res.status(400).json({ 
                success: false,
                message: "Latitude and longitude are required" 
            })
        }

        const deliveryBoys = await User.find({
            role: 'deliveryBoy',
            isApproved: true,
            isOnline: true,
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lon), parseFloat(lat)]
                    },
                    $maxDistance: radius * 1000 // Convert km to meters
                }
            }
        })
        .select('fullName email mobile location isOnline isBusy deliveryBoyRating profilePhoto updatedAt')
        .sort({ updatedAt: -1 })
        .limit(20)

        console.log(`📦 Found ${deliveryBoys.length} delivery boys nearby`)

        // ✅ Check which boys are busy
        const busyBoyIds = await DeliveryAssignment.find({
            assignedTo: { $in: deliveryBoys.map(b => b._id) },
            status: { $in: ['assigned', 'broadcasted'] }
        }).distinct('assignedTo')

        const busySet = new Set(busyBoyIds.map(id => id.toString()))

        const formattedBoys = deliveryBoys.map(boy => {
            const boyObj = boy.toObject()
            return {
                ...boyObj,
                isBusy: busySet.has(boy._id.toString()),
                password: undefined,
                resetOtp: undefined,
                loginOtp: undefined,
                emailVerificationToken: undefined
            }
        })

        return res.status(200).json({
            success: true,
            deliveryBoys: formattedBoys,
            count: formattedBoys.length
        })
    } catch (error) {
        console.log("❌ Get nearby delivery boys error:", error.message)
        return res.status(500).json({ 
            success: false,
            message: `Get nearby delivery boys error: ${error.message}` 
        })
    }
}