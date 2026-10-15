import axios from 'axios'
import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentAddress, setCurrentCity, setCurrentState } from '../src/redux/userSlice'
import { setAddress, setLocation } from '../src/redux/mapSlice'

function useGetCity() {
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)
    const apiKey = import.meta.env.VITE_GEOAPIKEY
    const hasFetched = useRef(false)

    // ✅ Get location from IP as fallback
    const getLocationFromIP = async () => {
        try {
            const response = await axios.get('https://ipapi.co/json/', {
                withCredentials: false
            })
            const data = response.data
            if (data.city && data.region) {
                return {
                    city: data.city,
                    state: data.region,
                    lat: data.latitude,
                    lon: data.longitude,
                    address: `${data.city}, ${data.region}, ${data.country_name}`
                }
            }
            return null
        } catch (error) {
            console.log('⚠️ IP geolocation failed:', error.message)
            return null
        }
    }

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

        // ✅ Check if API key exists
        if (!apiKey) {
            console.log("⚠️ No Geoapify API key found, using default location")
            dispatch(setCurrentCity("Patna"))
            dispatch(setCurrentState("Bihar"))
            hasFetched.current = true
            return
        }

        if (!navigator.geolocation) {
            console.log("❌ Geolocation not supported, trying IP fallback...")
            getLocationFromIP().then(location => {
                if (location) {
                    dispatch(setCurrentCity(location.city))
                    dispatch(setCurrentState(location.state))
                    dispatch(setAddress(location.address))
                    if (location.lat && location.lon) {
                        dispatch(setLocation({ lat: location.lat, lon: location.lon }))
                    }
                } else {
                    dispatch(setCurrentCity("Patna"))
                    dispatch(setCurrentState("Bihar"))
                }
                hasFetched.current = true
            })
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
                        console.log("⚠️ No location data found, using IP fallback...")
                        const ipLocation = await getLocationFromIP()
                        if (ipLocation) {
                            dispatch(setCurrentCity(ipLocation.city))
                            dispatch(setCurrentState(ipLocation.state))
                            dispatch(setAddress(ipLocation.address))
                            if (ipLocation.lat && ipLocation.lon) {
                                dispatch(setLocation({ lat: ipLocation.lat, lon: ipLocation.lon }))
                            }
                        } else {
                            dispatch(setCurrentCity("Patna"))
                            dispatch(setCurrentState("Bihar"))
                        }
                    }
                    hasFetched.current = true
                } catch (error) {
                    console.log("❌ Geoapify Error:", error.message)
                    
                    // ✅ Try IP fallback on API error
                    const ipLocation = await getLocationFromIP()
                    if (ipLocation) {
                        dispatch(setCurrentCity(ipLocation.city))
                        dispatch(setCurrentState(ipLocation.state))
                        dispatch(setAddress(ipLocation.address))
                        if (ipLocation.lat && ipLocation.lon) {
                            dispatch(setLocation({ lat: ipLocation.lat, lon: ipLocation.lon }))
                        }
                    } else {
                        // ✅ Use coordinates-based detection
                        const lat = position?.coords?.latitude || 25.6191
                        const lon = position?.coords?.longitude || 85.1335
                        
                        let city = "Patna"
                        let state = "Bihar"
                        
                        // ✅ Basic India region detection
                        if (lat > 28 && lat < 32 && lon > 76 && lon < 80) {
                            city = "Delhi"
                            state = "Delhi"
                        } else if (lat > 18 && lat < 22 && lon > 72 && lon < 75) {
                            city = "Mumbai"
                            state = "Maharashtra"
                        } else if (lat > 12 && lat < 14 && lon > 77 && lon < 78) {
                            city = "Bangalore"
                            state = "Karnataka"
                        } else if (lat > 22 && lat < 23 && lon > 88 && lon < 89) {
                            city = "Kolkata"
                            state = "West Bengal"
                        } else if (lat > 13 && lat < 13.5 && lon > 80 && lon < 80.5) {
                            city = "Chennai"
                            state = "Tamil Nadu"
                        } else if (lat > 17 && lat < 18 && lon > 78 && lon < 79) {
                            city = "Hyderabad"
                            state = "Telangana"
                        }
                        
                        dispatch(setCurrentCity(city))
                        dispatch(setCurrentState(state))
                    }
                    hasFetched.current = true
                }
            },
            (error) => {
                console.log("❌ Geolocation Error:", error.message)
                
                // ✅ Try IP fallback on geolocation error
                getLocationFromIP().then(location => {
                    if (location) {
                        dispatch(setCurrentCity(location.city))
                        dispatch(setCurrentState(location.state))
                        dispatch(setAddress(location.address))
                        if (location.lat && location.lon) {
                            dispatch(setLocation({ lat: location.lat, lon: location.lon }))
                        }
                    } else {
                        dispatch(setCurrentCity("Patna"))
                        dispatch(setCurrentState("Bihar"))
                    }
                    hasFetched.current = true
                })
            }
        )
    }, [userData?._id, dispatch])

    // ✅ Reset fetch flag when user logs out
    useEffect(() => {
        if (!userData?._id) {
            hasFetched.current = false
        }
    }, [userData?._id])

    return null
}

export default useGetCity