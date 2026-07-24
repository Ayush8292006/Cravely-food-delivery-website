import React from 'react'
import scooter from '../assets/scooter.png'
import home from '../assets/home.png'
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import { FaMapMarkerAlt, FaTruck, FaHome } from 'react-icons/fa'

const deliveryBoyIcon = new L.icon({
    iconUrl: scooter,
    iconSize: [45, 45],
    iconAnchor: [22, 45],
    popupAnchor: [0, -45]
})

const customerIcon = new L.icon({
    iconUrl: home,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
})

function DeliveryBoyTracking({ data }) {
    const deliveryBoyLat = data.deliveryBoyLocation?.lat || 26.4499
    const deliveryBoyLon = data.deliveryBoyLocation?.lon || 80.3319
    const customerLat = data.customerLocation?.lat || 26.4499
    const customerLon = data.customerLocation?.lon || 80.3319

    const path = [
        [deliveryBoyLat, deliveryBoyLon],
        [customerLat, customerLon]
    ]

    const center = [deliveryBoyLat, deliveryBoyLon]

    return (
        <div className='relative w-full h-[350px] rounded-2xl overflow-hidden border border-white/5 shadow-xl'>
            <MapContainer 
                className='w-full h-full'
                center={center}
                zoom={16}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker 
                    position={[deliveryBoyLat, deliveryBoyLon]}
                    icon={deliveryBoyIcon}
                >
                    <Popup>
                        <div className='text-center'>
                            <FaTruck className='text-[#ff6b35] text-xl mx-auto' />
                            <p className='font-semibold text-sm'>🚴 Delivery Boy</p>
                            <p className='text-xs text-gray-500'>Moving towards you</p>
                        </div>
                    </Popup>
                </Marker>

                <Marker 
                    position={[customerLat, customerLon]}
                    icon={customerIcon}
                >
                    <Popup>
                        <div className='text-center'>
                            <FaHome className='text-blue-500 text-xl mx-auto' />
                            <p className='font-semibold text-sm'>📍 Your Location</p>
                            <p className='text-xs text-gray-500'>Delivery destination</p>
                        </div>
                    </Popup>
                </Marker>

                <Polyline 
                    positions={path} 
                    color="#ff2d55" 
                    weight={3}
                    opacity={0.8}
                    dashArray="5 5"
                />
            </MapContainer>

            {/* ✅ Info Overlay */}
            <div className='absolute bottom-4 left-1/2 -translate-x-1/2 glass-premium-ultra px-4 py-2 rounded-full border border-white/10 flex items-center gap-4 text-xs'>
                <span className='text-white/60 flex items-center gap-1'>
                    <span className='w-2 h-2 rounded-full bg-[#ff2d55] animate-pulse' />
                    Delivery Boy
                </span>
                <span className='text-white/20'>|</span>
                <span className='text-white/60 flex items-center gap-1'>
                    <span className='w-2 h-2 rounded-full bg-blue-400' />
                    Customer
                </span>
                <span className='text-white/20'>|</span>
                <span className='text-white/40'>
                    {Math.round(Math.sqrt(
                        Math.pow((deliveryBoyLat - customerLat) * 111, 2) + 
                        Math.pow((deliveryBoyLon - customerLon) * 111, 2)
                    ) * 10) / 10} km away
                </span>
            </div>

            <style jsx>{`
                .glass-premium-ultra {
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }
            `}</style>
        </div>
    )
}

export default DeliveryBoyTracking