// src/components/DeliveryBoyTracking.js

import React, { useState, useEffect } from 'react'
import scooter from '../assets/scooter.png'
import home from '../assets/home.png'
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapContainer, Marker, Polyline, Popup, TileLayer, ZoomControl } from 'react-leaflet'
import { FaMapMarkerAlt, FaTruck, FaHome, FaSync, FaExclamationTriangle, FaLocationArrow } from 'react-icons/fa'

const FALLBACK_SCOOTER = 'https://via.placeholder.com/45/e85d04/fff?text=🛵'
const FALLBACK_HOME = 'https://via.placeholder.com/40/4facfe/fff?text=🏠'

const deliveryBoyIcon = new L.icon({
    iconUrl: scooter || FALLBACK_SCOOTER,
    iconSize: [45, 45],
    iconAnchor: [22, 45],
    popupAnchor: [0, -45]
})

const customerIcon = new L.icon({
    iconUrl: home || FALLBACK_HOME,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
})

function DeliveryBoyTracking({ data, onRefresh }) {
    const [mapLoading, setMapLoading] = useState(true)
    const [mapError, setMapError] = useState(null)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [distance, setDistance] = useState(0)
    const [isTracking, setIsTracking] = useState(false)

    const DEFAULT_LAT = 25.6191
    const DEFAULT_LON = 85.1335

    const deliveryBoyLat = data?.deliveryBoyLocation?.lat || DEFAULT_LAT
    const deliveryBoyLon = data?.deliveryBoyLocation?.lon || DEFAULT_LON
    const customerLat = data?.customerLocation?.lat || DEFAULT_LAT
    const customerLon = data?.customerLocation?.lon || DEFAULT_LON

    const path = [
        [deliveryBoyLat, deliveryBoyLon],
        [customerLat, customerLon]
    ]

    const center = [deliveryBoyLat, deliveryBoyLon]

    // ✅ Calculate distance
    useEffect(() => {
        const calcDistance = () => {
            const R = 6371
            const dLat = (customerLat - deliveryBoyLat) * Math.PI / 180
            const dLon = (customerLon - deliveryBoyLon) * Math.PI / 180
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(deliveryBoyLat * Math.PI / 180) * Math.cos(customerLat * Math.PI / 180) *
                      Math.sin(dLon/2) * Math.sin(dLon/2)
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
            const d = R * c
            setDistance(Math.round(d * 10) / 10)
        }
        calcDistance()
    }, [deliveryBoyLat, deliveryBoyLon, customerLat, customerLon])

    // ✅ Handle map load
    useEffect(() => {
        const timer = setTimeout(() => {
            setMapLoading(false)
        }, 1500)
        return () => clearTimeout(timer)
    }, [])

    // ✅ Handle refresh
    const handleRefresh = () => {
        setIsRefreshing(true)
        if (onRefresh) {
            onRefresh()
        }
        setTimeout(() => {
            setIsRefreshing(false)
        }, 1000)
    }

    // ✅ Toggle tracking
    const toggleTracking = () => {
        setIsTracking(!isTracking)
    }

    // ✅ Validate coordinates
    const isValidCoordinate = (lat, lon) => {
        return lat && lon && !isNaN(lat) && !isNaN(lon) && 
               lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
    }

    if (!isValidCoordinate(deliveryBoyLat, deliveryBoyLon) || 
        !isValidCoordinate(customerLat, customerLon)) {
        return (
            <div className='relative w-full h-[350px] rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-50 flex items-center justify-center'>
                <div className='text-center'>
                    <div className='w-16 h-16 mx-auto rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mb-3'>
                        <FaExclamationTriangle className='text-amber-500 text-2xl' />
                    </div>
                    <p className='text-gray-700 font-semibold text-sm'>Location data unavailable</p>
                    <p className='text-gray-400 text-xs'>Please check your connection</p>
                    <button 
                        onClick={handleRefresh}
                        className='mt-3 px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-sm shadow-orange-200 transition'
                    >
                        <FaSync className={isRefreshing ? 'animate-spin' : ''} className="inline mr-2" /> Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className='relative w-full h-[350px] rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm'>
            
            {mapLoading && (
                <div className='absolute inset-0 bg-white flex items-center justify-center z-20'>
                    <div className='flex flex-col items-center gap-3'>
                        <div className='w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin' />
                        <p className='text-gray-500 text-sm font-medium animate-pulse'>Loading map...</p>
                    </div>
                </div>
            )}

            {mapError && (
                <div className='absolute inset-0 bg-white flex items-center justify-center z-20'>
                    <div className='text-center'>
                        <div className='w-16 h-16 mx-auto rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mb-3'>
                            <FaExclamationTriangle className='text-red-500 text-2xl' />
                        </div>
                        <p className='text-gray-700 font-semibold text-sm'>{mapError}</p>
                        <button 
                            onClick={() => { setMapError(null); setMapLoading(true); setTimeout(() => setMapLoading(false), 1500); }}
                            className='mt-3 px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-sm shadow-orange-200 transition'
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            <MapContainer 
                className='w-full h-full'
                center={center}
                zoom={15}
                zoomControl={false}
                whenReady={() => setMapLoading(false)}
                onError={() => setMapError('Failed to load map')}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <ZoomControl position="bottomright" />

                <Marker 
                    position={[deliveryBoyLat, deliveryBoyLon]}
                    icon={deliveryBoyIcon}
                >
                    <Popup>
                        <div className='text-center'>
                            <div className='w-10 h-10 mx-auto rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center'>
                                <FaTruck className='text-orange-500 text-lg' />
                            </div>
                            <p className='font-bold text-gray-800 text-sm mt-1'>🚴 Delivery Boy</p>
                            <p className='text-xs text-gray-500'>Moving towards you</p>
                            <p className='text-xs text-orange-600 font-bold'>{distance} km away</p>
                        </div>
                    </Popup>
                </Marker>

                <Marker 
                    position={[customerLat, customerLon]}
                    icon={customerIcon}
                >
                    <Popup>
                        <div className='text-center'>
                            <div className='w-10 h-10 mx-auto rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center'>
                                <FaHome className='text-blue-500 text-lg' />
                            </div>
                            <p className='font-bold text-gray-800 text-sm mt-1'>📍 Your Location</p>
                            <p className='text-xs text-gray-500'>Delivery destination</p>
                        </div>
                    </Popup>
                </Marker>

                <Polyline 
                    positions={path} 
                    color="#e85d04" 
                    weight={4}
                    opacity={0.8}
                    dashArray="8 8"
                />
            </MapContainer>

            {/* Info Overlay */}
            <div className='absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-full border-2 border-gray-200 shadow-lg flex items-center gap-3 text-xs'>
                <span className='text-gray-600 font-medium flex items-center gap-1.5'>
                    <span className='w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse' />
                    Delivery Boy
                </span>
                <span className='text-gray-300'>|</span>
                <span className='text-gray-600 font-medium flex items-center gap-1.5'>
                    <span className='w-2.5 h-2.5 rounded-full bg-blue-400' />
                    Customer
                </span>
                <span className='text-gray-300'>|</span>
                <span className='text-orange-600 font-bold'>
                    📍 {distance} km away
                </span>

                <button 
                    onClick={handleRefresh}
                    className='text-gray-400 hover:text-orange-500 transition-all duration-300 p-1.5 rounded-full hover:bg-orange-50'
                    aria-label="Refresh map"
                >
                    <FaSync className={isRefreshing ? 'animate-spin' : ''} size={12} />
                </button>

                <button 
                    onClick={toggleTracking}
                    className={`text-xs font-bold px-2.5 py-1 rounded-full transition-all duration-300 ${
                        isTracking 
                            ? 'bg-green-100 text-green-700 border-2 border-green-200' 
                            : 'bg-gray-100 text-gray-500 border-2 border-gray-200'
                    }`}
                >
                    <FaLocationArrow size={10} className="inline mr-1" />
                    {isTracking ? 'Live' : 'Track'}
                </button>
            </div>

            {/* Distance Badge */}
            <div className='absolute top-3 right-3 bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-3 py-1.5 shadow-md'>
                <div className='flex items-center gap-2'>
                    <FaMapMarkerAlt className='text-orange-500 text-xs' />
                    <span className='text-gray-700 font-bold text-xs'>
                        {distance} km
                    </span>
                    <span className='text-gray-400 text-[8px] font-medium'>away</span>
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .animate-pulse {
                    animation: pulse 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    )
}

export default DeliveryBoyTracking