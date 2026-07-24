import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../src/App'
import { useDispatch, useSelector } from 'react-redux'
import { setMyShopData } from '../src/redux/ownerSlice'

function useGetMyShop() {
    const dispatch = useDispatch()
    const {userData}=useSelector(state=>state.user)
    useEffect(() => {
        const fetchShop = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/shop/get-my`,
                    { withCredentials: true })
                dispatch(setMyShopData(result.data))
                // console.log(result)
            } catch (error) {
                console.log(error)
            }
        }
        fetchShop()

    }, [userData])
}

export default useGetMyShop