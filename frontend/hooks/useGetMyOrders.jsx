import axios from 'axios'
import React, { useEffect, useRef } from 'react'  // ✅ ADD useRef
import { serverUrl } from '../src/App'
import { useDispatch, useSelector } from 'react-redux'
import { setMyOrders } from '../src/redux/userSlice'

function useGetMyOrders() {
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)
    const hasFetched = useRef(false)  // ✅ ADD THIS

    useEffect(() => {
        // ✅ Check if user is logged in
        if (!userData?._id) {
            console.log("⏳ No user logged in, skipping orders fetch")
            hasFetched.current = false  // ✅ Reset on logout
            return
        }

        // ✅ Prevent multiple fetches
        if (hasFetched.current) {
            console.log("⏳ Orders already fetched, skipping")
            return
        }

        const fetchOrders = async () => {
            try {
                console.log("🔍 Fetching orders for user:", userData._id)
                const result = await axios.get(`${serverUrl}/api/order/my-orders`,
                    { withCredentials: true }
                )
                
                if (result.data) {
                    console.log("✅ Orders found:", result.data.length || 0, "orders")
                    dispatch(setMyOrders(result.data))
                } else {
                    console.log("ℹ️ No orders found")
                    dispatch(setMyOrders([]))
                }
                hasFetched.current = true
            } catch (error) {
                // ✅ Handle 404 gracefully (no orders)
                if (error.response?.status === 404) {
                    console.log("ℹ️ No orders found (404)")
                    dispatch(setMyOrders([]))
                } else if (error.response?.status === 401) {
                    console.log("❌ Unauthorized - User logged out")
                    dispatch(setMyOrders([]))
                } else {
                    console.log("❌ Orders fetch error:", error.response?.data || error.message)
                    dispatch(setMyOrders([]))
                }
                hasFetched.current = true
            }
        }
        fetchOrders()
    }, [userData?._id, dispatch])  // ✅ Added dispatch as dependency

    // ✅ Reset fetch flag when user logs out
    useEffect(() => {
        if (!userData?._id) {
            hasFetched.current = false
        }
    }, [userData?._id])

    return null
}

export default useGetMyOrders