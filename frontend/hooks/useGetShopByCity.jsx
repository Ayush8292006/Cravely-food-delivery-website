import axios from 'axios'
import { useEffect } from 'react'
import { serverUrl } from '../src/App'   // ✅ SRC KE ANDAR SE
import { useDispatch, useSelector } from 'react-redux'
import { setShopsInMyCity } from '../src/redux/userSlice'  // ✅ SRC KE ANDAR SE

function useGetShopByCity() {
    const dispatch = useDispatch()
    const { currentCity, userData } = useSelector(state => state.user)

    useEffect(() => {
        if (!userData?._id || !currentCity) return

        const fetchShops = async () => {
            try {
                console.log("🔍 Fetching shops for:", currentCity)
                
                const result = await axios.get(
                    `${serverUrl}/api/shop/get-by-city/${encodeURIComponent(currentCity)}`,
                    { withCredentials: true }
                )
                
                console.log("✅ Shops found:", result.data?.length || 0)
                dispatch(setShopsInMyCity(result.data))
            } catch (error) {
                console.log("❌ Error:", error.response?.data || error.message)
            }
        }
        fetchShops()
    }, [currentCity, userData?._id])
}

export default useGetShopByCity