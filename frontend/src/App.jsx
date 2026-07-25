import React, { useEffect, useState, useRef } from "react"
import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import SignUp from "./pages/SignUp"
import SignIn from "./pages/SignIn"
import ForgotPassword from "./pages/ForgotPassword"
import useGetCurrentUser from "../hooks/useGetCurrentUser"
import { useDispatch, useSelector } from "react-redux"
import Home from "./pages/home"
import Restaurants from './pages/Restaurants'
import useGetCity from "../hooks/useGetCity"
import useGetMyShop from "../hooks/useGetMyShop"
import CreateEditShop from "./pages/CreateEditShop"
import AddItem from "./pages/AddItem"
import EditItem from "./pages/EditItem"
import useGetShopByCity from "../hooks/useGetShopByCity"
import  useGetItemsByCity  from "../hooks/useGetItemsByCity"
import CartPage from "./pages/CartPage"
import CheckOut from "./pages/CheckOut"
import OrderPlaced from "./pages/OrderPlaced"
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminShops from './pages/admin/AdminShops'
import AdminOrders from './pages/admin/AdminOrders'
import AdminDeliveryBoys from './pages/admin/AdminDeliveryBoys'
import AdminRevenue from './pages/admin/AdminRevenue'
import About from './pages/About'
import Contact from './pages/Contact'
import MyOrders from "./pages/MyOrders"
import useGetMyOrders from "../hooks/useGetMyOrders"
import useUpdateLocation from "../hooks/useUpdateLocation"
import TrackOrderPage from "./pages/TrackOrderPage"
import Shop from "./pages/Shop"
import { io } from "socket.io-client"
import { ToastContainer } from "react-toastify"
import VerifyEmail from './pages/VerifyEmail'
import LoginOtp from './pages/LoginOtp'
import Profile from './pages/Profile'
import "react-toastify/dist/ReactToastify.css"
import LandingPage from './pages/LandingPage'
import SplashScreen from './pages/SplashScreen'
import Footer from './components/Footer'
import SuperAdminLogin from './pages/SuperAdminLogin'
import CategoryPage from './pages/CategoryPage'
import OwnerDashboard from './components/OwnerDashboard'
import OwnerMyOrders from './pages/OwnerMyOrders'
import DeliveryBoy from './components/DeliveryBoy'

export const serverUrl = "https://cravely-backend-dmak.onrender.com"

function App() {
  const { userData } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const socketRef = useRef(null)

  useGetCurrentUser()
  useUpdateLocation()
  useGetCity()
  useGetMyShop()
  useGetShopByCity()
  useGetItemsByCity()
  useGetMyOrders()

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!userData?._id) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      return
    }

    const socketInstance = io(serverUrl, { 
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    })
    
    socketRef.current = socketInstance
    
    socketInstance.on('connect', () => {
      console.log("🔗 Socket connected")
      if (userData?._id) {
        socketInstance.emit('identity', { userId: userData._id })
      }
    })

    socketInstance.on('disconnect', (reason) => {
      console.log("🔌 Socket disconnected:", reason)
      if (reason === 'io server disconnect' || reason === 'transport close') {
        setTimeout(() => socketInstance.connect(), 2000)
      }
    })

    return () => {
      socketInstance.disconnect()
      socketRef.current = null
    }
  }, [userData?._id, serverUrl])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#ff2d55] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-sm animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  const showFooter = location.pathname === '/landing' || location.pathname === '/home'

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">
          <Routes>
            <Route path='/' element={<SplashScreen />} />
            <Route path='/landing' element={<LandingPage />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            
            <Route path='/signup' element={!userData ? <SignUp /> : <Navigate to={"/"} />} />
            <Route path='/signin' element={!userData ? <SignIn /> : <Navigate to={"/"} />} />
            <Route path='/forgot-password' element={!userData ? <ForgotPassword /> : <Navigate to={"/"} />} />
            <Route path='/login-otp' element={!userData ? <LoginOtp /> : <Navigate to={"/"} />} />
            
            <Route path='/admin/login' element={<SuperAdminLogin />} />
            <Route path='/admin/dashboard' element={userData?.role === 'superAdmin' ? <AdminDashboard /> : <Navigate to="/admin/login" />} />
            <Route path='/admin/users' element={userData?.role === 'superAdmin' ? <AdminUsers /> : <Navigate to="/admin/login" />} />
            <Route path='/admin/shops' element={userData?.role === 'superAdmin' ? <AdminShops /> : <Navigate to="/admin/login" />} />
            <Route path='/admin/orders' element={userData?.role === 'superAdmin' ? <AdminOrders /> : <Navigate to="/admin/login" />} />
            <Route path='/admin/delivery-boys' element={userData?.role === 'superAdmin' ? <AdminDeliveryBoys /> : <Navigate to="/admin/login" />} />
            <Route path='/admin/revenue' element={userData?.role === 'superAdmin' ? <AdminRevenue /> : <Navigate to="/admin/login" />} />
            
            <Route path='/owner-dashboard' element={userData?.role === 'owner' ? <OwnerDashboard /> : <Navigate to="/signin" />} />
            <Route path='/owner-orders' element={userData?.role === 'owner' ? <OwnerMyOrders /> : <Navigate to="/signin" />} />
            
            <Route path='/home' element={userData ? <Home /> : <Navigate to={"/signin"} />} />
            <Route path='/restaurants' element={userData ? <Restaurants /> : <Navigate to={"/signin"} />} />
            <Route path='/create-edit-shop' element={userData ? <CreateEditShop /> : <Navigate to={"/signin"} />} />
            <Route path='/add-item' element={userData ? <AddItem /> : <Navigate to={"/signin"} />} />
            <Route path='/edit-item/:itemId' element={userData ? <EditItem /> : <Navigate to={"/signin"} />} />
            <Route path='/cart' element={userData ? <CartPage /> : <Navigate to={"/signin"} />} />
            <Route path='/checkout' element={userData ? <CheckOut /> : <Navigate to={"/signin"} />} />
            <Route path='/order-placed' element={userData ? <OrderPlaced /> : <Navigate to={"/signin"} />} />
            <Route path='/profile' element={userData ? <Profile /> : <Navigate to={"/signin"} />} />
            <Route path='/my-orders' element={userData ? <MyOrders /> : <Navigate to={"/signin"} />} />
            <Route path='/category/:categoryName' element={userData ? <CategoryPage /> : <Navigate to={"/signin"} />} />
            <Route path='/track-order/:orderId' element={userData ? <TrackOrderPage /> : <Navigate to={"/signin"} />} />
            <Route path='/shop/:shopId' element={userData ? <Shop /> : <Navigate to={"/signin"} />} />
            
            <Route path='/delivery-earnings' element={userData?.role === 'deliveryBoy' ? <DeliveryBoy /> : <Navigate to="/signin" />} />
            <Route path='/delivery-dashboard' element={userData?.role === 'deliveryBoy' ? <DeliveryBoy /> : <Navigate to="/signin" />} />
          </Routes>
        </div>
        {showFooter && <Footer />}
      </div>

      <ToastContainer 
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
        progressClassName="custom-toast-progress"
        limit={5}
        style={{
          width: 'auto',
          maxWidth: '440px',
          borderRadius: '20px'
        }}
      />
    </>
  )
}

export default App