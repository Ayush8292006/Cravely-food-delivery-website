import axios from "axios"
import { useEffect, useRef } from "react"
import { serverUrl } from "../src/App"
import { useDispatch, useSelector } from "react-redux"
import { setUserData } from "../src/redux/userSlice"

function useGetCurrentUser() {
    const dispatch = useDispatch()
    const { userData } = useSelector((state) => state.user)
    const hasFetched = useRef(false)

    useEffect(() => {
        // ✅ If user already exists in Redux, skip fetch
        if (userData && userData._id) {
            console.log("✅ User already in Redux:", userData.fullName)
            return
        }

        // ✅ Check localStorage first
        const stored = localStorage.getItem('userData')
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                if (parsed && parsed._id) {
                    console.log("✅ User from localStorage:", parsed.fullName)
                    dispatch(setUserData(parsed))
                    hasFetched.current = true
                    return
                }
            } catch (e) {
                console.log("⚠️ Invalid localStorage data, removing")
                localStorage.removeItem('userData')
            }
        }

        // ✅ Prevent multiple fetches
        if (hasFetched.current) {
            console.log("⏳ Already fetched once, skipping")
            return
        }

        const fetchUser = async () => {
            try {
                console.log("🔍 Fetching user from API...")
                const result = await axios.get(
                    `${serverUrl}/api/user/current`,
                    { withCredentials: true }
                )
                
                if (result.data && result.data._id) {
                    console.log("✅ User fetched:", result.data.fullName)
                    dispatch(setUserData(result.data))
                    localStorage.setItem('userData', JSON.stringify(result.data))
                } else {
                    console.log("⚠️ No user data in response")
                    localStorage.removeItem('userData')
                    dispatch(setUserData(null))
                }
                hasFetched.current = true
            } catch (error) {
                // ✅ Handle 401/403 errors properly
                if (error.response?.status === 401 || error.response?.status === 403) {
                    console.log("❌ Unauthorized - User logged out")
                    localStorage.removeItem('userData')
                    dispatch(setUserData(null))
                } else {
                    console.log("❌ Fetch user error:", error.response?.data || error.message)
                }
                hasFetched.current = true
            }
        }

        fetchUser()
    }, [dispatch, userData])

    // ✅ Reset fetch flag when user logs out
    useEffect(() => {
        if (!userData?._id) {
            hasFetched.current = false
        }
    }, [userData])

    return userData
}

export default useGetCurrentUser