// ✅ Generate a unique session ID for each tab
export const getSessionId = () => {
    let sessionId = sessionStorage.getItem('sessionId')
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        sessionStorage.setItem('sessionId', sessionId)
    }
    return sessionId
}

// ✅ Save user data for this session only
export const setSessionUser = (userData) => {
    if (!userData) return
    const sessionId = getSessionId()
    const key = `user_${sessionId}`
    localStorage.setItem(key, JSON.stringify(userData))
    sessionStorage.setItem('currentUser', JSON.stringify(userData))
    sessionStorage.setItem('isLoggedIn', 'true')  // ✅ Add login flag
}

// ✅ Get user data for current session
export const getSessionUser = () => {
    try {
        // ✅ First check session storage (fast)
        const sessionData = sessionStorage.getItem('currentUser')
        if (sessionData) {
            return JSON.parse(sessionData)
        }
        
        // ✅ Then check localStorage with session ID
        const sessionId = getSessionId()
        const key = `user_${sessionId}`
        const localData = localStorage.getItem(key)
        if (localData) {
            // ✅ Restore to session storage for faster access
            sessionStorage.setItem('currentUser', localData)
            return JSON.parse(localData)
        }
        
        return null
    } catch (e) {
        console.log("❌ Error getting session user:", e)
        return null
    }
}

// ✅ Check if user is logged in this session
export const isSessionActive = () => {
    // ✅ Check both session storage and login flag
    const hasSessionUser = !!sessionStorage.getItem('currentUser')
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true'
    return hasSessionUser && isLoggedIn
}

// ✅ Clear session user (current tab only)
export const clearSessionUser = () => {
    try {
        const sessionId = getSessionId()
        const key = `user_${sessionId}`
        
        // ✅ Remove current tab's data only
        localStorage.removeItem(key)
        sessionStorage.removeItem('currentUser')
        sessionStorage.removeItem('isLoggedIn')
        
        // ✅ DO NOT remove sessionId - other tabs need it
        // sessionStorage.removeItem('sessionId')  // ❌ DON'T DO THIS
        
        console.log(`✅ Session cleared for tab: ${sessionId}`)
    } catch (e) {
        console.log("❌ Error clearing session:", e)
    }
}

// ✅ Clear ALL sessions (global logout)
export const clearAllSessions = () => {
    try {
        // ✅ Clear all user_* keys from localStorage
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
            if (key.startsWith('user_')) {
                localStorage.removeItem(key)
            }
        })
        
        // ✅ Clear all session storage
        sessionStorage.clear()
        
        console.log("✅ All sessions cleared")
    } catch (e) {
        console.log("❌ Error clearing all sessions:", e)
    }
}

// ✅ Get current user data (with validation)
export const getCurrentUser = () => {
    try {
        const user = getSessionUser()
        if (!user) return null
        
        // ✅ Validate that user has required fields
        if (!user._id || !user.email) {
            console.log("⚠️ Invalid user data, clearing session")
            clearSessionUser()
            return null
        }
        
        return user
    } catch (e) {
        console.log("❌ Error getting current user:", e)
        return null
    }
}