import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    mobile: {
        type: String,
        required: true,
    },
    
    profilePhoto: {
        type: String,
        default: null
    },

    deliveryBoyRating: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    },
     isApproved: {
        type: Boolean,
        default: false  // Owners & Delivery Boys need approval
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    approvedAt: {
        type: Date,
        default: null
    },
    
    // ✅ Existing role field (update enum)
    role: {
        type: String,
        enum: ["user", "owner", "deliveryBoy", "superAdmin"],
        required: true
    },
    
    // ✅ ADD THESE FIELDS FOR EMAIL VERIFICATION
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String,
        default: null
    },
    emailVerificationExpires: {
        type: Date,
        default: null
    },
    
    // Existing fields...
    resetOtp: {
        type: String
    },
    isOtpVerified: {
        type: Boolean,
        default: false
    },
    otpExpires: {
        type: Date
    },

     loginOtp: {
        type: String,
        default: null
    },
    loginOtpExpires: {
        type: Date,
        default: null
    },

    socketId: {
        type: String
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    },

    addresses: [{
        type: {
            type: String,
            enum: ['home', 'office', 'other'],
            default: 'home'
        },
        label: String,
        text: String,
        latitude: Number,
        longitude: Number,
        isDefault: {
            type: Boolean,
            default: false
        }
    }],
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    }]
}, { timestamps: true })

userSchema.index({ location: '2dsphere' })

const User = mongoose.model("User", userSchema)
export default User