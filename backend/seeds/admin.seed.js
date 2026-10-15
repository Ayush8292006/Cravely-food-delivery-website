import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from 'url'

// ✅ FIXED: Sahi path se .env load karo
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '..', '.env') })

// ✅ Debug: Check if .env loaded
console.log("🔍 MONGODB_URL:", process.env.MONGODB_URL)

import User from "../models/user.model.js"
import connectDb from "../config/db.js"

const seedSuperAdmin = async () => {
    try {
        console.log("🔍 Connecting to database...")
        await connectDb()
        console.log("✅ Database connected!")
        
        const existingAdmin = await User.findOne({ 
            email: "contact.cravely@gmail.com" 
        })
        
        if (existingAdmin) {
            console.log("✅ Super Admin already exists!")
            console.log("📧 Email:", existingAdmin.email)
            process.exit()
        }

        console.log("🔑 Creating Super Admin...")
        const hashedPassword = await bcrypt.hash("Cravely@admin", 10)
        
        const admin = await User.create({
            fullName: "Super Admin",
            email: "contact.cravely@gmail.com",
            password: hashedPassword,
            mobile: "8083072553",
            role: "superAdmin",
            isApproved: true,
            isEmailVerified: true,
            isOtpVerified: true
        })

        console.log("✅ Super Admin created successfully!")
        console.log("📧 Email:", admin.email)
        console.log("🔑 Password: Cravely@admin")
        process.exit()
    } catch (error) {
        console.log("❌ Error:", error.message)
        process.exit()
    }
}

seedSuperAdmin()
