import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { createBankDetail, updateBankDetail } from "../api/banking"

const russianBanks = ['Sberbank', 'Tinkoff', 'Alfabank', 'Gazprom']
const tajikBanks = ['Spitamen', 'Eskhata', 'IBT', 'IMON']

const EditbankDetailsModal = ({isOpen, onClose, onSuccess, detail}) => {

    if (!isOpen) return null

    const {traderID} = useAuth()

    const [form, setForm] = useState({
        id: detail.id,
        trader_id: detail.traderID,
        currency: detail.currency,
        inflow_currency: detail.inflow_currency,
        payment_system: detail.payment_system,
        bank_name: detail.bank_name,
        card_number: detail.card_number,
        phone: detail.phone,
        owner: detail.owner,
        min_amount: detail.min_amount,
        max_amount: detail.max_amount,
        max_amount_day: detail.max_amount_day,
        max_amount_month: detail.max_amount_month,
        max_quantity_day: detail.max_quantity_day,
        max_quantity_month: detail.max_quantity_month,
        max_orders_simultaneosly: detail.max_orders_simultaneosly,
        delay: detail.delay/60000,
        enabled: detail.enabled
    })

    const [bankOptions, setBankOptions] = useState([])

    useEffect(() => {
        switch (form.currency) {
            case 'RUB':
                setBankOptions(russianBanks)
                setForm(prev => ({ ...prev, bank_name: "" }));
                break;
            case 'TJS':
                setBankOptions(tajikBanks)
                setForm(prev => ({ ...prev, bank_name: "" }));
                break;
            default:
                setBankOptions([]);
                setForm(prev => ({ ...prev, bank_name: "" }));
        }
    }, [form.currency])

    const handleOnChange = (e) => {
        const { name, type, value, checked } = e.target;
        setForm({
            ...form,
            [name]: type === 'checkbox' ? checked : value
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        async function sendData() {
            const data = await updateBankDetail(form)
            onSuccess()
            onClose()
        }
        sendData()
    }

    return (
        <div className="bank-modal">
            <div className="bank-modal-header">
            <h2>Редактировать реквизит</h2>
            </div>
            <div className="bank-modal-body">
            <form onSubmit={handleSubmit} className="bank-modal-form">
                <div className="bank-modal-row">
                    <label htmlFor="currency">Валюта</label>
                    <select 
                        name="currency"
                        id="currency"
                        type="text"
                        value={form.currency}
                        onChange={handleOnChange}
                    >
                        <option value={form.currency}>{form.currency}</option>
                        <option value="RUB">RUB</option>
                        <option value="TJS">TJS</option>
                    </select>
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="payment_system">Способ оплаты</label>
                    <select
                        name="payment_system"
                        id="payment_system"
                        type="text"
                        value={form.payment_system}
                        onChange={handleOnChange}
                    >
                        <option value={form.payment_system}>{form.payment_system}</option>
                        <option value="SBP">SBP</option>
                        <option value="C2C">C2C</option>
                    </select>
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="bank_name">Банк</label>
                    <select
                        name="bank_name"
                        id="bank_name"
                        type="text"
                        placeholder="Банк"
                        value={form.bank_name}
                        onChange={handleOnChange}
                        disabled={bankOptions.length === 0}
                    >
                        <option value={form.bank_name}>{form.bank_name}</option>
                        {
                            bankOptions.map((bank) => (
                                <option key={bank} value={bank}>{bank}</option>
                            ))
                        }
                    </select>
                </div>

                {form.payment_system === 'C2C' && (<div className="bank-modal-row">
                    <label htmlFor="card_number">Номер карты</label>
                    <input
                        name="card_number"
                        id="card_number"
                        type="text"
                        value={detail.card_number}
                        onChange={handleOnChange}
                    />
                </div>)}

                {form.payment_system === 'SBP' && (<div className="bank-modal-row">
                    <label>Номер телефона</label>
                    <input
                        name="phone"
                        id="phone"
                        type="text"
                        placeholder="Номер телефона"
                        value={form.phone}
                        onChange={handleOnChange}
                    />
                </div>)}

                <div className="bank-modal-row">
                    <label htmlFor="owner">Имя владельца</label>
                    <input
                        name="owner"
                        id="owner"
                        type="text"
                        value={form.owner}
                        onChange={handleOnChange}
                    />
                </div>
                <h2>Лимиты</h2>
                <div className="bank-modal-row">
                    <label htmlFor="min_amount">Мин сумма сделки</label>
                    <input
                        name="min_amount"
                        id="min_amount"
                        type="number"
                        min={0}
                        max={100000000}
                        value={form.min_amount}
                        onChange={handleOnChange}
                    />
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="max_amount">Макс сумма сделки</label>
                    <input
                        name="max_amount"
                        id="max_amount"
                        type="number"
                        min={0}
                        max={100000000}
                        value={form.max_amount}
                        onChange={handleOnChange}
                    />
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="max_amount_day">Сумма (день)</label>
                    <input
                        name="max_amount_day"
                        id="max_amount_day"
                        type="number"
                        min={0}
                        max={100000000}
                        value={form.max_amount_day}
                        onChange={handleOnChange}
                    />
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="max_amount_month">Сумма (месяц)</label>
                    <input
                        name="max_amount_month"
                        id="max_amount_month"
                        type="number"
                        min={0}
                        max={100000000}
                        value={form.max_amount_month}
                        onChange={handleOnChange}
                    />
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="max_quantity_day">Макс кол-во сделок (день)</label>
                    <input
                        name="max_quantity_day"
                        id="max_quantity_day"
                        type="number"
                        min={0}
                        max={100000000}
                        value={form.max_quantity_day}
                        onChange={handleOnChange}
                    />
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="max_quantity_month">Макс кол-во сделок (месяц)</label>
                    <input
                        name="max_quantity_month"
                        id="max_quantity_month"
                        type="number"
                        min={0}
                        max={100000000}
                        value={form.max_quantity_month}
                        onChange={handleOnChange}
                    />
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="max_orders_simultaneosly">Сделок одновременно</label>
                    <input
                        name="max_orders_simultaneosly"
                        id="max_orders_simultaneosly"
                        type="number"
                        min={0}
                        max={10000}
                        value={form.max_orders_simultaneosly}
                        onChange={handleOnChange}
                    />
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="delay">Задержка между сделками(мин)</label>
                    <input
                        name="delay"
                        id="delay"
                        type="number"
                        min={0}
                        max={100000}
                        value={form.delay}
                        onChange={handleOnChange}
                    />
                </div>

                <div className="bank-modal-row">
                    <label htmlFor="enabled">Активность</label>
                    <input
                        name="enabled"
                        id="enabled"
                        type="checkbox"
                        checked={form.enabled}
                        onChange={handleOnChange}
                    />
                </div>

                <button type="submit">Сохранить</button>
                <button type="button" onClick={onClose}>Выйти</button>
            </form>
            </div>
        </div>
    )
}

export default EditbankDetailsModal