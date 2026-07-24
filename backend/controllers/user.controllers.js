import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import uploadOnCloudinary from "../utils/cloudinary.js"
import DeliveryAssignment from "../models/deliveryAssignment.model.js"

// ============================================
// GET CURRENT USER
// ============================================
export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId
        if (!userId) {
            return res.status(400).json({ message: "userId is not found" })
        }
        const user = await User.findById(userId)
        if (!user) {
            return res.status(400).json({ message: "user is not found" })
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message: `get current user error ${error}` })
    }
}

// ============================================
// UPDATE USER LOCATION
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
// GET PROFILE
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
// UPDATE PROFILE
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

        return res.status(200).json({
            message: "Profile updated successfully",
            user: user
        })
    } catch (error) {
        return res.status(500).json({ message: `Update profile error: ${error.message}` })
    }
}

// ============================================
// CHANGE PASSWORD
// ============================================
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current password and new password are required" })
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must have at least 6 characters" })
        }

        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashedPassword
        await user.save()

        return res.status(200).json({ message: "Password changed successfully" })
    } catch (error) {
        return res.status(500).json({ message: `Change password error: ${error.message}` })
    }
}

// ============================================
// UPLOAD PROFILE PHOTO
// ============================================
export const uploadProfilePhoto = async (req, res) => {
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

        return res.status(200).json({
            message: "Profile photo updated successfully",
            profilePhoto: imageUrl
        })
    } catch (error) {
        return res.status(500).json({ message: `Upload photo error: ${error.message}` })
    }
}

// ============================================
// ADDRESS FUNCTIONS
// ============================================
export const addAddress = async (req, res) => {
    try {
        const { type, label, text, latitude, longitude } = req.body

        if (!text || !latitude || !longitude) {
            return res.status(400).json({ message: "Address fields required" })
        }

        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        const isDefault = user.addresses.length === 0

        const newAddress = {
            type: type || 'home',
            label: label || 'Home',
            text,
            latitude,
            longitude,
            isDefault
        }

        user.addresses.push(newAddress)
        await user.save()

        return res.status(201).json(user.addresses)
    } catch (error) {
        return res.status(500).json({ message: `add address error ${error.message}` })
    }
}

export const getAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        return res.status(200).json(user.addresses)
    } catch (error) {
        return res.status(500).json({ message: `get addresses error ${error.message}` })
    }
}

export const setDefaultAddress = async (req, res) => {
    try {
        const { addressId } = req.params

        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        user.addresses.forEach(addr => addr.isDefault = false)

        const address = user.addresses.id(addressId)
        if (!address) {
            return res.status(400).json({ message: "Address not found" })
        }

        address.isDefault = true
        await user.save()

        return res.status(200).json(user.addresses)
    } catch (error) {
        return res.status(500).json({ message: `set default address error ${error.message}` })
    }
}

export const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params

        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        const address = user.addresses.id(addressId)
        if (!address) {
            return res.status(400).json({ message: "Address not found" })
        }

        if (address.isDefault && user.addresses.length > 1) {
            const remainingAddresses = user.addresses.filter(a => a._id.toString() !== addressId)
            if (remainingAddresses.length > 0) {
                remainingAddresses[0].isDefault = true
            }
        }

        address.deleteOne()
        await user.save()

        return res.status(200).json(user.addresses)
    } catch (error) {
        return res.status(500).json({ message: `delete address error ${error.message}` })
    }
}

// ============================================
// WISHLIST FUNCTIONS
// ============================================
export const toggleWishlist = async (req, res) => {
    try {
        const { itemId } = req.body

        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        const index = user.wishlist.indexOf(itemId)
        if (index === -1) {
            user.wishlist.push(itemId)
        } else {
            user.wishlist.splice(index, 1)
        }

        await user.save()
        return res.status(200).json({ 
            wishlist: user.wishlist,
            isWishlisted: index === -1
        })
    } catch (error) {
        return res.status(500).json({ message: `toggle wishlist error ${error.message}` })
    }
}

export const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('wishlist')
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        return res.status(200).json(user.wishlist)
    } catch (error) {
        return res.status(500).json({ message: `get wishlist error ${error.message}` })
    }
}

// ============================================
// GET NEARBY DELIVERY BOYS - ✅ ADD THIS
// ============================================
export const getNearbyDeliveryBoys = async (req, res) => {
    try {
        const { lat, lon, radius = 15 } = req.query

        if (!lat || !lon) {
            return res.status(400).json({ 
                message: "Latitude and longitude are required" 
            })
        }

        console.log(`🔍 Finding delivery boys near: ${lat}, ${lon} (radius: ${radius}km)`)

        // ✅ Find delivery boys within radius
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

        // ✅ Check which delivery boys are busy
        const busyBoyIds = await DeliveryAssignment.find({
            assignedTo: { $in: deliveryBoys.map(b => b._id) },
            status: { $in: ['assigned', 'broadcasted'] }
        }).distinct('assignedTo')

        const busySet = new Set(busyBoyIds.map(id => id.toString()))

        // ✅ Format response with isBusy flag
        const formattedBoys = deliveryBoys.map(boy => {
            const boyObj = boy.toObject()
            return {
                ...boyObj,
                isBusy: busySet.has(boy._id.toString()),
                // ✅ Remove sensitive fields
                password: undefined,
                resetOtp: undefined,
                loginOtp: undefined,
                emailVerificationToken: undefined
            }
        })

        return res.status(200).json(formattedBoys)
    } catch (error) {
        console.log("❌ Get nearby delivery boys error:", error.message)
        return res.status(500).json({ 
            message: `Get nearby delivery boys error: ${error.message}` 
        })
    }
}

// ============================================
// UPDATE DELIVERY BOY STATUS (Online/Offline)
// ============================================
export const updateDeliveryBoyStatus = async (req, res) => {
    try {
        const { isOnline } = req.body
        
        const user = await User.findByIdAndUpdate(req.userId, {
            isOnline: isOnline !== undefined ? isOnline : true
        }, { returnDocument: 'after' })

        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        return res.status(200).json({
            message: `Status updated to ${user.isOnline ? 'Online' : 'Offline'}`,
            isOnline: user.isOnline
        })
    } catch (error) {
        return res.status(500).json({ message: `Update status error: ${error.message}` })
    }
}

// ============================================
// GET DELIVERY BOY DETAILS
// ============================================
export const getDeliveryBoyDetails = async (req, res) => {
    try {
        const { deliveryBoyId } = req.params

        const deliveryBoy = await User.findById(deliveryBoyId)
            .select('fullName email mobile location isOnline isBusy deliveryBoyRating profilePhoto updatedAt')
        
        if (!deliveryBoy) {
            return res.status(400).json({ message: "Delivery boy not found" })
        }

        if (deliveryBoy.role !== 'deliveryBoy') {
            return res.status(400).json({ message: "User is not a delivery boy" })
        }

        // ✅ Check if currently busy
        const busyAssignment = await DeliveryAssignment.findOne({
            assignedTo: deliveryBoyId,
            status: { $in: ['assigned', 'broadcasted'] }
        })

        const result = deliveryBoy.toObject()
        result.isBusy = !!busyAssignment
        result.currentAssignment = busyAssignment || null

        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({ message: `Get delivery boy error: ${error.message}` })
    }
}