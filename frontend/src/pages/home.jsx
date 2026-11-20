import React from 'react'
import { useSelector } from 'react-redux'
import UserDashboard from '../components/UserDashboard'
import OwnerDashboard from '../components/OwnerDashboard'
import DeliveryBoy from '../components/DeliveryBoy'
import { ClipLoader } from 'react-spinners'

function Home() {
    const { userData } = useSelector(state => state.user)

    // Role-specific dashboards
    if (userData?.role === "owner") {
        return <OwnerDashboard />
    }
    if (userData?.role === "deliveryBoy") {
        return <DeliveryBoy />
    }

    // Default to Customer Dashboard (UserDashboard) for customers & visitors
    return <UserDashboard />
}

export default Home
