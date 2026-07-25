import axios from 'axios'
import { useEffect } from 'react'
import { serverUrl } from '../src/App'   // ✅ SRC KE ANDAR SE
import { useDispatch, useSelector } from 'react-redux'
import { setItemsInMyCity } from '../src/redux/userSlice'  // ✅ SRC KE ANDAR SE

function useGetItemsByCity() {
    const dispatch = useDispatch()
    const { currentCity, userData } = useSelector(state => state.user)

    useEffect(() => {
        if (!userData?._id || !currentCity) return

        const fetchItems = async () => {
            try {
                console.log("🔍 Fetching items for:", currentCity)
                
                const result = await axios.get(
                    `${serverUrl}/api/item/get-by-city/${encodeURIComponent(currentCity)}`,
                    { withCredentials: true }
                )
                
                console.log("✅ Items found:", result.data?.length || 0)
                dispatch(setItemsInMyCity(result.data))
            } catch (error) {
                console.log("❌ Error:", error.response?.data || error.message)
            }
        }
        fetchItems()
    }, [currentCity, userData?._id])
}

export default useGetItemsByCity