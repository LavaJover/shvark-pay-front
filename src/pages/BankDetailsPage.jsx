import { useEffect, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { fetchTraderBankDetails } from "../api/banking"
import AddBankDetailsModal from "../components/AddBankDetailsModal"
import { toast } from "react-toastify"
import { useTraderBankDetails } from "../hooks/useTraderBankDetails"

const BankDetailsPage = () => {

    const {traderID} = useAuth()
    const [showModal, setShowModal] = useState(false)

    const {bankDetails, loading, error} = useTraderBankDetails()

    if (loading) return <h1>Загрузка</h1>
    if (error) return <h1>Ошибка</h1>
    console.log(bankDetails)

    return (
        <>
        <h1>Реквизиты</h1>
        <button onClick={() => setShowModal(true)}>Добавить реквизит</button>
        <AddBankDetailsModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSuccess={() => toast.success('Реквизит добавлен')}
        />
        
        </>
    )
}

export default BankDetailsPage