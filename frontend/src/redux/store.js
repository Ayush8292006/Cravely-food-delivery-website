import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice.js";
import mapSlice from "./mapSlice.js";
import ownerSlice from "./ownerSlice.js";

const isDev = import.meta.env.NODE_ENV === 'development' || import.meta.env.DEV;

export const store = configureStore({
    reducer: {
        user: userSlice,
        owner: ownerSlice,
        map: mapSlice
    },
    devTools: isDev,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
                ignoredPaths: ['user.socket', 'map.location']
            },
            immutableCheck: {
                ignoredPaths: ['user.socket']
            }
        })
});

// ✅ ADD THIS LINE - Make store globally accessible
window.store = store;

if (isDev) {
    console.log("🔍 Redux Store initialized in Development mode");
    console.log("📦 Initial State:", store.getState());
}

if (isDev) {
    store.subscribe(() => {
        const state = store.getState();
        console.log("🔄 State updated:", state);
    });
}