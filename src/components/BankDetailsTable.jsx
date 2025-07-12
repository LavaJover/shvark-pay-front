import { useState, useEffect } from "react"
import { useTraderBankDetails } from "../hooks/useTraderBankDetails"
import EditbankDetailsModal from "./EditBankDetailsModal"
import { toast } from "react-toastify"
import { deleteBankDetail } from "../api/banking"
import { getBankDetailsStats } from "../api/stats" // создадим этот метод
import RequisiteStats from "./RequisiteStats"
import { useAuth } from "../contexts/AuthContext"

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
  const { bankDetails } = useTraderBankDetails()
  const [showModal, setShowModal] = useState(false)
  const [chosenDetail, setChoseonDetail] = useState(null)
  const [stats, setStats] = useState([])

  const {traderID} = useAuth() // или получи откуда у тебя id

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getBankDetailsStats(traderID)
        setStats(res.data.stats)
      } catch (err) {
        console.error("Ошибка при получении статистики реквизитов", err)
      }
    }
    fetchStats()
  }, [traderID])

  const handleEdit = (detail) => {
    setChoseonDetail(detail)
    setShowModal(true)
  }

  const handleDelete = async (bankDetailID) => {
    await deleteBankDetail({ bankDetailID })
  }

  return (
    <>
      <div className="bank-details-table-container">
        <EditbankDetailsModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            toast.success("Изменения сохранены")
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
              <th>Статистика</th>
              <th>Одновременно</th>
              <th>Статус</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bankDetails.map((detail) => {
              const stat = stats.find((s) => s.bank_detail_id === detail.id)
              return (
                <tr key={detail.id}>
                  <td><Requisite {...detail} /></td>
                  <td>{detail.currency}</td>
                  <td><SumLimits {...detail} /></td>
                  <td><VolumeLimits {...detail} /></td>
                  <td><QuantityLimits {...detail} /></td>
                  <td>
                    <RequisiteStats stat={stat} detail={detail} />
                  </td>
                  <td>{detail.max_orders_simultaneosly}</td>
                  <td>{detail.enabled ? "Включен" : "Выключен"}</td>
                  <td><button onClick={() => handleEdit(detail)}>Редактировать</button></td>
                  <td><button onClick={() => handleDelete(detail.id)}>Удалить</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default BankDetailsTable