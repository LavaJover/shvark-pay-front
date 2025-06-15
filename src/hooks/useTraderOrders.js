import { useEffect, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { fetchTraderOrders } from "../api/orders"

export const useTraderOrders = () => {
    const {traderID} = useAuth()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrders = async () => {
            const data = await fetchTraderOrders({traderID})
            setLoading(false)
            setOrders(data.orders)
        }
        fetchOrders()
    }, [traderID])

    return {orders, loading}
}