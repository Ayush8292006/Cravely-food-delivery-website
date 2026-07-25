import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.routes.js"
import cors from "cors"
import userRouter from "./routes/user.routes.js"
import shopRouter from "./routes/shop.routes.js"
import itemRouter from "./routes/item.routes.js"
import orderRouter from "./routes/order.routes.js"
import reviewRouter from "./routes/review.routes.js"
import deliveryBoyRatingRouter from "./routes/deliveryBoyRating.routes.js"
import superAdminRouter from "./routes/superAdmin.routes.js"
import http from "http"
import { Server } from "socket.io"
import { socketHandler } from "./socket.js"

const app = express()
const server = http.createServer(app)

// ✅ GET FRONTEND URL FROM ENVIRONMENT
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

// ✅ UPDATED CORS WITH FRONTEND URL
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'https://cravely-food-delivery-website.vercel.app/',  // ✅ ADD THIS
    'https://cravely-backend-dmak.onrender.com'
]

console.log('✅ CORS allowed origins:', allowedOrigins)

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ['POST', 'GET']
    }
})
app.set("io", io)

const port = process.env.PORT || 5000

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/shop", shopRouter)
app.use("/api/item", itemRouter)
app.use("/api/order", orderRouter)
app.use("/api/review", reviewRouter)
app.use("/api/delivery-rating", deliveryBoyRatingRouter)
app.use("/api/super-admin", superAdminRouter)

app.get('/', (req, res) => {
    res.json({
        message: '🍕 Food Delivery API is running!',
        version: '1.0.0',
        status: '✅ Server is healthy'
    })
})

socketHandler(io)

server.listen(port, () => {
    connectDb()
    console.log(`🚀 Server started at http://localhost:${port}`)
    console.log(`✅ Frontend URL: ${FRONTEND_URL}`)
})