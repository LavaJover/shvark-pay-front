import { useEffect, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { fetchTraderBankDetails } from "../api/banking"
import AddBankDetailsModal from "../components/AddBankDetailsModal"
import { toast } from "react-toastify"
import { useTraderBankDetails } from "../hooks/useTraderBankDetails"
import BankDetailsTable from "../components/BankDetailsTable"

const BankDetailsPage = () => {

    const {traderID} = useAuth()
    const [showModal, setShowModal] = useState(false)

    const {bankDetails, loading, error} = useTraderBankDetails()

    if (loading) return <h1>Загрузка</h1>
    if (error) return <h1>Ошибка</h1>

    const handleOnSuccess = () => {
        toast.success('Реквизит добавлен')
        setShowModal(false)
    }

    return (
        <div className="bank-details-container">
            <h1>Реквизиты</h1>
            <div className="bank-details-header">
                <button onClick={() => setShowModal((val) => !val)}>Добавить реквизит</button>
            </div>
            <AddBankDetailsModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={() => toast.success('Реквизит добавлен')}
            />
            <BankDetailsTable/>
        </div>
    )
}

export default BankDetailsPage