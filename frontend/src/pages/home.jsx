import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import UserDashboard from '../components/UserDashboard'
import OwnerDashboard from '../components/OwnerDashboard'
import DeliveryBoy from '../components/DeliveryBoy'
import { ClipLoader } from 'react-spinners'

function Home() {
    const { userData } = useSelector(state => state.user)

    // ✅ If no user, redirect to signin
    if (!userData) {
        return <Navigate to="/signin" />
    }

    // ✅ Loading state
    if (!userData.role) {
        return (
            <div className='min-h-screen bg-[#0a0a0f] flex items-center justify-center'>
                <ClipLoader size={50} color="#ff2d55" />
            </div>
        )
    }

    return (
        <>
            {userData.role === "user" && <UserDashboard />}
            {userData.role === "owner" && <OwnerDashboard />}
            {userData.role === "deliveryBoy" && <DeliveryBoy />}
        </>
    )
}

export default Home