import { createSlice } from "@reduxjs/toolkit";

const ownerSlice = createSlice({
    name: "owner",
    initialState: {
        myShopData: null
    },
    reducers: {
        setMyShopData: (state, action) => {
            state.myShopData = action.payload
        }
    }
})

export const { setMyShopData } = ownerSlice.actions

// ✅ SELECTORS ADDED
export const selectMyShop = (state) => state.owner.myShopData
export const selectIsOwner = (state) => !!state.owner.myShopData

export default ownerSlice.reducer