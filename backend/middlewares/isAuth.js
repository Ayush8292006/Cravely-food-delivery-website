import jwt from "jsonwebtoken"

const isAuth = async (req, res, next) => {
    try {
        // ✅ Get token from cookie or Authorization header
        const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1]

        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "Authentication required. Please login." 
            })
        }

        // ✅ Verify token
        const decodeToken = jwt.verify(token, process.env.JWT_SECRET)
        
        if (!decodeToken) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid or expired token. Please login again." 
            })
        }

        // ✅ Attach userId to request
        req.userId = decodeToken.userId || decodeToken.id
        req.userRole = decodeToken.role || null
        
        next()
    } catch (error) {
        console.log("❌ Auth error:", error.message)
        
        // ✅ Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: "Token expired. Please login again." 
            })
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: "Invalid token. Please login again." 
            })
        }

        return res.status(500).json({ 
            success: false,
            message: `Authentication error: ${error.message}` 
        })
    }
}

export default isAuth