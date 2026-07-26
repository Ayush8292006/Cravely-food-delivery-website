import axios from 'axios'
import { useEffect, useRef } from 'react'  // ✅ ADD useRef
import { serverUrl } from '../src/App'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentAddress, setCurrentCity, setCurrentState } from '../src/redux/userSlice'
import { setAddress, setLocation } from '../src/redux/mapSlice'

function useGetCity() {
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)
    const apiKey = import.meta.env.VITE_GEOAPIKEY
    const hasFetched = useRef(false)  // ✅ ADD THIS

    useEffect(() => {
        // ✅ Check if user is logged in
        if (!userData?._id) {
            console.log("⏳ No user logged in, skipping location")
            return
        }

        // ✅ Prevent multiple fetches
        if (hasFetched.current) {
            console.log("⏳ Location already fetched, skipping")
            return
        }

        if (!navigator.geolocation) {
            console.log("❌ Geolocation not supported")
            dispatch(setCurrentCity("Patna"))
            dispatch(setCurrentState("Bihar"))
            hasFetched.current = true
            return
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const latitude = position.coords.latitude
                    const longitude = position.coords.longitude
                    
                    console.log("📍 Position:", { latitude, longitude })
                    dispatch(setLocation({ lat: latitude, lon: longitude }))
                    
                    const result = await axios.get(
                        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`,
                        { withCredentials: false }
                    )

                    console.log("✅ Geoapify Response:", result.data)

                    const location = result?.data?.results?.[0]

                    if (location) {
                        const city = location.city || 
                                    location.county || 
                                    location.state_district || 
                                    location.state || 
                                    "Patna"
                        const state = location.state || "Bihar"

                        console.log("🏙️ City:", city)
                        console.log("🏛️ State:", state)
                        
                        dispatch(setCurrentCity(city))
                        dispatch(setCurrentState(state))
                        
                        const address = location.address_line1 + 
                            (location.address_line2 ? ", " + location.address_line2 : "")
                        
                        dispatch(setCurrentAddress(address))
                        dispatch(setAddress(address))
                    } else {
                        console.log("⚠️ No location data found, using default")
                        dispatch(setCurrentCity("Patna"))
                        dispatch(setCurrentState("Bihar"))
                    }
                    hasFetched.current = true
                } catch (error) {
                    console.log("❌ Geoapify Error:", error.message)
                    const lat = position?.coords?.latitude || 25.6191
                    const lon = position?.coords?.longitude || 85.1335
                    
                    let city = "Patna"
                    let state = "Bihar"
                    
                    if (lat > 20 && lat < 30 && lon > 80 && lon < 90) {
                        city = "Patna"
                        state = "Bihar"
                    }
                    
                    dispatch(setCurrentCity(city))
                    dispatch(setCurrentState(state))
                    hasFetched.current = true
                }
            },
            (error) => {
                console.log("❌ Geolocation Error:", error.message)
                dispatch(setCurrentCity("Patna"))
                dispatch(setCurrentState("Bihar"))
                hasFetched.current = true
            }
        )
    }, [userData?._id, dispatch])  // ✅ Only run when user changes

    // ✅ Reset fetch flag when user logs out
    useEffect(() => {
        if (!userData?._id) {
            hasFetched.current = false
        }
    }, [userData?._id])

    return null
}

export default useGetCity