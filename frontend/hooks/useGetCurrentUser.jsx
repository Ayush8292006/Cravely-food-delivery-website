import axios from "axios"
import { useEffect, useRef, useState } from "react"
import { serverUrl } from '../config'
import { useDispatch, useSelector } from "react-redux"
import { setUserData } from "../src/redux/userSlice"

// ✅ Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

function useGetCurrentUser() {
    const dispatch = useDispatch()
    const { userData, socket } = useSelector((state) => state.user)
    const hasFetched = useRef(false)
    const retryCount = useRef(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    // ✅ Check if user data is valid
    const isValidUser = (user) => {
        return user && user._id && user.fullName
    }

    // ✅ Delay function for retry
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

    useEffect(() => {
        // ✅ If user already exists in Redux, skip fetch
        if (isValidUser(userData)) {
            console.log("✅ User already in Redux:", userData.fullName)
            setIsLoading(false)
            return
        }

        // ✅ Check localStorage first
        const stored = localStorage.getItem('userData')
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                if (isValidUser(parsed)) {
                    console.log("✅ User from localStorage:", parsed.fullName)
                    dispatch(setUserData(parsed))
                    setIsLoading(false)
                    hasFetched.current = true
                    return
                } else {
                    localStorage.removeItem('userData')
                }
            } catch (e) {
                console.log("⚠️ Invalid localStorage data, removing")
                localStorage.removeItem('userData')
            }
        }

        // ✅ Prevent multiple fetches
        if (hasFetched.current) {
            console.log("⏳ Already fetched once, skipping")
            setIsLoading(false)
            return
        }

        const fetchUser = async (retryAttempt = 0) => {
            try {
                console.log(`🔍 Fetching user from API... (Attempt ${retryAttempt + 1}/${MAX_RETRIES})`)
                setError(null)
                
                const result = await axios.get(
                    `${serverUrl}/api/user/current`,
                    { withCredentials: true }
                )
                
                if (result.data && result.data._id) {
                    console.log("✅ User fetched:", result.data.fullName)
                    dispatch(setUserData(result.data))
                    localStorage.setItem('userData', JSON.stringify(result.data))
                    hasFetched.current = true
                    setIsLoading(false)
                    retryCount.current = 0
                } else {
                    console.log("⚠️ No user data in response")
                    localStorage.removeItem('userData')
                    dispatch(setUserData(null))
                    hasFetched.current = true
                    setIsLoading(false)
                }
            } catch (error) {
                const status = error.response?.status
                const message = error.response?.data?.message || error.message
                
                // ✅ Handle 401/403 errors - User logged out
                if (status === 401 || status === 403) {
                    console.log("❌ Unauthorized - User logged out")
                    localStorage.removeItem('userData')
                    dispatch(setUserData(null))
                    
                    // ✅ Disconnect socket on logout
                    if (socket) {
                        socket.disconnect()
                    }
                    
                    hasFetched.current = true
                    setIsLoading(false)
                    return
                }

                // ✅ Network errors - Retry logic
                if (retryAttempt < MAX_RETRIES - 1) {
                    console.log(`⏳ Retrying... (${retryAttempt + 1}/${MAX_RETRIES})`)
                    setError(`Network error, retrying... (${retryAttempt + 1}/${MAX_RETRIES})`)
                    await delay(RETRY_DELAY * (retryAttempt + 1)) // Exponential backoff
                    return fetchUser(retryAttempt + 1)
                }

                // ✅ Max retries reached
                console.log("❌ Max retries reached:", message)
                setError(message || "Failed to fetch user data")
                localStorage.removeItem('userData')
                dispatch(setUserData(null))
                hasFetched.current = true
                setIsLoading(false)
            }
        }

        fetchUser()
    }, [dispatch, userData, socket])

    // ✅ Reset fetch flag when user logs out
    useEffect(() => {
        if (!userData?._id) {
            hasFetched.current = false
            retryCount.current = 0
            setError(null)
        }
    }, [userData])

    // ✅ Return userData with loading state
    return { userData, isLoading, error }
}

export default useGetCurrentUser