import axios from 'axios'
import React, { useEffect, useRef } from 'react'  // ✅ ADD useRef
import { serverUrl } from '../src/App'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentAddress, setCurrentCity, setCurrentState, setUserData } from '../src/redux/userSlice'
import { setAddress, setLocation } from '../src/redux/mapSlice'

function useUpdateLocation() {
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)
    const watchIdRef = useRef(null)  // ✅ ADD THIS - Store watch ID
    const hasUpdated = useRef(false)  // ✅ ADD THIS - Prevent multiple updates

    useEffect(() => {
        // ✅ Check if user is logged in
        if (!userData?._id) {
            console.log("⏳ No user logged in, stopping location updates")
            // ✅ Clear watch if exists
            if (watchIdRef.current) {
                navigator.geolocation?.clearWatch(watchIdRef.current)
                watchIdRef.current = null
            }
            hasUpdated.current = false
            return
        }

        // ✅ Prevent multiple watchers
        if (watchIdRef.current) {
            console.log("⏳ Location watcher already active")
            return
        }

        // ✅ Check if geolocation is available
        if (!navigator.geolocation) {
            console.log("❌ Geolocation not supported")
            return
        }

        const updateLocation = async (lat, lon) => {
            // ✅ Validate coordinates
            if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
                console.log("⏳ Invalid coordinates, skipping update")
                return
            }

            // ✅ Prevent duplicate updates
            if (hasUpdated.current) {
                console.log("⏳ Location already updated, skipping")
                return
            }

            try {
                console.log("📍 Updating location:", { lat, lon })
                const result = await axios.post(`${serverUrl}/api/user/update-location`, 
                    { lat, lon },
                    { withCredentials: true }
                )
                console.log("✅ Location updated:", result.data)
                hasUpdated.current = true
            } catch (error) {
                if (error.response?.status === 400) {
                    console.log("⏳ Location not set yet, will retry...")
                } else if (error.response?.status === 401) {
                    console.log("❌ Unauthorized - User logged out")
                    // ✅ Stop watching if unauthorized
                    if (watchIdRef.current) {
                        navigator.geolocation?.clearWatch(watchIdRef.current)
                        watchIdRef.current = null
                    }
                } else {
                    console.log("❌ Location update error:", error.message)
                }
            }
        }

        // ✅ Start watching location
        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const lat = pos.coords.latitude
                const lon = pos.coords.longitude
                
                console.log("📍 Got location:", { lat, lon })
                updateLocation(lat, lon)
            },
            (error) => {
                console.log("📍 Geolocation error:", error.message)
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        )

        watchIdRef.current = watchId
        console.log("✅ Location watcher started:", watchId)

        // ✅ Cleanup on unmount or user change
        return () => {
            if (watchIdRef.current) {
                console.log("🔄 Cleaning up location watcher:", watchIdRef.current)
                navigator.geolocation?.clearWatch(watchIdRef.current)
                watchIdRef.current = null
                hasUpdated.current = false
            }
        }
    }, [userData?._id])  // ✅ Only run when user changes

    // ✅ Reset update flag when user logs out
    useEffect(() => {
        if (!userData?._id) {
            hasUpdated.current = false
        }
    }, [userData?._id])

    return null
}

export default useUpdateLocation