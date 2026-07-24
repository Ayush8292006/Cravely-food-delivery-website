import { createSlice } from "@reduxjs/toolkit";

const mapSlice = createSlice({
    name: "map",  // ✅ FIXED - was "user"
    initialState: {
        location: {
            lat: null,
            lon: null
        },
        address: null
    },
    reducers: {
        setLocation: (state, action) => {
            const { lat, lon } = action.payload
            state.location.lat = lat
            state.location.lon = lon
        },
        setAddress: (state, action) => {
            state.address = action.payload
        }
    }
})

export const { setAddress, setLocation } = mapSlice.actions

// ✅ SELECTORS ADDED
export const selectLocation = (state) => state.map.location
export const selectAddress = (state) => state.map.address
export const selectLat = (state) => state.map.location.lat
export const selectLon = (state) => state.map.location.lon

export default mapSlice.reducer