import axios from 'axios'
import { useEffect, useRef, useState, useCallback } from 'react'
// ✅ FIXED: Correct import path
import { serverUrl } from '../config'
import { useDispatch, useSelector } from 'react-redux'
import { setMyOrders } from '../src/redux/userSlice'

// ✅ Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

function useGetMyOrders() {
    const dispatch = useDispatch()
    const { userData, socket, myOrders } = useSelector(state => state.user)
    const hasFetched = useRef(false)
    const retryCount = useRef(0)
    
    // ✅ State for loading and error
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [ordersCount, setOrdersCount] = useState(0)

    // ✅ Delay function for retry
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

    // ✅ Fetch orders function (can be called manually)
    const fetchOrders = useCallback(async (retryAttempt = 0) => {
        // ✅ Check if user is logged in
        if (!userData?._id) {
            console.log("⏳ No user logged in, skipping orders fetch")
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        setError(null)
        
        try {
            console.log(`🔍 Fetching orders for user: ${userData._id} (Attempt ${retryAttempt + 1}/${MAX_RETRIES})`)
            
            const result = await axios.get(
                `${serverUrl}/api/order/my-orders`,
                { withCredentials: true }
            )
            
            const orders = result.data || []
            const count = orders.length
            
            console.log(`✅ Orders found: ${count} orders`)
            
            dispatch(setMyOrders(orders))
            setOrdersCount(count)
            hasFetched.current = true
            retryCount.current = 0
            setIsLoading(false)
            
        } catch (error) {
            const status = error.response?.status
            const message = error.response?.data?.message || error.message
            
            console.log(`❌ Error: ${message}`)
            
            // ✅ Handle 404 gracefully (no orders)
            if (status === 404) {
                console.log("ℹ️ No orders found (404)")
                dispatch(setMyOrders([]))
                setOrdersCount(0)
                hasFetched.current = true
                setIsLoading(false)
                return
            }
            
            // ✅ Handle 401 - User logged out
            if (status === 401) {
                console.log("❌ Unauthorized - User logged out")
                dispatch(setMyOrders([]))
                setOrdersCount(0)
                hasFetched.current = true
                setIsLoading(false)
                return
            }
            
            // ✅ Network errors - Retry logic
            if (retryAttempt < MAX_RETRIES - 1) {
                console.log(`⏳ Retrying... (${retryAttempt + 1}/${MAX_RETRIES})`)
                setError(`Network error, retrying... (${retryAttempt + 1}/${MAX_RETRIES})`)
                await delay(RETRY_DELAY * (retryAttempt + 1))
                return fetchOrders(retryAttempt + 1)
            }
            
            // ✅ Max retries reached
            console.log("❌ Max retries reached")
            setError(message || "Failed to fetch orders")
            dispatch(setMyOrders([]))
            setOrdersCount(0)
            hasFetched.current = true
            setIsLoading(false)
        }
    }, [userData?._id, dispatch])

    // ✅ Refresh function (manual trigger)
    const refreshOrders = useCallback(() => {
        console.log("🔄 Manual refresh triggered")
        hasFetched.current = false
        retryCount.current = 0
        fetchOrders()
    }, [fetchOrders])

    // ✅ Socket listener for real-time order updates
    useEffect(() => {
        if (!socket || !userData?._id) return

        const handleNewOrder = (data) => {
            console.log("📦 New order received:", data)
            // ✅ Refresh orders on new order
            refreshOrders()
        }

        const handleStatusUpdate = ({ orderId, shopId, status, userId }) => {
            if (userId === userData?._id) {
                console.log(`🔄 Order ${orderId} status updated to: ${status}`)
                // ✅ Refresh orders on status update
                refreshOrders()
            }
        }

        socket.on('newOrder', handleNewOrder)
        socket.on('update-status', handleStatusUpdate)

        return () => {
            socket.off('newOrder', handleNewOrder)
            socket.off('update-status', handleStatusUpdate)
        }
    }, [socket, userData?._id, refreshOrders])

    // ✅ Initial fetch
    useEffect(() => {
        // ✅ Check if user is logged in
        if (!userData?._id) {
            console.log("⏳ No user logged in, skipping orders fetch")
            hasFetched.current = false
            setIsLoading(false)
            return
        }

        // ✅ Prevent multiple fetches
        if (hasFetched.current) {
            console.log("⏳ Orders already fetched, skipping")
            return
        }

        fetchOrders()
    }, [userData?._id, fetchOrders])

    // ✅ Reset fetch flag when user logs out
    useEffect(() => {
        if (!userData?._id) {
            hasFetched.current = false
            retryCount.current = 0
            setError(null)
            setOrdersCount(0)
        }
    }, [userData?._id])

    // ✅ Return useful state and functions
    return {
        isLoading,
        error,
        ordersCount,
        isEmpty: ordersCount === 0 && !isLoading && hasFetched.current,
        orders: myOrders,
        refreshOrders,
        refetch: refreshOrders // Alias for convenience
    }
}

export default useGetMyOrders