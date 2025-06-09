import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { createBankDetail } from "../api/banking"

const AddBankDetailsModal = ({isOpen, onClose, onSuccess}) => {

    const {traderID} = useAuth()

    const [form, setForm] = useState({
        trader_id: traderID,
        currency: '',
        payment_system: '',
        bank_name: '',
        card_number: '',
        phone: '',
        owner: '',
        min_amount: 0,
        max_amount: 0,
        max_amount_day: 0,
        max_amount_month: 0,
        max_orders_simultaneosly: 0,
        delay: "0",
        enabled: false
    })

    const handleOnChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value})
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        async function sendData() {
            const data = await createBankDetail(form)
            onSuccess()
            onClose()
        }
        sendData()
    }

    if (!isOpen) return null

    return (
        <div className="bank-modal">
            <h2>Добавить реквизит</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    name="currency"
                    type="text"
                    placeholder="Валюта"
                    value={form.currency}
                    onChange={handleOnChange}
                />

                <input
                    name="payment_system"
                    type="text"
                    placeholder="Способ оплаты"
                    value={form.payment_system}
                    onChange={handleOnChange}
                />

                <input
                    name="bank_name"
                    type="text"
                    placeholder="Банк"
                    value={form.bank_name}
                    onChange={handleOnChange}
                />

                <input
                    name="card_number"
                    type="text"
                    placeholder="Номер карты"
                    value={form.card_number}
                    onChange={handleOnChange}
                />

                <input
                    name="phone"
                    type="text"
                    placeholder="Номер телефона"
                    value={form.phone}
                    onChange={handleOnChange}
                />

                <button type="submit">Сохранить</button>
            </form>
        </div>
    )
}

export default AddBankDetailsModal