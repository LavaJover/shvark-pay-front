import { useEffect, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { fetchTraderWalletHistory } from "../api/wallet"
import TransactionsTable from "../components/TransactionsTable"


const HistoryPage = () => {

    const {traderID} = useAuth()
    const [history, setHistory] = useState(null)
    console.log(history)

    useEffect(() => {
        async function fetchData() {
            const data = await fetchTraderWalletHistory({traderID})
            console.log(data)
            setHistory(data.history)
        }
        fetchData()
    }, [])

    return (
        <>
        <h1>Транзакции</h1>
        <TransactionsTable/>
        </>
    )
}

export default HistoryPage