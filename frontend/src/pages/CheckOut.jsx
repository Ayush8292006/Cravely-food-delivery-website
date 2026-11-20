import React, { useEffect, useState } from 'react';
import { IoArrowBack } from "react-icons/io5";
import { MdMyLocation, MdOutlineDeliveryDining } from "react-icons/md";
import { FaCreditCard } from "react-icons/fa6";
import { 
    FaSearchLocation, FaTruck, FaArrowRight, FaCheckCircle, 
    FaShoppingBag, FaMapPin, FaHome, FaPhone, FaPen, 
    FaCheck, FaHeadset, FaClock, FaShieldAlt, FaRocket, 
    FaTag, FaLock
} from "react-icons/fa";
import { RiSecurePaymentLine } from "react-icons/ri";
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import "leaflet/dist/leaflet.css";
import { setAddress, setLocation } from '../redux/mapSlice';
import axios from 'axios';
import { toast } from "react-toastify";
import { clearCart, addMyOrder } from '../redux/userSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { serverUrl } from '../../config';
import Nav from '../components/Nav';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

function RecenterMap({ location }) {
    const map = useMap();
    useEffect(() => {
        if (location?.lat && location?.lon) {
            map.setView([location.lat, location.lon], 16, { animate: true });
        }
    }, [location, map]);
    return null;
}

function CheckOut() {
    const { location, address } = useSelector(state => state.map);
    const { cartItems, totalAmount, userData } = useSelector(state => state.user);
    const [addressInput, setAddressInput] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [loading, setLoading] = useState(false);
    const [completedSteps, setCompletedSteps] = useState([1]);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [tempAddress, setTempAddress] = useState("");
    const [tempMobile, setTempMobile] = useState("");
    const [showMap, setShowMap] = useState(false);
    const [showSavedAddresses, setShowSavedAddresses] = useState(false);
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const routerLocation = useLocation();
    const apiKey = import.meta.env.VITE_GEOAPIKEY;
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

    const appliedCoupon = routerLocation.state?.appliedCoupon || (() => {
        try {
            const saved = localStorage.getItem('appliedCoupon');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    })();
    const discountAmount = appliedCoupon?.discountAmount || routerLocation.state?.discountAmount || 0;
    const deliveryInstructions = routerLocation.state?.deliveryInstructions || localStorage.getItem('cookingInstructions') || "";

    const DELIVERY_THRESHOLD = 199;
    const DELIVERY_FEE = 30;
    const PACKAGING_FEE = 0;
    const TAX_AMOUNT = 23; // Fixed tax ₹23

    const currentDeliveryFee = (totalAmount >= DELIVERY_THRESHOLD || appliedCoupon?.code === 'FREEDEL') ? 0 : DELIVERY_FEE;
    const AmountWithDeliveryfee = Math.max(0, totalAmount + currentDeliveryFee + PACKAGING_FEE + TAX_AMOUNT - discountAmount);
    const amountNeededForFreeDelivery = Math.max(0, DELIVERY_THRESHOLD - totalAmount);

    const defaultLat = location?.lat || 26.4499;
    const defaultLon = location?.lon || 80.3319;

    const onDragEnd = (e) => {
        const { lat, lng } = e.target._latlng;
        dispatch(setLocation({ lat: lat, lon: lng }));
        getAddressByLatLng(lat, lng);
    };

    const getCurrentLocation = () => {
        if (userData?.location?.coordinates?.length === 2) {
            const latitude = userData.location.coordinates[1];
            const longitude = userData.location.coordinates[0];
            dispatch(setLocation({ lat: latitude, lon: longitude }));
            getAddressByLatLng(latitude, longitude);
        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    dispatch(setLocation({ lat: latitude, lon: longitude }));
                    getAddressByLatLng(latitude, longitude);
                },
                () => {
                    toast.warning("Couldn't fetch location. Please enter address manually.");
                }
            );
        } else {
            toast.warning("Geolocation not supported by browser. Enter address manually.");
        }
    };

    const getAddressByLatLng = async (lat, lng) => {
        try {
            if (!apiKey) return;
            const result = await axios.get(
                `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`
            );
            const fullAddress = (result?.data?.results[0]?.address_line1 || '') +
                (result?.data?.results[0]?.address_line2 ? ", " + result.data.results[0].address_line2 : "");
            if (fullAddress) {
                dispatch(setAddress(fullAddress));
                setAddressInput(fullAddress);
                setTempAddress(fullAddress);
                markStepComplete(2);
            }
        } catch (error) {
            console.warn("Geocoding reverse error:", error);
        }
    };

    useEffect(() => {
        getCurrentLocation();
        
        if (userData?.mobile) {
            const mobile = userData.mobile.toString().trim();
            if (mobile !== '0000000000' && mobile.length >= 10) {
                setMobileNumber(mobile);
                setTempMobile(mobile);
            }
        }
        
        if (userData?.addresses?.length > 0) {
            const defaultAddr = userData.addresses.find(a => a.isDefault) || userData.addresses[0];
            if (defaultAddr) {
                setAddressInput(defaultAddr.text);
                setTempAddress(defaultAddr.text);
                markStepComplete(2);
                if (defaultAddr.latitude && defaultAddr.longitude) {
                    dispatch(setLocation({ 
                        lat: defaultAddr.latitude, 
                        lon: defaultAddr.longitude 
                    }));
                }
            }
        }
    }, [userData]);

    const handleEditAddress = () => {
        setIsEditingAddress(true);
        setTempAddress(addressInput);
        const currentMobile = mobileNumber === '0000000000' ? '' : mobileNumber;
        setTempMobile(currentMobile);
        setShowMap(true);
        setShowSavedAddresses(false);
    };

    const getLatLngByAddress = async () => {
        if (!tempAddress.trim()) {
            toast.error("Please enter an address first");
            return;
        }
        try {
            if (!apiKey) {
                toast.error("Geocoding service not configured");
                return;
            }
            const result = await axios.get(
                `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(tempAddress)}&apiKey=${apiKey}`
            );
            if (result.data.features && result.data.features.length > 0) {
                const { lat, lon } = result.data.features[0].properties;
                dispatch(setLocation({ lat, lon }));
                toast.success("Location pinpointed on map!");
            } else {
                toast.error("Address not found on map. Try adjusting search terms.");
            }
        } catch (error) {
            console.warn("Geocoding search error:", error);
            toast.error("Failed to find location");
        }
    };

    const handleSelectSavedAddress = (savedAddr) => {
        setTempAddress(savedAddr.text);
        if (savedAddr.latitude && savedAddr.longitude) {
            dispatch(setLocation({ 
                lat: savedAddr.latitude, 
                lon: savedAddr.longitude 
            }));
        }
        if (savedAddr.phone && savedAddr.phone !== '0000000000') {
            setTempMobile(savedAddr.phone);
            setMobileNumber(savedAddr.phone);
        }
        setShowSavedAddresses(false);
        toast.success("Address loaded!");
    };

    const handleSaveAddress = () => {
        if (!tempAddress.trim()) {
            toast.error("Please enter a valid address");
            return;
        }
        if (!tempMobile.trim() || tempMobile.length < 10) {
            toast.error("Please enter a valid 10-digit mobile number");
            return;
        }
        if (!location?.lat || !location?.lon) {
            toast.error("Please select a location on the map");
            return;
        }
        setAddressInput(tempAddress);
        setMobileNumber(tempMobile);
        setIsEditingAddress(false);
        setShowMap(false);
        setShowSavedAddresses(false);
        markStepComplete(2);
        toast.success("Delivery address confirmed!");
    };

    const markStepComplete = (step) => {
        setCompletedSteps(prev => prev.includes(step) ? prev : [...prev, step]);
    };

    const paymentMethods = [
        { 
            id: 'cod', 
            icon: <MdOutlineDeliveryDining size={22} />, 
            label: 'Cash on Delivery', 
            sub: 'Pay on delivery via cash or UPI' 
        },
        { 
            id: 'online', 
            icon: <FaCreditCard size={20} />, 
            label: 'Online Payment', 
            sub: 'UPI, Cards & NetBanking' 
        },
    ];

    const handleMobileChange = (value) => {
        const cleaned = value.replace(/\D/g, '');
        setTempMobile(cleaned);
        setMobileNumber(cleaned);
    };

    const handlePlaceOrder = async () => {
        if (!userData) {
            toast.info("Please sign in to place your order");
            navigate("/signin");
            return;
        }

        if (!cartItems || cartItems.length === 0) {
            toast.error("Your cart is empty!");
            return;
        }
        
        if (!addressInput || addressInput.trim() === "") {
            toast.error("Please enter delivery address!");
            return;
        }
        
        if (!mobileNumber || mobileNumber.trim() === "" || mobileNumber.length < 10) {
            toast.error("Please enter a valid 10-digit mobile number!");
            return;
        }
        
        if (!location?.lat || !location?.lon) {
            toast.error("Please select delivery location on map!");
            return;
        }

        setLoading(true);

        try {
            const formattedCartItems = cartItems.map(item => ({
                id: item._id || item.id,
                name: item.name,
                price: Number(item.price),
                quantity: Number(item.quantity),
                shop: item.shop?._id || item.shop,
                image: item.image || ''
            }));

            const orderData = {
                cartItems: formattedCartItems,
                totalAmount: AmountWithDeliveryfee,
                paymentMethod: paymentMethod === 'cod' ? 'cod' : 'online',
                discountAmount: discountAmount,
                couponCode: appliedCoupon?.code || null,
                deliveryInstructions: deliveryInstructions,
                deliveryAddress: {
                    text: addressInput,
                    latitude: Number(location.lat),
                    longitude: Number(location.lon)
                },
                mobile: mobileNumber,
                customerName: userData?.fullName || 'Customer'
            };

            const response = await axios.post(
                `${serverUrl}/api/order/place-order`,
                orderData,
                { withCredentials: true }
            );

            if (paymentMethod === "cod") {
                localStorage.removeItem('appliedCoupon');
                localStorage.removeItem('cookingInstructions');
                dispatch(addMyOrder(response.data));
                dispatch(clearCart());
                setLoading(false);
                toast.success("Order placed successfully! 🎉");
                navigate(`/order-placed?order_id=${response.data._id}`);
            } else {
                if (!razorpayKey) {
                    toast.error("Payment configuration missing. Please try again.");
                    setLoading(false);
                    return;
                }

                if (typeof window.Razorpay === 'undefined') {
                    const script = document.createElement('script');
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                    script.async = true;
                    script.onload = () => handleRazorpayPayment(response.data);
                    script.onerror = () => {
                        toast.error("Payment service unavailable. Please try again.");
                        setLoading(false);
                    };
                    document.body.appendChild(script);
                } else {
                    handleRazorpayPayment(response.data);
                }
            }
        } catch (error) {
            setLoading(false);
            toast.error(error.response?.data?.message || "Failed to place order. Please try again.");
        }
    };

    const handleRazorpayPayment = (orderData) => {
        const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
        
        if (!keyId) {
            toast.error("Payment configuration missing");
            setLoading(false);
            return;
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
                    );
                    
                    localStorage.removeItem('appliedCoupon');
                    localStorage.removeItem('cookingInstructions');
                    dispatch(addMyOrder(verifyResult.data));
                    dispatch(clearCart());
                    setLoading(false);
                    toast.success("Payment verified! Order placed 🎉");
                    navigate(`/order-placed?order_id=${verifyResult.data._id}&payment_id=${razorpayResponse.razorpay_payment_id}`);
                } catch (error) {
                    toast.error(error.response?.data?.message || "Payment verification failed");
                    setLoading(false);
                }
            },
            modal: {
                ondismiss: function() {
                    setLoading(false);
                    toast.info("Payment cancelled");
                }
            },
            prefill: {
                name: userData?.fullName || "",
                email: userData?.email || "",
                contact: mobileNumber || ""
            },
            theme: {
                color: "#FF6B00"
            }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
    };

    return (
        <div className="min-h-screen bg-[#0A090D] text-white flex flex-col font-sans selection:bg-[#FF6B00] selection:text-white">
            {/* Top Navigation */}
            <Nav />

            {/* Main Content Area */}
            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12">
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between gap-4 mb-6 sm:mb-8"
                >
                    <div className="flex items-center gap-3">
                        <button 
                            type="button"
                            onClick={() => navigate("/cart")}
                            className="w-10 h-10 rounded-xl bg-[#13121A] border border-white/10 hover:border-white/20 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
                            aria-label="Back to Cart"
                        >
                            <IoArrowBack size={18} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                                    Checkout
                                </h1>
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20">
                                    {cartItems?.length || 0} items
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 flex items-center gap-1.5">
                                <FaLock size={11} className="text-[#FF6B00]" />
                                Secure SSL Encrypted Checkout
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Animated Stepper */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.05 }}
                    className="grid grid-cols-4 gap-2 sm:gap-4 mb-8"
                >
                    {[
                        { step: 1, label: 'Cart', sub: 'Review Items' },
                        { step: 2, label: 'Address', sub: 'Delivery Point' },
                        { step: 3, label: 'Payment', sub: 'Method' },
                        { step: 4, label: 'Confirm', sub: 'Order Placed' }
                    ].map((item) => {
                        const isDone = completedSteps.includes(item.step);
                        const isCurrent = item.step === 3;
                        return (
                            <div 
                                key={item.step}
                                className={`p-2.5 sm:p-3 rounded-2xl border transition-all text-center ${
                                    isDone 
                                        ? 'bg-[#13121A] border-emerald-500/30' 
                                        : isCurrent
                                            ? 'bg-[#13121A] border-[#FF6B00]'
                                            : 'bg-[#13121A]/50 border-white/5 opacity-60'
                                }`}
                            >
                                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1.5 transition-all ${
                                    isDone 
                                        ? 'bg-emerald-500 text-white' 
                                        : isCurrent 
                                            ? 'bg-[#FF6B00] text-white' 
                                            : 'bg-zinc-800 text-zinc-400'
                                }`}>
                                    {isDone ? <FaCheck size={11} /> : item.step}
                                </div>
                                <p className={`text-xs sm:text-sm font-bold ${
                                    isDone ? 'text-emerald-400' : isCurrent ? 'text-white' : 'text-zinc-500'
                                }`}>
                                    {item.label}
                                </p>
                                <p className="text-[10px] text-zinc-500 hidden sm:block">
                                    {item.sub}
                                </p>
                            </div>
                        );
                    })}
                </motion.div>

                {/* Guest banner if unauthenticated */}
                {!userData && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 rounded-2xl bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-between gap-4"
                    >
                        <div>
                            <p className="text-sm font-bold text-white">
                                You are checking out as a Guest
                            </p>
                            <p className="text-xs text-zinc-400 mt-0.5">
                                Sign in to save your delivery addresses and track live orders seamlessly.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/signin')}
                            className="px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E55A00] text-white font-bold text-xs shrink-0 transition-colors"
                        >
                            Sign In
                        </button>
                    </motion.div>
                )}

                {/* Main 2-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    
                    {/* LEFT COLUMN: Items, Address, Payment */}
                    <div className="lg:col-span-7 space-y-5">
                        
                        {/* 1. Review Cart Items */}
                        <motion.section 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="bg-[#13121A] border border-white/10 rounded-2xl p-5"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                                        <FaCheck size={11} />
                                    </div>
                                    <div>
                                        <h2 className="text-sm sm:text-base font-bold text-white">
                                            1. Order Items
                                        </h2>
                                        <p className="text-xs text-zinc-400">
                                            {cartItems.length} items from your cart
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate('/cart')}
                                    className="text-xs font-semibold text-[#FF6B00] hover:underline"
                                >
                                    Modify Cart
                                </button>
                            </div>

                            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                                {cartItems.map((item, idx) => (
                                    <div 
                                        key={item._id || item.id || idx}
                                        className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3 hover:border-white/20 transition-colors"
                                    >
                                        <img 
                                            src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80'} 
                                            alt={item.name}
                                            className="w-12 h-12 rounded-lg object-cover bg-zinc-900 border border-white/10 shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                                                {item.name}
                                            </h4>
                                            <p className="text-[11px] text-zinc-400">
                                                ₹{item.price} × {item.quantity}
                                            </p>
                                        </div>
                                        <span className="font-bold text-sm text-white shrink-0">
                                            ₹{(Number(item.price) * Number(item.quantity)).toFixed(0)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.section>

                        {/* 2. Delivery Address */}
                        <motion.section 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.05 }}
                            className="bg-[#13121A] border border-white/10 rounded-2xl p-5"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                                        addressInput 
                                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                                            : 'bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-[#FF6B00]'
                                    }`}>
                                        {addressInput ? <FaCheck size={11} /> : '2'}
                                    </div>
                                    <div>
                                        <h2 className="text-sm sm:text-base font-bold text-white">
                                            2. Delivery Address
                                        </h2>
                                        <p className="text-xs text-zinc-400">
                                            Where should our rider drop your order?
                                        </p>
                                    </div>
                                </div>

                                {!isEditingAddress && addressInput && (
                                    <button
                                        type="button"
                                        onClick={handleEditAddress}
                                        className="text-xs font-semibold text-[#FF6B00] hover:underline flex items-center gap-1"
                                    >
                                        <FaPen size={10} /> Change
                                    </button>
                                )}
                            </div>

                            <AnimatePresence mode="wait">
                                {isEditingAddress || !addressInput ? (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-3.5"
                                    >
                                        {/* Address Input & Actions */}
                                        <div className="flex gap-2">
                                            <div className="flex-1 relative">
                                                <input 
                                                    type="text" 
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6B00] transition-colors"
                                                    placeholder="Enter full street address, flat, landmark..." 
                                                    value={tempAddress} 
                                                    onChange={(e) => setTempAddress(e.target.value)} 
                                                    onFocus={() => { if (userData?.addresses?.length > 0) setShowSavedAddresses(true); }}
                                                />

                                                {/* Saved addresses dropdown */}
                                                {showSavedAddresses && userData?.addresses?.length > 0 && (
                                                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#13121A] border border-white/10 rounded-xl max-h-40 overflow-y-auto z-20 shadow-2xl p-1">
                                                        {userData.addresses.map((addr, idx) => (
                                                            <div 
                                                                key={idx} 
                                                                className="px-3 py-2 text-zinc-300 text-xs hover:bg-white/10 rounded-lg cursor-pointer transition flex items-center gap-2"
                                                                onClick={() => handleSelectSavedAddress(addr)}
                                                            >
                                                                <FaHome size={11} className="text-[#FF6B00]" />
                                                                <span className="flex-1 truncate">{addr.text}</span>
                                                                {addr.isDefault && (
                                                                    <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                                                        Default
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <button 
                                                type="button"
                                                onClick={getLatLngByAddress}
                                                title="Locate on Map"
                                                className="px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-zinc-300 hover:text-white hover:border-[#FF6B00] transition-colors"
                                            >
                                                <FaSearchLocation size={14} />
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={getCurrentLocation}
                                                title="Current Location"
                                                className="px-3 py-2.5 rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white transition-colors"
                                            >
                                                <MdMyLocation size={16} />
                                            </button>
                                        </div>

                                        {/* Contact Mobile Number */}
                                        <div>
                                            <input 
                                                type="tel" 
                                                className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6B00] transition-colors"
                                                placeholder="10-digit mobile number for delivery updates (e.g. 9876543210)" 
                                                value={tempMobile} 
                                                onChange={(e) => handleMobileChange(e.target.value)} 
                                                maxLength={10} 
                                            />
                                        </div>

                                        {/* Leaflet Draggable Map Preview */}
                                        {showMap && (
                                            <div className="h-44 w-full rounded-xl overflow-hidden border border-white/10">
                                                <MapContainer className="w-full h-full" center={[defaultLat, defaultLon]} zoom={16}>
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

                                        {/* Confirm Address Buttons */}
                                        <div className="flex gap-2.5">
                                            <button 
                                                type="button"
                                                onClick={handleSaveAddress}
                                                className="flex-1 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E55A00] text-white text-xs font-bold transition-colors"
                                            >
                                                <FaCheck size={11} className="inline mr-1" /> Confirm Address
                                            </button>
                                            {addressInput && (
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        setIsEditingAddress(false);
                                                        setTempAddress(addressInput);
                                                        setTempMobile(mobileNumber);
                                                        setShowMap(false);
                                                    }}
                                                    className="px-4 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 text-xs font-semibold transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-4 rounded-xl bg-black/40 border border-white/10"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-bold text-sm text-white flex items-center gap-1.5">
                                                    <FaMapPin className="text-[#FF6B00]" size={12} />
                                                    {userData?.fullName || 'Customer'}
                                                </p>
                                                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                                                    {addressInput}
                                                </p>
                                                <p className="text-xs text-zinc-400 mt-1.5 flex items-center gap-1.5">
                                                    <FaPhone size={10} className="text-zinc-500" />
                                                    {mobileNumber ? `+91 ${mobileNumber}` : 'No phone specified'}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.section>

                        {/* 3. Payment Method */}
                        <motion.section 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="bg-[#13121A] border border-white/10 rounded-2xl p-5"
                        >
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-7 h-7 rounded-lg bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-[#FF6B00] flex items-center justify-center font-bold text-xs">
                                    3
                                </div>
                                <div>
                                    <h2 className="text-sm sm:text-base font-bold text-white">
                                        3. Payment Method
                                    </h2>
                                    <p className="text-xs text-zinc-400">
                                        Choose your preferred way to pay
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {paymentMethods.map((method) => {
                                    const isSelected = paymentMethod === method.id;
                                    return (
                                        <motion.div 
                                            key={method.id}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                setPaymentMethod(method.id);
                                                markStepComplete(3);
                                            }}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3.5 relative overflow-hidden ${
                                                isSelected 
                                                    ? 'bg-[#FF6B00]/10 border-[#FF6B00]' 
                                                    : 'bg-black/40 border-white/10 hover:border-white/20'
                                            }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                isSelected ? 'bg-[#FF6B00] text-white' : 'bg-zinc-800 text-zinc-400'
                                            }`}>
                                                {method.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs sm:text-sm font-bold text-white">
                                                    {method.label}
                                                </p>
                                                <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">
                                                    {method.sub}
                                                </p>
                                            </div>
                                            {isSelected && (
                                                <FaCheckCircle className="text-[#FF6B00] shrink-0" size={16} />
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.section>

                        {/* Delivery Instructions Reminder */}
                        {deliveryInstructions && (
                            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-400 flex items-start gap-2">
                                <span className="text-[#FF6B00] font-bold shrink-0">Note:</span>
                                <span>{deliveryInstructions}</span>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Order Summary & Place Order */}
                    <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
                        
                        {/* Order Summary Breakdown */}
                        <motion.section 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.15 }}
                            className="bg-[#13121A] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl"
                        >
                            <h3 className="font-extrabold text-white text-base sm:text-lg mb-4">
                                Bill Details
                            </h3>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-zinc-400">
                                    <span>Item Total ({cartItems.length} items)</span>
                                    <span className="font-semibold text-white">₹{totalAmount.toFixed(0)}</span>
                                </div>

                                <div className="flex justify-between text-zinc-400">
                                    <span>Delivery Fee</span>
                                    <span className={currentDeliveryFee === 0 ? 'text-emerald-400 font-bold' : 'font-semibold text-white'}>
                                        {currentDeliveryFee === 0 ? 'FREE' : `₹${currentDeliveryFee}`}
                                    </span>
                                </div>

                                <div className="flex justify-between text-zinc-400">
                                    <span>Packaging & Handling</span>
                                    <span className="font-semibold text-white">₹{PACKAGING_FEE}</span>
                                </div>

                                <div className="flex justify-between text-zinc-400">
                                    <span>Govt Taxes (GST)</span>
                                    <span className="font-semibold text-white">₹{TAX_AMOUNT}</span>
                                </div>

                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-emerald-400 font-semibold py-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 rounded-xl text-xs">
                                        <span>Coupon Discount ({appliedCoupon?.code})</span>
                                        <span>- ₹{discountAmount}</span>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-white/10 flex justify-between items-baseline">
                                    <div>
                                        <span className="font-extrabold text-lg text-white block">
                                            To Pay
                                        </span>
                                        <span className="text-[10px] text-zinc-400">
                                            Inclusive of all taxes
                                        </span>
                                    </div>
                                    <span className="text-2xl sm:text-3xl font-extrabold text-[#FF6B00]">
                                        ₹{AmountWithDeliveryfee.toFixed(0)}
                                    </span>
                                </div>

                                {(discountAmount > 0 || currentDeliveryFee === 0) && (
                                    <div className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg text-center mt-2">
                                        🎉 You saved ₹{discountAmount + (currentDeliveryFee === 0 ? 30 : 0)} on this order!
                                    </div>
                                )}
                            </div>

                            {/* Place Order CTA Button */}
                            <motion.button 
                                whileTap={{ scale: 0.98 }}
                                onClick={handlePlaceOrder}
                                disabled={loading || cartItems.length === 0}
                                className="w-full mt-6 py-3.5 sm:py-4 rounded-xl bg-[#FF6B00] hover:bg-[#E55A00] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#FF6B00]/20"
                            >
                                {loading ? (
                                    <>
                                        <ClipLoader size={16} color="white" />
                                        <span>Confirming Order...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Place Order • ₹{AmountWithDeliveryfee.toFixed(0)}</span>
                                        <FaArrowRight size={13} />
                                    </>
                                )}
                            </motion.button>
                        </motion.section>

                        {/* Safe & Secure Guarantee */}
                        <div className="bg-[#13121A] border border-white/10 rounded-2xl p-4">
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <FaHeadset className="text-[#FF6B00] text-lg mx-auto" />
                                    <p className="text-[10px] text-zinc-400 font-medium mt-1">24/7 Support</p>
                                </div>
                                <div>
                                    <FaClock className="text-[#FF6B00] text-lg mx-auto" />
                                    <p className="text-[10px] text-zinc-400 font-medium mt-1">Live Tracking</p>
                                </div>
                                <div>
                                    <RiSecurePaymentLine className="text-[#FF6B00] text-lg mx-auto" />
                                    <p className="text-[10px] text-zinc-400 font-medium mt-1">Safe Checkout</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default CheckOut;
