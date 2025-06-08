import api from "../api/axios"
import { useAuth } from "../contexts/AuthContext"
import { useState, useEffect } from "react"

export const useTransactions = () => {
    const {traderID} = useAuth()
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)


useEffect(() => {
    const fetchTransactions = async () => {
        try{
            const response = await api.get(`/wallets/${traderID}/history`)
            setTransactions(response.data.history)
        }catch(err) {
            setError(err)
        }finally {
            setLoading(false)
        }
    }

    fetchTransactions()
}, [traderID])

return {transactions, loading, error}

}