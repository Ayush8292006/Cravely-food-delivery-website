import axios from 'axios'
import React, { useEffect, useRef } from 'react'  // ✅ ADD useRef
import { serverUrl } from '../src/App'
import { useDispatch, useSelector } from 'react-redux'
import { setMyShopData } from '../src/redux/ownerSlice'

function useGetMyShop() {
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)
    const hasFetched = useRef(false)  // ✅ ADD THIS

    useEffect(() => {
        // ✅ Check if user is logged in
        if (!userData?._id) {
            console.log("⏳ No user logged in, skipping shop fetch")
            hasFetched.current = false  // ✅ Reset on logout
            return
        }

        // ✅ Prevent multiple fetches
        if (hasFetched.current) {
            console.log("⏳ Shop already fetched, skipping")
            return
        }

        const fetchShop = async () => {
            try {
                console.log("🔍 Fetching shop for user:", userData._id)
                const result = await axios.get(`${serverUrl}/api/shop/get-my`,
                    { withCredentials: true }
                )
                
                if (result.data) {
                    console.log("✅ Shop found:", result.data.name || 'Shop data received')
                    dispatch(setMyShopData(result.data))
                } else {
                    console.log("ℹ️ No shop found for this user")
                    dispatch(setMyShopData(null))
                }
                hasFetched.current = true
            } catch (error) {
                // ✅ Handle 404 gracefully (user is not an owner or has no shop)
                if (error.response?.status === 404) {
                    console.log("ℹ️ No shop found for this user (404)")
                    dispatch(setMyShopData(null))
                } else {
                    console.log("❌ Shop fetch error:", error.response?.data || error.message)
                }
                hasFetched.current = true
            }
        }
        fetchShop()
    }, [userData?._id, dispatch])  // ✅ Added dispatch as dependency

    // ✅ Reset fetch flag when user logs out
    useEffect(() => {
        if (!userData?._id) {
            hasFetched.current = false
        }
    }, [userData?._id])

    return null
}

export default useGetMyShop