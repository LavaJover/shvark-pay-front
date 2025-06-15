import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { createBankDetail } from "../api/banking"

const russianBanks = ['Sberbank', 'Tinkoff', 'Alfabank', 'Gazprom']
const tajikBanks = ['Spitamen', 'Eskhata', 'IBT', 'IMON']
const abkhasianBanks = ['Amra', 'Aurora', 'Bank Abskasia']

const AddBankDetailsModal = ({isOpen, onClose, onSuccess}) => {

    const {traderID} = useAuth()

    const [form, setForm] = useState({
        trader_id: traderID,
        currency: '',
        inflow_currency: '',
        payment_system: '',
        bank_name: '',
        card_number: '',
        phone: '',
        owner: '',
        min_amount: 0,
        max_amount: 0,
        max_amount_day: 0,
        max_amount_month: 0,
        max_quantity_day: 0,
        max_quantity_month: 0,
        max_orders_simultaneosly: 0,
        delay: 0,
        enabled: false
    })

    const [bankOptions, setBankOptions] = useState([])
    const [paymentSystemOptions, setPaymentSystemOptions] = useState([])
    const [inflowCurrencyVisible, setInflowCurrencyVisible] = useState(false)

    useEffect(() => {
        switch (form.currency) {
            case 'RUB':
                setPaymentSystemOptions([
                    {
                        value: "SBP_RUS",
                        name: "СБП"
                    },
                    {
                        value: "C2C_RUS",
                        name: "Перевод на карту"
                    },
                    {
                        value: "TRANSGRAN",
                        name: "Трансграничный перевод"
                    }
                ])
                // setForm(prev => ({ ...prev, bank_name: "" }));
                setForm(prev => ({...prev, payment_system: ""}))
                break;
            case 'TJS':
                setPaymentSystemOptions([
                    {
                        value: "C2C_TJK",
                        name: "Перевод на карту"
                    },
                    {
                        value: "ACCOUNT_NUMBER_TJK",
                        name: "По номеру счёта"
                    }
                ])
                // setBankOptions(tajikBanks)
                // setForm(prev => ({ ...prev, bank_name: "" }));
                setForm(prev => ({...prev, payment_system: ""}))
                break;
            default:
                setPaymentSystemOptions([])
                setForm(prev => ({...prev, payment_system: ""}))
                // setBankOptions([])
                // setForm(prev => ({ ...prev, bank_name: "" }));
                break
        }
        console.log(paymentSystemOptions)
    }, [form.currency])

    useEffect(() => {
        switch (form.payment_system) {
            case 'TRANSGRAN':
                setInflowCurrencyVisible(true)
                setForm(prev => ({...prev, inflow_currency: ""}))
                break
            case 'C2C_RUS':
                setForm(prev => ({...prev, inflow_currency: 'RUB'}))
                setInflowCurrencyVisible(false)
                break
            case 'SBP_RUS':
                setForm(prev => ({...prev, inflow_currency: 'RUB'}))
                setInflowCurrencyVisible(false)
                break
            case 'C2C_TJK':
                setForm(prev => ({...prev, inflow_currency: 'TJK'}))
                setInflowCurrencyVisible(false)
                break
            default:
                setForm(prev => ({...prev, inflow_currency: ''}))
                setInflowCurrencyVisible(false)
                break
        }
    }, [form.payment_system])

    useEffect(() => {
        switch (form.inflow_currency) {
            case 'RUB':
                if (form.payment_system == 'TRANSGRAN'){
                    setBankOptions(abkhasianBanks)
                }else{
                    setBankOptions(russianBanks)
                }
                setForm(prev => ({...prev, bank_name: ""}))
                break
            case 'TJS':
                setBankOptions(tajikBanks)
                setForm(prev => ({...prev, bank_name: ""}))
                break
            default:
                setBankOptions([])
                setForm(prev => ({...prev, bank_name:""}))
                break
        }
    }, [form.inflow_currency])

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
            const data = await createBankDetail(form)
            onSuccess()
            onClose()
        }
        sendData()
    }

    if (!isOpen) return null

    return (
        <div className="bank-modal">
            <div className="bank-modal-header">
            <h2>Добавить реквизит</h2>
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
                        <option value="">Выберите валюту</option>
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
                        disabled={form.currency == ""}
                    >
                        <option value="">Выберите способ оплаты</option>
                        {
                            paymentSystemOptions.map((paymentSystem) => (
                                <option 
                                    key={paymentSystem.value}
                                    value={paymentSystem.value}
                                >
                                    {paymentSystem.name}
                                </option>
                            ))
                        }
                    </select>
                </div>

                {inflowCurrencyVisible && <div className="bank-modal-row">
                    <label htmlFor="inflow_currency">Валюта поступления</label>
                    <select
                        name="inflow_currency"
                        id="inflow_currency"
                        type="text"
                        value={form.inflow_currency}
                        onChange={handleOnChange}
                        
                    >
                        <option value="">Выберите валюту</option>
                        <option value="RUB">RUB</option>
                        <option value="TJS">TJS</option>
                    </select>
                </div>}

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
                        <option value="">Выберите банк</option>
                        {
                            bankOptions.map((bank) => (
                                <option key={bank} value={bank}>{bank}</option>
                            ))
                        }
                    </select>
                </div>

                {(form.payment_system === 'C2C_RUS') && <div className="bank-modal-row">
                    <label htmlFor="card_number">Номер карты</label>
                    <input
                        name="card_number"
                        id="card_number"
                        type="text"
                        placeholder="Номер карты"
                        value={form.card_number}
                        onChange={handleOnChange}
                    />
                </div>}

                { (form.payment_system === 'SBP_RUS' || form.payment_system === 'SBP_TJK' || form.payment_system === 'TRANSGRAN' && form.currency === 'RUB' && form.inflow_currency === 'TJS') 
                && <div className="bank-modal-row">
                    <label>Номер телефона</label>
                    <input
                        name="phone"
                        id="phone"
                        type="text"
                        placeholder="Номер телефона"
                        value={form.phone}
                        onChange={handleOnChange}
                    />
                </div>}

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

export default AddBankDetailsModal