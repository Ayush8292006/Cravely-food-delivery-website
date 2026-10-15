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
import { serverUrl } from '../../config';

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
})

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
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID

    const DELIVERY_THRESHOLD = 199
    const DELIVERY_FEE = 30
    const PACKAGING_FEE = 0
    const TAX_AMOUNT = 23 // ✅ Fixed tax ₹23 (same as CartPage)

    const calculateDeliveryFee = () => {
        const fee = totalAmount >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
        setDeliveryFee(fee)
        return fee
    }

    const amountNeededForFreeDelivery = Math.max(0, DELIVERY_THRESHOLD - totalAmount)
    // ✅ Tax added in total calculation
    const AmountWithDeliveryfee = totalAmount + deliveryFee + PACKAGING_FEE + TAX_AMOUNT
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
                    toast.warning("Couldn't get location. Please enter address manually.", {
                        position: "top-center",
                        autoClose: 3000,
                    })
                }
            )
        } else {
            toast.warning("Location not available. Please enter address manually.", {
                position: "top-center",
                autoClose: 3000,
            })
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
            toast.error("Please enter an address first", {
                position: "top-center",
                autoClose: 3000,
            })
            return
        }
        try {
            if (!apiKey) {
                toast.error("Geocoding service not configured", {
                    position: "top-center",
                    autoClose: 3000,
                })
                return
            }
            const result = await axios.get(
                `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apiKey}`
            )
            if (result.data.features && result.data.features.length > 0) {
                const { lat, lon } = result.data.features[0].properties
                dispatch(setLocation({ lat, lon }))
                toast.success("Location found on map! 🗺️", {
                    position: "top-center",
                    autoClose: 2000,
                })
            } else {
                toast.error("Address not found. Please try again.", {
                    position: "top-center",
                    autoClose: 3000,
                })
            }
        } catch (error) {
            console.log("Geocoding error:", error)
            toast.error("Failed to find location", {
                position: "top-center",
                autoClose: 3000,
            })
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
            setMobileNumber(savedAddr.phone)
        }
        setShowSavedAddresses(false)
        toast.success("Address loaded! 📍", {
            position: "top-center",
            autoClose: 2000,
        })
    }

    const handleSaveAddress = () => {
        if (tempAddress.trim() === "") {
            toast.error("Please enter a valid address", {
                position: "top-center",
                autoClose: 3000,
            })
            return
        }
        if (tempMobile.trim() === "" || tempMobile.length < 10) {
            toast.error("Please enter a valid 10-digit mobile number", {
                position: "top-center",
                autoClose: 3000,
            })
            return
        }
        if (!location?.lat || !location?.lon) {
            toast.error("Please select a location on the map", {
                position: "top-center",
                autoClose: 3000,
            })
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
        toast.success("Address updated successfully! ✅", {
            position: "top-center",
            autoClose: 2000,
        })
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

    const handleMobileChange = (value) => {
        const cleaned = value.replace(/\D/g, '')
        setTempMobile(cleaned)
        setMobileNumber(cleaned)
    }

    const handlePlaceOrder = async () => {
        console.log("📱 Mobile number before order:", mobileNumber)
        
        if (!cartItems || cartItems.length === 0) {
            toast.error("Your cart is empty! 🛒", {
                position: "top-center",
                autoClose: 3000,
            })
            return
        }
        
        if (!addressInput || addressInput.trim() === "") {
            toast.error("Please enter delivery address! 📍", {
                position: "top-center",
                autoClose: 3000,
            })
            return
        }
        
        if (!mobileNumber || mobileNumber.trim() === "" || mobileNumber.length < 10) {
            toast.error("Please enter a valid mobile number! 📱", {
                position: "top-center",
                autoClose: 3000,
            })
            return
        }
        
        if (!location?.lat || !location?.lon) {
            toast.error("Please select delivery location on map! 🗺️", {
                position: "top-center",
                autoClose: 3000,
            })
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
                totalAmount: AmountWithDeliveryfee, // ✅ Now includes tax
                paymentMethod: paymentMethod === 'cod' ? 'cod' : 'online',
                deliveryAddress: {
                    text: addressInput,
                    latitude: Number(location.lat),
                    longitude: Number(location.lon)
                },
                mobile: mobileNumber,
                customerName: userData?.fullName || 'Customer'
            }

            console.log("📦 Sending Order:", JSON.stringify(orderData, null, 2))

            const response = await axios.post(
                `${serverUrl}/api/order/place-order`,
                orderData,
                { withCredentials: true }
            )

            console.log("✅ Order Response:", response.data)

            if (paymentMethod === "cod") {
                dispatch(addMyOrder(response.data))
                dispatch(clearCart())
                setLoading(false)
                toast.success("Order placed successfully! 🎉", {
                    position: "top-center",
                    autoClose: 3000,
                })
                navigate(`/order-placed?order_id=${response.data._id}`)
            } else {
                if (!razorpayKey) {
                    toast.error("Payment configuration missing. Please try again.", {
                        position: "top-center",
                        autoClose: 3000,
                    })
                    setLoading(false)
                    return
                }

                if (typeof window.Razorpay === 'undefined') {
                    const script = document.createElement('script')
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
                    script.async = true
                    script.onload = () => handleRazorpayPayment(response.data)
                    script.onerror = () => {
                        toast.error("Payment service unavailable. Please try again.", {
                            position: "top-center",
                            autoClose: 3000,
                        })
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
            console.log("❌ Error Response:", error.response?.data)
            toast.error(error.response?.data?.message || "Something went wrong! ❌", {
                position: "top-center",
                autoClose: 3000,
            })
        }
    }

    const handleRazorpayPayment = (orderData) => {
        const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID
        
        if (!keyId) {
            toast.error("Payment configuration missing", {
                position: "top-center",
                autoClose: 3000,
            })
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
                        `${serverUrl}/api/order/verify-payment`,
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
                    toast.success("Payment successful! 🎉", {
                        position: "top-center",
                        autoClose: 3000,
                    })
                    navigate(`/order-placed?order_id=${verifyResult.data._id}&payment_id=${razorpayResponse.razorpay_payment_id}&razorpay_order_id=${razorpayResponse.razorpay_order_id}&razorpay_signature=${razorpayResponse.razorpay_signature}`)
                } catch (error) {
                    toast.error(error.response?.data?.message || "Payment verification failed", {
                        position: "top-center",
                        autoClose: 3000,
                    })
                    setLoading(false)
                }
            },
            modal: {
                ondismiss: function() {
                    setLoading(false)
                    toast.info("Payment cancelled", {
                        position: "top-center",
                        autoClose: 3000,
                    })
                }
            },
            prefill: {
                name: userData?.fullName || "",
                email: userData?.email || "",
                contact: mobileNumber || ""
            },
            theme: {
                color: "#e85d04"
            }
        }

        const razorpay = new window.Razorpay(options)
        razorpay.open()
    }

    return (
        <div 
            className='min-h-screen bg-[#f8f4f0] relative'
            style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                
                ::-webkit-scrollbar {
                    width: 4px;
                }
                ::-webkit-scrollbar-track {
                    background: #f0ebe5;
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb {
                    background: #d4845a;
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #c2744a;
                }
            `}</style>

            <div className='relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10'>
                
                {/* Header */}
                <div className={`flex items-center gap-4 mb-8 ${fadeUp}`}>
                    <button 
                        className='w-11 h-11 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center hover:border-orange-300 hover:shadow-md transition-all duration-300 shadow-sm'
                        onClick={() => navigate("/cart")}
                    >
                        <IoArrowBack size={20} className='text-gray-600' />
                    </button>
                    <div>
                        <h1 className='text-2xl md:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3'>
                            Checkout
                            <span className='text-[10px] bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full font-semibold border border-orange-200'>
                                {cartItems.length} items
                            </span>
                        </h1>
                        <p className='text-gray-500 text-sm flex items-center gap-2 font-medium'>
                            <RiSecurePaymentLine size={14} className='text-orange-500' />
                            Complete your order securely
                        </p>
                    </div>
                </div>

                {/* Steps */}
                <div className={`grid grid-cols-4 gap-2 md:gap-4 mb-8 ${fadeUp}`}>
                    {[
                        { step: 1, label: 'Cart', sub: 'Review Items' },
                        { step: 2, label: 'Address', sub: 'Delivery address' },
                        { step: 3, label: 'Payment', sub: 'Payment method' },
                        { step: 4, label: 'Confirm', sub: 'Place your order' }
                    ].map((item) => {
                        const isCompleted = isStepCompleted(item.step)
                        const isActive = item.step === 1 || isCompleted || item.step === completedSteps.length + 1
                        return (
                            <div key={item.step} className={`text-center p-2 sm:p-3 rounded-xl border-2 transition-all duration-300 ${isCompleted ? 'border-green-300 bg-green-50' : isActive ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mx-auto transition-all duration-300 ${isCompleted ? 'bg-green-500 text-white shadow-sm' : isActive ? 'bg-orange-500 text-white shadow-sm shadow-orange-200' : 'bg-gray-200 text-gray-400'}`}>
                                    {isCompleted ? <FaCheck size={10} /> : item.step}
                                </div>
                                <p className={`text-[10px] sm:text-sm font-semibold mt-1 ${isCompleted ? 'text-green-700' : isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                                    {item.label}
                                </p>
                                <p className='text-[8px] sm:text-[10px] text-gray-400'>{item.sub}</p>
                            </div>
                        )
                    })}
                </div>

                {/* Main Content */}
                <div className='grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6'>
                    
                    {/* LEFT COLUMN */}
                    <div className='lg:col-span-3 space-y-4 md:space-y-5'>
                        
                        {/* Cart Section */}
                        <div className={`bg-white border-2 border-gray-200 p-4 md:p-5 rounded-2xl shadow-sm ${fadeUp}`}>
                            <div className='flex items-center gap-3 mb-3 md:mb-4'>
                                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${isStepCompleted(1) ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                                    {isStepCompleted(1) ? <FaCheck size={10} /> : '1'}
                                </div>
                                <div>
                                    <h2 className='text-xs sm:text-sm font-semibold text-gray-800'>Cart Items</h2>
                                    <p className='text-[10px] sm:text-xs text-gray-400'>{cartItems.length} items</p>
                                </div>
                            </div>
                            
                            {cartItems.length === 0 ? (
                                <div className='text-center py-4 md:py-6'>
                                    <FaShoppingBag className='text-gray-300 text-3xl md:text-4xl mx-auto mb-2 md:mb-3' />
                                    <p className='text-gray-400 text-sm'>Your cart is empty</p>
                                    <button className='mt-2 md:mt-3 px-4 md:px-6 py-1.5 md:py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs md:text-sm font-medium transition' onClick={() => navigate('/')}>
                                        Browse Restaurants
                                    </button>
                                </div>
                            ) : (
                                <div className='space-y-2 md:space-y-3 max-h-60 md:max-h-80 overflow-y-auto pr-2'>
                                    {cartItems.map((item, index) => (
                                        <div key={index} className='flex items-center gap-2 md:gap-4 p-2 md:p-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-orange-200 transition'>
                                            <img src={item.image || 'https://via.placeholder.com/60/f0ebe5/cbb8a8?text=🍕'} alt={item.name} className='w-10 h-10 sm:w-14 sm:h-14 object-cover rounded-lg border border-gray-200' onError={(e) => { e.target.src = 'https://via.placeholder.com/60/f0ebe5/cbb8a8?text=🍕' }} />
                                            <div className='flex-1 min-w-0'>
                                                <h4 className='text-gray-800 font-medium text-xs sm:text-sm truncate'>{item.name}</h4>
                                                <p className='text-gray-400 text-[10px] sm:text-xs'>₹{item.price} × {item.quantity}</p>
                                            </div>
                                            <p className='text-gray-800 font-semibold text-xs sm:text-sm'>₹{(item.price * item.quantity).toFixed(0)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Address Section */}
                        <div className={`bg-white border-2 border-gray-200 p-4 md:p-5 rounded-2xl shadow-sm ${fadeUp}`}>
                            <div className='flex items-center gap-3 mb-3 md:mb-4'>
                                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${isStepCompleted(2) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                    {isStepCompleted(2) ? <FaCheck size={10} /> : '2'}
                                </div>
                                <div>
                                    <h2 className={`text-xs sm:text-sm font-semibold ${isStepCompleted(2) ? 'text-green-700' : 'text-gray-800'}`}>
                                        Delivery Address
                                    </h2>
                                    <p className='text-[10px] sm:text-xs text-gray-400'>Where should we deliver?</p>
                                </div>
                            </div>
                            
                            {isEditingAddress ? (
                                <div className='space-y-2 md:space-y-3'>
                                    <div className='flex flex-wrap gap-2'>
                                        <div className='flex-1 min-w-[140px] relative'>
                                            <input type="text" className='w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all duration-300 text-xs md:text-sm' placeholder='Enter delivery address...' value={tempAddress} onChange={(e) => setTempAddress(e.target.value)} onFocus={() => { if (userData?.addresses?.length > 0) { setShowSavedAddresses(true) } }} />
                                            {showSavedAddresses && userData?.addresses?.length > 0 && (
                                                <div className='absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-xl max-h-32 md:max-h-40 overflow-y-auto z-20 shadow-lg'>
                                                    {userData.addresses.map((addr, idx) => (
                                                        <div key={idx} className="px-3 md:px-4 py-2 text-gray-700 text-xs md:text-sm hover:bg-gray-50 cursor-pointer transition flex items-center gap-2 border-b border-gray-100 last:border-0" onClick={() => handleSelectSavedAddress(addr)}>
                                                            <FaHome size={10} className="text-orange-500" />
                                                            <span className="flex-1 truncate">{addr.text}</span>
                                                            {addr.isDefault && <span className="text-[8px] text-green-700 bg-green-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-green-200 font-medium">Default</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <button className='px-2 md:px-3 py-2 md:py-2.5 rounded-xl bg-orange-100 text-orange-600 hover:bg-orange-200 transition-all duration-300 border-2 border-orange-200' onClick={getLatLngByAddress} title="Find on map">
                                            <FaSearchLocation size={14} />
                                        </button>
                                        <button className='px-2 md:px-3 py-2 md:py-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-300 border-2 border-blue-200' onClick={getCurrentLocation} title="Use current location">
                                            <MdMyLocation size={14} />
                                        </button>
                                    </div>

                                    <div>
                                        <input type="tel" className='w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all duration-300 text-xs md:text-sm' placeholder='Enter mobile number (e.g. 9876543210)' value={tempMobile} onChange={(e) => handleMobileChange(e.target.value)} maxLength={10} />
                                    </div>

                                    {showMap && (
                                        <div className='h-40 md:h-48 w-full rounded-xl overflow-hidden border-2 border-gray-200'>
                                            <MapContainer className='w-full h-full' center={[defaultLat, defaultLon]} zoom={16}>
                                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                                <RecenterMap location={{ lat: location?.lat || defaultLat, lon: location?.lon || defaultLon }} /> 
                                                <Marker position={[location?.lat || defaultLat, location?.lon || defaultLon]} draggable eventHandlers={{ dragend: onDragEnd }} />
                                            </MapContainer>
                                        </div>
                                    )}

                                    <div className='flex flex-wrap gap-2 md:gap-3'>
                                        <button className='flex-1 py-2 md:py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs md:text-sm font-semibold transition shadow-sm shadow-orange-200' onClick={handleSaveAddress}>
                                            <FaCheck size={12} className="inline mr-1" /> Save Address
                                        </button>
                                        <button className='px-4 md:px-6 py-2 md:py-2.5 rounded-xl border-2 border-gray-200 text-gray-500 hover:bg-gray-50 transition text-xs md:text-sm font-medium' onClick={() => { setIsEditingAddress(false); setTempAddress(addressInput); setTempMobile(mobileNumber); setShowMap(false); setShowSavedAddresses(false) }}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {addressInput ? (
                                        <div className='p-3 md:p-4 rounded-xl bg-gray-50 border-2 border-gray-200'>
                                            <div className='flex items-start gap-2 md:gap-3'>
                                                <div className='flex-1'>
                                                    <div className='flex items-center justify-between flex-wrap gap-1 md:gap-2'>
                                                        <div>
                                                            <p className='text-gray-400 text-[10px] md:text-xs font-medium'>📍 Delivery Address</p>
                                                            <p className='text-gray-800 font-semibold text-sm'>{userData?.fullName || 'Customer'}</p>
                                                            <p className='text-gray-500 text-xs flex items-center gap-2'>
                                                                <FaPhone size={10} />
                                                                {mobileNumber && mobileNumber !== '0000000000' ? mobileNumber : 'Add mobile number'}
                                                            </p>
                                                        </div>
                                                        <button className='text-orange-600 text-[10px] sm:text-sm font-semibold hover:underline flex items-center gap-1 px-2 md:px-3 py-1 rounded-full bg-orange-50 hover:bg-orange-100 transition-all duration-300 border border-orange-200' onClick={handleEditAddress}>
                                                            <FaPen size={10} /> Edit
                                                        </button>
                                                    </div>
                                                    <p className='text-gray-600 text-xs sm:text-sm mt-1 md:mt-2 leading-relaxed'>{addressInput}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className='text-center py-4 md:py-6'>
                                            <FaMapPin className='text-gray-300 text-3xl md:text-4xl mx-auto mb-2 md:mb-3' />
                                            <p className='text-gray-400 text-sm'>No address added</p>
                                            <button className='mt-2 md:mt-3 px-4 md:px-6 py-1.5 md:py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs md:text-sm font-medium transition' onClick={handleEditAddress}>
                                                Add Address
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Payment Method */}
                        <div className={`bg-white border-2 border-gray-200 p-4 md:p-5 rounded-2xl shadow-sm ${fadeUp}`}>
                            <div className='flex items-center gap-3 mb-3 md:mb-4'>
                                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${isStepCompleted(3) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                    {isStepCompleted(3) ? <FaCheck size={10} /> : '3'}
                                </div>
                                <div>
                                    <h2 className={`text-xs sm:text-sm font-semibold ${isStepCompleted(3) ? 'text-green-700' : 'text-gray-800'}`}>
                                        Payment Method
                                    </h2>
                                    <p className='text-[10px] sm:text-xs text-gray-400'>Choose how to pay</p>
                                </div>
                            </div>
                            
                            <div className='grid grid-cols-2 gap-2 md:gap-3'>
                                {paymentMethods.map((method) => (
                                    <div key={method.id} className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${paymentMethod === method.id ? 'border-orange-400 bg-orange-50 shadow-sm' : 'border-gray-200 hover:border-orange-200 hover:bg-gray-50'}`} onClick={() => { setPaymentMethod(method.id); if (!isStepCompleted(3)) { markStepComplete(3) } }}>
                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${paymentMethod === method.id ? 'bg-orange-100' : 'bg-gray-100'}`}>
                                            <span className={paymentMethod === method.id ? 'text-orange-600' : 'text-gray-400'}>
                                                {method.icon}
                                            </span>
                                        </div>
                                        <div className='flex-1'>
                                            <p className={`text-[10px] sm:text-sm font-semibold ${paymentMethod === method.id ? 'text-gray-800' : 'text-gray-500'}`}>{method.label}</p>
                                            <p className='text-gray-400 text-[8px] sm:text-xs'>{method.sub}</p>
                                        </div>
                                        {paymentMethod === method.id && <FaCheckCircle className='text-green-500' size={12} />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className='lg:col-span-2 space-y-4 md:space-y-5'>
                        
                        {/* Order Summary */}
                        <div className={`bg-white border-2 border-orange-200 p-4 md:p-5 rounded-2xl shadow-sm ${fadeUp}`}>
                            <div className='flex items-center gap-3 mb-3 md:mb-4'>
                                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${isStepCompleted(4) ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                                    {isStepCompleted(4) ? <FaCheck size={10} /> : '4'}
                                </div>
                                <div>
                                    <h2 className={`text-xs sm:text-sm font-semibold ${isStepCompleted(4) ? 'text-green-700' : 'text-gray-800'}`}>
                                        Order Summary
                                    </h2>
                                    <p className='text-[10px] sm:text-xs text-gray-400'>Review your order</p>
                                </div>
                            </div>

                            {cartItems.length > 0 && (
                                <div className='space-y-1.5 md:space-y-2 pb-2 md:pb-3 border-b border-gray-200 max-h-32 md:max-h-40 overflow-y-auto'>
                                    {cartItems.map((item, index) => (
                                        <div key={index} className='flex justify-between text-xs md:text-sm'>
                                            <span className='text-gray-600 truncate'>{item.name} × {item.quantity}</span>
                                            <span className='text-gray-800 font-medium'>₹{(item.price * item.quantity).toFixed(0)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className='space-y-1.5 md:space-y-2 pt-2 md:pt-3'>
                                <div className='flex justify-between text-xs md:text-sm'>
                                    <span className='text-gray-500 font-medium'>Subtotal</span>
                                    <span className='text-gray-800'>₹{totalAmount.toFixed(0)}</span>
                                </div>
                                <div className='flex justify-between text-xs md:text-sm'>
                                    <span className='text-gray-500 font-medium'>Delivery Fee</span>
                                    <span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : 'text-gray-800'}>
                                        {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                                    </span>
                                </div>
                                <div className='flex justify-between text-xs md:text-sm'>
                                    <span className='text-gray-500 font-medium'>Packaging</span>
                                    <span className='text-gray-800'>₹{PACKAGING_FEE}</span>
                                </div>
                                {/* ✅ TAX ROW ADDED */}
                                <div className='flex justify-between text-xs md:text-sm'>
                                    <span className='text-gray-500 font-medium'>Tax (GST)</span>
                                    <span className='text-gray-800'>₹{TAX_AMOUNT}</span>
                                </div>
                                
                                {amountNeededForFreeDelivery > 0 && deliveryFee > 0 && (
                                    <div className='mt-1 md:mt-2 p-2 md:p-3 bg-green-50 rounded-xl border-2 border-green-200'>
                                        <p className='text-green-700 text-[10px] md:text-sm font-medium'>🍕 Add ₹{amountNeededForFreeDelivery} more for FREE delivery</p>
                                    </div>
                                )}
                            </div>

                            <div className='mt-3 md:mt-4 pt-3 md:pt-4 border-t-2 border-orange-200'>
                                <div className='flex justify-between items-center'>
                                    <span className='text-gray-600 text-xs md:text-sm font-semibold'>Total</span>
                                    <span className='text-xl md:text-2xl font-bold text-orange-600'>₹{AmountWithDeliveryfee.toFixed(0)}</span>
                                </div>
                                <p className='text-gray-400 text-[8px] md:text-xs mt-1 text-right'>Inclusive of all taxes</p>
                            </div>

                            <button className={`w-full mt-3 md:mt-4 py-2.5 md:py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-sm shadow-orange-200 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm`} onClick={handlePlaceOrder} disabled={loading || cartItems.length === 0}>
                                {loading ? (
                                    <>
                                        <ClipLoader size={16} color="white" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Place Order</span>
                                        <FaArrowRight size={12} />
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className={`bg-white border-2 border-gray-200 p-3 md:p-4 rounded-2xl shadow-sm ${fadeUp}`}>
                            <div className='grid grid-cols-3 gap-1 md:gap-2'>
                                <div className='text-center'>
                                    <FaHeadset className='text-orange-500 text-lg md:text-2xl mx-auto' />
                                    <p className='text-gray-600 text-[8px] md:text-xs font-medium mt-0.5 md:mt-1'>24/7 Support</p>
                                </div>
                                <div className='text-center'>
                                    <FaClock className='text-orange-500 text-lg md:text-2xl mx-auto' />
                                    <p className='text-gray-600 text-[8px] md:text-xs font-medium mt-0.5 md:mt-1'>On-time Delivery</p>
                                </div>
                                <div className='text-center'>
                                    <RiSecurePaymentLine className='text-orange-500 text-lg md:text-2xl mx-auto' />
                                    <p className='text-gray-600 text-[8px] md:text-xs font-medium mt-0.5 md:mt-1'>100% Safe</p>
                                </div>
                            </div>
                        </div>

                        {/* Security Badge */}
                        <div className={`bg-white border-2 border-gray-200 p-3 md:p-4 rounded-2xl shadow-sm text-center ${fadeUp}`}>
                            <div className='flex items-center justify-center gap-1.5 md:gap-2 mb-0.5 md:mb-1'>
                                <RiSecurePaymentLine size={14} className="text-green-600" />
                                <p className='text-gray-800 text-xs md:text-sm font-semibold'>🔒 Safe & Secure Payments</p>
                            </div>
                            <p className='text-gray-400 text-[8px] md:text-xs'>100% secure payments powered by trusted partners</p>
                            <div className='flex items-center justify-center gap-1.5 md:gap-3 mt-1.5 md:mt-2'>
                                <span className='text-gray-500 text-[8px] md:text-xs font-medium bg-gray-100 px-2 md:px-3 py-0.5 md:py-1 rounded-full border border-gray-200'>UPI</span>
                                <span className='text-gray-500 text-[8px] md:text-xs font-medium bg-gray-100 px-2 md:px-3 py-0.5 md:py-1 rounded-full border border-gray-200'>VISA</span>
                                <span className='text-gray-500 text-[8px] md:text-xs font-medium bg-gray-100 px-2 md:px-3 py-0.5 md:py-1 rounded-full border border-gray-200'>RuPay</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CheckOut