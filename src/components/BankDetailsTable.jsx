import { useState } from "react"
import { useTraderBankDetails } from "../hooks/useTraderBankDetails"
import EditbankDetailsModal from "./EditBankDetailsModal"
import { toast } from "react-toastify"
import { deleteBankDetail } from "../api/banking"

const Requisite = ({bank_name, payment_system, card_number, phone, owner}) => {


    if (card_number) return (
        <div>
            <p>{payment_system}</p>
            <p>{bank_name}</p>
            <p>{card_number}</p>
            <p>{owner}</p>
        </div>
    )

    if (phone) return (
        <div>
            <p>{payment_system}</p>
            <p>{bank_name}</p>
            <p>{phone}</p>
            <p>{owner}</p>
        </div>
    )
}

const SumLimits = ({min_amount, max_amount, currency}) => {
    return (
        <div>
            <p>От {min_amount} {currency}</p>
            <p>До {max_amount} {currency}</p>
        </div>
    )
} 

const VolumeLimits = ({max_amount_day, max_amount_month, currency}) => {
    return (
        <div>
            <p>В день: {max_amount_day} {currency}</p>
            <p>В месяц: {max_amount_month} {currency}</p>
        </div>
    )
}

const QuantityLimits = ({max_quantity_day, max_quantity_month}) => {
    return (
        <div>
            <p>Макс в день: {max_quantity_day}</p>
            <p>Макс в месяц: {max_quantity_month}</p>
        </div>
    )
}

const BankDetailsTable = () => {

    const {bankDetails, loading, error} = useTraderBankDetails()
    const [showModal, setShowModal] = useState(false)
    const [chosenDetail, setChoseonDetail] = useState(null)

    const handleEdit = (detail) => {
        setChoseonDetail(detail)
        setShowModal(true)
    }

    const handleDelete = async (bankDetailID) => {
        const response = await deleteBankDetail({bankDetailID})
    }

    return (
        <>
        <div className="bank-details-table-container">
        <EditbankDetailsModal
            isOpen={showModal}
            onClose={()=>setShowModal(false)}
            onSuccess={()=>{
                toast.success('Изменения сохранены')
                setShowModal(false)
            }}
            detail={chosenDetail}
        />
        <table>
            <thead>
                <tr>
                    <th>Реквизиты</th>
                    <th>Валюта</th>
                    <th>Лимиты по суммам</th>
                    <th>По объёму</th>
                    <th>По количеству</th>
                    <th>Одновременно</th>
                    <th>Статус</th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {bankDetails.map(detail => (
                  <tr key={detail.id}>
                    <td data-label="Реквизиты">
                      <Requisite
                        bank_name={detail.bank_name}
                        card_number={detail.card_number}
                        payment_system={detail.payment_system}
                        phone={detail.phone}
                        owner={detail.owner}
                      />
                    </td>
                    <td data-label="Валюта">{detail.currency}</td>
                    <td data-label="Лимиты по суммам">
                      <SumLimits
                        min_amount={detail.min_amount}
                        max_amount={detail.max_amount}
                        currency={detail.currency}
                      />
                    </td>
                    <td data-label="По объёму">
                      <VolumeLimits
                        max_amount_day={detail.max_amount_day}
                        max_amount_month={detail.max_amount_month}
                        currency={detail.currency}
                      />
                    </td>
                    <td data-label="По количеству">
                      <QuantityLimits
                        max_quantity_day={detail.max_quantity_day}
                        max_quantity_month={detail.max_quantity_month}
                      />
                    </td>
                    <td data-label="Одновременно">
                      {detail.max_orders_simultaneosly}
                    </td>
                    <td data-label="Статус">
                      {detail.enabled ? 'Включен' : 'Выключен'}
                    </td>
                    <td data-label="Редактировать">
                      <button onClick={() => handleEdit(detail)}>Редактировать</button>
                    </td>
                    <td data-label="Удалить">
                      <button onClick={() => handleDelete(detail.id)}>Удалить</button>
                    </td>
                  </tr>
                ))}
            </tbody>
        </table>
        </div>
        </>
    )
}

export default BankDetailsTable