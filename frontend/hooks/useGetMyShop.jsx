import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'  // ✅ Ensure this is imported
import axios from 'axios'
import { serverUrl } from '../config'

function useGetMyShop() {
    const [shop, setShop] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    
    // ✅ CORRECT: Hook called inside component/function body
    const { userData } = useSelector(state => state.user)

    useEffect(() => {
        const fetchShop = async () => {
            if (!userData?._id) {
                setLoading(false)
                return
            }

            try {
                const response = await axios.get(
                    `${serverUrl}/api/shop/my-shop`,
                    { withCredentials: true }
                )
                setShop(response.data.shop)
                setError(null)
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch shop')
                setShop(null)
            } finally {
                setLoading(false)
            }
        }

        fetchShop()
    }, [userData?._id])

    return { shop, loading, error }
}

export default useGetMyShop