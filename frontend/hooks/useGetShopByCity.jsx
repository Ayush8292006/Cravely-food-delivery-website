import axios from 'axios'
import { useEffect, useRef } from 'react'  // ✅ ADD useRef
import { serverUrl } from '../src/App'
import { useDispatch, useSelector } from 'react-redux'
import { setShopsInMyCity } from '../src/redux/userSlice'

function useGetShopByCity() {
    const dispatch = useDispatch()
    const { currentCity, userData } = useSelector(state => state.user)
    const hasFetched = useRef(false)  // ✅ ADD THIS

    useEffect(() => {
        // ✅ Check if user is logged in
        if (!userData?._id) {
            console.log("⏳ No user logged in, skipping shops fetch")
            hasFetched.current = false  // ✅ Reset on logout
            return
        }

        // ✅ Check if city exists
        if (!currentCity) {
            console.log("⏳ No city available, skipping shops fetch")
            return
        }

        // ✅ Prevent multiple fetches
        if (hasFetched.current) {
            console.log("⏳ Shops already fetched, skipping")
            return
        }

        const fetchShops = async () => {
            try {
                console.log("🔍 Fetching shops for:", currentCity)
                
                const result = await axios.get(
                    `${serverUrl}/api/shop/get-by-city/${encodeURIComponent(currentCity)}`,
                    { withCredentials: true }
                )
                
                console.log("✅ Shops found:", result.data?.length || 0)
                dispatch(setShopsInMyCity(result.data))
                hasFetched.current = true  // ✅ Mark as fetched
            } catch (error) {
                console.log("❌ Error:", error.response?.data || error.message)
                // ✅ Even on error, mark as fetched to prevent retry
                hasFetched.current = true
            }
        }
        fetchShops()
    }, [currentCity, userData?._id, dispatch])  // ✅ Added dispatch

    // ✅ Reset fetch flag when user logs out or city changes
    useEffect(() => {
        if (!userData?._id || !currentCity) {
            hasFetched.current = false
        }
    }, [userData?._id, currentCity])

    return null
}

export default useGetShopByCity