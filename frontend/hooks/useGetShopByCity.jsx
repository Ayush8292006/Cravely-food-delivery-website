import axios from 'axios'
import { useEffect, useRef, useState, useCallback } from 'react'
// ✅ Config (hooks -> root)
import { serverUrl } from '../config'
import { useDispatch, useSelector } from 'react-redux'
// ✅ Redux (hooks -> src/redux)
import { setShopsInMyCity } from '../src/redux/userSlice'

// ✅ Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

function useGetShopByCity() {
    const dispatch = useDispatch()
    // ✅ All hooks at top level (correct)
    const { currentCity, userData, shopsInMyCity, socket } = useSelector(state => state.user)
    const hasFetched = useRef(false)
    const retryCount = useRef(0)
    const previousCity = useRef(null)
    
    // ✅ State for loading and error
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [shopsCount, setShopsCount] = useState(0)

    // ✅ Delay function for retry
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

    // ✅ Fetch shops function (can be called manually)
    const fetchShops = useCallback(async (retryAttempt = 0) => {
        // ✅ Check if user is logged in
        if (!userData?._id) {
            console.log("⏳ No user logged in, skipping shops fetch")
            setIsLoading(false)
            return
        }

        // ✅ Check if city exists
        if (!currentCity) {
            console.log("⏳ No city available, skipping shops fetch")
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        setError(null)
        
        try {
            console.log(`🔍 Fetching shops for: ${currentCity} (Attempt ${retryAttempt + 1}/${MAX_RETRIES})`)
            
            const result = await axios.get(
                `${serverUrl}/api/shop/get-by-city/${encodeURIComponent(currentCity)}`,
                { withCredentials: true }
            )
            
            const shops = result.data || []
            const count = shops.length
            
            console.log(`✅ Shops found: ${count}`)
            
            dispatch(setShopsInMyCity(shops))
            setShopsCount(count)
            hasFetched.current = true
            retryCount.current = 0
            setIsLoading(false)
            
        } catch (error) {
            const status = error.response?.status
            const message = error.response?.data?.message || error.message
            
            console.log(`❌ Error: ${message}`)
            
            // ✅ Handle 404 gracefully (no shops in city)
            if (status === 404) {
                console.log(`ℹ️ No shops found for city: ${currentCity}`)
                dispatch(setShopsInMyCity([]))
                setShopsCount(0)
                hasFetched.current = true
                setIsLoading(false)
                return
            }
            
            // ✅ Handle 401 - User logged out
            if (status === 401) {
                console.log("❌ Unauthorized - User logged out")
                dispatch(setShopsInMyCity([]))
                setShopsCount(0)
                hasFetched.current = true
                setIsLoading(false)
                return
            }
            
            // ✅ Network errors - Retry logic
            if (retryAttempt < MAX_RETRIES - 1) {
                console.log(`⏳ Retrying... (${retryAttempt + 1}/${MAX_RETRIES})`)
                setError(`Network error, retrying... (${retryAttempt + 1}/${MAX_RETRIES})`)
                await delay(RETRY_DELAY * (retryAttempt + 1))
                return fetchShops(retryAttempt + 1)
            }
            
            // ✅ Max retries reached
            console.log("❌ Max retries reached")
            setError(message || "Failed to fetch shops")
            dispatch(setShopsInMyCity([]))
            setShopsCount(0)
            hasFetched.current = true
            setIsLoading(false)
        }
    }, [currentCity, userData?._id, dispatch])

    // ✅ Refresh function (manual trigger)
    const refreshShops = useCallback(() => {
        console.log("🔄 Manual refresh triggered")
        hasFetched.current = false
        retryCount.current = 0
        fetchShops()
    }, [fetchShops])

    // ✅ Socket listener for real-time shop updates
    useEffect(() => {
        if (!userData?._id || !socket) return

        const handleNewShop = (data) => {
            console.log("🏪 New shop registered:", data)
            // ✅ Check if shop is in current city
            if (data.city === currentCity) {
                // ✅ Refresh shops on new shop
                refreshShops()
            }
        }

        const handleShopUpdate = (data) => {
            console.log("🔄 Shop updated:", data)
            // ✅ Refresh shops on update
            refreshShops()
        }

        socket.on('newShop', handleNewShop)
        socket.on('shopUpdate', handleShopUpdate)

        return () => {
            socket.off('newShop', handleNewShop)
            socket.off('shopUpdate', handleShopUpdate)
        }
    }, [userData?._id, currentCity, refreshShops, socket])

    // ✅ Initial fetch
    useEffect(() => {
        // ✅ Check if user is logged in
        if (!userData?._id) {
            console.log("⏳ No user logged in, skipping shops fetch")
            hasFetched.current = false
            setIsLoading(false)
            return
        }

        // ✅ Check if city exists
        if (!currentCity) {
            console.log("⏳ No city available, skipping shops fetch")
            setIsLoading(false)
            return
        }

        // ✅ If city changed, reset fetch flag and clear data
        if (previousCity.current !== currentCity) {
            console.log(`🔄 City changed: ${previousCity.current} → ${currentCity}`)
            hasFetched.current = false
            retryCount.current = 0
            previousCity.current = currentCity
            // ✅ Clear old shops on city change
            dispatch(setShopsInMyCity([]))
            setShopsCount(0)
        }

        // ✅ Prevent multiple fetches
        if (hasFetched.current) {
            console.log("⏳ Shops already fetched, skipping")
            return
        }

        fetchShops()
    }, [currentCity, userData?._id, fetchShops, dispatch])

    // ✅ Reset fetch flag when user logs out
    useEffect(() => {
        if (!userData?._id) {
            hasFetched.current = false
            retryCount.current = 0
            previousCity.current = null
            setError(null)
            setShopsCount(0)
        }
    }, [userData?._id])

    // ✅ Return useful state and functions
    return {
        isLoading,
        error,
        shopsCount,
        isEmpty: shopsCount === 0 && !isLoading && hasFetched.current,
        shops: shopsInMyCity,
        refreshShops,
        refetch: refreshShops // Alias for convenience
    }
}

export default useGetShopByCity