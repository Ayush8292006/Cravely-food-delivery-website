import { createSlice } from "@reduxjs/toolkit";

// ✅ Helper to get initial location from localStorage
const getInitialLocation = () => {
    try {
        const saved = localStorage.getItem('userLocation')
        if (saved) {
            const parsed = JSON.parse(saved)
            if (parsed.lat && parsed.lon) {
                return parsed
            }
        }
    } catch (e) {
        console.log("❌ Error loading location:", e)
    }
    return { lat: null, lon: null }
}

const getInitialAddress = () => {
    try {
        const saved = localStorage.getItem('userAddress')
        if (saved) {
            return JSON.parse(saved)
        }
    } catch (e) {
        console.log("❌ Error loading address:", e)
    }
    return null
}

const mapSlice = createSlice({
    name: "map",
    initialState: {
        location: getInitialLocation(),
        address: getInitialAddress(),
        loading: false,
        error: null
    },
    reducers: {
        setLocation: (state, action) => {
            const { lat, lon } = action.payload
            state.location.lat = lat
            state.location.lon = lon
            // ✅ Save to localStorage
            localStorage.setItem('userLocation', JSON.stringify({ lat, lon }))
        },
        setAddress: (state, action) => {
            state.address = action.payload
            // ✅ Save to localStorage
            if (action.payload) {
                localStorage.setItem('userAddress', JSON.stringify(action.payload))
            } else {
                localStorage.removeItem('userAddress')
            }
        },
        setLocationLoading: (state, action) => {
            state.loading = action.payload
        },
        setLocationError: (state, action) => {
            state.error = action.payload
        },
        clearLocation: (state) => {
            state.location = { lat: null, lon: null }
            state.address = null
            state.error = null
            localStorage.removeItem('userLocation')
            localStorage.removeItem('userAddress')
        }
    }
})

export const { 
    setAddress, 
    setLocation, 
    setLocationLoading, 
    setLocationError,
    clearLocation 
} = mapSlice.actions

// ✅ SELECTORS WITH SAFE ACCESS
export const selectLocation = (state) => state?.map?.location || { lat: null, lon: null }
export const selectAddress = (state) => state?.map?.address || null
export const selectLat = (state) => state?.map?.location?.lat || null
export const selectLon = (state) => state?.map?.location?.lon || null
export const selectLocationLoading = (state) => state?.map?.loading || false
export const selectLocationError = (state) => state?.map?.error || null

// ✅ Check if location is available
export const selectHasLocation = (state) => {
    const loc = selectLocation(state)
    return loc?.lat !== null && loc?.lon !== null
}

export default mapSlice.reducer