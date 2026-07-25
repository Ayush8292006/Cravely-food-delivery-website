import axios from "axios"
import { useEffect, useRef } from "react"
import { serverUrl } from "../src/App"
import { useDispatch, useSelector } from "react-redux"
import { setUserData } from "../src/redux/userSlice"
import { getSessionUser, setSessionUser, clearSessionUser } from "../src/utils/auth"  // ✅ ADD THIS

function useGetCurrentUser() {
    const dispatch = useDispatch()
    const { userData } = useSelector((state) => state.user)
    const hasFetched = useRef(false)

    useEffect(() => {
        // ✅ Check sessionStorage first (tab-specific)
        const sessionUser = getSessionUser()  // ✅ ADD THIS
        if (sessionUser && sessionUser._id) {
            console.log("✅ User from session:", sessionUser.fullName)
            dispatch(setUserData(sessionUser))
            hasFetched.current = true
            return
        }

        // ✅ Check localStorage (fallback)
        const stored = localStorage.getItem('userData')
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                if (parsed && parsed._id) {
                    // ✅ Store in session for this tab
                    setSessionUser(parsed)  // ✅ ADD THIS
                    dispatch(setUserData(parsed))
                    hasFetched.current = true
                    return
                }
            } catch (e) {
                localStorage.removeItem('userData')
            }
        }

        if (hasFetched.current) {
            console.log("⏳ Already fetched once, skipping")
            return
        }

        const fetchUser = async () => {
            try {
                console.log("🔍 Fetching user...")
                const result = await axios.get(
                    `${serverUrl}/api/user/current`,
                    { withCredentials: true }
                )
                if (result.data && result.data._id) {
                    console.log("✅ User fetched:", result.data.fullName)
                    
                    // ✅ Save in session storage (tab-specific)
                    setSessionUser(result.data)  // ✅ ADD THIS
                    
                    // ✅ Also save in localStorage (for other tabs)
                    localStorage.setItem('userData', JSON.stringify(result.data))
                    
                    dispatch(setUserData(result.data))
                }
                hasFetched.current = true
            } catch (error) {
                console.log("❌ Fetch user error:", error.response?.data || error.message)
                hasFetched.current = true
                clearSessionUser()  // ✅ ADD THIS
                localStorage.removeItem('userData')
                dispatch(setUserData(null))
            }
        }

        fetchUser()
    }, [dispatch, userData])

    return userData
}

export default useGetCurrentUser