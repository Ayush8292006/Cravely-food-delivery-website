import React, { useEffect, useState } from 'react'
import { IoArrowBack } from "react-icons/io5";
import { MdMyLocation } from "react-icons/md";
import { FaCreditCard } from "react-icons/fa6";
import { FaSearchLocation } from "react-icons/fa";
import { MdOutlineDeliveryDining } from "react-icons/md";
import { 
    FaTruck, FaArrowRight, FaCheckCircle, FaShoppingBag, 
    FaWallet, FaMapPin, FaHome, FaUser, FaPhone, FaPen, 
    FaCheck, FaHeadset, FaClock, FaShieldAlt, FaGem,
    FaRocket, FaStar, FaHeart, FaTag, FaFire, FaMotorcycle
} from "react-icons/fa";
import { RiSecurePaymentLine } from "react-icons/ri";
import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import "leaflet/dist/leaflet.css"
import { setAddress, setLocation } from '../redux/mapSlice';
import axios from 'axios';
import { toast } from "react-toastify";
import { clearCart, addMyOrder } from '../redux/userSlice';
import { motion, AnimatePresence } from 'framer-motion';

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
})

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function RecenterMap({ location }) {
    const map = useMap()
    useEffect(() => {
        if (location?.lat && location?.lon) {
            map.setView([location.lat, location.lon], 16, { animate: true })
        }
    }, [location, map])
    return null
}

function CheckOut() {
    const { location, address } = useSelector(state => state.map)
    const { cartItems, totalAmount, userData } = useSelector(state => state.user)
    const [addressInput, setAddressInput] = useState("")
    const [mobileNumber, setMobileNumber] = useState("")
    const [paymentMethod, setPaymentMethod] = useState("cod")
    const [loading, setLoading] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [completedSteps, setCompletedSteps] = useState([])
    const [isEditingAddress, setIsEditingAddress] = useState(false)
    const [tempAddress, setTempAddress] = useState("")
    const [tempMobile, setTempMobile] = useState("")
    const [showMap, setShowMap] = useState(false)
    const [deliveryFee, setDeliveryFee] = useState(30)
    const [showSavedAddresses, setShowSavedAddresses] = useState(false)
    
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const apiKey = import.meta.env.VITE_GEOAPIKEY

    const DELIVERY_THRESHOLD = 199
    const DELIVERY_FEE = 30
    const PACKAGING_FEE = 0

    const calculateDeliveryFee = () => {
        const fee = totalAmount >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
        setDeliveryFee(fee)
        return fee
    }

    const amountNeededForFreeDelivery = Math.max(0, DELIVERY_THRESHOLD - totalAmount)
    const AmountWithDeliveryfee = totalAmount + deliveryFee + PACKAGING_FEE
    const defaultLat = location?.lat || 26.4499
    const defaultLon = location?.lon || 80.3319

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 300)
    }, [])

    const fadeUp = `transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`

    const onDragEnd = (e) => {
        const { lat, lng } = e.target._latlng
        dispatch(setLocation({ lat: lat, lon: lng }))
        getAddressByLatLng(lat, lng)
    }

    const getCurrentLocation = () => {
        if (userData?.location?.coordinates?.length === 2) {
            const latitude = userData.location.coordinates[1]
            const longitude = userData.location.coordinates[0]
            dispatch(setLocation({ lat: latitude, lon: longitude }))
            getAddressByLatLng(latitude, longitude)
        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords
                    dispatch(setLocation({ lat: latitude, lon: longitude }))
                    getAddressByLatLng(latitude, longitude)
                },
                (error) => {
                    toast.warning("Couldn't get location. Please enter address manually.")
                }
            )
        } else {
            toast.warning("Location not available. Please enter address manually.")
        }
    }

    const getAddressByLatLng = async (lat, lng) => {
        try {
            if (!apiKey) return
            const result = await axios.get(
                `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`
            )
            const fullAddress = result?.data?.results[0]?.address_line1 +
                (result?.data?.results[0]?.address_line2
                    ? ", " + result.data.results[0].address_line2
                    : "")
            dispatch(setAddress(fullAddress))
            setAddressInput(fullAddress)
            setTempAddress(fullAddress)
            if (!completedSteps.includes(2)) {
                setCompletedSteps([...completedSteps, 2])
            }
        } catch (error) {
            console.log("Geocoding error:", error)
        }
    }

    useEffect(() => {
        getCurrentLocation()
        calculateDeliveryFee()
        
        if (userData?.mobile) {
            const mobile = userData.mobile.toString().trim()
            if (mobile !== '0000000000' && mobile.length >= 10) {
                setMobileNumber(mobile)
                setTempMobile(mobile)
            }
        }
        
        if (userData?.addresses?.length > 0) {
            const defaultAddr = userData.addresses.find(a => a.isDefault) || userData.addresses[0]
            if (defaultAddr) {
                setAddressInput(defaultAddr.text)
                setTempAddress(defaultAddr.text)
                if (defaultAddr.latitude && defaultAddr.longitude) {
                    dispatch(setLocation({ 
                        lat: defaultAddr.latitude, 
                        lon: defaultAddr.longitude 
                    }))
                }
            }
        }
    }, [])

    const handleEditAddress = () => {
        setIsEditingAddress(true)
        setTempAddress(addressInput)
        const currentMobile = mobileNumber === '0000000000' ? '' : mobileNumber
        setTempMobile(currentMobile)
        setShowMap(true)
        setShowSavedAddresses(false)
    }

    const getLatLngByAddress = async () => {
        if (!addressInput.trim()) {
            toast.error("Please enter an address first")
            return
        }
        try {
            if (!apiKey) return
            const result = await axios.get(
                `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apiKey}`
            )
            if (result.data.features && result.data.features.length > 0) {
                const { lat, lon } = result.data.features[0].properties
                dispatch(setLocation({ lat, lon }))
                toast.success("Location found on map!")
            } else {
                toast.error("Address not found. Please try again.")
            }
        } catch (error) {
            console.log("Geocoding error:", error)
            toast.error("Failed to find location")
        }
    }

    const handleSelectSavedAddress = (savedAddr) => {
        setTempAddress(savedAddr.text)
        if (savedAddr.latitude && savedAddr.longitude) {
            dispatch(setLocation({ 
                lat: savedAddr.latitude, 
                lon: savedAddr.longitude 
            }))
        }
        if (savedAddr.phone && savedAddr.phone !== '0000000000') {
            setTempMobile(savedAddr.phone)
        }
        setShowSavedAddresses(false)
        toast.success("Address loaded!")
    }

    const handleSaveAddress = () => {
        if (tempAddress.trim() === "") {
            toast.error("Please enter a valid address")
            return
        }
        if (tempMobile.trim() === "" || tempMobile.length < 10) {
            toast.error("Please enter a valid 10-digit mobile number")
            return
        }
        setAddressInput(tempAddress)
        setMobileNumber(tempMobile)
        setIsEditingAddress(false)
        setShowMap(false)
        setShowSavedAddresses(false)
        if (!completedSteps.includes(2)) {
            setCompletedSteps([...completedSteps, 2])
        }
        toast.success("Address updated successfully!")
    }

    const markStepComplete = (step) => {
        if (!completedSteps.includes(step)) {
            setCompletedSteps([...completedSteps, step])
        }
    }

    const isStepCompleted = (step) => {
        return completedSteps.includes(step)
    }

    const paymentMethods = [
        { id: 'cod', icon: <MdOutlineDeliveryDining size={20} />, label: 'Cash on Delivery', sub: 'Pay when you receive' },
        { id: 'online', icon: <FaCreditCard size={20} />, label: 'Online Payment', sub: 'Pay securely online' },
    ]

    const handlePlaceOrder = async () => {
        if (!cartItems || cartItems.length === 0) {
            toast.error("Your cart is empty!")
            return
        }
        
        if (!addressInput || addressInput.trim() === "") {
            toast.error("Please enter delivery address!")
            return
        }
        
        if (!mobileNumber || mobileNumber.trim() === "" || mobileNumber.length < 10) {
            toast.error("Please enter a valid mobile number!")
            return
        }
        
        if (!location?.lat || !location?.lon) {
            toast.error("Please select delivery location on map!")
            return
        }

        setLoading(true)

        try {
            const formattedCartItems = cartItems.map(item => ({
                id: item._id || item.id,
                name: item.name,
                price: Number(item.price),
                quantity: Number(item.quantity),
                shop: item.shop?._id || item.shop,
                image: item.image || ''
            }))

            const orderData = {
                cartItems: formattedCartItems,
                totalAmount: AmountWithDeliveryfee,
                paymentMethod: paymentMethod === 'cod' ? 'cod' : 'online',
                deliveryAddress: {
                    text: addressInput,
                    latitude: Number(location.lat),
                    longitude: Number(location.lon)
                }
            }

            console.log("📦 Sending Order:", orderData)

            const response = await axios.post(
                `${API_URL}/api/order/place-order`,
                orderData,
                { withCredentials: true }
            )

            console.log("✅ Order Response:", response.data)

            if (paymentMethod === "cod") {
                dispatch(addMyOrder(response.data))
                dispatch(clearCart())
                setLoading(false)
                toast.success("Order placed successfully! 🎉")
                navigate(`/order-placed?order_id=${response.data._id}`)
            } else {
                if (typeof window.Razorpay === 'undefined') {
                    const script = document.createElement('script')
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
                    script.async = true
                    script.onload = () => handleRazorpayPayment(response.data)
                    script.onerror = () => {
                        toast.error("Payment service unavailable. Please try again.")
                        setLoading(false)
                    }
                    document.body.appendChild(script)
                } else {
                    handleRazorpayPayment(response.data)
                }
            }
        } catch (error) {
            setLoading(false)
            console.log("❌ Order Error:", error)
            toast.error(error.response?.data?.message || "Something went wrong!")
        }
    }

    const handleRazorpayPayment = (orderData) => {
        const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID
        
        if (!keyId) {
            toast.error("Payment configuration missing")
            setLoading(false)
            return
        }

        const options = {
            key: keyId,
            amount: orderData.amount || Math.round(AmountWithDeliveryfee * 100),
            currency: orderData.currency || "INR",
            name: "Cravely Food Delivery",
            description: `Order #${orderData.orderId?.slice(-6) || 'NEW'}`,
            order_id: orderData.razorpayOrderId,
            handler: async function (razorpayResponse) {
                try {
                    const verifyResult = await axios.post(
                        `${API_URL}/api/order/verify-payment`,
                        {
                            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                            razorpay_order_id: razorpayResponse.razorpay_order_id,
                            razorpay_signature: razorpayResponse.razorpay_signature,
                            orderId: orderData.orderId
                        },
                        { withCredentials: true }
                    )
                    
                    dispatch(addMyOrder(verifyResult.data))
                    dispatch(clearCart())
                    setLoading(false)
                    toast.success("Payment successful! 🎉")
                    navigate(`/order-placed?order_id=${verifyResult.data._id}&payment_id=${razorpayResponse.razorpay_payment_id}&razorpay_order_id=${razorpayResponse.razorpay_order_id}&razorpay_signature=${razorpayResponse.razorpay_signature}`)
                } catch (error) {
                    toast.error(error.response?.data?.message || "Payment verification failed")
                    setLoading(false)
                }
            },
            modal: {
                ondismiss: function() {
                    setLoading(false)
                    toast.info("Payment cancelled")
                }
            },
            prefill: {
                name: userData?.fullName || "",
                email: userData?.email || "",
                contact: mobileNumber || ""
            },
            theme: {
                color: "#ff2d55"
            }
        }

        const razorpay = new window.Razorpay(options)
        razorpay.open()
    }

    return (
        <div className='min-h-screen bg-[#0a0a0f] relative overflow-hidden'>
            
            {/* ✅ Animated Background Orbs */}
            <div className='absolute inset-0 pointer-events-none'>
                <motion.div 
                    animate={{ x: [0, 80, -40, 0], y: [0, -40, 60, 0] }}
                    transition={{ duration: 25, repeat: Infinity }}
                    className='absolute -top-40 -left-40 w-[700px] h-[700px] bg-[#ff2d55]/5 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ x: [0, -80, 40, 0], y: [0, 40, -60, 0] }}
                    transition={{ duration: 30, repeat: Infinity }}
                    className='absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-[#ff6b35]/5 rounded-full blur-3xl'
                />
                <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[#ffd93d]/3 rounded-full blur-3xl'
                />
            </div>

            <div className='relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10'>
                
                {/* ✅ Premium Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-4 mb-8 ${fadeUp}`}
                >
                    <motion.button 
                        whileHover={{ scale: 1.05, rotate: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className='w-11 h-11 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#12121f] flex items-center justify-center hover:bg-white/10 transition-all duration-300 border border-white/10 group shadow-lg shadow-black/20'
                        onClick={() => navigate("/cart")}
                    >
                        <IoArrowBack size={20} className='text-white/60 group-hover:text-white transition' />
                    </motion.button>
                    <div>
                        <h1 className='text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3'>
                            Checkout
                            <span className='text-xs bg-gradient-to-r from-[#ff2d55]/20 to-[#ff6b35]/20 px-2.5 py-0.5 rounded-full text-[#ff6b35] border border-[#ff6b35]/20'>
                                {cartItems.length} items
                            </span>
                        </h1>
                        <p className='text-white/30 text-sm flex items-center gap-2'>
                            <RiSecurePaymentLine size={14} />
                            Complete your order securely
                        </p>
                    </div>
                </motion.div>

                {/* ✅ Steps - Premium */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`grid grid-cols-4 gap-2 md:gap-4 mb-8 ${fadeUp}`}
                >
                    {[
                        { step: 1, label: 'Cart', sub: 'Review Items' },
                        { step: 2, label: 'Address', sub: 'Delivery address' },
                        { step: 3, label: 'Payment', sub: 'Payment method' },
                        { step: 4, label: 'Confirm', sub: 'Place your order' }
                    ].map((item) => {
                        const isCompleted = isStepCompleted(item.step)
                        const isActive = item.step === 1 || isCompleted || item.step === completedSteps.length + 1
                        return (
                            <div key={item.step} className={`text-center p-2 sm:p-3 rounded-xl border transition-all duration-300 ${
                                isCompleted 
                                    ? 'border-green-500/30 bg-green-500/10' 
                                    : isActive
                                    ? 'border-[#ff2d55]/30 bg-[#ff2d55]/10'
                                    : 'border-white/10 bg-white/5'
                            }`}>
                                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mx-auto transition-all duration-300 ${
                                    isCompleted 
                                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                                        : isActive
                                        ? 'bg-[#ff2d55] text-white shadow-lg shadow-[#ff2d55]/30'
                                        : 'bg-white/10 text-white/30'
                                }`}>
                                    {isCompleted ? <FaCheck size={10} className="sm:text-sm" /> : item.step}
                                </div>
                                <p className={`text-[10px] sm:text-sm font-semibold mt-1 ${isCompleted ? 'text-green-400' : isActive ? 'text-white' : 'text-white/30'}`}>
                                    {item.label}
                                </p>
                                <p className='text-[8px] sm:text-[10px] text-white/20'>{item.sub}</p>
                            </div>
                        )
                    })}
                </motion.div>

                {/* ✅ Main Content */}
                <div className='grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6'>
                    
                    {/* ✅ LEFT COLUMN - 3/5 */}
                    <div className='lg:col-span-3 space-y-4 md:space-y-5'>
                        
                        {/* ✅ Cart Section */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className={`glass-premium-ultra p-4 md:p-5 rounded-2xl border border-white/5 ${fadeUp}`}
                        >
                            <div className='flex items-center gap-3 mb-3 md:mb-4'>
                                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${
                                    isStepCompleted(1) ? 'bg-green-500 text-white' : 'bg-[#ff2d55] text-white'
                                }`}>
                                    {isStepCompleted(1) ? <FaCheck size={10} /> : '1'}
                                </div>
                                <div>
                                    <h2 className='text-xs sm:text-sm font-semibold text-white'>Cart Items</h2>
                                    <p className='text-[10px] sm:text-xs text-white/30'>{cartItems.length} items</p>
                                </div>
                            </div>
                            
                            {cartItems.length === 0 ? (
                                <div className='text-center py-4 md:py-6'>
                                    <FaShoppingBag className='text-white/10 text-3xl md:text-4xl mx-auto mb-2 md:mb-3' />
                                    <p className='text-white/30 text-sm'>Your cart is empty</p>
                                    <button 
                                        className='mt-2 md:mt-3 px-4 md:px-6 py-1.5 md:py-2 rounded-xl bg-[#ff2d55] text-white text-xs md:text-sm hover:bg-[#e0244a] transition'
                                        onClick={() => navigate('/')}
                                    >
                                        Browse Restaurants
                                    </button>
                                </div>
                            ) : (
                                <div className='space-y-2 md:space-y-3 max-h-60 md:max-h-80 overflow-y-auto pr-2 custom-scrollbar'>
                                    {cartItems.map((item, index) => (
                                        <div key={index} className='flex items-center gap-2 md:gap-4 p-2 md:p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition'>
                                            <img 
                                                src={item.image || 'https://via.placeholder.com/60/2a2a3a/666?text=🍕'} 
                                                alt={item.name}
                                                className='w-10 h-10 sm:w-14 sm:h-14 object-cover rounded-lg'
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/60/2a2a3a/666?text=🍕'
                                                }}
                                            />
                                            <div className='flex-1 min-w-0'>
                                                <h4 className='text-white font-medium text-xs sm:text-sm truncate'>{item.name}</h4>
                                                <p className='text-white/30 text-[10px] sm:text-xs'>₹{item.price} × {item.quantity}</p>
                                            </div>
                                            <p className='text-white font-semibold text-xs sm:text-sm'>₹{(item.price * item.quantity).toFixed(0)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* ✅ Address Section */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className={`glass-premium-ultra p-4 md:p-5 rounded-2xl border border-white/5 ${fadeUp}`}
                        >
                            <div className='flex items-center gap-3 mb-3 md:mb-4'>
                                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${
                                    isStepCompleted(2) ? 'bg-green-500 text-white' : 'bg-white/10 text-white/30'
                                }`}>
                                    {isStepCompleted(2) ? <FaCheck size={10} /> : '2'}
                                </div>
                                <div>
                                    <h2 className={`text-xs sm:text-sm font-semibold ${isStepCompleted(2) ? 'text-green-400' : 'text-white'}`}>
                                        Delivery Address
                                    </h2>
                                    <p className='text-[10px] sm:text-xs text-white/30'>Where should we deliver?</p>
                                </div>
                            </div>
                            
                            {isEditingAddress ? (
                                <div className='space-y-2 md:space-y-3'>
                                    <div className='flex flex-wrap gap-2'>
                                        <div className='flex-1 min-w-[140px] relative'>
                                            <input 
                                                type="text" 
                                                className='w-full bg-[#18181D] border border-white/10 rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 text-xs md:text-sm'
                                                placeholder='Enter delivery address...'
                                                value={tempAddress}
                                                onChange={(e) => setTempAddress(e.target.value)}
                                                onFocus={() => {
                                                    if (userData?.addresses?.length > 0) {
                                                        setShowSavedAddresses(true)
                                                    }
                                                }}
                                            />
                                            {showSavedAddresses && userData?.addresses?.length > 0 && (
                                                <div className='absolute top-full left-0 right-0 mt-1 bg-[#1a1a2e] border border-white/10 rounded-xl max-h-32 md:max-h-40 overflow-y-auto z-20 custom-scrollbar'>
                                                    {userData.addresses.map((addr, idx) => (
                                                        <div 
                                                            key={idx}
                                                            className="px-3 md:px-4 py-2 text-white/70 text-xs md:text-sm hover:bg-white/5 cursor-pointer transition flex items-center gap-2 border-b border-white/5 last:border-0"
                                                            onClick={() => handleSelectSavedAddress(addr)}
                                                        >
                                                            <FaHome size={10} className="sm:text-sm text-[#ff6b35]" />
                                                            <span className="flex-1 truncate">{addr.text}</span>
                                                            {addr.isDefault && (
                                                                <span className="text-[8px] sm:text-[10px] text-green-400 bg-green-500/20 px-1.5 sm:px-2 py-0.5 rounded-full">Default</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <button 
                                            className='px-2 md:px-3 py-2 md:py-2.5 rounded-xl bg-[#ff2d55]/20 text-[#ff6b35] hover:scale-105 transition-all duration-300 border border-[#ff6b35]/20'
                                            onClick={getLatLngByAddress}
                                            title="Find on map"
                                        >
                                            <FaSearchLocation size={14} className="sm:text-base" />
                                        </button>
                                        <button 
                                            className='px-2 md:px-3 py-2 md:py-2.5 rounded-xl bg-blue-500/20 text-blue-400 hover:scale-105 transition-all duration-300 border border-blue-500/20'
                                            onClick={getCurrentLocation}
                                            title="Use current location"
                                        >
                                            <MdMyLocation size={14} className="sm:text-base" />
                                        </button>
                                    </div>

                                    <div>
                                        <input 
                                            type="tel" 
                                            className='w-full bg-[#18181D] border border-white/10 rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff2d55]/50 transition-all duration-300 text-xs md:text-sm'
                                            placeholder='Enter mobile number (e.g. 9876543210)'
                                            value={tempMobile}
                                            onChange={(e) => setTempMobile(e.target.value.replace(/\D/g, ''))}
                                            maxLength={10}
                                        />
                                    </div>

                                    {showMap && (
                                        <div className='h-40 md:h-48 w-full rounded-xl overflow-hidden border border-white/5'>
                                            <MapContainer className='w-full h-full' center={[defaultLat, defaultLon]} zoom={16}>
                                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                                <RecenterMap location={{ lat: location?.lat || defaultLat, lon: location?.lon || defaultLon }} /> 
                                                <Marker 
                                                    position={[location?.lat || defaultLat, location?.lon || defaultLon]} 
                                                    draggable 
                                                    eventHandlers={{ dragend: onDragEnd }} 
                                                />
                                            </MapContainer>
                                        </div>
                                    )}

                                    <div className='flex flex-wrap gap-2 md:gap-3'>
                                        <motion.button 
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className='flex-1 py-2 md:py-2.5 rounded-xl bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white text-xs md:text-sm font-medium shadow-lg shadow-[#ff2d55]/20 hover:shadow-[#ff2d55]/40 transition-all duration-300'
                                            onClick={handleSaveAddress}
                                        >
                                            <FaCheck size={12} className="sm:text-sm mr-1" /> Save Address
                                        </motion.button>
                                        <button 
                                            className='px-4 md:px-6 py-2 md:py-2.5 rounded-xl border border-white/10 text-white/40 hover:bg-white/5 transition-all duration-300 text-xs md:text-sm'
                                            onClick={() => {
                                                setIsEditingAddress(false)
                                                setTempAddress(addressInput)
                                                setTempMobile(mobileNumber)
                                                setShowMap(false)
                                                setShowSavedAddresses(false)
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {addressInput ? (
                                        <div className='p-3 md:p-4 rounded-xl bg-gradient-to-r from-white/5 to-transparent border border-white/5'>
                                            <div className='flex items-start gap-2 md:gap-3'>
                                                <div className='flex-1'>
                                                    <div className='flex items-center justify-between flex-wrap gap-1 md:gap-2'>
                                                        <div>
                                                            <p className='text-white/40 text-[10px] md:text-xs font-medium'>📍 Delivery Address</p>
                                                            <p className='text-white font-semibold text-sm'>{userData?.fullName || 'Customer'}</p>
                                                            <p className='text-white/40 text-xs flex items-center gap-2'>
                                                                <FaPhone size={10} className="sm:text-sm" />
                                                                {mobileNumber && mobileNumber !== '0000000000' ? mobileNumber : 'Add mobile number'}
                                                            </p>
                                                        </div>
                                                        <motion.button 
                                                            whileHover={{ scale: 1.05 }}
                                                            className='text-[#ff6b35] text-[10px] sm:text-sm font-medium hover:underline flex items-center gap-1 px-2 md:px-3 py-1 rounded-full bg-[#ff6b35]/10 hover:bg-[#ff6b35]/20 transition-all duration-300'
                                                            onClick={handleEditAddress}
                                                        >
                                                            <FaPen size={10} className="sm:text-sm" />
                                                            Edit
                                                        </motion.button>
                                                    </div>
                                                    <p className='text-white/60 text-xs sm:text-sm mt-1 md:mt-2 leading-relaxed'>
                                                        {addressInput}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className='text-center py-4 md:py-6'>
                                            <FaMapPin className='text-white/10 text-3xl md:text-4xl mx-auto mb-2 md:mb-3' />
                                            <p className='text-white/30 text-sm'>No address added</p>
                                            <motion.button 
                                                whileHover={{ scale: 1.05 }}
                                                className='mt-2 md:mt-3 px-4 md:px-6 py-1.5 md:py-2 rounded-xl bg-[#ff2d55] text-white text-xs md:text-sm hover:bg-[#e0244a] transition-all duration-300'
                                                onClick={handleEditAddress}
                                            >
                                                Add Address
                                            </motion.button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>

                        {/* ✅ Payment Method */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className={`glass-premium-ultra p-4 md:p-5 rounded-2xl border border-white/5 ${fadeUp}`}
                        >
                            <div className='flex items-center gap-3 mb-3 md:mb-4'>
                                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${
                                    isStepCompleted(3) ? 'bg-green-500 text-white' : 'bg-white/10 text-white/30'
                                }`}>
                                    {isStepCompleted(3) ? <FaCheck size={10} /> : '3'}
                                </div>
                                <div>
                                    <h2 className={`text-xs sm:text-sm font-semibold ${isStepCompleted(3) ? 'text-green-400' : 'text-white'}`}>
                                        Payment Method
                                    </h2>
                                    <p className='text-[10px] sm:text-xs text-white/30'>Choose how to pay</p>
                                </div>
                            </div>
                            
                            <div className='grid grid-cols-2 gap-2 md:gap-3'>
                                {paymentMethods.map((method) => (
                                    <motion.div 
                                        key={method.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                                            paymentMethod === method.id 
                                                ? 'border-[#ff2d55] bg-[#ff2d55]/10 shadow-lg shadow-[#ff2d55]/10' 
                                                : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                                        }`}
                                        onClick={() => {
                                            setPaymentMethod(method.id)
                                            if (!isStepCompleted(3)) {
                                                markStepComplete(3)
                                            }
                                        }}
                                    >
                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                            paymentMethod === method.id ? 'bg-[#ff2d55]/20' : 'bg-white/5'
                                        }`}>
                                            <span className={paymentMethod === method.id ? 'text-[#ff2d55]' : 'text-white/30'}>
                                                {method.icon}
                                            </span>
                                        </div>
                                        <div className='flex-1'>
                                            <p className={`text-[10px] sm:text-sm font-medium ${paymentMethod === method.id ? 'text-white' : 'text-white/50'}`}>
                                                {method.label}
                                            </p>
                                            <p className='text-white/30 text-[8px] sm:text-xs'>{method.sub}</p>
                                        </div>
                                        {paymentMethod === method.id && (
                                            <FaCheckCircle className='text-[#ff2d55]' size={12} className="sm:text-base" />
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* ✅ RIGHT COLUMN - 2/5 */}
                    <div className='lg:col-span-2 space-y-4 md:space-y-5'>
                        
                        {/* ✅ Order Summary */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className={`glass-premium-ultra p-4 md:p-5 rounded-2xl border border-white/5 ${fadeUp}`}
                        >
                            <div className='flex items-center gap-3 mb-3 md:mb-4'>
                                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${
                                    isStepCompleted(4) ? 'bg-green-500 text-white' : 'bg-white/10 text-white/30'
                                }`}>
                                    {isStepCompleted(4) ? <FaCheck size={10} /> : '4'}
                                </div>
                                <div>
                                    <h2 className={`text-xs sm:text-sm font-semibold ${isStepCompleted(4) ? 'text-green-400' : 'text-white'}`}>
                                        Order Summary
                                    </h2>
                                    <p className='text-[10px] sm:text-xs text-white/30'>Review your order</p>
                                </div>
                            </div>

                            {cartItems.length > 0 && (
                                <div className='space-y-1.5 md:space-y-2 pb-2 md:pb-3 border-b border-white/10 max-h-32 md:max-h-40 overflow-y-auto custom-scrollbar'>
                                    {cartItems.map((item, index) => (
                                        <div key={index} className='flex justify-between text-xs md:text-sm'>
                                            <span className='text-white/70 truncate'>{item.name} × {item.quantity}</span>
                                            <span className='text-white font-medium'>₹{(item.price * item.quantity).toFixed(0)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className='space-y-1.5 md:space-y-2 pt-2 md:pt-3'>
                                <div className='flex justify-between text-xs md:text-sm'>
                                    <span className='text-white/40'>Subtotal</span>
                                    <span className='text-white'>₹{totalAmount.toFixed(0)}</span>
                                </div>
                                <div className='flex justify-between text-xs md:text-sm'>
                                    <span className='text-white/40'>Delivery Fee</span>
                                    <span className={deliveryFee === 0 ? 'text-green-400' : 'text-white'}>
                                        {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                                    </span>
                                </div>
                                <div className='flex justify-between text-xs md:text-sm'>
                                    <span className='text-white/40'>Packaging</span>
                                    <span className='text-white'>₹{PACKAGING_FEE}</span>
                                </div>
                                
                                {amountNeededForFreeDelivery > 0 && deliveryFee > 0 && (
                                    <div className='mt-1 md:mt-2 p-2 md:p-3 bg-green-500/10 rounded-xl border border-green-500/20'>
                                        <p className='text-green-400 text-[10px] md:text-sm font-medium'>🍕 Add ₹{amountNeededForFreeDelivery} more for FREE delivery</p>
                                    </div>
                                )}
                            </div>

                            <div className='mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/10'>
                                <div className='flex justify-between items-center'>
                                    <span className='text-white/60 text-xs md:text-sm font-medium'>Total</span>
                                    <span className='text-xl md:text-2xl font-bold text-[#ff6b35]'>₹{AmountWithDeliveryfee.toFixed(0)}</span>
                                </div>
                                <p className='text-white/20 text-[8px] md:text-xs mt-1 text-right'>Inclusive of all taxes</p>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full mt-3 md:mt-4 py-2.5 md:py-3.5 rounded-xl bg-gradient-to-r from-[#ff2d55] to-[#ff6b35] text-white font-semibold shadow-lg shadow-[#ff2d55]/25 hover:shadow-[#ff2d55]/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm`}
                                onClick={handlePlaceOrder}
                                disabled={loading || cartItems.length === 0}
                            >
                                {loading ? (
                                    <>
                                        <ClipLoader size={16} className="md:w-5 md:h-5" color="white" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Place Order</span>
                                        <FaArrowRight size={12} className="md:text-sm group-hover:translate-x-1 transition" />
                                    </>
                                )}
                            </motion.button>
                        </motion.div>

                        {/* ✅ Trust Badges */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className={`glass-premium-ultra p-3 md:p-4 rounded-2xl border border-white/5 ${fadeUp}`}
                        >
                            <div className='grid grid-cols-3 gap-1 md:gap-2'>
                                <div className='text-center'>
                                    <FaHeadset className='text-[#ff2d55] text-lg md:text-2xl mx-auto' />
                                    <p className='text-white/60 text-[8px] md:text-xs font-medium mt-0.5 md:mt-1'>24/7 Support</p>
                                </div>
                                <div className='text-center'>
                                    <FaClock className='text-[#ff2d55] text-lg md:text-2xl mx-auto' />
                                    <p className='text-white/60 text-[8px] md:text-xs font-medium mt-0.5 md:mt-1'>On-time Delivery</p>
                                </div>
                                <div className='text-center'>
                                    <RiSecurePaymentLine className='text-[#ff2d55] text-lg md:text-2xl mx-auto' />
                                    <p className='text-white/60 text-[8px] md:text-xs font-medium mt-0.5 md:mt-1'>100% Safe</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* ✅ Security Badge */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className={`glass-premium-ultra p-3 md:p-4 rounded-2xl border border-white/5 text-center ${fadeUp}`}
                        >
                            <div className='flex items-center justify-center gap-1.5 md:gap-2 mb-0.5 md:mb-1'>
                                <RiSecurePaymentLine size={14} className="md:text-base text-green-400" />
                                <p className='text-white text-xs md:text-sm font-medium'>🔒 Safe & Secure Payments</p>
                            </div>
                            <p className='text-white/30 text-[8px] md:text-xs'>100% secure payments powered by trusted partners</p>
                            <div className='flex items-center justify-center gap-1.5 md:gap-3 mt-1.5 md:mt-2'>
                                <span className='text-white/20 text-[8px] md:text-xs font-medium bg-white/5 px-2 md:px-3 py-0.5 md:py-1 rounded-full'>UPI</span>
                                <span className='text-white/20 text-[8px] md:text-xs font-medium bg-white/5 px-2 md:px-3 py-0.5 md:py-1 rounded-full'>VISA</span>
                                <span className='text-white/20 text-[8px] md:text-xs font-medium bg-white/5 px-2 md:px-3 py-0.5 md:py-1 rounded-full'>RuPay</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes float-3d {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(40px, -30px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-float-3d {
                    animation: float-3d 15s ease-in-out infinite;
                }

                .glass-premium-ultra {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 45, 85, 0.3);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    )
}

export default CheckOut

