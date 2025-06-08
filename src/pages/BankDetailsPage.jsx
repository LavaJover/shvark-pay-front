import { useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { fetchTraderBankDetails } from "../api/banking"

const BankDetailsPage = () => {

    const {traderID} = useAuth()

    useEffect(() => {
        async function fetchData() {
            const data = await fetchTraderBankDetails({traderID})
            console.log(data)
        }
        fetchData()
    }, [])

    return (
        <>
        <p>Реквизиты</p>
        </>
    )
}

export default BankDetailsPage