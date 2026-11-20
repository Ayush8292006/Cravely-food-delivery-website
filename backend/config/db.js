import mongoose from "mongoose"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const connectDb = async () => {
    try {
        const mongoUrl = process.env.MONGODB_URL
        if (!mongoUrl) {
            throw new Error("MONGODB_URL is missing in environment variables")
        }
        await mongoose.connect(mongoUrl)
        console.log("✅ Database connected successfully")
    } catch (error) {
        console.log("❌ Database connection error:", error.message)
    }
}

export default connectDb
