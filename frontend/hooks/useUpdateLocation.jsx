import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../src/App'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentAddress, setCurrentCity, setCurrentState, setUserData } from '../src/redux/userSlice'
import { setAddress, setLocation } from '../src/redux/mapSlice'

function useUpdateLocation() {
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)

    useEffect(() => {
        if (!userData?._id) return

        const updateLocation = async (lat, lon) => {
            // ✅ VALIDATE COORDINATES BEFORE SENDING
            if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
                console.log("⏳ Invalid coordinates, skipping update")
                return
            }

            try {
                const result = await axios.post(`${serverUrl}/api/user/update-location`, 
                    { lat, lon },
                    { withCredentials: true }
                )
                console.log("✅ Location updated:", result.data)
            } catch (error) {
                if (error.response?.status === 400) {
                    console.log("⏳ Location not set yet, will retry...")
                } else {
                    console.log("❌ Location update error:", error.message)
                }
            }
        }

        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (pos) => {
                    const lat = pos.coords.latitude
                    const lon = pos.coords.longitude
                    
                    // ✅ Log coordinates for debugging
                    console.log("📍 Got location:", { lat, lon })
                    
                    updateLocation(lat, lon)
                },
                (error) => {
                    console.log("📍 Geolocation error:", error.message)
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            )
        }
    }, [userData?._id])
}

export default useUpdateLocation