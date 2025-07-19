import { useEffect, useState, useRef } from "react"
import api from "../api/axios"
import { toast } from "react-toastify"
import "./AdminDisputesPage.css"

const statusLabels = {
  DISPUTE_OPENED: "Открыт",
  DISPUTE_ACCEPTED: "Принят",
  DISPUTE_REJECTED: "Отклонён",
  DISPUTE_FREEZED: "Заморожен"
}

const AdminDisputesPage = () => {
  const [disputes, setDisputes] = useState([])
  const [statusFilter, setStatusFilter] = useState("DISPUTE_OPENED")
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, limit: 10 })
  const [loading, setLoading] = useState(false)

  const [traders, setTraders] = useState([])
  const [merchants, setMerchants] = useState([])

  // Новый стейт для таймеров по dispute_id
  const [timers, setTimers] = useState({})

  const findUsername = (id, list) => {
    const user = list.find(u => u.id === id)
    return user ? user.username : id
  }

  const fetchDisputesAndUsers = async () => {
    setLoading(true)
    try {
      const [disputesRes, tradersRes, merchantsRes] = await Promise.all([
        api.get(`/admin/orders/disputes?page=${pagination.page}&limit=${pagination.limit}&status=${statusFilter}`),
        api.get("/admin/traders"),
        api.get("/admin/merchants"),
      ])
      setDisputes(disputesRes.data.disputes || [])
      setPagination(prev => ({
        ...prev,
        totalPages: disputesRes.data.pagination?.total_pages || 1
      }))
      setTraders(tradersRes.data.users || [])
      setMerchants(merchantsRes.data.users || [])

      // Обновляем таймеры сразу после загрузки диспутов
      updateTimers(disputesRes.data.disputes || [])
    } catch (err) {
      toast.error("Ошибка при загрузке данных")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Функция для обновления таймеров в стейте
  const updateTimers = (disputesList) => {
    const now = Date.now()
    const newTimers = {}
    disputesList.forEach(d => {
      if (!d.accept_at) return
      const acceptAtMs = new Date(d.accept_at).getTime()
      const diffMs = acceptAtMs - now
      newTimers[d.dispute_id] = diffMs > 0 ? diffMs : 0
    })
    setTimers(newTimers)
  }

  // Таймер, обновляем таймеры каждую секунду
  useEffect(() => {
    if (disputes.length === 0) return

    const interval = setInterval(() => {
      setTimers((oldTimers) => {
        const now = Date.now()
        const updatedTimers = {}
        for (const d of disputes) {
          if (!d.accept_at) continue
          const acceptAtMs = new Date(d.accept_at).getTime()
          const diff = acceptAtMs - now
          updatedTimers[d.dispute_id] = diff > 0 ? diff : 0
        }
        return updatedTimers
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [disputes])

  useEffect(() => {
    fetchDisputesAndUsers()
  }, [pagination.page, pagination.limit, statusFilter])

  const handleAction = async (action, disputeId) => {
    try {
      await api.post(`/admin/disputes/${action}`, { dispute_id: disputeId })
      toast.success("Действие выполнено")
      fetchDisputesAndUsers()
    } catch (err) {
      toast.error("Ошибка при выполнении действия")
      console.error(err)
    }
  }

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10)
    setPagination({ page: 1, totalPages: pagination.totalPages, limit: newLimit }) // Сброс страницы на 1 при смене лимита
  }

  // Форматируем ms в строку ЧЧ:ММ:СС
  const formatMsToTime = (ms) => {
    if (ms <= 0) return "Истекло"
    let totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    totalSeconds %= 3600
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="admin-disputes-page">
      <h1>Диспуты</h1>

      <div className="filter-row">
        <label>Фильтр по статусу: </label>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {Object.entries(statusLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <label style={{ marginLeft: "20px" }}>Записей на странице: </label>
        <select value={pagination.limit} onChange={handleLimitChange}>
          {[5, 10, 20, 50].map(num => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : disputes.length === 0 ? (
        <p>Нет диспутов</p>
      ) : (
        <div className="disputes-table">
          {disputes.map(d => {
            const bank = d?.order?.bank_detail || {}
            const order = d?.order || {}

            const traderUsername = findUsername(bank.trader_id, traders)

            return (
              <div key={d.dispute_id} className="dispute-card">
                <div className="dispute-section">
                  <h3>Банковские реквизиты</h3>
                  <p><strong>Банк:</strong> {bank.bank_name || "-"} ({bank.payment_system || "-"})</p>
                  <p><strong>Телефон:</strong> {bank.phone || "-"}</p>
                  <p><strong>Владелец:</strong> {bank.owner || "-"}</p>
                  <p><strong>Trader:</strong> {traderUsername}</p>
                </div>

                <div className="dispute-section">
                  <h3>Детали сделки</h3>
                  <p><strong>Order ID:</strong> {order.order_id || "-"}</p>
                  <p><strong>Merchant Order ID:</strong> {order.merchant_order_id || "-"}</p>
                  <p><strong>Сумма (₽):</strong> {order.amount_fiat || "-"}</p>
                  <p><strong>Сумма (крипто):</strong> {order.amount_crypto?.toFixed(6) || "-"}</p>
                  <p><strong>Курс:</strong> {order.crypro_rate || d.dispute_crypto_rate || "-"}</p>
                </div>

                <div className="dispute-section">
                  <h3>Детали диспута</h3>
                  <p><strong>ID диспута:</strong> {d.dispute_id}</p>
                  <p><strong>Причина:</strong> {d.dispute_reason}</p>
                  <p><strong>Статус:</strong> {statusLabels[d.dispute_status] || d.dispute_status}</p>
                  <p><strong>Сумма диспута (₽):</strong> {d.dispute_amount_fiat}</p>
                  <p><strong>Сумма диспута (крипто):</strong> {d.dispute_amount_crypto.toFixed(6)}</p>
                  <p><a href={d.proof_url} target="_blank" rel="noreferrer">Доказательство</a></p>
                  {/* Вот здесь добавляем таймер */}
                  {d.accept_at && (
                    <p><strong>До автопринятия:</strong> {formatMsToTime(timers[d.dispute_id])}</p>
                  )}
                </div>

                <div className="dispute-actions">
                  {(d.dispute_status === "DISPUTE_OPENED" || d.dispute_status === "DISPUTE_FREEZED") && (
                    <>
                      <button onClick={() => handleAction("accept", d.dispute_id)}>Принять</button>
                      <button onClick={() => handleAction("reject", d.dispute_id)}>Отклонить</button>
                    </>
                  )}
                  {d.dispute_status === "DISPUTE_OPENED" && (
                    <button onClick={() => handleAction("freeze", d.dispute_id)}>Заморозить</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="pagination">
        <button
          disabled={pagination.page === 1}
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
        >
          Назад
        </button>
        <span>
          Стр. {pagination.page} / {pagination.totalPages}
        </span>
        <button
          disabled={pagination.page === pagination.totalPages}
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
        >
          Вперёд
        </button>
      </div>
    </div>
  )
}

export default AdminDisputesPage
