import { useEffect, useState, useCallback } from "react"
import { fetchTraderBankDetails } from "../api/banking"
import { useAuth } from "../contexts/AuthContext"

export const useTraderBankDetails = () => {
    const { traderID } = useAuth()
    const [bankDetails, setBankDetails] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Функция для загрузки данных
    const fetchData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await fetchTraderBankDetails({ traderID })
            setBankDetails(data.bank_details || [])
        } catch (err) {
            console.error("Ошибка при загрузке реквизитов:", err)
            setError(err)
            setBankDetails([])
        } finally {
            setLoading(false)
        }
    }, [traderID])

    // Загрузка данных при монтировании и при изменении fetchData
    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Возвращаем функцию для повторной загрузки
    return {
        bankDetails,
        loading,
        error,
        refetch: fetchData // Добавляем функцию для ручного обновления
    }
}