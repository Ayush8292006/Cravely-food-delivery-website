import { createSlice } from "@reduxjs/toolkit";

// ✅ Helper to get initial shop data from localStorage
const getInitialShopData = () => {
    try {
        const saved = localStorage.getItem('myShopData')
        if (saved) {
            return JSON.parse(saved)
        }
    } catch (e) {
        console.log("❌ Error loading shop data:", e)
    }
    return null
}

const ownerSlice = createSlice({
    name: "owner",
    initialState: {
        myShopData: getInitialShopData(),
        loading: false,
        error: null,
        isApproved: false,
        hasShop: false
    },
    reducers: {
        setMyShopData: (state, action) => {
            state.myShopData = action.payload
            state.hasShop = !!action.payload
            state.isApproved = action.payload?.isApproved || false
            // ✅ Save to localStorage
            if (action.payload) {
                localStorage.setItem('myShopData', JSON.stringify(action.payload))
            } else {
                localStorage.removeItem('myShopData')
            }
        },
        setOwnerLoading: (state, action) => {
            state.loading = action.payload
        },
        setOwnerError: (state, action) => {
            state.error = action.payload
        },
        setShopApproval: (state, action) => {
            state.isApproved = action.payload
            if (state.myShopData) {
                state.myShopData.isApproved = action.payload
                localStorage.setItem('myShopData', JSON.stringify(state.myShopData))
            }
        },
        clearOwnerData: (state) => {
            state.myShopData = null
            state.hasShop = false
            state.isApproved = false
            state.error = null
            localStorage.removeItem('myShopData')
        },
        updateShopItems: (state, action) => {
            if (state.myShopData && action.payload) {
                state.myShopData.items = action.payload
                localStorage.setItem('myShopData', JSON.stringify(state.myShopData))
            }
        }
    }
})

export const { 
    setMyShopData, 
    setOwnerLoading, 
    setOwnerError,
    setShopApproval,
    clearOwnerData,
    updateShopItems
} = ownerSlice.actions

// ✅ SELECTORS WITH SAFE ACCESS
export const selectMyShop = (state) => state?.owner?.myShopData || null
export const selectIsOwner = (state) => state?.owner?.hasShop || false
export const selectShopLoading = (state) => state?.owner?.loading || false
export const selectShopError = (state) => state?.owner?.error || null
export const selectIsShopApproved = (state) => state?.owner?.isApproved || false
export const selectShopItems = (state) => state?.owner?.myShopData?.items || []
export const selectShopId = (state) => state?.owner?.myShopData?._id || null

// ✅ Check if owner has shop and is approved
export const selectCanAddItems = (state) => {
    const owner = state?.owner
    return owner?.hasShop && owner?.isApproved
}

export default ownerSlice.reducer