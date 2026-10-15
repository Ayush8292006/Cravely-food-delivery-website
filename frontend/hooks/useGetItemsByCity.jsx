import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { serverUrl } from '../config'
import { useDispatch, useSelector } from 'react-redux'
import { setItemsInMyCity } from '../src/redux/userSlice'

// ✅ Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

function useGetItemsByCity() {
    const dispatch = useDispatch()
    const { currentCity, userData, itemsInMyCity } = useSelector(state => state.user)
    const hasFetched = useRef(false)
    const retryCount = useRef(0)
    const previousCity = useRef(null)
    
    // ✅ State for loading and error
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [itemsCount, setItemsCount] = useState(0)

    // ✅ Delay function for retry
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

    useEffect(() => {
        // ✅ Check if user is logged in
        if (!userData?._id) {
            console.log("⏳ No user logged in, skipping items fetch")
            hasFetched.current = false
            setIsLoading(false)
            return
        }

        // ✅ Check if city exists
        if (!currentCity) {
            console.log("⏳ No city available, skipping items fetch")
            setIsLoading(false)
            return
        }

        // ✅ If city changed, reset fetch flag
        if (previousCity.current !== currentCity) {
            console.log(`🔄 City changed: ${previousCity.current} → ${currentCity.current}`)
            hasFetched.current = false
            retryCount.current = 0
            previousCity.current = currentCity
            // ✅ Clear old items on city change
            dispatch(setItemsInMyCity([]))
        }

        // ✅ Prevent multiple fetches
        if (hasFetched.current) {
            console.log("⏳ Items already fetched, skipping")
            return
        }

        const fetchItems = async (retryAttempt = 0) => {
            setIsLoading(true)
            setError(null)
            
            try {
                console.log(`🔍 Fetching items for: ${currentCity} (Attempt ${retryAttempt + 1}/${MAX_RETRIES})`)
                
                const result = await axios.get(
                    `${serverUrl}/api/item/get-by-city/${encodeURIComponent(currentCity)}`,
                    { withCredentials: true }
                )
                
                const items = result.data || []
                const count = items.length
                
                console.log(`✅ Items found: ${count}`)
                
                dispatch(setItemsInMyCity(items))
                setItemsCount(count)
                hasFetched.current = true
                retryCount.current = 0
                setIsLoading(false)
                
            } catch (error) {
                const status = error.response?.status
                const message = error.response?.data?.message || error.message
                
                console.log(`❌ Error: ${message}`)
                
                // ✅ Network errors - Retry logic
                if (status === 404) {
                    // ✅ City not found - no items
                    console.log(`⚠️ No items found for city: ${currentCity}`)
                    dispatch(setItemsInMyCity([]))
                    setItemsCount(0)
                    hasFetched.current = true
                    setIsLoading(false)
                    return
                }
                
                if (retryAttempt < MAX_RETRIES - 1) {
                    console.log(`⏳ Retrying... (${retryAttempt + 1}/${MAX_RETRIES})`)
                    setError(`Network error, retrying... (${retryAttempt + 1}/${MAX_RETRIES})`)
                    await delay(RETRY_DELAY * (retryAttempt + 1))
                    return fetchItems(retryAttempt + 1)
                }
                
                // ✅ Max retries reached
                console.log("❌ Max retries reached")
                setError(message || "Failed to fetch items")
                dispatch(setItemsInMyCity([]))
                setItemsCount(0)
                hasFetched.current = true
                setIsLoading(false)
            }
        }

        fetchItems()

        // ✅ Cleanup: reset loading on unmount
        return () => {
            setIsLoading(false)
        }
    }, [currentCity, userData?._id, dispatch])

    // ✅ Reset fetch flag when user logs out
    useEffect(() => {
        if (!userData?._id) {
            hasFetched.current = false
            retryCount.current = 0
            previousCity.current = null
            setError(null)
            setItemsCount(0)
        }
    }, [userData?._id])

    // ✅ Return useful state
    return {
        isLoading,
        error,
        itemsCount,
        isEmpty: itemsCount === 0 && !isLoading && hasFetched.current,
        items: itemsInMyCity
    }
}

export default useGetItemsByCity