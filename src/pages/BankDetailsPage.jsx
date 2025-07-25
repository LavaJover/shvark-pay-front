import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import AddBankDetailsModal from "../components/AddBankDetailsModal"
import { toast } from "react-toastify"
import { useTraderBankDetails } from "../hooks/useTraderBankDetails"
import BankDetailsTable from "../components/BankDetailsTable"
import './BankDetailsPage.css'

const BankDetailsPage = () => {
    const { traderID } = useAuth()
    const [showModal, setShowModal] = useState(false)
    
    // Используем обновленный хук с функцией refetch
    const { bankDetails, loading, error, refetch } = useTraderBankDetails()

    const handleAddSuccess = () => {
        refetch() // Вызываем повторную загрузку данных
        toast.success('Реквизит успешно добавлен')
        setShowModal(false)
    }

    if (loading) return <div className="loading-container"><h1>Загрузка реквизитов...</h1></div>
    if (error) return <div className="error-container"><h1>Ошибка загрузки данных</h1><p>{error.message}</p></div>

    return (
        <div className="bank-details-container">
            <div className="page-header">
                <h1>Банковские реквизиты</h1>
                <button 
                    className="add-requisite-btn"
                    onClick={() => setShowModal(true)}
                >
                    + Добавить реквизит
                </button>
            </div>
            
            <BankDetailsTable 
                bankDetails={bankDetails} 
                refetch={refetch} // Передаем функцию для обновления данных
            />
            
            <AddBankDetailsModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={handleAddSuccess} // Передаем функцию для обработки успеха
            />
        </div>
    )
}

export default BankDetailsPage