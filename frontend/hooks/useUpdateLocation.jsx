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
        // ✅ Check if user is logged in
        if (!userData?._id) return

        const updateLocation = async (lat, lon) => {
            try {
                const result = await axios.post(`${serverUrl}/api/user/update-location`, 
                    { lat, lon },
                    { withCredentials: true }
                )
                console.log("✅ Location updated:", result.data)
            } catch (error) {
                // ✅ Ignore 400 error - user location might not be set yet
                if (error.response?.status === 400) {
                    console.log("⏳ Location not set yet, will retry...")
                } else {
                    console.log("❌ Location update error:", error.message)
                }
            }
        }

        // ✅ Only run if geolocation is available
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (pos) => {
                    updateLocation(pos.coords.latitude, pos.coords.longitude)
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