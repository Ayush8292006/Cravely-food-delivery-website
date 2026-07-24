import { createSlice } from "@reduxjs/toolkit";

// ✅ Load user from localStorage on app start
const loadUserFromStorage = () => {
    try {
        const stored = localStorage.getItem('userData')
        if (stored) {
            const parsed = JSON.parse(stored)
            if (parsed && parsed._id) {
                return parsed
            }
        }
    } catch (e) {
        console.log("⚠️ Failed to load user from storage")
    }
    return null
}

// ✅ Load cart from localStorage
const loadCartFromStorage = () => {
    try {
        const stored = localStorage.getItem('cartData')
        if (stored) {
            return JSON.parse(stored)
        }
    } catch (e) {
        console.log("⚠️ Failed to load cart from storage")
    }
    return []
}

// ✅ Load cart total from localStorage
const loadCartTotalFromStorage = () => {
    try {
        const stored = localStorage.getItem('cartTotal')
        if (stored) {
            return Number(stored)
        }
    } catch (e) {
        console.log("⚠️ Failed to load cart total from storage")
    }
    return 0
}

// ✅ Load cart count from localStorage
const loadCartCountFromStorage = () => {
    try {
        const stored = localStorage.getItem('cartCount')
        if (stored) {
            return Number(stored)
        }
    } catch (e) {
        console.log("⚠️ Failed to load cart count from storage")
    }
    return 0
}

// ✅ NEW: Load wishlist from localStorage
const loadWishlistFromStorage = () => {
    try {
        const stored = localStorage.getItem('wishlist')
        if (stored) {
            return JSON.parse(stored)
        }
    } catch (e) {
        console.log("⚠️ Failed to load wishlist from storage")
    }
    return []
}

// ✅ NEW: Load orders from localStorage
const loadOrdersFromStorage = () => {
    try {
        const stored = localStorage.getItem('myOrders')
        if (stored) {
            return JSON.parse(stored)
        }
    } catch (e) {
        console.log("⚠️ Failed to load orders from storage")
    }
    return []
}

const initialState = {
    userData: loadUserFromStorage(),
    currentCity: null,
    currentState: null,
    currentAddress: null,
    savedAddresses: [],
    shopsInMyCity: [],
    itemsInMyCity: [],
    cartItems: loadCartFromStorage(),
    totalAmount: loadCartTotalFromStorage(),
    cartCount: loadCartCountFromStorage(),
    myOrders: loadOrdersFromStorage(),  // ✅ FIXED - loads from localStorage
    searchItems: [],
    socket: null,
    wishlist: loadWishlistFromStorage(),  // ✅ FIXED - loads from localStorage
    loading: false,
    error: null
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        // ============================================
        // ✅ USER DATA - With localStorage
        // ============================================
        setUserData: (state, action) => {
            state.userData = action.payload
            if (action.payload) {
                localStorage.setItem('userData', JSON.stringify(action.payload))
            } else {
                localStorage.removeItem('userData')
            }
        },
        clearUserData: (state) => {
            state.userData = null
            localStorage.removeItem('userData')
        },

        // ============================================
        // ✅ LOADING & ERROR
        // ============================================
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
        clearError: (state) => {
            state.error = null
        },

        // ============================================
        // ✅ LOCATION
        // ============================================
        setCurrentCity: (state, action) => {
            state.currentCity = action.payload
        },
        setCurrentState: (state, action) => {
            state.currentState = action.payload
        },
        setCurrentAddress: (state, action) => {
            state.currentAddress = action.payload
        },

        // ============================================
        // ✅ SAVED ADDRESSES
        // ============================================
        setSavedAddresses: (state, action) => {
            state.savedAddresses = action.payload
        },
        addSavedAddress: (state, action) => {
            state.savedAddresses.push(action.payload)
        },
        removeSavedAddress: (state, action) => {
            state.savedAddresses = state.savedAddresses.filter(
                addr => addr._id !== action.payload
            )
        },
        setDefaultAddress: (state, action) => {
            state.savedAddresses = state.savedAddresses.map(addr => ({
                ...addr,
                isDefault: addr._id === action.payload
            }))
        },

        // ============================================
        // ✅ SHOPS & ITEMS
        // ============================================
        setShopsInMyCity: (state, action) => {
            state.shopsInMyCity = action.payload
        },
        setItemsInMyCity: (state, action) => {
            state.itemsInMyCity = action.payload
        },

        // ============================================
        // ✅ CART - With localStorage
        // ============================================
        addToCart: (state, action) => {
            const cartItem = action.payload
            const existingItem = state.cartItems.find(i => i.id === cartItem.id || i._id === cartItem.id)

            if (existingItem) {
                existingItem.quantity = (existingItem.quantity || 0) + (cartItem.quantity || 1)
            } else {
                state.cartItems.push({
                    id: cartItem.id || cartItem._id,
                    _id: cartItem._id || cartItem.id,
                    name: cartItem.name,
                    price: Number(cartItem.price),
                    quantity: Number(cartItem.quantity || 1),
                    image: cartItem.image || '',
                    shop: cartItem.shop || null,
                    shopId: cartItem.shopId || cartItem.shop?._id || null,
                    foodType: cartItem.foodType || 'veg'
                })
            }

            state.totalAmount = state.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            state.cartCount = state.cartItems.reduce((sum, item) => sum + item.quantity, 0)

            localStorage.setItem('cartData', JSON.stringify(state.cartItems))
            localStorage.setItem('cartTotal', String(state.totalAmount))
            localStorage.setItem('cartCount', String(state.cartCount))
        },

        updateQuantity: (state, action) => {
            const { id, quantity } = action.payload
            const item = state.cartItems.find(i => i.id === id || i._id === id)
            if (item) {
                item.quantity = Math.max(1, quantity)
                state.totalAmount = state.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                state.cartCount = state.cartItems.reduce((sum, item) => sum + item.quantity, 0)

                localStorage.setItem('cartData', JSON.stringify(state.cartItems))
                localStorage.setItem('cartTotal', String(state.totalAmount))
                localStorage.setItem('cartCount', String(state.cartCount))
            }
        },

        removeCartItem: (state, action) => {
            state.cartItems = state.cartItems.filter(i => i.id !== action.payload && i._id !== action.payload)
            state.totalAmount = state.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            state.cartCount = state.cartItems.reduce((sum, item) => sum + item.quantity, 0)

            localStorage.setItem('cartData', JSON.stringify(state.cartItems))
            localStorage.setItem('cartTotal', String(state.totalAmount))
            localStorage.setItem('cartCount', String(state.cartCount))
        },

        clearCart: (state) => {
            state.cartItems = []
            state.totalAmount = 0
            state.cartCount = 0

            localStorage.removeItem('cartData')
            localStorage.removeItem('cartTotal')
            localStorage.removeItem('cartCount')
        },

        resetCart: (state, action) => {
            state.cartItems = action.payload || []
            state.totalAmount = state.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            state.cartCount = state.cartItems.reduce((sum, item) => sum + item.quantity, 0)

            localStorage.setItem('cartData', JSON.stringify(state.cartItems))
            localStorage.setItem('cartTotal', String(state.totalAmount))
            localStorage.setItem('cartCount', String(state.cartCount))
        },

        // ============================================
        // ✅ ORDERS
        // ============================================
        setMyOrders: (state, action) => {
            state.myOrders = action.payload || []
            localStorage.setItem('myOrders', JSON.stringify(state.myOrders))
        },

        addMyOrder: (state, action) => {
            state.myOrders = [action.payload, ...state.myOrders]
            localStorage.setItem('myOrders', JSON.stringify(state.myOrders))
        },

        updateOrderStatus: (state, action) => {
            const { orderId, shopId, status } = action.payload
            const order = state.myOrders.find(o => o._id === orderId || o._id?.toString() === orderId)

            if (order && order.shopOrders && Array.isArray(order.shopOrders)) {
                order.shopOrders.forEach(shopOrder => {
                    const shopIdMatch =
                        shopOrder.shop?._id?.toString() === shopId?.toString() ||
                        shopOrder.shop === shopId ||
                        shopOrder.shop?.toString() === shopId?.toString()

                    if (shopIdMatch) {
                        shopOrder.status = status
                    }
                })
                localStorage.setItem('myOrders', JSON.stringify(state.myOrders))
            }
        },

        updateRealtimeOrderStatus: (state, action) => {
            const { orderId, shopId, status } = action.payload
            const order = state.myOrders.find(o => o._id === orderId || o._id?.toString() === orderId)

            if (order && order.shopOrders && Array.isArray(order.shopOrders)) {
                order.shopOrders.forEach(shopOrder => {
                    const shopIdMatch =
                        shopOrder.shop?._id?.toString() === shopId?.toString() ||
                        shopOrder.shop === shopId ||
                        shopOrder.shop?.toString() === shopId?.toString()

                    if (shopIdMatch) {
                        shopOrder.status = status
                    }
                })
                localStorage.setItem('myOrders', JSON.stringify(state.myOrders))
            }
        },

        cancelOrder: (state, action) => {
            const { orderId } = action.payload
            const order = state.myOrders.find(o => o._id === orderId || o._id?.toString() === orderId)
            if (order) {
                order.isCancelled = true
                order.cancelledAt = new Date().toISOString()
                if (order.shopOrders && Array.isArray(order.shopOrders)) {
                    order.shopOrders.forEach(shopOrder => {
                        shopOrder.status = 'cancelled'
                    })
                }
                localStorage.setItem('myOrders', JSON.stringify(state.myOrders))
            }
        },

        updateOrderPayment: (state, action) => {
            const { orderId, payment } = action.payload
            const order = state.myOrders.find(o => o._id === orderId || o._id?.toString() === orderId)
            if (order) {
                order.payment = payment
                localStorage.setItem('myOrders', JSON.stringify(state.myOrders))
            }
        },

        // ============================================
        // ✅ SEARCH
        // ============================================
        setSearchItems: (state, action) => {
            state.searchItems = action.payload || []
        },
        clearSearch: (state) => {
            state.searchItems = []
        },

        // ============================================
        // ✅ SOCKET
        // ============================================
        setSocket: (state, action) => {
            state.socket = action.payload
        },
        clearSocket: (state) => {
            if (state.socket) {
                state.socket.disconnect()
                state.socket = null
            }
        },

        // ============================================
        // ✅ WISHLIST
        // ============================================
        toggleWishlist: (state, action) => {
            const itemId = action.payload
            const index = state.wishlist.indexOf(itemId)
            if (index === -1) {
                state.wishlist.push(itemId)
            } else {
                state.wishlist.splice(index, 1)
            }
            localStorage.setItem('wishlist', JSON.stringify(state.wishlist))
        },
        setWishlist: (state, action) => {
            state.wishlist = action.payload || []
            localStorage.setItem('wishlist', JSON.stringify(state.wishlist))
        },

        // ============================================
        // ✅ RESET - Complete State Reset
        // ============================================
        resetUserState: (state) => {
            state.userData = null
            state.currentCity = null
            state.currentState = null
            state.currentAddress = null
            state.savedAddresses = []
            state.shopsInMyCity = []
            state.itemsInMyCity = []
            state.cartItems = []
            state.totalAmount = 0
            state.cartCount = 0
            state.myOrders = []
            state.searchItems = []
            state.wishlist = []
            state.loading = false
            state.error = null

            localStorage.removeItem('userData')
            localStorage.removeItem('cartData')
            localStorage.removeItem('cartTotal')
            localStorage.removeItem('cartCount')
            localStorage.removeItem('myOrders')
            localStorage.removeItem('wishlist')

            if (state.socket) {
                state.socket.disconnect()
                state.socket = null
            }
        }
    }
})

// ============================================
// ✅ EXPORT ALL ACTIONS
// ============================================
export const {
    setUserData,
    clearUserData,
    setLoading,
    setError,
    clearError,
    setCurrentCity,
    setCurrentState,
    setCurrentAddress,
    setSavedAddresses,
    addSavedAddress,
    removeSavedAddress,
    setDefaultAddress,
    setShopsInMyCity,
    setItemsInMyCity,
    addToCart,
    updateQuantity,
    removeCartItem,
    clearCart,
    resetCart,
    setMyOrders,
    addMyOrder,
    updateOrderStatus,
    updateRealtimeOrderStatus,
    cancelOrder,
    updateOrderPayment,
    setSearchItems,
    clearSearch,
    setSocket,
    clearSocket,
    toggleWishlist,
    setWishlist,
    resetUserState
} = userSlice.actions

// ============================================
// ✅ SELECTORS
// ============================================
export const selectUser = (state) => state.user.userData
export const selectIsAuthenticated = (state) => !!state.user.userData
export const selectCartItems = (state) => state.user.cartItems
export const selectCartTotal = (state) => state.user.totalAmount
export const selectCartCount = (state) => state.user.cartCount
export const selectIsCartEmpty = (state) => state.user.cartItems.length === 0
export const selectWishlist = (state) => state.user.wishlist
export const selectMyOrders = (state) => state.user.myOrders

export default userSlice.reducer