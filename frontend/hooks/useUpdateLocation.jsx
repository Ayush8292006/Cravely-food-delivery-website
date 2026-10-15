import axios from 'axios'
import { useEffect, useRef, useState, useCallback } from 'react'
// ✅ Config (hooks -> root)
import { serverUrl } from '../config'
import { useDispatch, useSelector } from 'react-redux'
// ✅ FIXED: Redux imports (hooks -> src/redux)
import { setCurrentAddress, setCurrentCity, setCurrentState, setUserData } from '../src/redux/userSlice'  // hooks -> src/redux
import { setAddress, setLocation } from '../src/redux/mapSlice'  // hooks -> src/redux
import { toast } from 'react-toastify'

// ... rest of the code

// ✅ Configuration
const UPDATE_INTERVAL = 30000 // 30 seconds
const DISTANCE_THRESHOLD = 100 // meters
const MAX_RETRIES = 3
const RETRY_DELAY = 2000 // 2 seconds
const MAX_AGE = 60000 // 1 minute
const TIMEOUT = 15000 // 15 seconds

function useUpdateLocation() {
    const dispatch = useDispatch()
    const { userData, socket } = useSelector(state => state.user)
    const watchIdRef = useRef(null)
    const hasUpdated = useRef(false)
    const lastLocationRef = useRef(null)
    const retryTimeoutRef = useRef(null)
    const lastUpdateTimeRef = useRef(0)
    const retryCountRef = useRef(0)
    const locationIntervalRef = useRef(null)
    
    // ✅ State for status
    const [isUpdating, setIsUpdating] = useState(false)
    const [lastUpdateError, setLastUpdateError] = useState(null)
    const [lastUpdateTime, setLastUpdateTime] = useState(null)
    const [currentLocation, setCurrentLocation] = useState(null)
    const [isWatching, setIsWatching] = useState(false)

    // ✅ Calculate distance between two coordinates (Haversine formula)
    const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity
        const R = 6371e3 // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180
        const φ2 = lat2 * Math.PI / 180
        const Δφ = (lat2 - lat1) * Math.PI / 180
        const Δλ = (lon2 - lon1) * Math.PI / 180

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        return R * c // Distance in meters
    }, [])

    // ✅ Get address from coordinates using reverse geocoding
   const getAddressFromCoords = useCallback(async (lat, lon) => {
    try {
        // ✅ Fix: Remove withCredentials for external API
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
            { withCredentials: false }  // ✅ Add this
        )
        
        if (response.data && response.data.address) {
            const address = response.data.address
            const city = address.city || address.town || address.village || address.county || ''
            const state = address.state || address.region || ''
            const fullAddress = response.data.display_name || ''
            
            return { city, state, fullAddress }
        }
        return { city: '', state: '', fullAddress: '' }
    } catch (error) {
        console.log('❌ Reverse geocoding error:', error)
        return { city: '', state: '', fullAddress: '' }
    }
}, [])

    // ✅ Update location function
    const updateLocation = useCallback(async (lat, lon, isRetry = false) => {
        // ✅ Validate coordinates
        if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
            console.log("⏳ Invalid coordinates, skipping update")
            return
        }

        // ✅ Check if enough time has passed since last update
        const now = Date.now()
        if (!isRetry && now - lastUpdateTimeRef.current < UPDATE_INTERVAL) {
            console.log(`⏳ Throttled: ${(now - lastUpdateTimeRef.current) / 1000}s since last update`)
            return
        }

        // ✅ Check if location changed significantly
        if (lastLocationRef.current) {
            const distance = calculateDistance(
                lastLocationRef.current.lat,
                lastLocationRef.current.lon,
                lat,
                lon
            )
            if (distance < DISTANCE_THRESHOLD && !isRetry) {
                console.log(`⏳ Location changed only ${Math.round(distance)}m, threshold: ${DISTANCE_THRESHOLD}m`)
                return
            }
        }

        setIsUpdating(true)
        setLastUpdateError(null)

        try {
            console.log(`📍 Updating location: ${lat}, ${lon}`)
            
            // ✅ Update in database
            const result = await axios.post(
                `${serverUrl}/api/user/update-location`,
                { lat, lon },
                { withCredentials: true }
            )
            
            console.log("✅ Location updated:", result.data)
            
            // ✅ Update Redux store
            dispatch(setLocation({ lat, lon }))
            
            // ✅ Get address from coordinates
            const addressData = await getAddressFromCoords(lat, lon)
            if (addressData.city) {
                dispatch(setCurrentCity(addressData.city))
                dispatch(setCurrentState(addressData.state))
                dispatch(setCurrentAddress(addressData.fullAddress))
                dispatch(setAddress(addressData.fullAddress))
            }
            
            // ✅ Emit location via socket for real-time tracking
            if (socket && socket.connected) {
                socket.emit('update-location', { 
                    lat, 
                    lon,
                    city: addressData.city,
                    state: addressData.state,
                    address: addressData.fullAddress
                })
                console.log("📡 Location emitted via socket")
            }
            
            // ✅ Update refs
            lastLocationRef.current = { lat, lon }
            lastUpdateTimeRef.current = Date.now()
            setLastUpdateTime(new Date())
            setCurrentLocation({ lat, lon })
            hasUpdated.current = true
            retryCountRef.current = 0
            setIsUpdating(false)
            
            // ✅ Success toast (only if significant change)
            if (!isRetry) {
                // toast.success('📍 Location updated successfully!')
            }
            
        } catch (error) {
            const status = error.response?.status
            const message = error.response?.data?.message || error.message
            
            console.log(`❌ Location update error: ${message}`)
            
            // ✅ Handle 401 - User logged out
            if (status === 401) {
                console.log("❌ Unauthorized - User logged out")
                setLastUpdateError("Unauthorized")
                if (watchIdRef.current) {
                    navigator.geolocation?.clearWatch(watchIdRef.current)
                    watchIdRef.current = null
                    setIsWatching(false)
                }
                setIsUpdating(false)
                return
            }
            
            // ✅ Handle 400 - Bad request
            if (status === 400) {
                console.log("⏳ Location not set yet, will retry...")
                setLastUpdateError("Location not set")
                setIsUpdating(false)
                return
            }
            
            // ✅ Network errors - Retry logic
            if (!isRetry && retryCountRef.current < MAX_RETRIES) {
                retryCountRef.current++
                console.log(`⏳ Retrying... (${retryCountRef.current}/${MAX_RETRIES})`)
                setLastUpdateError(`Retrying... (${retryCountRef.current}/${MAX_RETRIES})`)
                
                // ✅ Clear existing retry timeout
                if (retryTimeoutRef.current) {
                    clearTimeout(retryTimeoutRef.current)
                }
                
                retryTimeoutRef.current = setTimeout(() => {
                    updateLocation(lat, lon, true)
                }, RETRY_DELAY * retryCountRef.current)
            } else {
                setLastUpdateError(message)
                setIsUpdating(false)
                // toast.error(`📍 Location update failed: ${message}`)
            }
        }
    }, [dispatch, socket, calculateDistance, getAddressFromCoords])

    // ✅ Start location watching
    useEffect(() => {
        // ✅ Check if user is logged in
        if (!userData?._id) {
            console.log("⏳ No user logged in, stopping location updates")
            if (watchIdRef.current) {
                navigator.geolocation?.clearWatch(watchIdRef.current)
                watchIdRef.current = null
                setIsWatching(false)
            }
            if (locationIntervalRef.current) {
                clearInterval(locationIntervalRef.current)
                locationIntervalRef.current = null
            }
            hasUpdated.current = false
            lastLocationRef.current = null
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
            setLastUpdateError("Geolocation not supported")
            toast.error('📍 Geolocation is not supported by your browser')
            return
        }

        // ✅ Get initial location immediately
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude
                const lon = pos.coords.longitude
                console.log(`📍 Initial location: ${lat}, ${lon}`)
                setCurrentLocation({ lat, lon })
                updateLocation(lat, lon)
            },
            (error) => {
                console.log(`📍 Initial location error: ${error.message}`)
                setLastUpdateError(`Initial location error: ${error.message}`)
            },
            {
                enableHighAccuracy: true,
                timeout: TIMEOUT,
                maximumAge: MAX_AGE
            }
        )

        // ✅ Start watching location
        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const lat = pos.coords.latitude
                const lon = pos.coords.longitude
                console.log(`📍 Got location: ${lat}, ${lon}`)
                setCurrentLocation({ lat, lon })
                updateLocation(lat, lon)
            },
            (error) => {
                console.log(`📍 Geolocation error: ${error.message}`)
                
                // ✅ Auto-retry on geolocation errors
                if (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) {
                    console.log("⏳ Geolocation error, will retry...")
                    setLastUpdateError(`Geolocation error: ${error.message}`)
                }
            },
            {
                enableHighAccuracy: true,
                timeout: TIMEOUT,
                maximumAge: MAX_AGE
            }
        )

        watchIdRef.current = watchId
        setIsWatching(true)
        console.log(`✅ Location watcher started: ${watchId}`)

        // ✅ Periodic location check
        locationIntervalRef.current = setInterval(() => {
            if (watchIdRef.current) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const lat = pos.coords.latitude
                        const lon = pos.coords.longitude
                        updateLocation(lat, lon)
                    },
                    (error) => {
                        console.log(`📍 Periodic check error: ${error.message}`)
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: TIMEOUT,
                        maximumAge: MAX_AGE
                    }
                )
            }
        }, UPDATE_INTERVAL)

        // ✅ Cleanup
        return () => {
            if (watchIdRef.current) {
                console.log(`🔄 Cleaning up location watcher: ${watchIdRef.current}`)
                navigator.geolocation?.clearWatch(watchIdRef.current)
                watchIdRef.current = null
                setIsWatching(false)
            }
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current)
                retryTimeoutRef.current = null
            }
            if (locationIntervalRef.current) {
                clearInterval(locationIntervalRef.current)
                locationIntervalRef.current = null
            }
            hasUpdated.current = false
        }
    }, [userData?._id, updateLocation])

    // ✅ Reset state when user logs out
    useEffect(() => {
        if (!userData?._id) {
            hasUpdated.current = false
            retryCountRef.current = 0
            lastLocationRef.current = null
            setLastUpdateError(null)
            setIsUpdating(false)
            setCurrentLocation(null)
            setIsWatching(false)
        }
    }, [userData?._id])

    // ✅ Manual refresh function
    const refreshLocation = useCallback(async () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation not supported')
            return
        }

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const lat = pos.coords.latitude
                    const lon = pos.coords.longitude
                    setCurrentLocation({ lat, lon })
                    await updateLocation(lat, lon)
                    resolve({ lat, lon })
                },
                (error) => {
                    console.log(`📍 Refresh location error: ${error.message}`)
                    setLastUpdateError(`Refresh error: ${error.message}`)
                    toast.error('Failed to refresh location')
                    resolve(null)
                },
                {
                    enableHighAccuracy: true,
                    timeout: TIMEOUT,
                    maximumAge: MAX_AGE
                }
            )
        })
    }, [updateLocation])

    // ✅ Return status
    return {
        isUpdating,
        error: lastUpdateError,
        lastUpdateTime,
        currentLocation,
        isWatching,
        isActive: !!watchIdRef.current,
        hasUpdated: hasUpdated.current,
        refreshLocation,
        updateLocation
    }
}

export default useUpdateLocation