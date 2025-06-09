import { useEffect, useState } from "react"
import { fetchTraderBankDetails } from "../api/banking"
import { useAuth } from "../contexts/AuthContext"


export const useTraderBankDetails = () => {

    const {traderID} = useAuth()
    const [bankDetails, setBankDetails] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchData() {
            const data = await fetchTraderBankDetails({traderID})
            console.log(data)
            setBankDetails(data.bank_details)
            setLoading(false)
        }
        fetchData()
    }, [traderID])


    return {bankDetails, loading, error}
}