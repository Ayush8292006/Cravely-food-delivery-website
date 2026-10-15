import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
// ✅ FIXED: Add .jsx extension
import { store } from './redux/store.js'  // ✅ Changed from .js to .jsx
import axios from 'axios'

// ✅ Set default config for all axios requests
axios.defaults.withCredentials = true

// ✅ Use environment variable for base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
axios.defaults.baseURL = API_URL

console.log(`✅ Axios configured with credentials, baseURL: ${API_URL}`)

// ✅ Debug - Check if store is loaded
if (!store) {
  console.error('❌ Redux store failed to load!')
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  console.error('❌ Root element not found!')
} else {
  createRoot(rootElement).render(
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  )
  
  console.log('✅ App rendered successfully!')
}