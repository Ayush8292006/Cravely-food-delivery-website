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
    const sessionId = getSessionId()
    const key = `user_${sessionId}`
    localStorage.setItem(key, JSON.stringify(userData))
    sessionStorage.setItem('currentUser', JSON.stringify(userData))
}

// ✅ Get user data for current session
export const getSessionUser = () => {
    const sessionId = getSessionId()
    const key = `user_${sessionId}`
    
    // First check sessionStorage (faster)
    const sessionData = sessionStorage.getItem('currentUser')
    if (sessionData) {
        return JSON.parse(sessionData)
    }
    
    // Then check localStorage
    const localData = localStorage.getItem(key)
    if (localData) {
        return JSON.parse(localData)
    }
    
    return null
}

// ✅ Clear session user
export const clearSessionUser = () => {
    const sessionId = getSessionId()
    const key = `user_${sessionId}`
    localStorage.removeItem(key)
    sessionStorage.removeItem('currentUser')
    sessionStorage.removeItem('sessionId')
}

// ✅ Check if user is logged in this session
export const isSessionActive = () => {
    return !!getSessionUser()
}